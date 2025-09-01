import axios from "axios";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("images", file); // ✅ backend expects "images"

  try {
    const response = await axios.post(
      "http://194.238.18.39:8000/upload/?images", // ✅ keep ?images (backend expects it)
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
};
