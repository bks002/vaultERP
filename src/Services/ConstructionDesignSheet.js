import axios from "axios";

const API_BASE = "https://admin.urest.in:8089/api/planning/Contruction";

// Get all Construction Design Sheets for office
export const getConstructionDesignSheets = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}?officeId=${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching construction design sheets:", error);
    throw error;
  }
};

// Create new Construction Design Sheet (accepts array payload)
export const createConstruction = async (constructionData) => {
  try {
    const response = await axios.post(API_BASE, constructionData);
    return response.data;
  } catch (error) {
    console.error("Error creating construction data:", error);
    throw error;
  }
};

// Update existing Construction Design Sheet
export const updateConstructionDesignSheet = async (id, constructionData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, constructionData);
    return response.data;
  } catch (error) {
    console.error("Error updating construction design sheet:", error);
    throw error;
  }
};

// Delete a Construction Design Sheet
export const deleteConstructionDesignSheet = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting construction design sheet:", error);
    throw error;
  }
};


