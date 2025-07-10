import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admin.urest.in:8089/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 1. Get all operations by office
export const getAllOperation = async (officeId) => {
  try {
    const response = await api.get(`/EmpOps/operations-by-office`, {
      params: { officeId }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch operations');
  }
};

// 2. Map operations to an employee
export const OperationMapping = async ({ employeeId, operationIds, updatedBy }) => {
  try {
    const response = await api.post(`/EmpOps/map`, {
      employeeId,
      operationIds,
      updatedBy
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to map operations';
    throw new Error(message);
  }
};

// 3. Get operations mapped to a specific employee
export const getOperationbyEmployee = async (employeeId) => {
  try {
    const response = await api.get(`/EmpOps/operations-by-employee`, {
      params: { employeeId }
    });
    return response.data;
  } catch {
    throw new Error('Failed to fetch operations');
  }
};
