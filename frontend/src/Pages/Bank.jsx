import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  BankName: "",
  BranchName: "",
  IFSCCode: "",
  Status: true,
};

function Bank() {
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD BANKS
  // =====================================================

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/banks");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setBanks(data);
    } catch (err) {
      console.error("LOAD BANKS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load banks"
      );

      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  const saveBank = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.BankName.trim()) {
      setError("Bank name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingId !== null) {
        await api.put(
          `/banks/${editingId}`,
          {
            BankName: form.BankName.trim(),
            BranchName: form.BranchName.trim(),
            IFSCCode: form.IFSCCode.trim(),
            Status: form.Status,
          }
        );

        setSuccess(
          "Bank updated successfully"
        );
      } else {
        await api.post("/banks", {
          BankName: form.BankName.trim(),
          BranchName: form.BranchName.trim(),
          IFSCCode: form.IFSCCode.trim(),
        });

        setSuccess(
          "Bank created successfully"
        );
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadBanks();
    } catch (err) {
      console.error("SAVE BANK ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save bank"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const editBank = (bank) => {
    const id = bank.BankCode;

    if (
      id === undefined ||
      id === null
    ) {
      setError("Invalid Bank Code");
      return;
    }

    setEditingId(id);

    setForm({
      BankName: bank.BankName || "",
      BranchName: bank.BranchName || "",
      IFSCCode: bank.IFSCCode || "",
      Status: bank.Status !== false,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteBank = async (id) => {
    if (
      id === undefined ||
      id === null
    ) {
      setError("Invalid Bank Code");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this bank?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.delete(`/banks/${id}`);

      setSuccess(
        "Bank deleted successfully"
      );

      if (editingId === id) {
        clearForm();
      }

      await loadBanks();
    } catch (err) {
      console.error(
        "DELETE BANK ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete bank"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const clearForm = () => {
    setForm({
      BankName: "",
      BranchName: "",
      IFSCCode: "",
      Status: true,
    });

    setEditingId(null);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText =
    search.trim().toLowerCase();

  const filteredBanks = banks.filter(
    (bank) => {
      const text = `
        ${bank.BankCode || ""}
        ${bank.BankName || ""}
        ${bank.BranchName || ""}
        ${bank.IFSCCode || ""}
      `.toLowerCase();

      return text.includes(searchText);
    }
  );

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
          <h2>Bank Master</h2>

          <p>
            Manage bank information
          </p>
        </div>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="master-form-card">
        <h3>
          {editingId !== null
            ? "Edit Bank"
            : "Add Bank"}
        </h3>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={saveBank}>
          <div className="form-grid">
            {/* BANK NAME */}

            <div className="form-group">
              <label>
                Bank Name *
              </label>

              <input
                type="text"
                name="BankName"
                value={form.BankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                maxLength={50}
                autoComplete="off"
              />
            </div>

            {/* BRANCH */}

            <div className="form-group">
              <label>
                Branch Name
              </label>

              <input
                type="text"
                name="BranchName"
                value={form.BranchName}
                onChange={handleChange}
                placeholder="Enter branch name"
                maxLength={50}
                autoComplete="off"
              />
            </div>

            {/* IFSC */}

            <div className="form-group">
              <label>
                IFSC Code
              </label>

              <input
                type="text"
                name="IFSCCode"
                value={form.IFSCCode}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                maxLength={50}
                autoComplete="off"
              />
            </div>

            {/* STATUS - ONLY EDIT */}

            {editingId !== null && (
              <div className="form-group">
                <label>
                  Status
                </label>

                <select
                  name="Status"
                  value={
                    form.Status
                      ? "1"
                      : "0"
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        Status:
                          e.target.value ===
                          "1",
                      })
                    )
                  }
                >
                  <option value="1">
                    Active
                  </option>

                  <option value="0">
                    Inactive
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* BUTTONS */}

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
          TABLE
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <h3>
            Bank List
          </h3>

          <input
            type="text"
            className="search-input"
            placeholder="Search bank..."
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
                <th>
                  ID
                </th>

                <th>
                  Bank Name
                </th>

                <th>
                  Branch
                </th>

                <th>
                  IFSC
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                filteredBanks.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-row"
                    >
                      Loading banks...
                    </td>
                  </tr>
                )}

              {!loading &&
                filteredBanks.map(
                  (bank) => (
                    <tr
                      key={
                        bank.BankCode
                      }
                    >
                      {/* ID */}

                      <td>
                        {
                          bank.BankCode
                        }
                      </td>

                      {/* BANK */}

                      <td>
                        {
                          bank.BankName
                        }
                      </td>

                      {/* BRANCH */}

                      <td>
                        {
                          bank.BranchName
                        }
                      </td>

                      {/* IFSC */}

                      <td>
                        {
                          bank.IFSCCode
                        }
                      </td>

                      {/* STATUS */}

                      <td>
                        {bank.Status ? (
                          <span className="status-active">
                            Active
                          </span>
                        ) : (
                          <span className="status-inactive">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: "8px",
                            alignItems:
                              "center",
                          }}
                        >
                          {/* EDIT */}

                          <button
                            type="button"
                            className="edit-button"
                            title="Edit Bank"
                            onClick={() =>
                              editBank(
                                bank
                              )
                            }
                          >
                            ✏️
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-button"
                            title="Delete Bank"
                            onClick={() =>
                              deleteBank(
                                bank.BankCode
                              )
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

              {!loading &&
                filteredBanks.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-row"
                    >
                      {search
                        ? "No banks found for your search"
                        : "No banks found"}
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

export default Bank;