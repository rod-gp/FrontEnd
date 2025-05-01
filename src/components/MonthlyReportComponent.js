import React, { useState, useEffect } from 'react';
import { Table, Form } from 'react-bootstrap';
import maritzProjectDataService from "../services/maritzProject.service";
import EmployeeProjectDataService from "../services/employeeProject.service";
import FinanceDataService from '../services/finance.service';
import dds from "../services/dashboard.service.js";
import { NumericFormat } from "react-number-format";

const MonthlyReport = () => {

    const [selectedYear, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setMonth] = useState('');
    const [pnlData, setPnlData] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]); 
    const [employees, setEmployees] = useState([]);
    const [daysPerMonth, setDaysPerMonth] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const response = await EmployeeProjectDataService.getEmployeesAssignedToProject(selectedProject);
                if (response && response.data) {
                    setEmployees(response.data);
                } else {
                    console.error('No employee data found');
                    setEmployees([]);  // Set an empty array if no data is returned
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
                setEmployees([]);  // Set an empty array if there is an error
            }
        };
    
        // Only fetch data if selectedProject is valid
        if (selectedProject) {
            fetchData();
        }
    }, [selectedProject]); 

    useEffect(()  => {
        const getData= async ()=>{
            if(!selectedMonth) return;

            const theDate = selectedYear+'-'+selectedMonth+'-01';
            const res = await dds.getPLbyMonth(theDate);
            setPnlData(res.data);          
            
            const projectList = await maritzProjectDataService.getAllProjects();              
            setProjects(projectList.data);
      
            const response = await FinanceDataService.getDaysPerMonth(selectedYear);
            
            console.log(response.data.length );
            console.log("selectedMonth:", selectedMonth);

            if(response.data && response.data.length > 0)  {
                const days = response.data.find((item) => {
                    const itemMonth = new Date(item.Date).getUTCMonth() + 1; 
                    console.log("Item Month:", itemMonth);
                
                    return Number(itemMonth) === Number(selectedMonth);
                });

                if (days) {
                    console.log(days.Days); // Log the found days
                    setDaysPerMonth(days.Days); // Set the days in state
                } else {
                    console.log("No data found for the selected month");
                }

            }                  
                    


        }
        
        getData();

    },[selectedMonth]);

    function getProjectById(projectID) {
        const tmp = projects.find(project => parseInt(project.Maritz_ProjectID) === parseInt(projectID));    
        return tmp;
    }

    function getNameById(empID) {
        if (!Array.isArray(employees) || employees.length === 0) {
            return empID; // Or handle accordingly
        }

        const tmp = employees.find(emp => parseInt(emp.EmployeeID) === parseInt(empID));    
        if (tmp && tmp.Employee && tmp.Employee.Name) {
            return tmp.Employee.Name;
        } else {
            return empID; // Or handle accordingly
        }
    }

    const filtered = selectedProject
        ? pnlData.filter(d => d.Maritz_ProjectID === parseInt(selectedProject))
        : [];

    const filteredEmployee = selectedProject
        ? pnlData.filter(d =>(d.Maritz_ProjectID === parseInt(selectedProject) && d.Color === "Direct_Cost"))
        : [];
    
    const groupedSums = filtered.reduce((acc, item) => {
        const key = item.Color;
        if (!acc[key]) {
          acc[key] = { amount: 0, hours: 0 };
        }
        
        const amount = Number(item.amount);
        const hours = Number(item.hours);

        if (key === "Direct_Cost") {
            acc[key].amount += amount * hours;
            acc[key].hours += hours;
          } else {
            acc[key].amount += amount;
            acc[key].hours += hours;
          }
        
        return acc;
      }, {});

      const infrastructureCost = Object.keys(groupedSums).reduce((total, color) => {
        if (color === 'Direct_Cost' && groupedSums[color]?.hours) {          
          return total + (groupedSums[color].hours * (140/(daysPerMonth*8)));
        }
        return total;
      }, 0);

      const totalHours = filteredEmployee.reduce((total, item) => total + item.hours, 0);
      const totalCost = filteredEmployee.reduce((total, item) => total + item.amount*item.hours, 0);

      const grossMargin =
      (groupedSums["Revenue"]?.amount ?? 0) -
      (groupedSums["Direct_Cost"]?.amount ?? 0) -
      (groupedSums["Other_Cost"]?.amount ?? 0)-
        infrastructureCost;
    
    
    return(

        <div className="container mt-4">
            <h3>Monthly Report</h3>
            <div className="row w-75">
                <div className="col align-items-center">
                    <label className="me-2 fw-bold">Select the date:</label>  
                </div>
                <div className="col">
                    <select className="form-select" 
                      
                        value={selectedYear}
                        onChange={(e) => {
                            setYear(e.target.value);                
                        }}
                        
                    >
                    <option disabled>Select a year</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    </select>
                </div>
                <div className="col">
                    <select 
                        className="form-select" 
                        value={selectedMonth}
                        onChange={(e) => {
                            setMonth(e.target.value);                
                        }}
                    >
                        <option value="">Select a month</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>
            </div> 


            <div className="row w-75">
                {projects.length>0 && (
                    <Form.Group controlId="projectSelect">
                    
                        <Form.Label>Select Project:</Form.Label>
                    
                        <Form.Select
                        value={selectedProject || ''}
                        onChange={(e)=> setSelectedProject(e.target.value)}
                        >
                        <option value="">-- Select Project --</option>
                        {projects.map(id => (
                            <option key={id.Maritz_ProjectID} value={id.Maritz_ProjectID}>{id.Project_Name}</option>
                        ))}
                        </Form.Select>
                        
                    </Form.Group>
                )}
            </div>
            
                {selectedProject &&   (
                  <div className="row mt-4">  
                   
                    <h5>Profit & Loss Report for {getProjectById(selectedProject).Project_Name}</h5>
                    <div className="col-6 mt-2">
                        <Table striped bordered 
                        style={{ width:'500px', fontSize: '16px', padding: '0.5rem' }}
                        size="sm">
                            <thead>
                            <tr>
                                <th>Employee ID ({daysPerMonth*8} hrs Expected)</th>
                                <th>Hours</th>
                                <th align="right">Cost</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredEmployee.map((item) => (
                            <tr key={item.EmployeeID}>
                                <td>{getNameById(item.EmployeeID)}</td>
                                <td align="center">
                                <NumericFormat                     
                                    value=  {item.hours}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix=""
                                    />             
                                    
                                   </td>
                                <td  align="right"> <NumericFormat                     
                                    value= {item.hours * item.amount }
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                                    />                   
                                    </td>
                            </tr>
                            ))}
                            <tr>
                                <td><strong>Total</strong></td>
                                <td align="center"><strong>
                                <NumericFormat                     
                                    value= {totalHours}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix=""
                                    />            
                                    </strong></td>
                                <td align="right"><strong>
                                <NumericFormat                     
                                    value= {totalCost}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                                    />        
                                    </strong></td>
                            </tr>
                            </tbody>

                        </Table>
                    </div>

                    <div className="col-3 mt-2">
                        <Table striped bordered 
                        style={{ width:'300px', fontSize: '16px', padding: '0.5rem' }}
                        size="sm">
                        
                            <tbody>
                                {["Revenue", "Direct_Cost", "Other_Cost"].map(color => (
                                <tr key={color}>
                                <td>{color}</td>               
                                <td align='right'>
                                    <NumericFormat                     
                                    value= {groupedSums[color]?.amount.toFixed(2) ?? "0.00"}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                                    />                    
                                    </td>
                                </tr>
                                ))}
                                <tr >
                                    <td>Infrastructure</td>
                                    <td align='right'> <NumericFormat                     
                                    value= {infrastructureCost}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                                    />
                                    </td>
                                </tr>
                                <tr style={{ fontWeight: "bold", borderTop: "2px solid #000" }}>
                                    <td>Gross Margin</td>
                                    <td align='right'>  <NumericFormat                     
                                    value= {grossMargin}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                                    />

                                        </td>
                                </tr>
                                <tr style={{ fontWeight: "bold", borderTop: "2px solid #000" }}>
                                    <td>Gross Margin %</td>
                                    <td align='right'>
                                    <NumericFormat                     
                                    value= {(grossMargin.toFixed(2)/groupedSums["Revenue"]?.amount.toFixed(2))*100}
                                    displayType="text"
                                    thousandSeparator={false}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    suffix="%"
                                    />
                                        </td>
                                </tr>

                            </tbody>
                        </Table>
                    </div>
                  </div>  
                )}
            </div>  

       

    );
}
export default MonthlyReport;