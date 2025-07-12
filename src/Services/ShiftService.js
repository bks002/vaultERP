import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/attendance/Shift";

// ✅ Get all shifts by office ID
export const getAllShift = async (officeId) => {
    const response = await fetch(`${API_BASE}?officeId=${officeId}`);
    if (!response.ok) throw new Error('Failed to fetch shifts');
    return await response.json();
};

// ✅ Create a new shift
export const createShifts = async (shiftData) => {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create shifts: ${error}`);
    }

    return await response.json();
};

// ✅ Edit shift by ID
export const editShifts = async (shiftId, data) => {
    try {
        const response = await axios.put(`${API_BASE}/${shiftId}`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to edit shift');
    }
};

// ✅ Delete shift by ID (use HTTP DELETE method)
export const deleteShifts = async (shiftId) => {
    try {
        const response = await axios.delete(`${API_BASE}/${shiftId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete shift');
    }
};
