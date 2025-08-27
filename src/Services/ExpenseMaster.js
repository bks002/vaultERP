// src/services/ExpenseMaster.js

const API_BASE = "https://admin.urest.in:8089/api/master/ExpenseMaster";
// const API_BASE = "https://localhost:7093/api/master/ExpenseMaster"; // Local if needed

// ✅ Get all Expense Types by Office
export const getExpenseTypesByOffice = async (officeId) => {
  const response = await fetch(`${API_BASE}/by-office/${officeId}`);
  if (!response.ok) throw new Error("Failed to fetch expense types");
  return await response.json();
};

export const getExpenseMasterByOffice = async (officeId) => {
  const response = await fetch(`${API_BASE}/${officeId}`);
  if (!response.ok) throw new Error("Failed to fetch expense master");
  return await response.json();
};

// ✅ Get Sub Types of a particular Expense Type
export const getExpenseSubTypes = async (officeId, expenseType) => {
  const response = await fetch(`${API_BASE}/subtypes/${officeId}/${expenseType}`);
  if (!response.ok) throw new Error("Failed to fetch expense subtypes");
  return await response.json();
};

// ✅ Create Expense Type with Sub Types
export const createExpenseType = async (data) => {
  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create expense type");
  return await response.json();
};

// ✅ Update Expense Type (by expenseType)
export const updateExpenseType = async (expenseType, data) => {
  const response = await fetch(`${API_BASE}/${expenseType}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update expense type");
  return await response.json();
};

// ✅ Delete Expense Type
export const deleteExpenseType = async (expenseType) => {
  const response = await fetch(`${API_BASE}/${expenseType}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete expense type");
  return await response.json();
};
