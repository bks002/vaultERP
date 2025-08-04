import axios from 'axios';
const API_BASE ="https://admin.urest.in:8089/api/LeaveRequest/get-leaves/office/";
export const fetchLeaves = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leaves');
    }
}
export const approveLeave = async (leaveId, isApproved) => {
    try {
        const response = await axios.put(`https://admin.urest.in:8089/api/LeaveRequest/approve-leave/${leaveId}`, {
            isApproved,
            isRejected: !isApproved
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve leave');
    }
};

