import http from "../http-common";

class DashboardDataService{

    async getHCbyCountry(tDate) {
        try {
            return await http.get("/dashboard/hcbycountry",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching HC by Countries:", error);
            throw error;
        }
    }


    async getHCbyCompany(tDate) {
        try {
            return await http.get("/dashboard/hcbycompany",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching HC by Companies:", error);
            throw error;
        }
    }

    async getHClast12Months(tDate) {
        try {
            return await http.get("/dashboard/hclast12months",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching HC last 12 months:", error);
            throw error;
        }
    }

    async getHCbyStatus(tDate) {
        try {
            return await http.get("/dashboard/hcbystatus",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching HC by status:", error);
            throw error;
        }
    }

    async getHCbyCity(tDate) {
        try {
            return await http.get("/dashboard/hcbycity",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching HC by city:", error);
            throw error;
        }
    }

    async getAttrition(tDate) {
        try {
            //console.log("tDate", tDate);
            return await http.get("/dashboard/attrition",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching attrition", error);
            throw error;
        }
    }

    async getAttritionDetails(tDate) {
        try {
            //console.log("tDate", tDate);
            return await http.get("/dashboard/attritiondetails",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching attrition", error);
            throw error;
        }
    }

    async getRevenueForecast(tDate) {
        try {
            //console.log("tDate", tDate);
            return await http.get("/dashboard/revenueforecast",{
                params: {                     
                     theDate: tDate
             }
         });
        } catch (error) {
            console.error("Error fetching attrition", error);
            throw error;
        }
    }
}

const dds = new DashboardDataService();
export default dds;