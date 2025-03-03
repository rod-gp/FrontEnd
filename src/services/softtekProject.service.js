import http from "../http-common";

class SofttekProjectDataService{
   async getProjects() {
        try {
            return await http.get("/softtekproject");
        } catch (error) {
            console.error("Error fetching Softtek Projects:", error);
            throw error;
        }
    }

    async getProject(id) {
        try {
            return await http.get(`/softtekproject/${id}`);
        } catch (error) {
            console.error(`Error fetching Softtek Project with ID ${id}:`, error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            return await http.put(`/softtekproject/${id}`, data);
        } catch (error) {
            console.error(`Error updating project with ID ${id}:`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            return await http.post("/softtekproject", data);
        } catch (error) {
            console.error("Error creating Softtek project:", error);
            throw error;
        }
    }
}

const softtekProjectDataService = new SofttekProjectDataService();
export default softtekProjectDataService;