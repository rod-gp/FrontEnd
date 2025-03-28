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

    async updateDaysPerMonth(year, data) {
        try {
            return await http.put("/finance/daysPerMonth/"+year, data);
        } catch (error) {
            console.error(`Error updating Finance with Year ${year}:`, error);
            throw error;
        }
    }

    async createDaysPerMonth(data) {
        try {
            return await http.post("/finance/daysPerMonth/", data);
        } catch (error) {
            console.error(`Error creating new Working days`, error);
            throw error;
        }
    }
    
    async getBacklog(Maritz_ProjectID, year,colorOfMoney,recordType,) {
        try {
            return await http.get("/finance/backlog/", {
               params: {
                    Maritz_ProjectID: Maritz_ProjectID,
                    Year: year,
                    Color_of_Money: colorOfMoney,
                    Record_Type: recordType
            }
        });
        } catch (error) {
            console.error("Error fetching backlog for Maritz_ProjectID:"+Maritz_ProjectID, error);
            throw error;
        }
    }   

    async updateBacklog(Maritz_ProjectID, year, colorOfMoney,recordType,data) {
        try {
            return await http.put("/finance/backlog/",
                {
                    Maritz_ProjectID: Maritz_ProjectID,
                    Year: year,
                    Color_of_Money: colorOfMoney,
                    Record_Type: recordType,
                    data
            });
        } catch (error) {
            console.error(`Error updating Finance with Maritz_ProjectID ${Maritz_ProjectID}:`, error);
            throw error;
        }
    }

}

const fds = new FinanceDataService();
export default fds;