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

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD MEMBERS + AREAS
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // GET ARRAY FROM API RESPONSE
  // =====================================================

  const getArray = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    return [];
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        memberResponse,
        areaResponse,
      ] = await Promise.all([
        api.get("/members"),
        api.get("/areas"),
      ]);

      console.log(
        "MEMBERS API RESPONSE:",
        memberResponse.data
      );

      console.log(
        "AREAS API RESPONSE:",
        areaResponse.data
      );

      setMembers(
        getArray(memberResponse.data)
      );

      setAreas(
        getArray(areaResponse.data)
      );
    } catch (err) {
      console.error(
        "LOAD MEMBER DATA ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load member data"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // SAVE MEMBER
  // =====================================================

  const saveMember = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!form.MemberName.trim()) {
      setError("Member name is required");
      return;
    }

    if (!form.MobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    if (!form.AreaCode) {
      setError("Area is required");
      return;
    }

    // ---------------------------------------------------
    // MOBILE VALIDATION
    // ---------------------------------------------------

    const mobile = form.MobileNumber.trim();

    if (!/^[0-9]{10,20}$/.test(mobile)) {
      setError(
        "Please enter a valid mobile number"
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        MemberName:
          form.MemberName.trim(),

        MobileNumber:
          mobile,

        AreaCode:
          Number(form.AreaCode),
      };

      console.log(
        "MEMBER SAVE PAYLOAD:",
        payload
      );

      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      if (editingId) {
        const response = await api.put(
          `/members/${editingId}`,
          payload
        );

        console.log(
          "MEMBER UPDATE RESPONSE:",
          response.data
        );
      }

      // -------------------------------------------------
      // CREATE
      // MemberCode is NOT sent.
      // Backend generates it automatically.
      // -------------------------------------------------

      else {
        const response = await api.post(
          "/members",
          payload
        );

        console.log(
          "MEMBER CREATE RESPONSE:",
          response.data
        );
      }

      clearForm();

      await loadData();
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
      member.MemberCode ??
      member.memberCode;

    if (!id) {
      setError(
        "Member Code not found"
      );
      return;
    }

    console.log(
      "EDIT MEMBER:",
      member
    );

    setEditingId(id);

    setForm({
      MemberName:
        member.MemberName || "",

      MobileNumber:
        member.MobileNumber || "",

      AreaCode:
        member.AreaCode !== null &&
        member.AreaCode !== undefined
          ? String(member.AreaCode)
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

  const deleteMember = async (id) => {
    if (!id) {
      setError(
        "Member Code not found"
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "DELETE MEMBER CODE:",
        id
      );

      const response = await api.delete(
        `/members/${id}`
      );

      console.log(
        "DELETE MEMBER RESPONSE:",
        response.data
      );

      await loadData();
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

  const searchText =
    search.trim().toLowerCase();

  const filteredMembers =
    members.filter((member) => {
      const text = [
        member.MemberCode,
        member.MemberName,
        member.MobileNumber,
        member.AreaCode,
        member.AreaName,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined
        )
        .join(" ")
        .toLowerCase();

      return text.includes(searchText);
    });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">
        <div>
          <h2>Member Master</h2>

          <p>
            Manage member information
          </p>
        </div>
      </div>

      {/* =================================================
          FORM CARD
      ================================================= */}

      <div className="master-form-card">
        <h3>
          {editingId
            ? "Edit Member"
            : "Add Member"}
        </h3>

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={saveMember}>
          <div className="form-grid">

            {/* =================================================
                MEMBER NAME
            ================================================= */}

            <div className="form-group">
              <label>
                Member Name *
              </label>

              <input
                type="text"
                name="MemberName"
                value={
                  form.MemberName
                }
                onChange={handleChange}
                placeholder="Enter member name"
                maxLength={50}
                disabled={loading}
              />
            </div>

            {/* =================================================
                MOBILE NUMBER
            ================================================= */}

            <div className="form-group">
              <label>
                Mobile Number *
              </label>

              <input
                type="text"
                name="MobileNumber"
                value={
                  form.MobileNumber
                }
                onChange={handleChange}
                placeholder="Enter mobile number"
                maxLength={20}
                disabled={loading}
              />
            </div>

            {/* =================================================
                AREA
            ================================================= */}

            <div className="form-group">
              <label>
                Area *
              </label>

              <select
                name="AreaCode"
                value={
                  form.AreaCode
                }
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">
                  Select Area
                </option>

                {areas.map((area) => {
                  const areaCode =
                    area.AreaCode ??
                    area.areaCode;

                  const areaName =
                    area.AreaName ??
                    area.areaName ??
                    "";

                  return (
                    <option
                      key={areaCode}
                      value={areaCode}
                    >
                      {areaName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
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
          MEMBER LIST
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <h3>
            Member List
          </h3>

          <input
            type="text"
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
                  Member Code
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
              {/* =================================================
                  MEMBERS
              ================================================= */}

              {!loading &&
                filteredMembers.map(
                  (member) => {
                    const id =
                      member.MemberCode ??
                      member.memberCode;

                    return (
                      <tr key={id}>
                        {/* MEMBER CODE */}

                        <td>
                          {member.MemberCode}
                        </td>

                        {/* MEMBER NAME */}

                        <td>
                          {member.MemberName}
                        </td>

                        {/* MOBILE */}

                        <td>
                          {member.MobileNumber}
                        </td>

                        {/* AREA CODE */}

                        <td>
                          {member.AreaCode}
                        </td>

                        {/* AREA NAME */}

                        <td>
                          {member.AreaName ||
                            "-"}
                        </td>

                        {/* ACTION */}

                        <td>
                          <div
                            style={{
                              display:
                                "flex",
                              gap: "6px",
                              alignItems:
                                "center",
                            }}
                          >
                            {/* EDIT */}

                            <button
                              type="button"
                              className="edit-button"
                              title="Edit Member"
                              onClick={() =>
                                editMember(
                                  member
                                )
                              }
                              disabled={
                                loading
                              }
                              style={{
                                cursor:
                                  "pointer",
                                fontSize:
                                  "16px",
                              }}
                            >
                              ✏️
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              className="delete-button"
                              title="Delete Member"
                              onClick={() =>
                                deleteMember(
                                  id
                                )
                              }
                              disabled={
                                loading
                              }
                              style={{
                                cursor:
                                  "pointer",
                                fontSize:
                                  "16px",
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
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
                    Loading members...
                  </td>
                </tr>
              )}

              {/* =================================================
                  NO DATA
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Member;