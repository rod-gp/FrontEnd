import { Routes, Route } from "react-router-dom";
import CityListComponent from "../components/CityListComponent";
import CityDetailComponent from "../components/CityDetailComponent";


const CityRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CityListComponent />} /> 
      <Route path="/:id" element={<CityDetailComponent />} />
    </Routes>
  );
};

export default CityRoutes;