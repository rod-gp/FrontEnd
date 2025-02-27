import React, { useState, useEffect } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import softtekProjectDataService from "../services/softtekProject.service";

const SofttekProjectDetailComponent = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchProject = async () => {
        try{
            const response = await softtekProjectDataService.getProject(id);
            setFormData(response.data);
        } 
        catch(error){
            console.error('Error fetching Project:', error);
        }
        finally{
            setLoading(false);
            };
        };
        fetchProject();        

    }, [id]);
       
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await softtekProjectDataService.update(id, formData);
            navigate("/wbs");
        } catch (error) {
          console.error("Error updating project:", error);
        }
      };

   if (loading) return <p>Loading...</p>;

    return(

    <div className="container mt-4">

    <h2>Edit Project</h2>
      <form onSubmit={handleSubmit}>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><label className="form-label">Project Name</label></td>
              <td><input type="text" className="form-control" name="Project_Name" value={formData.Project_Name || ""} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label className="form-label">Project WBS</label></td>
              <td><input type="text" className="form-control" name="Project_WBS" value={formData.Project_WBS || ""} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label className="form-label">Start Date</label></td>
              <td><input type="date" className="form-control" name="Start_Date" value={formData.Start_Date?.split("T")[0] || ""} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label className="form-label">End Date</label></td>
              <td><input type="date" className="form-control" name="End_Date" value={formData.End_Date?.split("T")[0] || ""} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label className="form-label">TCV</label></td>
              <td><input type="number" className="form-control" name="TCV" value={formData.TCV || ""} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label className="form-label">CRM Opportunity</label></td>
              <td><input type="text" className="form-control" name="CRM_Opp" value={formData.CRM_Opp || ""} onChange={handleChange} /></td>
            </tr>
            <tr>
              <td><label className="form-label">CRM Order</label></td>
              <td><input type="text" className="form-control" name="CRM_Order" value={formData.CRM_Order || ""} onChange={handleChange} /></td>
            </tr>
            <tr>
              <td><label className="form-label">Practice</label></td>
              <td><input type="text" className="form-control" name="Practice" value={formData.Practice || ""} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label className="form-label">Type</label></td>
              <td><input type="text" className="form-control" name="Type" value={formData.Type || ""} onChange={handleChange} required /></td>
            </tr>
          </tbody>
        </table>
        <button type="submit" className="btn btn-primary">Save Changes</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/wbs")}>
          Cancel
        </button>
      </form>

        </div>

    );

};

export default SofttekProjectDetailComponent;