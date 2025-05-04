import React, { useState, useEffect } from 'react';
import Constants from '../constants/Constants';
import maritzProjectDataService from "../services/maritzProject.service";
import { NumericFormat } from "react-number-format";

const DMAllocation = () =>{

    const [DMiD, setDMID] = useState('');
    const [projects, setProjects] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

const handleDMChange = async (dm) =>{
    try{
        setDMID(dm);
        const projData = await maritzProjectDataService.getAllProjects();
        const fiteredproj = projData.data.filter(proj => ( Number(proj.DMID) === Number(dm) && 
                                                         Number(proj.Active) === 1));
        const gt = fiteredproj.reduce((acc, item) => acc + Number(item.Monthly_Rate), 0);
        setGrandTotal(gt);
        setProjects(fiteredproj);
    }

    catch (error) {
        console.error("Failed to fetch or filter projects:", error);
    }

}

const grouped = {};

projects.forEach(project => {
  const wbs = project.Softtek_Project.Project_WBS;
  if (!grouped[wbs]) {
    grouped[wbs] = [];
  }
  grouped[wbs].push(project);
});



const handleChange = (theValue, MPID) => {
    setProjects((prevProy) =>
      prevProy.map((proj) =>
        proj.Maritz_ProjectID === MPID
          ? { ...proj, DM_Allocation: theValue }
          : proj
      )
    );
  };

const doSave = async() =>{
    try{
        await Promise.all(
        projects.map(project =>
           maritzProjectDataService.update(project.Maritz_ProjectID, project)
            )
        );
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);

    }
    catch(e){
        setSuccess(true);
        setErrorMessage('Error saving projects:'+e);
        setTimeout(() => setSuccess(false), 2000);
    }
}


return(
    <div className="container-fluid  mt-4">
        <h3>DM Allocation</h3>
        <div className="row">
                <div className="col d-flex justify-content-start align-items-center">
                    <label className="fw-bold">Delivery Manager:</label>
                        <select
                        className="form-select d-inline-block w-auto"
                        value={DMiD}
                        onChange={(e)=> {handleDMChange(e.target.value)}}
                        >
                        <option value="">Select a DM</option>
                        {Constants.DMS.map((dmls) => (
                            <option key={dmls.DMID} value={dmls.DMID}>{dmls.DMName}</option>    

                        ))}
                        </select>
                </div>                    
        </div>
        {success && <div className="alert alert-success">Save successfull!</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      
      
      {projects && projects.length > 0 &&   (
        <>      
        <div className="row">
            <div className="col-8 d-flex justify-content-start align-items-center mt-4">
            <table className='table small'>
                <thead>
                    <tr className='table-dark'>
                        <th>WBS</th>
                        <th>Project</th>
                        <th>Revenue (%)</th>
                        <th>Allocation (%)</th>
                    </tr>                    
                </thead>
                <tbody>

                {Object.entries(grouped).map(([wbs, entries]) => {
                        const subtotal = entries.reduce((acc, e) => acc + Number(e.Monthly_Rate), 0);

                return (
                    <React.Fragment key={wbs}>
                    {entries.map((row, idx) => {
                        const allocation = ((row.Monthly_Rate / subtotal) * 100).toFixed(2);
                        return (
                        <tr key={idx}>
                            <td>{row.Softtek_Project.Project_WBS}</td>
                            <td>{row.Project_Name}</td>
                            <td ><NumericFormat 
                                    value= {row.Monthly_Rate}                                                      
                                    displayType="text"                                  
                                    thousandSeparator={true}
                                    prefix="$"
                                    decimalScale={2}  // Allows up to 2 decimal points
                                    fixedDecimalScale={true} // Keep decimals fixed at two places
                                    allowNegative={false}  // Optional: Disable negative values if you don't want them
                                    maxLength={10} // Allows a max of 12 digits
                                    />  
                                </td>
                            <td><NumericFormat 
                                    value= {allocation}                                                      
                                    style={{ fontSize: "12px", textAlign: "right",width: "80px" }} 
                                    onValueChange={(e)=> {handleChange(e.floatValue, row.Maritz_ProjectID)}}
                                    thousandSeparator={true}
                                    suffix="%"
                                    decimalScale={2}  
                                    fixedDecimalScale={true} 
                                    allowNegative={false}  
                                    maxLength={7} 
                                    /> 
                                    </td>
                        </tr>
                        );
                    })}
                    <tr className="table-secondary fw-bold">
                        <td colSpan={2}>Subtotal for {wbs}</td>
                        <td ><NumericFormat 
                                value= {subtotal}                                                      
                                displayType="text"                                  
                                thousandSeparator={true}
                                prefix="$"
                                decimalScale={2}  // Allows up to 2 decimal points
                                fixedDecimalScale={true} // Keep decimals fixed at two places
                                allowNegative={false}  // Optional: Disable negative values if you don't want them
                                maxLength={10} // Allows a max of 12 digits
                                        />  (
                                <NumericFormat 
                                    value= {(subtotal/grandTotal)}                                                      
                                    displayType="text"     
                                    thousandSeparator={true}
                                    suffix="%"
                                    decimalScale={2}  
                                    fixedDecimalScale={true} 
                                    allowNegative={false}  
                                    maxLength={6} 
                                    />)
                                        
                                        
                                        </td>
                        <td align='center'>100%</td>
                    </tr>
                    </React.Fragment>
                );
                })}
                    <tr className="table-dark fw-bold">
                    <td colSpan={2}>Grand Total</td>
                    <td><NumericFormat 
                            value= {grandTotal}                                                      
                            displayType="text"                                  
                            thousandSeparator={true}
                            prefix="$"
                            decimalScale={2}  // Allows up to 2 decimal points
                            fixedDecimalScale={true} // Keep decimals fixed at two places
                            allowNegative={false}  // Optional: Disable negative values if you don't want them
                            maxLength={10} // Allows a max of 12 digits
                            />            
                    </td>
                    <td>-</td>
                    </tr>
                </tbody>

                </table>
                </div>
                <div className="row">
                <div className="col-8 d-flex justify-content-start align-items-center mt-4">
                <button type="submit" className="btn btn-primary" onClick={doSave}>Save Allocations</button>
            </div></div>
        </div>
       </>)} 
</div>
);

}
export default DMAllocation;