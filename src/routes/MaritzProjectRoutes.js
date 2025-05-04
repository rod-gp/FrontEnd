import { Routes, Route } from "react-router-dom";
import MaritzProjectListComponent from "../components/MaritzProjectListComponent";
import MaritzProjectDetailComponent from "../components/MaritzProjectDetailComponent";
import MaritzProjectCostComponent from "../components/MaritzProjectCostComponent";
import DMAllocation from "../components/DMAllocationComponent";

const MaritzProjectsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MaritzProjectListComponent />} /> 
      <Route path="/:id" element={<MaritzProjectDetailComponent />} />
      <Route path="/mpc" element={<MaritzProjectCostComponent />} /> 
      <Route path="/dmalloc" element={<DMAllocation />} /> 
    </Routes>
  );
};

export default MaritzProjectsRoutes;