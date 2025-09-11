import axios from "axios";


export const fetchIssueData = async (officeId, date) => {
  try {
    const response = await axios.get(`https://admin.urest.in:8089/api/StockIssue/get-issued-stocks?date=${date}&officeId=${officeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching issue data:", error);
    return [];
  }
};
