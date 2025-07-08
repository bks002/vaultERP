// src/services/userService.js

const API_BASE = 'https://your-api-url/api/Users';

export const getAllUsers = async () => {
    const response = await fetch(`${API_BASE}/GetAll`);
    return await response.json();
};

export const createUser = async (data) => {
    const response = await fetch(`${API_BASE}/Create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
};
