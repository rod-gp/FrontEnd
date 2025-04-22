import React, { useState, useEffect } from "react";
import maritzProjectDataService from "../services/maritzProject.service";
import FinanceDataService from "../services/finance.service";
import { NumericFormat } from "react-number-format";
import { FaTrash } from "react-icons/fa"; // Import the trash icon

const InvoiceComponent =() => {

    const [selectedItem, setSelectedItem] = useState(null);
    const [filteredProjectRoster, setFilteredProjectRoster] = useState([]);
    const [selectedYear, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setMonth] = useState(new Date().getMonth()+1);
    const [projects, setProjects] = useState([]); 
    const [invoiceTotal, setInvoiceTotal] = useState(0);
    const [invoiceTotalTotal, setInvoiceTotalTotal] = useState(0);
    const [invoice, setInvoice] = useState([]);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
   
    
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
              const deduction = parseFloat(0); // 
              
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

    useEffect(()  => {
        getData(selectedItem);
    },[selectedMonth]);


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
            Softtek_ProjectID: selectedItem.Softtek_ProjectID,
            Project_Name: selectedItem.Project_Name,
            Manager_Name: selectedItem.Manager.Name,
            ManagerID: selectedItem.ManagerID,
            Project_WBS: selectedItem.Softtek_Project.Project_WBS,
            Practice: selectedItem.Softtek_Project.Practice,
            Roster: filteredProjectRoster,
            Total: invoiceTotal,            
          };

        const tempInvoice = [...invoice, newInvoice]; 

        setInvoice(tempInvoice);
        
    }




    useEffect(() =>{
        const calculateTotal = () => {
            const totot =  invoice.reduce(
                (sum, { Total }) => sum + parseFloat( Total || 0), 0);
                setInvoiceTotalTotal(totot);
        };

        calculateTotal();
    },[invoice]);

const doSave = async () => {

    const invoiceEntries = invoice.flatMap(project =>
        project.Roster.map(item => ({
          EmployeeID: item.EmployeeID,
          Maritz_ProjectID: project.Maritz_ProjectID,
          Color_of_Money: "Invoice",
          Record_Type: "Revenue",
          Monthly_Rate: item.Monthly_Total.toFixed(2), // or leave as number if backend handles it
          Date: new Date(selectedYear, selectedMonth - 1, 1).toISOString() // JS months are 0-based
        }))
      );
    
   // console.log(invoiceEntries);
    try{
        const fds = await FinanceDataService.saveInvoice(invoiceEntries);
       setSuccess(true);
       setTimeout(() => setSuccess(false), 2000);
    }
    catch(error){
        setSuccess(true);
        setErrorMessage('Error saving the invoice:'+error);
        setTimeout(() => setSuccess(false), 4000);
    }
    
}


