import { useEffect, useState } from "react";
import api from "../api";

function EditTable({
  columns,
  initialData = [],
  onRefresh,
  resource = "/categories",
  hideDelete = false,
  hideEdit = false,
  addFormKeys = null,
  extraPayload = {},
  hideActions = false,
}) {
  const [rows, setRows] = useState(initialData);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const idColumn = columns.find((col) => col.auto) || columns[0];

  const formColumns = columns.filter(
    (col) =>
      !col.auto &&
      col.editable !== false &&
      (!addFormKeys || addFormKeys.includes(col.key))
  );

  useEffect(() => {
    setRows(initialData);
  }, [initialData]);

  const refreshRows = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      const response = await api.get(resource);
      setRows(response.data);
    }
  };

  const notifyInventoryChanged = () => {
    window.dispatchEvent(new Event("inventory:data-changed"));
  };

  const openAddPopup = () => {
    setFormData({});
    setEditingId(null);
    setShowPopup(true);
  };

  const openEditPopup = (row) => {
    setFormData({ ...row });
    setEditingId(row[idColumn.key]);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setFormData({});
    setEditingId(null);
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const hasEmptyFields = formColumns.some(
      (col) => !String(formData[col.key] ?? "").trim()
    );

    if (hasEmptyFields) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = Object.fromEntries(
      formColumns.map((col) => [col.key, formData[col.key]])
    );

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(`${resource}/${editingId}`, payload);
        alert("Item updated successfully!");
      } else {
        await api.post(resource, {
          ...payload,
          ...extraPayload,
        });
        alert("Item added successfully!");
      }

      closePopup();
      await refreshRows();
      notifyInventoryChanged();
    } catch (error) {
      console.error("Error saving item:", error.response?.data || error.message);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to save item. Please check your backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const id = row[idColumn.key];

    if (!id) {
      alert("Record ID not found.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await api.delete(`${resource}/${id}`);
      alert("Record deleted successfully.");
      await refreshRows();
      notifyInventoryChanged();
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to delete record. Check the backend console."
      );
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openAddPopup}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <span className="text-xl">+</span>
          Add Item
        </button>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="whitespace-nowrap border-b px-4 py-3 font-semibold text-gray-700">
                S.No
              </th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap border-b px-4 py-3 font-semibold text-gray-700"
                >
                  {col.label}
                </th>
              ))}

              {!hideActions && (
                <th className="whitespace-nowrap border-b px-4 py-3 font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row[idColumn.key] ?? index}
                className="hover:bg-gray-50"
              >
                <td className="whitespace-nowrap border-b px-4 py-3 text-gray-700">
                  {index + 1}
                </td>

                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap border-b px-4 py-3 text-gray-700"
                  >
                    {col.format
                      ? col.format(row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}

                {!hideActions && (
                  <td className="whitespace-nowrap border-b px-4 py-3">
                    <div className="flex gap-2">
                      {!hideEdit && (
                        <button
                          type="button"
                          onClick={() => openEditPopup(row)}
                          className="rounded-md bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
                        >
                          Edit
                        </button>
                      )}

                      {!hideDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (hideActions ? 1 : 2)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No records available. Click Add Item to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closePopup();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId !== null ? "Edit Item" : "Add New Item"}
              </h2>

              <button
                type="button"
                onClick={closePopup}
                disabled={saving}
                className="rounded-md px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {formColumns.map((col) => (
                  <div key={col.key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {col.label}
                    </label>

                    <input
                      type={col.type || "text"}
                      value={formData[col.key] ?? ""}
                      onChange={(e) => handleChange(col.key, e.target.value)}
                      placeholder={`Enter ${col.label.toLowerCase()}`}
                      required
                      step={col.type === "number" ? "any" : undefined}
                      disabled={saving}
                      readOnly={col.readOnly === true}
                      className={`w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        col.readOnly ? "bg-gray-100" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePopup}
                  disabled={saving}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update"
                      : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditTable;