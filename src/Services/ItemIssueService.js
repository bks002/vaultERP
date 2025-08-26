const BASE_URL = "https://admin.urest.in:8089/api";

// ✅ 1. Internal Work Orders by officeId
export const fetchInternalWorkOrders = async (officeId) => {
  try {
    const response = await fetch(`${BASE_URL}/work_order/InternalWorkOrder/office/${officeId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch internal work orders");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching internal work orders:", error); 
    return [];
  }
};

// ✅ 2. Job Cards by Internal Work Order
export const fetchJobCardsByInternalWo = async (internalWoId) => {
  try {
    const response = await fetch(`${BASE_URL}/planning/JobCard/by-internal-wo/${internalWoId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch job cards");
    }
    return await response.json(); // returns array of jobCardIds
  } catch (error) {
    console.error("Error fetching job cards:", error);
    return [];
  }
};

// ✅ 3. Operations by Job Card
export const fetchOperationsByJobCard = async (jobCardId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/planning/JobCard/operations/by-jobcard/${jobCardId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch operations");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching operations:", error);
    return [];
  }
};
// ✅ 4. Items by Internal Work Order Id


export const fetchItemsByInternalWoid = async (internalWoid) => {
  try {
    const response = await fetch(
      `${BASE_URL}/planning/Contruction/items-by-woid?internalWoid=${internalWoid}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch items by internal work order");
    }
    return await response.json(); // { internalWoid, itemIds: [] }
  } catch (error) {
    console.error("Error fetching items:", error);
    return { internalWoid, itemIds: [] };
  }
};

// ✅ 5. Fetch all Item Issues by officeId
export const fetchItemIssues = async (officeId) => {
  try {
    const response = await fetch(`${BASE_URL}/planning/ItemIssue?officeId=${officeId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch item issues");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching item issues:", error);
    return [];
  }
};

// ✅ 6. Create new Item Issue
export const createItemIssue = async (itemIssueData) => {
  try {
    const response = await fetch(`${BASE_URL}/planning/ItemIssue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemIssueData),
    });
    if (!response.ok) {
      throw new Error("Failed to create item issue");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating item issue:", error);
    throw error;
  }
};

// ✅ 7. Update Item Issue
export const updateItemIssue = async (id, itemIssueData) => {
  try {
    const response = await fetch(`${BASE_URL}/planning/ItemIssue/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemIssueData),
    });
    if (!response.ok) {
      throw new Error("Failed to update item issue");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating item issue:", error);
    throw error;
  }
};

// ✅ 8. Delete Item Issue
export const deleteItemIssue = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/planning/ItemIssue/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete item issue");
    }
    return true;
  } catch (error) {
    console.error("Error deleting item issue:", error);
    throw error;
  }
};
