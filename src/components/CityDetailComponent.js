import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CityDataService from "../services/city.service";



const  CityDetailComponent= () => {
  const { id } = useParams(); // Get the city ID from the URL
  const navigate = useNavigate(); // To redirect after successful update

  const [city, setCity] = useState({
    City_Name: '',
    CityId: '',
    Country: ''
  });
  
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await CityDataService.getCountries();
        setCountries(response.data); 
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
  
    fetchCountries();
  }, []);


  useEffect(() => {
    if (!id) return; // Prevent API call if ID is missing
   

    const fetchCity = async () => {
      setLoading(true); // Set loading state at the beginning
      try {
        const response = await CityDataService.getCity(id);
        setCity(response.data);
      } catch (error) {
        console.error('Error fetching City:', error);
        setError('Failed to load City details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCity();

  }, [id]);

  

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!city.City_Name.trim()) errors.City_Name = 'City Name is required.';
    if (!city.Country.trim()) errors.Country = 'Country is required.';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCity((prevCity) => ({
      ...prevCity,
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
    
    try {
        CityDataService.update(id,city);
        setSuccess(true);
        setTimeout(() => navigate('/city'), 2000); // Redirect after 2 seconds
    } catch (error) {
        console.error('Error updating City:', error);
        setError('Failed to update City.');
    }finally {
        setSubmitting(false);
    }
  };


  if (loading) return <div>Loading City details...</div>;
  if (error) return <div className="error-message">{error}</div>;


  return (

    <div className="container mt-4">
    <h2>Update City</h2>
    {success && <p className="text-success">City updated successfully! Redirecting...</p>}
  {error && <p className="text-danger">{error}</p>}

     
        
      <form onSubmit={handleSubmit}  className="update-form">
  
      <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered">

      <tbody>
        {/* City ID (Readonly) */}
        <tr>
          <td><strong>City ID:</strong></td>
          <td>
            {city.CityId}
            <input type="hidden" name="CityID" value={city.CityID} />
          </td>
        </tr>

  {/* City Name Input */}
  <tr>
          <td><strong>Name:</strong></td>
          <td>
            <input
              type="text"
              name="City_Name"
              value={city.City_Name}
              onChange={handleChange}
              className={`form-control ${validationErrors.City_Name ? 'is-invalid' : ''}`}
              required
            />
            {validationErrors.City_Name && <div className="invalid-feedback">{validationErrors.City_Name}</div>}
          </td>
        </tr>


      {/* Country Dropdown */}
      <tr>
          <td><strong>Country:</strong></td>
          <td>
            <select
              name="Country"
              value={city.Country}
              onChange={handleChange}
              className={`form-control ${validationErrors.Country ? 'is-invalid' : ''}`}
            >
              <option value="">-- Select a Country --</option>
              {countries.map((country) => (
                <option key={country.Country} value={country.Country}>
                  {country.Country}
                </option>
              ))}
            </select>
            {validationErrors.Country && <div className="invalid-feedback">{validationErrors.Country}</div>}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="text-center">
            <button type="submit" disabled={submitting} className="btn btn-primary me-2">
              {submitting ? 'Updating...' : 'Update City'}
            </button>
            <button type="button" onClick={() => navigate('/city')} className="btn btn-secondary">
              Cancel
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
      </form>
    </div>
  );
};

export default CityDetailComponent;