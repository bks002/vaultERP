import axios from 'axios';

//const API_BASE_URL = 'https://localhost:7093/api';
const API_BASE_URL= "https://admin.urest.in:8089/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

const handleApiError = (error) => {
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    } else if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
    } else {
        throw new Error('An unexpected error occurred.');
    }
};

// ✅ Save process
export const saveProcess = async (processData) => {
    try {
        const response = await api.post('/Process/create', processData);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ✅ Get all processes grouped by office
export const getGroupedProcesses = async (officeId) => {
    try {
        const response = await api.get(`/Process/office/${officeId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ✅ Get a single process by ID
export const getProcessById = async (processId) => {
    try {
        const response = await api.get(`/Process/${processId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ✅ Update process operations
export const updateProcess = async (processId, processData) => {
    try {
        const response = await api.put(`/Process/${processId}`, processData);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ✅ Soft delete process by ID
export const deleteProcess = async (processId) => {
    try {
        const response = await api.delete(`/Process/${processId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};