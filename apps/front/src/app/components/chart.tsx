"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import _ from "lodash";
import countryRegionMapping from './region';
import Legend from './Legend';

type PopulationData = {
    Year: number;
    Entity: string;
    Population: number;
    Region?: string;
};

const MainChart: React.FC = () => {
    const startYear = 1950;
    const endYear = 2021;
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [year, setYear] = useState<number>(startYear);

    useEffect(() => {
        const fetchData = async () => {
            const data = await d3.csv("http://localhost:3333/population-and-demography-data", (d: d3.DSVRowString<string>) => {
                const region = countryRegionMapping[d["Country name"]] || 'Other';
                return {
                    Year: +d["Year"],
                    Entity: d["Country name"],
                    Population: +d["Population"],
                    Region: region,
                } as PopulationData;
            });

            const filteredData = data.filter(d => d.Year >= startYear && d.Year <= endYear);

            const svg = d3.select(svgRef.current);
            const width = 800;
            const height = 500;

            svg.attr('width', width).attr('height', height);

            const margin = { top: 20, right: 30, bottom: 80, left: 90 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear().range([0, chartWidth]);
            const y = d3.scaleBand().range([0, chartHeight]).padding(0.1);

            const color = d3.scaleOrdinal<string>()
                .domain(['Asia', 'Europe', 'Africa', 'Oceania', 'Americas', 'Other'])
                .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#7f7f7f']);


            const xAxis = d3.axisTop(x).ticks(4);

            const xAxisGroup = g.append('g')
                .attr('transform', `translate(0,0)`)
                .attr("stroke-width","0.2")
                .attr("opacity",".3")
                .attr('class', 'x-axis');

            const _x = d3.scaleLinear()
                .domain([startYear, endYear])
                .range([-50, 680]);

            g
                .append("g")
                .attr('transform', `translate(0,${chartHeight + 40})`)
                .call(d3.axisBottom(_x).tickValues(_.range(startYear, endYear + 1, 4)));

            g
                .append("triangle")
                .attr("cx", 0)
                .attr("cy", 50)
                .attr("r", 8)


            const updateChart = (year: number) => {
                const yearData = filteredData
                    .filter(d => d.Year === year && d.Region !== "Other")
                    .sort((a, b) => d3.descending(a.Population, b.Population))
                    .slice(0, 12);

                x.domain([0, d3.max(yearData, d => d.Population) || 0]);
                y.domain(yearData.map(d => d.Entity));

                g.selectAll('.bar')
                    .data(yearData)
                    .join(
                        enter => enter.append('rect')
                            .attr('class', 'bar')
                            .attr('x', 0)
                            .attr('y', d => y(d.Entity)!)
                            .attr('width', d => x(d.Population) / 1.25)
                            .attr('height', y.bandwidth())
                            .attr('fill', 'steelblue')
                            .attr('fill', d => color((d as PopulationData).Region!)),
                        update => update
                            .attr('y', d => y(d.Entity)!)
                            .attr('width', d => x(d.Population) / 1.2)
                            .attr('fill', d => color((d as PopulationData).Region!)),
                        exit => exit.remove()
                    );

                g.selectAll('.label')
                    .data(yearData)
                    .join(
                        enter => enter.append('text')
                            .attr('class', 'label')
                            .attr('x', d => x(d.Population) / 1.175)
                            .attr('y', d => y(d.Entity)! + y.bandwidth() / 2)
                            .attr('dy', '0.35em')
                            .text(d => d.Population.toLocaleString()),
                        update => update
                            .attr('x', d => x(d.Population) / 1.175)
                            .text(d => d.Population.toLocaleString()),
                        exit => exit.remove()
                    );

                g.selectAll('.country-label')
                    .data(yearData, d => (d as PopulationData).Entity)
                    .join(
                        enter => enter.append('text')
                            .attr('class', 'country-label')
                            .attr('x', -5)
                            .attr('y', d => y((d as PopulationData).Entity)! + y.bandwidth() / 2)
                            .attr('dy', '0.35em')
                            .attr('text-anchor', 'end')
                            .text(d => (d as PopulationData).Entity),
                        update => update
                            .attr('y', d => y((d as PopulationData).Entity)! + y.bandwidth() / 2)
                            .text(d => (d as PopulationData).Entity),
                        exit => exit.remove()
                    );

                xAxisGroup.call(xAxis.tickSize(-400));

            };

            let yearIndex = 0;
            const interval = setInterval(() => {
                const year = startYear + yearIndex;
                setYear(year);
                updateChart(year);
                yearIndex = (yearIndex + 1) % (endYear - startYear + 1);
            }, 100);

            return () => clearInterval(interval);
        };

        fetchData();
    }, []);

    return (
        <div>
            <Legend />
            <svg ref={svgRef}></svg>
            {/* <input
                type="range"
                min="1950"
                max="2021"
                value={year}
                onChange={(e) => setYear(+e.target.value)}
                style={{ width: '100%' }}
            /> */}
        </div>
    );
};

export default MainChart;
