import axios from "axios";

const api = axios.create({
  baseURL: "https://admin.urest.in:8089/api",
  headers: {
    "Content-Type": "application/json",
  },
});
const API_BASE = "https://admin.urest.in:8089/api";

// 1. Get all operations by office
export const getAllOperation = async (officeId) => {
  try {
    const response = await api.get(`/EmpOps/operations-by-office`, {
      params: { officeId },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch operations");
  }
};

// 2. Map operations to an employee
export const OperationMapping = async ({
  employeeId,
  operationIds,
  updatedBy,
}) => {
  try {
    const response = await api.post(`/EmpOps/map`, {
      employeeId,
      operationIds,
      updatedBy,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to map operations";
    throw new Error(message);
  }
};

// 3. Get operations mapped to a specific employee
export const getOperationbyEmployee = async (employeeId) => {
  try {
    const response = await api.get(`/EmpOps/operations-by-employee`, {
      params: { employeeId },
    });
    return response.data;
  } catch {
    throw new Error("Failed to fetch operations");
  }
};

//4. Post new operation
export const createOperation = async (operationData) => {
  try {
    const response = await api.post(`/EmpOps/create`, operationData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to create operation";
    throw new Error(message);
  }
};

export const getEmployeesByOperation = async (operationId) => {
  try {

    const response = await axios.get(`${API_BASE}/EmpOps/employees-by-operation`, {
      params: { operationId },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch employees by operation:", error);
    return [];
  }
};

export const getEmployeeById = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE}/Employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch employee by ID:", error);
    return null;
  }
};
