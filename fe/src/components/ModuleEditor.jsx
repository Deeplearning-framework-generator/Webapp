import { useState } from "react";
import { TextField, SelectField, controlClass } from "./Field";

const toFileName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_");

export function ModuleEditor({
  spec,
  setName,
  setBase,
  setParams,
  registryName,
  setRegistryName,
}) {
  const updateParam = (i, field, value) =>
    setParams(
      spec.params.map((p, j) => (j === i ? { ...p, [field]: value } : p)),
    );

  if (!spec) {
    return (
      <p className="text-sm text-muted">Can't read this code right now.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="name"
          label="Name"
          value={spec.name}
          onChange={setName}
        />
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

      <h3 className="text-sm font-semibold">Parameters</h3>
      {spec.params.map((p, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
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
        </div>
      ))}
      <button
        className={controlClass}
        onClick={() =>
          setParams([
            ...spec.params,
            { name: "new_param", type: "int", default: "" },
          ])
        }
      >
        Add parameter
      </button>
    </div>
  );
}
