import axios from "axios";
const API_BASE ="https://admin.urest.in:8089/api/work_order/ProductMaster";
export const getProductMasters = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}/office/${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product masters:", error);
    throw error;
  }
}
export const createProductMaster = async (productMasterData) => {
  try {
    const response = await axios.post(API_BASE, productMasterData);
    return response.data;
  } catch (error) {
    console.error("Error creating product master:", error);
    throw error;
  }
}
export const updateProductMaster = async (productMasterId, productMasterData) => {
  try {
    const response = await axios.put(`${API_BASE}/${productMasterId}`, productMasterData);
    return response.data;
  } catch (error) {
    console.error("Error updating product master:", error);
    throw error;
  }
}
export const deleteProductMaster = async (productMasterId) => {
  try {
    const response = await axios.delete(`${API_BASE}/${productMasterId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product master:", error);
    throw error;
  }
}

export const getProductByID = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE}/byid${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product masters:", error);
    throw error;
  }
}