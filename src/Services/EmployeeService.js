// src/services/employeeService.js
const API_BASE = 'https://admin.urest.in:8089/api/Employee';

// 🔹 Get all employees by officeId
export const getAllEmployees = async (officeId) => {
    const response = await fetch(`${API_BASE}/byOffice/${officeId}`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return await response.json();
};

// 🔹 Create employee (multipart/form-data)
export const createEmployee = async (data) => {
  const formData = new FormData();

  // Primitive fields
  Object.keys(data).forEach((key) => {
    if (
      data[key] !== undefined &&
      data[key] !== null &&
      key !== "bankDetails" &&
      key !== "WorkHistory"
    ) {
      formData.append(key, data[key]);
    }
  });

  // Bank Details (array of objects)
  if (data.bankDetails && Array.isArray(data.bankDetails)) {
    data.bankDetails.forEach((bank, index) => {
      Object.keys(bank).forEach((field) => {
        formData.append(`bankDetails[${index}][${field}]`, bank[field]);
      });
    });
  }

  // Work History (array of objects)
  if (data.WorkHistory && Array.isArray(data.WorkHistory)) {
    data.WorkHistory.forEach((work, index) => {
      Object.keys(work).forEach((field) => {
        formData.append(`WorkHistory[${index}][${field}]`, work[field]);
      });
    });
  }

  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    // ❌ Do NOT set Content-Type → Browser will set correct multipart boundary
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create employee: ${errorText}`);
  }

  return await response.json();
};


// 🔹 Update employee (PUT - JSON payload or multipart if needed)
export const updateEmployee = async (id, data) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update employee");
  return await response.json();
};

// 🔹 Delete employee
export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete employee");
  return await response.json();
};

// 🔹 Get employee by ID
export const getEmployeeById = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch employee details");
  return await response.json();
};

// 🔹 Reset employee password
export const resetEmployeePassword = async (email) => {
  const response = await fetch(
    `https://admin.urest.in:8089/api/User/reset-password`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );
  if (!response.ok) throw new Error("Failed to reset password");
  return await response.json();
};
