// src/Services/HolidayService.js
export const getHolidayData = async (year, month) => {
    try {
        const response = await fetch(`https://admin.urest.in:8089/api/Holiday/filter?year=${year}&month=${String(month).padStart(2, '0')}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching holiday data:", error);
        return [];
    }
};
