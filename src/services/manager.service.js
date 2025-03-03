import http from "../http-common";


class ManagerDataService{

    async getManagers() {
        try {
            return await http.get("/manager");
        } catch (error) {
            console.error("Error fetching managers:", error);
            throw error;
        }
    }

    async getManagerById(id) {
        try {
            return await http.get(`/manager/${id}`);
        } catch (error) {
            console.error(`Error fetching manager with ID ${id}:`, error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            return await http.put(`/manager/${id}`, data);
        } catch (error) {
            console.error(`Error updating manager with ID ${id}:`, error);
            throw error;
        }
    }
    
    async create(data) {
        try {
            return await http.post("/manager",data);
        } catch (error) {
            console.error("Error creating manager:", error);
            throw error;
        }
    }
    
    async getCompanies() {
        try {
            return await http.get("/manager/company");
        } catch (error) {
            console.error("Error fetching Companies:", error);
            throw error;
        }
    }

}


const MDS = new ManagerDataService();
export default MDS;