import React from "react";
import {Route, Routes} from "react-router-dom";
import OfficeMaster from "./Modules/OfficeMaster/OfficeMaster.jsx";
import AssetMaster from "./Modules/Asset/AssetMaster.jsx";
import ItemMaster from "./Modules/Inventory/Item.jsx";
import Dashboard from "./Modules/Dashboard/Dashboard.jsx";
// Import all route components here

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/office" element={<OfficeMaster />} />
            <Route path="/asset" element={<AssetMaster />} />
            <Route path="/inventory" element={<ItemMaster />} />
            {/* Add more routes here */}
        </Routes>
    );
}

export default AppRoutes;
