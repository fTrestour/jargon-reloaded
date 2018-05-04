const jsdom = require('jsdom')
const { JSDOM } = jsdom

const urlBase = 'http://catb.org/jargon/html/'
const url = 'http://catb.org/jargon/html/go01.html'
const slashes = url.split('/').length

const getEntries = async url => {
  try {
    const dom = await JSDOM.fromURL(url)
    const document = dom.window.document
    const links = document.querySelectorAll('a')

    const entries = Object.values(links).map(link => ({
      name: link.textContent,
      url: link.href
    }))

    const filteredEntries = entries.filter(
      entry => entry.url && entry.url.split('/').length !== slashes
    )

    return filteredEntries
  } catch (error) {
    console.error(error)
  }
}

const randomEntry = entries =>
  entries[Math.floor(Math.random() * Math.floor(entries.length))]

const getEntryDetails = async entry => {
  try {
    const dom = await JSDOM.fromURL(entry.url)
    const document = dom.window.document

    const descriptionElement = document.querySelector('p')

    const linksWithDuplicates = Object.values(document.querySelectorAll('a'))
      .map(link => link.href)
      .filter(url => url && url.split('/').length !== slashes)
    const links = Array.from(new Set(linksWithDuplicates))

    const description = descriptionElement.textContent.replace(
      /(\n+\s*)+/g,
      ' '
    )

    return { ...entry, description, links }
  } catch (error) {
    console.error(error)
  }
}

getEntries(url)
  .then(randomEntry)
  .then(getEntryDetails)
  .then(console.log)