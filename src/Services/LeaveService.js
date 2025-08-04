import axios from 'axios';
const API_BASE ="https://localhost:7093/api/LeaveRequest/get-leaves/office/1";
export const getAllLeaves = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leaves');
    }
}
export const updateLeaveStatus = async (leaveId, status) => {
    try {
        const response = await axios.put(`${API_BASE}/${leaveId}`, { status }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update leave status');
    }
}
