const API_BASE="https://admin.urest.in:8089/api/asset/AssetOps/";

export const getAssetOperation = async(assetId)=>{
    const response= await fetch(`${API_BASE}?operations-by-asset?assetId=${assetId}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return await response.json();
};
