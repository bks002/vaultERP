import axios from "axios";

const BASE_URL = "https://admin.urest.in:8089/api/LeaveMaster";

// ✅ Get all leave types
export const getAllLeaveTypes = async (officeId) => {
  try {
    const response = await axios.get(`${BASE_URL}/?officeId=${officeId}`, {
      headers: { accept: "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching leave types:", error);
    throw error;
  }
};

// ✅ Create new leave type
export const createLeaveType = async (leaveData) => {
  try {
    const response = await axios.post(BASE_URL, leaveData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating leave type:", error);
    throw error;
  }
};

// ✅ Update leave type
export const updateLeaveType = async (id, leaveData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, leaveData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating leave type:", error);
    throw error;
  }
};

// ✅ Delete leave type
export const deleteLeaveType = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting leave type:", error);
    throw error;
  }
};
