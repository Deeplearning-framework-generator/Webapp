import { useEffect, useState } from "react";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useSelectData } from "../hooks/select";
import {isEmptyString} from "../hooks/isEmptyString"
import { SelectField, TextField } from "../components/Field";
import { ModuleEditor } from "../components/ModuleEditor";
import { useCodeSpec } from "../hooks/useCodeSpec";
import { lockExtension } from "../hooks/spec";
const INITIAL_CODE = `class Module(nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, x):
        return x
`;
const transparentBg = EditorView.theme({
  "&": { backgroundColor: "transparent" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "rgba(127,127,127,0.08)",
  },
});

const extensions = [python(), transparentBg, lockExtension];

function useIsDark() {
  const get = () => document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(get);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(get()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return dark;
}
export default function CreateBlock() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [registryName, setRegistryName] = useState("module");
  const isDark = useIsDark();
  const { spec, onCreateEditor, onUpdate, setName, setBase, setParams } =
    useCodeSpec();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [validating, setValidating] = useState(false);
  const [validateError, setValidateError] = useState("");
  const handleValidate = async () => {
    setValidating(true);
    setValidateError("");
    try {
      const res = await fetch("/api/v1/blocks/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registry_name: registryName,
          file_name: isEmptyString(registryName) ? `unregistered.py` : `${registryName}.py`,
          code: code,
          name: spec.name,
          base: spec.base,
          params: spec.params,
        }),
      });
      if (!res.ok) throw new Error(`Server said ${res.status}`);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setValidating(false);
    }

  }
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/v1/blocks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registry_name: registryName,
          file_name: isEmptyString(registryName) ? `unregistered.py` : `${registryName}.py`,
          code: code,
          name: spec.name,
          base: spec.base,
          params: spec.params,
        }),
      });
      if (!res.ok) throw new Error(`Server said ${res.status}`);
      // success: navigate away or show a toast here
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-end gap-3">
        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        <button
          onClick={handleValidate}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {validating ? "Validating..." : "Validate"}
        </button>

        <button
          onClick={handleSave}
          // disabled={!canSave}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save block"}
        </button>

        
      </div>
      <div className="grid grid-rows-1 grid-cols-5 gap-4">
        <div className="col-span-3">
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="border-b border-line bg-surface-soft px-4 py-2 font-mono text-xs text-muted">
              {registryName || "unregistered"}.py
            </div>
            <CodeMirror
              value={code}
              onChange={setCode}
              onCreateEditor={onCreateEditor}
              onUpdate={onUpdate}
              theme={isDark ? "dark" : "light"}
              extensions={extensions}
              height="320px"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
              }}
            />
          </div>
        </div>
        <div className="col-span-2">
          <div className="rounded-xl border border-line bg-surface p-4">
            <ModuleEditor
              spec={spec}
              setName={setName}
              setBase={setBase}
              registryName={registryName}
              setRegistryName={setRegistryName}
              setParams={setParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
