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
import ShiftMaster from "./Modules/Attendance Management/ShiftMaster.jsx";
import AuthWrapper from "./AuthWrapper";
import AddNewUser from "./Modules/User Registration/AddNewUser.jsx";
import DailyPlanningSheet from "./Modules/Employee/DailyPlanningSheet.jsx";
import EmployeeShift from "./Modules/Employee/EmployeeShift.jsx";
import JobCard from "./Modules/Employee/JobCard.jsx";
import PartyMaster from "./Modules/Work Order Management/PartyMaster.jsx";
import WorkOrder from "./Modules/Work Order Management/WorkOrder.jsx";

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
      <Route path="/Attendance/ShiftMaster" element={<AuthWrapper><ShiftMaster /></AuthWrapper>} />
      <Route path="/dailyPlanningSheet" element={<AuthWrapper><DailyPlanningSheet/></AuthWrapper>} />
      <Route path="/AddUser/AddNewUser" element={<AuthWrapper><AddNewUser /></AuthWrapper>} />
      <Route path="/employeeshift" element={<AuthWrapper><EmployeeShift /></AuthWrapper>} />
      <Route path="/JobCard" element={<AuthWrapper><JobCard /></AuthWrapper>} />
      <Route path="Work Order Management/PartyMaster" element={<AuthWrapper><PartyMaster /></AuthWrapper>} />
      <Route path="Work Order Management/WorkOrder" element={<AuthWrapper><WorkOrder /></AuthWrapper>} />
      
      {/* Redirect to dashboard if no match */}
    </Routes>
  );
}

export default AppRoutes;
