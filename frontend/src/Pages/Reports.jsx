// import React, { useEffect, useState } from "react";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import "./Reports.css";

// const Reports = () => {
//   const { user } = useAuth();

//   // ============================================================
//   // ACTIVE FINANCIAL YEAR
//   // ============================================================

//   const financialYear = user?.FYear || "";
//   const financialYearCode = user?.FYCode || "";
//   const financialYearStart = user?.FYStart || "";
//   const financialYearEnd = user?.FYEnd || "";

//   // ============================================================
//   // DEFAULT DATE
//   // ============================================================

//   const today = new Date();

//   const formatDateForInput = (date) => {
//     if (!date) return "";

//     const d = new Date(date);

//     if (Number.isNaN(d.getTime())) return "";

//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   };

//   // ============================================================
//   // STATES
//   // ============================================================

//   const [reportType, setReportType] = useState("all");
//   const [reportView, setReportView] = useState("transaction");

//   const [period, setPeriod] = useState("year");

//   const [date, setDate] = useState(
//     formatDateForInput(today)
//   );

//   const [month, setMonth] = useState(
//     String(today.getMonth() + 1)
//   );

//   const [quarter, setQuarter] = useState("1");
//   const [halfyear, setHalfyear] = useState("1");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [report, setReport] = useState([]);

//   const [summary, setSummary] = useState({
//     totalReceipt: 0,
//     totalPayment: 0,
//     balance: 0,
//     transactionCount: 0,
//   });

//   const [reportFinancialYear, setReportFinancialYear] =
//     useState(null);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ============================================================
//   // MONTHS
//   // ============================================================

//   const months = [
//     { value: "1", label: "January" },
//     { value: "2", label: "February" },
//     { value: "3", label: "March" },
//     { value: "4", label: "April" },
//     { value: "5", label: "May" },
//     { value: "6", label: "June" },
//     { value: "7", label: "July" },
//     { value: "8", label: "August" },
//     { value: "9", label: "September" },
//     { value: "10", label: "October" },
//     { value: "11", label: "November" },
//     { value: "12", label: "December" },
//   ];

//   // ============================================================
//   // FORMAT NUMBER
//   // ============================================================

//   const formatAmount = (value) => {
//     const number = Number(value || 0);

//     return number.toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//   };

//   // ============================================================
//   // FORMAT DATE
//   // ============================================================

//   const formatDate = (value) => {
//     if (!value) return "-";

//     const d = new Date(value);

//     if (Number.isNaN(d.getTime())) return "-";

//     return d.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   // ============================================================
//   // NORMALIZE REPORT DATA
//   // ============================================================

//   const normalizeReportData = (data) => {
//     if (!Array.isArray(data)) return [];

//     return data.map((item) => ({
//       TransactionCode:
//         item.TransactionCode ??
//         item.transactionCode ??
//         item.PaymentCode ??
//         item.ReceiptCode ??
//         null,

//       TransactionNo:
//         item.TransactionNo ??
//         item.transactionNo ??
//         item.PaymentNo ??
//         item.ReceiptNo ??
//         null,

//       TransactionDate:
//         item.TransactionDate ??
//         item.transactionDate ??
//         item.PaymentDate ??
//         item.ReceiptDate ??
//         null,

//       TransactionType:
//         item.TransactionType ??
//         item.transactionType ??
//         "",

//       HeadCode:
//         item.HeadCode ??
//         item.headCode ??
//         null,

//       HeadName:
//         item.HeadName ??
//         item.headName ??
//         "",

//       PersonName:
//         item.PersonName ??
//         item.personName ??
//         item.ReceivedFrom ??
//         item["Paid By"] ??
//         "",

//       Notes:
//         item.Notes ??
//         item.notes ??
//         "",

//       Amount:
//         Number(
//           item.Amount ??
//             item.amount ??
//             item.ReceivedAmount ??
//             item.PaymentAmount ??
//             0
//         ) || 0,

//       TotalReceipt:
//         Number(item.TotalReceipt ?? 0) || 0,

//       TotalPayment:
//         Number(item.TotalPayment ?? 0) || 0,

//       Balance:
//         Number(item.Balance ?? 0) || 0,

//       TransactionCount:
//         Number(
//           item.TransactionCount ??
//             item.transactionCount ??
//             0
//         ) || 0,
//     }));
//   };

//   // ============================================================
//   // CALCULATE SUMMARY
//   // ============================================================

//   const calculateSummary = (data) => {
//     if (!Array.isArray(data)) {
//       return {
//         totalReceipt: 0,
//         totalPayment: 0,
//         balance: 0,
//         transactionCount: 0,
//       };
//     }

//     let totalReceipt = 0;
//     let totalPayment = 0;

//     data.forEach((item) => {
//       const type = String(
//         item.TransactionType ??
//           item.transactionType ??
//           ""
//       ).toLowerCase();

//       const amount =
//         Number(
//           item.Amount ??
//             item.amount ??
//             item.ReceivedAmount ??
//             item.PaymentAmount ??
//             0
//         ) || 0;

//       if (type === "receipt") {
//         totalReceipt += amount;
//       }

//       if (type === "payment") {
//         totalPayment += amount;
//       }
//     });

//     return {
//       totalReceipt,
//       totalPayment,
//       balance: totalReceipt - totalPayment,
//       transactionCount: data.length,
//     };
//   };

//   // ============================================================
//   // REPORT TITLE
//   // ============================================================

//   const getReportTitle = () => {
//     switch (period) {
//       case "date":
//         return `Date Wise Report - ${formatDate(date)}`;

//       case "month": {
//         const selectedMonth = months.find(
//           (item) => item.value === String(month)
//         );

//         return `Month Wise Report - ${
//           selectedMonth?.label || ""
//         }`;
//       }

//       case "quarter":
//         return `Quarter ${quarter} Report`;

//       case "halfyear":
//         return `Half Year ${halfyear} Report`;

//       case "year":
//         return "Financial Year Wise Report";

//       case "custom":
//         return "Custom Date Range Report";

//       default:
//         return "Financial Report";
//     }
//   };

//   // ============================================================
//   // PERIOD DESCRIPTION
//   // ============================================================

//   const getPeriodDescription = () => {
//     switch (period) {
//       case "date":
//         return date
//           ? `Date: ${formatDate(date)}`
//           : "Select date";

//       case "month": {
//         const selectedMonth = months.find(
//           (item) => item.value === String(month)
//         );

