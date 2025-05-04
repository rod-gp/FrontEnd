import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import maritzProjectDataService from "../services/maritzProject.service";
import ManagerDataServices from '../services/manager.service';
import SofttekProjectDataService from '../services/softtekProject.service';
import employeeProjectDataService from '../services/employeeProject.service';
import Constants from "../constants/Constants";
import { NumericFormat } from "react-number-format";

const MaritzProjectDetailComponent = () => {

    const { id } = useParams();

    const navigate = useNavigate();
    const isNewProject = (id === '0');
    const [project, setProject] = useState({
        Maritz_ProjectID: '',
        Project_Name: '',
        Start_Date: '',
        End_Date: '',
        SOW_Name: '',
        Cost_Center: '',
        ManagerID: '',
        Softtek_ProjectID: '',
        Active: 1,
        Monthly_Rate: 0,
        DMID : ''
    });
    const [errorMessage, setErrorMessage] = useState(''); 
    const [loading, setLoading] = useState(''); 
    const [success, setSuccess] = useState(false);
    const [managerlist, setManagerList] = useState([]);
    const [softtekProjectList, setSofttekProjectList] = useState([]);
    const [employeeProjectList, setEmployeeProjectList] = useState([]);


 // Fetch people assigned to the project
    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                if (!isNewProject) {
                    const response = await employeeProjectDataService.getEmployeesAssignedToProject(id);
                    setEmployeeProjectList(response.data);                    
                }
            }
            catch(error){
                setErrorMessage(error.message);
                console.error('Error fetching Project:', error);
            }
        };
        fetchAssignment();
    }, [id, isNewProject]);

     // Fetch Manager list from API
     useEffect(() => {
        ManagerDataServices.getManagers()
        .then((response) => setManagerList(response.data))
        .catch ((error) => console.error('Error fetching managers:', error));  

    }, []);


    // Filter managers based on activeFilter state
    const filteredManagers = managerlist.filter((manager) => {
    return manager.Active === 1 ;
    });


    useEffect(() => {
       const fetchSofttekProjects = async () => {
        try{
            const response = await SofttekProjectDataService.getProjects();
            setSofttekProjectList(response.data);


        }
        catch(error){
            setErrorMessage(error.message);
            console.error('Error fetching softtek projects:', error);
        }
      
        };
        fetchSofttekProjects();
    }, []);



    useEffect(() => {
        const fetchProject = async () => {
            try {
                if (!isNewProject) {
                    const response = await maritzProjectDataService.getProjectById(id);
                    setProject(response.data[0]);                    
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
    }, [id, isNewProject]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProject(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            if (isNewProject) {
                await maritzProjectDataService.create(project);
                setSuccess(true);
                setTimeout(() => navigate("/project"),2000); 
                return;       
            } else {
                const formattedProject = {
                    ...project,
                    Monthly_Rate: Number(project.Monthly_Rate), // Ensure it's sent as a number
                };
                await maritzProjectDataService.update(id, formattedProject);
                setSuccess(true);
                setTimeout(() => navigate("/project"),2000);
                return;
            }
        }
        catch(error){
            setErrorMessage(error.message);
            console.error('Error updating Project:', error);
        }
        finally{
            setLoading(false);
        };
    };


    if (loading) return <p>Loading...</p>;
    

    return (
        <div className="container mt-4">

            
    
    
                {success && <div className="alert alert-success">Project updated successfully! Redirecting...</div>}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <table>
                    <tbody>
                    <tr>
                    <td>
                    <h2>{isNewProject ? 'Create New Project' : 'Edit Project'}</h2>
                    <form onSubmit={handleSubmit}>
                <table className="table table-bordered" style={{ width: '500px' }}>    
                    <tbody>
                        <tr>
                            <td valign='middle' style={{ width: '30%' }}>Project Name:</td>
                            <td style={{ width: '70%' }}><input type="text" name="Project_Name" value={project.Project_Name} onChange={handleChange} className="form-control" required /></td>
                        </tr>
                        <tr>
                            <td valign='middle'>Start Date:</td>
                            <td><input type="date" name="Start_Date" value={project.Start_Date?.split("T")[0] || ""} onChange={handleChange} className="form-control" required /></td>
                        </tr>
                        <tr>
                            <td valign='middle'>End Date:</td>
                            <td><input type="date" name="End_Date" value={project.End_Date?.split("T")[0] || ""} onChange={handleChange} className="form-control" required /></td>
                        </tr>
                        <tr>
                            <td valign='middle'>SOW Type:</td>
                            <td>
                            <select
                                name="SOW_Name" 
                                className="form-control" 
                                value={project.SOW_Name}
                                onChange={handleChange}            
                            >
                                <option value="" disabled>-- SOW Type --</option>
                                    {Constants.SOW_TYPE.map((sow_type) => (
                                    <option key={sow_type} value={sow_type}>
                                        {sow_type}</option>
                                    ))}
                            </select> 
                                </td>
                        </tr>
                        <tr>
                            <td valign='middle'>Cost Center:</td>
                            <td><input type="text" name="Cost_Center" value={project.Cost_Center} onChange={handleChange} className="form-control" /></td>
                        </tr>
                        <tr>
                            <td valign='middle'>Manager:</td>
                            <td>
                         
                            <select
                                name="ManagerID"
                                value={project.ManagerID}
                                onChange={handleChange}
                                className={`form-select ${errorMessage.Reports_To ? 'is-invalid' : ''}`}
            >
                                <option value="">-- Select a Manager --</option>
                                    {filteredManagers.map((manlst) => (
                                    <option key={manlst.ManagerID} value={manlst.ManagerID}>
                                        {manlst.Name} 
                                </option>
                                ))}
                            </select>
                                
                              
                                
                            </td>
                        </tr>
                        <tr>
                            <td valign='middle'>WBS:</td>
                            <td>

                            <select
                                name="Softtek_ProjectID"
                                value={project.Softtek_ProjectID}
                                onChange={handleChange}
                                className={`form-select ${errorMessage.Reports_To ? 'is-invalid' : ''}`}
                            >
                                <option value="">-- Select a WBS --</option>
                                    {softtekProjectList.map((manlst) => (
                                    <option key={manlst.Softtek_ProjectID} value={manlst.Softtek_ProjectID}>
                                        {manlst.Project_WBS} 
                                </option>
                                ))}
                            </select>
                                
                            </td>
                        </tr>
                        <tr>
                            <td valign='middle'>Status:</td>
                            <td>
                                <select name="Active" value={project.Active} onChange={handleChange} className="form-control">
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td valign='middle'>Monthly Rate:</td>
                            <td>
                                <NumericFormat
                                        name="Monthly_Rate"
                                        value={project.Monthly_Rate || 0}
                                        onValueChange={(values) => handleChange({ target: { name: "Monthly_Rate", value: values.floatValue ?? 0, } })}          
                                        className={`form-control`}
                                        thousandSeparator={true}
                                        prefix="$"
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                 />
                              
                                
                            </td>
                        </tr>
                        <tr>
                            <td valign='middle'>Assign DM</td>
                            <td>
                            <select
                                name="DMID"
                                value={project.DMID}
                                onChange={handleChange}
                                className={`form-select ${errorMessage.Reports_To ? 'is-invalid' : ''}`}
                            >
                                <option value="">-- Select a DM --</option>
                                    {Constants.DMS.map((dmlst) => (
                                    <option key={dmlst.DMID} value={dmlst.DMID}>
                                        {dmlst.DMName} 
                                </option>
                                ))}
                            </select>
                            </td>
                            </tr>
                    </tbody>
                </table>
                <button type="submit" className="btn btn-success">{isNewProject ? 'Create' : 'Save'}</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/project')}>Cancel</button>
            </form>
            
                    </td>
                <td style={{ width: '100px' }}> </td>
                
  
                
                { !isNewProject && employeeProjectList.length !== 0 && (
                 <>
                        <td valign='top'>
                        <h2>Employees Assigned to Project</h2> 
                          <table className='table table-bordered' style={{ width: '600px' }}>
                            <thead>
                                <tr>
                    
                                    <th style={{ width: '50%' }}>Name</th>
                                    <th style={{ width: '10%' }}>Start Date</th>
                                    <th style={{ width: '10%' }}>End Date</th>
                                    <th style={{ width: '30%' }}>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeProjectList.map((employee) => (
                                    <tr key={employee.EmployeeID}>
                                       
                                        <td>{employee?.Employee.Name}</td>
                                        <td>{new Date(employee?.Employee.Start_Date).toLocaleDateString()} </td>
                                        <td>{new Date(employee?.Employee.End_Date).toLocaleDateString()}</td>
                                        <td>{employee?.Employee.City.City_Name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>              
                        </td>
                        </>
                        )}
                    
                    </tr>
                    </tbody>
                </table>
        </div>
    );

};
export default MaritzProjectDetailComponent;


