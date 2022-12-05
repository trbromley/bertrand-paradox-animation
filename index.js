// Fixed settings

const MAXITERATIONS = 2000

const CIRCLESETTINGS = {
  width: 450,
  height: 450,
  padding: 40,
  strokeWidth: 4,
  alts: ['Random endpoints method', 'Random radial point method', 'Random midpoint method']
}

/// / Use colour schemes from https://observablehq.com/@d3/color-schemes
const GREENS = ['#f7fcf5', '#e8f6e3', '#d3eecd', '#b7e2b1', '#97d494', '#73c378', '#4daf62', '#2f984f', '#157f3b', '#036429', '#00441b']
const PURPLES = ['#fcfbfd', '#f1eff6', '#e2e1ef', '#cecee5', '#b6b5d8', '#9e9bc9', '#8782bc', '#7363ac', '#61409b', '#501f8c', '#3f007d']
const REDS = ['#fff5f0', '#fee3d6', '#fdc9b4', '#fcaa8e', '#fc8a6b', '#f9694c', '#ef4533', '#d92723', '#bb151a', '#970b13', '#67000d']
const COLOURS = [GREENS, PURPLES, REDS]
const INDICES = {
  fill: 2,
  stroke: 10
}
CIRCLESETTINGS.colours = COLOURS.map(c => Object.fromEntries([
  ['fill', c[INDICES.fill]],
  ['stroke', c[INDICES.stroke]]
]))

const LINESSETTINGS = {
  width: 1,
  nodeRadius: 6
}

const PLOTSETTINGS = {
  width: 2 * CIRCLESETTINGS.width,
  height: CIRCLESETTINGS.height,
  margin: {
    left: 50,
    right: 0,
    top: 40,
    bottom: 60
  },
  xPadding: 0.4,
  labels: ['Random endpoints', 'Random radial points', 'Random midpoints'],
  fontSize: {
    title: 16,
    ticks: 14
  }
}

const PANELSETTINGS = {
  width: CIRCLESETTINGS.width,
  height: CIRCLESETTINGS.height,
  margin: {
    left: 10,
    right: 70,
    top: 20,
    bottom: 60
  },
  fontSize: {
    title: 16,
    text: 14
  },
  rx: 20,
  colour: '#e2e2e2'
}

const SPEEDS = {
  slow: 3000,
  medium: 1000,
  fast: 250,
  fastest: 50
}

// Derived settings

CIRCLESETTINGS.radius = (CIRCLESETTINGS.width - CIRCLESETTINGS.padding) / 2

CIRCLESETTINGS.cx = [
  CIRCLESETTINGS.width / 2,
  3 * CIRCLESETTINGS.width / 2,
  5 * CIRCLESETTINGS.width / 2
]

CIRCLESETTINGS.cy = CIRCLESETTINGS.height / 2

PLOTSETTINGS.innerWidth = PLOTSETTINGS.width - PLOTSETTINGS.margin.left - PLOTSETTINGS.margin.right
PLOTSETTINGS.innerHeight = PLOTSETTINGS.height - PLOTSETTINGS.margin.top - PLOTSETTINGS.margin.bottom

const WIDTH = CIRCLESETTINGS.width * 3
const HEIGHT = CIRCLESETTINGS.height + PLOTSETTINGS.height

// Main function