//         return `Month: ${
//           selectedMonth?.label || "-"
//         }`;
//       }

//       case "quarter":
//         return `Quarter ${quarter}: ${
//           quarter === "1"
//             ? "April - June"
//             : quarter === "2"
//             ? "July - September"
//             : quarter === "3"
//             ? "October - December"
//             : "January - March"
//         }`;

//       case "halfyear":
//         return `Half Year ${halfyear}: ${
//           halfyear === "1"
//             ? "April - September"
//             : "October - March"
//         }`;

//       case "year":
//         return `Financial Year: ${
//           financialYear || "-"
//         }`;

//       case "custom":
//         return `Range: ${
//           fromDate || "-"
//         } to ${toDate || "-"}`;

//       default:
//         return "";
//     }
//   };

//   // ============================================================
//   // LOAD REPORT
//   // ============================================================

//   const loadReport = async () => {
//     setError("");

//     if (!financialYearCode) {
//       setError(
//         "No Financial Year is selected. Please login again and select a Financial Year."
//       );
//       return;
//     }

//     // ----------------------------------------------------------
//     // VALIDATION
//     // ----------------------------------------------------------

//     if (period === "date" && !date) {
//       setError("Please select a date.");
//       return;
//     }

//     if (period === "custom") {
//       if (!fromDate || !toDate) {
//         setError(
//           "Please select both From Date and To Date."
//         );
//         return;
//       }

//       if (fromDate > toDate) {
//         setError(
//           "From Date cannot be greater than To Date."
//         );
//         return;
//       }
//     }

//     try {
//       setLoading(true);

//       // ========================================================
//       // FY IS NOT SENT FROM FRONTEND
//       // BACKEND GETS FYCode FROM JWT
//       // ========================================================

//       const params = {
//         type: reportType,
//         view: reportView,
//         period,
//       };

//       // ========================================================
//       // DATE
//       // ========================================================

//       if (period === "date") {
//         params.date = date;
//       }

//       // ========================================================
//       // MONTH
//       // ========================================================

//       if (period === "month") {
//         params.month = Number(month);
//       }

//       // ========================================================
//       // QUARTER
//       // ========================================================

//       if (period === "quarter") {
//         params.quarter = Number(quarter);
//       }

//       // ========================================================
//       // HALF YEAR
//       // ========================================================

//       if (period === "halfyear") {
//         params.halfyear = Number(halfyear);
//       }

//       // ========================================================
//       // CUSTOM RANGE
//       // ========================================================

//       if (period === "custom") {
//         params.fromDate = fromDate;
//         params.toDate = toDate;
//       }

//       // ========================================================
//       // API
//       // ========================================================

//       const response = await api.get("/reports", {
//         params,
//       });

//       const responseData = response?.data;

//       if (!responseData?.success) {
//         throw new Error(
//           responseData?.message ||
//             "Failed to load report."
//         );
//       }

//       // ========================================================
//       // REPORT DATA
//       // ========================================================

//       const rawData = Array.isArray(
//         responseData.data
//       )
//         ? responseData.data
//         : [];

//       const normalizedData =
//         normalizeReportData(rawData);

//       setReport(normalizedData);

//       // ========================================================
//       // SUMMARY
//       // ========================================================

//       if (responseData.summary) {
//         setSummary({
//           totalReceipt:
//             Number(
//               responseData.summary.totalReceipt ??
//                 0
//             ) || 0,

//           totalPayment:
//             Number(
//               responseData.summary.totalPayment ??
//                 0
//             ) || 0,

//           balance:
//             Number(
//               responseData.summary.balance ?? 0
//             ) || 0,

//           transactionCount:
//             Number(
//               responseData.summary
//                 .transactionCount ?? 0
//             ) || 0,
//         });
//       } else {
//         setSummary(
//           calculateSummary(normalizedData)
//         );
//       }

//       // ========================================================
//       // FINANCIAL YEAR FROM SERVER
//       // ========================================================

//       if (responseData.financialYear) {
//         setReportFinancialYear(
//           responseData.financialYear
//         );
//       } else {
//         setReportFinancialYear({
//           FYCode: financialYearCode,
//           FYear: financialYear,
//           FYStart: financialYearStart,
//           FYEnd: financialYearEnd,
//         });
//       }
//     } catch (err) {
//       console.error("REPORT ERROR:", err);

//       if (err?.response?.status === 401) {
//         setError(
//           "Your session has expired or is not authorized. Please login again."
//         );
//       } else if (err?.response?.status === 403) {
//         setError(
//           "You are not authorized to view this report."
//         );
//       } else {
//         setError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Failed to load report."
//         );
//       }

//       setReport([]);

//       setSummary({
//         totalReceipt: 0,
//         totalPayment: 0,
//         balance: 0,
//         transactionCount: 0,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // CLEAR REPORT
//   // ============================================================

//   const clearReport = () => {
//     setReport([]);

//     setSummary({
//       totalReceipt: 0,
//       totalPayment: 0,
//       balance: 0,
//       transactionCount: 0,
//     });

//     setError("");
//     setReportFinancialYear(null);
//   };

//   // ============================================================
//   // PRINT REPORT
//   // ============================================================

//   const handlePrint = () => {
//     if (
//       report.length === 0 &&
//       summary.transactionCount === 0
//     ) {
//       setError(
//         "Please generate a report before printing."
//       );
//       return;
//     }

//     window.print();
//   };

//   // ============================================================
//   // WHEN FILTER CHANGES
//   // ============================================================

//   useEffect(() => {
//     clearReport();

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reportType, reportView, period]);

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="reports-page">

//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="reports-header">

//         <div>
//           <h1>Reports</h1>

//           <p>
//             Temple financial reports and transaction
//             summaries
//           </p>
//         </div>

//         <div className="active-financial-year">
//           <span>Financial Year</span>

//           <strong>
//             {financialYear || "Not Selected"}
//           </strong>
//         </div>

//       </div>

//       {/* ======================================================
//           FINANCIAL YEAR INFO
//       ====================================================== */}

//       {financialYear && (
//         <div className="financial-year-info">

//           <div>
//             <strong>
//               Active Financial Year:
//             </strong>{" "}
//             {financialYear}
//           </div>

//           {financialYearStart &&
//             financialYearEnd && (
//               <div>
//                 {formatDate(financialYearStart)}
//                 {" - "}
//                 {formatDate(financialYearEnd)}
//               </div>
//             )}

