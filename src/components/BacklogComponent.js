import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import maritzProjectDataService from "../services/maritzProject.service";
import financeDataService from "../services/finance.service";
import Constants from "../constants/Constants";
import employeeProjectDataService from '../services/employeeProject.service';
import { NumericFormat } from "react-number-format";

const BacklogComponent =() => {

    const [activeProjectId, setActiveProjectId] = useState("");
    const [theProject, setTheProject] = useState("");
   
    const [recordType, setRecordType] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    
    const [visible, setVisible] = useState(false);
    const [projects, setProjects] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [workingDays, setWorkingDays] = useState([]);
    const [peopleProject, setPeopleProject] = useState([]);
    const [formattedData, setFormattedData] = useState([]);
    const [editedData, setEditedData] = useState([]);

    const { type } = useParams(); 
    const [colorOfMoney, setColorOfMoney] = useState(type);
    



    //get all projects 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [marProjects, workdays] = await Promise.all([
                
                maritzProjectDataService.getAllProjects(),
                financeDataService.getDaysPerMonth(year)
            
            ]);

                const onlyActiveProjects = marProjects.data.filter(project => project.Active === 1);


                setProjects(onlyActiveProjects);
                setWorkingDays(workdays.data);
            }
            catch(error){ 
                console.error('Error fetching list of Projects:', error);
            }
        }
        fetchData();
    }, [type]);

    function getProjectById(projectID) {

        const tmp = projects.find(project => parseInt(project.Maritz_ProjectID) === parseInt(projectID));
        
        setTheProject(tmp); 
        
        return tmp;
    }

    const handleProjectChange = async (e) => {
        setActiveProjectId(e.target.value);
        await employeeProjectDataService.getEmployeesAssignedToProject(e.target.value)
        .then((response) => {
            setPeopleProject(response.data);
            getProjectById(e.target.value);               
            setVisible(false);
        })        
        .catch((e) => {
            console.error(e);
        })   
    };
    
    const handleDateChange = (e) => {
        setYear(e.target.value);
        setVisible(false);
    };
    
    
    const handleRecordTypeChange = (e) => {
        setRecordType(e.target.value);
        setVisible(false);
    };

    const formatMonth = (month, year) => {
        const date = new Date(`${month} 1, ${year}`);
        const monthAbbr = date.toLocaleString('en-US', { month: 'short' });  // Get abbreviated month name (e.g., Jan, Feb, etc.)
        const yearShort = date.getFullYear().toString().slice(-2); // Get last two digits of the year
        return `${monthAbbr}/${yearShort}`;
      };

    const getBacklog = async () => {
        try {       
            setBacklog([]);
            setFormattedData([]);
            setEditedData([]);

            const bcklog = await financeDataService.getBacklog(activeProjectId, year,colorOfMoney,recordType,);

            setBacklog(bcklog.data);              
            setVisible(true);

        } catch (error) {
            console.error('Error fetching backlog:', error);
        }
    };
    
    // useEffect to trigger the transformation when the backlog data is updated
    useEffect(() => {
            const transformedData =  backlog.reduce((acc, entry) => {
                const { EmployeeID,  Employee, Monthly_Rate, Date: theDate } = entry;
                const Name = Employee?.Name; 
    
                const dateObj = new Date(theDate); // Parse the ISO string
                const parsedDate = new Date(Date.UTC(
                    dateObj.getUTCFullYear(),
                    dateObj.getUTCMonth(),
                    dateObj.getUTCDate()+1
                ));
               
                // If the Date is invalid, log the error or handle it
                
                if (isNaN(parsedDate)) {
                    console.error(`Invalid Date format: ${parsedDate}`);
                    return acc;  // Skip this entry or handle the error as necessary
                }
                const monthIndex = parsedDate.getMonth();
            
                // Initialize the EmployeeID entry if it doesn't exist
                if (!acc[EmployeeID]) {
                    acc[EmployeeID] = { EmployeeID, Name, Monthly_Rates: Array(12).fill(0) };
                }
            
                // Update the Monthly_Rates array for the given month
                acc[EmployeeID].Monthly_Rates[monthIndex] = Monthly_Rate;
            
                return acc;
            }, {});

        // Add employees without data
        peopleProject.forEach(employee => {
            if (!transformedData[employee.EmployeeID]) {
                // If the employee doesn't have any data, add an entry with their name
                transformedData[employee.EmployeeID] = {
                    EmployeeID: employee.EmployeeID,
                    Name: employee.Employee?.Name,
                    Monthly_Rates: Array(12).fill(0), // Assuming zero rates for months without data
                };
            }
        });

        setFormattedData(Object.values(transformedData));
    
        
    }, [backlog],[formattedData]);


    const handleInputChange = (employeeId, monthIndex, field, value) => {
        setEditedData((prevState) => ({
          ...prevState,
          [employeeId]: {
            ...prevState[employeeId],
            [monthIndex]: {
              ...prevState[employeeId]?.[monthIndex],
              [field]: value,
            },
          },
        }));
      };


      const calculate = () => {

        const theDate = formattedData.map(row => {
  
            const empData = peopleProject.find(employee => 
                parseInt(employee.EmployeeID) === parseInt(row.EmployeeID)
            );

            if (!empData || !empData.Role.Ratecards[0]) {
                console.warn(`Missing data for EmployeeID: ${row.EmployeeID}`);
                return row; // Return the original row if data is missing
            }

                            
            const rc = empData.Role.Ratecards.find(rc => rc.Country === empData.Employee.City.Country);

            const updatedMonthlyRate = row.Monthly_Rates.map((_, monthIndex) => {

                if(theProject.SOW_Name ==="Staff Augmentation"){
                    const hrRate = parseFloat(rc.Hourly_Rate);
                    const wd = workingDays.find(wd => parseInt(wd.WDMID) === monthIndex + 1);
                    return wd ? hrRate * parseFloat(wd.Days) * 8 : 0;
                }
                else{                    
                    return parseFloat(rc.Monthly_Rate) || 0;
                }

                
            });
    
            return {
                ...row,
                Monthly_Rates: updatedMonthlyRate,
            };
   
        });

        setFormattedData(theDate);
      }

      const handleSave = async () => {
        try {
            const updatedData = formattedData.map(employee => {
                const { EmployeeID, Monthly_Rates } = employee;
                
                // Check if there are edited data for this employee
                if (editedData[EmployeeID]) {
                    // Loop through the months and update the Monthly_Rates if available
                    Object.keys(editedData[EmployeeID]).forEach(monthIndex => {
                        // Adjust the index (month starts from 0 for January, so subtract 1 to get the correct month index)
                        const month = parseInt(monthIndex, 10) ;
                        const monthlyRate = editedData[EmployeeID][monthIndex].Monthly_Rate;
                        
                        // Update the Monthly_Rates array
                        if (monthlyRate) {
                            Monthly_Rates[month] = parseFloat(monthlyRate.replace(/[^0-9.-]+/g, "")); // Remove any non-numeric characters (e.g., '$')
                        }
                    });
                }
        
                // Return the updated employee data
                return {
                    ...employee,
                    Monthly_Rates
                };
            });
            //console.log(updatedData);

            await financeDataService.updateBacklog(activeProjectId, year, colorOfMoney,recordType,updatedData);
   
        } catch (error) {
          console.error("Error saving data:", error);
        }
      };


    return(

        <div className="container-fluid  mt-4">
            <h2>{type} Data</h2>
            
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
                    >
                        <option value="">Select a Project </option>  
                        {projects.map((project) => (
                            <option key={project.Maritz_ProjectID} value={project.Maritz_ProjectID}>
                            {project.Project_Name}
                        </option>
                    ))}
                    </select>
                </div>
                
               
                <div className="col d-flex justify-content-end align-items-center">
                
                    <label className="fw-bold">Record Type:</label>
                    <select
                    name="Record_Type" 
                    className="form-select d-inline-block w-auto" 
                    value={recordType}
                    onChange={handleRecordTypeChange}                 
                    >
                        <option value=""> Type </option>
                        {Constants.RECORD_TYPE.map((practice, index) => (
                            <option key={index} value={practice}>{practice}</option>
                        ))}
                    </select> 
                
                </div>
                <div className="col d-flex justify-content-end align-items-center">
                    <button className="btn btn-primary m-1 " onClick={getBacklog} disabled={!(activeProjectId && year && colorOfMoney && recordType)}>Get Backlog</button>
                    <button className="btn btn-primary m-1 " onClick={calculate} disabled={!(activeProjectId && year && colorOfMoney && recordType)}>Calculate</button>
                </div>
        
                <div className='row '>
                    <div className='col '>
                    <label className='text-center'>  {theProject && <>Project Type: <b>{theProject.SOW_Name}</b></>}</label>
                    </div>
                    <div className='col '>
                        <label className='text-center'> {theProject && theProject.SOW_Name !=="Staff Augmentation" && <> Original Monthly Rate: <b>{
                        
                        <NumericFormat 
                                value={ theProject.Monthly_Rate}                         
                                displayType="text"
                                thousandSeparator={true}
                                prefix="$"
                                decimalScale={2}
                                fixedDecimalScale={true}
                            />
                        } </b> </>}</label>
                    </div>
                    <div className='col '>
                        
                        <label> {theProject&& <> Softtek WBS: <b> {theProject.Softtek_Project?.Project_WBS }</b></> }  </label>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                    <label className='text-center'> {theProject && <> Manager: <b>{theProject.Manager?.Name} </b></>}</label>
                    </div>
                    <div className='col'>
                        <label> {theProject && <> Softtek Practice: <b>{theProject.Softtek_Project?.Practice }</b></> } </label>
                    </div>

                    <div className='col'>
                        <label> {theProject && <> Softtek WBS Name: <b>{theProject.Softtek_Project?.Project_Name }</b></> } </label>
                    </div>
                </div>
            </div>

            {visible && (
            <div className="row">
        
            <table className="table small"  >
                <thead>
                    <tr><th colSpan="13" style={{ height: '60px' }}></th></tr>                    
                </thead>
                <tbody>

                { theProject.SOW_Name ==="Staff Augmentation" &&(
                    <tr className="table-dark" style={{ height: '20px' }}>
                        <td style={{ fontSize: "10px", width: '20%' }}><b>Working Days</b></td>
                        {workingDays.map(month => (
                            <td key={month.WDMID} align='center' style={{ fontSize: "10px",textAlign: "center"  }}   ><b>{month.Days}</b></td>
                        ))}                    
                    </tr>
                    ) 
                }


                <tr className="table-dark">
                    <td style={{ fontSize: "11px", width: '20%' }}><b>Employee</b></td>
                        {Constants.MONTHS.map(month => (
                            <td key={month} align='center' style={{ fontSize: "11px",textAlign: "center"  }} ><b>{formatMonth(month, year)}</b></td>
                        ))}
                </tr>   
                    {formattedData.map(({ EmployeeID, Name, Monthly_Rates }) => (
                    <tr key={EmployeeID}>
                        <td>{Name}</td>
                        {Monthly_Rates.map((rate, index) => (
                        <td key={index}>
                            <NumericFormat 
                                value={rate}                   
                                style={{ fontSize: "12px",padding: "3px 1px",textAlign: "right"  }}             
                                onChange={(e) => handleInputChange(EmployeeID, index, "Monthly_Rate", e.target.value)}
                                className={"form-control"}
                                thousandSeparator={true}
                                prefix=""
                                decimalScale={2}
                                fixedDecimalScale={true}
                            />
                      </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
 
                <tfoot>
                    <tr>
                    <td><strong>Total</strong></td>
                    {
                        
                    Array.from({ length: 12 }).map((_, monthIndex) => {
                        const total = formattedData.reduce(
                            (sum, { Monthly_Rates }) => sum + parseFloat(Monthly_Rates[monthIndex] || 0),
                        0
                        );
                        
                        return (
                        <td key={monthIndex} style={{ textAlign: "right", fontWeight: "bold" }}>
                            <NumericFormat 
                            value={total}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            />
                        </td>
                        );
                    })}
                    </tr>
                </tfoot>


                </table>        
                <button onClick={handleSave}>Save Changes</button>     
            </div>
        )}
        </div>
    


    ); 

};

export default BacklogComponent;