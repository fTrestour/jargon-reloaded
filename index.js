import * as d3 from 'd3'

import entries from './entries.json'

// Returns a random entry from the given entries
export const randomEntry = entries =>
  entries[Math.floor(Math.random() * Math.floor(entries.length))]

// Fetches the right entry in the lexicon for an url
export const getRelatedEntry = entries => url =>
  entries.find(entry => entry.url === url)

const createLink = (source, target) => ({
  source,
  target
})

const firstEntry = randomEntry(entries)
const graph = {
  nodes: [firstEntry],
  links: []
}

const updateData = selectedNode => {
  const oldNodes = graph.nodes
  const oldLinks = graph.links

  const newNodes = selectedNode.links
    .map(getRelatedEntry(entries))
    .filter(node => oldNodes.indexOf(node) === -1)
  const newLinks = selectedNode.links
    .filter(
      url =>
        oldLinks.indexOf(createLink(selectedNode.url, url)) === -1 &&
        oldLinks.indexOf(createLink(url, selectedNode.url)) === -1
    )
    .map(url => createLink(selectedNode.url, url))

  newNodes.forEach(node => graph.nodes.push(node))
  newLinks.forEach(link => graph.links.push(link))
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
  node && (link.target.url === node.url || link.source.url === node.url)

const getNodeColor = (node, neighbors) =>
  neighbors && neighbors.indexOf(node.url) !== -1 ? 'blue' : 'black'
const getTextColor = (node, neighbors) =>
  neighbors && neighbors.indexOf(node.url) !== -1 ? 'blue' : 'black'
const getLinkColor = (node, link) =>
  isNeighborLink(node, link) ? 'blue' : 'black'

const selectNode = selectedNode => {
  const neighbors = getNeighbors(selectedNode)

  updateData(selectedNode)
  updateSimulation()

  nodeElements.attr('fill', node => getNodeColor(node, neighbors))
  textElements.attr('fill', node => getTextColor(node, neighbors))
  linkElements.attr('stroke', link => getLinkColor(selectedNode, link))
}

const linkGroup = svg.append('g').attr('class', 'links')
const nodeGroup = svg.append('g').attr('class', 'nodes')
const textGroup = svg.append('g').attr('class', 'texts')
let linkElements, nodeElements, textElements

const updateGraph = () => {
  // links
  linkElements = linkGroup.selectAll('line').data(graph.links, function(link) {
    return link.target.url + link.source.url
  })

  linkElements.exit().remove()

  var linkEnter = linkElements
    .enter()
    .append('line')
    .attr('stroke-width', 1)
    .attr('stroke', link => getLinkColor(null, link))

  linkElements = linkEnter.merge(linkElements)

  // nodes
  nodeElements = nodeGroup
    .selectAll('circle')
    .data(graph.nodes, function(node) {
      return node.id
    })

  nodeElements.exit().remove()

  var nodeEnter = nodeElements
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', node => getTextColor(node))
    .call(dragDrop)
    // we link the selectNode method here
    // to update the graph on every click
    .on('click', selectNode)

  nodeElements = nodeEnter.merge(nodeElements)

  // texts
  textElements = textGroup.selectAll('text').data(graph.nodes, function(node) {
    return node.url
  })

  textElements.exit().remove()

  var textEnter = textElements
    .enter()
    .append('text')
    .text(function(node) {
      return node.name
    })
    .attr('font-size', 15)
    .attr('dx', 15)
    .attr('dy', 4)

  textElements = textEnter.merge(textElements)
}

const updateSimulation = () => {
  updateGraph()

  simulation.nodes(graph.nodes).on('tick', () => {
    nodeElements
      .attr('cx', function(node) {
        return node.x
      })
      .attr('cy', function(node) {
        return node.y
      })
    textElements
      .attr('x', function(node) {
        return node.x
      })
      .attr('y', function(node) {
        return node.y
      })
    linkElements
      .attr('x1', function(link) {
        return link.source.x
      })
      .attr('y1', function(link) {
        return link.source.y
      })
      .attr('x2', function(link) {
        return link.target.x
      })
      .attr('y2', function(link) {
        return link.target.y
      })
  })

  simulation.force('link').links(graph.links)
  simulation.restart()
}

simulation.force('link').links(graph.links)

updateSimulation()
