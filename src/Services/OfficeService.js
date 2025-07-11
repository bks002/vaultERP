// src/services/officeService.js

const API_BASE = 'https://admin.urest.in:8089/api/Office';
//const API_BASE = 'https://localhost:7093/api/Office'; // Replace with your actual base URL


export const getAllOffices = async () => {
    const response = await fetch(`${API_BASE}`, {withCredentials: true});
    if (!response.ok) throw new Error('Failed to fetch offices');
    return await response.json();
};

export const createOffice = async (data) => {
    const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create office');
    return await response.json();
};

export const updateOffice = async (id, data) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update office');
    return await response.json();
};

export const deleteOffice = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete office');
    return await response.json();
};
