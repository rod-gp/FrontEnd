
import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import RoleDataService from "../services/role.service";


const RolesListComponent = () => {

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [roles, setRoles] = useState([]); 
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { type } = useParams(); 
    const [searchTerm, setSearchTerm] = useState("");

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
          const direction =
            prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
          return { key, direction };
        });
      };

    useEffect(() =>{
        RoleDataService.getRoles(type)
            .then((response) => setRoles(response.data))
            .catch((error) => console.error('Error fetching list of Roles:', error));
        }, [type]);

    const handleDelete = async(roleID)  => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                const response = await RoleDataService.delete(roleID);
  
                if (response.statusText) {
                    setSuccess(true);
                    setRoles(roles.filter(role => role.RoleID !== roleID));
                    setTimeout(() => setSuccess(false), 2000);

                } else {
                    setSuccess(false);
                    setErrorMessage("Failed to delete role.");
                }
            } catch (error) {
                setSuccess(false);
                setErrorMessage("Error deleting role:" + error);
            }
        }
    }

    // Filter availableItems based on the search term
    const filteredItems = roles.filter(item =>
        item.Role_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aVal = a[sortConfig.key]?.toString().toLowerCase();
        const bVal = b[sortConfig.key]?.toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });

    return(
        <div className="container mt-4">
                       
            <div className="container">
                <div className="row">
                    <div className="col-5"><h2>{ type==="R" ?"Roles":"Activity Type"}</h2></div>
                    <div className="col-3">           
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Search by AT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                /></div>
                    <div className="col-4">
                        <Link to={`/role/role/0/${type}`} className="btn btn-primary">Add { type==="R" ?"Role":"Activity Type"}</Link>
                    </div>
              </div>
            

            <div className="row">
                <div className="col-10">
                    <table className="table table-striped bordered table-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>Description</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Seniority')}>
                            Seniority {sortConfig.key === 'Seniority' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Practice')}>
                            Practice {sortConfig.key === 'Practice' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th align="center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.map((role) => (
                        <tr key={role.RoleID}>
                            <td valign='middle'>{role.Role_Name}</td>
                            <td valign='middle'>{role.Seniority}</td>
                            <td valign='middle'>{role.Practice}</td>
                            <td align ="center" valign='middle' >
                            <Link to={`/role/role/${role.RoleID}/${type}`} 
                            className="btn btn-primary mx-1"
                            style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} >                    
                            Edit</Link> 
                            
                            <button onClick={() => handleDelete(role.RoleID)} 
                            className="btn btn-danger mx-0"
                            style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} >                    
                            Delete </button>
                            </td>

                        </tr>
                    ))}
                    </tbody>
                    </table>
                </div>
              </div>
            </div>

            {success && <div className="alert alert-success">Role deleted successfully!</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        </div>

    );

};

export default RolesListComponent;