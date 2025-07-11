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
import { Link } from "react-router-dom"
import { ListSubheader } from '@mui/material';


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

export default function MiniDrawer({ drawer, handleDrawer }) {
    const theme = useTheme();
    return (
        <Drawer variant="permanent" open={drawer} onMouseEnter={() => { !drawer && handleDrawer(true) }}
            onMouseLeave={() => { drawer && handleDrawer(false) }}>
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
            <List>
                <ListItem disablePadding>
                    <ListItemButton href="/dashboard"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton href="/office"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Office Master" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/employee" >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Employee Master" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                {drawer && (
                    <ListSubheader component="div" id="nested-list-subheader">
                        Inventory Management
                    </ListSubheader>
                )}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Inventory/Category"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Category Master" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Inventory/Item"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Item Master" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Inventory/Vendor"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Vendor Master" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Inventory/RateCard"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Rate Card" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Inventory/PO"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Purchase Order" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                {drawer && (
                    <ListSubheader component="div" id="nested-list-subheader">
                        Asset Management
                    </ListSubheader>
                )}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Asset/AssetMaster"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Asset Master" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Asset/AssetOperation"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Asset Operation Master" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Asset/AssetType"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Asset Type Master" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                {drawer && (
                    <ListSubheader component="div" id="nested-list-subheader">
                        Shift Management
                    </ListSubheader>
                )}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/Shift/ShiftMaster"  >
                        <ListItemIcon><InboxIcon /></ListItemIcon>
                        <ListItemText primary="Shift Master" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}
