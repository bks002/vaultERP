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
          marginLeft: isMobile || isLoginPage ? 0 : openDrawer ? 240 : 56,
          minHeight: "100vh",
          width: "100vw",
          maxWidth: openDrawer ? "81vw" : "94vw",
          transition: "margin-left 0.3s",
          boxSizing: "border-box",
          padding: "16px",
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