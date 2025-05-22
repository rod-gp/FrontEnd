import React, { useState, useEffect } from 'react';
import maritzProjectDataService from "../services/maritzProject.service";
import dds from "../services/dashboard.service.js";
import { NumericFormat } from "react-number-format";
//import Constants from "../constants/Constants";
//import FinanceDataService from '../services/finance.service';

import { Line } from 'react-chartjs-2';

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
  //  const [daysInMonth, setDaysInMonths] = useState([]);
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

    useEffect(() => {
      setAggregatedData([]);

      if (!pnlData || pnlData.length === 0) return;

      if (radioValue === 'account') {
        const tmp = aggregateByDate(projects);
        setAggregatedData(tmp);
      } else if (radioValue === 'wbs' && selectedWBS) {
        const filtered = projects.filter(pro => Number(pro.Softtek_ProjectID) === Number(selectedWBS));
        const tmp = aggregateByDate(filtered);
        setAggregatedData(tmp);
      } else if (radioValue === 'pid' && selectedPid) {
        const filtered = projects.filter(project =>
          project.Softtek_Project?.Project_WBS?.startsWith(selectedPid + "-")
        );
        const tmp = aggregateByDate(filtered);
        setAggregatedData(tmp);
      } else if (radioValue === 'maritz' && selectedProject) {
        const tmp = aggregateByDate(selectedProject);
        setAggregatedData(tmp);
      }

    }, [radioValue, selectedProject, selectedWBS, selectedPid, projects, pnlData]);



