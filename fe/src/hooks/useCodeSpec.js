import { useCallback, useRef, useState } from "react";
import { parseSpec, applyName, applyBase, applyParams } from "./spec";

export function useCodeSpec() {
  const viewRef = useRef(null);
  const [spec, setSpec] = useState(null);

  // @uiw/react-codemirror calls this once, with the real EditorView
  const onCreateEditor = useCallback((view) => {
    viewRef.current = view;
    setSpec(parseSpec(view.state));
  }, []);

  const onUpdate = useCallback((vu) => {
    if (!vu.docChanged) return;
    const next = parseSpec(vu.state);
    if (next) setSpec(next); 
  }, []);

  const run = (apply) => (arg) => {
    const v = viewRef.current;
    const s = v && parseSpec(v.state);
    if (v && s) apply(v, s, arg);
  };

  return {
    spec,
    onCreateEditor,
    onUpdate,
    setName: run(applyName),
    setBase: run(applyBase),
    setParams: run(applyParams),
  };
}