import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/asset/Asset";
//const API_BASE= "https://localhost:7093/api/asset/Asset";

export const getAssetDetails = async (assetId) => {
  try {
    const response = await axios.get(`${API_BASE}/GetCheckOutRecordsByAsset?assetId=${assetId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch asset details');
  }
};

export const getAssetsByIds = async (assetIds) => {
  try {
    const response = await axios.get(`${API_BASE}/${assetIds}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch assets');
  }
}

export const getAllAssets = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assets');
    }
};

export const createAssets = async (data) => {
    try {
        const response = await axios.post(API_BASE, data, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            withCredentials: false
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

export const getServiceDates = async (officeId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/GetAssets?officeId=${officeId}`);
    return data;
  } catch (error) {
    console.error("Error fetching service dates:", error);
    throw error;
  }
};

export const getAllAssetCheckinout = async (officeId) => {
    try {
        const response = await axios.get(`${API_BASE}/GetAssetCheckOutData?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assets');
    }
};

export const checkoutAsset = async ( payload) => {
  try {
    const res = await axios.post(`${API_BASE}/ManageCheckOut`, payload); // change to your actual endpoint
    return res.data;
  } catch (err) {
    console.error("Error checking out asset:", err);
    throw err;
  }
};

export const checkinAsset = async (payload) => {
  try {
    const res = await axios.put(`${API_BASE}/ManageCheckIn`, payload);
    return res.data;
  } catch (err) {
    console.error("Error checking in asset:", err);
    throw err;
  }
};
