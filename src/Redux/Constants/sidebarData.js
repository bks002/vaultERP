// src/redux/constants/sidebarData.js

export const sidebarSections = [
  {
    id: "employee_management",
    title: "Employee Management",
    items: [
      { label: "Employee Master", path: "/employee" },
      { label: "Employee Shift", path: "/employeeshift" },
      { label: "Planning Sheet", path: "/dailyPlanningSheet" },
      { label: "Technical Specification", path: "/ConstructionDesignSheet" },
      { label: "Job Card", path: "/JobCard" },
      { label: "Process Chart", path: "/processchart" },
      { label: "Expense Type Master", path: "/ExpenseTypeMaster" },
      { label: "Expense Master", path: "/ExpenseMaster" },
      { label: "Expense Report", path: "/Employee/ExpenseReport" },
      { label: "Work In Process", path: "/WorkInProcess" },
    ],
  },
  {
    id: "inventory_management",
    title: "Inventory Management",
    items: [
      { label: "Category Master", path: "/Inventory/Category" },
      { label: "Item Master", path: "/Inventory/Item" },
      { label: "Vendor Master", path: "/Inventory/Vendor" },
      { label: "Rate Card", path: "/Inventory/RateCard" },
      { label: "Purchase Order", path: "/Inventory/PO" },
      { label: "Stock", path: "/inventory/Stock" },
      { label: "Item Issue", path: "/Inventory/ItemIssue" },
      { label: "Stock Register", path: "/inventory/StockRegister" },
    ],
  },
  {
    id: "asset_management",
    title: "Asset Management",
    items: [
      { label: "Asset Master", path: "/Asset/AssetMaster" },
      { label: "Asset Operation Master", path: "/Asset/AssetOperation" },
      { label: "Asset Service Record", path: "/Asset/AssetServiceRecord" },
      { label: "Asset Spare Repair", path: "/Asset/AssetSpareRepair" },
    ],
  },
  {
    id: "attendance_management",
    title: "Attendance Management",
    items: [
      { label: "Shift Master", path: "/Attendance/ShiftMaster" },
      { label: "Attendance", path: "/Attendance/Attendance" },
      { label: "Leave Master", path: "/Attendance/LeaveMaster" },
      { label: "Employee Leave", path: "/Attendance/EmployeeLeave" },
      { label: "Leave", path: "/Attendance/Leave" },
    ],
  },
  {
    id: "work_order_management",
    title: "Work Order Management",
    items: [
      { label: "Party Master", path: "/Work Order Management/PartyMaster" },
      { label: "Product Master", path: "/Work Order Management/ProductMaster" },
      { label: "Work Order", path: "/Work Order Management/WorkOrder" },
    ],
  },
];
