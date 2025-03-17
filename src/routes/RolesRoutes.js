import { Routes, Route } from "react-router-dom";
import RolesListComponent from "../components/RolesListComponent";
import RolesDetailComponent from "../components/RolesDetailComponent";

const RolesRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<RolesListComponent />} /> 
        <Route path="/:id" element={<RolesDetailComponent />} />
      </Routes>
    );
  };
  
  export default RolesRoutes;