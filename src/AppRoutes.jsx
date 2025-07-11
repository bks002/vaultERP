import React from "react";
import { Route, Routes } from "react-router-dom";
import OfficeMaster from "./Modules/OfficeMaster/OfficeMaster.jsx";

import ItemMaster from "./Modules/Inventory/Item.jsx";
import Dashboard from "./Modules/Dashboard/Dashboard.jsx";
import Category from "./Modules/Inventory/Category.jsx";
import Vendor from "./Modules/Inventory/Vendor.jsx";
import RateCard from "./Modules/Inventory/RateCard.jsx";
import PurchaseOrder from "./Modules/Inventory/PurchaseOrder.jsx";
import EmployeeMaster from "./Modules/Employee/EmployeeMaster.jsx";
import AssetTypeMaster from "./Modules/Asset Management/AssetTypeMaster.jsx";
import AssetMaster from "./Modules/Asset Management/AssetMaster.jsx";
import AssetOperationMaster from "./Modules/Asset Management/AssetOperationMaster.jsx";
import AddNewUser from "./Modules/User Registration/AddNewUser.jsx";

// Import all route components here

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/office" element={<OfficeMaster />} />
            <Route path="/employee" element={<EmployeeMaster />} />
            <Route path="/inventory/item" element={<ItemMaster />} />
            <Route path="/inventory/Category" element={<Category />} />
            <Route path="/inventory/Vendor" element={<Vendor />} />
            <Route path="/inventory/RateCard" element={<RateCard />} />
            <Route path="/inventory/PO" element={<PurchaseOrder />} />
            <Route path="/Asset/AssetType" element={<AssetTypeMaster />} />
            <Route path="/Asset/AssetMaster" element={<AssetMaster />} />
            <Route path="/Asset/AssetOperation" element={<AssetOperationMaster />} />
            <Route path="/AddUser/AddNewUser" element={<AddNewUser />} />

            
            

            {/* Add more routes here */}

        </Routes>
    );
}

export default AppRoutes;
