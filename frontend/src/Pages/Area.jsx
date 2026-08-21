import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  AreaName: "",
};

function Area() {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD AREAS
  // =====================================================

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/areas");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setAreas(data);
    } catch (err) {
      console.error("LOAD AREAS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load areas"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE / UPDATE AREA
  // =====================================================

  const saveArea = async (e) => {
    e.preventDefault();

    const areaName = form.AreaName.trim();

    if (!areaName) {
      setError("Area name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        AreaName: areaName,
      };

      // UPDATE
      if (editingId !== null) {
        await api.put(
          `/areas/${editingId}`,
          payload
        );
      }

      // INSERT
      else {
        await api.post("/areas", payload);
      }

      clearForm();
      await loadAreas();
    } catch (err) {
      console.error("SAVE AREA ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save area"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT AREA
  // =====================================================

  const editArea = (area) => {
    const id = area.AreaCode;

    if (id === undefined || id === null) {
      setError("Area code not found");
      return;
    }

    setEditingId(id);

    setForm({
      AreaName: area.AreaName || "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE AREA
  // =====================================================

  const deleteArea = async (areaCode) => {
    if (
      areaCode === undefined ||
      areaCode === null
    ) {
      setError("Area code not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this area?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/areas/${areaCode}`
      );

      if (editingId === areaCode) {
        clearForm();
      }

      await loadAreas();
    } catch (err) {
      console.error("DELETE AREA ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete area"
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

  const filteredAreas = areas.filter((area) => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      return true;
    }

    return (
      String(area.AreaCode || "")
        .toLowerCase()
        .includes(searchText) ||
      String(area.AreaName || "")
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
          <h2>Area Master</h2>
          <p>Manage area information</p>
        </div>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="master-form-card">
        <h3>
          {editingId !== null
            ? "Edit Area"
            : "Add Area"}
        </h3>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={saveArea}>
          <div className="form-grid">
            {/* AREA CODE */}

            {editingId !== null && (
              <div className="form-group">
                <label>Area Code</label>

                <input
                  value={editingId}
                  disabled
                  readOnly
                />
              </div>
            )}

            {/* AREA NAME */}

            <div className="form-group">
              <label>Area Name *</label>

              <input
                name="AreaName"
                value={form.AreaName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    AreaName:
                      e.target.value,
                  })
                }
                placeholder="Enter area name"
                maxLength={50}
                autoComplete="off"
              />
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
          AREA LIST
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <h3>Area List</h3>

          <input
            className="search-input"
            placeholder="Search area..."
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
                <th>Area Code</th>
                <th>Area Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAreas.map((area) => {
                const id = area.AreaCode;

                return (
                  <tr key={id}>
                    <td>
                      {area.AreaCode}
                    </td>

                    <td>
                      {area.AreaName}
                    </td>

                    <td>
                      {/* EDIT SYMBOL */}

                      <button
                        type="button"
                        className="edit-button"
                        title="Edit"
                        onClick={() =>
                          editArea(area)
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
                          deleteArea(id)
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
                filteredAreas.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="empty-row"
                    >
                      No areas found
                    </td>
                  </tr>
                )}

              {loading && (
                <tr>
                  <td
                    colSpan="3"
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

export default Area;