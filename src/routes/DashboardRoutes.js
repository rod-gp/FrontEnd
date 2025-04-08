import { Routes, Route } from "react-router-dom";
import HomeDashboardComponent from "../components/DashboardComponent";
import AttritionComponent from "../components/AttritionComponent";


const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardComponent />} /> 
      <Route path="/attrition" element={<AttritionComponent />} />

    </Routes>
  );
};

export default DashboardRoutes;