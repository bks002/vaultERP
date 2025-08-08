import axios from 'axios';
const API_BASE ="https://admin.urest.in:8089/api/LeaveRequest";
export const fetchLeaves = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}/get-leaves/office/${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leaves');
    }
}
export const approveLeave = async (leaveId) => {
    try {
        const response = await axios.put(`${API_BASE}/approve-leave/${leaveId}`, {
            status: "Approved",
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve leave');
    }
};

export const rejectLeave = async (leaveId, rejectionRemark) => {
    try {
        const response = await axios.put(`${API_BASE}/reject-leave/${leaveId}`, {
            status: "Rejected",
            remarks: rejectionRemark
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to reject leave');
    }
};

