const API_BASE= "https://admin.urest.in:8089/api/attendance/Shift";

export const getAllShift = async(officeId)=>{
    const response= await fetch(`${API_BASE}?officeId=${officeId}`);
    if (!response.ok) throw new Error('Failed to fetch Shift');
    return await response.json();
}