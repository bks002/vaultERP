import React, { useEffect, useState } from "react";

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = sessionStorage.getItem("user") || localStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        setUser(parsedUser);
        const isAuth = sessionStorage.getItem("isAuthenticated") === "true" || localStorage.getItem("isAuthenticated") === "true";

        if (!isAuth) {
            window.location.href = "/login";
        }
    }, []);

    return (
        <h1>Welcome Back {user?.username || "User"}!</h1>
    );
};

export default Dashboard;