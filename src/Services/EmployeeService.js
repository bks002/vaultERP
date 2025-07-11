// src/services/employeeService.js

const API_BASE = 'https://admin.urest.in:8089/api/Employee';
//const API_BASE = 'https://localhost:7093/api/Employee'; // Use your actual base URL


export const getAllEmployees = async (officeId) => {
    const response = await fetch(`${API_BASE}?officeId=${officeId}`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return await response.json();
};

export const createEmployee = async (data) => {
    const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return await response.json();
};

export const updateEmployee = async (id, data) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return await response.json();
};

export const deleteEmployee = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete employee');
    return await response.json();
};

export const getEmployeeById = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch employee details');
    return await response.json();
};
