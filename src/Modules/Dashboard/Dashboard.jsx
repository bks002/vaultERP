import { useSelector } from "react-redux";

const Dashboard = () => {
  const userName = useSelector((state) => state.user.userName);
  return <h1>Welcome Back {userName}!</h1>;
};

export default Dashboard;