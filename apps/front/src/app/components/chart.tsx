"use client"
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import countryRegionMapping from './region';

type PopulationData = {
    Year: number;
    Entity: string;
    Population: number;
    Region?: string;
};


const MainChart: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await d3.csv("https://catalog.ourworldindata.org/explorers/un/2022/un_wpp/population__all__full__records.csv", (d: d3.DSVRowString<string>) => {
                const region = countryRegionMapping[d.location] || 'Other';
                return {
                    Year: +d.year,
                    Entity: d.location,
                    Population: +d.population__all__all__records,
                    Region: region,
                } as PopulationData;
            });

            const filteredData = data.filter(d => d.Year >= 1950 && d.Year <= 2021);

            const svg = d3.select(svgRef.current);
            const width = 800;
            const height = 500;

            svg.attr('width', width).attr('height', height);

            const margin = { top: 20, right: 30, bottom: 40, left: 90 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear().range([0, chartWidth]);
            const y = d3.scaleBand().range([0, chartHeight]).padding(0.1);

            const color = d3.scaleOrdinal<string>()
                .domain(['Asia', 'Europe', 'Africa', 'Oceania', 'Americas', 'Other'])
                .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#7f7f7f']);

            const updateChart = (year: number) => {
                const yearData = filteredData
                    .filter(d => d.Year === year)
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
                            .attr('width', d => x(d.Population) / 1.2)
                            .attr('height', y.bandwidth())
                            .attr('fill', 'steelblue')
                            .attr('fill', d => color((d as PopulationData).Region!)),
                        update => update
                            .attr('y', d => y(d.Entity)!)
                            .attr('width', d => x(d.Population) / 1.2 )
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
                            //.attr('text-anchor', 'middle')
                            .text(d => d.Population.toLocaleString()),
                        update => update
                            .attr('x', d => x(d.Population) / 1.175)
                            .text(d => d.Population.toLocaleString()),
                        exit => exit.remove()
                    );
            };

            let yearIndex = 0;
            const interval = setInterval(() => {
                const year = 1950 + yearIndex;

                updateChart(year);
                yearIndex = (yearIndex + 1) % (2021 - 1950 + 1);
            }, 1000);

            return () => clearInterval(interval);
        };

        fetchData();
    }, []);

    return <svg ref={svgRef}></svg>;
};

export default MainChart;
