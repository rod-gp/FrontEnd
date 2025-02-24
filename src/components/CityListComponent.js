import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CityDataService from "../services/city.service";

const CityListComponent = () => {
  
  const [cities, setCities] = useState([]);

  useEffect((ss) => {
    CityDataService.getCities()
    .then((response) => setCities(response.data))
    .catch((error) => console.error('Error fetching list of Cities:', error));
}, []);

  return (
 
    <div className="container mt-4">
        <table className="table table-striped table-sm" style={{ width: '500px' }}>
        <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>City Name</th>
          <th>Country</th>
          <th align ='center'>Action</th>
        </tr>
        </thead>
        <tbody>
            {cities.map((city) => (
            <tr key={city.CityID}>
                <td valign='middle'>{city.CityID}</td>
                <td valign='middle'>{city.City_Name}</td>
                <td valign='middle'>{city.Country}</td>
                <td valign='middle' ><Link to={`/city/${city.CityID}`} 
                className="btn btn-primary"
                style={{ '--bs-btn-padding-y': '.01rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }} >
                
                Edit</Link></td>
            </tr>
        ))}
        </tbody>
        </table>
    </div>


  );
};

export default CityListComponent;