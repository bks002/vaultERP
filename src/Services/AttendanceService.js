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