import { useState, useEffect } from 'react';
import maritzProjectDataService from "../services/maritzProject.service";
import dds from "../services/dashboard.service.js";

const EmployeeCostReport = ()=>{

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
    </div>
    );
}
export default EmployeeCostReport;