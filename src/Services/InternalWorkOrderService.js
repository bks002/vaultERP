// src/Services/InternalWorkOrderService.js
import axios from 'axios';

const API_BASE = 'https://admin.urest.in:8089/api/work_order/InternalWorkOrder';

// Get all details for a Work Order
export const getDetails = async (woid) => {
  const response = await axios.get(`${API_BASE}/woid/${woid}`);
  return response.data;
};

// Get detail by ID
export const getDetailById = async (id) => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};

// Create a new detail
export const createDetail = async (data) => {
  const response = await axios.post(API_BASE, data);
  return response.data;
};

// Update detail
export const updateDetail = async (id, data) => {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  return response.data;
};

// Delete detail
export const deleteDetail = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};
// 🔹 Get Internal Work Orders by officeId
export const getInternalWorkOrdersByOffice = async (officeId) => {
  const response = await axios.get(`${API_BASE}/office/${officeId}`, {
    headers: {
      'accept': '*/*'
    }
  });
  return response.data;
};