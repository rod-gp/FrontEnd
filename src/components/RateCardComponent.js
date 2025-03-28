import React, { useState, useEffect } from 'react';
import CityDataService from "../services/city.service";
import RoleDataService from "../services/role.service";
import Constants from "../constants/Constants";
import RatecardDataService from "../services/ratecard.service";
import { NumericFormat } from "react-number-format";
import { FaTrash } from "react-icons/fa"; // Import the trash icon



const RateCardComponent =() => {

    const [roles, setRoles] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedPractice, setSelectedPractice] = useState("");
    const [selectedSeniority, setSelectedSeniority] = useState("");
    const [rateRows, setRateRows] = useState([]);
    const [validated, setValidated] = useState(false); //
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');    


    useEffect(() => {
        const fetchData = async () => { 
            try {
                const [countryList, rolesList, rowsList] = await Promise.all([
                    CityDataService.getCountries(),
                    RoleDataService.getRoles(),
                    RatecardDataService.find()
                ]); 
                setCountries(countryList.data);
                setRoles(rolesList.data);
                setRateRows(rowsList.data);
            }
              catch (error) {
                console.error("Error fetching countries:", error);
             }
        };
      
        fetchData();
      }, []);

      
      const dateChange = (e, index) => {
        const { name, value } = e.target;
       
        setRateRows(prevState => 
          prevState.map((item, i) => 
            i === index ? { ...item, [name]: value } : item
          )
        );
      };
      
      const handleAddRow = () => {
        setRateRows((prevRows) => [
          ...prevRows,
          {
            RatecardID: Date.now(),
            Monthly_Rate: 0,
            Hourly_Rate: 0,
            Start_Date: "",
            End_Date: "",
            Country: "",
            RoleID: null,
            Practice :selectedPractice,
            Seniority:selectedSeniority,
          },
        ]);
      };
    
      const validateFields = () => {
        let isValid = true;
        const updatedRows = rateRows.map((row) => {
          if (
            !row.RoleID ||
            !row.Monthly_Rate ||
            !row.Hourly_Rate ||
            !row.Country ||
            !row.Start_Date ||
            !row.End_Date
          ) {
            isValid = false;
            return { ...row, isValid: false };
          }
          return { ...row, isValid: true };
        });
    
        setRateRows(updatedRows);
        setValidated(true);
        return isValid;
      };


      const handleSave = () => {
        if (!validateFields()) {
            
            setErrorMessage("Please fill in all required fields.");
            setTimeout(() => setErrorMessage(""), 2000);
            return;
        }
        try{
          setValidated(false);
          const cleanedData = rateRows.map(({ RatecardID, ...rest }) => rest);
         
          const response = RatecardDataService.create(cleanedData);
          console.log(response.statusText);
          if (response.statusText) {
            setSuccess(true); 
            setTimeout(() => setSuccess(false), 2000);            
        } else {
            setSuccess(false);
            setErrorMessage("Failed to save the ratecard.");
        }



        }
        catch(error){
          console.error('Error creating Ratecard:', error);
        }

      };

      const handleDeleteRow = (index) => {
        setRateRows((prevRows) => prevRows.filter((_, i) => i !== index));
      };

    return(
        <div className="container mt-4">

        {success && <div className="alert alert-success">Ratecard saved successfully!</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <div className='row'>
            <div className='col'>
                <h2>Ratecard</h2>
            </div>
            
            <div className='col'>
              <select
                    name="Practice" 
                    className="form-control" 
                    value={selectedPractice}
                    onChange={(e) => setSelectedPractice(e.target.value)}           
                    >
                      <option value="">-- Select Practice --</option>

                      {Constants.PRACTICE.map((practice, index) => (
                      <option key={index} value={practice}>
                        {practice}</option>
                     ))}
                </select> 
            </div>

            <div className='col'>
              <select
                    name="Seniority" 
                    className="form-control" 
                    value={selectedSeniority}
                    onChange={(e) => setSelectedSeniority(e.target.value)}                 
                    >
                  <option value="">-- Seniority --</option>

                      {Constants.SENIORITYLEVELS.map((practice, index) => (
                      <option key={index} value={practice}>
                        {practice}</option>
                     ))}
                </select> 
            </div>

            <div className='col'>
                <button className="btn btn-primary mb-3" onClick={handleAddRow}>Add Row</button>
            </div>


          </div>
        <form>
        <table className="table bordered table-sm" style={{ width: '900px' }}>
        <thead className="table-dark">
        <tr>
       
            <th style={{ width: '20%' }}>Role</th>
            <th style={{ width: '15%' }}>Monthly Rate</th>
            <th style={{ width: '15%' }}>Hourly Rate</th>
            <th style={{ width: '15%' }}>Country</th>
            <th style={{ width: '15%' }}>Start Date</th>
            <th style={{ width: '15%' }}>End Date</th>
            <th style={{ width: '5%' }}></th>
        </tr>
        </thead>
    
        <tbody>
        {rateRows.map((item, index) => {
            // Filter roles **only** for the current row using its stored Practice & Seniority
            const filteredRoles = roles.filter((role) => {
              return (
                (item.Practice ? role.Practice === item.Practice : true) &&
                (item.Seniority ? role.Seniority === item.Seniority : true)
              );
            });
            return (  

            <tr key={item.RatecardID || index}>                
                                            
                 <td>
                 <input type="hidden" name="Practice" value={item.Practice} />                
                    <input type="hidden" name="Seniority" value={item.Seniority} />     
                 <select
                    name="RoleID"
                    className={`form-control ${validated && !item.RoleID ? "is-invalid" : ""}`}
                    value={item.RoleID || ""}
                    onChange={(e) => dateChange(e, index)}
                    >
                    <option value="">-- Role --</option>
                      {filteredRoles.map((roles) => (
                      <option key={roles.RoleID} value={roles.RoleID}>
                        {roles.Role_Name}
                      </option>
                     ))}
                    </select>  
                    {!item.RoleID && validated && <div className="invalid-feedback">Role is required.</div>}
                    </td>
            
                    <td align='center'>

                <NumericFormat
                    name="Monthly_Rate"
                    value={rateRows[index].Monthly_Rate}
                    onValueChange={(values) => {
                      const { value } = values;
                      setRateRows((prevState) =>
                        prevState.map((item, i) =>
                          i === index ? { ...item, Monthly_Rate: value } : item
                        )
                      );
                    }}
                    className={`form-control ${validated && !item.Monthly_Rate ? "is-invalid" : ""}`}
                    thousandSeparator={true}
                    prefix="$"
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                       {!item.Monthly_Rate && validated && (
                    <div className="invalid-feedback">Monthly Rate is required.</div>
                  )}
                </td>
                <td>
                <NumericFormat
                    name="Hourly_Rate"
                    value={rateRows[index].Hourly_Rate}
                    onValueChange={(values) => {
                      const { value } = values;
                      setRateRows((prevState) =>
                        prevState.map((item, i) =>
                          i === index ? { ...item, Hourly_Rate: value } : item
                        )
                      );
                    }}
                    className={`form-control ${validated && !item.Hourly_Rate ? "is-invalid" : ""}`}
                    thousandSeparator={true}
                    prefix="$"
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                  {!item.Hourly_Rate && validated && (
                    <div className="invalid-feedback">Hourly Rate is required.</div>
                  )}
                </td>
            <td>

            <select
                    name="Country"
                    className={`form-control ${validated && !item.Country ? "is-invalid" : ""}`}
                    value={item.Country}
                    onChange={(e) => dateChange(e, index)}
                    >
                    <option value="">-- Country --</option>
                      {countries.map((ctry) => (
                      <option key={ctry.Country} value={ctry.Country}>
                        {ctry.Country}
                      </option>
                     ))}
                    </select> 
                    {!item.Country && validated && <div className="invalid-feedback">Country is required.</div>}

            </td>
                <td valign='middle' style={{ width: '10%' }}>
                  <input name ='Start_Date' style={{width: '130px'}} type ='date' onChange={(e) => dateChange(e, index)} value={item.Start_Date?.split("T")[0] || ""} 
                  className={`form-control ${validated && !item.Start_Date ? "is-invalid" : ""}`}
                   />
                  {!item.Start_Date && validated && (
                    <div className="invalid-feedback">Start Date is required.</div>
                  )}
                   
                   </td>
                <td valign='middle' style={{ width: '10%' }}>
                  
                  <input name ='End_Date' style={{width: '130px'}} type ='date' onChange={(e) => dateChange(e, index)} value={item.End_Date?.split("T")[0] || ""} 
                  className={`form-control ${validated && !item.End_Date ? "is-invalid" : ""}`}
                  />
                  {!item.End_Date && validated && (
                    <div className="invalid-feedback">End Date is required.</div>
                  )}
                  </td>
                  
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteRow(index)}
                  >
                    <FaTrash />
                  </button>
                </td>
            </tr>
        
        )            
        })}  
       
      

        </tbody>
    </table>
    </form>
    <button className="btn btn-primary mt-3" onClick={handleSave}> Save </button>

   </div>


    );
};
export default RateCardComponent;