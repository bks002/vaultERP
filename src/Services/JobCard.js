import axios from "axios";

const API_BASE = "https://admin.urest.in:8089/api/planning/JobCard";
const JOBCARD_BY_INWO_API_BASE = "https://admin.urest.in:8089/api/planning/JobCard/by-internal-wo";
const OPERATION_BY_JOBCARD_API_BASE = "https://admin.urest.in:8089/api/planning/JobCard/operations/by-jobcard";
const CONTRUCTION_GRADE_API = "https://admin.urest.in:8089/api/planning/Contruction/by-grade";

// Get all job cards by officeId
export const getJobCards = async (officeId) => {
  try {
    const { data } = await axios.get(`${API_BASE}?officeId=${officeId}`);
    return data;
  } catch (error) {
    console.error("Error fetching job cards:", error);
    return [];
  }
};

// Create job card
export const createJobCard = async (jobCardData) => {
  try {
    const { data } = await axios.post(API_BASE, jobCardData);
    return data;
  } catch (error) {
    console.error("Error creating job card:", error);
    throw error;
  }
};

// Update job card
export const updateJobCard = async (jobCardId, jobCardData) => {
  try {
    const { data } = await axios.put(`${API_BASE}/by-id/${jobCardId}`, jobCardData);
    return data;
  } catch (error) {
    console.error("Error updating job card:", error);
    throw error;
  }
};

// Delete job card
export const deleteJobCard = async (jobCardId) => {
  try {
    const { data } = await axios.delete(`${API_BASE}/by-id/${jobCardId}`);
    return data;
  } catch (error) {
    console.error("Error deleting job card:", error);
    throw error;
  }
};

// Get job cards by Internal Work Order
export const getJobCardsByInternalWo = async (internalWo) => {
  try {
    const { data } = await axios.get(`${JOBCARD_BY_INWO_API_BASE}/${internalWo}`);
    return data; // array of IDs
  } catch (error) {
    console.error("Failed to fetch job cards by internal work order:", error);
    return [];
  }
};

// Get operations by Job Card
export const getOperationsByJobCard = async (jobCardId) => {
  try {
    const { data } = await axios.get(`${OPERATION_BY_JOBCARD_API_BASE}/${jobCardId}`);
    return data.map(({ id, name }) => ({ id, name }));
  } catch (error) {
    console.error("Failed to fetch operations:", error);
    return [];
  }
};

export const getConstructionByGrade = async (internalWoid, operationId) => {
  try {
    if (!internalWoid || !operationId) return [];
    const { data } = await axios.get(`${CONTRUCTION_GRADE_API}`, {
      params: { internalWoid, operationId }
    });
    return data;
  } catch (error) {
    console.error("Failed to get construction by grade:", error);
    return [];
  }
};
