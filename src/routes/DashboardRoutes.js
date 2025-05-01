import { Routes, Route } from "react-router-dom";
import HomeDashboardComponent from "../components/DashboardComponent";
import AttritionComponent from "../components/AttritionComponent";
import RevenueComponent from "../components/RevenueComponent";
import MonthlyReport from "../components/MonthlyReportComponent";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardComponent />} /> 
      <Route path="/attrition" element={<AttritionComponent />} />
      <Route path="/revenue" element={<RevenueComponent />} />
      <Route path="/pnl" element={<MonthlyReport />} />
    </Routes>
  );
};

export default DashboardRoutes;