
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import RoleDataService from "../services/role.service";

const RolesListComponent = () => {

    const [roles, setRoles] = useState([]); 
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() =>{
        RoleDataService.getRoles()
            .then((response) => setRoles(response.data))
            .catch((error) => console.error('Error fetching list of Roles:', error));
        }, []);

    const handleDelete = async(roleID)  => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                const response = await RoleDataService.delete(roleID);
  
                if (response.statusText) {
                    setSuccess(true);
                    setRoles(roles.filter(role => role.RoleID !== roleID));
                    setTimeout(() => setSuccess(false), 2000);
                    // window.location.reload();
                    // Refresh the page or update state here
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
    return(
        <div className="container mt-4">
                       
            <div className="container">
                <div className="row">
                    <div className="col-sm"><h2>Roles</h2></div>
                    <div className="col-sm text-end">
                        <Link to={`/role/0`} className="btn btn-primary">Add Role</Link>
                    </div>
              </div>
            </div>
       
            <table className="table table-striped bordered table-sm" style={{ width: '700px' }}>
            <thead className="table-dark">
            <tr>
              <th>Description</th>
              <th>Seniority</th>
              <th>Practice</th>
              <th align ="center" >Action</th>
            </tr>
            </thead>
            <tbody>
                {roles.map((role) => (
                <tr key={role.RoleID}>
                    <td valign='middle'>{role.Role_Name}</td>
                    <td valign='middle'>{role.Seniority}</td>
                    <td valign='middle'>{role.Practice}</td>
                    <td align ="center" valign='middle' >
                    <Link to={`/role/${role.RoleID}`} 
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

            {success && <div className="alert alert-success">Role deleted successfully!</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        </div>

    );

};

export default RolesListComponent;