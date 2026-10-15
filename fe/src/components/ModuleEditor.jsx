import { useEffect, useState } from "react";
import { TextField, SelectField, controlClass } from "./Field";

const toFileName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
const isIdent = (s) => /^[A-Za-z_]\w*$/.test(s);
function NameField({ value, onCommit }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]); // follow the code when it changes

  return (
    <TextField
      id="name"
      label="Name"
      value={draft}
      onChange={(v) => {
        setDraft(v); // show what they typed
        if (isIdent(v)) onCommit(v); // only touch the code when it's valid
      }}
    />
  );
}
const DTYPES = ["float32", "float16", "bfloat16", "int64", "int32", "bool"];

function PortList({ title, ports, setPorts }) {
  const update = (i, field, value) =>
    setPorts(ports.map((p, j) => (j === i ? { ...p, [field]: value } : p)));
  const remove = (i) => setPorts(ports.filter((_, j) => j !== i));
  const clear = () => setPorts([]);
  const add = () =>
    setPorts([...ports, { name: "", shape: "", dtype: "float32" }]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {ports.length > 0 && (
          <button
            type="button"
            aria-label={`Clear all ${title.toLowerCase()}`}
            onClick={clear}
            className="text-xs text-muted hover:text-red-500"
          >
            Clear all
          </button>
        )}
      </div>

      {ports.map((p, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-2"
        >
          <input
            aria-label={`${title} name`}
            placeholder="name"
            className={controlClass}
            value={p.name}
            onChange={(e) => update(i, "name", e.target.value)}
          />
          <input
            aria-label={`${title} shape`}
            placeholder="B, 3, 224, 224"
            className={`${controlClass} font-mono`}
            value={p.shape}
            onChange={(e) => update(i, "shape", e.target.value)}
          />
          <select
            aria-label={`${title} dtype`}
            className={controlClass}
            value={p.dtype}
            onChange={(e) => update(i, "dtype", e.target.value)}
          >
            {DTYPES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button
            type="button"
            aria-label={`Remove ${title}`}
            onClick={() => remove(i)}
            className={`${controlClass} text-muted hover:text-red-500`}
          >
            ×
          </button>
        </div>
      ))}

      <button type="button" className={controlClass} onClick={add}>
        Add {title.toLowerCase().replace(/s$/, "")}
      </button>
    </>
  );
}

export function ModuleEditor({
  spec,
  setName,
  setBase,
  setParams,
  registryName,
  setRegistryName,
  inputs,
  setInputs,
  outputs,
  setOutputs,
}) {
  const updateParam = (i, field, value) =>
    setParams(
      spec.params.map((p, j) => (j === i ? { ...p, [field]: value } : p)),
    );

  const removeParam = (i) => setParams(spec.params.filter((_, j) => j !== i));
  const clearParams = () => setParams([]);

  // new names must be unique, since Python rejects duplicate argument names
  const nextParamName = () => {
    const taken = new Set(spec.params.map((p) => p.name));
    let n = 1;
    while (taken.has(`new_param_${n}`)) n++;
    return `new_param_${n}`;
  };

  if (!spec) {
    return (
      <p className="text-sm text-muted">Can't read this code right now.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <NameField value={spec.name} onCommit={setName} />
        <TextField
          id="registry"
          label="Registry Name"
          value={registryName}
          onChange={(value) => setRegistryName(value)}
        />
      </div>

      <SelectField
        id="type"
        label="Type"
        endpoint="/api/v1/blocks/types"
        valueField="code"
        value={spec.base}
        onChange={setBase}
        placeholder="Select a type"
      />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Parameters</h3>
        {spec.params.length > 0 && (
          <button
            type="button"
            onClick={clearParams}
            className="text-xs text-muted hover:text-red-500"
          >
            Clear all
          </button>
        )}
      </div>

      {spec.params.map((p, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
        >
          <input
            aria-label="Parameter name"
            className={controlClass}
            value={p.name}
            onChange={(e) => updateParam(i, "name", e.target.value)}
          />
          <input
            aria-label="Parameter type"
            className={controlClass}
            value={p.type}
            onChange={(e) => updateParam(i, "type", e.target.value)}
          />
          <input
            aria-label="Parameter default"
            className={controlClass}
            value={p.default}
            onChange={(e) => updateParam(i, "default", e.target.value)}
          />
          <button
            type="button"
            aria-label="Remove parameter"
            onClick={() => removeParam(i)}
            className={`${controlClass} text-muted hover:text-red-500`}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className={controlClass}
        onClick={() =>
          setParams([
            ...spec.params,
            { name: nextParamName(), type: "int", default: "" },
          ])
        }
      >
        Add parameter
      </button>
      <PortList title="Inputs" ports={inputs} setPorts={setInputs} />
      <PortList title="Outputs" ports={outputs} setPorts={setOutputs} />
    </div>
  );
}
