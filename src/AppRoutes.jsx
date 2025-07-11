import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Modules/Dashboard/Dashboard.jsx";

import OfficeMaster from "./Modules/OfficeMaster/OfficeMaster.jsx";
import EmployeeMaster from "./Modules/Employee/EmployeeMaster.jsx";
import ItemMaster from "./Modules/Inventory/Item.jsx";
import Category from "./Modules/Inventory/Category.jsx";
import Vendor from "./Modules/Inventory/Vendor.jsx";
import RateCard from "./Modules/Inventory/RateCard.jsx";
import PurchaseOrder from "./Modules/Inventory/PurchaseOrder.jsx";
import AssetTypeMaster from "./Modules/Asset Management/AssetTypeMaster.jsx";
import AssetMaster from "./Modules/Asset Management/AssetMaster.jsx";
import AssetOperationMaster from "./Modules/Asset Management/AssetOperationMaster.jsx";
import SlotsSignIn from "./Components/login & signup/login.jsx";
import AuthWrapper from "./AuthWrapper";
import AddNewUser from "./Modules/User Registration/AddNewUser.jsx";  

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SlotsSignIn />} />

      <Route path="/dashboard" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
      <Route path="/office" element={<AuthWrapper><OfficeMaster /></AuthWrapper>} />
      <Route path="/employee" element={<AuthWrapper><EmployeeMaster /></AuthWrapper>} />
      <Route path="/inventory/item" element={<AuthWrapper><ItemMaster /></AuthWrapper>} />
      <Route path="/inventory/Category" element={<AuthWrapper><Category /></AuthWrapper>} />
      <Route path="/inventory/Vendor" element={<AuthWrapper><Vendor /></AuthWrapper>} />
      <Route path="/inventory/RateCard" element={<AuthWrapper><RateCard /></AuthWrapper>} />
      <Route path="/inventory/PO" element={<AuthWrapper><PurchaseOrder /></AuthWrapper>} />
      <Route path="/Asset/AssetType" element={<AuthWrapper><AssetTypeMaster /></AuthWrapper>} />
      <Route path="/Asset/AssetMaster" element={<AuthWrapper><AssetMaster /></AuthWrapper>} />
      <Route path="/Asset/AssetOperation" element={<AuthWrapper><AssetOperationMaster /></AuthWrapper>} />
      <Route path="/AddUser/AddNewUser" element={<AuthWrapper><AddNewUser /></AuthWrapper>} />
      
      {/* Redirect to dashboard if no match */}
    </Routes>
  );
}

export default AppRoutes;
