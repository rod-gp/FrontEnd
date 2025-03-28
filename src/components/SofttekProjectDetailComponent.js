import React, { useState, useEffect } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import softtekProjectDataService from "../services/softtekProject.service";
import { NumericFormat } from "react-number-format";
import Constants from "../constants/Constants";
import maritzProjectDataService from "../services/maritzProject.service";

const SofttekProjectDetailComponent = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      Softtek_ProjectID : '',  
      Project_Name: '',
        Project_WBS: '',
        Start_Date: '',
        End_Date: '',
        TCV: '',
        CRM_Opp: '',
        CRM_Order: '',
        Practice: '',
        Type: ''
    });
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); 
    const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);
    const [totalMonthlyRate, setTotalMonthlyRate] = useState(0);
    const [projects, setProjects] = useState([]); 
 

    useEffect(() => {
        const fetchProject = async () => {
        try{
          if (id !== '0') {
            const [project, maritz] = await Promise.all([
            softtekProjectDataService.getProject(id),
            maritzProjectDataService.getAllProjects()]);
            
            setFormData(project.data);
            const filteredProjects = maritz.data.filter(item => item.Softtek_ProjectID === Number(id));        
            setProjects(filteredProjects);
            setTotalEmployeeCount(filteredProjects.reduce((sum, project) => sum + (project.employeeCount || 0), 0));
            setTotalMonthlyRate(filteredProjects.reduce((sum, project) => sum + (parseFloat(project.Monthly_Rate) || 0), 0));
            
          }
        } 
        catch(error){
          setErrorMessage(error.message);
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
          if (id === '0') {
            await softtekProjectDataService.create(formData);
            setSuccess(true);
            setTimeout(() => navigate("/wbs"),2000);
            return;
          }
          else{
            await softtekProjectDataService.update(id, formData);
            setSuccess(true);
            setTimeout(() => navigate("/wbs"),2000);
            
          }

        } catch (error) {
          setErrorMessage(error.message);
          console.error("Error updating project:", error);
        }
      };

   if (loading) return <p>Loading...</p>;

    return(

    <div className="container mt-4 row">


      <div className="col-lg-6">
        <h2>Edit Project</h2>

      <form onSubmit={handleSubmit}>

      {success && <div className="alert alert-success">Project updated successfully! Redirecting...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}


        <table className="table table-bordered" style={{width: '400px'}}>
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
              <td>
                
                <NumericFormat className="form-control" name="TCV" value={formData.TCV || ""} onChange={handleChange} 
                thousandSeparator={true}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale={true}
                required 
                style={{ textAlign: 'right' }}/>
           
                </td>
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
              <td>
              <select
                    name="Practice" 
                    className="form-control" 
                    value={formData.Practice}
                    onChange={handleChange}           
                    >
                      <option value="">-- Select Practice --</option>

                      {Constants.PRACTICE.map((practice, index) => (
                      <option key={index} value={practice}>
                        {practice}</option>
                     ))}
                </select> 
              </td>
              
            </tr>
            <tr>
              <td><label className="form-label">Type</label></td>
              <td>
              <select
                    name="Type" 
                    className="form-control" 
                    value={formData.Type}
                    onChange={handleChange}           
                    >
                      <option value="">-- Select SOW --</option>

                      {Constants.SOW_TYPE.map((sow, index) => (
                      <option key={index} value={sow}>
                        {sow}</option>
                     ))}
                </select>                 
                </td>
            </tr>
          </tbody>
        </table>
        <button type="submit" className="btn btn-primary">{id === '0' ?'Create New':'Save Changes'}</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/wbs")}>
          Cancel
        </button>
      </form>

        </div>
        <div className="col-lg-1"></div>
        <div className="col-lg-5">
    
    
    <h2>Projects on this WBS</h2>

    <table className="table table-bordered" style={{width: '400px'}}>   
    <thead className="table-dark">
        <tr>
        <th>Project Name</th>
        <th>HC</th>
        <th>Monthy Rate</th>
        </tr>
        </thead>
      <tbody>
        {projects.map((project, index) => (
          <tr key={index}>
            <td>{project.Project_Name}</td>
            <td align='center'>{project.employeeCount}</td>
            <td align='right'>
            <NumericFormat displayType={'text'} value={project.Monthly_Rate} thousandSeparator={true}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale={true}
                 /></td>
          </tr>
        ))}
      
      <tr className="table-light font-weight-bold">
            <td><strong>Total</strong></td>
            <td align='center'><strong>{totalEmployeeCount}</strong></td>
            <td align='right'>
                <strong>
                    <NumericFormat displayType={'text'} value={totalMonthlyRate} thousandSeparator={true}
                        prefix="$"
                        decimalScale={2}
                        fixedDecimalScale={true}
                    />
                </strong>
            </td>
        </tr>
      </tbody>
    </table>


    </div>
    </div>
    );

};

export default SofttekProjectDetailComponent;