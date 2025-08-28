import axios from 'axios';

export const getAttendanceData = async (officeId, yearMonth) => {
    try {
        const response = await axios.get(
            `https://admin.urest.in:8089/api/AttendanceSummary/log?officeId=${officeId}&monthYear=${yearMonth}`,
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return [];
    }
};

const API_BASE_URL = 'https://admin.urest.in:8089/api/ManualAttendance';

export const addManualAttendance = async (attendanceData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}`,
            attendanceData,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }, { withCredentials: false }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding manual attendance:', error.response?.data || error);
        throw error;
    }
};

export const getManualAttendance = async (officeId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/office/${officeId}`
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching manual attendance data:', error);
        return [];
    }
};

export const updateManualAttendance = async (attendanceData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/${attendanceData.id}`,
            attendanceData,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }, { withCredentials: false }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating manual attendance:', error.response?.data || error);
        throw error;
    }
};
