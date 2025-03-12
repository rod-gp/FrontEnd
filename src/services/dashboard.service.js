import http from "../http-common";

class DashboardDataService{

    async getHCbyCountry() {
        try {
            return await http.get("/dashboard/hcbycountry");
        } catch (error) {
            console.error("Error fetching HC by Countries:", error);
            throw error;
        }
    }


    async getHCbyCompany() {
        try {
            return await http.get("/dashboard/hcbycompany");
        } catch (error) {
            console.error("Error fetching HC by Companies:", error);
            throw error;
        }
    }

    async getHClast12Months() {
        try {
            return await http.get("/dashboard/hclast12months");
        } catch (error) {
            console.error("Error fetching HC last 12 months:", error);
            throw error;
        }
    }

    async getHCbyStatus() {
        try {
            return await http.get("/dashboard/hcbystatus");
        } catch (error) {
            console.error("Error fetching HC by status:", error);
            throw error;
        }
    }

    async getHCbyCity() {
        try {
            return await http.get("/dashboard/hcbycity");
        } catch (error) {
            console.error("Error fetching HC by city:", error);
            throw error;
        }
    }

}

const dds = new DashboardDataService();
export default dds;