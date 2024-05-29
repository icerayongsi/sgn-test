'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import Legend, { regions } from './legend';
import axios, { isAxiosError } from 'axios';

interface PopulationData {
  Year: number;
  Entity: string;
  Population: number;
  Region?: string;
  Flag?: string;
}

interface Country {
  name: string;
  tld: string[];
  cca2: string;
  ccn3: string;
  cca3: string;
  cioc: string;
  fifa: string;
  independent: boolean;
  status: string;
  unMember: boolean;
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  callingcode: string;
  capital: string[];
  altSpellings: string[];
  region: string;
  subregion: string;
  continents: string[];
  languages: {
    [key: string]: string;
  };
  latlng: number[];
  landlocked: boolean;
  borders: string[];
  area: number;
  flag: string;
  coatOfArms: string;
  population: number;
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
  car: {
    signs: string[];
    side: string;
  };
  postalCodeFormat: string;
  startOfWeek: string;
  timezones: string[];
}

interface FilteredCountry {
  name: string;
  region: string;
  flag: string;
}

const MainChart: React.FC = () => {
  const startYear = 1950;
  const endYear = 2021;
  const intervalTime = 300;
  const width = 800;
  const height = 500;
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  let countryInfo: FilteredCountry[];

  async function fetchCountryInfo() {
    try {
      const { data } = await axios.get(`${process.env.API_URL}/countryInfo`);
      const result: FilteredCountry[] = [];
      data.map((country: Country) => {
        result.push({
          name: country.name,
          region: country.region,
          flag: country.flag,
        });
      });
      countryInfo = result;
    } catch (error) {
      if (isAxiosError(error)) console.error(error.response?.data);
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchCountryInfo();
      const data = await d3.csv(
        `${process.env.API_URL}/population-and-demography-data`,
        (d: d3.DSVRowString<string>) => {
          const region =
            countryInfo.find(
              (country: FilteredCountry) => country.name === d['Country name']
            )?.region || 'Other';
          const flag =
            countryInfo.find(
              (country: FilteredCountry) => country.name === d['Country name']
            )?.flag || 'Other';
          return {
            Year: +d['Year'],
            Entity: d['Country name'],
            Population: +d['Population'],
            Region: region,
            Flag: flag,
          } as PopulationData;
        }
      );
      const filteredData = data.filter(
        (d) => d.Year >= startYear && d.Year <= endYear
      );

      const svg = d3.select(svgRef.current);

      svg.attr('width', width).attr('height', height);

      const margin = { top: 20, right: 30, bottom: 80, left: 90 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().range([0, chartWidth]);
      const y = d3.scaleBand().range([0, chartHeight]).padding(0.1);

      const color = d3
        .scaleOrdinal<string>()
        .domain(_.map(regions, 'name'))
        .range(_.map(regions, 'color'));

      const xAxis = d3.axisTop(x).ticks(4);

      const xAxisGroup = g
        .append('g')
        .attr('transform', `translate(0,0)`)
        .attr('stroke-width', '0.2')
        .attr('opacity', '.6');

      const _x = d3
        .scaleLinear()
        .domain([startYear, endYear])
        .range([-50, 680]);
      g.append('g')
        .attr('transform', `translate(0,${chartHeight + 40})`)
        .attr('stroke-width', '0.6')
        .attr('opacity', '.6')
        .call(d3.axisBottom(_x).tickValues(_.range(startYear, endYear + 1, 4)));

      g.append('circle')
        .attr('stroke-width', '0.6')
        .attr('opacity', '.6')
        .attr('cx', _x(startYear))
        .attr('cy', 440)
        .attr('r', 3)
        .attr('class', 'circle-runner');

      const updateChart = (year: number) => {
        const yearData = filteredData
          .filter((d) => d.Year === year && d.Region !== 'Other')
          .sort((a, b) => d3.descending(a.Population, b.Population))
          .slice(0, 12);

        x.domain([0, d3.max(yearData, (d) => d.Population) || 0]);
        y.domain(yearData.map((d) => d.Entity));

        g.selectAll('.circle-runner')
          .data(yearData)
          .join(
            (enter) =>
              enter
                .append('circle')
                .attr('class', 'circle-runner')
                .attr('cx', _x(startYear + 1)),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .attr('cx', (d) => _x(d.Year + 1)),
            (exit) => exit.remove()
          );

        g.selectAll('.year-label')
          .data(yearData)
          .join(
            (enter) =>
              enter
                .append('text')
                .attr('x', 510)
                .attr('y', 360)
                .attr('class', 'year-label')
                .style('fill', '#797979')
                .style('font', '72px Helvetica')
                .text((d) => d.Year),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .text((d) => d.Year),
            (exit) => exit.remove()
          );

        g.selectAll('.total-label')
          .data(yearData)
          .join(
            (enter) =>
              enter
                .append('text')
                .attr('x', 340)
                .attr('y', 395)
                .attr('class', 'total-label')
                .attr('font-weight', 200)
                .style('fill', '#797979')
                .style('font', '36px Helvetica')
                .text(
                  `Total : ${yearData
                    .reduce(
                      (accumulator, currentValue: PopulationData) =>
                        accumulator + currentValue.Population,
                      0
                    )
                    .toLocaleString()}`
                ),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .text(
                  `Total : ${yearData
                    .reduce(
                      (accumulator, currentValue: PopulationData) =>
                        accumulator + currentValue.Population,
                      0
                    )
                    .toLocaleString()}`
                ),
            (exit) => exit.remove()
          );
        console.log();
        g.selectAll('.bar')
          .data(yearData)
          .join(
            (enter) =>
              enter
                .append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .attr('y', (d) => y(d.Entity)!)
                .attr('width', (d) => x(d.Population) / 1.2)
                .attr('height', y.bandwidth())
                .attr('fill', 'steelblue')
                .attr('fill', (d) => color((d as PopulationData).Region!)),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .attr('y', (d) => y(d.Entity)!)
                .attr('width', (d) => x(d.Population) / 1.2)
                .attr('fill', (d) => color((d as PopulationData).Region!)),
            (exit) => exit.remove()
          );

        g.selectAll('.label')
          .data(yearData)
          .join(
            (enter) =>
              enter
                .append('text')
                .attr('class', 'label')
                .attr('x', (d) => x(d.Population) / 1.175)
                .attr('y', (d) => y(d.Entity)! + y.bandwidth() / 2)
                .attr('dy', '0.35em')
                .text((d) => d.Population.toLocaleString()),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .attr('x', (d) => x(d.Population) / 1.175)
                .text((d) => d.Population.toLocaleString()),
            (exit) => exit.remove()
          );

        g.selectAll('.country-label')
          .data(yearData, (d) => (d as PopulationData).Entity)
          .join(
            (enter) =>
              enter
                .append('text')
                .attr('class', 'country-label')
                .attr('x', -5)
                .attr(
                  'y',
                  (d) => y((d as PopulationData).Entity)! + y.bandwidth() / 2
                )
                .attr('dy', '0.35em')
                .attr('text-anchor', 'end')
                .text((d) => (d as PopulationData).Entity),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .attr(
                  'y',
                  (d) => y((d as PopulationData).Entity)! + y.bandwidth() / 2
                )
                .text((d) => (d as PopulationData).Entity),
            (exit) => exit.remove()
          );

        g.selectAll('.country-flag')
          .data(yearData, (d) => (d as PopulationData).Entity)
          .join(
            (enter) =>
              enter
                .append('image')
                .attr('class', 'country-flag')
                .attr('xlink:href', (d) => (d as PopulationData).Flag!)
                .attr('x', (d) => x(d.Population))
                .attr(
                  'y',
                  (d) =>
                    y((d as PopulationData).Entity)! + y.bandwidth() / 2 - 10
                )
                .attr('width', 20)
                .attr('height', 15),
            (update) =>
              update
                .transition()
                .duration(intervalTime)
                .attr('xlink:href', (d) => (d as PopulationData).Flag!)
                .attr('x', 5)
                .attr(
                  'y',
                  (d) =>
                    y((d as PopulationData).Entity)! + y.bandwidth() / 2 - 8
                ),
            (exit) => exit.remove()
          );

        xAxisGroup.call(xAxis.tickSize(-400));
      };

      let yearIndex = 0;
      const interval = setInterval(() => {
        const year = startYear + yearIndex;
        updateChart(year);
        yearIndex = (yearIndex + 1) % (endYear - startYear + 1);
      }, intervalTime);

      return () => clearInterval(interval);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div id="block-main" className="grid justify-items-stretch rounded shadow">
        <Legend />
        <svg ref={svgRef} className="justify-self-center"></svg>
      </div>
    </div>
  );
};

export default MainChart;
