import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; 

import TableTransfer from './components/PeopleProjectsComponent';
import EmployeeRoutes from './routes/EmployeeRoutes';
import ManagerRoutes from './routes/ManagerRoutes'
import CityRoutes from './routes/CityRoutes';
import SofttekProjectsRoutes from './routes/SofttekProjectRoutes';
import MaritzProjectsRoutes from './routes/MaritzProjectRoutes';
import DashboardRoutes from './routes/DashboardRoutes';
import FinanceRoutes from './routes/FinanceRoutes';
import RolesRoutes from './routes/RolesRoutes';
import RatecardRoutes from './routes/RatecardRoutes';


const Home = () => <div><h2>Home</h2><p>Welcome to the Home Page</p></div>;

function App() {

  const [activeIndex, setActiveIndex] = useState(null);

    const toggleMenu = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

  return (
    <Router>
      <div className="d-flex">
        <nav className="d-flex flex-column bg-light p-3 vh-100" style={{ minheight: '250vh', width: '200px' }}> 
          <h4>Menu</h4>
          <ul className="nav flex-column">
            
          <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>

          <li className="nav-item">
            <button  className="nav-link w-100 text-start" data-bs-toggle="collapse" 
                data-bs-target="#submenu4"
                onClick={() => toggleMenu(4)} >Dashboard ▾</button>         
            
              <div className={`collapse list-unstyled ${activeIndex === 4 ? "show" : ""}`} id="submenu4">
                <ul className="nav flex-column ps-3">
                    <li className="nav-item">
                        <Link className="nav-link" to="/dash">People</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dash/attrition">Attrition</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dash/revenue">Revenue</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dash/pnl">Project P&L</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dash/hspnl">Historic P&L</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dash/hsempc">Employee Cost</Link>
                    </li>

                </ul>
              </div>
    
          </li>
          
          <li className="nav-item">
            <button  className="nav-link w-100 text-start" data-bs-toggle="collapse" 
                data-bs-target="#submenu1"
                onClick={() => toggleMenu(1)} >Employee ▾</button>         
               <div className={`collapse list-unstyled ${activeIndex === 1 ? "show" : ""}`} id="submenu1">
                  <ul className="nav flex-column ps-3">
                    <li className="nav-item">
                      <Link className="nav-link" to="/employee/List/0">Active</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/employee/List/1">Inactive</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/role/R">Roles</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/role/T">Activity Type</Link>
                    </li>


                  </ul>
              </div>
            </li>

            <li className="nav-item"><Link className="nav-link" to="/city">City</Link></li>            
            <li className="nav-item">
            <button  className="nav-link w-100 text-start" data-bs-toggle="collapse" 
             onClick={() => toggleMenu(2)} data-bs-target="#submenu2">Projects ▾</button>        
            <div className={`collapse ${activeIndex === 2 ? "show" : ""}`} id="submenu2">
                <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                      <Link className="nav-link" to="/wbs">WBS</Link></li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/project">Maritz</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/SofttekProjects">Assign</Link>
                    </li>
                    <li className="nav-item">  
                      <Link className="nav-link" to="/project/mpc">Fixeded Cost</Link>
                    </li>
                    <li className="nav-item">  
                      <Link className="nav-link" to="/project/dmalloc">DM Allocation</Link>
                    </li>

                </ul>
                </div>
            </li>

            <li className="nav-item"><Link className="nav-link" to="/manager/list">Managers</Link></li>
           
            <li className="nav-item">
            <button  className="nav-link w-100 text-start" data-bs-toggle="collapse" onClick={() => toggleMenu(3)} data-bs-target="#submenu3">Finance ▾</button>        
            <div className={`collapse ${activeIndex === 3 ? "show" : ""}`} id="submenu3">       
                <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance">Invoices</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance/Backlog">Backlog</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/ratecard">Rate Card</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance/taxonomy">Taxonomy Cost</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance/dayspermonth">Days Per Month</Link>
                    </li>
                  </ul>
                </div>
            </li>
          </ul>
          <div className="mt-auto p-2 text-left small text-muted">© 2025 Rod Garcia</div> 
        </nav> 
        <div className="container-lg ms-0 " >
          <Routes>
            <Route path="/" element={< Home />} />            
            <Route path="/dash/*" element={<DashboardRoutes />} />
            <Route path="/city/*" element={<CityRoutes/> } />       
            <Route path="/employee/*" element={<EmployeeRoutes />} />
            <Route path="/manager/*" element={<ManagerRoutes />} />
            <Route path="/role/*" element={<RolesRoutes />} />
            <Route path="/wbs/*" element={<SofttekProjectsRoutes />} />        
            <Route path="/project/*" element={<MaritzProjectsRoutes />} />
            <Route path="/finance/*" element={<FinanceRoutes />} />
            <Route path="/ratecard/*" element={<RatecardRoutes />} />



            <Route path="/SofttekProjects" element={<TableTransfer />} />
          </Routes>
        </div>
      </div>

    </Router>
  );
}

export default App;
