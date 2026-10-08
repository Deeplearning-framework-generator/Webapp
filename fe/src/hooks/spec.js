import { syntaxTree } from "@codemirror/language";
import { Annotation, EditorState, StateField } from "@codemirror/state"; // NEW
import { Decoration, EditorView } from "@codemirror/view"; // NEW

export const fromForm = Annotation.define();

// code -> spec
export function parseSpec(state) {
  let spec = null;
  const doc = state.doc;
  const locked = []; // NEW: [from, to] pairs the user may not edit by typing

  syntaxTree(state).iterate({
    enter(node) {
      if (node.name === "ClassDefinition" && !spec) {
        const id = node.node.getChild("VariableName");
        if (!id) return;
        const al = node.node.getChild("ArgList");
        spec = {
          name: doc.sliceString(id.from, id.to),
          nameRange: [id.from, id.to],
          base: al ? doc.sliceString(al.from + 1, al.to - 1).trim() : "",
          baseRange: al ? [al.from + 1, al.to - 1] : null,
          params: [],
          paramsRange: [0, 0],
          locked, // NEW
        };
        locked.push([node.from, id.from]); // NEW: "class "
        locked.push([id.to, doc.lineAt(id.to).to]); // NEW: "(nn.Module):"
      }

      if (node.name === "FunctionDefinition" && spec) {
        const fnName = node.node.getChild("VariableName");
        const pl = node.node.getChild("ParamList");
        if (!fnName || !pl) return;
        const name = doc.sliceString(fnName.from, fnName.to);
        if (name !== "__init__" && name !== "forward") return;

        // NEW: lock "def __init__(" and "):" (same for forward)
        locked.push([node.from, pl.from + 1]);
        locked.push([pl.to - 1, doc.lineAt(pl.to).to]);

        if (name === "__init__") {
          const inner = [pl.from + 1, pl.to - 1];
          spec.paramsRange = inner;
          spec.params = doc
            .sliceString(...inner)
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s !== "self")
            .map((s) => {
              const m = s.match(/^(\w+)\s*(?::\s*([\w.[\]]+))?\s*(?:=\s*(.+))?$/);
              return { name: m?.[1] ?? s, type: m?.[2] ?? "", default: m?.[3] ?? "" };
            });
        }
      }
    },
  });

  // NEW: the super() line is a plain statement, so find it by line
  if (spec) {
    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i);
      if (/^\s*super\(\)\.__init__\(\)\s*$/.test(line.text)) {
        locked.push([line.from, line.to]);
      }
    }
    // NEW: drop empty ranges and sort, since CodeMirror wants them ordered
    spec.locked = locked.filter(([f, t]) => f < t).sort((a, b) => a[0] - b[0]);
  }

  return spec;
}

// spec -> code
export function applyName(view, spec, newName) {
  view.dispatch({
    changes: { from: spec.nameRange[0], to: spec.nameRange[1], insert: newName },
    annotations: fromForm.of(true),
  });
}

export function applyParams(view, spec, params) {
  const text =
    "self" +
    params
      .map((p) => `, ${p.name}${p.type ? `: ${p.type}` : ""}${p.default ? ` = ${p.default}` : ""}`)
      .join("");
  view.dispatch({
    changes: { from: spec.paramsRange[0], to: spec.paramsRange[1], insert: text },
    annotations: fromForm.of(true),
  });
}

export function applyBase(view, spec, base) {
  if (!spec.baseRange) return;
  view.dispatch({
    changes: { from: spec.baseRange[0], to: spec.baseRange[1], insert: base },
    annotations: fromForm.of(true),
  });
}

// ---------- NEW: the lock itself ----------

const lockedOf = (state) => parseSpec(state)?.locked ?? [];

// the bouncer: typing inside a locked range is dropped, form edits pass
const blockEdits = EditorState.changeFilter.of((tr) =>
  tr.annotation(fromForm) ? true : lockedOf(tr.startState).flat(),
);

// the shading, so the user can see what's locked
const lockedMark = Decoration.mark({ class: "cm-locked" });
const buildShading = (state) =>
  Decoration.set(lockedOf(state).map(([f, t]) => lockedMark.range(f, t)));

const shading = StateField.define({
  create: buildShading,
  update: (value, tr) => (tr.docChanged ? buildShading(tr.state) : value),
  provide: (f) => EditorView.decorations.from(f),
});

const lockTheme = EditorView.theme({
  ".cm-locked": { backgroundColor: "rgba(127,127,127,0.12)" },
});

export const lockExtension = [blockEdits, shading, lockTheme];