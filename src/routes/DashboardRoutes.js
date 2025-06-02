import { Routes, Route } from "react-router-dom";
import HomeDashboardComponent from "../components/DashboardComponent";
import AttritionComponent from "../components/AttritionComponent";
import RevenueComponent from "../components/RevenueComponent";
import MonthlyReport from "../components/MonthlyReportComponent";
import HistoricReport from "../components/HistoricReportComponent";
import EmployeeCostReport from "../components/EmployeeCostReportComponent";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardComponent />} /> 
      <Route path="/attrition" element={<AttritionComponent />} />
      <Route path="/revenue" element={<RevenueComponent />} />
      <Route path="/pnl" element={<MonthlyReport />} />
      <Route path="/hspnl" element={<HistoricReport />} />
      <Route path="/hsempc" element={<EmployeeCostReport />} />
    </Routes>
  );
};

export default DashboardRoutes;