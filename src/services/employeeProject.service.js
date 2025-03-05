import http from "../http-common";

class EmployeeDataService{
 
    async getEmployeesAssignedToProject(id) {
        try {
            return await http.get(`/assign/project/${id}`);
        } catch (error) {
            console.error("Error fetching managers:", error);
            throw error;
        }
    }

    async getProjectsWithoutEmployees() {
        try {
            return await http.get(`/assign/project/`);
        } catch (error) {
            console.error("Error fetching empty projects:", error);
            throw error;
        }
    }

    async getProjectsByEmployeeId(id) {
        try {
            return await http.get(`/assign/employee/${id}`);
        } catch (error) {
            console.error("Error fetching empty projects:", error);
            throw error;
        }
    }

    async getUnassignedEmployees() {
        try {
            return await http.get(`/assign/employee/`);
        } catch (error) {
            console.error("Error fetching Employees:", error);
            throw error;
        }
    }

    

}

 const EDS = new EmployeeDataService();
 export default EDS;