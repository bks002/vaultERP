import React from "react";
import {Route, Routes} from "react-router-dom";
import OfficeMaster from "./Modules/OfficeMaster/OfficeMaster.jsx";
import AssetMaster from "./Modules/Asset/AssetMaster.jsx";
import ItemMaster from "./Modules/Inventory/Item.jsx";
import Dashboard from "./Modules/Dashboard/Dashboard.jsx";
import Category from "./Modules/Inventory/Category.jsx";
import Vendor from "./Modules/Inventory/Vendor.jsx";
import RateCard from "./Modules/Inventory/RateCard.jsx";
import PurchaseOrder from "./Modules/Inventory/PurchaseOrder.jsx";
// Import all route components here

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/office" element={<OfficeMaster />} />
            <Route path="/asset" element={<AssetMaster />} />
            <Route path="/inventory/item" element={<ItemMaster />} />
            <Route path="/inventory/Category" element={<Category />} />
            <Route path="/inventory/Vendor" element={<Vendor/>} />
            <Route path="/inventory/RateCard" element={<RateCard/>} />
            <Route path="/inventory/PO" element={<PurchaseOrder/>} />
            {/* Add more routes here */}
        </Routes>
    );
}

export default AppRoutes;
