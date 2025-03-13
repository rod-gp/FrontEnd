import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import TableTransfer from './components/PeopleProjectsComponent';
import EmployeeRoutes from './routes/EmployeeRoutes';
import ManagerRoutes from './routes/ManagerRoutes'
import CityRoutes from './routes/CityRoutes';
import SofttekProjectsRoutes from './routes/SofttekProjectRoutes';
import MaritzProjectsRoutes from './routes/MaritzProjectRoutes';
import DashboardRoutes from './routes/DashboardRoutes';
import FinanceRoutes from './routes/FinanceRoutes';

const Home = () => <div><h2>Home</h2><p>Welcome to the Home Page</p></div>;

function App() {


  return (
    <Router>
  
      <div className="d-flex">
        <nav className="bg-light p-3 vh-100" style={{ width: '220px' }}>
          <h4>Menu</h4>
          <ul className="nav flex-column">
            
          <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/dash">Dashboard</Link></li>
            <li className="nav-item">
            <span className="nav-link">Employee</span>         
                <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                      <Link className="nav-link" to="/employee/List/0">Active</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/employee/List/1">Inactive</Link>
                    </li>
                  </ul>
            </li>
            <li className="nav-item"><Link className="nav-link" to="/city">City</Link></li>            
            <li className="nav-item">
            <span className="nav-link">Projects</span>         
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
                      <Link className="nav-link" to="/SofttekProjects">Fixeded Cost</Link>
                    </li>

                </ul>
            </li>

            <li className="nav-item"><Link className="nav-link" to="/manager/list">Managers</Link></li>
           
            <li className="nav-item">
            <span className="nav-link">Finance</span>         
                <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance">Invoices</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance/backlog">Project Backlog</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance/backlog">Rate Card</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/finance/backlog">Taxonomy Cost</Link>
                    </li>

                  </ul>
            </li>
    
          </ul>
        </nav>
        <div className="p-4" >
          <Routes>
            <Route path="/" element={< Home />} />            
            <Route path="/dash/*" element={<DashboardRoutes />} />
            <Route path="/city/*" element={<CityRoutes/> } />       
            <Route path="/employee/*" element={<EmployeeRoutes />} />
            <Route path="/manager/*" element={<ManagerRoutes />} />
            <Route path="/wbs/*" element={<SofttekProjectsRoutes />} />        
            <Route path="/project/*" element={<MaritzProjectsRoutes />} />
            <Route path="/finance/*" element={<FinanceRoutes />} />


            <Route path="/SofttekProjects" element={<TableTransfer />} />
          </Routes>
        </div>
      </div>

    </Router>
  );
}

export default App;
