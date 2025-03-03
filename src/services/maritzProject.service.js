import http from "../http-common";

const API_URL = "/maritzproject";

class MaritzProjectService {


    async getAllProjects() {
        try {
            return await http.get(API_URL);
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    }

    // Get project by ID
    async getProjectById(id) {
        try {
            return await http.get(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error fetching project with ID ${id}:`, error);
            throw error;
        }
    }

    // Create a new project
    async create(projectData) {
        try {
            return await http.post(API_URL, projectData);
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    }

    // Update an existing project
    async update(id, projectData) {
        try {
            return await http.put(`${API_URL}/${id}`, projectData);
        } catch (error) {
            console.error(`Error updating project with ID ${id}:`, error);
            throw error;
        }
    }

    // Delete a project
    async delete(id) {
        try {
            return await http.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting project with ID ${id}:`, error);
            throw error;
        }
    }
}

const maritzProjectService = new MaritzProjectService();
export default maritzProjectService