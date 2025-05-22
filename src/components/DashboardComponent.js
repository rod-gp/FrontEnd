import React, { useEffect, useState } from "react";
import usFlag from "../images/american-flag.png";
import colFlag from "../images/colombia-flag.webp";
import inFlag from "../images/india-flag.png";
import mxFlag from "../images/mexico-flag.png";
import mes from "../images/engagement.jpg";
import auto from "../images/auto.jpeg";
import bes from "../images/bes.jpeg"; 
import mits from "../images/itsm.png";
import dds from "../services/dashboard.service.js";

import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController,
  } from 'chart.js';
  
  import { Chart } from 'react-chartjs-2';






const HomeDashboardComponent = () =>{
    const [hcByCountry, setHcByCountry] = useState([]);
    const [hcByCompany, setHcByCompany] = useState([]);
    const [hclast12Months, setHclast12Months] = useState([]);
    const [hcByCity, setHcByCity]= useState([]);
    const [hcByStatus, setHcByStatus]= useState([]);
    const [selecterQuarter, setSelecterQuarter] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyResponse, countryResponse,last12MonthsResponse, byCityResponse, byStatusResponse] = await Promise.all([
                    dds.getHCbyCompany(selecterQuarter),
                    dds.getHCbyCountry(selecterQuarter),
                    dds.getHClast12Months(selecterQuarter),
                    dds.getHCbyCity(selecterQuarter),
                    dds.getHCbyStatus(selecterQuarter)          
                ]);
    
                setHcByCompany(companyResponse.data);
                setHcByCountry(countryResponse.data);
                setHclast12Months(last12MonthsResponse.data);
                setHcByCity(byCityResponse.data);
                setHcByStatus(byStatusResponse.data);
               

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, [selecterQuarter]);

    const getTotalByCountry = (countryName) => {
        const countryData = hcByCountry.find(item => item.Country === countryName);
        return countryData ? countryData.Total : null; // Returns null if the country is not found
    };

    const getTotalByCompany = (companyName) => {
        const companyData = hcByCompany.find(item => item.Company === companyName);
        return companyData ? companyData.Total : null; // Returns null if the Company is not found
    };

       //Draw chartJS
    
       ChartJS.register(
        LinearScale,
        CategoryScale,
        BarElement,
        PointElement,
        LineElement,
        Legend,
        Tooltip,
        LineController,
        BarController
      );
    
          const options = {
            plugins: {
                legend: {
                    position: 'top' ,
                },
                title: {
                    display: true,
                    text: 'Joining and Leaving last 12 months',
                },
            },
            responsive: true,
    
            interaction: {
              mode: 'index' ,
              intersect: false,
            },
            scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  grid: {
                    drawOnChartArea: true,
                  },
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  grid: {
                    drawOnChartArea: false,
                  },
                  min: 70,
                  suggestedMin: 50
                },
              },
          };
      
        const labels =  hclast12Months.map(d => d.month)
    
        const data = {
            labels,
            datasets: [
              {
                type: 'bar',
                label: 'Arrivals',
                data: hclast12Months.map(d => d.arrivals),
                backgroundColor: '#004569',
                stack: 'Stack 0',
                order: 2
              },
              {
                type: 'bar',
                label: 'Departures',
                data: hclast12Months.map(d => d.departures),
                backgroundColor: '#FF1918',
                stack: 'Stack 1',
                order: 3
              },
              {
                type: 'line',
                label: 'Total HC',
                data: hclast12Months.map(d => d.headcount),
                borderColor: 'rgb(232, 202, 32)',
                backgroundColor: 'rgb(232, 202, 32)',
                borderWidth: 5,                
                yAxisID: 'y1',
                order: 1
              },
            ]};


    return(
        
        <div className="container pt-2">           
       
        <div className="row">
            <div className="col-3 d-flex justify-content-right align-items-center">
                <h2>People Dashboard</h2>
            </div>
            <div className="col-2 d-flex justify-content-right align-items-center">
                <select 
                    value={selecterQuarter}
                    onChange={(e) => {
                        setSelecterQuarter(e.target.value);
            
                    }}
                    className="form-select"
                >
                    <option>Choose a quarter</option>
                    <option value="2024-03-02">2024-03</option>
                    <option value="2024-06-02">2024-06</option>
                    <option value="2024-09-02">2024-09</option>
                    <option value="2024-12-02">2024-12</option>
                    <option value="2025-03-02">2025-03</option>
                    <option value="2025-06-02">2025-06</option>
                    <option value="2025-09-02">2025-09</option>
                    <option value="2025-12-02">2025-12</option>                    
                </select>
            </div>
        </div>

        <div className="row my-3">
                <div className="col-6">
                
                    <table align="left" className="table table-borderless small" style={{width: '450px'}} >
                    <tbody>
                        <tr >
                            <td style={{ width: "10%" }} valign="middle" align="center"><img src={usFlag} alt="US Flag" width="80" height="48"/></td>
                            <td style={{ width: "5%" }} valign="middle" align="center"><h2>{getTotalByCountry("USA")}</h2></td>
                            <td style={{ width: "70%" }} valign="middle" align="center"></td>
                            <td style={{ width: "10%" }} valign="middle" align="center"><img src={mes} alt="Engagement" width="60" height="48"/></td>
                            <td style={{ width: "5%" }} valign="middle" align="center"><h2>{getTotalByCompany("ES")}</h2></td>

                        </tr>
                        <tr>
                            <td valign="middle" align="center"><img src={mxFlag} alt="MX Flag" width="80" height="48"/></td>
                            <td valign="middle" align="center"><h2>{getTotalByCountry("Mexico")}</h2></td>
                            <td ></td>
                            <td valign="middle" align="center"><img src={bes} alt="MX Flag" width="80" height="48"/></td>
                            <td valign="middle" align="center"><h2>{getTotalByCompany("BES")}</h2></td>
                        </tr>    
                        <tr>
                            <td valign="middle" align="center"><img src={colFlag} alt="CO Flag" width="80" height="48"/></td>
                            <td valign="middle" align="center"><h2>{getTotalByCountry("Colombia")}</h2></td>
                            <td ></td>
                            <td valign="middle" align="center"><img src={auto} alt="CO Flag" width="80" height="48"/></td>
                            <td valign="middle" align="center"><h2>{getTotalByCompany("AS")}</h2></td>
                        </tr>    
                        <tr>
                            <td valign="middle" align="center"><img src={inFlag} alt="IN Flag" width="80" height="48"/></td>
                            <td valign="middle" align="center"><h2>{getTotalByCountry("India")}</h2></td>
                            <td ></td>
                            <td valign="middle" align="center"><img src={mits} alt="IN Flag" width="60" height="48"/></td>
                            <td valign="middle" align="center"><h2>{getTotalByCompany("MITS")}</h2></td>
                        </tr>    
                    
                        <tr className="table-dark">
                            <td colSpan='3' className="p-0">Status</td>
                            <td colSpan='2' className="p-0" align='center'>Headcount</td>                                     
                        </tr>            
                        
                        
                            {hcByStatus.map((status) => (
                            <tr key={status.status}>
                                <td colSpan='3' className="p-0" align='left'><h6>{status.status}</h6></td>
                                <td colSpan='2' className="p-0" align='middle'><h6>{status.Total}</h6></td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                
                </div>
                

                <div className="col-6 d-flex justify-content-center align-items-center">
                <table className="table table-striped text-center" style={{ width: "350px" }}>
                    <thead className="table-dark rounded-top">
                    <tr>
                        <th className="p-0" style={{borderTopLeftRadius: '5px'}}>City</th>
                        <th className="p-0">Headcount</th>
                        <th className="p-0" style={{borderTopRightRadius: '5px'}}>Percentage</th>                
                    </tr>            
                    </thead>
                    <tbody>
                        {hcByCity.map((city) => (
                        <tr key={city.City_Name}>
                            <td className="p-0" align='left'>{city.City_Name}</td>
                            <td className="p-0" align='middle'>{city.Count}</td>
                            <td className="p-0" align='middle'>{city.Percentage}%</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>

            <div className="row">
           
            <div className="col-4 d-flex p-5 justify-content-center align-items-center" >                
  
                    <table className="table table-striped text-center" >
                        <thead className="table-dark rounded-top">
                        <tr>
                            <th className="p-0" style={{borderTopLeftRadius: '5px'}}>Month</th>
                            <th className="p-0">Arrivals</th>                
                            <th className="p-0">Departures</th>                
                            <th className="p-0" style={{borderTopRightRadius: '5px'}}>Headcount</th>  
                        </tr>            
                        </thead>
                        <tbody>
                            {hclast12Months.map((company) => (
                            <tr key={company.month}>
                                <td className="p-0" align='left'>{company.month}</td>
                                <td className="p-0" align='middle'>{company.arrivals}</td>
                                <td className="p-0" align='middle'>{company.departures}</td>
                                <td className="p-0" align='middle'>{company.headcount}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                
                <div className="col-8 d-flex p-5 justify-content-center align-items-center" >                
                        <Chart type='bar' options={options} data={data} />  
                </div>

            </div>
  </div>
  
    );
};

export default HomeDashboardComponent;