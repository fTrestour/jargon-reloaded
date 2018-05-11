import * as d3 from 'd3'

import entries from './entries.json'
import Graph from './graph'

const setDescription = ({ name, description, url }) => {
  document.querySelector(
    '.description'
  ).innerHTML = `<h3><a target="_blank" href=${url}>${name}</a></h3><br/>${description}`
}

const graph = new Graph({
  data: entries,
  element: document.querySelector('.chart-container'),
  mainColor: '#2e2f74',
  secondaryColor: '#52e26a',
  linkStrength: -4000,
  onSelect: setDescription
})
