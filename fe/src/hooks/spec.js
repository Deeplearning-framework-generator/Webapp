import { syntaxTree } from "@codemirror/language";
import { Annotation } from "@codemirror/state";

export const fromForm = Annotation.define();

// spec:
// {
//   name: string,
//   nameRange: [from, to],
//   params: [{ name, type, default }],
//   paramsRange: [from, to],   // text between ( and ) of __init__
// }

// code -> spec
export function parseSpec(state) {
    let spec = null;
    const doc = state.doc;

    syntaxTree(state).iterate({
        enter(node) {
            if (node.name === "ClassDefinition" && !spec) {
                const id = node.node.getChild("VariableName");
                if (!id) return;
                const al = node.node.getChild("ArgList"); // the "(nn.Module)" part
                spec = {
                    name: doc.sliceString(id.from, id.to),
                    nameRange: [id.from, id.to],
                    base: al ? doc.sliceString(al.from + 1, al.to - 1).trim() : "",
                    baseRange: al ? [al.from + 1, al.to - 1] : null,
                    params: [],
                    paramsRange: [0, 0],
                };
            }
            if (node.name === "FunctionDefinition" && spec) {
                const fnName = node.node.getChild("VariableName");
                if (!fnName || doc.sliceString(fnName.from, fnName.to) !== "__init__") return;
                const pl = node.node.getChild("ParamList");
                if (!pl) return;
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
        },
    });
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