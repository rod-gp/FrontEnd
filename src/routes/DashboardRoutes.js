import { Routes, Route } from "react-router-dom";
import HomeDashboardComponent from "../components/HomeDashboardComponent";


const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardComponent />} /> 
    </Routes>
  );
};

export default DashboardRoutes;