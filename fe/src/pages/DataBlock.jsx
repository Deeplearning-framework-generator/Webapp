import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Field, controlClass } from "../components/Field";
import { MODALITIES, defaultParams } from "../data/modalities";
import { useDataset } from "../hooks/useDataset";

const SPLIT_KEYS = ["train", "val", "test"];
const DEFAULT_SPLITS = { train: 80, val: 10, test: 10 };

const primaryButton =
  "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50";
const secondaryButton =
  "rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:bg-hover";

export default function DataBlock() {
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [splits, setSplits] = useState(DEFAULT_SPLITS);
  // Kept per modality, so switching data and back keeps your edits.
  const [paramsByModality, setParamsByModality] = useState({});
  const [showChecks, setShowChecks] = useState(false);

  const dataset = useDataset(files);
  const { modality, usable, labels, presetSplits } = dataset;
  const config = modality ? MODALITIES[modality] : null;

  const params = modality ? { ...defaultParams(modality), ...paramsByModality[modality] } : {};
  const setParam = (key, value) =>
    setParamsByModality((prev) => ({ ...prev, [modality]: { ...prev[modality], [key]: value } }));

  const fields = config ? config.fields(params, { labels, columns: dataset.table.columns }) : [];
  const { errors, warnings } = check({ name, dataset, splits, params });

  const handleSave = () => {
    const block = {
      name: name.trim(),
      modality,
      fileCount: usable.length,
      labels,
      splits: presetSplits ?? Object.fromEntries(SPLIT_KEYS.map((k) => [k, Number(splits[k]) || 0])),
      params,
      fields,
    };
    // TODO: send to the backend once the upload API exists
    
    console.log("Data block to save:", block);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-2">
          <input
            aria-label="Block name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your data block"
            className="bg-transparent text-[26px] font-semibold outline-none placeholder:text-muted"
          />
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded bg-active px-2 py-0.5 font-medium text-active-ink">Data</span>
            {config && (
              <span className="rounded border border-line bg-surface-soft px-2 py-0.5">
                {config.label}
              </span>
            )}
            {labels.length > 0 && <span className="text-muted">{labels.length} classes</span>}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowChecks(true)} className={secondaryButton}>
            Validate
          </button>
          <button onClick={handleSave} disabled={errors.length > 0} className={primaryButton}>
            Save block
          </button>
        </div>
      </div>

      {showChecks && <Checks errors={errors} warnings={warnings} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <UploadPanel files={files} dataset={dataset} config={config} onPick={setFiles} />
          <SamplePreview dataset={dataset} />
          <FieldsTable fields={fields} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <SplitsCard
            total={usable.length}
            splits={splits}
            setSplits={setSplits}
            presetSplits={presetSplits}
          />
          <ParamsCard
            config={config}
            params={params}
            setParam={setParam}
            columns={dataset.table.columns}
          />
          <CanvasNode name={name} fields={fields} />
        </div>
      </div>
    </div>
  );
}

/* ---------- checks ---------- */

const sumSplits = (splits) => SPLIT_KEYS.reduce((sum, k) => sum + (Number(splits[k]) || 0), 0);

// errors block saving, warnings don't
function check({ name, dataset, splits, params }) {
  const { modality, usable, labels, presetSplits, ignoredCount } = dataset;
  const errors = [];
  const warnings = [];

  if (!name.trim()) errors.push("Give the block a name.");
  if (usable.length === 0) errors.push("Upload some image, audio, video or CSV files.");
  if (modality === "tabular" && !params.targetColumn) errors.push("Pick a target column.");
  if (!presetSplits && sumSplits(splits) !== 100) {
    errors.push(`Splits add up to ${sumSplits(splits)}%, they should add up to 100%.`);
  }

  if (modality && modality !== "tabular" && labels.length === 0) {
    warnings.push("No labels found. Put files in one folder per label, like cat/001.jpg.");
  }
  if (modality && ignoredCount > 0) {
    warnings.push(
      `${ignoredCount} file(s) aren't ${MODALITIES[modality].label.toLowerCase()} files and will be ignored.`,
    );
  }
  return { errors, warnings };
}

