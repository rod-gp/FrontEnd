import { Routes, Route } from "react-router-dom";
import RateCardComponent from "../components/RateCardComponent.js";

const RatecardRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RateCardComponent />} /> 
        </Routes>
    );
};

export default RatecardRoutes;