//         </div>
//       )}

//       {/* ======================================================
//           FILTERS
//       ====================================================== */}

//       <div className="report-filters no-print">

//         {/* REPORT TYPE */}

//         <div className="filter-group">
//           <label>Report Type</label>

//           <select
//             value={reportType}
//             onChange={(e) =>
//               setReportType(e.target.value)
//             }
//           >
//             <option value="all">
//               All
//             </option>

//             <option value="receipt">
//               Receipt
//             </option>

//             <option value="payment">
//               Payment
//             </option>
//           </select>
//         </div>

//         {/* REPORT VIEW */}

//         <div className="filter-group">
//           <label>View</label>

//           <select
//             value={reportView}
//             onChange={(e) =>
//               setReportView(e.target.value)
//             }
//           >
//             <option value="transaction">
//               Transaction Wise
//             </option>

//             <option value="head">
//               Head Wise
//             </option>
//           </select>
//         </div>

//         {/* PERIOD */}

//         <div className="filter-group">
//           <label>Period</label>

//           <select
//             value={period}
//             onChange={(e) =>
//               setPeriod(e.target.value)
//             }
//           >
//             <option value="date">
//               Date
//             </option>

//             <option value="month">
//               Month
//             </option>

//             <option value="quarter">
//               Quarter
//             </option>

//             <option value="halfyear">
//               Half Year
//             </option>

//             <option value="year">
//               Financial Year
//             </option>

//             <option value="custom">
//               Custom Range
//             </option>
//           </select>
//         </div>

//         {/* DATE */}

//         {period === "date" && (
//           <div className="filter-group">

//             <label>Date</label>

//             <input
//               type="date"
//               value={date}
//               onChange={(e) =>
//                 setDate(e.target.value)
//               }
//             />

//           </div>
//         )}

//         {/* MONTH */}

//         {period === "month" && (
//           <div className="filter-group">

//             <label>Month</label>

//             <select
//               value={month}
//               onChange={(e) =>
//                 setMonth(e.target.value)
//               }
//             >
//               {months.map((item) => (
//                 <option
//                   key={item.value}
//                   value={item.value}
//                 >
//                   {item.label}
//                 </option>
//               ))}
//             </select>

//           </div>
//         )}

//         {/* QUARTER */}

//         {period === "quarter" && (
//           <div className="filter-group">

//             <label>Quarter</label>

//             <select
//               value={quarter}
//               onChange={(e) =>
//                 setQuarter(e.target.value)
//               }
//             >
//               <option value="1">
//                 Q1 - April to June
//               </option>

//               <option value="2">
//                 Q2 - July to September
//               </option>

//               <option value="3">
//                 Q3 - October to December
//               </option>

//               <option value="4">
//                 Q4 - January to March
//               </option>
//             </select>

//           </div>
//         )}

//         {/* HALF YEAR */}

//         {period === "halfyear" && (
//           <div className="filter-group">

//             <label>Half Year</label>

//             <select
//               value={halfyear}
//               onChange={(e) =>
//                 setHalfyear(e.target.value)
//               }
//             >
//               <option value="1">
//                 H1 - April to September
//               </option>

//               <option value="2">
//                 H2 - October to March
//               </option>
//             </select>

//           </div>
//         )}

//         {/* FINANCIAL YEAR */}

//         {period === "year" && (
//           <div className="filter-group">

//             <label>Financial Year</label>

//             <input
//               type="text"
//               value={
//                 financialYear ||
//                 "Not Selected"
//               }
//               readOnly
//             />

//           </div>
//         )}

//         {/* CUSTOM RANGE */}

//         {period === "custom" && (
//           <>
//             <div className="filter-group">

//               <label>
//                 From Date
//               </label>

//               <input
//                 type="date"
//                 value={fromDate}
//                 min={
//                   financialYearStart
//                     ? formatDateForInput(
//                         financialYearStart
//                       )
//                     : undefined
//                 }
//                 max={
//                   financialYearEnd
//                     ? formatDateForInput(
//                         financialYearEnd
//                       )
//                     : undefined
//                 }
//                 onChange={(e) =>
//                   setFromDate(
//                     e.target.value
//                   )
//                 }
//               />

//             </div>

//             <div className="filter-group">

//               <label>
//                 To Date
//               </label>

//               <input
//                 type="date"
//                 value={toDate}
//                 min={
//                   financialYearStart
//                     ? formatDateForInput(
//                         financialYearStart
//                       )
//                     : undefined
//                 }
//                 max={
//                   financialYearEnd
//                     ? formatDateForInput(
//                         financialYearEnd
//                       )
//                     : undefined
//                 }
//                 onChange={(e) =>
//                   setToDate(
//                     e.target.value
//                   )
//                 }
//               />

//             </div>
//           </>
//         )}

//         {/* ====================================================
//             BUTTONS
//         ==================================================== */}

//         <div className="filter-buttons">

//           <button
//             type="button"
//             className="btn btn-primary"
//             onClick={loadReport}
//             disabled={loading}
//           >
//             {loading
//               ? "Loading..."
//               : "Generate Report"}
//           </button>

//           <button
//             type="button"
//             className="btn btn-secondary"
//             onClick={clearReport}
//             disabled={loading}
//           >
//             Clear
//           </button>

//           {/* PRINT BUTTON */}

//           <button
//             type="button"
//             className="btn btn-print"
//             onClick={handlePrint}
//             disabled={
//               loading ||
//               (report.length === 0 &&
//                 summary.transactionCount === 0)
//             }
//           >
//             🖨 Print Report
//           </button>

//         </div>

//       </div>

//       {/* ======================================================
//           ERROR
//       ====================================================== */}

//       {error && (
//         <div className="report-error no-print">
//           {error}
//         </div>
//       )}

//       {/* ======================================================
//           PRINTABLE REPORT AREA
//       ====================================================== */}

//       <div className="print-report-area">

//         {/* PRINT HEADER */}

//         <div className="print-only print-header">

//           <h1>
//             IPL Temple
//           </h1>

//           <h2>
//             Temple Management System
//           </h2>

//           <h3>
//             {getReportTitle()}
//           </h3>

//           <div className="print-header-line">
//             Financial Year:{" "}
//             {reportFinancialYear?.FYear ||
//               financialYear ||
//               "-"}
//           </div>

//           <div className="print-header-line">
//             {getPeriodDescription()}
//           </div>

