import axios from "axios";
const API_BASE = "https://admin.urest.in:8089/api/workOrder/PartyMaster";
export const getPartyMasters = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}/office/${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching party masters:", error);
    throw error;
  }
}
export const createPartyMaster = async (partyMasterData) => {
  try {
    const response = await axios.post(API_BASE, partyMasterData);
    return response.data;
  } catch (error) {
    console.error("Error creating party master:", error);
    throw error;
  }
}
export const updatePartyMaster = async (partyMasterId, partyMasterData) => {
  try {
    const response = await axios.put(`${API_BASE}/${partyMasterId}`, partyMasterData);
    return response.data;
  } catch (error) {
    console.error("Error updating party master:", error);
    throw error;
  }
}
export const deletePartyMaster = async (partyMasterId) => {
  try {
    const response = await axios.delete(`${API_BASE}/${partyMasterId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting party master:", error);
    throw error;
  }
}
 