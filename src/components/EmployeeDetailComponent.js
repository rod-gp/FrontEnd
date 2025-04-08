import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EmployeeDataService from "../services/employee.service";
import cityDataService from "../services/city.service";

const EmployeeDetailComponent = () => {
  const navigate = useNavigate(); // To redirect after successful update
  const { id } = useParams(); // Get EmployeeID from URL

  const [formData, setFormData] = useState({
    EmployeeID: 0,
    Name: '',
    Start_Date: '',
    End_Date: '',
    Status: 0,
    Attrition: 0,
    CityId: '',
    SAPID: '',
    City: {
      CityId: 0,
      City_Name: '',
      Country: ''
    }

  });

  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});



//get a list of all the cities
useEffect(() => {
  cityDataService.getCities()
    .then((response) => setCities(response.data))
    .catch ((error) => console.error('Error fetching Cities:', error));    
}, []);




//get the employee details
  useEffect(() => {


    const fetchEmployeeDetails = async () => {


      try{
        if (id === '0') {
          return;
        }
            const response = await EmployeeDataService.getEmployee(id);
            setFormData(response.data[0]);
        }
        catch(error) {
            console.error(`Error fetching Employee: ${id}`, error);
            setErrorMessage('Failed to load Employee details.');
        } finally{
          setLoading(false);
        }
    };
    fetchEmployeeDetails();
  }, [id]);

  const validateForm = () => {
    const errors={};
    if (!formData.Name.trim()) errors.Name = 'Name is required.';
   
    /*
    if (formData.SAPID === null) {
      errors.SAPID = 'SAPID is required.';
    } else if (!Number(formData.SAPID)) {
      errors.SAPID = 'SAPID must be a number.';
    }
   */
  
    return errors;
  };
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevManager) => ({
      ...prevManager,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'CityId') {
      const selectedCity = cities.find(city => city.CityId === parseInt(value));
      setFormData((prevFormData) => ({
        ...prevFormData,
        City: selectedCity
      }));
    }



  };

  // Handle form submission (Simulating API update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({}); // Clear previous errors
    const errors = validateForm();    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setSubmitting(true);

    try {

      if (id === '0') {
        await EmployeeDataService.create(formData);
        setSuccess(true);
        setTimeout(() => navigate('/employee/List/'+formData.Status),2000); 
      }
      else{
        await EmployeeDataService.update(id, formData);
        setSuccess(true);
        setTimeout(() => navigate('/employee/List/'+formData.Status),2000); 
      }
    }
    catch(error){
      console.error('Error updating Employee:', error);
      setErrorMessage('Failed to update Employee details.');
    }
    finally{
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center">Loading Employee details...</div>;
  if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;


  

  return (
  
    <div className="container mt-4" >
    <h2>Employee Details</h2>

    {success && <div className="alert alert-success">Employee updated successfully! Redirecting...</div>}
    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

    <form onSubmit={handleSubmit} className="employee-form">
      <table className="table table-bordered" style={{ width: '500px' }}>
        <tbody>
          <tr>
            <th>Employee ID</th>
            <td>{formData.EmployeeID===0?'':formData.EmployeeID}
            <input
              type="hidden"
              name="EmployeeID"
              value={formData.EmployeeID}
              className="form-control"
            />
            </td>
          </tr>
          <tr>
            <th>Name</th>
            <td>
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className={`form-control ${validationErrors.Name ? 'is-invalid' : ''}`}
                required
              />
              {validationErrors.Name && (
              <div className="invalid-feedback">{validationErrors.Name}</div>
            )}
            </td>
          </tr>
          <tr>
            <th>Start Date</th>
            <td>
              <input
                type="date"
                name="Start_Date"
                className="form-control"
                value={formData.Start_Date.split('T')[0]}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>End Date</th>
            <td>
              <input
                type="date"
                name="End_Date"
                className="form-control"
                value={formData.End_Date.split('T')[0]}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>Status</th>
            <td>
              <select
                name="Status"
                className="form-control"
                value={formData.Status}
                onChange={handleChange}
              >
                <option value="0">Active</option>
                <option value="1">Inactive</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>Attrition</th>
            <td>
              <select
                name="Attrition"
                className="form-control"
                value={formData.Attrition}
                onChange={handleChange}
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>City</th>
            <td>
            <select
              name="CityId"
              value={formData.CityId}
              onChange={handleChange}
              className={`form-select ${validationErrors.CityId ? 'is-invalid' : ''}`}
            >
              <option value="">-- Select a Country --</option>
              {cities.map((city) => (
                <option key={city.CityId} value={city.CityId}>
                  {city.City_Name}
                </option>
              ))}
            </select>
            {validationErrors.CityId && (
              <div className="invalid-feedback">{validationErrors.CityId}</div>
            )}
        
            </td>
          </tr>
          <tr>
            <th>Country</th>
            <td>{formData.City?.Country}</td>
          </tr>

          <tr>
            <th>SAP ID</th>
            <td>
            <input
                type="text"
                name="SAPID"
                value={formData.SAPID && formData.SAPID !== 'null' ? formData.SAPID : ''}
                onChange={handleChange}
                className={`form-control ${validationErrors.SAPID ? 'is-invalid' : ''}`}
              />
              {validationErrors.SAPID && (
              <div className="invalid-feedback">{validationErrors.SAPID}</div>
            )}
            </td>
          </tr>
        
          <tr>
          <td colSpan="2" className="text-left">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {submitting ? 'Updating...' : '        '}
            <button type="button" onClick={() => navigate('/employee/List/'+formData.Status)} className="btn btn-secondary">
              Cancel
            </button>
          </td>
        </tr>
        </tbody>
      </table>     
    </form>
  </div>
  );
};

export default EmployeeDetailComponent;