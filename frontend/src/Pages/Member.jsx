import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  MemberName: "",
  MobileNumber: "",
  AreaCode: "",
};

function Member() {
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);

  const [form, setForm] = useState(
    emptyForm
  );

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  useEffect(() => {
    loadMembers();
    loadAreas();
  }, []);

  // =====================================================
  // LOAD MEMBER LIST
  // =====================================================

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/members");

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

      setMembers(data);
    } catch (err) {
      console.error(
        "LOAD MEMBERS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load members"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD AREAS
  // =====================================================

  const loadAreas = async () => {
    try {
      const response =
        await api.get("/areas");

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

      setAreas(data);
    } catch (err) {
      console.error(
        "LOAD AREAS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load areas"
      );
    }
  };

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =====================================================
  // SAVE / UPDATE MEMBER
  // =====================================================

  const saveMember = async (e) => {
    e.preventDefault();

    const memberName =
      form.MemberName.trim();

    const mobileNumber =
      form.MobileNumber.trim();

    const areaCode =
      form.AreaCode;

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!memberName) {
      setError(
        "Member name is required"
      );
      return;
    }

    if (!mobileNumber) {
      setError(
        "Mobile number is required"
      );
      return;
    }

    if (!areaCode) {
      setError(
        "Area is required"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        MemberName:
          memberName,

        MobileNumber:
          mobileNumber,

        AreaCode:
          Number(areaCode),
      };

      // =================================================
      // UPDATE
      // =================================================

      if (editingId !== null) {
        await api.put(
          `/members/${editingId}`,
          payload
        );
      }

      // =================================================
      // INSERT
      // =================================================

      else {
        await api.post(
          "/members",
          payload
        );
      }

      clearForm();

      await loadMembers();
    } catch (err) {
      console.error(
        "SAVE MEMBER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save member"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT MEMBER
  // =====================================================

  const editMember = (member) => {
    const id =
      member.MemberCode;

    if (
      id === undefined ||
      id === null
    ) {
      setError(
        "Member number not found"
      );
      return;
    }

    setEditingId(id);

    setForm({
      MemberName:
        member.MemberName || "",

      MobileNumber:
        member.MobileNumber || "",

      AreaCode:
        member.AreaCode !==
        undefined
          ? String(
              member.AreaCode
            )
          : "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const deleteMember = async (
    memberCode
  ) => {
    if (
      memberCode === undefined ||
      memberCode === null
    ) {
      setError(
        "Member number not found"
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this member?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/members/${memberCode}`
      );

      if (
        editingId === memberCode
      ) {
        clearForm();
      }

      await loadMembers();
    } catch (err) {
      console.error(
        "DELETE MEMBER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete member"
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

  const filteredMembers =
    members.filter((member) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }

      return (
        String(
          member.MemberCode ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.MemberName ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.MobileNumber ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.AreaCode ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.AreaName ||
            ""
        )
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

          <h2>
            Member Details
          </h2>

          <p>
            Manage member information
          </p>

        </div>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="master-form-card">

        <h3>
          {editingId !== null
            ? "Edit Member"
            : "Add Member"}
        </h3>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          onSubmit={saveMember}
        >

          <div className="form-grid">

            {/* =========================================
                MEMBER NO
            ========================================= */}

            {editingId !== null && (
              <div className="form-group">

                <label>
                  Member No
                </label>

                <input
                  value={
                    editingId
                  }
                  disabled
                  readOnly
                />

              </div>
            )}

            {/* =========================================
                MEMBER NAME
            ========================================= */}

            <div className="form-group">

              <label>
                Member Name *
              </label>

              <input
                name="MemberName"
                value={
                  form.MemberName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter member name"
                maxLength={100}
                autoComplete="off"
              />

            </div>

            {/* =========================================
                MOBILE NUMBER
            ========================================= */}

            <div className="form-group">

              <label>
                Mobile Number *
              </label>

              <input
                name="MobileNumber"
                value={
                  form.MobileNumber
                }
                onChange={
                  handleChange
                }
                placeholder="Enter mobile number"
                maxLength={15}
                autoComplete="off"
              />

            </div>

            {/* =========================================
                AREA
            ========================================= */}

            <div className="form-group">

              <label>
                Area *
              </label>

              <select
                name="AreaCode"
                value={
                  form.AreaCode
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select Area
                </option>

                {areas.map(
                  (area) => (
                    <option
                      key={
                        area.AreaCode
                      }
                      value={
                        area.AreaCode
                      }
                    >
                      {area.AreaName}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* =================================================
              FORM BUTTONS
          ================================================= */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={
                loading
              }
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
              onClick={
                clearForm
              }
              disabled={
                loading
              }
            >
              Clear
            </button>

          </div>

        </form>

      </div>

      {/* =================================================
          MEMBER LIST
      ================================================= */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            Member List
          </h3>

          <input
            className="search-input"
            placeholder="Search member..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Member No
                </th>

                <th>
                  Member Name
                </th>

                <th>
                  Mobile Number
                </th>

                <th>
                  Area Code
                </th>

                <th>
                  Area Name
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredMembers.map(
                (member) => {

                  const id =
                    member.MemberCode;

                  return (
                    <tr
                      key={id}
                    >

                      {/* MEMBER NO */}

                      <td>
                        {
                          member.MemberCode
                        }
                      </td>

                      {/* MEMBER NAME */}

                      <td>
                        {
                          member.MemberName
                        }
                      </td>

                      {/* MOBILE NUMBER */}

                      <td>
                        {
                          member.MobileNumber
                        }
                      </td>

                      {/* AREA CODE */}

                      <td>
                        {
                          member.AreaCode
                        }
                      </td>

                      {/* AREA NAME */}

                      <td>
                        {
                          member.AreaName
                        }
                      </td>

                      {/* ACTION */}

                      <td>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button"
                          title="Edit"
                          onClick={() =>
                            editMember(
                              member
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          ✏️
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button"
                          title="Delete"
                          onClick={() =>
                            deleteMember(
                              id
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          🗑️
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

              {/* =================================================
                  NO RECORDS
              ================================================= */}

              {!loading &&
                filteredMembers.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan="6"
                      className="empty-row"
                    >
                      No members found
                    </td>

                  </tr>
                )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <tr>

                  <td
                    colSpan="6"
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

export default Member;