import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ManagerDataServices from '../services/manager.service';

const ManagerListComponent = () => {
  const { sort } = useParams(); // Get the manager ID from the URL
  const [managers, setManagers] = useState([]);
  const [activeFilter, setActiveFilter] = useState((sort===undefined)?"active":sort); //Filtering State
  const [sortOrder, setSortOrder] = useState("asc"); // Sorting order state
  const [managersMap, setManagersMap] = useState({});

  useEffect((ss) => {
    ManagerDataServices.getManagers()
      .then((response) => {
        setManagers(response.data);
        const managersMap = {};
        response.data.forEach(manager => {
          managersMap[manager.ManagerID] = manager.Name;
        });
        setManagersMap(managersMap);
      })
      .catch((error) => console.error('Error fetching managers:', error));
    }, []);


    // Filter managers based on activeFilter state
    const filteredManagers = managers.filter((manager) => {
        //console.log(sort)
        if (activeFilter === "all") return true;
        return activeFilter === "active" ? manager.Active === 1 : manager.Active === 0;
    });

    // Sorting function for Name column
    const sortedManagers = [...filteredManagers].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.Name.localeCompare(b.Name);
        }   else {
            return b.Name.localeCompare(a.Name);
        }
    });

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      };

  return (

    <div className="container pt-2">
      <div className="row align-items-center">
        <div className="col-3"> 
          <label className="fw-bold">Filter by Status:</label> 
        </div>
        <div className="col-6"> 
              <select
                  className="form-select d-inline-block w-auto"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
        </div>
      <div className="col-3">   
        <Link to={`/manager/0`} className="btn btn-primary">Add Manager</Link>
      </div>
    </div>
    
    <div className="container mt-2"></div>
    
    <table className="table table-striped table-sm" style={{ width: '1200px' }}>
    <thead className="table-dark">
    <tr>
   {/*   <th>ID</th> */ }
       <th onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
              Manager Name {sortOrder === "asc" ? "🔼" : "🔽"}
      </th>
      <th>Active</th>
      <th>Company</th>
      <th>Cost Center</th>
      <th>Reports To</th>
      <th className="text-center">Action</th>
    </tr>
    </thead>
    <tbody>
        {sortedManagers.map((manager) => (
        <tr key={manager.ManagerID} >
       {/*  <td> {manager.ManagerID} </td>   */}
            <td> {manager.Name} </td>
            <td> {manager.Active ? 'Yes' : 'No'} </td>
            <td> {manager.Company} </td>
            <td> {manager.Cost_Center} </td>
            <td> { manager.Reports_To ? managersMap[manager.Reports_To] : 'N/A' } </td>

            <td align="center"> <Link to={`/manager/${manager.ManagerID}`}
            className="btn btn-primary"
            style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} 
            >Edit</Link></td>
        </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default ManagerListComponent;