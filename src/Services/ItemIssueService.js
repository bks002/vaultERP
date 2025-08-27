import axios from "axios";

const API_BASE = "https://admin.urest.in:8089/api/planning/ItemIssue";

// Get all item issues by office ID
export const getAllItemIssues = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}?officeId=${officeId}`, {
      headers: { accept: "*/*" },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch item issues:", error.message);
    return [];
  }
};

// Get operations by Job Card ID
export const getOperationsByJobCardId = async (jobCardId) => {
  try {
    const response = await axios.get(
      `https://admin.urest.in:8089/api/planning/JobCard/operations/by-jobcard/${jobCardId}`
    );
    return response.data || [];
  } catch {
    return [];
  }
};

// POST to add a new item issue
export const addItemIssue = async (itemIssueData) => {
  try {
    const response = await axios.post(`${API_BASE}`, itemIssueData);
    return response.data;
  } catch (error) {
    console.error("Failed to add item issue:", error.message);
    throw error;
  }
};

// PUT to update an existing item issue
export const updateItemIssue = async (id, itemIssueData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, itemIssueData);
    return response.data;
  } catch (error) {
    console.error("Failed to update item issue:", error.message);
    throw error;
  }
};

// DELETE item issue by id
export const deleteItemIssue = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error("Failed to delete item issue:", error.message);
    throw error;
  }
};
