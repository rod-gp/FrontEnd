import http from "../http-common";

class FinanceDataService{
    async getDaysPerMonth(year) {
        try {
            return await http.get("/finance/daysPerMonth/"+year);
        } catch (error) {
            console.error("Error fetching working days for:"+year, error);
            throw error;
        }
    }   

    async update(year, data) {
        try {
            return await http.put("/finance/daysPerMonth/"+year, data);
        } catch (error) {
            console.error(`Error updating Finance with ID ${id}:`, error);
            throw error;
        }
    }

}

const fds = new FinanceDataService();
export default fds;