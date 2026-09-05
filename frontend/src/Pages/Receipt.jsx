import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  ReceiptNo: "",
  ReceiptDate: "",
  HeadCode: "",
  ReceivedFrom: "",
  MNo: "",
  Receivedby: "",
  ReceivedAmount: "",
};

// =====================================================
// RECEIPT
// =====================================================

function Receipt() {
  // ===================================================
  // AUTH USER
  // ===================================================

  const { user } = useAuth();

  // ===================================================
  // USER NAME
  // ===================================================

  const userName =
    user?.UserName ||
    user?.username ||
    user?.Name ||
    "";

  // =====================================================
  // STATES
  // =====================================================

  const [receipts, setReceipts] = useState([]);

  const [heads, setHeads] = useState([]);

  const [members, setMembers] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadReceipts();
    loadHeads();
    loadMembers();
  }, []);

  // =====================================================
  // UPDATE RECEIVED BY
  // =====================================================

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      Receivedby: userName,
    }));
  }, [userName]);

  // =====================================================
  // AUTO GENERATE RECEIPT NO
  //
  // Example:
  // Existing:
  // 1
  // 2
  // 3
  //
  // New:
  // 4
  // =====================================================

  useEffect(() => {
    if (
      receipts.length > 0 &&
      editingId === null
    ) {
      const nextReceiptNo =
        getNextReceiptNo(receipts);

      setForm((previous) => ({
        ...previous,
        ReceiptNo: String(nextReceiptNo),
      }));
    }

    if (
      receipts.length === 0 &&
      editingId === null
    ) {
      setForm((previous) => ({
        ...previous,
        ReceiptNo: "1",
      }));
    }
  }, [receipts, editingId]);

  // =====================================================
  // LOAD RECEIPTS
  // =====================================================

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/receipts");

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

      setReceipts(data);
    } catch (err) {
      console.error(
        "LOAD RECEIPTS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load receipts"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD HEADS
  // =====================================================

  const loadHeads = async () => {
    try {
      const response =
        await api.get("/heads");

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

      setHeads(data);
    } catch (err) {
      console.error(
        "LOAD HEADS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load heads"
      );
    }
  };

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadMembers = async () => {
    try {
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
    }
  };

  // =====================================================
  // GET NEXT RECEIPT NO
  // =====================================================

  const getNextReceiptNo = (receiptList) => {
    if (
      !Array.isArray(receiptList) ||
      receiptList.length === 0
    ) {
      return 1;
    }

    const receiptNumbers =
      receiptList
        .map((receipt) =>
          Number(receipt.ReceiptNo)
        )
        .filter(
          (number) =>
            Number.isFinite(number) &&
            number > 0
        );

    if (receiptNumbers.length === 0) {
      return 1;
    }

    return (
      Math.max(...receiptNumbers) + 1
    );
  };

  // =====================================================
  // FORMAT DATE FOR DISPLAY
  //
  // API:
  // 2026-08-31
  //
  // DISPLAY:
  // 31-08-2026
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const value = String(dateValue);

    // -----------------------------------------------
    // YYYY-MM-DD
    // -----------------------------------------------

    if (
      /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      const datePart =
        value.substring(0, 10);

      const [
        year,
        month,
        day,
      ] = datePart.split("-");

      return `${day}-${month}-${year}`;
    }

    // -----------------------------------------------
    // DD-MM-YYYY
    // -----------------------------------------------

    if (
      /^\d{2}-\d{2}-\d{4}$/.test(value)
    ) {
      return value;
    }

    // -----------------------------------------------
    // FALLBACK
    // -----------------------------------------------

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year =
      date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // =====================================================
  // GET DATE FOR HTML DATE INPUT
  //
  // HTML INPUT:
  // YYYY-MM-DD
  // =====================================================

  const getInputDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const value = String(dateValue);

    // -----------------------------------------------
    // YYYY-MM-DD
    // -----------------------------------------------

    if (
      /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      return value.substring(0, 10);
    }

    // -----------------------------------------------
    // DD-MM-YYYY
    // -----------------------------------------------

    if (
      /^\d{2}-\d{2}-\d{4}$/.test(value)
    ) {
      const [
        day,
        month,
        year,
      ] = value.split("-");

      return `${year}-${month}-${day}`;
    }

    // -----------------------------------------------
    // FALLBACK
    // -----------------------------------------------

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    // -------------------------------------------------
    // RECEIPT NO IS AUTO GENERATED
    // -------------------------------------------------

    if (name === "ReceiptNo") {
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // MEMBER CHANGE
  // =====================================================

  const handleMemberChange = (e) => {
    const value =
      e.target.value;

    // -------------------------------------------------
    // NO MEMBER
    // -------------------------------------------------

    if (!value) {
      setForm((previous) => ({
        ...previous,
        MNo: "",
        ReceivedFrom: "",
      }));

      setError("");
      setSuccess("");

      return;
    }

    // -------------------------------------------------
    // FIND MEMBER
    // -------------------------------------------------

    const selectedMember =
      members.find(
        (member) =>
          String(
            member.MemberCode
          ) === String(value)
      );

    // -------------------------------------------------
    // MEMBER FOUND
    // -------------------------------------------------

    if (selectedMember) {
      setForm((previous) => ({
        ...previous,
        MNo: value,
        ReceivedFrom:
          selectedMember.MemberName ||
          "",
      }));
    } else {
      setForm((previous) => ({
        ...previous,
        MNo: value,
      }));
    }

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SAVE / UPDATE RECEIPT
  // =====================================================

  const saveReceipt = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // FORM VALUES
    // -------------------------------------------------

    const receiptNo =
      String(
        form.ReceiptNo || ""
      ).trim();

    const receiptDate =
      form.ReceiptDate;

    const headCode =
      form.HeadCode;

    const receivedFrom =
      String(
        form.ReceivedFrom || ""
      ).trim();

    const receivedBy =
      String(
        userName || ""
      ).trim();

    const receivedAmount =
      String(
        form.ReceivedAmount || ""
      ).trim();

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!receiptNo) {
      setError(
        "Receipt No could not be generated"
      );
      return;
    }

    if (!receiptDate) {
      setError(
        "Receipt date is required"
      );
      return;
    }

    if (!headCode) {
      setError(
        "Head is required"
      );
      return;
    }

    if (!receivedFrom) {
      setError(
        "Received From is required"
      );
      return;
    }

    if (!receivedBy) {
      setError(
        "Logged-in user name not found"
      );
      return;
    }

    if (!receivedAmount) {
      setError(
        "Received amount is required"
      );
      return;
    }

    if (
      Number(receivedAmount) <= 0
    ) {
      setError(
        "Received amount must be greater than zero"
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // MEMBER NUMBER
      // Empty = NULL
      // -------------------------------------------------

      const memberNo =
        form.MNo === ""
          ? null
          : Number(form.MNo);

      // -------------------------------------------------
      // PAYLOAD
      // -------------------------------------------------

      const payload = {
        ReceiptNo: Number(
          receiptNo
        ),

        // Backend receives:
        // YYYY-MM-DD
        ReceiptDate:
          receiptDate,

        HeadCode:
          Number(headCode),

        ReceivedFrom:
          receivedFrom,

        MNo:
          memberNo,

        Receivedby:
          receivedBy,

        ReceivedAmount:
          Number(receivedAmount),
      };

      console.log(
        "RECEIPT PAYLOAD:",
        payload
      );

      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      if (
        editingId !== null
      ) {
        await api.put(
          `/receipts/${editingId}`,
          payload
        );

        setSuccess(
          "Receipt updated successfully"
        );
      }

      // -------------------------------------------------
      // INSERT
      // -------------------------------------------------

      else {
        await api.post(
          "/receipts",
          payload
        );

        setSuccess(
          "Receipt added successfully"
        );
      }

      // -------------------------------------------------
      // CLEAR FORM
      // -------------------------------------------------

      setForm({
        ...emptyForm,
        Receivedby:
          userName,
      });

      setEditingId(null);

      // -------------------------------------------------
      // RELOAD
      // -------------------------------------------------

      await loadReceipts();

    } catch (err) {
      console.error(
        "SAVE RECEIPT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save receipt"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT RECEIPT
  // =====================================================

  const editReceipt = (receipt) => {
    const id =
      receipt.ReceiptCode;

    if (
      id === undefined ||
      id === null
    ) {
      setError(
        "Receipt code not found"
      );
      return;
    }

    setEditingId(id);

    setForm({
      // Existing Receipt No
      ReceiptNo:
        receipt.ReceiptNo !== null &&
        receipt.ReceiptNo !== undefined
          ? String(
              receipt.ReceiptNo
            )
          : "",

      // HTML date input requires YYYY-MM-DD
      ReceiptDate:
        getInputDate(
          receipt.ReceiptDate
        ),

      HeadCode:
        receipt.HeadCode !== null &&
        receipt.HeadCode !== undefined
          ? String(
              receipt.HeadCode
            )
          : "",

      ReceivedFrom:
        receipt.ReceivedFrom ||
        "",

      MNo:
        receipt.MNo !== null &&
        receipt.MNo !== undefined
          ? String(
              receipt.MNo
            )
          : "",

      Receivedby:
        userName,

      ReceivedAmount:
        receipt.ReceivedAmount !== null &&
        receipt.ReceivedAmount !== undefined
          ? String(
              receipt.ReceivedAmount
            )
          : "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE RECEIPT
  // =====================================================

  const deleteReceipt = async (
    receiptCode
  ) => {
    if (
      receiptCode === undefined ||
      receiptCode === null
    ) {
      setError(
        "Receipt code not found"
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this receipt?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/receipts/${receiptCode}`
      );

      if (
        editingId === receiptCode
      ) {
        setForm({
          ...emptyForm,
          Receivedby:
            userName,
        });

        setEditingId(null);
      }

      setSuccess(
        "Receipt deleted successfully"
      );

      await loadReceipts();

    } catch (err) {
      console.error(
        "DELETE RECEIPT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete receipt"
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
      Receivedby:
        userName,
    });

    setEditingId(null);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredReceipts =
    receipts.filter(
      (receipt) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        if (!searchText) {
          return true;
        }

        return (
          // Receipt No
          String(
            receipt.ReceiptNo || ""
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Receipt Date
          String(
            formatDate(
              receipt.ReceiptDate
            )
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Head Name
          String(
            receipt.HeadName || ""
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Head Code
          String(
            receipt.HeadCode || ""
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Member No
          String(
            receipt.MNo || ""
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Received From
          String(
            receipt.ReceivedFrom || ""
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Received By
          String(
            receipt.Receivedby ||
              receipt["Received By"] ||
              ""
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||

          // Amount
          String(
            receipt.ReceivedAmount || ""
          )
            .toLowerCase()
            .includes(
              searchText
            )
        );
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

          <h2>
            Receipt Master
          </h2>

          <p>
            Manage receipt information
          </p>

        </div>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="master-form-card">

        <h3>
          {editingId !== null
            ? "Edit Receipt"
            : "Add Receipt"}
        </h3>

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form
          onSubmit={saveReceipt}
        >

          <div className="form-grid">

            {/* =========================================
                RECEIPT NO
            ========================================= */}

            <div className="form-group">

              <label>
                Receipt No
              </label>

              <input
                type="text"
                name="ReceiptNo"
                value={
                  form.ReceiptNo
                }
                readOnly
                disabled
                placeholder="Auto generated"
              />

            </div>

            {/* =========================================
                RECEIPT DATE
            ========================================= */}

            <div className="form-group">

              <label>
                Receipt Date *
              </label>

              <input
                type="date"
                name="ReceiptDate"
                value={
                  form.ReceiptDate
                }
                onChange={
                  handleChange
                }
              />

              {/* Display example */}
              {form.ReceiptDate && (
                <small>
                  Date:{" "}
                  {formatDate(
                    form.ReceiptDate
                  )}
                </small>
              )}

            </div>

            {/* =========================================
                HEAD
            ========================================= */}

            <div className="form-group">

              <label>
                Head *
              </label>

              <select
                name="HeadCode"
                value={
                  form.HeadCode
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select Head
                </option>

                {heads.map(
                  (head) => (
                    <option
                      key={
                        head.HeadCode
                      }
                      value={
                        head.HeadCode
                      }
                    >
                      {
                        head.HeadName
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* =========================================
                RECEIVED FROM
            ========================================= */}

            <div className="form-group">

              <label>
                Received From *
              </label>

              <input
                type="text"
                name="ReceivedFrom"
                value={
                  form.ReceivedFrom
                }
                onChange={
                  handleChange
                }
                placeholder={
                  form.MNo
                    ? "Member name"
                    : "Enter received from"
                }
                maxLength={50}
                autoComplete="off"
              />

            </div>

            {/* =========================================
                MEMBER NO
            ========================================= */}

            <div className="form-group">

              <label>
                Member No
              </label>

              <select
                name="MNo"
                value={
                  form.MNo
                }
                onChange={
                  handleMemberChange
                }
              >

                <option value="">
                  No Member
                </option>

                {members.map(
                  (member) => {

                    const memberCode =
                      member.MemberCode;

                    const memberName =
                      member.MemberName ||
                      "";

                    return (
                      <option
                        key={
                          memberCode
                        }
                        value={
                          memberCode
                        }
                      >
                        {memberCode}
                        {" - "}
                        {memberName}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

            {/* =========================================
                RECEIVED BY
            ========================================= */}

            <div className="form-group">

              <label>
                Received By *
              </label>

              <input
                type="text"
                name="Receivedby"
                value={
                  userName
                }
                readOnly
                disabled
                placeholder="Logged-in user"
                autoComplete="off"
              />

            </div>

            {/* =========================================
                RECEIVED AMOUNT
            ========================================= */}

            <div className="form-group">

              <label>
                Received Amount *
              </label>

              <input
                type="number"
                name="ReceivedAmount"
                value={
                  form.ReceivedAmount
                }
                onChange={
                  handleChange
                }
                placeholder="Enter received amount"
                step="0.001"
                min="0"
              />

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
          RECEIPT LIST
      ================================================= */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            Receipt List
          </h3>

          <input
            className="search-input"
            placeholder="Search receipt..."
            value={
              search
            }
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

                {/* Receipt Code hidden */}

                <th>
                  Receipt No
                </th>

                <th>
                  Receipt Date
                </th>

                <th>
                  Head
                </th>

                <th>
                  Member No
                </th>

                <th>
                  Received From
                </th>

                <th>
                  Received By
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {/* =================================================
                  RECEIPT ROWS
              ================================================= */}

              {!loading &&
                filteredReceipts.map(
                  (receipt) => {

                    const id =
                      receipt.ReceiptCode;

                    return (
                      <tr
                        key={id}
                      >

                        {/* RECEIPT NO */}

                        <td>
                          {
                            receipt.ReceiptNo
                          }
                        </td>

                        {/* RECEIPT DATE */}

                        <td>
                          {
                            formatDate(
                              receipt.ReceiptDate
                            )
                          }
                        </td>

                        {/* HEAD */}

                        <td>
                          {
                            receipt.HeadName ||
                            receipt.HeadCode ||
                            ""
                          }
                        </td>

                        {/* MEMBER NO */}

                        <td>
                          {
                            receipt.MNo ===
                              null ||
                            receipt.MNo ===
                              undefined ||
                            receipt.MNo ===
                              ""
                              ? "-"
                              : receipt.MNo
                          }
                        </td>

                        {/* RECEIVED FROM */}

                        <td>
                          {
                            receipt.ReceivedFrom ||
                            ""
                          }
                        </td>

                        {/* RECEIVED BY */}

                        <td>
                          {
                            receipt.Receivedby ||
                            receipt[
                              "Received By"
                            ] ||
                            ""
                          }
                        </td>

                        {/* AMOUNT */}

                        <td>
                          {
                            receipt.ReceivedAmount
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
                              editReceipt(
                                receipt
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
                              deleteReceipt(
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
                filteredReceipts.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan="8"
                      className="empty-row"
                    >
                      No receipts found
                    </td>

                  </tr>

                )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (

                <tr>

                  <td
                    colSpan="8"
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

export default Receipt;