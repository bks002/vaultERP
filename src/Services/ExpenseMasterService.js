// src/services/ExpenseMasterService.js
import axios from "axios";

const API_BASE = "https://admin.urest.in:8089/api";

export const getExpensesByOffice = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}/Expense/by-office/${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses by office:", error);
    throw error;
  }
};

// ✅ Get all Expense Types by office
export const getExpenseTypesByOffice = async (officeId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/master/ExpenseMaster/by-office/${officeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expense types:", error);
    throw error;
  }
};

// ✅ Get Subtypes by office and expenseType
export const getExpenseSubtypes = async (officeId, expenseType) => {
  try {
    const response = await axios.get(
      `${API_BASE}/master/ExpenseMaster/subtypes/${officeId}/${expenseType}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expense subtypes:", error);
    throw error;
  }
};

// ✅ Create new Expense Type (with subtypes)
export const createExpenseType = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/Expense`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating expense type:", error);
    throw error;
  }
};

// ✅ Update Expense Type (by expenseType name)
export const updateExpenseType = async (id, data) => {
  try {
        const response = await axios.put(`${API_BASE}/Expense/${id}`, data);

    return response.data;
  } catch (error) {
    console.error("Error updating expense type:", error);
    throw error;
  }
};

// // ✅ Delete Expense Type (by expenseType name)
// export const deleteExpenseType = async (id) => {
//   try {
//         const response = await axios.delete(`${API_BASE}/master/ExpenseMaster/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error deleting expense type:", error);
//     throw error;
//   }
// };

// ✅ Delete Expense Entry (by ID)
export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/Expense/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};
