import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { ListSubheader } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ NEW

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

// ========================
// 📁 Sidebar Section Data
// ========================
const sections = [
  {
    id: "employee_management",
    title: "Employee Management",
    links: [
      { name: "Employee Master", to: "/employee" },
      { name: "Employee Shift", to: "/employeeshift" },
      { name: "Planning Sheet", to: "/dailyPlanningSheet" },
      { name: "Technical Specification", to: "/ConstructionDesignSheet" },
      { name: "Job Card", to: "/JobCard" },
      { name: "Process Chart", to: "/processchart" },
      { name: "Expense Type Master", to: "/ExpenseTypeMaster" },
      { name: "Expense Master", to: "/ExpenseMaster" },
      { name: "Expense Report", to: "/Employee/ExpenseReport" },
      { name: "Work In Process", to: "/WorkInProcess" },
    ],
  },
  {
    id: "inventory_management",
    title: "Inventory Management",
    links: [
      { name: "Category Master", to: "/Inventory/Category" },
      { name: "Item Master", to: "/Inventory/Item" },
      { name: "Vendor Master", to: "/Inventory/Vendor" },
      { name: "Rate Card", to: "/Inventory/RateCard" },
      { name: "Purchase Order", to: "/Inventory/PO" },
      { name: "Stock", to: "/inventory/Stock" },
      { name: "Item Issue", to: "/Inventory/ItemIssue" },
      { name: "Stock Register", to: "/inventory/StockRegister" },
    ],
  },
  {
    id: "asset_management",
    title: "Asset Management",
    links: [
      { name: "Asset Master", to: "/Asset/AssetMaster" },
      { name: "Asset Operation Master", to: "/Asset/AssetOperation" },
      { name: "Asset Service Record", to: "/Asset/AssetServiceRecord" },
      { name: "Asset Spare Repair", to: "/Asset/AssetSpareRepair" },
    ],
  },
  {
    id: "attendance_management",
    title: "Attendance Management",
    links: [
      { name: "Shift Master", to: "/Attendance/ShiftMaster" },
      { name: "Attendance", to: "/Attendance/Attendance" },
      { name: "Leave Master", to: "/Attendance/LeaveMaster" },
      { name: "Employee Leave", to: "/Attendance/EmployeeLeave" },
      { name: "Leave", to: "/Attendance/Leave" },
    ],
  },
  {
    id: "work_order_management",
    title: "Work Order Management",
    links: [
      { name: "Party Master", to: "/WorkOrder/PartyMaster" },
      { name: "Product Master", to: "/WorkOrder/ProductMaster" },
      { name: "Work Order", to: "/WorkOrder/WorkOrder" },
    ],
  },
];

// ========================
// 🧭 Component
// ========================
export default function MiniDrawer({ drawer, handleDrawer }) {
  const theme = useTheme();

  // ✅ Get allowed pages from Redux
  const allowedpages = useSelector((state) => state.user.allowedpages);

  // ✅ Fallback (if empty or null)
  const employeeAccess =
    allowedpages && allowedpages.length > 0
      ? allowedpages
      : [
          "employee_management",
          "inventory_management",
          "asset_management",
          "attendance_management",
          "work_order_management",
        ];

  return (
    <Drawer
      variant="permanent"
      open={drawer}
      onMouseEnter={() => {
        if (!drawer) handleDrawer(true);
      }}
      onMouseLeave={() => {
        if (drawer) handleDrawer(false);
      }}
    >
      {/* ===== Toolbar / Drawer Toggle ===== */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        <IconButton onClick={handleDrawer}>
          {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>

      {/* ===== Dashboard ===== */}
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/dashboard">
            <ListItemIcon><InboxIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* ===== Office Master ===== */}
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/office">
            <ListItemIcon><InboxIcon /></ListItemIcon>
            <ListItemText primary="Office Master" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* ===== Dynamic Sections ===== */}
      {sections
        .filter((section) => employeeAccess.includes(section.id))
        .map((section) => (
          <React.Fragment key={section.id}>
            <List>
              {drawer && (
                <ListSubheader component="div" id={section.id}>
                  {section.title}
                </ListSubheader>
              )}
              {section.links.map((link, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemButton component={Link} to={link.to}>
                    <ListItemIcon><InboxIcon /></ListItemIcon>
                    <ListItemText primary={link.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
          </React.Fragment>
        ))}
    </Drawer>
  );
}
