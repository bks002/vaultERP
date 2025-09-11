// src/services/leaveService.js
import axios from "axios";

const BASE_URL = "https://admin.urest.in:8089/api/EmployeeLeave";

export const getLeaveBalancesByOffice = async (officeId) => {
  const res = await axios.get(`${BASE_URL}/office/${officeId}`,{withCredentials:false});
  return res.data;
};

export const createLeaveBalance = async (data) => {
  const res = await axios.post(BASE_URL, data,{withCredentials:false});
  return res.data;
};

export const updateLeaveBalance = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data,{withCredentials:false});
  return res.data;
};

export const deleteLeaveBalance = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`,{withCredentials:false});
  return res.data;
};
