import axios from "axios";
const API_BASE ="https://admin.urest.in:8089/api/work_order/WorkOrderMaster";
export const getWorkOrders = async (officeId) => {
  try {
    const response = await axios.get(`${API_BASE}/office/${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching work order masters:", error);
    throw error;
  }
}

export const getProductsByWorkOrderNo = async (workOrderNo) => {
  try {
    const response = await axios.get(`${API_BASE}/${workOrderNo}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products by work order no:", error);
    throw error;
  }
};

export const createWorkOrder = async (WorkOrderData) => {
  try {
    const response = await axios.post(API_BASE, WorkOrderData);
    return response.data;
  } catch (error) {
    console.error("Error creating work order master:", error);
    throw error;
  }
}
export const updateWorkOrder = async (WorkOrderId, WorkOrderData) => {
  try {
    const response = await axios.put(`${API_BASE}/${WorkOrderId}`, WorkOrderData);
    return response.data;
  } catch (error) {
    console.error("Error updating work order master:", error);
    throw error;
  }
}
export const deleteWorkOrder = async (WorkOrderId, officeId) => {
  try {
    const response = await axios.delete(`${API_BASE}/${WorkOrderId}/office/${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting work order master:", error);
    throw error;
  }
}