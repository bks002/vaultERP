import axios from "axios";

const API_BASE = "https://admin.urest.in:8089/api/planning/Contruction";
//const API_BASE = "https://localhost:7093/api/planning/Contruction";

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
export const deleteConstructionDesignSheet = async (internalWoid) => {
  try {
    const response = await axios.delete(`${API_BASE}`, {
      params: { internalWoid }, // send as query param
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting construction design sheet:", error);
    throw error;
  }
};

export const getContructionByitemoperationinwo = async (internalWoId, itemId, operationId) => {
  try {
    const response = await axios.get(`${API_BASE}/by-item?itemId=${itemId}&internalWoId=${internalWoId}&operationId=${operationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching construction by item, operation and internal WO:", error);
    throw error;
  }
};

export const getItemIdsByInternalWoid = async (internalWoid) => {
  try {
    const response = await axios.get(`${API_BASE}/items-by-woid`, {
      params: { internalWoid }
    });
    // Defensive: check response.data.itemIds is array
    if (response.data && Array.isArray(response.data.itemIds)) {
      return response.data.itemIds;
    }
    return [];
  } catch (error) {
    console.error("Error fetching item IDs by internal WO ID:", error);
    return [];
  }
};

const API_BASE_SPECIFICATION = "https://admin.urest.in:8089/api/planning";
// 🔹 Get all specifications
export const getAllSpecifications = async () => {
  try {
    const res = await axios.get(`${API_BASE_SPECIFICATION}/Specification`);
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch specifications:", err);
    return [];
  }
};

// 🔹 Create new specification
export const createSpecification = async (specificationName) => {
  try {
    const payload = {
      id: 0,
      specificationName,
      createdBy: 1,
      createdOn: new Date().toISOString(),
    };
    const res = await axios.post(`${API_BASE_SPECIFICATION}/Specification`, payload);
    console.log("✅ createSpecification Response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Failed to create specification:", err.response?.data || err.message);
    throw err;
  }
};
