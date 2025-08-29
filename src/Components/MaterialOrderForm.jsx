import { useState } from "react";

/**
 * MaterialOrderForm.jsx
 * A React component version of the uploaded "Material Order Form".
 * - Card-style layout using Tailwind (swap to plain CSS if needed)
 * - Required fields marked with *
 * - Dynamic line items table (add/remove rows)
 * - Notes and multiple image upload with previews
 * - onSubmit currently logs the payload—wire to your API
 */

function Input({ label, name, type = "text", required = false, placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</span>
      <input
        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" className="size-4" checked={checked} onChange={onChange} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function Textarea({ label, name, rows = 5, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

function Row({ row, onChange, onRemove }) {
  return (
    <tr className="odd:bg-white even:bg-gray-50">
      <td className="p-2 align-top">
        <input
          type="number"
          min={0}
          className="w-20 rounded-lg border border-gray-200 px-2 py-1"
          value={row.qty}
          onChange={(e) => onChange({ ...row, qty: e.target.value })}
        />
      </td>
      <td className="p-2 align-top">
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 px-2 py-1"
          value={row.reason}
          onChange={(e) => onChange({ ...row, reason: e.target.value })}
          placeholder="Backorder, damage, change order, etc."
        />
      </td>
      <td className="p-2 align-top">
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 px-2 py-1"
          value={row.description}
          onChange={(e) => onChange({ ...row, description: e.target.value })}
          placeholder="Item description"
        />
      </td>
      <td className="p-2 align-top">
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 px-2 py-1"
          value={row.material}
          onChange={(e) => onChange({ ...row, material: e.target.value })}
          placeholder="SKU / material"
        />
      </td>
      <td className="p-2 align-top text-center">
        <input
          type="checkbox"
          className="size-4"
          checked={row.included}
          onChange={(e) => onChange({ ...row, included: e.target.checked })}
        />
      </td>
      <td className="p-2 align-top">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export default function MaterialOrderForm() {
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [area, setArea] = useState("");
  const [installer, setInstaller] = useState("");
  const [rows, setRows] = useState([
    { id: crypto.randomUUID(), qty: "", reason: "", description: "", material: "", included: false },
  ]);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]); // File[]

  function addRow() {
    setRows((r) => [
      ...r,
      { id: crypto.randomUUID(), qty: "", reason: "", description: "", material: "", included: false },
    ]);
  }

  function updateRow(id, next) {
    setRows((r) => r.map((row) => (row.id === id ? next : row)));
  }

  function removeRow(id) {
    setRows((r) => (r.length === 1 ? r : r.filter((row) => row.id !== id)));
  }

  function handleFiles(e) {
    const f = Array.from(e.target.files || []);
    setFiles(f);
  }

  function onSubmit(e) {
    e.preventDefault();
    const payload = {
      clientName,
      date,
      area,
      installer,
      items: rows.map(({ id, ...rest }) => rest),
      notes,
      pictures: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    };
    console.log("Material Order Form submit", payload);
    alert("Material Order submitted. Check console for payload.");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Material Order Form</h1>
            <p className="text-sm text-gray-600">Fill out the details and attach pictures if needed.</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Print
          </button>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* Top fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Client Name" name="clientName" required value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input label="Date" name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Area / Room" name="area" required value={area} onChange={(e) => setArea(e.target.value)} />
            <Input label="Installer" name="installer" required value={installer} onChange={(e) => setInstaller(e.target.value)} />
          </div>

          {/* Items table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 font-medium">QTY</th>
                  <th className="p-2 font-medium">Reason</th>
                  <th className="p-2 font-medium">Description</th>
                  <th className="p-2 font-medium">Material</th>
                  <th className="p-2 text-center font-medium">Included In Contract</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Row
                    key={row.id}
                    row={row}
                    onChange={(next) => updateRow(row.id, next)}
                    onRemove={() => removeRow(row.id)}
                  />
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <button
                type="button"
                onClick={addRow}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                + Add item
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <Textarea label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Type here..." />
          </div>

          {/* Pictures */}
          <div className="mt-6">
            <span className="text-sm font-medium">Pictures</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full text-sm"
              onChange={handleFiles}
            />
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {files.map((f, i) => (
                  <figure key={i} className="rounded-xl border border-gray-200 p-2">
                    <img
                      className="h-28 w-full rounded-lg object-cover"
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                    />
                    <figcaption className="mt-1 truncate text-xs text-gray-600">{f.name}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button type="reset" className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => { setClientName(""); setDate(new Date().toISOString().slice(0,10)); setArea(""); setInstaller(""); setRows([{ id: crypto.randomUUID(), qty: "", reason: "", description: "", material: "", included: false }]); setNotes(""); setFiles([]); }}
            >
              Reset
            </button>
            <button type="submit" className="rounded-xl bg-black px-4 py-2 text-sm text-white">Submit</button>
          </div>
        </form>
      </section>
    </main>
  );
}
