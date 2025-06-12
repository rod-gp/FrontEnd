import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import dds from "../services/dashboard.service.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

const AttritionComponent = () => {

    const [selectedQuarter, setSelectedQuarter] = useState(new Date());
    const [attrition, setAttrition] = useState([]);
    const [attritionDetails, setAttritionDetails] = useState([]);
   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [byAttrition, attritionDetails] = await Promise.all([
                    dds.getAttrition(selectedQuarter),
                    dds.getAttritionDetails(selectedQuarter)
                ]);
                
                setAttrition(byAttrition.data);
                setAttritionDetails(attritionDetails.data);
                console.log(byAttrition.data);

          } catch (error) {
            console.error('Error fetching data:', error);
          }
            
        };
    
        fetchData();        
        

    }, [selectedQuarter]);

   

    const formatDate = (dateString) => {
        const [year, month] = dateString.split("-");
        const date = new Date(`${year}-${month}-02`); // Create a valid Date object
        return date.toLocaleString("en-US", { month: "short" }) + "/" + year;
    };



    const labels = attrition.map(att => formatDate(att.Month));
    const attritionData = attrition.map(att => att.Employees_Attrition);
    const attritionData2 = attrition.map(att => att.Employees_left);
    
    
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
      );

    const options = {
        responsive: true,
        
        plugins: {
          legend: {
            position: 'top' ,
          },
          title: {
            display: true,
            text: 'Attrition last 12 months',
          },
        },
        scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              ticks: {
                stepSize: 1,
              },
            },
          },
      };

    const data = {
        labels,
        datasets: [
          {
            label: 'Unplanned departures',
            data: attritionData,
            borderColor: '#6A6A6A',
            backgroundColor: '#4A4A4A',
            yAxisID: 'y',
          },
          {
            label: 'Total departures',
            data: attritionData2,
            borderColor: '#00A99D',
            backgroundColor: '#00A99D',
            yAxisID: 'y',
          }           
        ],
      };

    



    return (
    <div>  
      <div className="row">
        <div className="col-3 d-flex justify-content-right align-middle">
        <h2>Attrition Analysis</h2>
        </div>
      <div className="col-9 d-flex justify-content-right align-items-center">
          <select 
              value={selectedQuarter}
              onChange={(e) => {
                  setSelectedQuarter(e.target.value);
      
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
      <div className="row pt-5"></div>
      </div>
        
        <div className="d-flex justify-content-around ">
            <div className="d-flex justify-content-center align-items-bottom flex-fill">
            <table className="table table-striped text-center" style={{ width: "350px" }}>
                        <thead className="table-dark rounded-top">
                        <tr>
                            <th className="p-0" style={{borderTopLeftRadius: '5px'}}>Month</th>
                            <th className="p-0">Total Left</th>
                            <th className="p-0">Attrition</th>
                            <th className="p-0" style={{borderTopRightRadius: '5px'}}>Attrition %</th>
                        </tr>            
                        </thead>
                        <tbody>
                            {attrition.map((att) => (
                            <tr key={att.Month}>
                      
                                <td className="p-0" align='Middle'>{formatDate(att.Month)}</td>
                                <td className="p-0" align='middle'>{att.Employees_left}</td>
                                <td className="p-0" align='middle'>{att.Employees_Attrition}</td>
                                <td className="p-0" align='middle'>{att.Attrition_Percentage} %</td>
                            </tr>
                            ))}
                            </tbody>
                        <tfoot  className="table-dark rounded-bottom">
                             <tr key='14'>
                                <td className="p-0 text-end fw-bold" style={{borderBottomLeftRadius: '5px'}}>Total</td>

                                <td className="p-0 text-center fw-bold" >
                                        {attrition.reduce((sum, { Employees_left }) => sum + parseFloat(Employees_left || 0),0)}                                        
                                </td>
                                <td className="p-0 text-center fw-bold" >
                                        {attrition.reduce((sum, { Employees_Attrition }) => sum + parseFloat(Employees_Attrition || 0),0)}                                        
                                </td>
                                <td className="p-0 text-center fw-bold" style={{ borderBottomRightRadius: '5px' }}>
                                       <NumericFormat 
                                                                   value={attrition.reduce((sum, { Attrition_Percentage }) => sum + parseFloat(Attrition_Percentage || 0),0)}
                                                                   displayType="text"
                                                                   thousandSeparator={true}
                                                                   decimalScale={2}
                                                                   fixedDecimalScale={true}
                                                                   suffix="%"
                                                                   />                                      
                                </td>
                            </tr>
                        </tfoot>
                </table>
            </div>
            <div className="d-flex border justify-content-center flex-fill">
                <Line options={options} data={data} />
            </div>
        </div>
        <div className="row pt-5">
            <div className="col-8 table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table table-striped text-center table-hover sticky-table" >
                    <thead className="table-dark rounded-top">
                        <tr>
                            <th className="p-0" style={{position: 'sticky', top: 0, backgroundColor: '#343a40', zIndex: 2, borderTopLeftRadius: '5px'}}>Month</th>
                            <th className="p-0" style={{position: 'sticky', top: 0, backgroundColor: '#343a40', zIndex: 2}}>Name</th>
                            <th className="p-0" style={{position: 'sticky', top: 0, backgroundColor: '#343a40', zIndex: 2}}>City</th>
                            <th className="p-0" style={{position: 'sticky', top: 0, backgroundColor: '#343a40', zIndex: 2, borderTopRightRadius: '5px'}}>Attrition</th>
                        </tr>            
                    </thead>
                    <tbody>
                            {attritionDetails.map((att, index) => (
                            <tr key={index}>                      
                                <td className="p-0" align='Middle'>{formatDate(att.Month)}</td>
                                <td className="p-0" align='middle'>{att.Employee_Name}</td>
                                <td className="p-0" align='middle'>{att.City_Name}</td>
                                <td className="p-0" align='middle'>{att.Attrition===1?'Yes':'No'} </td>
                            </tr>
                            ))}
                    </tbody>
              </table>
                            
            </div>
        </div>

        </div>
    );
}

export default AttritionComponent;