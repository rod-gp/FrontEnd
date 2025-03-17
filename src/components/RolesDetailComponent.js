import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RoleDataService from "../services/role.service";

const RolesDetailComponent = () => {
    
    const { id } = useParams(); 
    const navigate = useNavigate(); // To redirect after successful update
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    
    const seniorityLevels = ["Trainee", "Junior", "Proficient", "Senior", "Staff"];
    const practice = ["AMS","Analytics","Digital","ERP","ITIS","QA"];
    const [formData, setFormData] = useState({
      RoleID: 0,
      Role_Name: '',
      Seniority: '',
      Practice: ''
  });

  useEffect(() => {

    const fetchRole = async () => {
      try {
        if (id === '0') {
          return;
        }
        const response = await RoleDataService.getRole(id);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching Role:', error);
        setErrorMessage('Failed to load Role details.');
      }
    };

    fetchRole();
  }, [id]);
    
  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidationErrors({}); // Clear previous errors

    const errors = validateForm();    
    if (Object.keys(errors).length > 0) {
      console.log('object errors');
      setValidationErrors(errors);
      return;
    }

    try {
 
      if (id === '0') {
          await RoleDataService.create(formData);
          setSuccess(true);
          setTimeout(() => navigate(`/role`), 2000); // Redirect after 2 seconds
          return;
      }

      await RoleDataService.update(id,formData);
      setSuccess(true);
      setTimeout(() => navigate(`/role`), 2000); // Redirect after 2 seconds
  }   catch (error) {
      console.error('Error updating Role:', error);
      setErrorMessage('Failed to update Role.');
  }finally {

  }
  }

  const validateForm = () => {
    const errors = {};
   // if (!formData.Role_Name.trim()) errors.Role_Name = 'Name is required.';  
   // if (!formData.Seniority.trim()) errors.Seniority = 'Seniority is required.';  
   // if (!formData.practice.trim()) errors.Practice = 'Practice is required.';  

    return errors;
  }


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: type === 'checkbox' ? checked : value,
        }))};

  
    if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;

    return(
            
        <div className="container mt-4" >
        <h2>Role Details</h2>
        
        {success && <div className="alert alert-success">Role {id==='0'?'Created':'updated'}  successfully! Redirecting...</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="manager-form">
        <table className="table table-bordered" style={{ width: '500px' }}>
        <tbody>
          <tr>
            <th>Role ID</th>
            <td>{id==='0'?'':formData.RoleID}
            <input
              type="hidden"
              name="RoleID"
              value={formData.RoleID}
              className="form-control"
            />
            </td>
          </tr>
          <tr>
            <th>Description</th>
            <td>
              <input
                type="text"
                name="Role_Name"
                value={formData.Role_Name}
                onChange={handleChange}
                className={`form-control ${validationErrors.Role_name ? 'is-invalid' : ''}`}
                required
              />
              {validationErrors.Name && (
              <div className="invalid-feedback">{validationErrors.Role_name}</div>
            )}
            </td>
          </tr>

        <tr>
            <td>
                Seniority
            </td>
            <td>
                <select
                        name = "Seniority"
                        className="form-control"
                        value={formData.Seniority}
                        onChange={handleChange}
                        required >
                        <option value="">Select a level</option>
                        {seniorityLevels.map((level) => (
                        <option key={level} value={level}>
                            {level}
                        </option>
                        ))}
                </select>
            </td>
        </tr>
        <tr>
            <td>
                Practice
            </td>
            <td>
                <select
                        name = "Practice"
                        className="form-control"
                        value={formData.Practice}
                        onChange={handleChange}
                        required >
                        <option value="">Select a Practice</option>
                        {practice.map((practice) => (
                        <option key={practice} value={practice}>
                            {practice}
                        </option>
                        ))}
                </select>
            </td>
        </tr>
        </tbody>
        </table>

        <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary" >
              {id==='0'?'Create Role':'Update Role'}
            </button>

            <button type="button" className="btn btn-secondary" 
            
            onClick={() => navigate(`/role`)}
            >
              Cancel
            </button>
          </div>
          </form>
        </div>

    );

};

export default RolesDetailComponent;