document.addEventListener('DOMContentLoaded', () => {
  const container = d3.select('#visualization')
    .style('position', 'relative')
    .style('width', `${WIDTH}px`)
    .style('height', `${HEIGHT}px`)
    .style('overflow-x', 'auto')

  const svg = container.append('svg')
    .attr('width', `${WIDTH}px`)
    .attr('height', `${HEIGHT}px`)
    .attr('alt', `A visualization of Bertrand's paradox, showing three different methods to randomly generate chords in a unit circle. Each method results in
    a different probability of a given randomly-generate chord having a length that exceeds the square root of three. The methods are,
    from left to right: random endpoints, random radial points, and random midpoints. The top row of the diagram shows a circle for each method,
    with randomly-generated chords being added in real time. The bottom row of the diagram provides a control panel for setting the speed of
    generation as well as a bar chart for recording the evolving probabilities.`)

  for (let i = 0; i < 3; i++) {
    addCircle(svg, CIRCLESETTINGS.cx[i], CIRCLESETTINGS.cy, CIRCLESETTINGS.radius, CIRCLESETTINGS.strokeWidth, CIRCLESETTINGS.colours[i], CIRCLESETTINGS.alts[i])
  }

  const lines = CIRCLESETTINGS.cx.map(x => {
    return svg.append('g')
      .attr('transform', `translate(${x},${CIRCLESETTINGS.cy})`)
      .attr('class', 'lines')
  })

  const [chart, xScale, yScale] = addAxes(
    svg,
    (WIDTH - PLOTSETTINGS.width),
    CIRCLESETTINGS.height,
    PLOTSETTINGS.innerHeight,
    PLOTSETTINGS.innerWidth,
    PLOTSETTINGS.margin,
    PLOTSETTINGS.xPadding,
    PLOTSETTINGS.labels,
    PLOTSETTINGS.fontSize
  )

  const radios = document.querySelectorAll('input')
  const ns = PLOTSETTINGS.labels.map(label => [label, 0])
  let iterations = 1
  let playStatus = 'medium'
  let iterationTime = 1000

  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      playStatus = radios[i].id
      iterationTime = SPEEDS[radios[i].id]
    }
  }

  let animationTime = 2 * iterationTime / 3

  function step () {
    if (iterations <= MAXITERATIONS) {
      if (addRandomEndpoints(
        lines[0], CIRCLESETTINGS.radius, CIRCLESETTINGS.colours[0], LINESSETTINGS.width, LINESSETTINGS.nodeRadius, animationTime
      )) {
        ns[0][1] += 1
      };
      if (addRandomRadialPoint(
        lines[1], CIRCLESETTINGS.radius, CIRCLESETTINGS.colours[1], LINESSETTINGS.width, LINESSETTINGS.nodeRadius, animationTime
      ))(ns[1][1] += 1)
      if (addRandomMidPoint(
        lines[2], CIRCLESETTINGS.radius, CIRCLESETTINGS.colours[2], LINESSETTINGS.width, LINESSETTINGS.nodeRadius, animationTime
      ))(ns[2][1] += 1)
      addBars(chart, ns, iterations, PLOTSETTINGS.margin, PLOTSETTINGS.innerHeight, xScale, yScale, CIRCLESETTINGS.colours, PLOTSETTINGS.fontSize, CIRCLESETTINGS.alts)
      iterations += 1
    } else {
      interval.stop()
    }
  }

  let interval = d3.interval(step, iterationTime)
  d3.timerFlush()

  container.select('.panel')
    .style('position', 'absolute')
    .style('top', `${PANELSETTINGS.margin.top + CIRCLESETTINGS.height}px`)
    .style('left', `${PANELSETTINGS.margin.left}px`)
    .style('width', `${PANELSETTINGS.width - PANELSETTINGS.margin.left - PANELSETTINGS.margin.right}px`)
    .style('height', `${PANELSETTINGS.height - PANELSETTINGS.margin.top - PANELSETTINGS.margin.bottom}px`)
    .style('background-color', PANELSETTINGS.colour)
    .style('border-radius', `${PANELSETTINGS.rx}px`)

  for (let i = 0; i < radios.length; i++) {
    radios[i].onchange = function () {
      interval.stop()
      playStatus = this.id
      if (this.id !== 'pause') {
        iterationTime = SPEEDS[this.id]
        animationTime = 2 * iterationTime / 3

        step()
        interval = d3.interval(step, iterationTime)
      }
    }
  }

  document.getElementById('reset').onclick = () => {
    ns[0][1] = 0
    ns[1][1] = 0
    ns[2][1] = 0
    d3.selectAll('.lines').selectAll('*').remove()
    d3.selectAll('.bars').remove()

    if (playStatus !== 'pause' && iterations > MAXITERATIONS) {
      interval = d3.interval(step, iterationTime)
    }
    iterations = 1
  }
})

