import * as d3 from 'd3'

import entries from './entries.json'
// import { randomEntry } from './processData.js'

const createLink = (source, target) => ({
  source,
  target
})

const links = []
for (let entry of entries) {
  if (entry && entry.links) {
    for (let url of entry.links) {
      if (
        !links.find(
          element =>
            element == createLink(entry.url, url) ||
            element == createLink(url, entry.url)
        )
      ) {
        links.push(createLink(entry.url, url))
      }
    }
  }
}

const graph = {
  nodes: entries,
  links
}

// Set the svg
const width = window.innerWidth
const height = window.innerHeight
const svg = d3
  .select('svg')
  .attr('width', width)
  .attr('height', height)

// Set the simulation details
var linkForce = d3
  .forceLink()
  .id(link => link.url)
  .strength(link => 1)

var simulation = d3
  .forceSimulation()
  .force('link', linkForce)
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(width / 2, height / 2))

const dragDrop = d3
  .drag()
  .on('start', node => {
    node.fx = node.x
    node.fy = node.y
  })
  .on('drag', node => {
    simulation.alphaTarget(0.7).restart()
    node.fx = d3.event.x
    node.fy = d3.event.y
  })
  .on('end', node => {
    if (!d3.event.active) {
      simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
  })

const getNeighbors = node => (node ? [node.url, ...node.links] : [])
const isNeighborLink = (node, link) =>
  link.target.url === node.url || link.source.url === node.url

const getNodeColor = (node, neighbors) =>
  neighbors && neighbors.indexOf(node.url) !== -1 ? 'blue' : 'gray'
const getTextColor = (node, neighbors) =>
  neighbors && neighbors.indexOf(node.url) !== -1 ? 'blue' : 'black'
const getLinkColor = (node, link) =>
  isNeighborLink(node, link) ? 'blue' : 'rgba(#000,.4)'

const selectNode = selectedNode => {
  console.log(selectedNode)
  const neighbors = getNeighbors(selectedNode)
  console.log(neighbors)

  nodeElements.attr('fill', node => getNodeColor(node, neighbors))
  textElements.attr('fill', node => getTextColor(node, neighbors))
  linkElements.attr('stroke', link => getLinkColor(selectedNode, link))
}

// Display nodes
const nodeElements = svg
  .append('g')
  .selectAll('circle')
  .data(graph.nodes)
  .enter()
  .append('circle')
  .attr('r', 10)
  .attr('fill', getNodeColor('normal'))
  .call(dragDrop)
  .on('click', selectNode)

const textElements = svg
  .append('g')
  .selectAll('text')
  .data(graph.nodes)
  .enter()
  .append('text')
  .text(node => node.name)
  .attr('font-size', 15)
  .attr('dx', 15)
  .attr('dy', 4)

// Add links
const linkElements = svg
  .append('g')
  .selectAll('line')
  .data(graph.links)
  .enter()
  .append('line')
  .attr('stroke-width', 1)
  .attr('stroke', 'rgba(#000,.4)')

// Tick simulation
simulation.nodes(graph.nodes).on('tick', () => {
  nodeElements.attr('cx', node => node.x).attr('cy', node => node.y)
  textElements.attr('x', node => node.x).attr('y', node => node.y)
  linkElements
    .attr('x1', link => link.source.x)
    .attr('y1', link => link.source.y)
    .attr('x2', link => link.target.x)
    .attr('y2', link => link.target.y)
})

simulation.force('link').links(graph.links)