//           <div className="print-date">
//             Printed On:{" "}
//             {formatDate(new Date())}
//           </div>

//         </div>

//         {/* ====================================================
//             REPORT INFORMATION
//         ==================================================== */}

//         {(report.length > 0 ||
//           summary.transactionCount > 0) && (
//           <div className="report-information">

//             <div>
//               <strong>
//                 {getReportTitle()}
//               </strong>
//             </div>

//             <div>
//               {getPeriodDescription()}
//             </div>

//             <div>
//               FY:{" "}
//               {reportFinancialYear?.FYear ||
//                 financialYear ||
//                 "-"}
//             </div>

//           </div>
//         )}

//         {/* ====================================================
//             SUMMARY CARDS
//         ==================================================== */}

//         <div className="summary-cards">

//           {/* RECEIPT */}

//           {(reportType === "all" ||
//             reportType === "receipt") && (
//             <div className="summary-card receipt-card">

//               <div className="summary-card-title">
//                 Total Receipt
//               </div>

//               <div className="summary-card-value">
//                 ₹{" "}
//                 {formatAmount(
//                   summary.totalReceipt
//                 )}
//               </div>

//             </div>
//           )}

//           {/* PAYMENT */}

//           {(reportType === "all" ||
//             reportType === "payment") && (
//             <div className="summary-card payment-card">

//               <div className="summary-card-title">
//                 Total Payment
//               </div>

//               <div className="summary-card-value">
//                 ₹{" "}
//                 {formatAmount(
//                   summary.totalPayment
//                 )}
//               </div>

//             </div>
//           )}

//           {/* BALANCE */}

//           <div className="summary-card balance-card">

//             <div className="summary-card-title">
//               Balance
//             </div>

//             <div className="summary-card-value">
//               ₹{" "}
//               {formatAmount(
//                 summary.balance
//               )}
//             </div>

//           </div>

//           {/* TRANSACTIONS */}

//           <div className="summary-card transaction-card">

//             <div className="summary-card-title">
//               Transactions
//             </div>

//             <div className="summary-card-value">
//               {summary.transactionCount}
//             </div>

//           </div>

//         </div>

//         {/* ====================================================
//             NO DATA
//         ==================================================== */}

//         {!loading &&
//           !error &&
//           report.length === 0 &&
//           summary.transactionCount === 0 && (
//             <div className="no-report-data">

//               <h3>
//                 No Report Data
//               </h3>

//               <p>
//                 Select the required filters
//                 and click
//                 <strong>
//                   {" "}Generate Report{" "}
//                 </strong>
//                 to view the report.
//               </p>

//             </div>
//           )}

//         {/* ====================================================
//             LOADING
//         ==================================================== */}

//         {loading && (
//           <div className="report-loading no-print">
//             Loading report...
//           </div>
//         )}

//         {/* ====================================================
//             HEAD WISE REPORT
//         ==================================================== */}

//         {!loading &&
//           reportView === "head" &&
//           report.length > 0 && (
//             <div className="report-table-container">

//               <table className="report-table">

//                 <thead>
//                   <tr>
//                     <th>S.No</th>
//                     <th>Head Code</th>
//                     <th>Head Name</th>
//                     <th>Total Receipt</th>
//                     <th>Total Payment</th>
//                     <th>Balance</th>
//                     <th>Transactions</th>
//                   </tr>
//                 </thead>

//                 <tbody>

//                   {report.map(
//                     (item, index) => (
//                       <tr
//                         key={
//                           item.HeadCode ??
//                           `${item.HeadName}-${index}`
//                         }
//                       >

//                         <td>
//                           {index + 1}
//                         </td>

//                         <td>
//                           {item.HeadCode ??
//                             "-"}
//                         </td>

//                         <td>
//                           {item.HeadName ||
//                             "-"}
//                         </td>

//                         <td className="amount">
//                           ₹{" "}
//                           {formatAmount(
//                             item.TotalReceipt
//                           )}
//                         </td>

//                         <td className="amount">
//                           ₹{" "}
//                           {formatAmount(
//                             item.TotalPayment
//                           )}
//                         </td>

//                         <td className="amount">
//                           ₹{" "}
//                           {formatAmount(
//                             item.Balance
//                           )}
//                         </td>

//                         <td>
//                           {item.TransactionCount ||
//                             0}
//                         </td>

//                       </tr>
//                     )
//                   )}

//                 </tbody>

//                 <tfoot>

//                   <tr>

//                     <th colSpan="3">
//                       Grand Total
//                     </th>

//                     <th>
//                       ₹{" "}
//                       {formatAmount(
//                         summary.totalReceipt
//                       )}
//                     </th>

//                     <th>
//                       ₹{" "}
//                       {formatAmount(
//                         summary.totalPayment
//                       )}
//                     </th>

//                     <th>
//                       ₹{" "}
//                       {formatAmount(
//                         summary.balance
//                       )}
//                     </th>

//                     <th>
//                       {summary.transactionCount}
//                     </th>

//                   </tr>

//                 </tfoot>

//               </table>

//             </div>
//           )}

//         {/* ====================================================
//             TRANSACTION WISE REPORT
//         ==================================================== */}

//         {!loading &&
//           reportView === "transaction" &&
//           report.length > 0 && (
//             <div className="report-table-container">

//               <table className="report-table">

//                 <thead>
//                   <tr>
//                     <th>S.No</th>
//                     <th>Date</th>
//                     <th>Type</th>
//                     <th>No.</th>
//                     <th>Head</th>
//                     <th>Person</th>
//                     <th>Notes</th>
//                     <th>Amount</th>
//                   </tr>
//                 </thead>

//                 <tbody>

//                   {report.map(
//                     (item, index) => (
//                       <tr
//                         key={
//                           item.TransactionCode ??
//                           `${item.TransactionDate}-${index}`
//                         }
//                       >

//                         <td>
//                           {index + 1}
//                         </td>

//                         <td>
//                           {formatDate(
//                             item.TransactionDate
//                           )}
//                         </td>

//                         <td>

//                           <span
//                             className={
//                               String(
//                                 item.TransactionType
//                               ).toLowerCase() ===
//                               "receipt"
//                                 ? "transaction-receipt"
//                                 : "transaction-payment"
//                             }
//                           >
//                             {item.TransactionType ||
//                               "-"}
//                           </span>

//                         </td>

//                         <td>
//                           {item.TransactionNo ??
//                             "-"}
//                         </td>

