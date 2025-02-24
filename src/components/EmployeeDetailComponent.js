import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EmployeeDataService from "../services/employee.service";

const EmployeeDetailComponent = () => {
  


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate(); // To redirect after successful update

  const [employee, setEmployee] = useState({
    EmployeeID : '',
    Name: '',
    Status: '',
    Attrition: ''
    }
  );

  const { id } = useParams(); // Get EmployeeID from URL
  const [formData, setFormData] = useState({});

  useEffect(() => {
      
    if (!id) return; 

    const fetchEmployeeDetails = async () => {
        try{
            const response = await EmployeeDataService.getEmployee(id);
            //console.log("Fetched Employee Data:", response.data); 
            setFormData(response.data[0]);
          
        }
        catch(error) {
            console.error(`Error fetching Employee: ${id}`, error);
            setError('Failed to load Employee details.');
        }
    };

    fetchEmployeeDetails();
  }, [id]);

  // if (!formData) return <p>Loading...</p>;

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (Simulating API update)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Employee Data:", formData);
    alert("Employee details updated successfully!");
    // Here you can make an API request to save the updated data


    setSubmitting(true);
    setSubmitting(false);
  };

  if (!formData) return <p>Loading...</p>; 

  // Safely handling Date formatting (Date object)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based, so we add 1
    const day = String(date.getDate()).padStart(2, "0"); // Pad single digits with leading 0
    return `${year}-${month}-${day}`; // Format as yyyy-MM-dd
  };

  return (
  
    <div className="container mt-4">
    <h2>Employee Details</h2>
    <form onSubmit={handleSubmit}>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Employee ID</th>
            <td>{formData.EmployeeID}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>
              <input
                type="text"
                name="Name"
                className="form-control"
                value={formData.Name}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>Start Date</th>
            <td>
              <input
                type="date"
                name="Start_Date"
                className="form-control"
                value={formatDateForInput(formData.Start_Date)}
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
                value={formatDateForInput(formData.End_Date)}
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
              <input
                type="text"
                name="City_Name"
                className="form-control"
                value={formData.City?.City_Name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    City: { ...prev.City, City_Name: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Country</th>
            <td>{formData.City?.Country}</td>
          </tr>
          <tr>
            <th>Manager</th>
            <td>
              <input
                type="text"
                name="Manager_Name"
                className="form-control"
                value={formData.Manager?.Name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    Manager: { ...prev.Manager, Name: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Company</th>
            <td>{formData.Manager?.Company}</td>
          </tr>

          <tr>
          <td colSpan="2" className="text-left">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {submitting ? 'Updating...' : '        '}
            <button type="button" onClick={() => navigate('/employee/'+formData.Status)} className="btn btn-secondary">
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