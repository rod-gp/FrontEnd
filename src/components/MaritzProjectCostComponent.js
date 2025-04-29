import React, { useState, useEffect } from 'react';
import maritzProjectDataService from "../services/maritzProject.service";
import mpcds from "../services/maritzProjectCost.service"
import Constants from "../constants/Constants";
import { NumericFormat } from "react-number-format";

const MaritzProjectCostComponent= () =>{

    const [year, setYear] =  useState('');
    const [activeProjectId, setActiveProjectId] = useState('');
    const [projects, setProjects] = useState([]);
    const [projectsCost, setProjectsCost] = useState([]);
    const [editedData, setEditedData] = useState([]);

    //get all projects 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [marProjects] = await Promise.all([            
                    maritzProjectDataService.getAllProjects(),        
                ]);

                setProjects(marProjects.data);           
            
            }
            catch(error){ 
                console.error('Error fetching list of Projects:', error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if(!activeProjectId) return;

            console.log(activeProjectId);
            try {
                const [marProjCost] = await Promise.all([            
                    mpcds.getCostByProjectId(activeProjectId),        
                ]);

                setProjectsCost(marProjCost.data);           
            
            }
            catch(error){ 
                console.error('Error fetching list of Project Cost:', error);
            }
        }
        fetchData();
    }, [activeProjectId]);

    const newCost=()=>{
       
        setProjectsCost(prev => [...prev,  
            {
            Cost_Name: "",
            Monthly_Rates: Array(12).fill(0),
            // You can add any other default fields needed here
            }
        ]);
        console.log(projectsCost.length)
    }

    const handleDateChange = (e) =>{
        setYear(e.target.value);
    }

    const handleProjectChange= (e) =>{
        setActiveProjectId(e.target.value);
    }
    
      const handleMonthlyRateChange = (rowIndex, monthIndex, value) => {
        setProjectsCost(prev => {
            const updated = [...prev];
            const monthlyRatesCopy = [...updated[rowIndex].Monthly_Rates];
            monthlyRatesCopy[monthIndex] = Number(parseValue(value));
            updated[rowIndex] = { ...updated[rowIndex], Monthly_Rates: monthlyRatesCopy };
            return updated;
        });
    };

   

      const handleCostNameChange = (index, value) => {
        setProjectsCost(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], Cost_Name: value };
            return updated;
        });
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedRows = [...projectsCost];
        updatedRows.splice(rowIndex, 1); // Remove the row at index
        setProjectsCost(updatedRows);     // Update state
      };

    const formatMonth = (month, year) => {
        const date = new Date(`${month} 1, ${year}`);
        const monthAbbr = date.toLocaleString('en-US', { month: 'short' });  // Get abbreviated month name (e.g., Jan, Feb, etc.)
        const yearShort = date.getFullYear().toString().slice(-2); // Get last two digits of the year
        return `${monthAbbr}/${yearShort}`;
      };

    const parseValue = (value) => {
        return parseFloat(value.replace('$', '').replace(',', ''));
    }
      
    const monthlyTotals = projectsCost.reduce((totals, item) => {
        if (!item.Monthly_Rates) return totals; // safety check
      
        item.Monthly_Rates.forEach((rate, idx) => {
          totals[idx] += parseFloat(rate) || 0;
        });
      
        return totals;
      }, Array(12).fill(0)); // initialize 12 zeros
    

      const doSave=()=>{
        

      }

    return(
        <div className="container-fluid  mt-4">
            <div className="row">
                <div className="col d-flex justify-content-start align-items-center">
                    <label className="fw-bold">Year:</label>
                    <select
                    className="form-select d-inline-block w-auto"
                    value={year}
                    onChange={handleDateChange}
                    >
                    <option value="">Select a Year</option>
                        <option key='2025' value='2025'>2025</option>
                        <option key='2026' value='2026'>2026</option>
                        <option key='2027' value='2027'>2027</option>
                        <option key='2028' value='2028'>2028</option>
                        <option key='2029' value='2029'>2029</option>
                    </select>
                </div>
                <div className="col d-flex justify-content-start align-items-center">                   
                    <label className="fw-bold">Project:</label>

                    <select
                        className="form-select d-inline-block w-auto"
                        value={activeProjectId}
                        onChange={handleProjectChange}
                        disabled={!(year)}
                    >
                        <option value="">Select a Project </option>  
                        {projects.map((project) => (
                            <option key={project.Maritz_ProjectID} value={project.Maritz_ProjectID}>
                            {project.Project_Name}
                        </option>
                    ))}
                    </select>
                </div>
            </div>
                      
            <div className="row">

            <table className="table small" style={{ width: '1500px' }} >
                <thead>
                    <tr><th colSpan="14" style={{ height: '60px' }}>
                    <button className="btn btn-primary" onClick={newCost} disabled={!(activeProjectId )}>New Cost</button></th></tr>                    
                </thead>
            <tbody>
            <tr className="table-dark">
                    <td style={{ fontSize: "11px", width: '10%' }}><b>Cost description  </b></td>
                        {Constants.MONTHS.map(month => (
                            <td key={month} align='center' style={{ fontSize: "11px",textAlign: "center"  }} ><b>{formatMonth(month, year)}</b></td>
                        ))}
                    <td style={{ fontSize: "11px", width: '2%' }}></td>
                </tr>   
            
                {projectsCost.map(( cost, index ) => (
                    <tr key={index}>
                      <td> 
                        <select
                         value={cost.Cost_Name}  
                         style={{ fontSize: "12px",padding: "3px 1px",textAlign: "right"  }} 
                         className={"form-control"}
                         onChange={(e) => handleCostNameChange(index,e.target.value)}
                        >
                         <option key="0" value="">Select a Cost</option>   
                         {Constants.COST_OPTIONS.map(option => {
                            const isAlreadySelected = 
                            projectsCost.some((item, idx) => item.Cost_Name === option.Cost_Name && idx !== index);
                            
                            return (
                            <option 
                                key={option.Cost_Name} 
                                value={option.Cost_Name} 
                                disabled={isAlreadySelected}
                            >
                                {option.Cost_Name}
                            </option>
                            );
                        })}

                        </select>                                   
                      </td>
                        {cost.Monthly_Rates.map((rate, monthIndex) => (
                        <td key={monthIndex}>
                        <NumericFormat 
                            value={rate}                   
                            style={{ fontSize: "12px", padding: "3px 1px", textAlign: "right" }}             
                            onChange={(e) => handleMonthlyRateChange(index, monthIndex, e.target.value)}
                            className={"form-control"}
                            thousandSeparator={true}
                            prefix="$"
                            decimalScale={2}  // Allows up to 2 decimal points
                            fixedDecimalScale={true} // Keep decimals fixed at two places
                            allowNegative={false}  // Optional: Disable negative values if you don't want them
                            maxLength={12} // Allows a max of 12 digits
                            disabled={!cost.Cost_Name} 
                        />
                      </td>
                        ))}
                    <td>
                        <button 
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: "10px", padding: "2px 6px", marginLeft: "5px" }}
                        onClick={() => handleDeleteRow(index)}
                        >
                        Delete
                        </button>
                    </td>                    
                    </tr>
                    ))}
            </tbody>            
            <tfoot className="table-light">
                <tr>
                <td style={{ fontWeight: 'bold' }}>Totals</td>
                {monthlyTotals.map((total, idx) => (
                    <td key={idx} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                  <NumericFormat 
                            value={total.toFixed(2)}       
                            displayType="text"            
                            style={{ fontSize: "12px", padding: "3px 1px", textAlign: "right" }}             
                            thousandSeparator={true}
                            prefix="$"
                            decimalScale={2}  // Allows up to 2 decimal points       

                        /> 
                
                </td>
                ))}
                <td style={{ fontSize: "11px", width: '2%' }}></td>
                </tr>
            </tfoot>
            </table>
            <div className="row">
                <div className="col-3">
                <button className="btn btn-primary" onClick={doSave} disabled={!(activeProjectId)}>Save</button>
                </div>
            </div>  
           
        </div>
        
        </div>
    );
}

export default MaritzProjectCostComponent;