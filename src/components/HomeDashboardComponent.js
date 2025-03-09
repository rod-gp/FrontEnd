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
    const chartRefs = useRef([]); // Refs for 4 charts
    const chartTypes = ['bar', 'clustered', 'line', 'pie']; // Example of chart types
    const chartColors = ["steelblue", "tomato", "green", "purple"];
    const [hcByCountry, setHcByCountry] = useState([]);
    const [hcByCompany, setHcByCompany] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyResponse, countryResponse] = await Promise.all([
                    dds.getHCbyCompany(),
                    dds.getHCbyCountry()
                ]);
    
                setHcByCompany(companyResponse.data);
                setHcByCountry(countryResponse.data);
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

    const drawChart = useCallback((chartContainer, color, ctype) => {
        // Clear previous chart


        d3.select(chartContainer).selectAll("*").remove();

        // Sample data
        const data = [10, 20, 30, 20, 50, 30, 70 ];


        // Set dimensions
        const width = 400;
        const height = 250;
        const margin = { top: 10, right: 10, bottom: 30, left: 40 }; // Add space for Y-axis

        // Create SVG
        const svg = d3
            .select(chartContainer)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g") // Create a group to apply margins
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleBand()
            .domain(data.map((_, i) => i))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .range([height, 0]);

            switch (ctype) {
                case 'bar':
                    renderBarChart(svg, data, xScale, yScale, width, height, color);
                    break;
                case 'clustered':
                    renderClusteredBarChart(svg, data, xScale, yScale, width, height, color);
                    break;
                case 'line':
                    renderLineChart(svg, data, xScale, yScale, width, height, color);
                    break;
                case 'pie':
                    renderPieChart(svg, data, width, height);
                    break;
                default:
                    break;
            }
        },[]);



        useEffect(() => {
            chartRefs.current.forEach((chartRef, index) => {
                if (chartRef) {
                    drawChart(chartRef, chartColors[index], chartTypes[index]);
                }
            });
        }, [drawChart]);


        const renderBarChart = (svg, data, xScale, yScale, width, height, color) => {
            svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", (_, i) => xScale(i))
                .attr("y", d => yScale(d))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - yScale(d))
                .attr("fill", color);
    
            svg.append("g")
                .call(d3.axisLeft(yScale));
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));
        };

        const renderClusteredBarChart = (svg, data, xScale, yScale, width, height, color) => {
            const groupCount = 2; // Number of bars per group
    
            // Add grouped bars
            svg.selectAll(".group")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", (_, i) => `translate(${xScale(i)}, 0)`)
                .selectAll("rect")
                .data(d => [d, d + 10]) // Example: 2 bars per group, with a slight offset
                .enter()
                .append("rect")
                .attr("x", (_, i) => i * (xScale.bandwidth() / groupCount))
                .attr("y", d => yScale(d))
                .attr("width", xScale.bandwidth() / groupCount)
                .attr("height", d => height - yScale(d))
                .attr("fill", color);
    
            svg.append("g")
                .call(d3.axisLeft(yScale));
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));
        };

        const renderLineChart = (svg, data, xScale, yScale, width, height, color) => {
            const line = d3.line()
                .x((d, i) => xScale(i))
                .y(d => yScale(d));
    
            svg.append("path")
                .data([data])
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("d", line);
    
            svg.append("g")
                .call(d3.axisLeft(yScale));
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));
        };
    
        const renderPieChart = (svg, data, width, height) => {
            const radius = Math.min(width, height) / 2;
    
            const pie = d3.pie()(data);
    
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);
    
            const color = d3.scaleOrdinal(d3.schemeCategory10);
    
            const g = svg.append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);
    
            g.selectAll(".arc")
                .data(pie)
                .enter()
                .append("g")
                .attr("class", "arc")
                .append("path")
                .attr("d", arc)
                .attr("fill", (d, i) => color(i));
        };
    

    return(

   
   

        <div className="container mt-4">
            <h2>Dashboards</h2>
            <table align="center" class="table table-borderless w-75">
            <tbody>
                <tr style={{ height: "60px" }}>
                    <td style={{ width: "20%" }} valign="middle" align="center"><img src={usFlag} alt="US Flag" width="80" height="48"/></td>
                    <td style={{ width: "10%" }} valign="middle" align="center"><h2>{getTotalByCountry("USA")}</h2></td>
                    <td style={{ width: "40%" }} valign="middle" align="center"></td>
                    <td style={{ width: "20%" }} valign="middle" align="center"><img src={mes} alt="Engagement" width="60" height="48"/></td>
                    <td style={{ width: "10%" }} valign="middle" align="center"><h2>{getTotalByCompany("ES")}</h2></td>
               
                </tr>
                <tr style={{ height: "60px" }}>
                    <td align="center"><img src={mxFlag} alt="MX Flag" width="80" height="48"/></td>
                    <td align="center"><h2>{getTotalByCountry("Mexico")}</h2></td>
                    <td style={{ width: "40%" }} valign="middle" align="center"></td>
                    <td align="center"><img src={bes} alt="MX Flag" width="80" height="48"/></td>
                    <td align="center"><h2>{getTotalByCompany("BES")}</h2></td>
                </tr>    
                <tr style={{ height: "60px" }}>
                    <td align="center"><img src={colFlag} alt="CO Flag" width="80" height="48"/></td>
                    <td align="center"><h2>{getTotalByCountry("Colombia")}</h2></td>
                    <td style={{ width: "40%" }} valign="middle" align="center"></td>
                    <td align="center"><img src={auto} alt="CO Flag" width="80" height="48"/></td>
                    <td align="center"><h2>{getTotalByCompany("AS")}</h2></td>
                </tr>    
                <tr style={{ height: "60px" }}>
                    <td align="center"><img src={inFlag} alt="IN Flag" width="80" height="48"/></td>
                    <td align="center"><h2>{getTotalByCountry("India")}</h2></td>
                    <td style={{ width: "40%" }} valign="middle" align="center"></td>
                    <td align="center"><img src={mits} alt="IN Flag" width="80" height="48"/></td>
                    <td align="center"><h2>{getTotalByCompany("MITS")}</h2></td>
                </tr>    

            </tbody>                
            </table>



            <table className="table table-bordered text-center align-middle">
                <tbody>
                    {/* Row 1 */}
                    <tr className="table-dark" style={{ height: "10%" }}>
                        {/* Quadrant 1 */}
                        <td colSpan="2"><strong>Title 1</strong></td>
                        <td colSpan="2"><strong>Title 2</strong></td>
                    </tr>
                    <tr style={{ height: "40%" }}>
                        <td colSpan="2">
                            {/* Chart 1 Placeholder */}
                            <div ref={(el) => (chartRefs.current[0] = el)} className="chart-placeholder bg-light p-3"></div>
                            
                        </td>
                        <td colSpan="2">
                            {/* Chart 2 Placeholder */}
                            <div ref={(el) => (chartRefs.current[1] = el)} className="chart-placeholder bg-light p-3"></div>
                        </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="table-dark" style={{ height: "10%" }}>
                        {/* Quadrant 3 */}
                        <td colSpan="2"><strong>Title 3</strong></td>
                        <td colSpan="2"><strong>Title 4</strong></td>
                    </tr>
                    <tr style={{ height: "40%" }}>
                        <td colSpan="2">
                            {/* Chart 3 Placeholder */}
                            <div ref={(el) => (chartRefs.current[2] = el)} className="chart-placeholder bg-light p-3"></div>
                        </td>
                        <td colSpan="2">
                            {/* Chart 4 Placeholder */}
                            <div ref={(el) => (chartRefs.current[3] = el)} className="chart-placeholder bg-light p-3"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default HomeDashboardComponent;