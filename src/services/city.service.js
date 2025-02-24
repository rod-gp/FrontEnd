import http from "../http-common";

class CityDataService{

    async getCities() {
        try {
            return await http.get("/city");
        } catch (error) {
            console.error("Error fetching cities:", error);
            throw error;
        }
    }

    async getCountries() {
        try {
            return await http.get("/city/country");
        } catch (error) {
            console.error("Error fetching countries:", error);
            throw error;
        }
    }

    async getCity(id) {
        try {
            return await http.get(`/city/${id}`);
        } catch (error) {
            console.error(`Error fetching city with ID ${id}:`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            return await http.post("/city", data);
        } catch (error) {
            console.error("Error creating city:", error);
            throw error;
        }
    }
    
    async update(id, data) {
        try {
            return await http.put(`/city/${id}`, data);
        } catch (error) {
            console.error(`Error updating city with ID ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await http.delete(`/city/${id}`);
        } catch (error) {
            console.error(`Error deleting city with ID ${id}:`, error);
            throw error;
        }
    }
}

const cityDataService = new CityDataService();
export default cityDataService;