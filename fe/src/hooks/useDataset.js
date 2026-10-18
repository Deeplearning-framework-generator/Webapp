// file handling

import { useEffect, useMemo, useState } from "react";
import { modalityOf } from "../data/modalities";

const SAMPLE_COUNT = 8;
const EMPTY_TABLE = { columns: [], rows: [] };

// Folder names that mean "this is a split", mapped to the name we use.
const SPLIT_NAMES = { train: "train", val: "val", valid: "val", validation: "val", test: "test" };


export function useDataset(files) {
  const modality = useMemo(() => mostCommonModality(files), [files]);
  const usable = useMemo(
    () => files.filter((f) => modalityOf(f) === modality),
    [files, modality],
  );
  const labels = useMemo(
    () => (modality === "tabular" ? [] : uniqueSorted(usable.map(labelOf))),
    [usable, modality],
  );
  const presetSplits = useMemo(() => countSplits(usable), [usable]);
  const rootFolder = files[0]?.webkitRelativePath.split("/")[0] || null;

  // A few random files to preview. "seed" changes when the user asks for other samples.
  const [seed, setSeed] = useState(0);
  const [samples, setSamples] = useState([]);
  useEffect(() => {
    if (modality === null || modality === "tabular") {
      setSamples([]);
      return;
    }
    const picked = pickRandom(usable, SAMPLE_COUNT).map((file) => ({
      file,
      label: labelOf(file),
      url: URL.createObjectURL(file),
    }));
    setSamples(picked);
    // Free the preview URLs when the samples change or the page closes.
    return () => picked.forEach((s) => URL.revokeObjectURL(s.url));
  }, [usable, modality, seed]);

  // For CSV: header and first rows of the first file.
  const [table, setTable] = useState(EMPTY_TABLE);
  useEffect(() => {
    if (modality !== "tabular") return;
    let cancelled = false;
    readCsvPreview(usable[0]).then((t) => {
      if (!cancelled) setTable(t);
    });
    return () => {
      cancelled = true;
    };
  }, [usable, modality]);

  return {
    modality,
    usable,
    ignoredCount: files.length - usable.length,
    labels,
    presetSplits,
    rootFolder,
    samples,
    reshuffle: () => setSeed((s) => s + 1),
    table: modality === "tabular" ? table : EMPTY_TABLE,
  };
}

function mostCommonModality(files) {
  const counts = {};
  for (const f of files) {
    const m = modalityOf(f);
    if (m) counts[m] = (counts[m] ?? 0) + 1;
  }
  let best = null;
  for (const m in counts) {
    if (best === null || counts[m] > counts[best]) best = m;
  }
  return best;
}

// Folder names between the picked folder and the file, e.g. ["my-data", "train", "cat"].
// Files picked without "Browse folder" have no path, so this is [].
function folderParts(file) {
  return (file.webkitRelativePath || "").split("/").slice(0, -1);
}

function splitOf(file) {
  for (const part of folderParts(file)) {
    const split = SPLIT_NAMES[part.toLowerCase()];
    if (split) return split;
  }
  return null;
}

// The folder the file sits in is its label, unless that folder is the picked
// folder itself or a split folder like "train".
function labelOf(file) {
  const parts = folderParts(file);
  if (parts.length < 2) return null;
  const parent = parts[parts.length - 1];
  return SPLIT_NAMES[parent.toLowerCase()] ? null : parent;
}

function countSplits(files) {
  const counts = {};
  for (const f of files) {
    const split = splitOf(f);
    if (split) counts[split] = (counts[split] ?? 0) + 1;
  }
  return Object.keys(counts).length > 0 ? counts : null;
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

// Shuffles only the first n spots, so it stays fast with 50,000 files.
function pickRandom(items, n) {
  const copy = [...items];
  const count = Math.min(n, copy.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// Reads only the first 20 KB, so big CSVs don't freeze the page.
async function readCsvPreview(file, maxRows = 8) {
  const text = await file.slice(0, 20000).text();
  const sep = file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
  const [header = "", ...rest] = text.split(/\r?\n/).filter(Boolean);
  return {
    columns: header.split(sep).map((c) => c.trim()),
    rows: rest.slice(0, maxRows).map((line) => line.split(sep)),
  };
}
