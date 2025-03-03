import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import TableTransfer from './components/PeopleProjectsComponent';
import EmployeeRoutes from './routes/EmployeeRoutes';
import ManagerRoutes from './routes/ManagerRoutes'
import CityRoutes from './routes/CityRoutes';
import SofttekProjectsRoutes from './routes/SofttekProjectRoutes';
import MaritzProjectsRoutes from './routes/MaritzProjectRoutes';


const Home = () => <div><h2>Home</h2><p>Welcome to the Home Page</p></div>;

function App() {


  return (
    <Router>
      <div className="d-flex">
        <nav className="bg-light p-3 vh-100" style={{ width: '250px' }}>
          <h4>Menu</h4>
          <ul className="nav flex-column">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
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
                      <Link className="nav-link" to="/SofttekProjects">Assign to Project</Link>
                    </li>
                </ul>
            </li>

            <li className="nav-item"><Link className="nav-link" to="/manager/list">Managers</Link></li>
    
          </ul>
        </nav>
        <div className="p-4" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/city/*" element={<CityRoutes/> } />       
            <Route path="/employee/*" element={<EmployeeRoutes />} />
            <Route path="/manager/*" element={<ManagerRoutes />} />
            <Route path="/wbs/*" element={<SofttekProjectsRoutes />} />        
            <Route path="/project/*" element={<MaritzProjectsRoutes />} />


            <Route path="/SofttekProjects" element={<TableTransfer />} />



          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
