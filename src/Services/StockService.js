import axios from 'axios';

const API_BASE = "https://admin.urest.in:8089/api/Stock/office";


export const getAllStock = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}?office_id=${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock:", error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch stock");
  }
};