function Checks({ errors, warnings }) {
  if (errors.length === 0 && warnings.length === 0) {
    return <p className="mb-4 text-sm text-ok">Everything looks good. You can save this block.</p>;
  }
  return (
    <ul className="mb-4 flex flex-col gap-1 rounded-xl border border-line bg-surface p-4 text-sm">
      {errors.map((e) => (
        <li key={e} className="text-red-500">✕ {e}</li>
      ))}
      {warnings.map((w) => (
        <li key={w} className="text-amber-600">! {w}</li>
      ))}
    </ul>
  );
}

/* ---------- layout pieces ---------- */

function Card({ title, action, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function UploadPanel({ files, dataset, config, onPick }) {
  const fileInput = useRef(null);
  const folderInput = useRef(null);
  const [dragging, setDragging] = useState(false);
  const { usable, labels, ignoredCount, rootFolder } = dataset;

  const handlePick = (e) => {
    onPick(Array.from(e.target.files));
    e.target.value = ""; // lets you pick the same folder again
  };

  // Note: dropping a whole folder isn't read yet; use "Browse folder" for that.
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onPick(Array.from(e.dataTransfer.files));
  };

  return (
    <Card title="Upload data">
      <input ref={fileInput} type="file" multiple hidden onChange={handlePick} />
      <input ref={folderInput} type="file" webkitdirectory="" hidden onChange={handlePick} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 text-center ${
          dragging ? "border-accent bg-active" : "border-line"
        }`}
      >
        <Upload className="size-6 text-muted" />

        {files.length === 0 ? (
          <p className="text-sm text-muted">Drag files here, or pick files or a whole folder.</p>
        ) : (
          <p className="text-sm">
            <span className="font-semibold">{usable.length.toLocaleString()}</span>{" "}
            {config ? `${config.label.toLowerCase()} files` : "usable files"}
            {rootFolder && (
              <> from <span className="font-mono">{rootFolder}/</span></>
            )}
            {labels.length > 0 && <> · {labels.length} labels</>}
            {ignoredCount > 0 && <span className="text-muted"> · {ignoredCount} ignored</span>}
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={() => fileInput.current.click()} className={secondaryButton}>
            Browse files
          </button>
          <button onClick={() => folderInput.current.click()} className={secondaryButton}>
            Browse folder
          </button>
          {files.length > 0 && (
            <button onClick={() => onPick([])} className={secondaryButton}>
              Clear
            </button>
          )}
        </div>

        <p className="text-xs text-muted">
          Tip: one folder per label (cat/, dog/), optionally inside train/ val/ test/.
        </p>
      </div>
    </Card>
  );
}

/* ---------- sample preview ---------- */

function ImagePreview({ url }) {
  return <img src={url} alt="" className="aspect-square w-full rounded-md bg-surface-soft object-cover" />;
}

function AudioPreview({ url }) {
  return <audio src={url} controls preload="metadata" className="w-full" />;
}

function VideoPreview({ url }) {
  return (
    <video
      src={url}
      controls
      muted
      preload="metadata"
      className="aspect-square w-full rounded-md bg-black object-cover"
    />
  );
}

const PREVIEWS = { image: ImagePreview, audio: AudioPreview, video: VideoPreview };

function TablePreview({ table }) {
  if (table.columns.length === 0) return <p className="text-sm text-muted">Reading file...</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono text-xs">
        <thead className="text-muted">
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className="px-2 py-1 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-t border-line">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SamplePreview({ dataset }) {
  const { modality, samples, table, reshuffle } = dataset;

  if (!modality) {
    return (
      <Card title="Sample preview">
        <p className="text-sm text-muted">Upload data to see samples here.</p>
      </Card>
    );
  }

  if (modality === "tabular") {
    return (
      <Card title="Sample preview">
        <TablePreview table={table} />
      </Card>
    );
  }

  const Preview = PREVIEWS[modality];
  return (
    <Card
      title="Sample preview"
      action={
        <button onClick={reshuffle} className={secondaryButton}>
          Show other samples
        </button>
      }
    >
      <div
        className={`grid gap-3 ${
          modality === "audio" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        {samples.map((s) => (
          <figure key={s.url} className="flex flex-col gap-1">
            <Preview url={s.url} />
            <figcaption className="truncate font-mono text-xs text-muted">
              {s.label ?? s.file.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </Card>
  );
}

/* ---------- fields, splits, params, canvas ---------- */

function FieldsTable({ fields }) {
  return (
    <Card
      title="Fields"
      action={<span className="text-xs text-muted">Each field becomes an output on the card</span>}
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted">Fields appear once data is uploaded.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2 font-medium">Field</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Shape</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {fields.map((f) => (
              <tr key={f.name} className="border-t border-line">
                <td className="py-2">{f.name}</td>
                <td className="py-2">{f.type}</td>
                <td className="py-2">{f.shape}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function SplitsCard({ total, splits, setSplits, presetSplits }) {
  // Splits found in the folders can't be edited, they're just shown.
  if (presetSplits) {
    return (
      <Card title="Splits">
        <div className="grid grid-cols-3 gap-2">
          {SPLIT_KEYS.filter((k) => k in presetSplits).map((k) => (
            <div key={k} className="rounded-md border border-line p-3">
              <p className="text-xs text-muted">{k}</p>
              <p className="font-mono text-xl">{presetSplits[k].toLocaleString()}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Taken from your train / val / test folders.</p>
      </Card>
    );
  }

  const sum = sumSplits(splits);
  return (
    <Card title="Splits">
      <div className="grid grid-cols-3 gap-2">
        {SPLIT_KEYS.map((k) => (
          <Field key={k} id={`split-${k}`} label={`${k} %`}>
            <input
              id={`split-${k}`}
              type="number"
              min="0"
              max="100"
              value={splits[k]}
              onChange={(e) => setSplits({ ...splits, [k]: e.target.value })}
              className={controlClass}
            />
            <span className="font-mono text-xs text-muted">
              {Math.round((total * (Number(splits[k]) || 0)) / 100).toLocaleString()} files
            </span>
          </Field>
        ))}
      </div>
      {sum !== 100 && (
        <p className="mt-2 text-xs text-red-500">Adds up to {sum}%, should be 100%.</p>
      )}
    </Card>
  );
}

function ParamsCard({ config, params, setParam, columns }) {
  return (
    <Card title="Block parameters">
      {!config ? (
        <p className="text-sm text-muted">Parameters appear once data is uploaded.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {config.params.map((p) => (
            <Field key={p.key} id={`param-${p.key}`} label={p.label}>
              {p.type === "number" ? (
                <input
                  id={`param-${p.key}`}
                  type="number"
                  value={params[p.key]}
                  onChange={(e) =>
                    setParam(p.key, e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={controlClass}
                />
              ) : (
                <select
                  id={`param-${p.key}`}
                  value={params[p.key]}
                  onChange={(e) => setParam(p.key, e.target.value)}
                  className={controlClass}
                >
                  {p.type === "column" && <option value="">Pick a column</option>}
                  {(p.type === "column" ? columns : p.options).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              )}
            </Field>
          ))}
        </div>
      )}
    </Card>
  );
}

function CanvasNode({ name, fields }) {
  return (
    <Card title="How it looks on the canvas">
      <div
        className="flex justify-center rounded-lg border border-line py-8"
        style={{
          backgroundImage: "radial-gradient(var(--line) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="w-52 rounded-lg border border-line bg-surface shadow-sm">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <span className="size-2 rounded-full bg-accent" />
            <span className="truncate text-sm font-semibold">{name || "Untitled"}</span>
            <span className="ml-auto rounded bg-active px-1.5 py-0.5 text-[10px] font-medium uppercase text-active-ink">
              Data
            </span>
          </div>
          <div className="flex flex-col gap-1.5 py-2">
            {fields.length === 0 ? (
              <p className="px-3 text-xs text-muted">No outputs yet</p>
            ) : (
              fields.map((f) => (
                <div key={f.name} className="flex items-center justify-end gap-2 font-mono text-xs text-muted">
                  {f.name}
                  <span className="-mr-1.5 size-3 rounded-full border-2 border-accent bg-surface" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
