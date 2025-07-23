import axios from 'axios';

//const API_URL = 'https://localhost:7093/api/planning/dailyplanningsheet';

const API_URL = 'https://admin.urest.in:8089/api/planning/dailyplanningsheet';

export const getAllPlanningByOffice = async (officeId) => {
    try {
        const res = await axios.get(`${API_URL}?officeId=${officeId}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

export const createPlanning = async (planningData) => {
    try {
        const res = await axios.post(API_URL, planningData);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

export const updatePlanning = async (id, planningData) => {
    try {
        const res = await axios.put(`${API_URL}/${id}`, planningData);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

export const deletePlanning = async (id) => {
    try {
        const res = await axios.delete(`${API_URL}/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};
