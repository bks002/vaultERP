import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/asset/Asset";

export const getAllAssets = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}`, {
            params: { officeId }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assets');
    }
};

export const createAssets = async (data) => {
    try {
        const response = await axios.post(API_BASE, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create assets');
    }
};

export const EditAssets = async (data,assetId) => {
    try {
        const response = await axios.put(`${API_BASE}/${assetId}`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create assets');
    }
};

export const deleteAsset = async (assetId) => {
    try {
        const response = await axios.delete(`${API_BASE}/${assetId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete asset');
    }
};