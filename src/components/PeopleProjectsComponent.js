import React, { useState, useEffect } from 'react';
import EmployeeProjectDataService from "../services/employeeProject.service";
import maritzProjectDataService from "../services/maritzProject.service";
import roleDataService from "../services/role.service";
import rateCardDataService from "../services/ratecard.service";



const TableTransfer = () => {
 

  const [roles, setRoles]=useState([]);
  const [rateCard, setRateCard] = useState([]);
  const [projects, setProjects] = useState([]); 
  const [activeProject, setActiveProject] = useState("");
  const [isNewProject, setIsNewProject] = useState(true);  
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial available items
  const [availableItems, setAvailableItems] = useState([]);

  // Initially empty selected items
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSelectedItems, setSelectedSelectedItems] = useState([]);

  // Track selected items in each table
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedSelected, setSelectedSelected] = useState([]);

  //Filter names
  const [searchTerm, setSearchTerm] = useState("");


  //get all Roles 
    useEffect(() => {
      const fetchData = async () => { 
        try {
          const [rolesList, rateCardList, projectList] = await Promise.all([
                roleDataService.getRoles(), 
                rateCardDataService.find(),
                maritzProjectDataService.getAllProjects()             
              ]);
                setRoles(rolesList.data);
                setRateCard(rateCardList.data);
                const onlyActiveProjects = projectList.data.filter(project => project.Active === 1);
                setProjects(onlyActiveProjects);
        } 
          catch(error){
              console.error('Error fetching list of Roles:', error);
          }          
      };
   
      fetchData();

    }, []);


     //get all unassigned employees
    useEffect(() => {     
        EmployeeProjectDataService.getUnassignedEmployees()
        .then((response) => setAvailableItems(response.data))
        .catch((error) => console.error('Error fetching list of Employees:', error));
    }
    , [activeProject]);
 
  const getProjectName = (projectID) => {
      const pjt = projects.find(proj => Number(proj.Maritz_ProjectID) === Number(projectID)); 
      return pjt ? pjt.Project_Name : "Unknown Project"; 
  };
 


  // Move selected items from Available → Selected
  const moveRight = () => {
    setSelectedItems([...selectedItems, ...selectedAvailable]);
    setAvailableItems(availableItems.filter((item) => !selectedAvailable.includes(item)));
    setSelectedAvailable([]);
  };

  // Move selected items from Selected → Available
  const moveLeft = () => {
    setAvailableItems([...availableItems, ...selectedSelected]);
    setSelectedItems(selectedItems.filter((item) => !selectedSelected.includes(item)));
    setSelectedSelected([]);
  };

  // Toggle selection in Available table
  const toggleSelectAvailable = (item) => {
    setSelectedAvailable((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Toggle selection in Selected table
  const toggleSelectSelected = (item) => {
    setSelectedSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

    const save = async(e) =>{
      const tmp =  selectedItems.map(emp => ({
        EmployeeID: emp.EmployeeID,
        Maritz_ProjectID: activeProject,
        Start_Date: emp.Start_Date,
        End_Date: emp.End_Date,
        RoleID: emp.RoleID
      }));

      try {
        const response = await EmployeeProjectDataService.assign(activeProject,tmp);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
      catch(err){
        setSuccess(true);
        setErrorMessage('Error assigning Employees:'+err);
      }
    };


    useEffect(() => {
        const fetchemployees = async () => {
         
          if (isNewProject) return;
      
        try {
            const response = await EmployeeProjectDataService.getEmployeesAssignedToProject(activeProject);
            // Extract only EmployeeID and Name from the response
            const basicEmployeeData = response.data
            .filter(emp => emp.Employee.Status === 0) 
            .map(emp => ({
              EmployeeID: emp.EmployeeID,
              Name: emp.Employee.Name,
              Start_Date: emp.Start_Date,
              End_Date: emp.End_Date,
              RoleID: emp.RoleID,
              Country: emp.Employee.City.Country
            }));
            
            
            setSelectedItems(basicEmployeeData);
            setSelectedSelectedItems(basicEmployeeData);

        }
        catch (error) {
            console.error('Error fetching Employees:', error);
        }
    };
    fetchemployees();
  }, [isNewProject, activeProject]);

  const handleChange = (e) => {
    setActiveProject(e.target.value);
    setIsNewProject(false);
    
  };

  // Filter availableItems based on the search term
  const filteredItems = availableItems.filter(item =>
    item.Name.toLowerCase().includes(searchTerm.toLowerCase())
);


const dateChange = (e, index) => {
  const { name, value, type, checked } = e.target;
  
  setSelectedItems(prevState => 
    prevState.map((item, i) => 
      i === index ? { ...item, [name]: type === 'checkbox' ? checked : value } : item
    )
  );
};

const filterRolesByCountry = (country) => {
  
  const validRoleIDs = new Set(
    rateCard
          .filter(ratecard => ratecard.Country === country)
          .map(ratecard => ratecard.RoleID)
  );

  // Filter roles that have a matching RoleID in validRoleIDs
  return roles.filter(role => validRoleIDs.has(role.RoleID));
};



  return (
    <div className="container mt-5">

      <div className="mb-3 content-center">
        <label className="me-2 fw-bold">Select the Project:</label>
        <select
          className="form-select d-inline-block w-auto"
          value={activeProject}
          onChange={handleChange}
        >
          <option value="">-- Select a Project --</option>
              {projects.map((project) => (
                <option key={project.Maritz_ProjectID} value={project.Maritz_ProjectID}>
                  {project.Project_Name}
                </option>
              ))}
        </select>
      </div>
      {success && <div className="alert alert-success">Save successfull!</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
     
      { !isNewProject && (
                 <>
      <div className="row content-center mt-5 mb-5">
      <div className='col-8'>

      <h2 className="text-center mb-4">Assign to Project {getProjectName(activeProject)}</h2>
        </div>
        <div className='col-4'>
            <input
                type="text"
                className="form-control mb-2"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />  
            </div>
          </div>

<div className="row content-center">
 
        {/* Available Items Table */}
        <div className="col-4">
          <h5 className="text-center">Available Employees</h5>
          <table className="table table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <tr
                                key={item.EmployeeID}
                                className={selectedAvailable.includes(item) ? "table-primary" : ""}
                                onClick={() => toggleSelectAvailable(item)}
                                style={{cursor: "pointer"}}
                            >
                                <td>{item.Name}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="1" className="text-center">No results found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Move Buttons */}
        <div className="col-2 d-flex flex-column align-self-start align-items-center justify-content-center">
         <table> 
         <tbody>
         <tr style={{height: '30px'}}>
         <td > </td>
         </tr>
          
          <tr>          
            <td>
                   <button
            className="btn btn-success mb-2" style={{width: '150px'}} 
            onClick={moveRight}
            disabled={selectedAvailable.length === 0}
          >
            ➡ Move Right
          </button>
          </td>
          </tr><tr>
          <td>
          <button
            className="btn btn-danger mb-2" style={{width: '150px'}}
            onClick={moveLeft}
            disabled={selectedSelected.length === 0}
          >
            ⬅ Move Left
          </button>
          </td>
          </tr><tr>
          <td>
          <button
            className="btn btn-primary mb-2" style={{width: '150px'}}
            onClick={save}
            disabled={selectedItems.length === 0}
          >
            SAVE
          </button>
          </td></tr>
          </tbody>
          </table>
        </div>
        {/* Selected Items Table */}
        <div className="col-6">
          <h5 className="text-center">Selected Employee</h5>
          <table className="table table-bordered" style={{width: '700px'}}>
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr
                  key={item.EmployeeID}
                  className={selectedSelected.includes(item) ? "table-danger" : ""}
                  onClick={() => toggleSelectSelected(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td valign='middle' style={{ width: '35%'}} >{item.Name}</td>
                  <td valign='middle' ><input name ='Start_Date' style={{width: '120px', fontSize: '14px'}} type ='date' onChange={(e) => dateChange(e, index)} value={item.Start_Date?.split("T")[0] || ""}  className="form-control" /></td>
                  <td valign='middle' ><input name ='End_Date' style={{width: '120px', fontSize: '14px'}} type ='date' onChange={(e) => dateChange(e, index)} value={item.End_Date?.split("T")[0] || ""} className="form-control" /></td>
                  <td valign='middle'>
                    <select
                        name="RoleID"
                        className="form-control" 
                        value={item.RoleID}
                        style={{fontSize: '14px'}}
                        onChange={(e) => dateChange(e, index)}
                      >
                    <option value="">-- Role --</option>
                      {filterRolesByCountry(item.Country).map((roles) => (
                      <option key={roles.RoleID} value={roles.RoleID}>
                        {roles.Role_Name}
                      </option>
                     ))}
                    </select>               
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </>
                        )}
    </div>
  );
};

export default TableTransfer;