// Utility functions

function addCircle (svg, x, y, radius, strokeWidth, colours, alt) {
  svg.append('g')
    .attr('transform', `translate(${x},${y})`)
    .append('circle')
    .attr('r', radius)
    .attr('stroke', colours.stroke)
    .attr('stroke-width', strokeWidth)
    .attr('fill', colours.fill)
    .attr('alt', alt + ' circle')
}

function addRandomEndpoints (group, circleRadius, colours, lineWidth, nodeRadius, animationTime) {
  const theta1 = 2 * Math.PI * Math.random()
  const theta2 = 2 * Math.PI * Math.random()

  const x0 = circleRadius * Math.cos(theta1)
  const y0 = circleRadius * Math.sin(theta1)
  const x1 = circleRadius * Math.cos(theta2)
  const y1 = circleRadius * Math.sin(theta2)
  const length = Math.hypot(x1 - x0, y1 - y0)

  group.append('line')
    .attr('x1', x0)
    .attr('y1', y0)
    .attr('x2', x1)
    .attr('y2', y1)
    .attr('stroke', colours.stroke)
    .attr('stroke-width', 0)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke-width', 2 * lineWidth)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke-width', lineWidth)

  showPoints(group, x0, y0, nodeRadius, colours, animationTime)
  showPoints(group, x1, y1, nodeRadius, colours, animationTime)

  return length > Math.sqrt(3) * circleRadius
}

function addRandomRadialPoint (group, circleRadius, colours, lineWidth, nodeRadius, animationTime) {
  const theta = 2 * Math.PI * Math.random()
  const radius = circleRadius * Math.random()

  const x = radius * Math.cos(theta)
  const y = radius * Math.sin(theta)
  const xCircle = circleRadius * Math.cos(theta)
  const yCircle = circleRadius * Math.sin(theta)

  group.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', xCircle)
    .attr('y2', yCircle)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 2 * lineWidth)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke', colours.stroke)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke', 'transparent')

  showPoints(group, x, y, nodeRadius, colours, animationTime)
  const [x0, y0, x1, y1] = findCircleIntercepts(x, y, circleRadius)
  const length = Math.hypot(x1 - x0, y1 - y0)

  group.append('line')
    .attr('x1', x0)
    .attr('y1', y0)
    .attr('x2', x1)
    .attr('y2', y1)
    .attr('stroke', colours.stroke)
    .attr('stroke-width', 0)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke-width', 2 * lineWidth)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke-width', lineWidth)

  return length > Math.sqrt(3) * circleRadius
}

function randomPointInUnitCircle () {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  if (Math.hypot(x, y) <= 1) {
    return [x, y]
  }
  return randomPointInUnitCircle()
}

function addRandomMidPoint (group, circleRadius, colours, lineWidth, nodeRadius, animationTime) {
  let [x, y] = randomPointInUnitCircle()
  x *= circleRadius
  y *= circleRadius

  showPoints(group, x, y, nodeRadius, colours, animationTime)
  const [x0, y0, x1, y1] = findCircleIntercepts(x, y, circleRadius)
  const length = Math.hypot(x1 - x0, y1 - y0)

  group.append('line')
    .attr('x1', x0)
    .attr('y1', y0)
    .attr('x2', x1)
    .attr('y2', y1)
    .attr('stroke', colours.stroke)
    .attr('stroke-width', 0)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke-width', 2 * lineWidth)
    .transition()
    .duration(animationTime / 2)
    .attr('stroke-width', lineWidth)

  return length > Math.sqrt(3) * circleRadius
}

