const API_BASE="https://admin.urest.in:8089/api/asset/AssetOps/";

export const getAssetOperation = async(assetId)=>{
    const response= await fetch(`${API_BASE}operations-by-asset?assetId=${assetId}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return await response.json();
};

export const OperationMapping = async ({ assetId, operationIds, updatedBy }) => {
  try {
    const response = await fetch(`${API_BASE}map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assetId,
        operationIds,
        updatedBy
      })
    });

    // Check for HTTP errors (non-2xx responses)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server returned ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    throw new Error(error.message || 'Failed to map operations');
  }
};