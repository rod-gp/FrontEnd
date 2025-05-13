import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import maritzProjectDataService from "../services/maritzProject.service";
import { NumericFormat } from "react-number-format";

const MaritzProjectListComponent = () => {

    const [projects, setProjects] = useState([]); 
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    
    useEffect(() => {
        maritzProjectDataService.getAllProjects()
        .then((response) => setProjects(response.data))
        .catch((error) => console.error('Error fetching list of Projects:', error));
    }
    , []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getValueByPath = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const sortedProjects = [...projects].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = getValueByPath(a, sortConfig.key) ?? '';
    let bValue = getValueByPath(b, sortConfig.key) ?? '';

    // If sorting Monthly_Rate, strip '$' and ',' and parse as float
    if (sortConfig.key === 'Monthly_Rate') {
        aValue = parseFloat(String(aValue).replace(/[$,]/g, '')) || 0;
        bValue = parseFloat(String(bValue).replace(/[$,]/g, '')) || 0;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return(
        <div className="container mt-4">
            <table className="table table-striped table-sm" >
            <thead className="table-dark">
            <tr>
                <th onClick={() => handleSort('ID')}>ID</th>
                <th onClick={() => handleSort('Project_Name')}>Project Name</th>
                <th onClick={() => handleSort('Start_Date')}>Start Date</th>
                <th onClick={() => handleSort('End_Date')}>End Date</th>
                <th onClick={() => handleSort('SOW_Name')}>SOW</th>
                <th onClick={() => handleSort('Cost_Center')}>Cost Center</th>
                <th onClick={() => handleSort('Manager.Name')}>Manager</th>    
                <th onClick={() => handleSort('employeeCount')}>HC</th>
                <th onClick={() => handleSort('Softtek_Project.Project_WBS')}>WBS</th>
                <th onClick={() => handleSort('Active')}>Status</th>
                <th onClick={() => handleSort('Monthly_Rate')}>Monthly Rate</th>
                <th align ='center'>Action</th>
            </tr>
            </thead>
            <tbody>
                {sortedProjects.map((project) => (
                <tr key={project.Maritz_ProjectID}>
                    <td valign='middle'>{project.Maritz_ProjectID}</td>
                    <td valign='middle'>{project.Project_Name}</td>
                    <td valign='middle'>{new Date(project.Start_Date).toLocaleDateString('en-US', {timeZone: 'UTC'})}</td>
                    <td valign='middle'>{new Date(project.End_Date).toLocaleDateString('en-US', {timeZone: 'UTC'})}</td>
                    <td valign='middle'>{project.SOW_Name}</td>
                    <td valign='middle'>{project.Cost_Center}</td>
                    <td valign='middle'>{project?.Manager.Name}</td>
                    <td valign='middle'>{project.employeeCount}</td>
                    <td valign='middle'>{project?.Softtek_Project.Project_WBS}</td>
                    <td valign='middle'>{project.Active === 0?'Inactive':'Active'}</td>
                    <td valign='middle' align ='Right'>
                         <NumericFormat value={project.Monthly_Rate} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
                    </td>                       
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