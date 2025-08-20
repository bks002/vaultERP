import axios from "axios";
const API_BASE = "https://admin.urest.in:8089/api/planning/JobCard";
export const getJobCards = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}?officeId=${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job cards:", error);
    throw error;
  }
}
export const createJobCard = async (jobCardData) => {
  try {
    const response = await axios.post(API_BASE, jobCardData);
    return response.data;
  } catch (error) {
    console.error("Error creating job card:", error);
    throw error;
  }
}
export const updateJobCard = async (jobCardId, jobCardData) => {
  try {
    const response = await axios.put(`${API_BASE}/by-id/${jobCardId}`, jobCardData);
    return response.data;
  } catch (error) {
    console.error("Error updating job card:", error);
    throw error;
  }
}
export const deleteJobCard = async (jobCardId) => {
  try {
    const response = await axios.delete(`${API_BASE}/by-id/${jobCardId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting job card:", error);
    throw error;
  }
}