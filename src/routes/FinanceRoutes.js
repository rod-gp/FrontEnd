import { Routes, Route } from "react-router-dom";
import Invoice from "../components/InvoiceComponent.js";

const FinanceRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Invoice />} /> 
            <Route path="/invoice/" element={<Invoice />} /> 
            <Route path="/backlog/" element={<Invoice />} /> 
            <Route path="/ratecard/" element={<Invoice />} /> 

        </Routes>
    );
};

export default FinanceRoutes;