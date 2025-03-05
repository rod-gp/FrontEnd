import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import employeeDataService from '../services/employee.service';

const EmployeeListComponent = () => {
    const { id } = useParams(); // Get the city ID from the URL
    const [employees, setEmployees] = useState([]);
    

    useEffect(() => {
        employeeDataService.getAllEmployeesByStatus(id)
        .then((response) => setEmployees(response.data))
        .catch((error) => console.error('Error fetching list of Employees:', error));
        }, [id]);

    return (

        <div className="container mt-4">
        <h2>{id === "0" ? "Active Employees         " : "Inactive Employees                "}
        <Link to={`/employee/0`} 
                className="btn btn-primary">
                Add Employee</Link></h2>
            <table className="table table-striped table-sm">
            <thead className="table-dark">
            <tr>          
                <th>EmployeeID</th>
                <th style={{ width: '400px' }}>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>SAP ID</th>
                <th>City</th>
                <th>Country</th>
                <th align ='center'>Action</th>
            </tr>
            </thead>
            <tbody>
            {employees.map((employee) => (
            <tr key={employee.EmployeeID}>
                <td>{employee.EmployeeID}</td>
                <td>{employee.Name}</td>
                <td>{new Date(employee.Start_Date).toLocaleDateString()}</td>
                <td>{new Date(employee.End_Date).toLocaleDateString()}</td>
                <td>{employee.Status === 0 ? 'Active' : 'Inactive'}</td>
                <td>{employee.SAPID}</td>
                <td>{employee.City.City_Name}</td>
                <td>{employee.City.Country}</td>
                <td valign='middle' ><Link to={`/employee/${employee.EmployeeID}`} 
                className="btn btn-primary"
                style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} >
                Edit</Link></td>
            </tr>
        ))}
        </tbody>
            </table>
        </div>

    )
};

export default  EmployeeListComponent;