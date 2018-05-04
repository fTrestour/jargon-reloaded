import * as d3 from 'd3'

import entries from './entries.json'

const svg = d3.select('svg'),
  width = +svg.attr('width'),
  height = +svg.attr('height')

const color = d3.scaleOrdinal(d3.schemeCategory20)

const simulation = d3
  .forceSimulation()
  .force(
    'link',
    d3.forceLink().id(function(node) {
      return node.url
    })
  )
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2))

const createLink = (source, target) => ({
  source,
  target,
  value: 1
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

const graph = { nodes: entries, links }
// console.log(graph)

var link = svg
  .append('g')
  .attr('class', 'links')
  .selectAll('line')
  .data(graph.links)
  .enter()
  .append('line')
  .attr('stroke-width', function(d) {
    return Math.sqrt(d.value)
  })

var node = svg
  .append('g')
  .attr('class', 'nodes')
  .selectAll('circle')
  .data(graph.nodes)
  .enter()
  .append('circle')
  .attr('r', 5)
  .attr('fill', function(d) {
    return color(1)
  })
  .call(
    d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  )

node.append('title').text(function(d) {
  return d.url
})

simulation.nodes(graph.nodes).on('tick', ticked)

simulation.force('link').links(graph.links)

function ticked() {
  link
    .attr('x1', function(d) {
      return d.source.x
    })
    .attr('y1', function(d) {
      return d.source.y
    })
    .attr('x2', function(d) {
      return d.target.x
    })
    .attr('y2', function(d) {
      return d.target.y
    })

  node
    .attr('cx', function(d) {
      return d.x
    })
    .attr('cy', function(d) {
      return d.y
    })
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function dragged(d) {
  d.fx = d3.event.x
  d.fy = d3.event.y
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0)
  d.fx = null
  d.fy = null
}
