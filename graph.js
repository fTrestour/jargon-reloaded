import * as d3 from 'd3'

class Graph {
  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data
    this.element = opts.element
    this.linkStrength = opts.linkStrength
    this.onSelect = opts.onSelect

    // create the chart
    this.generate()
  }

  setData(newData) {
    this.data = newData

    // full redraw needed
    this.draw()
  }

  generate() {
    // define width, height and margin
    this.width = this.element.offsetWidth
    this.height = window.innerHeight

    // set up parent element and SVG
    this.element.innerHTML = ''
    const svg = d3.select(this.element).append('svg')

    // set up groups
    this.linkGroup = svg.append('g').attr('class', 'links')
    this.nodeGroup = svg.append('g').attr('class', 'nodes')

    // Set up zoom and pan
    this.addZoom(svg)

    this.linkElements = null
    this.nodeElements = null

    // create the other stuff
    this.addInitialGraph()
    this.addLinkForce()
    this.createSimulation()
    this.addDragDrop()

    // launch drawing
    this.update()
  }

  addZoom(element) {
    element.call(
      d3.zoom().on('zoom', () => {
        this.linkGroup.attr('transform', d3.event.transform)
        this.nodeGroup.attr('transform', d3.event.transform)
      })
    )
  }
  addInitialGraph() {
    const firstNode = this.data[
      Math.floor(Math.random() * Math.floor(this.data.length))
    ]

    this.graph = {
      nodes: [firstNode],
      links: []
    }
  }
  addLinkForce() {
    this.linkForce = d3.forceLink().id(link => link.url)
  }
  createSimulation() {
    this.simulation = d3
      .forceSimulation()
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody().strength(this.linkStrength))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
  }
  addDragDrop() {
    this.dragDrop = d3
      .drag()
      .on('start', node => {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0.3).restart()
        }
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag', node => {
        node.fx = d3.event.x
        node.fy = d3.event.y
      })
      .on('end', node => {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0)
        }
        node.fx = null
        node.fy = null
      })
  }

  selectNode(selectedNode) {
    const neighbors = this.getNeighbors(selectedNode)
    this.update(selectedNode)

    this.nodeElements
      .select('rect')
      .attr(
        'class',
        node =>
          this.isNeighborNode(node, neighbors) ? 'node selected' : 'node'
      )
    this.nodeElements
      .select('foreignObject')
      .select('div')
      .attr(
        'class',
        node =>
          this.isNeighborNode(node, neighbors) ? 'text selected' : 'text'
      )

    this.onSelect(selectedNode)
  }

  getNeighbors(node) {
    return node ? [node.url, ...node.links] : []
  }
  isNeighborNode(node, neighbors) {
    return neighbors && neighbors.indexOf(node.url) !== -1
  }
  isNeighborLink(node, link) {
    return (
      node && (link.target.url === node.url || link.source.url === node.url)
    )
  }

  update(selectedNode) {
    this.updateData(selectedNode)
    this.updateNodes()
    this.updateLinks()
    this.updateSimulation(selectedNode)
  }

  updateData(selectedNode) {
    selectedNode = selectedNode || this.graph.nodes[0]

    const oldNodes = this.graph.nodes
    const oldLinks = this.graph.links

    const newNodes = selectedNode.links
      .map(url => this.data.find(entry => entry.url === url))
      .filter(node => oldNodes.indexOf(node) === -1)
    const newLinks = selectedNode.links
      .filter(
        url =>
          oldLinks.indexOf(this.createLink(selectedNode.url, url)) === -1 &&
          oldLinks.indexOf(this.createLink(url, selectedNode.url)) === -1
      )
      .map(url => this.createLink(selectedNode.url, url))

    newNodes.forEach(node => this.graph.nodes.push(node))
    newLinks.forEach(link => this.graph.links.push(link))
  }
  updateNodes() {
    this.nodeElements = this.nodeGroup
      .selectAll('g')
      .data(this.graph.nodes, node => node.url)

    this.nodeElements.exit().remove()

    const nodeGroupEnter = this.nodeElements
      .enter()
      .append('g')
      .attr('id', node => node.url)

    nodeGroupEnter
      .append('rect')
      .attr('class', 'node')
      .call(this.dragDrop)
      .on('click', this.selectNode.bind(this))

    nodeGroupEnter
      .append('foreignObject')
      .append('xhtml:div')
      .text(node => node.name)
      .attr('class', 'text')
      .call(this.dragDrop)
      .on('click', this.selectNode.bind(this))

    this.nodeElements = nodeGroupEnter.merge(this.nodeElements)
  }
  updateLinks() {
    this.linkElements = this.linkGroup
      .selectAll('line')
      .data(this.graph.links, link => link.target.url + link.source.url)

    this.linkElements.exit().remove()

    this.linkElements = this.linkElements
      .enter()
      .append('line')
      .attr('class', 'link')
      .merge(this.linkElements)
  }
  updateSimulation(selectedNode) {
    this.simulation.nodes(this.graph.nodes).on('tick', () => {
      this.nodeElements
        .select('rect')
        .attr('x', node => node.x - 50)
        .attr('y', node => node.y - 25)
      this.nodeElements
        .select('foreignObject')
        .attr('x', node => node.x - 50)
        .attr('y', node => node.y - 25)
      this.linkElements
        .attr('x1', link => link.source.x)
        .attr('y1', link => link.source.y)
        .attr('x2', link => link.target.x)
        .attr('y2', link => link.target.y)
    })

    this.simulation.force('link').links(this.graph.links)
    this.simulation.restart()
  }

  createLink(source, target) {
    return {
      source,
      target
    }
  }
}

export default Graph
