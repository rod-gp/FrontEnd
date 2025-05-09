import React, { useState, useEffect } from 'react';
import maritzProjectDataService from "../services/maritzProject.service";
import dds from "../services/dashboard.service.js";
import { NumericFormat } from "react-number-format";
import Constants from "../constants/Constants";
import FinanceDataService from '../services/finance.service';

const HistoricReport = () =>{

    const [radioValue, setRadioValue] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedWBS, setSelectedWBS] = useState('');
    const [projects, setProjects] = useState([]); 
    const [stkProj, setStkProj] = useState([]);
    const [theContainer, setContainer] = useState('');
    const [pnlData, setPnlData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [theDates, setTheDates] = useState([]);
    const [projInWBS, setProjInWBS] = useState([]);
    const [daysInMonth, setDaysInMonths] = useState([]);
    const [aggregatedData, setAggregatedData] = useState([]);


    useEffect(() => {

       const fetchData = async () =>{
            const projectList = await maritzProjectDataService.getAllProjects();           
            setProjects(projectList.data);
            
            const seen = new Set();
            const stkProj = projectList.data
              .map(proj => proj.Softtek_Project)
              .filter(proj => {
                if (seen.has(proj.Softtek_ProjectID)) return false;
                seen.add(proj.Softtek_ProjectID);
                return true;
              });
            setStkProj(stkProj);
        }

        fetchData();

    }, []);

    useEffect(() =>{
        setSelectedProject('');
        setSelectedWBS('');

    },[radioValue])

    useEffect(() =>{       
       const fetchData= () => {
            const pIWBS = projects.filter(pro => Number(pro.Softtek_ProjectID) === Number(selectedWBS)); 
            setProjInWBS(pIWBS);       

            const dt = (pnlData.length>0) ? aggregateByDate(pnlData):[];        
            setAggregatedData(dt);
        }
        fetchData();

    },[selectedWBS,projects])

    useEffect(() =>{       
        const fetchData= () => { 
             const dt = (pnlData.length>0) ? aggregateByDate(pnlData):[];        
             setAggregatedData(dt);
         }
         fetchData();
 
     },[selectedProject,projects])
 

    useEffect(() =>{
        const getData = async() => {
         
            setPnlData([]);

            const now = new Date();            
            const containerToMonths = {
                '#cm': 1,
                '#l3m': 3,
                '#ytd': now.getUTCMonth() + 1, // Months are zero-based
                '#l12m': 12
              };

            const totalMonths = containerToMonths[theContainer] ?? '';

            const theDates = getLastNDates(Number(totalMonths));    
            const uniqueYears = [...new Set(theDates.map(date => new Date(date).getUTCFullYear()))];

            setTheDates(theDates);

            setLoading(true);


            const daysList =  (await Promise.all(
                uniqueYears.map(async td => FinanceDataService.getDaysPerMonth(td) )
                ))
                .map(response => response.data)
                .flat();


            
            setDaysInMonths(daysList);

            
            const thePnlData = (await Promise.all(
                theDates.map(async td => {
                  const result = await dds.getPLbyMonth(td);
                  if (!result || !Array.isArray(result.data)) {
                    console.error(`Expected an array in result.data, but received:`, result);
                    return [];  // Return an empty array if 'data' is not an array
                  }
                  return result.data.map(item => ({
                    ...item,
                    date: td
                  }));
                })
              )).flat();

            setLoading(false);           
           setPnlData(thePnlData);
           setAggregatedData(aggregateByDate(thePnlData));

        }
        getData();

    },[theContainer])

    function findWorkingDays(date) {
        const [year, month] = date.split('-');
      
        const match = daysInMonth.find(d => {
          const dDate = new Date(d.Date);
          return (
            dDate.getUTCFullYear().toString() === year &&
            String(dDate.getUTCMonth() + 1).padStart(2, '0') === month
          );
        });
      
        return match ? match.Days : 0;
      }

    function formatDate (date) {
        const d = new Date(date)
        const monthAbbr = d.toLocaleString('en-US', { month: 'short',timeZone: 'UTC' }); 
        const yearShort = d.getUTCFullYear().toString().slice(-2); 
        return `${monthAbbr}/${yearShort}`;
      };

    function getLastNDates(n) {
        const dates = [];
        const now = new Date();
        now.setUTCDate(1); 
        now.setUTCHours(0, 0, 0, 0);
      
        for (let i = 0; i < n; i++) {
          const year = now.getUTCFullYear();
          const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
          dates.push(`${year}-${month}-01`);
          now.setUTCMonth(now.getUTCMonth() - 1);
        }
        //console.log(dates);
        return dates;
      }

      function aggregateByDate(data) {
        const results = {};
      
        const selectedIDs = Array.isArray(projInWBS) && projInWBS.length > 0
        ? projInWBS.map(p => parseInt(p.Maritz_ProjectID))
        : [parseInt(selectedProject)];

        data
        .filter(item => selectedIDs.includes(item.Maritz_ProjectID))
        .forEach(item => {
          const { date, Color, hours, amount } = item;
      

          if (!results[date]) {
            results[date] = {
              date,
              Revenue: 0,
              Direct_Cost: 0,
              Other_Cost: 0,
              Infrastructure: 0,
              Total_Hours: 0
            };
          }
      
          // Sum up amounts
          if (Color === 'Revenue') {
            results[date].Revenue += amount;
          } else if (Color === 'Direct_Cost') {
            results[date].Direct_Cost += amount*hours;
          } else if (Color === 'Other_Cost') {
            results[date].Other_Cost += amount;
          }
      
          // Always sum hours for infrastructure
          results[date].Total_Hours += hours;
        });
      
        // Post-process each entry to compute calculated fields
        Object.values(results).forEach(entry => {
          entry.Infrastructure = entry.Total_Hours * (Constants.INFRASTRUCTURE[0].Cost/ (findWorkingDays(entry.date)*8));
          entry.Total_Cost = entry.Direct_Cost + entry.Other_Cost + entry.Infrastructure;
          entry.Gross_Margin = entry.Revenue - entry.Total_Cost;
          entry.Gross_Margin_Percent = entry.Revenue ? entry.Gross_Margin / entry.Revenue : 0;
      

        });
      
        //console.log(Object.values(results));
        return Object.values(results); 
      }

      const generateTransposedTable = (aggregateByDate) => {
        // Get all the dates from the aggregated data
        const dates = Object.keys(aggregateByDate);
        // Define the metrics you want to display in the table
        const metrics = [
          'Revenue',
          'Direct_Cost',
          'Other_Cost',
          'Infrastructure',
          'Total_Cost',
          'Gross_Margin',
          'Gross_Margin_Percent'
        ];
      
        // Return the table as JSX
        return (
          <div className="table-responsive">
            <table className="table table-bordered table-striped small" style={{width: '700px'}}>
              <thead>
                <tr className='table-dark'>
                  <th></th>
                  {dates.map(date => (                  
                    <th style={{textAlign: 'center'}} key={aggregateByDate[date].date}>{formatDate(aggregateByDate[date].date)} </th>                  
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric}>
                    <td>{metric}</td>
                    {dates.map(date => {
                      const data = aggregateByDate[date];
                      let value = data[metric];
      
                      // If it's Gross Margin Percentage, convert to percentage format
                      if (metric === 'Gross_Margin_Percent') {
                        return <td align='right' key={`${date}-${metric}`}> 
                        <NumericFormat                     
                            value=  {value*100}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            suffix="%"
                         /> 
                        
                        </td>
                      } else {
                      return <td align='right' key={`${date}-${metric}`}>
                         <NumericFormat                     
                            value=  {value}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            prefix="$"
                         />             
                        </td>;
                    }

                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      };
      


    return(
        <div className="container mt-4">
            <h3>Historic Report by WBS and Maritz Project</h3>
            <div className="row">
                <div className="col-2 d-flex flex-row align-items-center justify-content-around">
                    <div className="p-2">
                        <input type="radio" className="form-check-input" id="radio1" name="optradio" value="wbs" 
                        checked={radioValue === 'wbs'}
                        onChange={(e) => setRadioValue(e.target.value)} /> WBS
                    </div>
                    <div className="p-2">
                        <input type="radio" className="form-check-input" id="radio2" name="optradio" value="maritz"
                        checked={radioValue === 'maritz'} 
                        onChange={(e) => setRadioValue(e.target.value)}
                         /> Project
                    </div>
                </div>
                <div className="col-3 d-flex flex-row align-items-center ">                       
                {radioValue && projects.length>0 && (
                   radioValue ==='maritz' ? (                
                        <select
                                value={selectedProject || ''}
                                className="form-select" 
                                onChange={(e)=> setSelectedProject(e.target.value)}
                                >
                                <option value="">-- Select Project --</option>
                                {projects.map(id => (
                                    <option key={id.Maritz_ProjectID} value={id.Maritz_ProjectID}>{id.Project_Name}</option>
                                ))}
                        </select> 
                    ) : (
                        <select
                            className="form-select" 
                            value={selectedWBS || ''}
                            onChange={(e)=> setSelectedWBS(e.target.value)}
                            >
                            <option value="">-- Select WBS --</option>
                            {stkProj.sort((a, b) => a.Project_WBS.localeCompare(b.Project_WBS, undefined, { sensitivity: 'base' }))
                                .map(id => (
                            <option key={id.Softtek_ProjectID} value={id.Softtek_ProjectID}>{id.Project_WBS}</option>
                            ))}
                        </select> 
                   ))}
                </div>
              { (selectedWBS || selectedProject) && (
                <div className="col-5 d-flex flex-row  align-items-center justify-content-around">
                    <ul className="nav nav-pills">
                        <li className="nav-item" >
                            <a className="nav-link" data-bs-toggle="pill" onClick={() => setContainer('#cm')} >Current Month</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-bs-toggle="pill" onClick={() => setContainer('#l3m')} >Last 3 Months</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-bs-toggle="pill" onClick={() => setContainer('#ytd')} >YTD</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-bs-toggle="pill" onClick={() => setContainer('#l12m')} >L12M</a>
                        </li>
                    </ul>
                </div>      
              ) }
            <div className="col-1 align-items-end">
                {isLoading ? <div className="spinner-border"></div> :''}
            </div>
            </div>

            {(pnlData && pnlData.length >0) && (
            <>
            <div className="container mt-4">
                    {theContainer === '#cm' ? 'Current Month':''}
                    {theContainer === '#l3m' ? 'Last 3 Months':''}
                    {theContainer === '#ytd' ? 'Year To Date':''}       
                    {theContainer === '#l12m' ? 'Last 12 Months':''}

            {generateTransposedTable(aggregatedData)}
            </div>
            </>)}

        </div>
    );

}
export default HistoricReport;