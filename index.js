import * as d3 from 'd3'

import entries from './entries.json'
import Graph from './graph'

const graph = new Graph({
  data: entries,
  element: document.querySelector('.chart-container'),
  mainColor: '#2e2f74',
  secondaryColor: '#52e26a',
  linkStrength: -4000
})