function showPoints (group, x, y, radius, colours, animationTime) {
  group.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', radius)
    .attr('fill', 'transparent')
    .transition()
    .duration(animationTime / 2)
    .attr('fill', colours.stroke)
    .transition()
    .duration(animationTime / 2)
    .attr('fill', 'transparent')
    .remove()
}

function addAxes (svg, x, y, height, width, margin, barPadding, labels, fontSize) {
  const xScale = d3.scaleBand()
    .domain(labels)
    .range([0, width])
    .padding(barPadding)

  const yScale = d3.scaleLinear()
    .domain([1, 0])
    .range([0, height])

  const xAxis = d3.axisBottom().scale(xScale)
  const yAxis = d3.axisLeft().scale(yScale)

  const chart = svg.append('g')
    .attr('transform', `translate(${x}, ${y})`)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const xAxisContainer = chart.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top + height})`)
    .call(xAxis)

  xAxisContainer.selectAll('.tick').attr('font-size', `${fontSize.ticks}`)

  const yAxisContainer = chart.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis)

  yAxisContainer.selectAll('.tick').attr('font-size', `${fontSize.ticks}`)

  chart.append('g')
    .attr('transform', `translate(0, ${margin.top + height / 2})`)
    .append('text')
    .text('Probability')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('transform', 'rotate(-90)')
    .attr('font-size', `${fontSize.title}pt`)

  chart.append('g')
    .attr('transform', `translate(${margin.left + width / 2}, ${margin.top + height + margin.bottom - fontSize.title})`)
    .append('text')
    .text('Method')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', `${fontSize.title}pt`)

  return [chart, xScale, yScale]
}

function addBars (chart, ns, iterations, margin, height, xScale, yScale, colours, fontSize, alts) {
  chart.selectAll('.bars').remove()
  chart.selectAll('rect')
    .data(ns)
    .enter()
    .append('rect')
    .attr('class', 'bars')
    .attr('x', d => margin.left + xScale(d[0]))
    .attr('y', d => margin.top + yScale(d[1] / iterations))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(d[1] / iterations))
    .attr('fill', (_, i) => colours[i].fill)
    .attr('alt', (_, i) => alts[i] + ' bar')

  chart.append('g')
    .attr('class', 'bars')
    .selectAll('text')
    .data(ns)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('x', d => margin.left + xScale(d[0]) + xScale.bandwidth() / 2)
    .attr('y', d => margin.top + yScale(d[1] / iterations) - fontSize.title / 2)
    .attr('font-size', `${fontSize.title}pt`)
    .text(d => (d[1] / iterations).toPrecision(2))

  const stepsTitle = iterations === 1 ? `${iterations} step` : `${iterations} steps`

  chart.append('text')
    .text(stepsTitle)
    .attr('class', 'bars')
    .attr('x', margin.left + xScale('Random radial points') + xScale.bandwidth() / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${fontSize.title}pt`)
    .attr('font-weight', 'bold')
}

function findCircleIntercepts (x, y, circleRadius) {
  // Equation of line y = slope * x + intercept
  const slope = -x / y
  const intercept = y - slope * x

  // Solution to x ** 2 + y ** 2 = R ** 2 when y = slope * x + intercept is given by
  // the following quadratic equation:
  // x ** 2 (1 + slope ** 2) + 2 * slope * intercept * x + intercept ** 2 - R ** 2 = 0
  // We now solve a x ** 2 + b * x + c = 0
  const a = (1 + slope ** 2)
  const b = 2 * slope * intercept
  const c = intercept ** 2 - circleRadius ** 2

  const discriminant = b ** 2 - 4 * a * c
  const x0 = (-b + Math.sqrt(discriminant)) / (2 * a)
  const x1 = (-b - Math.sqrt(discriminant)) / (2 * a)

  // Now solve for y
  const y0 = slope * x0 + intercept
  const y1 = slope * x1 + intercept

  return [x0, y0, x1, y1]
}
