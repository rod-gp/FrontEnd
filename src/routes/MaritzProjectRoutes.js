import { Routes, Route } from "react-router-dom";
import MaritzProjectListComponent from "../components/MaritzProjectListComponent";
import MaritzProjectDetailComponent from "../components/MaritzProjectDetailComponent";
import MaritzProjectCostComponent from "../components/MaritzProjectCostComponent";

const MaritzProjectsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MaritzProjectListComponent />} /> 
      <Route path="/:id" element={<MaritzProjectDetailComponent />} />
      <Route path="/mpc" element={<MaritzProjectCostComponent />} /> 
    </Routes>
  );
};

export default MaritzProjectsRoutes;