import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/assetservice/AssetServiceRecord/";
//const API_BASE="https://localhost:7093/api/assetservice/AssetServiceRecord/"

export const getServiceHistory = async (assetId) => {
    try {
        const response = await axios.get(`${API_BASE}GetServiceHistory?assetId=${assetId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assets');
    }
};

export const saveServiceRecord = async (formData) => {
    const response = await axios.post(`${API_BASE}SaveServiceRecord`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const approveOrRejectServiceRecord = async (data) => {
  const res = await axios.post(`${API_BASE}ApproveOrReject`, data);
  return res.data;
};