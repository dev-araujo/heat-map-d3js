import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

const width = 1000;
const height = 600;
const padding = 60;

// Container do gráfico
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");
const colors = ["#08306b", "#2171b5", "#6baed6", "#c6dbef", "#f7fbff"];

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((data) => {
  const baseTemp = data.baseTemperature; // temperatura
  const monthlyData = data.monthlyVariance; // dados dos meses

  const years = Array.from(new Set(monthlyData.map((d) => d.year)));
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // x
  const xScale = d3
    .scaleBand()
    .domain(years)
    .range([padding, width - padding])
    .padding(0.01);

  // y
  const yScale = d3
    .scaleBand()
    .domain(months)
    .range([padding, height - padding])
    .padding(0.01);

  // escala de cores
  const colorScale = d3
    .scaleQuantile()
    .domain([
      d3.min(monthlyData, (d) => baseTemp + d.variance),
      d3.max(monthlyData, (d) => baseTemp + d.variance),
    ])
    .range(colors);

  // eixo x desenhado
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickValues(xScale.domain().filter((year) => year % 10 === 0))
        .tickFormat(d3.format("d"))
    );

  // eixo y desenhado
  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(d3.axisLeft(yScale));

  svg
    .selectAll(".cell")
    .data(monthlyData)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(months[d.month - 1]))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(baseTemp + d.variance))
    .attr("data-month", (d) => d.month - 1) // data-month começa de 0 (Janeiro)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => baseTemp + d.variance)
    .on("mouseover", (event, d) => {
      tooltip.transition().style("visibility", "visible");
      tooltip
        .html(
          `Year: ${d.year}<br>Month: ${months[d.month - 1]}<br>Temperature: ${(
            baseTemp + d.variance
          ).toFixed(2)}&deg;C<br>Variance: ${d.variance.toFixed(2)}&deg;C`
        )
        .attr("data-year", d.year)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().style("visibility", "hidden");
    });

  // legenda
  const legendWidth = 400;
  const legendHeight = 20;
  const legendPadding = 30;

  const legendSvg = d3
    .select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight + legendPadding);

  const legendScale = d3
    .scaleLinear()
    .domain([
      d3.min(monthlyData, (d) => baseTemp + d.variance),
      d3.max(monthlyData, (d) => baseTemp + d.variance),
    ])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale).tickSize(10).ticks(5);

  legendSvg
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);

  const legend = legendSvg
    .selectAll(".legend")
    .data(
      colorScale.range().map((color) => {
        const d = colorScale.invertExtent(color);
        if (!d[0]) d[0] = legendScale.domain()[0];
        if (!d[1]) d[1] = legendScale.domain()[1];
        return d;
      })
    )
    .enter()
    .append("g")
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("x", (d) => legendScale(d[0]))
    .attr("y", 0)
    .attr("width", (d) => legendScale(d[1]) - legendScale(d[0]))
    .attr("height", legendHeight)
    .attr("fill", (d) => colorScale(d[0]));
});