const bottomTable = () => {
    const normalizeProjectName = (name) => {
        if (!name) return "Unknown";
        if (name.includes("CFS")) return "CFS";
        if (name.includes("Auto")) return "Automotive";
        if (name.includes("Product Eng.")) return "Product Eng.";
        if (name.includes("Kademi")) return "Kademi";        
        return name; 
      };
  
    // Step 1: Normalize project names in a pre-processed invoice
    const normalizedInvoice = invoice.map(item => ({
      ...item,
      Normalized_Project_Name: normalizeProjectName(item.Project_Name)
    }));
  
    // Step 2: Collect unique project names and WBS codes
    const projectName = [...new Set(normalizedInvoice.map(item => item.Normalized_Project_Name))];
    const wbsCodes = [...new Set(normalizedInvoice.map(item => item.Project_WBS))];

    // Step 3: Initialize column totals
    const columnTotals = {};
    projectName.forEach(name => (columnTotals[name] = 0));
    let grandTotal = 0;
  
    // Step 4: Build rows
    const rows = wbsCodes.map(wbs => {
      const row = { Project_WBS: wbs };
      let rowTotal = 0;
  
      projectName.forEach(projName => {
        const filtered = normalizedInvoice.filter(
          item => item.Project_WBS === wbs && item.Normalized_Project_Name === projName
        );
  
        const total = filtered.reduce(
          (sum, item) => sum + parseFloat(item.Total || 0),
          0
        );
  
        row[projName] = total;
        rowTotal += total;
        columnTotals[projName] += total;
        grandTotal += total;
      });
  
      row.rowTotal = rowTotal;
      return row;
    });

    return { projectName, rows, columnTotals, grandTotal };
  };
  

  //  const { managers, rows, columnTotals, grandTotal }= bottomTable();
    const { projectName, rows, columnTotals, grandTotal }= bottomTable();

    const sortedRows = rows.sort((a, b) => {
        if (a.Project_WBS < b.Project_WBS) return -1;
        if (a.Project_WBS > b.Project_WBS) return 1;
        return 0;
      });

 

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

      const handleDeleteRow = (index) => {
        setInvoice((prevRows) => prevRows.filter((_, i) => i !== index));

      };

      const isProjectInInvoices = (projectID) => {
        return invoice.some((item) => item.Maritz_ProjectID === projectID);
      };

    return(
        <div className="container-fluid" style={{ width: "1600px"}}>
            <h2>Invoices</h2>
            <div className="row w-75">
            {success && <div className="alert alert-success">Save successfull!</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

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
                
                <div className="border-end p-1" style={{ width: "200px"}}>
                    <h5>Project</h5>
                    <ul className="list-group">
                        {projects.map((item, index) => (
                        <li
                            key={index}
                            className={`list-group-item  py-1 px-2 ${selectedItem === item ? 'active' : ''}`}
                            onClick={() => getData(item)}
                            style={{ cursor: "pointer", fontSize: "0.80rem" }}
                        >
                        {isProjectInInvoices(item.Maritz_ProjectID)?"✅":''} {item.Project_Name} 
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="container-fluid" style={{ flex: 1 }} >
                    <div className="row">
                    <div className="col-md-7">

                        <div className="p-4 flex-grow-1">
                        {selectedItem ? (
                            <div>
                            <h3>{selectedItem.Project_Name}</h3>
                            <table className="table table-borderless" style={{width:'700px'}}>
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

                            <table className='table table-responsive small' style={{width:'700px'}}>
                                <thead>
                                <tr className="table-dark">
                                    <th className="p-1" style={{width:'40%', borderTopLeftRadius: '5px'}}>Employee</th>
                                    <th className="p-1 text-end" style={{width:'15%'}} >Monthly Rate</th>
                                    <th className="p-1 text-end" style={{width:'15%'}}>Deductions</th>
                                    <th className="p-1 text-end" style={{width:'15%', borderTopRightRadius: '5px'}}>Monthly total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filteredProjectRoster && 
                                filteredProjectRoster
                                            .filter(item => Number(item.Monthly_Rate) !== 0)
                                            .map((item)  => (
                                    
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

                            <button className="btn btn-primary m-1 " onClick={addInvoice} disabled={!(invoiceTotal &&  !isProjectInInvoices(selectedItem.Maritz_ProjectID) && invoiceTotal > 0)}>Add Invoice</button>
                            </div>
                            </div>
                        ) : (
                            <div className="text-muted">Select an item to view details</div>
                        )}
                        
                        </div>

                        </div>
                        <div className="col-md-5">
                        <div className="p-4 flex">

                        { invoice &&  invoice.length > 0 && (
                            <>
                            <div class="d-flex justify-content-between p-1 gap-3" style={{width:'400px'}}>
                            <h3>{getMonthName(selectedMonth)} Invoice</h3>
                            <button 
                                type="button"
                                className="btn btn-primary btn-sm"                                
                                name='Save'
                                onClick={doSave}
                                > Save Invoices
                                    </button>
                            </div>
                            <table className='table table-responsive small' style={{width:'400px'}}>
                                    <thead>
                                    <tr className="table-dark">
                                        <th className="p-1" style={{width:'50%', borderTopLeftRadius: '5px'}}>Project</th>
                                        <th className="p-1 text-center" style={{width:'45%'}}> Total</th>
                                        <th className="p-1 text-end" style={{width:'5%', borderTopRightRadius: '5px'}}></th>
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
                                            <td>
                                                <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                                                    <button
                                                        className="btn btn-danger btn-sm p-1"
                                                        style={{ fontSize: "0.4rem" }}
                                                        onClick={() => handleDeleteRow(index)}
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={10} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>                        
                                        )
                                    }
                                    </tbody>

                                    <tfoot  className="table-dark rounded-bottom">
                                        <tr key='14'>
                                        <td  className="p-1 text-end fw-bold" style={{borderBottomLeftRadius: '5px'}}>Total</td>                        
                                        
                                        <td colspan="2" className="p-1 text-middle fw-bold" style={{ borderBottomRightRadius: '5px' }}>
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

                { invoice && projectName && projectName.length > 0 && invoice.length > 0 &&  (
                    <>
                    <div className="row">
                        <div className="col-12" style={{ maxWidth: "100%", overflowX: "auto" }}>
                       
                            <table className="table table-bordered table-sm " style={{ fontSize: "0.9rem", maxWidth:"1000px", minWidth: "600px", tableLayout: 'fixed'  }}>
                                <thead>
                                <tr className="table-dark">
                                    <th style={{ width: "120px", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Project WBS</th>
                                    {projectName.map((manager, index) => (
                                    <th style={{ width: "80px", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: "center", padding: "8px 8px" }} key={index}>{manager}</th>
                                    ))}
                                    <th style={{   width: "100px", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: "right", padding: "8px 8px" }}>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedRows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                    <td style={{ fontSize: "0.70rem" }}>{row.Project_WBS}</td>
                                    {projectName.map((manager, colIndex) => (
                                        <td style={{ fontSize: "0.70rem" }} align="right" key={colIndex}>
                                        {row[manager] === 0 ? (
                                            <span>--</span>
                                            ) : (
                                            <NumericFormat 
                                                value={row[manager].toFixed(2)}
                                                displayType="text"
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                prefix="$"
                                            />
                                            )}                                          
                                            </td>
                                    ))}
                                    <td style={{ fontSize: "0.70rem" }} align="right"><strong>
                                    <NumericFormat 
                                            value={row.rowTotal.toFixed(2)}
                                            displayType="text"
                                            thousandSeparator={true}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            prefix="$"
                                    />    
                                        
                                        </strong></td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <th>Total</th>
                                    {projectName.map((manager, index) => (
                                    <th style={{ fontSize: "0.8rem", textAlign: "right", padding: "4px 8px" }} key={index}><strong>

                                    <NumericFormat 
                                            value={columnTotals[manager].toFixed(2)}
                                            displayType="text"
                                            thousandSeparator={true}
                                            decimalScale={0}
                                            fixedDecimalScale={true}
                                            prefix="$"
                                    />

                                        
                                        
                                    </strong></th>
                                    ))}
                                    <th style={{ fontSize: "0.8rem", textAlign: "right", padding: "8px 8px" }}><strong>
                                    <NumericFormat 
                                            value={grandTotal.toFixed(2)}
                                            displayType="text"
                                            thousandSeparator={true}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            prefix="$"
                                    />
                                      </strong></th>
                                </tr>
                                </tfoot>
                            </table>

                        
                                
                            
                        </div>
                    </div>
                    </>) }
                </div>
            
            </div>
          

        </div>

    );
};

export default InvoiceComponent;