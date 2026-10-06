import { useEffect, useState } from "react";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
const INITIAL_CODE = `import torch.nn as nn

class Module(nn.Module):
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
  const [blockName, setBlockName] = useState("Module");
  const [registryName, setRegistryName] = useState("module");
  const [type, setType] = useState("");
  
  const isDark = useIsDark();
  return (
    <main className="grid grid-rows-1 grid-cols-5 gap-4">
      <div className="col-span-3">
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="border-b border-line bg-surface-soft px-4 py-2 font-mono text-xs text-muted">
            conv_block.py
          </div>
          <CodeMirror
            value={code}
            onChange={(value) => setCode(value)}
            theme={isDark ? "dark" : "light"}
            extensions={[python(), transparentBg]}
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
          <form
            className="grid grid-cols-2 gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="block-name" className="text-xs text-muted">
                Block Name
              </label>
              <input
                id="block-name"
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                className="rounded-md border border-line bg-surface-soft px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="registry-name" className="text-xs text-muted">
                Registry Name
              </label>
              <input
                id="registry-name"
                type="text"
                value={registryName}
                onChange={(e) => setRegistryName(e.target.value)}
                className="rounded-md border border-line bg-surface-soft px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="type" className="text-xs text-muted">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-md border border-line bg-surface-soft px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {type.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
