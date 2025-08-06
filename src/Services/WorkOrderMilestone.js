import axios from 'axios';

const BASE_URL = 'https://admin.urest.in:8089/api/work_order/WorkOrderMilestone/';

export const getMilestones = async (woId) => {
    const response = await axios.get(`${BASE_URL}woId/${woId}`);
    return response.data;
};

export const createMilestone = async (data) => {
    return await axios.post(BASE_URL, data);
};

export const updateMilestone = async (id, data) => {
    return await axios.put(`${BASE_URL}/${id}`, data);
};

export const deleteMilestone = async (id) => {
    return await axios.delete(`${BASE_URL}/${id}`);
};
