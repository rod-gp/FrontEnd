import { Routes, Route } from "react-router-dom";
import EmployeeDetailComponent from "../components/EmployeeDetailComponent";
import EmployeeListComponent from "../components/EmployeeListComponent";


const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="/List/:id" element={<EmployeeListComponent />} /> 
      <Route path="/:id" element={<EmployeeDetailComponent />} />
    </Routes>
  );
};

export default EmployeeRoutes;