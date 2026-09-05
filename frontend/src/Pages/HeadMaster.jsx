
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  HeadName: "",
  Status: true,
};

function Head() {
  const [heads, setHeads] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD HEADS
  // =====================================================

  useEffect(() => {
    loadHeads();
  }, []);

  const loadHeads = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/heads");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setHeads(data);
    } catch (err) {
      console.error("LOAD HEADS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load heads"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE / UPDATE HEAD
  // =====================================================

  const saveHead = async (e) => {
    e.preventDefault();

    const headName = form.HeadName.trim();

    if (!headName) {
      setError("Head name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        HeadName: headName,
        Status: form.Status,
      };

      // UPDATE
      if (editingId !== null) {
        await api.put(
          `/heads/${editingId}`,
          payload
        );
      }

      // INSERT
      else {
        await api.post("/heads", payload);
      }

      clearForm();
      await loadHeads();
    } catch (err) {
      console.error("SAVE HEAD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save head"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT HEAD
  // =====================================================

  const editHead = (head) => {
    const id = head.HeadCode;

    if (id === undefined || id === null) {
      setError("Head code not found");
      return;
    }

    setEditingId(id);

    setForm({
      HeadName: head.HeadName || "",
      Status:
        head.Status === true ||
        head.Status === 1,
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE HEAD
  // =====================================================

  const deleteHead = async (headCode) => {
    if (
      headCode === undefined ||
      headCode === null
    ) {
      setError("Head code not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this head?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/heads/${headCode}`
      );

      if (editingId === headCode) {
        clearForm();
      }

      await loadHeads();
    } catch (err) {
      console.error("DELETE HEAD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete head"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setError("");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredHeads = heads.filter((head) => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      return true;
    }

    return (
      String(head.HeadCode || "")
        .toLowerCase()
        .includes(searchText) ||
      String(head.HeadName || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">
        <div>
          <h2>Head Master</h2>
          <p>Manage head information</p>
        </div>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="master-form-card">
        <h3>
          {editingId !== null
            ? "Edit Head"
            : "Add Head"}
        </h3>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={saveHead}>
          <div className="form-grid">

            {/* HEAD CODE */}

            {editingId !== null && (
              <div className="form-group">
                <label>Head Code</label>

                <input
                  value={editingId}
                  disabled
                  readOnly
                />
              </div>
            )}

            {/* HEAD NAME */}

            <div className="form-group">
              <label>Head Name *</label>

              <input
                name="HeadName"
                value={form.HeadName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    HeadName:
                      e.target.value,
                  })
                }
                placeholder="Enter head name"
                maxLength={100}
                autoComplete="off"
              />
            </div>

            {/* STATUS */}

            <div className="form-group">
              <label>Status</label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  height: "42px",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.Status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      Status:
                        e.target.checked,
                    })
                  }
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />

                <span>
                  {form.Status
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* FORM BUTTONS */}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId !== null
                ? "Update"
                : "Save"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={clearForm}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* =================================================
          HEAD LIST
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <h3>Head List</h3>

          <input
            className="search-input"
            placeholder="Search head..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Head Code</th>
                <th>Head Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredHeads.map((head) => {
                const id = head.HeadCode;

                const isActive =
                  head.Status === true ||
                  head.Status === 1;

                return (
                  <tr key={id}>
                    {/* HEAD CODE */}

                    <td>
                      {head.HeadCode}
                    </td>

                    {/* HEAD NAME */}

                    <td>
                      {head.HeadName}
                    </td>

                    {/* STATUS */}

                    <td>
                      {isActive ? (
                        <span
                          style={{
                            color: "green",
                            fontWeight: "600",
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "red",
                            fontWeight: "600",
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTION */}

                    <td>
                      {/* EDIT SYMBOL */}

                      <button
                        type="button"
                        className="edit-button"
                        title="Edit"
                        onClick={() =>
                          editHead(head)
                        }
                        disabled={loading}
                      >
                        ✏️
                      </button>

                      {/* DELETE SYMBOL */}

                      <button
                        type="button"
                        className="delete-button"
                        title="Delete"
                        onClick={() =>
                          deleteHead(id)
                        }
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading &&
                filteredHeads.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-row"
                    >
                      No heads found
                    </td>
                  </tr>
                )}

              {loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-row"
                  >
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Head;


