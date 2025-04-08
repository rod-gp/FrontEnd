import http from "../http-common";

class RatecardDataService{

    async create(data) {
        try {
            
            
            const tmp = await http.post("/ratecard", data);
            //console.log(tmp.data);
            return tmp;
        } catch (error) {
            console.error("Error creating ratecard:", error);
            throw error;
        }
    }


    async find(data) {
        try {
            return await http.get("/ratecard", data);
        } catch (error) {
            console.error("Error creating ratecard:", error);
            throw error;
        }
    }

    async update(data) {
        try {
            return await http.put("/ratecard", data);
        } catch (error) {
            console.error("Error creating ratecard:", error);
            throw error;
        }
    }

    async delete(data) {
        try {
            return await http.delete("/ratecard", data);
        } catch (error) {
            console.error("Error creating ratecard:", error);
            throw error;
        }
    }

}

const rds = new RatecardDataService();
export default rds;