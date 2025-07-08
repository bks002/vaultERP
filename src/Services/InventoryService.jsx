import axios from 'axios';

const API_BASE_URL = 'https://admin.urest.in:8089/api/inventory';

//const API_BASE_URL = 'https://localhost:7093/api/inventory';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

const handleApiError = (error) => {
    if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
    } else if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
    } else {
        throw new Error('An unexpected error occurred.');
    }
};
// ========== CATEGORY ==========
export const getCategories = async (officeId) => {
    try {
        const response = await api.get(`/Category?officeId=${ officeId }` );
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`/Category/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createCategory = async (category) => {
    try {
        const response = await api.post('', category);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateCategory = async (id, category) => {
    try {
        const response = await api.put(`/category/${id}`, category);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/category/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const PendingApprovalCategory= async (officeId)=>{
    try{
        const response = await api.get(`categories/pendingApproval?officeId=${officeId}`);
        return response.data;
    }
    catch(error){
        handleApiError(error);
    }
}

// ========== ITEM ==========
export const getAllItems = async (officeId) => {
    try {
        const response = await api.get('/Item', { params: { officeId } });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getItemById = async (id) => {
    try {
        const response = await api.get(`/item/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createItem = async (item) => {
    try {
        const response = await api.post('/Item', item);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateItem = async (id, item) => {
    try {
        const response = await api.put(`/Item/${id}`, item);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteItem = async (id) => {
    try {
        const response = await api.delete(`/item/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const PendingApprovalItem= async (officeId)=>{
    try{
        const response = await api.get(`items/pendingApproval?officeId=${officeId}`);
        return response.data;
    }
    catch(error){
        handleApiError(error);
    }
};

export const fetchFilteredItems = async (officeId,CategoryId) => {
    try {
        const response = await api.get(`/items?officeId=${officeId}&categoryId=${CategoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

// ========== VENDOR ==========
export const getVendors = async (officeId) => {
    try {
        const response = await api.get(`/Vendor?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getVendorById = async (id) => {
    try {
        const response = await api.get(`/Vendor/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createVendor = async (vendor) => {
    try {
        const response = await api.post('/Vendor', vendor, {
            // headers: {
            //     'Content-Type': 'multipart/form-data',
            // },
        });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateVendor = async (id, vendor) => {
    try {
        const response = await api.put(`/vendor/${id}`, vendor);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteVendor = async (id) => {
    try {
        const response = await api.delete(`/vendor/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const PendingApprovalVendor= async (officeId)=>{
    try{
        const response = await api.get(`vendors/pendingApproval?officeId=${officeId}`);
        return response.data;
    }
    catch(error){
        handleApiError(error);
    }
};

// ========== Rate Card ==========

export const getRateCard = async (officeId) => {
    try {
        const response = await api.get(`/RateCard?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const createRateCard = async (ratecard) => {
    try {
        const response = await api.post('/RateCard', ratecard);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const fetchFilteredRate = async (officeId, CategoryId, ItemId, VendorId) => {
    const params = new URLSearchParams();

    if (officeId) {
        params.append('officeId', officeId);
    }
    if (CategoryId) {
        params.append('categoryId', CategoryId);
    }
    if (ItemId) {
        params.append('itemId', ItemId);
    }
    if (VendorId) {
        params.append('vendorId', VendorId);
    }

    try {
        const response = await api.get(`RateCard?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Rate Card:', error);
    }
};


export const createPurchaseOrder = async (PurchaseOrder) => {
    try {
        const response = await api.post(`/PO/CreatePurchaseOrders`,PurchaseOrder);
        return response.data;
    } catch (error) {
        console.error('Error fetching Purchase Order:', error);
    }
};

export const getPurchaseOrder = async (officeId) => {
    try {
        const response = await api.get(`/PO/GetGroupedPurchaseOrderDetails?officeId=${officeId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Purchase Order:', error);
    }
};