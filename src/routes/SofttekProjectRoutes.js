import { Routes, Route } from "react-router-dom";
import SofttekProjectListComponent from "../components/SofttekProjectListComponent";
import SofttekProjectDetailComponent from "../components/SofttekProjectDetailComponent";    


const SofttekProjectsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SofttekProjectListComponent />} /> 
      <Route path="/:id" element={<SofttekProjectDetailComponent />} />
    </Routes>
  );
};

export default SofttekProjectsRoutes;