//                         <td>
//                           {item.HeadName ||
//                             "-"}
//                         </td>

//                         <td>
//                           {item.PersonName ||
//                             "-"}
//                         </td>

//                         <td>
//                           {item.Notes ||
//                             "-"}
//                         </td>

//                         <td className="amount">
//                           ₹{" "}
//                           {formatAmount(
//                             item.Amount
//                           )}
//                         </td>

//                       </tr>
//                     )
//                   )}

//                 </tbody>

//                 <tfoot>

//                   <tr>

//                     <th colSpan="7">
//                       Total
//                     </th>

//                     <th>
//                       ₹{" "}
//                       {formatAmount(
//                         reportType ===
//                           "receipt"
//                           ? summary.totalReceipt
//                           : reportType ===
//                             "payment"
//                           ? summary.totalPayment
//                           : summary.totalReceipt +
//                             summary.totalPayment
//                       )}
//                     </th>

//                   </tr>

//                 </tfoot>

//               </table>

//             </div>
//           )}

//         {/* ====================================================
//             PRINT FOOTER
//         ==================================================== */}

//         <div className="print-only print-footer">

//           <div>
//             Financial Year:{" "}
//             {reportFinancialYear?.FYear ||
//               financialYear ||
//               "-"}
//           </div>

//           <div>
//             Total Transactions:{" "}
//             {summary.transactionCount}
//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default Reports;





import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Reports.css";

