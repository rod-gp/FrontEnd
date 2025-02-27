import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManagerDataServices from '../services/manager.service';

const  ManagerDetailComponent= () => {
  const { id } = useParams(); // Get the manager ID from the URL
  const navigate = useNavigate(); // To redirect after successful update

  const [manager, setManager] = useState({
    Name: '',
    ManagerID: '',
    Company: '',
    Cost_Center:'',
    Active: false,
    Reports_To: null
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managerlist, setManagerList] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch companies list from API
  useEffect(() => {
        ManagerDataServices.getCompanies()
        .then((response) => setCompanies(response.data))
        .catch ((error) => console.error('Error fetching companies:', error));    
  }, []);

  // Fetch Manager list from API
  useEffect(() => {
    ManagerDataServices.getManagers()
    .then((response) => setManagerList(response.data))
    .catch ((error) => console.error('Error fetching managers:', error));  

  }, []);



  
  useEffect(() => {

    const fetchManager = async () => {
      try {
        const response = await ManagerDataServices.getManagerById(id);
        setManager(response.data);
      } catch (error) {
        console.error('Error fetching manager:', error);
        setErrorMessage('Failed to load manager details.');
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [id]);
  
    // Filter managers based on activeFilter state
  const filteredManagers = managerlist.filter((manager) => {
      return manager.Active === 1 ;
  });



  
  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!manager.Name.trim()) errors.Name = 'Name is required.';
    if (!Number(manager.ManagerID)) errors.ManagerID = 'Manager ID is not a number.';
    if (!manager.Company.trim()) errors.Company = 'Company is required.';
    
  //  if (!manager.Cost_Center.trim()) errors.Cost_Center = 'Cost Center is required.';

    if (!Number(manager.Cost_Center)) errors.Cost_Center = 'Cost Center is not a number.';

    // Validate Reports_To (Must be a number or null)
  
    if (manager.Reports_To !== '' && isNaN(Number(manager.Reports_To))) {
      errors.Reports_To = 'Reports To must be a number or left blank.';
    }

    return errors;
  };

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setManager((prevManager) => ({
      ...prevManager,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({}); // Clear previous errors
    const errors = validateForm();    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);

    // Convert empty string to null for Reports_To
    const updatedManager = {
      ...manager,
      Reports_To: manager.Reports_To === '' ? null : manager.Reports_To
    };

    
    try {
        await ManagerDataServices.update(id,updatedManager);
        setSuccess(true);
        setTimeout(() => navigate(`/manager/list/${updatedManager.Active === 1 ? 'active' : 'inactive'}`), 2000); // Redirect after 2 seconds
    }   catch (error) {
        console.error('Error updating manager:', error);
        setErrorMessage('Failed to update manager.');
    }finally {
        setSubmitting(false);
    }
  };


  if (loading) return <div className="text-center">Loading manager details...</div>;
  if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;

  return (


    <div className="container mt-5">
    <div className="card shadow-lg p-4">
      <h2 className="text-center mb-4">Update Manager</h2>

        {success && <div className="alert alert-success">Manager updated successfully! Redirecting...</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="manager-form">
          {/* Manager ID */}
          <div className="form-group mb-3">
            <label htmlFor="ManagerID" className="form-label">Manager ID:</label>
            <input
              type="hidden"
              name="ManagerID"
              value={manager.ManagerID}
              className="form-control"
            />
            <p className="form-control-static">{manager.ManagerID}</p>
          </div>

          {/* Name */}
          <div className="form-group mb-3">
            <label htmlFor="Name" className="form-label">Name:</label>
            <input
              type="text"
              name="Name"
              value={manager.Name}
              onChange={handleChange}
              className={`form-control ${validationErrors.Name ? 'is-invalid' : ''}`}
              required
            />
            {validationErrors.Name && (
              <div className="invalid-feedback">{validationErrors.Name}</div>
            )}
          </div>


          {/* Company Dropdown */}
          <div className="form-group mb-3">
            <label htmlFor="Company" className="form-label">Company:</label>
            <select
              name="Company"
              value={manager.Company}
              onChange={handleChange}
              className={`form-select ${validationErrors.Company ? 'is-invalid' : ''}`}
            >
              <option value="">-- Select a Company --</option>
              {companies.map((company) => (
                <option key={company.Company} value={company.Company}>
                  {company.Company}
                </option>
              ))}
            </select>
            {validationErrors.Company && (
              <div className="invalid-feedback">{validationErrors.Company}</div>
            )}
          </div>

          {/* Cost Center */}
          <div className="form-group mb-3">
            <label htmlFor="Cost Center" className="form-label">Cost Center:</label>
            <input
              type="text"
              name="Cost_Center"
              value={manager.Cost_Center}
              onChange={handleChange}
              className={`form-control ${validationErrors.Cost_Center ? 'is-invalid' : ''}`}
              required
            />
            {validationErrors.Cost_Center && (
              <div className="invalid-feedback">{validationErrors.Cost_Center}</div>
            )}
          </div>





          {/* Active Checkbox */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              name="Active"
              checked={manager.Active}
              onChange={handleChange}
              className="form-check-input"
              id="Active"
            />
            <label className="form-check-label" htmlFor="Active">Active</label>
          </div>

          {/* Reports To Dropdown */}
          <div className="form-group mb-3">
            <label htmlFor="Reports_To" className="form-label">Reports To:</label>

            <select
              name="Reports_To"
              value={manager.Reports_To}
              onChange={handleChange}
              className={`form-select ${validationErrors.Reports_To ? 'is-invalid' : ''}`}
            >
              <option value="">-- Select a Manager --</option>
              {filteredManagers.map((manlst) => (
                <option key={manlst.ManagerID} value={manlst.ManagerID}>
                  {manlst.Name} 
                </option>
              ))}
            </select>
            {validationErrors.Reports_To && (
              <div className="invalid-feedback">{validationErrors.Reports_To}</div>
            )}
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Manager'}
            </button>

            <button type="button" className="btn btn-secondary" 
            
            onClick={() => navigate(`/manager/list/${manager.Active === 1 ? 'active' : 'inactive'}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default ManagerDetailComponent;