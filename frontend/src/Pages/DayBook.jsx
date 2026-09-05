import { useEffect, useState } from "react";
import api from "../services/api";
import "./DayBook.css";

function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const day = String(
    d.getDate()
  ).padStart(2, "0");

  const month = String(
    d.getMonth() + 1
  ).padStart(2, "0");

  const year =
    d.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatInputDate(date) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const year =
    d.getFullYear();

  const month = String(
    d.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    d.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function money(value) {
  return Number(
    value || 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DayBook() {
  const [financialYear, setFinancialYear] =
    useState(null);

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // GET USER / FINANCIAL YEAR
  // ===================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const user =
          JSON.parse(storedUser);

        setFinancialYear(user);

        if (user?.FYStart) {
          setFromDate(
            formatInputDate(
              user.FYStart
            )
          );
        }

        if (user?.FYEnd) {
          const end =
            new Date(user.FYEnd);

          // Don't automatically use FY end.
          // Default to today if inside FY.
          const today =
            new Date();

          const fyStart =
            new Date(user.FYStart);

          if (
            today >= fyStart &&
            today <= end
          ) {
            setToDate(
              formatInputDate(today)
            );
          } else {
            setToDate(
              formatInputDate(end)
            );
          }
        }
      }
    } catch (err) {
      console.error(
        "USER LOAD ERROR:",
        err
      );
    }
  }, []);

  // ===================================================
  // LOAD DAY BOOK
  // ===================================================

  const generateReport =
    async () => {
      try {
        setLoading(true);
        setError("");

        if (!fromDate) {
          setError(
            "Please select From Date"
          );
          return;
        }

        if (!toDate) {
          setError(
            "Please select To Date"
          );
          return;
        }

        if (
          new Date(fromDate) >
          new Date(toDate)
        ) {
          setError(
            "From Date cannot be greater than To Date"
          );
          return;
        }

        const response =
          await api.get(
            "/reports/day-book",
            {
              params: {
                fromDate,
                toDate,
              },
            }
          );

        if (
          response.data?.success
        ) {
          setReport(
            response.data
          );

          if (
            response.data.financialYear
          ) {
            setFinancialYear(
              response.data.financialYear
            );
          }
        } else {
          setError(
            response.data?.message ||
              "Failed to generate Day Book"
          );
        }
      } catch (err) {
        console.error(
          "DAY BOOK ERROR:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to generate Day Book"
        );
      } finally {
        setLoading(false);
      }
    };

  // ===================================================
  // CLEAR
  // ===================================================

  const clearReport =
    () => {
      setReport(null);
      setError("");
    };

  // ===================================================
  // PRINT
  // ===================================================

  const printReport =
    () => {
      if (!report) {
        return;
      }

      window.print();
    };

  const summary =
    report?.summary || {
      openingBalance: 0,
      totalReceipt: 0,
      totalPayment: 0,
      closingBalance: 0,
      netMovement: 0,
      transactionCount: 0,
    };

  const rows =
    report?.data || [];

  return (
    <div className="daybook-page">

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <div className="daybook-header">

        <div>
          <h1>
            Day Book
          </h1>

          <p>
            Daily receipt and payment statement
          </p>
        </div>

        <div className="daybook-fy-box">

          <span>
            Active Financial Year
          </span>

          <strong>
            {financialYear?.FYear ||
              "Not Selected"}
          </strong>

          {financialYear?.FYStart &&
            financialYear?.FYEnd && (
              <small>
                {formatDate(
                  financialYear.FYStart
                )}{" "}
                -{" "}
                {formatDate(
                  financialYear.FYEnd
                )}
              </small>
            )}
        </div>

      </div>

      {/* ============================================= */}
      {/* FILTER */}
      {/* ============================================= */}

      <div className="daybook-filter">

        <div className="daybook-field">

          <label>
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            min={
              financialYear?.FYStart
                ? formatInputDate(
                    financialYear.FYStart
                  )
                : undefined
            }
            max={
              financialYear?.FYEnd
                ? formatInputDate(
                    financialYear.FYEnd
                  )
                : undefined
            }
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
          />

        </div>

        <div className="daybook-field">

          <label>
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            min={
              financialYear?.FYStart
                ? formatInputDate(
                    financialYear.FYStart
                  )
                : undefined
            }
            max={
              financialYear?.FYEnd
                ? formatInputDate(
                    financialYear.FYEnd
                  )
                : undefined
            }
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
          />

        </div>

        <div className="daybook-actions">

          <button
            className="btn-primary"
            onClick={generateReport}
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Day Book"}
          </button>

          <button
            className="btn-secondary"
            onClick={clearReport}
          >
            Clear
          </button>

          <button
            className="btn-print"
            onClick={printReport}
            disabled={!report}
          >
            🖨 Print
          </button>

        </div>

      </div>

      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {error && (
        <div className="daybook-error">
          {error}
        </div>
      )}

      {/* ============================================= */}
      {/* REPORT */}
      {/* ============================================= */}

      {report && (
        <div
          className="daybook-report"
          id="daybook-print-area"
        >

          {/* PRINT HEADER */}

          <div className="print-header">

            <div>
              <h2>
                Temple Management System
              </h2>

              <h3>
                Day Book
              </h3>
            </div>

            <div className="print-fy">

              <strong>
                Financial Year:
              </strong>{" "}
              {report.financialYear
                ?.FYear}

              <br />

              <strong>
                Period:
              </strong>{" "}
              {formatDate(
                report.period?.fromDate
              )}{" "}
              -{" "}
              {formatDate(
                report.period?.toDate
              )}

            </div>

          </div>

          {/* SUMMARY */}

          <div className="daybook-summary">

            <div className="summary-card opening">

              <span>
                Opening Balance
              </span>

              <strong>
                ₹{" "}
                {money(
                  summary.openingBalance
                )}
              </strong>

            </div>

            <div className="summary-card receipt">

              <span>
                Receipt Amount
              </span>

              <strong>
                ₹{" "}
                {money(
                  summary.totalReceipt
                )}
              </strong>

            </div>

            <div className="summary-card payment">

              <span>
                Payment Amount
              </span>

              <strong>
                ₹{" "}
                {money(
                  summary.totalPayment
                )}
              </strong>

            </div>

            <div className="summary-card closing">

              <span>
                Closing Balance
              </span>

              <strong>
                ₹{" "}
                {money(
                  summary.closingBalance
                )}
              </strong>

            </div>

          </div>

          {/* NET MOVEMENT */}

          <div className="net-movement">

            <div>
              <span>
                Net Movement
              </span>

              <strong>
                ₹{" "}
                {money(
                  summary.netMovement
                )}
              </strong>
            </div>

            <div>
              <span>
                Transactions
              </span>

              <strong>
                {summary.transactionCount}
              </strong>
            </div>

          </div>

          {/* TABLE */}

          <div className="daybook-table-wrapper">

            <table className="daybook-table">

              <thead>
                <tr>
                  <th>
                    S.No
                  </th>

                  <th>
                    Date
                  </th>

                  <th className="amount">
                    Opening Balance
                  </th>

                  <th className="amount receipt-col">
                    Receipt
                  </th>

                  <th className="amount payment-col">
                    Payment
                  </th>

                  <th className="amount closing-col">
                    Closing Balance
                  </th>

                  <th>
                    Transactions
                  </th>
                </tr>
              </thead>

              <tbody>

                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="no-data"
                    >
                      No transactions found
                      for the selected period.
                    </td>
                  </tr>
                ) : (
                  rows.map(
                    (row, index) => (
                      <tr
                        key={
                          row.date ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {formatDate(
                            row.date
                          )}
                        </td>

                        <td className="amount">
                          ₹{" "}
                          {money(
                            row.openingBalance
                          )}
                        </td>

                        <td className="amount receipt-col">
                          {Number(
                            row.receiptAmount
                          ) > 0
                            ? `₹ ${money(
                                row.receiptAmount
                              )}`
                            : "-"}
                        </td>

                        <td className="amount payment-col">
                          {Number(
                            row.paymentAmount
                          ) > 0
                            ? `₹ ${money(
                                row.paymentAmount
                              )}`
                            : "-"}
                        </td>

                        <td className="amount closing-col">
                          ₹{" "}
                          {money(
                            row.closingBalance
                          )}
                        </td>

                        <td>
                          <span className="transaction-count">
                            {row.transactionCount}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

              {rows.length > 0 && (
                <tfoot>

                  <tr>

                    <td
                      colSpan="2"
                    >
                      Total
                    </td>

                    <td className="amount">
                      -
                    </td>

                    <td className="amount">
                      ₹{" "}
                      {money(
                        summary.totalReceipt
                      )}
                    </td>

                    <td className="amount">
                      ₹{" "}
                      {money(
                        summary.totalPayment
                      )}
                    </td>

                    <td className="amount">
                      ₹{" "}
                      {money(
                        summary.closingBalance
                      )}
                    </td>

                    <td>
                      {summary.transactionCount}
                    </td>

                  </tr>

                </tfoot>
              )}

            </table>

          </div>

          {/* FORMULA */}

          <div className="daybook-formula">

            <strong>
              Closing Balance =
            </strong>{" "}
            Opening Balance + Receipt -
            Payment

          </div>

          {/* PRINT FOOTER */}

          <div className="print-footer">

            <span>
              Printed on:{" "}
              {new Date().toLocaleString(
                "en-IN"
              )}
            </span>

            <span>
              Day Book
            </span>

          </div>

        </div>
      )}

    </div>
  );
}