import http from "../http-common";

class EmployeeDataService{
     
    async getAllEmployees() {
        try {
            return await http.get("/employee");
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    }

    async getAllEmployeesByStatus(status) {
        try {
            return await http.get(`/employee?Status=${status}`);
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    }

    async getEmployee(id) {
        try {
            return await http.get(`/employee/${id}`);
        } catch (error) {
            console.error(`Error fetching Employee with ID ${id}:`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            return await http.post("/employee", data);
        } catch (error) {
            console.error("Error creating Employee:", error);
            throw error;
        }
    }
    
    async update(id, data) {
        try {
            return await http.put(`/employee/${id}`, data);
        } catch (error) {
            console.error(`Error updating Employee with ID ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await http.delete(`/employee/${id}`);
        } catch (error) {
            console.error(`Error deleting employee with ID ${id}:`, error);
            throw error;
        }
    }

    async findByName(name) {
        try {
            return await http.get(`/employee?Name=${name}`);
        } catch (error) {
            console.error(`Error searching the employee with name ${name}:`, error);
            throw error;
        }
    }

}

const employeeDataService = new EmployeeDataService();
export default employeeDataService;