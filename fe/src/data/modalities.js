
const labelField = (labels) => ({
  name: "label",
  type: "int64",
  shape: `[] values 0 to ${labels.length - 1}`,
});

// Only add a label output when the folders actually gave us labels.
const withLabel = (fields, ctx) =>
  ctx.labels.length > 0 ? [...fields, labelField(ctx.labels)] : fields;

export const MODALITIES = {
  image: {
    label: "Image",
    extensions: ["jpg", "jpeg", "png", "webp", "bmp", "gif"],
    params: [
      { key: "imageSize", label: "Image size", type: "number", default: 32 },
      { key: "channels", label: "Channels", type: "select", options: ["RGB", "Grayscale"], default: "RGB" },
    ],
    fields: (p, ctx) =>
      withLabel(
        [
          {
            name: "image",
            type: "float32",
            shape: `[${p.channels === "Grayscale" ? 1 : 3}, ${p.imageSize}, ${p.imageSize}]`,
          },
        ],
        ctx,
      ),
  },

  audio: {
    label: "Audio",
    extensions: ["wav", "mp3", "flac", "ogg", "m4a"],
    params: [
      { key: "sampleRate", label: "Sample rate (Hz)", type: "number", default: 16000 },
      { key: "clipSeconds", label: "Clip length (s)", type: "number", default: 1 },
    ],
    fields: (p, ctx) =>
      withLabel(
        [
          { name: "waveform", type: "float32", shape: `[1, ${p.sampleRate * p.clipSeconds}]` },
          { name: "sample_rate", type: "int64", shape: "[]" },
        ],
        ctx,
      ),
  },

  video: {
    label: "Video",
    extensions: ["mp4", "webm", "mov", "avi", "mkv"],
    params: [
      { key: "numFrames", label: "Frames per clip", type: "number", default: 16 },
      { key: "frameSize", label: "Frame size", type: "number", default: 112 },
    ],
    fields: (p, ctx) =>
      withLabel(
        [{ name: "frames", type: "float32", shape: `[${p.numFrames}, 3, ${p.frameSize}, ${p.frameSize}]` }],
        ctx,
      ),
  },

  tabular: {
    label: "Table",
    extensions: ["csv", "tsv"],
    params: [{ key: "targetColumn", label: "Target column", type: "column", default: "" }],
    fields: (p, ctx) => {
      const featureCount = ctx.columns.filter((c) => c !== p.targetColumn).length;
      const fields = [{ name: "features", type: "float32", shape: `[${featureCount}]` }];
      return p.targetColumn
        ? [...fields, { name: "target", type: "from column", shape: "[]" }]
        : fields;
    },
  },
};

export function getExtension(fileName) {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

/** "image" | "audio" | "video" | "tabular", or null for files we don't support. */
export function modalityOf(file) {
  const ext = getExtension(file.name);
  return Object.keys(MODALITIES).find((m) => MODALITIES[m].extensions.includes(ext)) ?? null;
}

/** { imageSize: 32, channels: "RGB" } etc. for a modality. */
export function defaultParams(modality) {
  return Object.fromEntries(MODALITIES[modality].params.map((p) => [p.key, p.default]));
}
