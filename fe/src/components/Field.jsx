import { useSelectData } from "../hooks/select";

export const controlClass =
  "rounded-md border border-line bg-surface-soft px-3 py-2 text-sm outline-none focus:border-accent";

export function Field({ id, label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextField({ id, label, value, onChange }) {
  return (
    <Field id={id} label={label}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={controlClass}
      />
    </Field>
  );
}

export function SelectField({
  id,
  label,
  endpoint,
  value,
  onChange,
  valueField = "id",
  placeholder = "Select one",
}) {
  const { data, loading, error } = useSelectData(endpoint);

  // accept ["a","b"] or [{id, name}]
  const options = data.map((d) =>
    typeof d === "string"
      ? { value: d, label: d}
      : { value: d[valueField], label: d.name},
  );

  return (
    <Field id={id} label={label}>
      {error ? (
        <p className="text-sm text-red-500">Couldn't load options.</p>
      ) : (
        <select
          id={id}
          value={value}
          onChange={(e) => {
            const opt = options.find((o) => String(o.value) === e.target.value);
            onChange(e.target.value, opt?.item);
          }}
          disabled={loading}
          className={controlClass}
        >
          <option value="">{loading ? "Loading..." : placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}