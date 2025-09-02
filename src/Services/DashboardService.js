import axios from 'axios';

const API_BASE_URL = 'https://admin.urest.in:8089/api';

/**
 * Get attendance summary for a single department
 * @param {number} officeId 
 * @param {string} monthYear - format 'YYYY-MM'
 * @param {string} department 
 * @returns {Promise<object>}
 */
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

/**
 * Get attendance summary for multiple departments
 * @param {number} officeId 
 * @param {string} monthYear - format 'YYYY-MM'
 * @param {string[]} departments 
 * @returns {Promise<object>} - { departmentName: chartData }
 */
export const getAttendanceSummaryForDepartments = async (officeId, monthYear, departments) => {
  const results = {};
  for (const dept of departments) {
    const data = await getAttendanceSummary(officeId, monthYear, dept);
    console.log(`Data for ${dept}:`, data);
    if (data) {
      results[dept] = [
        { name: 'Present', value: data.presentCount, color: '#279a83' },
        { name: 'Leave', value: data.leaveCount, color: '#f1505c' },
        { name: 'Absent', value: data.absentCount, color: '#f7d142' },
      ];
    }
  }
  return results;
};
