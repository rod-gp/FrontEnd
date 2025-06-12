import { useState, useEffect } from 'react';
import maritzProjectDataService from "../services/maritzProject.service";
import dds from "../services/dashboard.service.js";
import FinanceDataService from '../services/finance.service';
import EmployeeDataService from "../services/employee.service";
import { format, parseISO } from 'date-fns';
import Constants from "../constants/Constants";

const EmployeeCostReport = ()=>{

    const [employees, setEmployees] = useState([]);
    const [radioValue, setRadioValue] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedWBS, setSelectedWBS] = useState('');
    const [selectedPid, setSelectedPid] = useState('');
    const [pnlData, setPnlData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [aggregatedData, setAggregatedData] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [pids, setPids] = useState([]); 
    const [projects, setProjects] = useState([]); 
    const [stkProj, setStkProj] = useState([]);
    const [theContainer, setContainer] = useState('');
    const [daysPerMonth,setDaysPerMonth] = useState([]);
   
   
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
        try { 
            
                const projectList = await maritzProjectDataService.getAllProjects();           
                setProjects(projectList.data);
                
                
                //const response = await EmployeeDataService.getAllEmployeesByStatus(0);
                const response = await EmployeeDataService.getAllEmployees();
                    if (response && response.data) {
                        setEmployees(response.data);
                    } else {
                        console.error('No employee data found');
                        setEmployees([]);  // Set an empty array if no data is returned
                    }

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
            catch (error) {
                console.error('Error fetching data:', error);
                
            }

        }

        fetchData();

    }, []);

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
            
              const response = await FinanceDataService.getDaysPerMonth('2025');
                if(response.data && response.data.length > 0)  {
                    const days = response.data;
                    setDaysPerMonth(days); 
                }  

              setLoading(true);
 
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

            const pnlFilterData = thePnlData.filter (d=> d.Color === 'Direct_Cost' );

            setPnlData(pnlFilterData);  
            setLoading(false);           
                
        }
      getAllData();
    },[theContainer])

   useEffect(() => {
      setAggregatedData([]);

      if (!pnlData || pnlData.length === 0) return;

      if (radioValue === 'account') {
        const pd = prepareData(projects);
        setAggregatedData(pd);

      } else if (radioValue === 'wbs' && selectedWBS) {
        const filtered = projects.filter(pro => Number(pro.Softtek_ProjectID) === Number(selectedWBS));
        const pd = prepareData(filtered);
        setAggregatedData(pd);
        
      } else if (radioValue === 'pid' && selectedPid) {
        const filtered = projects.filter(project =>
          project.Softtek_Project?.Project_WBS?.startsWith(selectedPid + "-")
        );
        const pd = prepareData(filtered);
         setAggregatedData(pd);
        
      } else if (radioValue === 'maritz' && selectedProject) {
        const pd = prepareData(selectedProject);
         setAggregatedData(pd);
      }

    }, [radioValue, selectedProject, selectedWBS, selectedPid, projects, pnlData]);

    function prepareData(input){
        let selectedIDs = [];
      
        if (Array.isArray(input)) {
          selectedIDs = input.map(id => parseInt(id.Maritz_ProjectID));
        } else if (!isNaN(input)) {
          selectedIDs = [parseInt(input)];
        } else {
          console.warn("aggregateByDate: Invalid input", input);
          return ""; // return empty if input is invalid
        }
        
        const theData = pnlData.filter(item => selectedIDs.includes(item.Maritz_ProjectID));

        return theData;

    }

    function getDaysPerMonth(month){
        for (const entry of daysPerMonth) {
            const entryMonth = format(parseISO(entry.Date), 'MMM yyyy');
            if (entryMonth === month) {
                return entry.Days;
            }
        }
        return 0; // Not found
    }

    function generateTransposedTable(){

        const grouped = {};

        const months = Array.from(
            new Set(
            aggregatedData.map(d => format(parseISO(d.date), 'MMM yyyy'))
            )
        ).sort((a, b) => new Date(a) - new Date(b));

        aggregatedData.forEach(item => {
            const key = `${item.EmployeeID}`;
            const month = format(parseISO(item.date), 'MMM yyyy');

            if (!grouped[key]) {
                grouped[key] = {
                EmployeeID: item.EmployeeID,
                monthlyData: {} 
                };
            }

              if (!grouped[key].monthlyData[month]) {
                    grouped[key].monthlyData[month] = {
                    hours: 0,
                    amount: 0
                    };
                }
           
                grouped[key].monthlyData[month].hours += item.hours;
                grouped[key].monthlyData[month].amount = item.amount;
        });
        
        const rows = Object.values(grouped);

        return(
            <div>
                <h2>Monthly Employee Costs</h2>
                <table className="table table-bordered table-striped small" cellPadding="2" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr className='table-dark'>
                        <th style={{width: '15%'}}>Employee</th>
                        {months.map(month => (
                        <th style={{ textAlign: 'center' }} colSpan="4" key={month}>{month} / {getDaysPerMonth(month)*8} hrs</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                        <tr className='table-dark'>
                        <td key='1234'></td>
                        {months.map(str => (
                            <>    
                            <td align="center">Cost</td>
                            <td align="center">Hrs</td>
                            <td align="center">Full Cost</td>
                            <td align="center">Utilization</td>
                            </>
                        ))}
                        </tr>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                            <td>{getNameById(row.EmployeeID)}</td>
                            {months.map(month => {
                                const entry = row.monthlyData[month];
                                const days = getDaysPerMonth(month) || 0;
                                const fullHours = days * 8;
                                return (
                                    
                                   <>
                                    {entry && entry.hours != null && entry.amount != null ? (
                                        <>
                                        <td>{(entry.amount * entry.hours).toFixed(2)}</td>
                                        <td>{entry.hours.toFixed(2)}h</td>
                                        <td>{(entry.amount * fullHours).toFixed(2)}</td>
                                        <td>
                                            {fullHours > 0
                                            ? ((entry.hours / fullHours) * 100).toFixed(2) + '%'
                                            : '0.00%'}
                                        </td>
                                        </>
                                    ) : (
                                        <>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        </>
                                    )}
                                    </>
                               
                                );
                            })}
                            </tr>
                        ))}
                        </tbody>
                </table>
                </div>
        );
    }

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

    function getDMById(id){
        const dm = (Constants.DMS.find(dm => Number(dm.DMID) === Number(id)));
        return dm ? dm.DMName : ''; 
    }

    function getNameById(empID) {
       //console.log(empID);

       
        if (!Array.isArray(employees) || employees.length === 0) {
            return empID; // Or handle accordingly
        }

        const tmp = employees.find(emp => parseInt(emp.EmployeeID) === parseInt(empID));    
       // console.log(tmp);
        if (tmp && tmp && tmp.Name) {
            return tmp.Name;
        } else {
            return getDMById(empID); // Or handle accordingly
        }
    }


    return(
        <div className="container-fluid p-4">
            <div className="row mb-4">
                <div className="col-md-6">
                <h2>Employee Cost Report</h2>
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
                <div className="w-100">
                    {generateTransposedTable()}
                </div>
            )}
        </div>
    );
}
export default EmployeeCostReport;