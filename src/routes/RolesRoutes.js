import { Routes, Route } from "react-router-dom";
import RolesListComponent from "../components/RolesListComponent";
import RolesDetailComponent from "../components/RolesDetailComponent";

const RolesRoutes = () => {
    return (
      <Routes>
        <Route path="/:type" element={<RolesListComponent />} /> 
        <Route path="/role/:id/:type" element={<RolesDetailComponent />} />
      </Routes>
    );
  };
  
  export default RolesRoutes;