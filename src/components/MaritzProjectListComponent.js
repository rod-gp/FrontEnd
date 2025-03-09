import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import maritzProjectDataService from "../services/maritzProject.service";

const MaritzProjectListComponent = () => {

    const [projects, setProjects] = useState([]); 
    
    useEffect(() => {
        maritzProjectDataService.getAllProjects()
        .then((response) => setProjects(response.data))
        .catch((error) => console.error('Error fetching list of Projects:', error));
    }
    , []);
    




    return(
        <div className="container mt-4">
            <table className="table table-striped table-sm" >
            <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Project Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>SOW</th>
              <th>Cost Center</th>
              <th>Manager</th>
              <th>HC</th>
              <th>WBS</th>
              <th>Status</th>
              <th align ='center'>Action</th>
            </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                <tr key={project.Maritz_ProjectID}>
                    <td valign='middle'>{project.Maritz_ProjectID}</td>
                    <td valign='middle'>{project.Project_Name}</td>
                    <td valign='middle'>{new Date(project.Start_Date).toLocaleDateString()}</td>
                    <td valign='middle'>{new Date(project.End_Date).toLocaleDateString()}</td>
                    <td valign='middle'>{project.SOW_Name}</td>
                    <td valign='middle'>{project.Cost_Center}</td>
                    <td valign='middle'>{project?.Manager.Name}</td>
                    <td valign='middle'>{project.employeeCount}</td>
                    <td valign='middle'>{project?.Softtek_Project.Project_WBS}</td>
                    <td valign='middle'>{project.Active === 0?'Inactive':'Active'}</td>
                    <td valign='middle' align ='center'><Link to={`/project/${project.Maritz_ProjectID}`} 
                    className="btn btn-primary"
                    style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} >
                    
                    Edit</Link></td>
                </tr>
            ))}
            </tbody>
            </table>
            <Link to={`/project/0`} className="btn btn-primary">Create New</Link>
        </div>


    );
};
export default MaritzProjectListComponent;