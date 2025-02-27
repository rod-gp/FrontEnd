import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import softtekProjectDataService from "../services/softtekProject.service";


const SofttekProjectListComponent = () => {

    const [projects, setProjects] = useState([]); 

    useEffect(() => {
        softtekProjectDataService.getProjects()
        .then((response) => setProjects(response.data))
        .catch((error) => console.error('Error fetching list of Projects:', error));
    }  , []);


    return(
        <div className="container mt-4">
            <table className="table table-striped table-sm" style={{ width: '1200px' }}>
            <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Project Name</th>
              <th>Project WBS</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>TCV</th>
              <th>CRM Opportunity</th>
              <th>CRM Order</th>
              <th>Practice</th>
              <th>Type</th>
              <th align ='center'>Action</th>
            </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                <tr key={project.Softtek_ProjectID}>
                    <td valign='middle'>{project.Softtek_ProjectID}</td>
                    <td valign='middle'>{project.Project_Name}</td>
                    <td valign='middle'>{project.Project_WBS}</td>
                    <td valign='middle'>{new Date(project.Start_Date).toLocaleDateString()}</td>
                    <td valign='middle'>{new Date(project.End_Date).toLocaleDateString()}</td>
                    <td valign='middle'>{project.TCV}</td>
                    <td valign='middle'>{project.CRM_Opp}</td>
                    <td valign='middle'>{project.CRM_Order}</td>
                    <td valign='middle'>{project.Practice}</td>
                    <td valign='middle'>{project.Type}</td>
                    <td valign='middle' align ='center'><Link to={`/wbs/${project.Softtek_ProjectID}`} 
                    className="btn btn-primary"
                    style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} >
                    
                    Edit</Link></td>
                </tr>
            ))}
            </tbody>
            </table>

        </div>


    );

};
export default SofttekProjectListComponent;