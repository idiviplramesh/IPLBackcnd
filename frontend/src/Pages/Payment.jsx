import { useEffect, useState } from "react";
import api from "../services/api";

// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  PaymentNo: "",
  PaymentDate: "",
  HeadCode: "",
  Notes: "",
  PaidBy: "",
  PaymentAmount: "",
};

// =====================================================
// PAYMENT
// =====================================================

function Payment() {
  // ===================================================
  // STATES
  // ===================================================

  const [payments, setPayments] = useState([]);
  const [heads, setHeads] = useState([]);

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
    loadPayments();
    loadHeads();
  }, []);

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setPayments(data);

      // -----------------------------------------------
      // AUTO GENERATE NEXT PAYMENT NO
      // Only when adding a new payment
      // -----------------------------------------------

      if (editingId === null) {
        setForm((previous) => ({
          ...previous,
          PaymentNo: getNextPaymentNo(data),
        }));
      }
    } catch (err) {
      console.error("LOAD PAYMENTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET NEXT PAYMENT NUMBER
  // =====================================================

  const getNextPaymentNo = (paymentList = payments) => {
    if (!Array.isArray(paymentList) || paymentList.length === 0) {
      return "1";
    }

    const paymentNumbers = paymentList
      .map((payment) => Number(payment.PaymentNo))
      .filter((number) => Number.isFinite(number));

    if (paymentNumbers.length === 0) {
      return "1";
    }

    const maxPaymentNo = Math.max(...paymentNumbers);

    return String(maxPaymentNo + 1);
  };

  // =====================================================
  // LOAD HEADS
  // =====================================================

  const loadHeads = async () => {
    try {
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
    }
  };

  // =====================================================
  // DATE FORMAT
  //
  // DATABASE:
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

    // -------------------------------------------------
    // YYYY-MM-DD
    // -------------------------------------------------

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const datePart = value.substring(0, 10);

      const [year, month, day] = datePart.split("-");

      return `${day}-${month}-${year}`;
    }

    // -------------------------------------------------
    // DD-MM-YYYY
    // -------------------------------------------------

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return value;
    }

    // -------------------------------------------------
    // FALLBACK
    // -------------------------------------------------

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // =====================================================
  // CONVERT DATE FOR INPUT
  //
  // INPUT:
  // YYYY-MM-DD
  // =====================================================

  const getInputDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const value = String(dateValue);

    // -------------------------------------------------
    // YYYY-MM-DD
    // -------------------------------------------------

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.substring(0, 10);
    }

    // -------------------------------------------------
    // DD-MM-YYYY
    // -------------------------------------------------

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [day, month, year] = value.split("-");

      return `${year}-${month}-${day}`;
    }

    // -------------------------------------------------
    // FALLBACK
    // -------------------------------------------------

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

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
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SAVE / UPDATE PAYMENT
  // =====================================================

  const savePayment = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const paymentDate = form.PaymentDate;

    const headCode = form.HeadCode;

    const notes = String(
      form.Notes || ""
    ).trim();

    const paidBy = String(
      form.PaidBy || ""
    ).trim();

    const paymentAmount = String(
      form.PaymentAmount || ""
    ).trim();

    // -------------------------------------------------
    // PAYMENT NO
    //
    // For INSERT:
    // Automatically generate from current list.
    //
    // For UPDATE:
    // Keep existing PaymentNo.
    // -------------------------------------------------

    let paymentNo = String(
      form.PaymentNo || ""
    ).trim();

    if (editingId === null) {
      paymentNo = getNextPaymentNo(payments);
    }

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!paymentDate) {
      setError(
        "Payment date is required"
      );
      return;
    }

    if (!headCode) {
      setError(
        "Head is required"
      );
      return;
    }

    if (!paidBy) {
      setError(
        "Paid By is required"
      );
      return;
    }

    if (!paymentAmount) {
      setError(
        "Payment amount is required"
      );
      return;
    }

    if (Number(paymentAmount) <= 0) {
      setError(
        "Payment amount must be greater than zero"
      );
      return;
    }

    if (!paymentNo) {
      setError(
        "Payment number could not be generated"
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // PAYLOAD
      // -------------------------------------------------

      const payload = {
        PaymentNo: Number(paymentNo),

        PaymentDate: paymentDate,

        HeadCode: Number(headCode),

        Notes:
          notes !== ""
            ? notes
            : null,

        PaidBy: paidBy,

        PaymentAmount:
          Number(paymentAmount),
      };

      console.log(
        "PAYMENT PAYLOAD:",
        payload
      );

      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      if (editingId !== null) {
        await api.put(
          `/payments/${editingId}`,
          payload
        );

        setSuccess(
          "Payment updated successfully"
        );
      }

      // -------------------------------------------------
      // INSERT
      // -------------------------------------------------

      else {
        await api.post(
          "/payments",
          payload
        );

        setSuccess(
          `Payment ${paymentNo} added successfully`
        );
      }

      // -------------------------------------------------
      // CLEAR FORM
      // -------------------------------------------------

      setEditingId(null);

      // -------------------------------------------------
      // RELOAD PAYMENTS
      // This also generates next Payment No.
      // -------------------------------------------------

      await loadPayments();

      // -------------------------------------------------
      // CLEAR OTHER FIELDS
      // -------------------------------------------------

      setForm({
        ...emptyForm,
        PaymentNo: getNextPaymentNo(
          payments
        ),
      });

    } catch (err) {
      console.error(
        "SAVE PAYMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT PAYMENT
  // =====================================================

  const editPayment = (payment) => {
    const id = payment.PaymentCode;

    if (
      id === undefined ||
      id === null
    ) {
      setError(
        "Payment code not found"
      );

      return;
    }

    setEditingId(id);

    setForm({
      PaymentNo:
        payment.PaymentNo !== null &&
        payment.PaymentNo !== undefined
          ? String(payment.PaymentNo)
          : "",

      PaymentDate:
        getInputDate(
          payment.PaymentDate
        ),

      HeadCode:
        payment.HeadCode !== null &&
        payment.HeadCode !== undefined
          ? String(payment.HeadCode)
          : "",

      Notes:
        payment.Notes !== null &&
        payment.Notes !== undefined
          ? String(payment.Notes)
          : "",

      PaidBy:
        payment.PaidBy ||
        payment["Paid By"] ||
        "",

      PaymentAmount:
        payment.PaymentAmount !== null &&
        payment.PaymentAmount !== undefined
          ? String(
              payment.PaymentAmount
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
  // DELETE PAYMENT
  // =====================================================

  const deletePayment = async (
    paymentCode
  ) => {
    if (
      paymentCode === undefined ||
      paymentCode === null
    ) {
      setError(
        "Payment code not found"
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this payment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/payments/${paymentCode}`
      );

      if (
        editingId === paymentCode
      ) {
        setEditingId(null);

        setForm({
          ...emptyForm,
        });
      }

      setSuccess(
        "Payment deleted successfully"
      );

      await loadPayments();

    } catch (err) {
      console.error(
        "DELETE PAYMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      PaymentNo:
        getNextPaymentNo(payments),
    });

    setError("");
    setSuccess("");
  };

  // =====================================================
  // GET HEAD NAME
  // =====================================================

  const getHeadName = (headCode) => {
    const head = heads.find(
      (item) =>
        Number(item.HeadCode) ===
        Number(headCode)
    );

    return (
      head?.HeadName ||
      headCode ||
      ""
    );
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredPayments =
    payments.filter((payment) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }

      return (
        String(
          payment.PaymentNo || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          formatDate(
            payment.PaymentDate
          )
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          getHeadName(
            payment.HeadCode
          )
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          payment.PaidBy ||
            payment["Paid By"] ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          payment.PaymentAmount ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          payment.Notes || ""
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
            Payment Master
          </h2>

          <p>
            Manage payment information
          </p>

        </div>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="master-form-card">

        <h3>
          {editingId !== null
            ? "Edit Payment"
            : "Add Payment"}
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
          onSubmit={savePayment}
        >

          <div className="form-grid">

            {/* =========================================
                PAYMENT NO
                AUTO GENERATED
            ========================================= */}

            <div className="form-group">

              <label>
                Payment No
              </label>

              <input
                type="text"
                name="PaymentNo"
                value={
                  form.PaymentNo
                }
                readOnly
                disabled
                placeholder="Auto generated"
                autoComplete="off"
              />

            </div>

            {/* =========================================
                PAYMENT DATE
            ========================================= */}

            <div className="form-group">

              <label>
                Payment Date *
              </label>

              <input
                type="date"
                name="PaymentDate"
                value={
                  form.PaymentDate
                }
                onChange={
                  handleChange
                }
              />

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
                NOTES
            ========================================= */}

            <div className="form-group">

              <label>
                Notes
              </label>

              <input
                type="text"
                name="Notes"
                value={
                  form.Notes
                }
                onChange={
                  handleChange
                }
                placeholder="Enter notes"
                maxLength={500}
                autoComplete="off"
              />

            </div>

            {/* =========================================
                PAID BY
            ========================================= */}

            <div className="form-group">

              <label>
                Paid By *
              </label>

              <input
                type="text"
                name="PaidBy"
                value={
                  form.PaidBy
                }
                onChange={
                  handleChange
                }
                placeholder="Enter paid by"
                maxLength={50}
                autoComplete="off"
              />

            </div>

            {/* =========================================
                PAYMENT AMOUNT
            ========================================= */}

            <div className="form-group">

              <label>
                Payment Amount *
              </label>

              <input
                type="number"
                name="PaymentAmount"
                value={
                  form.PaymentAmount
                }
                onChange={
                  handleChange
                }
                placeholder="Enter payment amount"
                min="0"
                step="0.001"
              />

            </div>

          </div>

          {/* =================================================
              BUTTONS
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
          PAYMENT LIST
      ================================================= */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            Payment List
          </h3>

          <input
            className="search-input"
            placeholder="Search payment..."
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

                {/* PAYMENT CODE HIDDEN */}

                <th>
                  Payment No
                </th>

                <th>
                  Payment Date
                </th>

                <th>
                  Head
                </th>

                <th>
                  Paid By
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Notes
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {/* =================================================
                  PAYMENT ROWS
              ================================================= */}

              {filteredPayments.map(
                (payment) => {

                  const id =
                    payment.PaymentCode;

                  return (
                    <tr
                      key={id}
                    >

                      {/* PAYMENT NO */}

                      <td>
                        {
                          payment.PaymentNo
                        }
                      </td>

                      {/* PAYMENT DATE */}

                      <td>
                        {formatDate(
                          payment.PaymentDate
                        )}
                      </td>

                      {/* HEAD */}

                      <td>
                        {getHeadName(
                          payment.HeadCode
                        )}
                      </td>

                      {/* PAID BY */}

                      <td>
                        {
                          payment.PaidBy ||
                          payment["Paid By"] ||
                          ""
                        }
                      </td>

                      {/* AMOUNT */}

                      <td>
                        {
                          payment.PaymentAmount
                        }
                      </td>

                      {/* NOTES */}

                      <td>
                        {
                          payment.Notes ||
                          ""
                        }
                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="edit-button"
                          title="Edit"
                          onClick={() =>
                            editPayment(
                              payment
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          title="Delete"
                          onClick={() =>
                            deletePayment(
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
                  NO DATA
              ================================================= */}

              {!loading &&
                filteredPayments.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan="7"
                      className="empty-row"
                    >
                      No payments found
                    </td>

                  </tr>
                )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <tr>

                  <td
                    colSpan="7"
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

export default Payment;