// src/services/stockservice.js
import axios from "axios";

const API_BASE = "https://admin.urest.in:8089/api/Stock";

// ✅ Get all stock by office
export const getAllStock = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}/office`, {
      params: { office_id: officeId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock:", error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch stock");
  }
};

// ✅ Get stock by item
export const getStockByItem = async (itemId) => {
  try {
    const response = await axios.get(`${API_BASE}/by-item?item_id=${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock by item:", error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock by item"
    );
  }
};

// ✅ Return stock
export const returnStock = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/StockReturn`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error returning stock:", error.message);
    throw new Error(error.response?.data?.message || "Failed to return stock");
  }
};

// ✅ Add stock
export const addStock = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/addStock`, data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: false,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding stock:", error.message);
    throw new Error(error.response?.data?.message || "Failed to add stock");
  }
};