const Reports = () => {
  const { user } = useAuth();

  // ============================================================
  // ACTIVE FINANCIAL YEAR
  // ============================================================

  const financialYear = user?.FYear || "";
  const financialYearCode = user?.FYCode || "";
  const financialYearStart = user?.FYStart || "";
  const financialYearEnd = user?.FYEnd || "";

  // ============================================================
  // DEFAULT DATE
  // ============================================================

  const today = new Date();

  const formatDateForInput = (value) => {
    if (!value) return "";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // STATES
  // ============================================================

  const [reportType, setReportType] = useState("all");
  const [reportView, setReportView] = useState("transaction");
  const [period, setPeriod] = useState("year");

  const [date, setDate] = useState(
    formatDateForInput(today)
  );

  const [month, setMonth] = useState(
    String(today.getMonth() + 1)
  );

  const [quarter, setQuarter] = useState("1");
  const [halfyear, setHalfyear] = useState("1");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [report, setReport] = useState([]);

  const [summary, setSummary] = useState({
    totalReceipt: 0,
    totalPayment: 0,
    balance: 0,
    transactionCount: 0,
  });

  const [reportFinancialYear, setReportFinancialYear] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // MONTHS
  // ============================================================

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // ============================================================
  // FORMAT AMOUNT
  // ============================================================

  const formatAmount = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================================================
  // NORMALIZE REPORT DATA
  // ============================================================

  const normalizeReportData = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      TransactionCode:
        item.TransactionCode ??
        item.transactionCode ??
        item.PaymentCode ??
        item.ReceiptCode ??
        null,

      TransactionNo:
        item.TransactionNo ??
        item.transactionNo ??
        item.PaymentNo ??
        item.ReceiptNo ??
        null,

      TransactionDate:
        item.TransactionDate ??
        item.transactionDate ??
        item.PaymentDate ??
        item.ReceiptDate ??
        null,

      TransactionType:
        item.TransactionType ??
        item.transactionType ??
        "",

      HeadCode:
        item.HeadCode ??
        item.headCode ??
        null,

      HeadName:
        item.HeadName ??
        item.headName ??
        "",

      PersonName:
        item.PersonName ??
        item.personName ??
        item.ReceivedFrom ??
        item["Paid By"] ??
        "",

      Notes:
        item.Notes ??
        item.notes ??
        "",

      Amount:
        Number(
          item.Amount ??
          item.amount ??
          item.ReceivedAmount ??
          item.PaymentAmount ??
          0
        ) || 0,

      TotalReceipt:
        Number(item.TotalReceipt ?? 0) || 0,

      TotalPayment:
        Number(item.TotalPayment ?? 0) || 0,

      Balance:
        Number(item.Balance ?? 0) || 0,

      TransactionCount:
        Number(
          item.TransactionCount ??
          item.transactionCount ??
          0
        ) || 0,
    }));
  };

  // ============================================================
  // CALCULATE SUMMARY
  // ============================================================

  const calculateSummary = (data) => {
    if (!Array.isArray(data)) {
      return {
        totalReceipt: 0,
        totalPayment: 0,
        balance: 0,
        transactionCount: 0,
      };
    }

    let totalReceipt = 0;
    let totalPayment = 0;

    data.forEach((item) => {
      const type = String(
        item.TransactionType ??
        item.transactionType ??
        ""
      ).toLowerCase();

      const amount =
        Number(
          item.Amount ??
          item.amount ??
          item.ReceivedAmount ??
          item.PaymentAmount ??
          0
        ) || 0;

      if (type === "receipt") {
        totalReceipt += amount;
      }

      if (type === "payment") {
        totalPayment += amount;
      }
    });

    return {
      totalReceipt,
      totalPayment,
      balance: totalReceipt - totalPayment,
      transactionCount: data.length,
    };
  };

  // ============================================================
  // REPORT TITLE
  // ============================================================

  const getReportTitle = () => {
    switch (period) {
      case "date":
        return `Date Wise Report - ${formatDate(date)}`;

      case "month": {
        const selectedMonth = months.find(
          (item) => item.value === String(month)
        );

        return `Month Wise Report - ${
          selectedMonth?.label || ""
        }`;
      }

      case "quarter":
        return `Quarter ${quarter} Report`;

      case "halfyear":
        return `Half Year ${halfyear} Report`;

      case "year":
        return "Financial Year Wise Report";

      case "custom":
        return "Custom Date Range Report";

      default:
        return "Financial Report";
    }
  };

  // ============================================================
  // PERIOD DESCRIPTION
  // ============================================================

  const getPeriodDescription = () => {
    switch (period) {
      case "date":
        return date
          ? `Date: ${formatDate(date)}`
          : "Select date";

      case "month": {
        const selectedMonth = months.find(
          (item) => item.value === String(month)
        );

        return `Month: ${
          selectedMonth?.label || "-"
        }`;
      }

      case "quarter":
        return `Quarter ${quarter}: ${
          quarter === "1"
            ? "April - June"
            : quarter === "2"
            ? "July - September"
            : quarter === "3"
            ? "October - December"
            : "January - March"
        }`;

      case "halfyear":
        return `Half Year ${halfyear}: ${
          halfyear === "1"
            ? "April - September"
            : "October - March"
        }`;

      case "year":
        return `Financial Year: ${
          financialYear || "-"
        }`;

      case "custom":
        return `Range: ${
          fromDate || "-"
        } to ${
          toDate || "-"
        }`;

      default:
        return "";
    }
  };

  // ============================================================
  // LOAD REPORT
  // ============================================================

  const loadReport = async () => {
    setError("");

    if (!financialYearCode) {
      setError(
        "No Financial Year is selected. Please login again and select a Financial Year."
      );
      return;
    }

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (period === "date" && !date) {
      setError("Please select a date.");
      return;
    }

    if (period === "custom") {
      if (!fromDate || !toDate) {
        setError(
          "Please select both From Date and To Date."
        );
        return;
      }

      if (fromDate > toDate) {
        setError(
          "From Date cannot be greater than To Date."
        );
        return;
      }
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // FY IS TAKEN FROM JWT BY BACKEND
      // --------------------------------------------------------

      const params = {
        type: reportType,
        view: reportView,
        period,
      };

      if (period === "date") {
        params.date = date;
      }

      if (period === "month") {
        params.month = Number(month);
      }

      if (period === "quarter") {
        params.quarter = Number(quarter);
      }

      if (period === "halfyear") {
        params.halfyear = Number(halfyear);
      }

      if (period === "custom") {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      const response = await api.get(
        "/reports",
        {
          params,
        }
      );

      const responseData = response?.data;

      if (!responseData?.success) {
        throw new Error(
          responseData?.message ||
          "Failed to load report."
        );
      }

      const rawData = Array.isArray(
        responseData.data
      )
        ? responseData.data
        : [];

      const normalizedData =
        normalizeReportData(rawData);

      setReport(normalizedData);

      // --------------------------------------------------------
      // SUMMARY
      // --------------------------------------------------------

      if (responseData.summary) {
        setSummary({
          totalReceipt:
            Number(
              responseData.summary.totalReceipt ?? 0
            ) || 0,

          totalPayment:
            Number(
              responseData.summary.totalPayment ?? 0
            ) || 0,

          balance:
            Number(
              responseData.summary.balance ?? 0
            ) || 0,

          transactionCount:
            Number(
              responseData.summary.transactionCount ??
              0
            ) || 0,
        });
      } else {
        setSummary(
          calculateSummary(normalizedData)
        );
      }

      // --------------------------------------------------------
      // FINANCIAL YEAR
      // --------------------------------------------------------

      if (responseData.financialYear) {
        setReportFinancialYear(
          responseData.financialYear
        );
      } else {
        setReportFinancialYear({
          FYCode: financialYearCode,
          FYear: financialYear,
          FYStart: financialYearStart,
          FYEnd: financialYearEnd,
        });
      }
    } catch (err) {
      console.error(
        "REPORT ERROR:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        setError(
          "Your session has expired or is not authorized. Please login again."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You are not authorized to view this report."
        );
      } else {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load report."
        );
      }

      setReport([]);

      setSummary({
        totalReceipt: 0,
        totalPayment: 0,
        balance: 0,
        transactionCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CLEAR REPORT
  // ============================================================

  const clearReport = () => {
    setReport([]);

    setSummary({
      totalReceipt: 0,
      totalPayment: 0,
      balance: 0,
      transactionCount: 0,
    });

    setError("");
    setReportFinancialYear(null);
  };

  // ============================================================
  // PRINT REPORT
  // ============================================================

  const printReport = () => {
    if (
      !report.length &&
      summary.transactionCount === 0
    ) {
      setError(
        "Please generate a report before printing."
      );
      return;
    }

    window.print();
  };

  // ============================================================
  // CLEAR WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    clearReport();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reportType,
    reportView,
    period,
  ]);

  // ============================================================
  // REPORT FY
  // ============================================================

  const printFinancialYear =
    reportFinancialYear?.FYear ||
    financialYear ||
    "-";

  // ============================================================
  // REPORT TOTAL
  // ============================================================

  const transactionTotal =
    reportType === "receipt"
      ? summary.totalReceipt
      : reportType === "payment"
      ? summary.totalPayment
      : summary.totalReceipt +
        summary.totalPayment;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="reports-page">

      {/* ======================================================
          SCREEN HEADER
          ====================================================== */}

      <div className="reports-header no-print">

        <div>
          <h1>Reports</h1>

          <p>
            Temple financial reports and
            transaction summaries
          </p>
        </div>

        <div className="active-financial-year">

          <span>
            Financial Year
          </span>

          <strong>
            {financialYear ||
              "Not Selected"}
          </strong>

        </div>

      </div>


      {/* ======================================================
          SCREEN FINANCIAL YEAR
          ====================================================== */}

      {financialYear && (
        <div className="financial-year-info no-print">

          <div>
            <strong>
              Active Financial Year:
            </strong>{" "}
            {financialYear}
          </div>

          {financialYearStart &&
            financialYearEnd && (
              <div>
                {formatDate(
                  financialYearStart
                )}{" "}
                -{" "}
                {formatDate(
                  financialYearEnd
                )}
              </div>
            )}

        </div>
      )}


      {/* ======================================================
          FILTERS
          ====================================================== */}

      <div className="report-filters no-print">

        {/* REPORT TYPE */}

        <div className="filter-group">

          <label>
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(e) =>
              setReportType(
                e.target.value
              )
            }
          >
            <option value="all">
              All
            </option>

            <option value="receipt">
              Receipt
            </option>

            <option value="payment">
              Payment
            </option>
          </select>

        </div>


        {/* REPORT VIEW */}

        <div className="filter-group">

          <label>
            View
          </label>

          <select
            value={reportView}
            onChange={(e) =>
              setReportView(
                e.target.value
              )
            }
          >

            <option value="transaction">
              Transaction Wise
            </option>

            <option value="head">
              Head Wise
            </option>

          </select>

        </div>


        {/* PERIOD */}

        <div className="filter-group">

          <label>
            Period
          </label>

          <select
            value={period}
            onChange={(e) =>
              setPeriod(
                e.target.value
              )
            }
          >

            <option value="date">
              Date
            </option>

            <option value="month">
              Month
            </option>

            <option value="quarter">
              Quarter
            </option>

            <option value="halfyear">
              Half Year
            </option>

            <option value="year">
              Financial Year
            </option>

            <option value="custom">
              Custom Range
            </option>

          </select>

        </div>


        {/* DATE */}

        {period === "date" && (
          <div className="filter-group">

            <label>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />

          </div>
        )}


        {/* MONTH */}

        {period === "month" && (
          <div className="filter-group">

            <label>
              Month
            </label>

            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value
                )
              }
            >

              {months.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}

            </select>

          </div>
        )}


        {/* QUARTER */}

        {period === "quarter" && (
          <div className="filter-group">

            <label>
              Quarter
            </label>

            <select
              value={quarter}
              onChange={(e) =>
                setQuarter(
                  e.target.value
                )
              }
            >

              <option value="1">
                Q1 - April to June
              </option>

              <option value="2">
                Q2 - July to September
              </option>

              <option value="3">
                Q3 - October to December
              </option>

              <option value="4">
                Q4 - January to March
              </option>

            </select>

          </div>
        )}


        {/* HALF YEAR */}

        {period === "halfyear" && (
          <div className="filter-group">

            <label>
              Half Year
            </label>

            <select
              value={halfyear}
              onChange={(e) =>
                setHalfyear(
                  e.target.value
                )
              }
            >

              <option value="1">
                H1 - April to September
              </option>

              <option value="2">
                H2 - October to March
              </option>

            </select>

          </div>
        )}


        {/* FINANCIAL YEAR */}

        {period === "year" && (
          <div className="filter-group">

            <label>
              Financial Year
            </label>

            <input
              type="text"
              value={
                financialYear ||
                "Not Selected"
              }
              readOnly
            />

          </div>
        )}


        {/* CUSTOM RANGE */}

        {period === "custom" && (
          <>
            <div className="filter-group">

              <label>
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                min={
                  financialYearStart
                    ? formatDateForInput(
                        financialYearStart
                      )
                    : undefined
                }
                max={
                  financialYearEnd
                    ? formatDateForInput(
                        financialYearEnd
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

            <div className="filter-group">

              <label>
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                min={
                  financialYearStart
                    ? formatDateForInput(
                        financialYearStart
                      )
                    : undefined
                }
                max={
                  financialYearEnd
                    ? formatDateForInput(
                        financialYearEnd
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
          </>
        )}


        {/* BUTTONS */}

        <div className="filter-buttons">

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadReport}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Generate Report"}
          </button>


          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearReport}
            disabled={loading}
          >
            Clear
          </button>


          {/* PRINT */}

          <button
            type="button"
            className="btn btn-print"
            onClick={printReport}
            disabled={
              loading ||
              (
                report.length === 0 &&
                summary.transactionCount === 0
              )
            }
          >
            🖨 Print Report
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div className="report-error no-print">
          {error}
        </div>
      )}


      {/* ======================================================
          SCREEN REPORT INFORMATION
          ====================================================== */}

      {(report.length > 0 ||
        summary.transactionCount > 0) && (
        <div className="report-information no-print">

          <div>
            <strong>
              {getReportTitle()}
            </strong>
          </div>

          <div>
            {getPeriodDescription()}
          </div>

          <div>
            FY:{" "}
            {printFinancialYear}
          </div>

        </div>
      )}


      {/* ======================================================
          SCREEN SUMMARY CARDS
          ====================================================== */}

      <div className="summary-cards no-print">

        {(reportType === "all" ||
          reportType === "receipt") && (

          <div className="summary-card receipt-card">

            <div className="summary-card-title">
              Total Receipt
            </div>

            <div className="summary-card-value">
              ₹{" "}
              {formatAmount(
                summary.totalReceipt
              )}
            </div>

          </div>

        )}


        {(reportType === "all" ||
          reportType === "payment") && (

          <div className="summary-card payment-card">

            <div className="summary-card-title">
              Total Payment
            </div>

            <div className="summary-card-value">
              ₹{" "}
              {formatAmount(
                summary.totalPayment
              )}
            </div>

          </div>

        )}


        <div className="summary-card balance-card">

          <div className="summary-card-title">
            Balance
          </div>

          <div className="summary-card-value">
            ₹{" "}
            {formatAmount(
              summary.balance
            )}
          </div>

        </div>


        <div className="summary-card transaction-card">

          <div className="summary-card-title">
            Transactions
          </div>

          <div className="summary-card-value">
            {summary.transactionCount}
          </div>

        </div>

      </div>


      {/* ======================================================
          NO DATA
          ====================================================== */}

      {!loading &&
        !error &&
        report.length === 0 &&
        summary.transactionCount === 0 && (

          <div className="no-report-data no-print">

            <h3>
              No Report Data
            </h3>

            <p>
              Select the required filters
              and click
              <strong>
                {" "}Generate Report{" "}
              </strong>
              to view the report.
            </p>

          </div>

        )}


      {/* ======================================================
          LOADING
          ====================================================== */}

      {loading && (
        <div className="report-loading no-print">
          Loading report...
        </div>
      )}


      {/* ======================================================
          NORMAL SCREEN TABLE
          ====================================================== */}

      {!loading &&
        report.length > 0 && (

          <div className="report-table-container no-print">

            {/* HEAD WISE */}

            {reportView === "head" && (

              <table className="report-table">

                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Head Code</th>
                    <th>Head Name</th>
                    <th>Total Receipt</th>
                    <th>Total Payment</th>
                    <th>Balance</th>
                    <th>Transactions</th>
                  </tr>
                </thead>

                <tbody>

                  {report.map(
                    (item, index) => (

                      <tr
                        key={
                          item.HeadCode ??
                          `${item.HeadName}-${index}`
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {item.HeadCode ??
                            "-"}
                        </td>

                        <td>
                          {item.HeadName ||
                            "-"}
                        </td>

                        <td className="amount">
                          ₹{" "}
                          {formatAmount(
                            item.TotalReceipt
                          )}
                        </td>

                        <td className="amount">
                          ₹{" "}
                          {formatAmount(
                            item.TotalPayment
                          )}
                        </td>

                        <td className="amount">
                          ₹{" "}
                          {formatAmount(
                            item.Balance
                          )}
                        </td>

                        <td>
                          {item.TransactionCount ||
                            0}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

                <tfoot>

                  <tr>

                    <th colSpan="3">
                      Grand Total
                    </th>

                    <th>
                      ₹{" "}
                      {formatAmount(
                        summary.totalReceipt
                      )}
                    </th>

                    <th>
                      ₹{" "}
                      {formatAmount(
                        summary.totalPayment
                      )}
                    </th>

                    <th>
                      ₹{" "}
                      {formatAmount(
                        summary.balance
                      )}
                    </th>

                    <th>
                      {summary.transactionCount}
                    </th>

                  </tr>

                </tfoot>

              </table>

            )}


            {/* TRANSACTION WISE */}

            {reportView ===
              "transaction" && (

              <table className="report-table">

                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>No.</th>
                    <th>Head</th>
                    <th>Person</th>
                    <th>Notes</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>

                  {report.map(
                    (item, index) => (

                      <tr
                        key={
                          item.TransactionCode ??
                          `${item.TransactionDate}-${index}`
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {formatDate(
                            item.TransactionDate
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              String(
                                item.TransactionType
                              ).toLowerCase() ===
                              "receipt"
                                ? "transaction-receipt"
                                : "transaction-payment"
                            }
                          >
                            {item.TransactionType ||
                              "-"}
                          </span>

                        </td>

                        <td>
                          {item.TransactionNo ??
                            "-"}
                        </td>

                        <td>
                          {item.HeadName ||
                            "-"}
                        </td>

                        <td>
                          {item.PersonName ||
                            "-"}
                        </td>

                        <td>
                          {item.Notes ||
                            "-"}
                        </td>

                        <td className="amount">
                          ₹{" "}
                          {formatAmount(
                            item.Amount
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

                <tfoot>

                  <tr>

                    <th colSpan="7">
                      Total
                    </th>

                    <th>
                      ₹{" "}
                      {formatAmount(
                        transactionTotal
                      )}
                    </th>

                  </tr>

                </tfoot>

              </table>

            )}

          </div>

        )}


      {/* ======================================================
          PRINT ONLY REPORT
          ====================================================== */}

      <div className="print-report">

        {/* PRINT HEADER */}

        <div className="print-report-header">

          <h1>
            IPL Temple
          </h1>

          <h2>
            Temple Management System
          </h2>

          <h3>
            {getReportTitle()}
          </h3>

          <div className="print-report-meta">

            <div>
              Financial Year:{" "}
              {printFinancialYear}
            </div>

            <div>
              {getPeriodDescription()}
            </div>

            <div>
              Printed On:{" "}
              {formatDate(new Date())}
            </div>

          </div>

        </div>


        {/* PRINT SUMMARY */}

        <div className="print-summary">

          <div className="print-summary-card">

            <span>
              Total Receipt
            </span>

            <strong>
              ₹{" "}
              {formatAmount(
                summary.totalReceipt
              )}
            </strong>

          </div>


          <div className="print-summary-card">

            <span>
              Total Payment
            </span>

            <strong>
              ₹{" "}
              {formatAmount(
                summary.totalPayment
              )}
            </strong>

          </div>


          <div className="print-summary-card">

            <span>
              Balance
            </span>

            <strong>
              ₹{" "}
              {formatAmount(
                summary.balance
              )}
            </strong>

          </div>


          <div className="print-summary-card">

            <span>
              Transactions
            </span>

            <strong>
              {summary.transactionCount}
            </strong>

          </div>

        </div>


        {/* ====================================================
            PRINT HEAD WISE
            ==================================================== */}

        {reportView === "head" &&
          report.length > 0 && (

            <table className="print-table">

              <thead>

                <tr>
                  <th>S.No</th>
                  <th>Head Code</th>
                  <th>Head Name</th>
                  <th>Total Receipt</th>
                  <th>Total Payment</th>
                  <th>Balance</th>
                  <th>Transactions</th>
                </tr>

              </thead>

              <tbody>

                {report.map(
                  (item, index) => (

                    <tr
                      key={
                        item.HeadCode ??
                        `${item.HeadName}-${index}`
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {item.HeadCode ??
                          "-"}
                      </td>

                      <td>
                        {item.HeadName ||
                          "-"}
                      </td>

                      <td className="print-amount">
                        ₹{" "}
                        {formatAmount(
                          item.TotalReceipt
                        )}
                      </td>

                      <td className="print-amount">
                        ₹{" "}
                        {formatAmount(
                          item.TotalPayment
                        )}
                      </td>

                      <td className="print-amount">
                        ₹{" "}
                        {formatAmount(
                          item.Balance
                        )}
                      </td>

                      <td>
                        {item.TransactionCount ||
                          0}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

              <tfoot>

                <tr>

                  <th colSpan="3">
                    Grand Total
                  </th>

                  <th>
                    ₹{" "}
                    {formatAmount(
                      summary.totalReceipt
                    )}
                  </th>

                  <th>
                    ₹{" "}
                    {formatAmount(
                      summary.totalPayment
                    )}
                  </th>

                  <th>
                    ₹{" "}
                    {formatAmount(
                      summary.balance
                    )}
                  </th>

                  <th>
                    {summary.transactionCount}
                  </th>

                </tr>

              </tfoot>

            </table>

          )}


        {/* ====================================================
            PRINT TRANSACTION WISE
            ==================================================== */}

        {reportView === "transaction" &&
          report.length > 0 && (

            <table className="print-table">

              <thead>

                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>No.</th>
                  <th>Head</th>
                  <th>Person</th>
                  <th>Notes</th>
                  <th>Amount</th>
                </tr>

              </thead>

              <tbody>

                {report.map(
                  (item, index) => (

                    <tr
                      key={
                        item.TransactionCode ??
                        `${item.TransactionDate}-${index}`
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {formatDate(
                          item.TransactionDate
                        )}
                      </td>

                      <td>
                        {item.TransactionType ||
                          "-"}
                      </td>

                      <td>
                        {item.TransactionNo ??
                          "-"}
                      </td>

                      <td>
                        {item.HeadName ||
                          "-"}
                      </td>

                      <td>
                        {item.PersonName ||
                          "-"}
                      </td>

                      <td>
                        {item.Notes ||
                          "-"}
                      </td>

                      <td className="print-amount">
                        ₹{" "}
                        {formatAmount(
                          item.Amount
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

              <tfoot>

                <tr>

                  <th colSpan="7">
                    Total
                  </th>

                  <th>
                    ₹{" "}
                    {formatAmount(
                      transactionTotal
                    )}
                  </th>

                </tr>

              </tfoot>

            </table>

          )}

      </div>

    </div>
  );
};

export default Reports;