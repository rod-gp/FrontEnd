import { Routes, Route } from "react-router-dom";
import Invoice from "../components/InvoiceComponent.js";
import RateCard from "../components/RateCardComponent.js";
import Backlog from "../components/BacklogComponent.js";
import DaysPerMonthComponent from "../components/DaysPerMonthComponent.js";

const FinanceRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Invoice />} /> 
            <Route path="/invoice/" element={<Invoice />} /> 
            <Route path="/:type/" element={<Backlog />} />

            <Route path="/ratecard/" element={<RateCard />} /> 
            <Route path="/dayspermonth/" element={<DaysPerMonthComponent />} />

        </Routes>
    );
};

export default FinanceRoutes;