import React, {useState} from "react";
import PrimarySearchAppBar from "./Components/navBar/NavBar.jsx";
import MiniDrawer from "./Components/drawer/Drawer.jsx";
import {BrowserRouter} from "react-router-dom";
import AppRoutes from "./AppRoutes.jsx";
import store  from "./Redux/store.js";

import {Provider} from  "react-redux";
function App() {
    const [openDrawer, setOpenDrawer] = useState(false);

    const handleDrawer = (val) => {
        setOpenDrawer(val);
    };

    return (
        <Provider store={store}>
            <BrowserRouter>
                <PrimarySearchAppBar drawer={openDrawer} handleDrawer={handleDrawer} />
                <MiniDrawer drawer={openDrawer} handleDrawer={handleDrawer} />
                <div style={{ marginLeft: open ? 240 : 0, transition: 'margin 0.3s' }}>
                    <AppRoutes />
                </div>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
