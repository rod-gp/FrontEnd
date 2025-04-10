//import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import maritzProjectDataService from "../services/maritzProject.service";
import FinanceDataService from "../services/finance.service";
import { NumericFormat } from "react-number-format";

const InvoiceComponent =() => {

    const [selectedItem, setSelectedItem] = useState(null);
    const [filteredProjectRoster, setFilteredProjectRoster] = useState([]);
    const [selectedYear, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setMonth] = useState(new Date().getMonth()+1);
    const [projects, setProjects] = useState([]); 

    const [invoiceTotal, setInvoiceTotal] = useState(0);

    const [invoiceTotalTotal, setInvoiceTotalTotal] = useState(0);
    
    const [invoice, setInvoice] = useState([]);
   
    useEffect(()  => {
        const getProject = async () => {
            try{
                const projectList = await maritzProjectDataService.getAllProjects();
                const onlyActiveProjects = projectList.data.filter(project => project.Active === 1);
                setProjects(onlyActiveProjects);
            }
            catch(error){
                console.error('Error fetching list of Projects:', error);
            } 
        };
        getProject();
    }, []);

    const getData = async(item) =>{
        try{
            
            setSelectedItem(item);

            const response = await FinanceDataService.getBacklog(item.Maritz_ProjectID,selectedYear,'Backlog','Revenue');            
            const allData = response.data;
            const theDate = new Date(`${selectedYear}-${selectedMonth}-01`).toISOString().split('T')[0];
                 
            const filterData = allData
            .filter((item) => {
              const itemDate = new Date(item.Date).toISOString().split('T')[0];
              return itemDate === theDate;
            })
            .map((item) => {
              const deduction = parseFloat(0); // or some logic to calculate deduction
              
              return {
                ...item,
                Deduction: deduction,
                Monthly_Total: item.Monthly_Rate - deduction,
              };
            });

            setFilteredProjectRoster(filterData);
        }
        catch(error){
            console.error('Error filtering people on projects:', error);
        }
    };

    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('default', { month: 'long' }); 
      };

    useEffect(() =>{
       const theTotal = filteredProjectRoster.reduce(
        (sum, { Monthly_Total }) => sum + parseFloat( Monthly_Total || 0), 0);
        
        setInvoiceTotal(theTotal);
    },[filteredProjectRoster]);


    const addInvoice = () =>{
        const newInvoice = {
            Maritz_ProjectID: selectedItem.Maritz_ProjectID,
            Project_Name: selectedItem.Project_Name,
            Manager_Name: selectedItem.Manager.Name,
            Project_WBS: selectedItem.Softtek_Project.Project_WBS,
            Practice: selectedItem.Softtek_Project.Practice,
            Total: invoiceTotal,            
          };

        const tempInvoice = [...invoice, newInvoice]; 
        
        const theTotal = tempInvoice.reduce(
            (sum, { Total }) => sum + parseFloat( Total || 0), 0);
            
            setInvoice(tempInvoice);
            setInvoiceTotalTotal(theTotal);
    }

    const handleInputChange = (item, value) => {
        
        setFilteredProjectRoster((prevState) =>
          prevState.map((entry) =>{
            if(entry.BacklogID === item.BacklogID){
       
                const deduction = parseFloat(value.replace(/[^0-9.-]+/g, ""))  || 0;
                const monthlyRate = parseFloat(entry.Monthly_Rate) || 0;
                const monthlyTotal = monthlyRate - deduction;
       
                return { 
                    ...entry, 
                    Deduction: value,
                    Monthly_Total: monthlyTotal 
                    }; 
            }
            
            return entry;
            })
        );
      };

      const isProjectInInvoices = (projectID) => {
        return invoice.some((item) => item.Maritz_ProjectID === projectID);
      };

    return(
        <div className="container-fluid  border-primary mt-4">
            <h2>Invoices</h2>
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
                        <option disabled>Select a month</option>
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

            <div className="d-flex " style={{ height: "100vh" }}>
                
                <div className="border-end p-3" style={{ width: "220px", overflowY: "auto" }}>
                    <h5>Project</h5>
                    <ul className="list-group">
                        {projects.map((item, index) => (
                        <li
                            key={index}
                            className={`list-group-item  py-1 px-2 ${selectedItem === item ? 'active' : ''}`}
                            onClick={() => getData(item)}
                            style={{ cursor: "pointer", fontSize: "0.95rem" }}
                        >
                        {isProjectInInvoices(item.Maritz_ProjectID)?"✅":''} {item.Project_Name} 
                        </li>
                        ))}
                    </ul>
                </div>
     
                <div className="p-4 flex-grow-1">
                {selectedItem ? (
                    <div>
                    <h3>{selectedItem.Project_Name}</h3>
                    <table className="table table-borderless" style={{width:'600px'}}>
                        <tbody>
                        <tr >
                            <td className='p-1'><strong>Manager:</strong></td>
                            <td className='p-1' align="left"> {selectedItem.Manager.Name}</td>
                            <td className='p-1'><strong>Cost Center:</strong></td>
                            <td className='p-1' align="left"> {selectedItem.Manager.Cost_Center}</td>                            
                        </tr>
                        <tr>
                            <td className='p-1'><strong>WBS:</strong></td>
                            <td className='p-1' align="left">{selectedItem.Softtek_Project.Project_WBS}</td>
                            <td className='p-1'><strong>Monthly Rate:</strong></td>
                            <td className='p-1' align="left">
                             <NumericFormat 
                                    value={selectedItem.Monthly_Rate}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                             /></td>
                        </tr>
                        <tr>
                            <td className='p-1'><strong>Project Type:</strong> </td>
                            <td className='p-1'> {selectedItem.SOW_Name}</td>
                            <td className='p-1'><strong>Practice:</strong> </td>
                            <td className='p-1'> {selectedItem.Softtek_Project.Practice}</td>
                        </tr>
                        <tr>
                            <td colSpan='4' style={{height: '30px'}}></td>                            
                        </tr>
                        </tbody>
                    </table>

                    <div className="table-responsive">

                    <table className='table table-responsive small' style={{width:'600px'}}>
                        <thead>
                        <tr className="table-dark">
                            <th className="p-1" style={{width:'40%', borderTopLeftRadius: '5px'}}>Employee</th>
                            <th className="p-1 text-end" style={{width:'15%'}} >Monthly Rate</th>
                            <th className="p-1 text-end" style={{width:'15%'}}>Deductions</th>
                            <th className="p-1 text-end" style={{width:'15%', borderTopRightRadius: '5px'}}>Monthly total</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredProjectRoster && filteredProjectRoster.map((item)  => (
                            <tr key={item.BacklogID}> 
                            <td>{item.Employee.Name}</td>

                            <td className='text-end'> <NumericFormat 
                                    style={{ fontSize: "12px", textAlign: "right" }}
                                    value={item.Monthly_Rate}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                             /></td>
                             <td align="right">
                             <NumericFormat                                    
                                    value={item.Deduction}
                                    onBlur={(e) => handleInputChange(item, e.target.value || 0 )}
                                    style={{ fontSize: "12px", textAlign: "right",width: "80px" }}                                   
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                            />              


                             </td>
                             <td className='text-end'> <NumericFormat 
                                    style={{ fontSize: "12px", textAlign: "right" }}
                                    value={item.Monthly_Total}
                                    displayType="text"
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    prefix="$"
                             /></td>

                            </tr>
                        ))}

                        </tbody>
                        <tfoot  className="table-dark rounded-bottom">
                            <tr key='14'>
                            <td className="p-1 text-end fw-bold" style={{borderBottomLeftRadius: '5px'}}>Total</td>                        
                            <td colSpan='3' className="p-1 text-end fw-bold" style={{ borderBottomRightRadius: '5px' }}>
                                    <NumericFormat 
                                      value={invoiceTotal}
                                            displayType="text"
                                            thousandSeparator={true}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            prefix="$"
                                            />                                      
                            </td>
                        </tr>
                    </tfoot>
                    </table>

                    <button className="btn btn-primary m-1 " onClick={addInvoice} disabled={!(invoiceTotal && invoiceTotal > 0)}>Add Invoice</button>
                    </div>
                    </div>
                ) : (
                    <div className="text-muted">Select an item to view details</div>
                )}
                </div>
                
                <div className="p-4 flex">

                { invoice &&  invoice.length > 0 && (
                    <>
                    <h5>{getMonthName(selectedMonth)} Invoice</h5>

                    <table className='table table-responsive small' style={{width:'300px'}}>
                            <thead>
                            <tr className="table-dark">
                                <th className="p-1" style={{borderTopLeftRadius: '5px'}}>Project</th>
                                <th className="p-1 text-end" style={{borderTopRightRadius: '5px'}}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                            { invoice.map((line, index)=>
                                <tr key={index}>
                                    <td>{line.Project_Name}</td>
                                    <td align="right">
                                    
                                        <NumericFormat 
                                        value= {line.Total}
                                                displayType="text"
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                prefix="$"
                                                />                                      

                                    </td>
                                </tr>                        
                                )
                            }
                            </tbody>

                            <tfoot  className="table-dark rounded-bottom">
                                <tr key='14'>
                                <td  className="p-1 text-end fw-bold" style={{borderBottomLeftRadius: '5px'}}>Total</td>                        
                                
                                <td className="p-1 text-end fw-bold" style={{ borderBottomRightRadius: '5px' }}>
                                        <NumericFormat 
                                        value={invoiceTotalTotal}
                                                displayType="text"
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                prefix="$"
                                                />                                      
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    </>) }

                </div>

            </div>
        </div>

    );
};

export default InvoiceComponent;