const API_BASE= "https://admin.urest.in:8089/api/asset/Asset";

export const getAllAssets = async(officeId)=>{
    const response= await fetch(`${API_BASE}?officeId=${officeId}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return await response.json();
}

export const createAssets = async (data) => {
    const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create assets');
    return await response.json();
};
