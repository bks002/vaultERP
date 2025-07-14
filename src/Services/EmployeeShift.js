import axios from 'axios';

const API_BASE='https://admin.urest.in:8089/api/attendance/EmpShift';

export const getAllEmployeeShift = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}/by-office?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assets');
    }
};

export const createEmployeeShift = async (data) => {
    try {
        const response = await axios.post(API_BASE, data, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            withCredentials: false
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create employee shift');
    }
};

export const updateEmployeeShift = async (employeeId, shiftId, data) => {
    try {
        const response = await axios.put(`${API_BASE}/${employeeId}/${shiftId}`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to Update Employee Shift');
    }
};

export const deleteEmployeeShift = async (employeeId,shiftId) => {
    try {
        const response = await axios.delete(`${API_BASE}/${employeeId}/${shiftId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete employee shift');
    }
};