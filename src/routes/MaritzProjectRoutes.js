import { Routes, Route } from "react-router-dom";
import MaritzProjectListComponent from "../components/MaritzProjectListComponent";
import MaritzProjectDetailComponent from "../components/MaritzProjectDetailComponent";

const MaritzProjectsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MaritzProjectListComponent />} /> 
      <Route path="/:id" element={<MaritzProjectDetailComponent />} />
    </Routes>
  );
};

export default MaritzProjectsRoutes;