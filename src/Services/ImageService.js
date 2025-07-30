import axios from 'axios';

const API_URL = 'http://43.230.64.37:8000/upload/';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);        // ✅ required
  formData.append('key', 'images');     // ✅ required

  try {
    const response = await axios.post(API_URL, formData);

    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    throw error;
  }
};
