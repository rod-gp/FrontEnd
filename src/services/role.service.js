import http from "../http-common";

class RoleDataService{
    async getRoles() {
        try {
            return await http.get("/role");
        } catch (error) {
            console.error("Error fetching roles:", error);
            throw error;
        }
    }   

    async getRole(id) {
        try {
            return await http.get(`/role/${id}`);
        } catch (error) {
            console.error("Error fetching role:", error);
            throw error;
        }
    }   
    
    async create(data) {
        try {
            return await http.post("/role", data);
        } catch (error) {
            console.error("Error creating role:", error);
            throw error;
        }
    }
  async update(id, data) {
        try {
            return await http.put(`/role/${id}`, data);
        } catch (error) {
            console.error(`Error updating Role with ID ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await http.delete(`/role/${id}`);
        } catch (error) {
            console.error(`Error deleting Role with ID ${id}:`, error);
            throw error;
        }
    }
};

const rds = new RoleDataService();
export default rds;