import axios from 'axios';

const API_BASE_URL = 'https://admin.urest.in:8089/api';

// ✅ Get attendance summary for single department
export const getAttendanceSummary = async (officeId, monthYear, department) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/AttendanceSummary/status-summary`, {
      params: { officeId, monthYear, department },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${department} attendance:`, error);
    return null;
  }
};

// Attendance Summary (monthYear + department)
export const getAttendanceSummaryForDepartments = async (officeId, monthYear, department) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/AttendanceSummary/status-summary`, {
      params: {
        officeId,
        monthYear,
        department
      }
    });
    return response.data;  // 👈 ye object return karega { presentCount, absentCount, leaveCount }
  } catch (error) {
    console.error("Error fetching department attendance:", error);
    return null;
  }
};
// ✅ Fetch Service Due Summary (by date range)
export const getServiceDueSummary = async (fromDate, toDate) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/assetservice/AssetServiceRecord/GetServiceDueSummary`,
      {
        params: {
          filterType: "date",
          fromDate,
          toDate,
        },
      }
    );
    return response.data; // { summary, data }
  } catch (error) {
    console.error("Error fetching service due summary:", error);
    throw error;
  }
};

/**
 * ✅ Get Expense Report by OfficeId and Date Range
 * @param {number} officeId 
 * @param {string} startDate - format 'YYYY-MM-DD'
 * @param {string} endDate - format 'YYYY-MM-DD'
 * @returns {Promise<Array>} - [ { expenseType, expenseSubType, totalAmount } ]
 */
export const getExpenseReport = async (officeId, startDate, endDate) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/master/ExpenseMaster/report/${officeId}`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expense report:", error);
    throw error;
  }
};


// From Date - To Date Min Stock API
export const getMinStockAll = async (officeId, startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Stock/min-stock-all`, {
      params: {
        office_id: officeId,
        startDate: startDate,
        endDate: endDate,
      },
    });
    return response.data; // JSON response return karega
  } catch (error) {
    console.error("Error fetching min stock all data:", error);
    throw error;
  }
};