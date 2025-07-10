import axios from 'axios';

const API_BASE_URL = 'https://admin.urest.in:8089/api';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Auth/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: false
    });

    return response.data; 
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }
};
