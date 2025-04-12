import React, { useState, useEffect } from 'react';
import FinanceDataService from '../services/finance.service';


const DaysPerMonthComponent =() => {

    const [daysPerMonth, setDaysPerMonth] = useState([]);
    const [year, setYear] = useState('');
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isNewYear, setIsNewYear] = useState(true);
    
    useEffect(() =>{
        if(!year){
            return;
        }

        FinanceDataService.getDaysPerMonth(year)
            .then((response) =>{
                if(response.data && response.data.length > 0){
                    setIsNewYear(false);
                    setDaysPerMonth(response.data);
                }
                else{
                    setIsNewYear(true);
                    setDaysPerMonth(Array(12).fill(null).map((_, index) => ({
                        WDMID: index,  Date: new Date(year, index, 2), Days: 0
                      })));
                }
            })
            .catch((error) => console.error('Error fetching list of years:', error));
        }, [year, isNewYear]);
    
        const handleChange = (e, index) => {
            const { value } = e.target;
        
            setDaysPerMonth((prevData) => 
                prevData.map((item, i) => 
                    i === index ? { ...item, Days: value } : item
                )
            );
        };

        const handleYearChange = (e) => {
            setYear(e.target.value);
          };


        const handleSubmit = async (e) => {            
            
                console.log('year:', year);
                console.log('daysPerMonth:', daysPerMonth);
                e.preventDefault();
                
                // Save or Update
                if(isNewYear){
                    try {
                        const cleanedData = daysPerMonth.map(({ WDMID, ...rest }) => rest);
                        const response = await FinanceDataService.createDaysPerMonth(cleanedData);
                        setSuccess(true);                        
                        setErrorMessage('');
                        setTimeout(() => setSuccess(false), 2000);
                    }
                    catch (error) {
                        setTimeout(() => setSuccess(false), 2000);
                        setErrorMessage("Error creating days per month"+error);
                    }

                }
                else{
                    try {
                        const response = await FinanceDataService.updateDaysPerMonth(year, daysPerMonth);
                        setSuccess(true);                        
                        setErrorMessage('');
                        setTimeout(() => setSuccess(false), 2000);
                    } catch (error) {                        
                        setTimeout(() => setSuccess(false), 2000);
                        setErrorMessage("Error saving days per month"+error);
                    }
                    
                }
        };

    return(

        <div className="container mt-4">
                    
                <div className="mb-3 content-center">
                <label className="me-2 fw-bold">Select the Year:</label>
                <select
                className="form-select d-inline-block w-auto"
                value={year}
                onChange={handleYearChange}
                >
                <option value="">-- Select a Year --</option>
                    <option key='2025' value='2025'>2025</option>
                    <option key='2026' value='2026'>2026</option>
                    <option key='2027' value='2027'>2027</option>
                    <option key='2028' value='2028'>2028</option>
                    <option key='2029' value='2029'>2029</option>
                </select>
            </div>



            {success && <div className="alert alert-success">Days Saved Successfully</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="days-form">
                <table className="table table-striped table-sm" style={{ width: '250px' }}>
                <thead className="table-dark">
                <tr>
                <th style={{ width: '60%' }}>Month</th>
                <th style={{ width: '40%' }}>Days</th>
                </tr>
                </thead>
                <tbody>
                {daysPerMonth
                     .sort((a, b) => new Date(a.Date).getMonth() - new Date(b.Date).getMonth()) 
                     .map((item, index) => (
                   <tr key={item.WDMID}>
                    <td valign='middle'>{new Date(item.Date).toLocaleString('en-US', { month: 'long' })}</td>
                   <td>
                       <input className="form-control"  onChange={(e) => handleChange(e, index)}  style={{ textAlign: 'center' }} type='text' value={item.Days} />
                    </td>
                  </tr>
                  ))}
                  
                       
                   
                </tbody>
                </table>
                <table className="table table-borderless table-sm" style={{ width: '250px' }}>
                   <tbody><tr><td align='right'>
                    <button type="submit" className="btn btn-primary"
                    style={{ width: '90px' }}
                    >Save</button>
                    </td></tr></tbody> 
                </table>
            
            </form>
        
        </div>


); 

};

export default DaysPerMonthComponent;