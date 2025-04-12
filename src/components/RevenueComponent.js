import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from "chart.js";
  
  import { Line } from 'react-chartjs-2';
  
  import dds from "../services/dashboard.service.js";

  ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend);


const RevenueComponent = () => {
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
        const [chartData, setChartData] = useState([]);
        const [actualTotal, setActualTotal] = useState(0);
        const [backlogTotal, setBacklogTotal] = useState(0);
        const [planTotal, setPlanTotal] = useState(0);
        
        const [labels, setLabels] = useState([]);

        const months = [
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ];

        
        useEffect(() => {
            const fetchData = async () => {
                try{
                    setActualTotal(0);
                    setBacklogTotal(0);
                    setPlanTotal(0);

                    const res = await dds.getRevenueForecast(selectedYear);
                    const data = res.data;

                    if (Array.isArray(data)) {
                        const processedData = data.map(project => {

                            const projectData = { projectID: project.Project_Name };
                            months.forEach(month => {
                                projectData[month] = parseFloat(project[month]);
                            });
                            
                            return projectData;
                        });
                    
                        processedData.forEach(entry => {
                            const total = Object.entries(entry)
                              .filter(([key]) => key !== 'projectID')
                              .reduce((sum, [, value]) => sum + value, 0);
                        
                            switch (entry.projectID) {
                              case 'Actual':
                                setActualTotal(total);
                                break;
                              case 'Backlog':
                                setBacklogTotal(total);
                                break;
                              case 'Plan':
                                setPlanTotal(total);
                                break;
                            }
                          });

                    setChartData(processedData);
                    setLabels(months);

                    }
                    else {
                        console.error('Data is not an array:', data);
                    }
                }
                catch(error){
                    console.error("Error fetching chart data:", error);

                }
            }
            fetchData();
        },[selectedYear]);
    
       


        const datasets = chartData.map((item, index) => ({
                label: item.projectID,
                data: months.map(month => item[month] || null), 
                borderColor: `hsl(${(index * 40) % 360}, 70%, 60%)`, 
                backgroundColor: `hsl(${(index * 41) % 360}, 70%, 80%)`,
                fill: false
            }));
      
      const data = {
        labels,
        datasets
        };

        const options = {
            plugins: {
                legend: {
                    position: 'bottom' ,
                },
                title: {
                    display: true,
                    text: 'Forecast ',
                },
            },
            responsive: true,
            scales: {               
                y: {
                  beginAtZero: true,
                  min: 500000,
                  suggestedMin: 500000
                }
              }
          };

          


   
        return(
        <div className="container pt-2">  
        
            <div className="d-flex justify-content-right align-items-center">
                    <h2>Revenue Dashboard</h2>
            </div>
            <div className="d-flex justify-content-right align-items-center">
                    <select 
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                
                        }}
                        className="form-select"
                    >
                        <option>Choose a year</option>                    
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>                    
                    </select>
                </div>
        
           


<div className="container mt-4">
  <div className="d-flex align-items-center" style={{ height: '100%' }}>
    
    <div className="col-md-4">
      <div className="row ">
        <div className="col-6 mb-3">
          <div className="card bg-light text-center" style={{borderTop: 'none', borderBottom:'none', borderRight:'none',borderLeft: '12px solid #ff0000' }}>
            <div className="card-body">
              <h5 className="card-title">Goal YTD</h5>
              <p className="card-text">
                <NumericFormat 
                    value={(planTotal/12*3)}    
                    displayType="text"               
                    thousandSeparator={true}
                    prefix="$"
                    decimalScale={0}
                    fixedDecimalScale={true}
                />                
                </p>
            </div>
          </div>
        </div>
        <div className="col-6 mb-3">
          <div className="card bg-light text-center" style={{borderTop: 'none', borderBottom:'none', borderRight:'none',borderLeft: '12px solid rgb(244, 216, 9)' }}>
            <div className="card-body">
              <h5 className="card-title">Revenue YTD</h5>
              <p className="card-text">
              <NumericFormat 
                    value={actualTotal}    
                    displayType="text"               
                    thousandSeparator={true}
                    prefix="$"
                    decimalScale={0}
                    fixedDecimalScale={true}
                />
               </p>
            </div>
          </div>
        </div>
        <div className="col-6 mb-3">
          <div className="card bg-light text-center" style={{borderTop: 'none', borderBottom:'none', borderRight:'none',borderLeft: '12px solid #2c09f4' }}>
            <div className="card-body">
              <h5 className="card-title">Goal GAP</h5>
              <p className="card-text">
              <NumericFormat 
                    value={(planTotal/12*3)-actualTotal}    
                    displayType="text"               
                    thousandSeparator={true}
                    prefix="$"
                    decimalScale={0}
                    fixedDecimalScale={true}
                />
                
                
                </p>
            </div>
          </div>
        </div>
        <div className="col-6 mb-3">
          <div className="card bg-light text-center" style={{borderTop: 'none', borderBottom:'none', borderRight:'none',borderLeft: '12px solid #1b650a' }}>
            <div className="card-body">
              <h5 className="card-title">Revenue Vs Goal</h5>
              <p className="card-text">
              <NumericFormat 
                    value={(actualTotal / (planTotal/12*3))*100}    
                    displayType="text"               
                    thousandSeparator={true}
                    suffix="%"
                    decimalScale={2}
                    fixedDecimalScale={true}
                />
              </p>
            </div>
          </div>
        </div>
        <div className="col-6 mb-3">
          <div className="card bg-light text-center" style={{borderTop: 'none', borderBottom:'none', borderRight:'none',borderLeft: '12px solid #1b650a' }}>
            <div className="card-body">
              <h5 className="card-title">Backlog</h5>
              <p className="card-text">
              <NumericFormat 
                    value={backlogTotal}    
                    displayType="text"               
                    thousandSeparator={true}
                    prefix="$"
                    decimalScale={0}
                    fixedDecimalScale={true}
                />
              </p>
            </div>
          </div>
        </div>
        <div className="col-6 mb-3">
          <div className="card bg-light text-center" style={{borderTop: 'none', borderBottom:'none', borderRight:'none',borderLeft: '12px solid #1b650a' }}>
            <div className="card-body">
              <h5 className="card-title">Backlog Vs Goal</h5>
              <p className="card-text">
              <NumericFormat 
                    value={(backlogTotal / planTotal)*100}    
                    displayType="text"               
                    thousandSeparator={true}
                    suffix="%"
                    decimalScale={2}
                    fixedDecimalScale={true}
                />
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* Right side: Chart */}
    <div className="col-md-8">
      <div className="card h-100 border-0">
        <div className="card-body">
          <h5 className="card-title"></h5>
          <Line options={options} data={data} />  
        </div>
      </div>
    </div>
  </div>
</div>

       
</div>
    );
}
export default RevenueComponent; 
