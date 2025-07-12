import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/attendance/Shift";

export const getAllShift = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch Shift');
    }
};

export const createShift = async (data) => {
    try {
        const response = await axios.post(API_BASE, data, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            withCredentials: false
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create shift');
    }
};

export const EditShift = async (data,shiftId) => {
    try {
        const response = await axios.put(`${API_BASE}/${shiftId}`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create shift');
    }
};

export const deleteShift = async (shiftId) => {
    try {
        const response = await axios.delete(`${API_BASE}/${shiftId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete shift');
    }
};