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
    const [selectedPid, setSelectedPid] = useState('');
    const [pids, setPids] = useState([]); 
    const [projects, setProjects] = useState([]); 
    const [stkProj, setStkProj] = useState([]);
    const [theContainer, setContainer] = useState('');
    const [pnlData, setPnlData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [daysInMonth, setDaysInMonths] = useState([]);
    const [aggregatedData, setAggregatedData] = useState([]);

     const [activeTab, setActiveTab] = useState('');

      const handleTabClick = (tabId) => {
          setSelectedProject('');
          setSelectedWBS('');
          setSelectedPid('');
          setAggregatedData([]);
          setPnlData([]);  
          setActiveTab(tabId);
          setContainer(tabId); 
      };



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

            const uniqueSTKPids = [...new Set(
                stkProj.map(project => project.Project_WBS.substring(0, project.Project_WBS.lastIndexOf('-')))
            )].sort();

            setPids(uniqueSTKPids);

        }

        fetchData();

    }, []);

    useEffect(() =>{
      const fetch= async()=>{
        setSelectedProject('');
        setSelectedWBS('');
        setAggregatedData([]);

        if(radioValue==='account'){
         // console.log('inside account')
         // console.log(projects);
          //const pIWBS = projects.map(pro => Number(pro.Maritz_ProjectID));
         
          const tmp =  aggregateByDate(projects);
          //console.log(tmp)  
          setAggregatedData(tmp);
        }
      }
      fetch();

    },[radioValue, projects])

    useEffect(() => {
      const pIWBS = projects.filter(pro => Number(pro.Softtek_ProjectID) === Number(selectedWBS));      
      const tmp =  aggregateByDate(pIWBS);  
      setAggregatedData(tmp);
      
      
    }, [selectedWBS, projects]);

    useEffect(() => {
      if (!selectedPid) {
           setAggregatedData([]);
            return;
      }
      

      const pIWBS = projects.filter(project => project.Softtek_Project?.Project_WBS?.startsWith(selectedPid + "-"));
      
      const tmp =  aggregateByDate(pIWBS);  
      setAggregatedData(tmp);
      
    }, [selectedPid, projects]);



    useEffect(() =>{       
        const fetchData= () => { 

      const tmp = aggregateByDate(selectedProject);        
      setAggregatedData(tmp);
             
        }
        
         if (pnlData && pnlData.length > 0){
            fetchData();
        }
    
 
     },[selectedProject,projects])
 

    useEffect(() =>{
       
        const getAllData = async() => {
              setSelectedProject('');
              setSelectedWBS('');
               setSelectedPid('');
              setAggregatedData([]);
              setPnlData([]);
              setRadioValue('');

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
          }
      getAllData();


    },[theContainer])

  /*
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
*/

    function formatDate (date) {
        if (date==='TOTAL') return 'Total';
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
        
        return dates.reverse();
      }

  const aggregateByDate = (input) => {
        const results = {};

        let selectedIDs = [];

        if (Array.isArray(input)) {
          selectedIDs = input.map(id => parseInt(id.Maritz_ProjectID));
        } else if (!isNaN(input)) {
          selectedIDs = [parseInt(input)];
        } else {
          console.warn("aggregateByDate: Invalid input", input);
          return results; // return empty if input is invalid
        }

        pnlData
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
          //entry.Infrastructure = entry.Total_Hours * (Constants.INFRASTRUCTURE[0].Cost/ (findWorkingDays(entry.date)*8));
          entry.Infrastructure = entry.Total_Hours * (0.89);
          entry.Total_Cost = entry.Direct_Cost + entry.Other_Cost + entry.Infrastructure;
          entry.Gross_Margin = entry.Revenue - entry.Total_Cost;
          entry.Gross_Margin_Percent = entry.Revenue ? entry.Gross_Margin / entry.Revenue : 0;
        });
      
        const values = Object.values(results);

        const totals = values.reduce((acc, row) => {
           for (const key in row) {
            if (key === "date") {
              acc[key] = "TOTAL";
            } else {
              acc[key] = (acc[key] || 0) + (parseFloat(row[key]) || 0);
            }
          }
          return acc;
        }, {});

        totals.Gross_Margin_Percent = totals.Revenue
          ? totals.Gross_Margin / totals.Revenue
          : 0;

        values.push(totals);
        
        return  values;        
      }

      const generateTransposedTable = () => {

        if(!aggregatedData || Object.keys(aggregatedData).length === 0)
           return '';

        const dates = Object.keys(aggregatedData);
        
        const metrics = [
          {id: 'Revenue', name:'Revenue'},
          {id: 'Direct_Cost',name:'Direct Cost'},
          {id: 'Other_Cost' ,name:'Other Cost'},
          {id: 'Infrastructure' ,name:'Infrastructure'},
          {id: 'Total_Cost',name:'Total Cost'},
          {id: 'Gross_Margin',name:'Gross Margin'},
          {id: 'Gross_Margin_Percent',name:'Gross Margin %'},
          {id: 'Total_Hours',name:'Total Hours'}
        ];
      
        // Return the table as JSX
        return (
          <div className="table-responsive w-75">
            <table className="table table-bordered table-striped small">
              <thead>
                <tr key='0' className='table-dark'>
                  <th style={{width: '15%'}}></th>
                  {dates.map(date => (                  
                    <th style={{textAlign: 'center',width: `${85/dates.length}%`}} key={aggregatedData[date].date}>{formatDate(aggregatedData[date].date)} </th>                  
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric.id}>
                    <td >{metric.name}</td>
                    {dates.map(date => {
                      const data = aggregatedData[date];
                      let value = data[metric.id];
      
                      // If it's Gross Margin Percentage, convert to percentage format
                      if (metric.id === 'Gross_Margin_Percent') {
                        return <td align='right' key={`${date}-${metric.id}`}> 
                        <NumericFormat                     
                            value=  {value*100}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            suffix="%"
                         /> 
                        
                        </td>
                      } if (metric.id === 'Total_Hours') {
                        return <td align='right' key={`${date}-${metric.id}`}> 
                             <NumericFormat                     
                            value=  {value}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            prefix=""
                         /> </td>

                      }else {
                      return <td align='right' key={`${date}-${metric.id}`}>
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
                <div className="col-4  d-flex flex-row  align-items-start">

                      <ul className="nav nav-pills">
                            {[
                              { id: '#cm', label: 'Current Month' },
                              { id: '#l3m', label: 'Last 3 Months' },
                              { id: '#ytd', label: 'YTD' },
                              { id: '#l12m', label: 'L12M' }
                            ].map(tab => (
                              <li className="nav-item" key={tab.id}>
                                <button
                                  type="button"
                                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                  onClick={() => handleTabClick(tab.id)}
                                >
                                  {tab.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                </div>      
              
                <div className="col-4 d-flex flex-row align-items-center justify-content-around">
                    <div className="p-2">
                        <input type="radio" className="form-check-input" id="radio0" name="optradio" value="account" 
                        checked={radioValue === 'account'}
                        onChange={(e) => setRadioValue(e.target.value)} /> Account
                    </div>
                     <div className="p-2">
                        <input type="radio" className="form-check-input" id="radio0" name="optradio" value="pid" 
                        checked={radioValue === 'pid'}
                        onChange={(e) => setRadioValue(e.target.value)} /> STK PID
                    </div>
                    <div className="p-2">
                        <input type="radio" className="form-check-input" id="radio1" name="optradio" value="wbs" 
                        checked={radioValue === 'wbs'}
                        onChange={(e) => setRadioValue(e.target.value)} /> WBS
                    </div>
                    <div className="p-2">
                        <input type="radio" className="form-check-input" id="radio2" name="optradio" value="maritz"
                        checked={radioValue === 'maritz'} 
                        onChange={(e) => setRadioValue(e.target.value)}
                         /> Maritz Project
                    </div>
                </div>
                <div className="col-2 ms-5 d-flex flex-row align-items-center ">                       
                {!isLoading && radioValue  && (
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
                    ) : (radioValue ==='wbs')?(
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
                   ):(radioValue ==='pid')?(
                      <select
                            className="form-select" 
                            value={selectedPid || ''}
                            onChange={(e)=> setSelectedPid(e.target.value)}
                            >
                            <option value="">-- Select ProjectID --</option>
                                {pids.map(pid => (
                                  <option key={pid} value={pid}>{pid}</option>
                                ))}
                        </select> 


                   ):(''))}
                </div>

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

            { (aggregatedData) && generateTransposedTable()}
            </div>
            </>)}

        </div>
    );

}
export default HistoricReport;