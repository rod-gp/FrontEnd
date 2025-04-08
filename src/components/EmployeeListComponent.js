import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import employeeDataService from '../services/employee.service';

const EmployeeListComponent = () => {
    const { id } = useParams(); // Get the city ID from the URL
    const [employees, setEmployees] = useState([]);
    //Filter names
      const [searchTerm, setSearchTerm] = useState("");
    

    useEffect(() => {
        employeeDataService.getAllEmployeesByStatus(id)
        .then((response) => setEmployees(response.data))
        .catch((error) => console.error('Error fetching list of Employees:', error));
        }, [id]);

  // Filter availableItems based on the search term
  const filteredItems = employees.filter(item =>
    item.Name.toLowerCase().includes(searchTerm.toLowerCase())
);

const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(`${year}-${month}-${month}`); // Create a valid Date object
    return date.toLocaleString("en-US", { month: "short" }) + "/" + day + "/" + year;
};

    return (

        <div className="container pt-2">
        <div className="row">    
           <div className="col-sm-6"><h2>{id === "0" ? "Active Employees " : "Inactive Employees "}</h2></div>
           <div className="col-sm-1"></div>
           <div className="col-sm-2">{id === "0" ? <Link to={`/employee/0`} className="btn btn-primary">Add Employee</Link>:""}</div>
           <div className="col-sm-3">           
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                /></div>
        </div>
            <table className="table table-striped table-borderless table-sm" style={{ width: '1200px' }} >
            <thead className="table-dark">
               <tr>                     
                <th style={{ width: '350px' }}>Name</th>
                <th style={{ textAlign: 'center' }}>Start Date</th>
                <th style={{ textAlign: 'center' }}>End Date</th>
                <th style={{ textAlign: 'right' }}>SAP ID</th>
                <th style={{ textAlign: 'right' }}>City</th>
                <th style={{ textAlign: 'right' }}>Country</th>
                <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
            </thead>
            <tbody>
            {filteredItems.map((employee) => (
            <tr key={employee.EmployeeID}>             
                <td>{employee.Name}</td>
                <td align="center">{formatDate(new Date(employee.Start_Date).toISOString().split('T')[0])  }</td>
                <td align="center">{formatDate(new Date(employee.End_Date).toISOString().split('T')[0])   }</td>
            {/**     <td>{employee.Status === 0 ? 'Active' : 'Inactive'}</td>*/}   
                <td align='right'>{employee.SAPID}</td>
                <td align='right'>{employee.City.City_Name}</td>
                <td align='right'>{employee.City.Country}</td>
                <td align="right"> <Link to={`/employee/${employee.EmployeeID}`} 
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