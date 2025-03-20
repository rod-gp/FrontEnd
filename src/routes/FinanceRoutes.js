import { Routes, Route } from "react-router-dom";
import Invoice from "../components/InvoiceComponent.js";
import RateCard from "../components/RateCardComponent.js";

const FinanceRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Invoice />} /> 
            <Route path="/invoice/" element={<Invoice />} /> 
            <Route path="/backlog/" element={<Invoice />} /> 
            <Route path="/ratecard/" element={<RateCard />} /> 

        </Routes>
    );
};

export default FinanceRoutes;