/*

    useEffect(() =>{
      const fetch= async()=>{
        setSelectedProject('');
        setSelectedWBS('');
        setAggregatedData([]);

        if(radioValue==='account'){
          const tmp =  aggregateByDate(projects);  
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
 
*/

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
              
              setLoading(true);
             /*
            const uniqueYears = [...new Set(theDates.map(date => new Date(date).getUTCFullYear()))];
             
             const daysList =  (await Promise.all(
                  uniqueYears.map(async td => FinanceDataService.getDaysPerMonth(td) )
                  ))
                  .map(response => response.data)
                  .flat();

              setDaysInMonths(daysList);
              */
              const thePnlData = (await Promise.all(
                  theDates.map(async td => {
                    const result = await dds.getPLbyMonth(td);
                    if (!result || !Array.isArray(result.data)) {
                      console.error(`Expected an array in result.data, but received:`, result);
                      return [];  
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
        const filteredData = aggregatedData.filter(d => !(d.Revenue === 0));
        
        const dates = Object.keys(filteredData);
        // console.log(aggregatedData);

        const metrics = [
          {id: 'Revenue', name:'Revenue'},
          {id: 'Direct_Cost',name:'Direct Cost'},
          {id: 'Other_Cost' ,name:'Other Cost'},
          {id: 'Infrastructure' ,name:'Infrastructure'},
          {id: 'Total_Cost',name:'Total Cost'},
          {id: 'Gross_Margin',name:'Gross Margin'},
          {id: 'Gross_Margin_Percent',name:'Gross Margin %'},
          {id: 'Total_Hours',name:'Total Hours'},
          {id: 'Rev_Hour',name:'Revenue per Hour'},
          {id: 'Cost_Hour',name:'Cost per Hour'}

        ];
      
        
       
        return (
          <div className="table-responsive w-75">
            <table className="table table-bordered table-striped small">
              <thead>
                <tr key='0' className='table-dark'>
                  <th style={{width: '15%'}}></th>
                  {dates.map(date => (                  
                    <th style={{textAlign: 'center',width: `${85/dates.length}%`}} key={filteredData[date].date}>{formatDate(filteredData[date].date)} </th>                  
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric.id}>
                    <td >{metric.name}</td>
                    {dates.map(date => {
                      const data = filteredData[date];
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

                      }if (metric.id === 'Rev_Hour') {
                        return <td align='right' key={`${date}-${metric.id}`}> 
                             <NumericFormat                     
                            value=  {data["Revenue"]/data["Total_Hours"]}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            prefix="$"
                         /> </td>

                      }
                      if (metric.id === 'Cost_Hour') {
                        return <td align='right' key={`${date}-${metric.id}`}> 
                             <NumericFormat                     
                            value=  {data["Total_Cost"]/data["Total_Hours"]}
                            displayType="text"
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            prefix="$"
                         /> </td>

                      }
                      
                      
                      else {
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
      

      const chart =() => {    
       
     
      const filteredData = aggregatedData.filter(d => !(d.Revenue === 0 || d.date === 'TOTAL'));


      const labels = filteredData.map(d => formatDate(d.date));

      const data = {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: filteredData.map(d => d.Revenue),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Total Cost',
            data: filteredData.map(d => d.Total_Cost),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Gross Margin %',
            data: filteredData.map(d => d.Gross_Margin_Percent * 100), 
            borderColor: 'rgb(255, 206, 86)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.3,
            yAxisID: 'y1', // Use a secondary Y-axis
          },
        ],
      };
      
      const options = {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              onClick: (e, legendItem, legend) => {
               
                const ci = legend.chart;
                const index = legendItem.datasetIndex;
                const meta = ci.getDatasetMeta(index);
                meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                ci.update();
              },
            },
            title: {
              display: true,
              text: 'Monthly Revenue, Cost, and Margin',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'USD',
              },
            },
            y1: {
              position: 'right',
              title: {
                display: true,
                text: 'Gross Margin %',
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: value => `${value}%`,
              },
            },
          },
        };

      return <Line options={options} data={data} />;

      }


/*
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

            <div className="container align-content-start mt-4">
            {(aggregatedData) && chart()}  
            </div>
          </>
          )}

        
        </div>
    );
*/
  return (
<div className="container-fluid p-4">
  <div className="row mb-4">
    <div className="col-md-6">
      <h2>Historic Report</h2>
    </div>
  </div>

  <div className="row mb-4">
    <div className="col-md-4">
      <label className="form-label">Time Range:</label>
      <div className="btn-group" role="group">
        {[
          { id: "#cm", label: "Current Month" },
          { id: "#l3m", label: "Last 3 Months" },
          { id: "#ytd", label: "YTD" },
          { id: "#l12m", label: "L12M" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>

    <div className="col-md-4">
      <label className="form-label">Report Type:</label>
      <div className="btn-group" role="group">
        {[
          { id: "account", label: "Account" },
          { id: "pid", label: "STK PID" },
          { id: "wbs", label: "WBS" },
          { id: "maritz", label: "Maritz Project" },
        ].map((type) => (
          <button
            key={type.id}
            className={`btn ${radioValue === type.id ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setRadioValue(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>

    <div className="col-md-2">
      {radioValue === "maritz" && (
        <div>
          <label className="form-label">Maritz Project:</label>
          <select
            className="form-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.Maritz_ProjectID} value={project.Maritz_ProjectID}>
                {project.Project_Name}
              </option>
            ))}
          </select>
        </div>
      )}
      {radioValue === "wbs" && (
        <div>
          <label className="form-label">WBS:</label>
          <select
            className="form-select"
            value={selectedWBS}
            onChange={(e) => setSelectedWBS(e.target.value)}
          >
            <option value="">Select a WBS</option>
            {stkProj.map((wbs) => (
              <option key={wbs.Softtek_ProjectID} value={wbs.Softtek_ProjectID}>
                {wbs.Project_WBS}
              </option>
            ))}
          </select>
        </div>
      )}
      {radioValue === "pid" && (
        <div>
          <label className="form-label">STK PID:</label>
          <select
            className="form-select"
            value={selectedPid}
            onChange={(e) => setSelectedPid(e.target.value)}
          >
            <option value="">Select a PID</option>
            {pids.map((pid) => (
              <option key={pid} value={pid}>
                {pid}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>

    <div className="col-md-2 text-end">
      {isLoading && (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) }
    </div>
  </div>

  {(pnlData && pnlData.length > 0) && (
    <div className="row">
      <div className="col-md-12">
        <div className="w-100">
          {generateTransposedTable()}
        </div>
      </div>
    </div>
  )}

  {(pnlData && pnlData.length > 0) && (
    <div className="row mt-4">
      <div className="col-md-12 w-75">
        
              {chart()}
         
        </div>
    </div>
  )}
</div>


  );

}
export default HistoricReport;