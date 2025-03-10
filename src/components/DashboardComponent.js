import React, { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import usFlag from "../images/american-flag.png";
import colFlag from "../images/colombia-flag.webp";
import inFlag from "../images/india-flag.png";
import mxFlag from "../images/mexico-flag.png";
import mes from "../images/engagement.jpg";
import auto from "../images/auto.jpeg";
import bes from "../images/bes.jpeg";
import mits from "../images/itsm.png";
import dds from "../services/dashboard.service.js";



const HomeDashboardComponent = () =>{
    const chartRef = useRef(null); // Refs for 4 charts
    const [hcByCountry, setHcByCountry] = useState([]);
    const [hcByCompany, setHcByCompany] = useState([]);
    const [hclast12Months, setHclast12Months] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyResponse, countryResponse,last12MonthsResponse] = await Promise.all([
                    dds.getHCbyCompany(),
                    dds.getHCbyCountry(),
                    dds.getHClast12Months()
                ]);
    
                setHcByCompany(companyResponse.data);
                setHcByCountry(countryResponse.data);
                setHclast12Months(last12MonthsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);

    const getTotalByCountry = (countryName) => {
        const countryData = hcByCountry.find(item => item.Country === countryName);
        return countryData ? countryData.Total : null; // Returns null if the country is not found
    };

    const getTotalByCompany = (companyName) => {
        const companyData = hcByCompany.find(item => item.Company === companyName);
        return companyData ? companyData.Total : null; // Returns null if the Company is not found
    };

   

    const drawChart = useCallback((chartContainer) => {
        // Clear previous chart
        d3.select(chartContainer).selectAll("*").remove();
      

        // Set dimensions
        const width = 900;
        const height = 350;
        const margin = { top: 10, right: 30, bottom: 30, left: 30 }; // Add space for Y-axis

        // Create SVG
        const svg = d3
            .select(chartContainer)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g") // Create a group to apply margins
            .attr("transform", `translate(${margin.left},${margin.top})`);


        const x0 = d3.scaleBand()
            .domain(hclast12Months.map(d => d.month))
            .range([0, width])
            .padding(0.2);
    
        const x1 = d3.scaleBand()
            .domain(["arrivals", "departures"])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(hclast12Months, d => Math.max(d.arrivals, d.departures))])
            .nice()
            .range([height, 0]);
            
        const yLine = d3.scaleLinear()
            .domain([d3.min(hclast12Months, d => d.headcount) - 3, d3.max(hclast12Months, d => d.headcount) + 3])
            .nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(["arrivals", "departures"])
            .range(["#004569", "#FF1918"]);

        // Line generator
        const line = d3.line()
            .x(d => x0(d.month) + x0.bandwidth() / 2) // Center the points in each month
            .y(d => yLine(d.headcount));  

        // Add grouped bars
        svg.selectAll(".group")
            .data(hclast12Months)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${x0(d.month)},0)`)
            .selectAll("rect")
            .data(d => ["arrivals", "departures"].map(key => ({ key, value: d[key] })))
            .enter()
            .append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d=> color(d.key));


        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x0));
        
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Right Y-Axis (Headcount)
        svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(yLine));

        // Draw yellow line
        svg.append("path")
            .datum(hclast12Months)
            .attr("fill", "none")
            .attr("stroke", "#FFCD00")
            .attr("stroke-width", 4)
            .attr("d", line);     

        },[hclast12Months]);

 
    
        useEffect(() => {
            drawChart(chartRef.current);
        }, [drawChart]);

    return(

   
   

        <div className="container mt-4">
            <h2>Dashboards</h2>
            <table align="center" class="table table-borderless ">
            <tbody>
                <tr >
                    <td style={{ width: "10%" }} valign="middle" align="center"><img src={usFlag} alt="US Flag" width="80" height="48"/></td>
                    <td style={{ width: "5%" }} valign="middle" align="center"><h2>{getTotalByCountry("USA")}</h2></td>
                    <td style={{ width: "10%" }} valign="middle" align="center"></td>
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

            </tbody>                
            </table>

            <table className="table table-bordered text-center align-middle">
                    <tbody>
                    <tr>
                        <td>
                        <div ref={drawChart} className="chart-placeholder "></div>            
                        </td>
                    </tr>
                    <tr className="table-dark">
                        <td><strong>Headcount for the last 12 months</strong></td>
                    </tr>
                </tbody>
                </table>         

                {/* Tables 
                <table className="table table-bordered text-center align-middle">
                <tbody>
                    <tr className="table-dark" style={{ height: "10%" }}>
                        <td colSpan="2"><strong>Title 1</strong></td>
                        <td colSpan="2"><strong>Title 2</strong></td>
                    </tr>
                    <tr style={{ height: "40%" }}>
                        <td colSpan="2">
                            <div ref={(el) => (chartRefs.current[0] = el)} className="chart-placeholder bg-light p-3"></div>
                            
                        </td>
                        <td colSpan="2">
                            <div ref={(el) => (chartRefs.current[1] = el)} className="chart-placeholder bg-light p-3"></div>
                        </td>
                    </tr>

                    <tr className="table-dark" style={{ height: "10%" }}>
                        <td colSpan="2"><strong>Title 3</strong></td>
                        <td colSpan="2"><strong>Title 4</strong></td>
                    </tr>
                    <tr style={{ height: "40%" }}>
                        <td colSpan="2">
                            <div ref={(el) => (chartRefs.current[2] = el)} className="chart-placeholder bg-light p-3"></div>
                        </td>
                        <td colSpan="2">
                            <div ref={(el) => (chartRefs.current[3] = el)} className="chart-placeholder bg-light p-3"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
            */}

        </div>
    );
};

export default HomeDashboardComponent;