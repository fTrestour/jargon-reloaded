import * as d3 from 'd3'

class Graph {
  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data
    this.element = opts.element
    this.nodeIds = opts.nodeIds
    this.mainColor = opts.mainColor
    this.secondaryColor = opts.secondaryColor

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
    svg.attr('width', this.width)
    svg.attr('height', this.height)

    // set up groups
    this.linkGroup = svg.append('g').attr('class', 'links')
    this.nodeGroup = svg.append('g').attr('class', 'nodes')
    this.textGroup = svg.append('g').attr('class', 'texts')

    this.linkElements = null
    this.nodeElements = null
    this.textElements = null

    // create the other stuff
    this.addInitialGraph()
    this.addLinkForce()
    this.createSimulation()
    this.addDragDrop()

    // launch drawing
    this.update()
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
    this.linkForce = d3
      .forceLink()
      .id(link => link.url)
      .strength(link => 1)
  }
  createSimulation() {
    this.simulation = d3
      .forceSimulation()
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
  }
  addDragDrop() {
    this.dragDrop = d3
      .drag()
      .on('start', node => {
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag', node => {
        this.simulation.alphaTarget(0.7).restart()
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

    this.nodeElements.attr('fill', node => this.getNodeColor(node, neighbors))
    this.textElements.attr('fill', node => this.getTextColor(node, neighbors))
    this.linkElements.attr('stroke', link =>
      this.getLinkColor(selectedNode, link)
    )
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
  getNodeColor(node, neighbors) {
    return this.isNeighborNode(node, neighbors)
      ? this.mainColor
      : this.secondaryColor
  }
  getTextColor(node, neighbors) {
    return this.isNeighborNode(node, neighbors)
      ? this.mainColor
      : this.secondaryColor
  }
  getLinkColor(node, link) {
    return this.isNeighborLink(node, link)
      ? this.mainColor
      : this.secondaryColor
  }

  update(selectedNode) {
    this.updateData(selectedNode)
    this.updateLinks()
    this.updateNodes()
    this.updateTexts()
    this.updateSimulation()
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
  updateLinks() {
    this.linkElements = this.linkGroup
      .selectAll('line')
      .data(this.graph.links, link => link.target.url + link.source.url)

    this.linkElements.exit().remove()

    const linkEnter = this.linkElements
      .enter()
      .append('line')
      .attr('stroke-width', 1)
      .attr('stroke', link => this.getLinkColor(null, link))

    this.linkElements = linkEnter.merge(this.linkElements)
  }
  updateNodes() {
    this.nodeElements = this.nodeGroup
      .selectAll('circle')
      .data(this.graph.nodes, node => node.url)

    this.nodeElements.exit().remove()

    const nodeEnter = this.nodeElements
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', node => this.getTextColor(node))
      .call(this.dragDrop)
      // we link the selectNode method here
      // to update the graph on every click
      .on('click', this.selectNode.bind(this))

    this.nodeElements = nodeEnter.merge(this.nodeElements)
  }
  updateTexts() {
    this.textElements = this.textGroup
      .selectAll('text')
      .data(this.graph.nodes, node => node.url)

    this.textElements.exit().remove()

    const textEnter = this.textElements
      .enter()
      .append('text')
      .text(node => node.name)
      .attr('font-size', 15)
      .attr('dx', 15)
      .attr('dy', 4)

    this.textElements = textEnter.merge(this.textElements)
  }
  updateSimulation() {
    this.simulation.nodes(this.graph.nodes).on('tick', () => {
      this.nodeElements.attr('cx', node => node.x).attr('cy', node => node.y)
      this.textElements.attr('x', node => node.x).attr('y', node => node.y)
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
