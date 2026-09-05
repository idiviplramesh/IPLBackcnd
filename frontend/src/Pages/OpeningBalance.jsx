import { useEffect, useState } from "react";
import api from "../services/api";

// ============================================================
// OPENING BALANCE
// Master -> Opening Balance
//
// Financial Year comes from the FY selected during login.
// ============================================================

function OpeningBalance() {
  const [companies, setCompanies] = useState([]);
  const [heads, setHeads] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    HeadOpeningCode: null,
    CompanyCode: "",
    Headcode: "",
    OpeningBalance: "",
    RP: true,
    fycode: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================================
  // GET LOGIN USER
  // ==========================================================

  const getLoggedInUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (err) {
      console.error("USER JSON ERROR:", err);
      return null;
    }
  };

  // ==========================================================
  // GET LOGIN FY
  // ==========================================================

  const getLoginFYCode = () => {
    const user = getLoggedInUser();

    if (user?.FYCode !== undefined && user?.FYCode !== null) {
      return Number(user.FYCode);
    }

    // Fallback if FYCode was stored separately
    const savedFY = localStorage.getItem("FYCode");

    if (savedFY) {
      return Number(savedFY);
    }

    return "";
  };

  // ==========================================================
  // NORMALIZE API ARRAY
  // Supports:
  //
  // []
  // { data: [] }
  // { companies: [] }
  // { heads: [] }
  // { financialYears: [] }
  // { openingBalances: [] }
  // ==========================================================

  const getArrayData = (responseData, possibleKeys = []) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (
      responseData &&
      Array.isArray(responseData.data)
    ) {
      return responseData.data;
    }

    for (const key of possibleKeys) {
      if (
        responseData &&
        Array.isArray(responseData[key])
      ) {
        return responseData[key];
      }
    }

    return [];
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadMasterData();
    loadOpeningBalances();
  }, []);

  // ==========================================================
  // LOAD COMPANY / HEAD / FINANCIAL YEAR
  // ==========================================================

  const loadMasterData = async () => {
    try {
      setLoadingData(true);
      setError("");

      console.log(
        "=========================================="
      );
      console.log(
        "LOADING OPENING BALANCE MASTER DATA"
      );
      console.log(
        "=========================================="
      );

      // ------------------------------------------------------
      // Load independently.
      //
      // Do NOT use Promise.all here because one failed API
      // should not prevent the other master data from loading.
      // ------------------------------------------------------

      let companyData = [];
      let headData = [];
      let financialYearData = [];

      // ======================================================
      // COMPANIES
      // ======================================================

      try {
        const response = await api.get("/companies");

        console.log(
          "COMPANIES RESPONSE:",
          response.data
        );

        companyData = getArrayData(
          response.data,
          ["companies"]
        );

        setCompanies(companyData);

        console.log(
          "COMPANIES LOADED:",
          companyData.length
        );
      } catch (err) {
        console.error(
          "COMPANY LOAD ERROR:",
          err
        );

        console.error(
          "COMPANY RESPONSE ERROR:",
          err.response?.data
        );
      }

      // ======================================================
      // HEADS
      // ======================================================

      try {
        const response = await api.get("/heads");

        console.log(
          "HEADS RESPONSE:",
          response.data
        );

        headData = getArrayData(
          response.data,
          ["heads"]
        );

        setHeads(headData);

        console.log(
          "HEADS LOADED:",
          headData.length
        );
      } catch (err) {
        console.error(
          "HEAD LOAD ERROR:",
          err
        );

        console.error(
          "HEAD RESPONSE ERROR:",
          err.response?.data
        );
      }

      // ======================================================
      // FINANCIAL YEARS
      //
      // IMPORTANT:
      // auth router is mounted at:
      //
      // /api/auth
      //
      // therefore:
      //
      // /auth/financial-years
      // ======================================================

      try {
        const response = await api.get(
          "/auth/financial-years"
        );

        console.log(
          "FINANCIAL YEARS RESPONSE:",
          response.data
        );

        financialYearData = getArrayData(
          response.data,
          [
            "financialYears",
            "financialyears",
            "years",
          ]
        );

        setFinancialYears(
          financialYearData
        );

        console.log(
          "FINANCIAL YEARS LOADED:",
          financialYearData.length
        );
      } catch (err) {
        console.error(
          "FINANCIAL YEAR LOAD ERROR:",
          err
        );

        console.error(
          "FINANCIAL YEAR RESPONSE ERROR:",
          err.response?.data
        );
      }

      // ======================================================
      // LOGIN FY
      // ======================================================

      const loginFYCode =
        getLoginFYCode();

      console.log(
        "LOGIN FY CODE:",
        loginFYCode
      );

      if (loginFYCode) {
        setForm((prev) => ({
          ...prev,
          fycode: loginFYCode,
        }));
      }

      // ======================================================
      // FINAL CHECK
      // ======================================================

      if (
        companyData.length === 0 &&
        headData.length === 0 &&
        financialYearData.length === 0
      ) {
        setError(
          "Company, Head and Financial Year data could not be loaded."
        );
      }
    } catch (err) {
      console.error(
        "MASTER DATA ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load master data"
      );
    } finally {
      setLoadingData(false);
    }
  };

  // ==========================================================
  // LOAD OPENING BALANCES
  // ==========================================================

  const loadOpeningBalances = async () => {
    try {
      setLoadingRecords(true);

      console.log(
        "LOADING OPENING BALANCES..."
      );

      const response = await api.get(
        "/opening-balances"
      );

      console.log(
        "OPENING BALANCES RESPONSE:",
        response.data
      );

      const data = getArrayData(
        response.data,
        [
          "openingBalances",
          "records",
        ]
      );

      setRecords(data);

      console.log(
        "OPENING BALANCES LOADED:",
        data.length
      );
    } catch (err) {
      console.error(
        "OPENING BALANCE LOAD ERROR:",
        err
      );

      console.error(
        "OPENING BALANCE RESPONSE ERROR:",
        err.response?.data
      );

      setRecords([]);

      setError(
        err.response?.data?.message ||
          "Failed to load opening balances"
      );
    } finally {
      setLoadingRecords(false);
    }
  };

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    const loginFYCode =
      getLoginFYCode();

    setForm({
      HeadOpeningCode: null,
      CompanyCode: "",
      Headcode: "",
      OpeningBalance: "",
      RP: true,
      fycode: loginFYCode || "",
    });

    setMessage("");
    setError("");
  };

  // ==========================================================
  // SAVE / UPDATE
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // --------------------------------------------------------
    // LOGIN FY
    // --------------------------------------------------------

    const loginFYCode =
      getLoginFYCode();

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!form.CompanyCode) {
      setError(
        "Please select Company"
      );
      return;
    }

    if (!loginFYCode) {
      setError(
        "Financial Year is not available. Please login again."
      );
      return;
    }

    if (!form.Headcode) {
      setError(
        "Please select Head"
      );
      return;
    }

    if (
      form.OpeningBalance === "" ||
      form.OpeningBalance === null ||
      form.OpeningBalance === undefined
    ) {
      setError(
        "Please enter Opening Balance"
      );
      return;
    }

    const amount =
      Number(form.OpeningBalance);

    if (Number.isNaN(amount)) {
      setError(
        "Opening Balance must be a valid number"
      );
      return;
    }

    if (amount < 0) {
      setError(
        "Opening Balance cannot be negative"
      );
      return;
    }

    // --------------------------------------------------------
    // PAYLOAD
    //
    // IMPORTANT:
    // FY always comes from login.
    // Do not trust a manually changed FY.
    // --------------------------------------------------------

    const payload = {
      CompanyCode: Number(
        form.CompanyCode
      ),

      Headcode: Number(
        form.Headcode
      ),

      OpeningBalance: amount,

      RP:
        form.RP === true ||
        form.RP === "true",

      fycode: Number(
        loginFYCode
      ),
    };

    console.log(
      "OPENING BALANCE PAYLOAD:",
      payload
    );

    try {
      setLoading(true);

      // ======================================================
      // UPDATE
      // ======================================================

      if (form.HeadOpeningCode) {
        await api.put(
          `/opening-balances/${form.HeadOpeningCode}`,
          payload
        );

        setMessage(
          "Opening balance updated successfully."
        );
      }

      // ======================================================
      // INSERT
      // ======================================================

      else {
        await api.post(
          "/opening-balances",
          payload
        );

        setMessage(
          "Opening balance saved successfully."
        );
      }

      resetForm();

      await loadOpeningBalances();

    } catch (err) {
      console.error(
        "SAVE OPENING BALANCE ERROR:",
        err
      );

      console.error(
        "SAVE RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to save opening balance"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = (record) => {
    setMessage("");
    setError("");

    setForm({
      HeadOpeningCode:
        record.HeadOpeningCode,

      CompanyCode:
        record.CompanyCode,

      Headcode:
        record.Headcode,

      OpeningBalance:
        record.OpeningBalance,

      RP:
        Boolean(record.RP),

      // Always use login FY
      fycode:
        getLoginFYCode(),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this opening balance?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await api.delete(
        `/opening-balances/${id}`
      );

      setMessage(
        "Opening balance deleted successfully."
      );

      await loadOpeningBalances();

    } catch (err) {
      console.error(
        "DELETE OPENING BALANCE ERROR:",
        err
      );

      console.error(
        "DELETE RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete opening balance"
      );
    }
  };

  // ==========================================================
  // AMOUNT FORMAT
  // ==========================================================

  const formatAmount = (value) => {
    const amount =
      Number(value || 0);

    return amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ==========================================================
  // GET ACTIVE FY NAME
  // ==========================================================

  const loginFYCode =
    getLoginFYCode();

  const activeFY =
    financialYears.find(
      (fy) =>
        Number(fy.FYCode) ===
        Number(loginFYCode)
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="page-container">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="page-header">

        <div>
          <h2>
            Opening Balance
          </h2>

          <p>
            Master → Opening Balance
          </p>
        </div>

      </div>

      {/* ====================================================
          SUCCESS
      ==================================================== */}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ====================================================
          FORM
      ==================================================== */}

      <div className="card">

        <div className="card-header">

          <h3>
            {form.HeadOpeningCode
              ? "Edit Opening Balance"
              : "Add Opening Balance"}
          </h3>

        </div>

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* ==================================================
                COMPANY
            ================================================== */}

            <div className="form-group">

              <label>
                Company
                <span className="required">
                  *
                </span>
              </label>

              <select
                name="CompanyCode"
                value={
                  form.CompanyCode
                }
                onChange={
                  handleChange
                }
                disabled={
                  loadingData ||
                  loading
                }
              >

                <option value="">
                  -- Select Company --
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={
                        company.CompanyCode
                      }
                      value={
                        company.CompanyCode
                      }
                    >
                      {
                        company.CompanyName
                      }
                    </option>
                  )
                )}

              </select>

              {!loadingData &&
                companies.length === 0 && (
                  <small>
                    No companies found.
                  </small>
                )}

            </div>

            {/* ==================================================
                FINANCIAL YEAR
            ================================================== */}

            <div className="form-group">

              <label>
                Financial Year
                <span className="required">
                  *
                </span>
              </label>

              <select
                name="fycode"
                value={
                  form.fycode || ""
                }
                disabled
              >

                <option value="">
                  -- Financial Year --
                </option>

                {financialYears.map(
                  (fy) => (
                    <option
                      key={
                        fy.FYCode
                      }
                      value={
                        fy.FYCode
                      }
                    >
                      {fy.FYear}
                    </option>
                  )
                )}

              </select>

              {activeFY && (
                <small>
                  Current login FY:{" "}
                  {activeFY.FYear}
                </small>
              )}

            </div>

            {/* ==================================================
                HEAD
            ================================================== */}

            <div className="form-group">

              <label>
                Head
                <span className="required">
                  *
                </span>
              </label>

              <select
                name="Headcode"
                value={
                  form.Headcode
                }
                onChange={
                  handleChange
                }
                disabled={
                  loadingData ||
                  loading
                }
              >

                <option value="">
                  -- Select Head --
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

              {!loadingData &&
                heads.length === 0 && (
                  <small>
                    No heads found.
                  </small>
                )}

            </div>

            {/* ==================================================
                OPENING BALANCE
            ================================================== */}

            <div className="form-group">

              <label>
                Opening Balance
                <span className="required">
                  *
                </span>
              </label>

              <input
                type="number"
                name="OpeningBalance"
                value={
                  form.OpeningBalance
                }
                onChange={
                  handleChange
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={
                  loading
                }
              />

            </div>

            {/* ==================================================
                RP
            ================================================== */}

            <div className="form-group">

              <label>
                Balance Type
              </label>

              <select
                name="RP"
                value={String(
                  form.RP
                )}
                onChange={(e) => {

                  setForm(
                    (prev) => ({
                      ...prev,
                      RP:
                        e.target
                          .value ===
                        "true",
                    })
                  );

                  setMessage("");
                  setError("");
                }}
                disabled={
                  loading
                }
              >

                <option value="true">
                  Receipt
                </option>

                <option value="false">
                  Payment
                </option>

              </select>

            </div>

          </div>

          {/* ====================================================
              BUTTONS
          ==================================================== */}

          <div className="form-actions">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading ||
                loadingData
              }
            >
              {loading
                ? "Saving..."
                : form.HeadOpeningCode
                ? "Update"
                : "Save"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={
                resetForm
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

      {/* ====================================================
          LIST
      ==================================================== */}

      <div className="card">

        <div className="card-header">

          <h3>
            Opening Balance List
            {activeFY &&
              ` - ${activeFY.FYear}`}
          </h3>

        </div>

        <div className="table-responsive">

          <table className="data-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Company
                </th>

                <th>
                  Financial Year
                </th>

                <th>
                  Head
                </th>

                <th>
                  Opening Balance
                </th>

                <th>
                  Type
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loadingRecords ? (

                <tr>

                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "20px",
                    }}
                  >
                    Loading opening
                    balances...
                  </td>

                </tr>

              ) : records.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "20px",
                    }}
                  >
                    No opening balances
                    found.
                  </td>

                </tr>

              ) : (

                records.map(
                  (
                    record,
                    index
                  ) => (

                    <tr
                      key={
                        record.HeadOpeningCode
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {
                          record.CompanyName ||
                          record.companyName ||
                          ""
                        }
                      </td>

                      <td>
                        {
                          record.FYear ||
                          record.fyear ||
                          ""
                        }
                      </td>

                      <td>
                        {
                          record.HeadName ||
                          record.headName ||
                          ""
                        }
                      </td>

                      <td>
                        {formatAmount(
                          record.OpeningBalance
                        )}
                      </td>

                      <td>
                        {Boolean(
                          record.RP
                        )
                          ? "Receipt"
                          : "Payment"}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            handleEdit(
                              record
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(
                              record.HeadOpeningCode
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default OpeningBalance;