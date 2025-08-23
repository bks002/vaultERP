// src/services/leaveService.js
import axios from "axios";

const BASE_URL = "https://admin.urest.in:8089/api/EmployeeLeave";

export const getLeaveBalancesByOffice = async (officeId) => {
  const res = await axios.get(`${BASE_URL}/office/${officeId}`);
  return res.data;
};

export const createLeaveBalance = async (data) => {
  const res = await axios.post(BASE_URL, data);
  return res.data;
};

export const updateLeaveBalance = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteLeaveBalance = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};
