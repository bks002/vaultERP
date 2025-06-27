import React, { useState } from "react";
import PrimarySearchAppBar from "./Components/navBar/NavBar.jsx";
import MiniDrawer from "./Components/drawer/Drawer.jsx";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes.jsx";
import store from "./Redux/store.js";
import { Provider } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";

function App() {
    const [openDrawer, setOpenDrawer] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // True if screen is mobile-sized

    const handleDrawer = (val) => {
        setOpenDrawer(val);
    };

    return (
        <Provider store={store}>
            <BrowserRouter>
                <PrimarySearchAppBar drawer={openDrawer} handleDrawer={handleDrawer} />
                <MiniDrawer
                    drawer={openDrawer}
                    handleDrawer={handleDrawer}
                    variant={isMobile ? "temporary" : "permanent"} // 👈 Switch variant based on screen
                />
                <div
                    style={{
                        marginLeft: isMobile ? 0 : openDrawer ? 240 : 56, // 👈 Space adjusts for desktop only
                        minHeight: "100vh",
                        width: "100vw",
                        maxWidth: openDrawer?"81vw":"94vw",
                        transition: "margin-left 0.3s",
                        boxSizing: "border-box",
                        padding: "16px",
                    }}
                >
                    <AppRoutes />
                </div>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
