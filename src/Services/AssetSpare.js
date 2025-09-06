import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/asset/AssetSpare";
//const API_BASE= "https://localhost:7093/api/asset/Asset";

export const getAssetSpares = async (assetId) => {
  const response = await axios.get(`${API_BASE}/asset/${assetId}`);
  return response.data;
};

export const addAssetSpare = async (assetspare) => {
  const response = await axios.post(`${API_BASE}`, assetspare);
  return response.data;
};

export const deleteAssetSpare = async (spareId) => {
  const response = await axios.delete(`${API_BASE}/${spareId}`);
  return response.data;
};

export const updateAssetSpare = async (spareId, assetspare) => {
  const response = await axios.put(`${API_BASE}/${spareId}`, assetspare);
  return response.data;
};

export const getAllAssetSparesByName = async (sparename) => {
  const response = await axios.get(`${API_BASE}/name/${sparename}`);
  return response.data;
}