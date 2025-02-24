import { Routes, Route } from "react-router-dom";
import ManagerListComponent from "../components/ManagerListComponent";
import ManagerDetailComponent from "../components/ManagerDetailComponent";


const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/list" element={<ManagerListComponent />} /> 
      <Route path="/list/:sort" element={<ManagerListComponent />} /> 
      <Route path="/:id" element={<ManagerDetailComponent />} />
    </Routes>
  );
};

export default ManagerRoutes;