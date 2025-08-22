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

// ✅ Get leave balance by email
export const fetchLeaveBalance = async (email) => {
    try {
        const response = await axios.get(`${API_BASE}/leave-balance/email/${email}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leave balance');
    }
};

export const applyLeave = async (leaveData) => {
    try {
        const response = await axios.post(
            `${API_BASE}/apply-leave`,
            leaveData,
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to apply leave"
        );
    }
};


