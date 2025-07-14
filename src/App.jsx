import React, { useState } from "react";
import PrimarySearchAppBar from "./Components/navBar/NavBar.jsx";
import MiniDrawer from "./Components/drawer/Drawer.jsx";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes.jsx";
import store from "./Redux/store.js";
import { Provider } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";

function AppContent() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const handleDrawer = (val) => {
    setOpenDrawer(val);
  };

  const isLoginPage = location.pathname === "/";

  // Drawer width
  const drawerWidth = openDrawer ? 240 : 56;

  return (
    <>
      {!isLoginPage && (
        <>
          <PrimarySearchAppBar drawer={openDrawer} handleDrawer={handleDrawer} />
          <MiniDrawer
            drawer={openDrawer}
            handleDrawer={handleDrawer}
            variant={isMobile ? "temporary" : "permanent"}
          />
        </>
      )}

      <div
        style={{
          marginLeft: isLoginPage || isMobile ? 0 : drawerWidth,
          padding: isMobile ? "12px" : "16px 24px",
          transition: "margin-left 0.3s",
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <AppRoutes />
      </div>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
