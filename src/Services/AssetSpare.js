import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/AssetSpare";
//const API_BASE= "https://localhost:7093/api/asset/Asset";

export const getAssetSpares = async (assetId) => {
  const response = await axios.get(`${API_BASE}/by-asset?assetId=${assetId}`);
  return response.data;
};

export const addAssetSpare = async (assetspare) => {
  const response = await axios.post(`${API_BASE}/create`, assetspare);
  return response.data;
};

export const deleteAssetSpare = async (spareId) => {
  const response = await axios.delete(`${API_BASE}/delete/${spareId}`);
  return response.data;
};
