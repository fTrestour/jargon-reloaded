const jsdom = require('jsdom')
var fs = require('fs')

const { JSDOM } = jsdom

const urlBase = 'http://catb.org/jargon/html/'
const url = 'http://catb.org/jargon/html/go01.html'
const slashes = url.split('/').length

// Gets all of the entries registered in the lexicon
const getEntries = async url => {
  try {
    // Extracting the links
    const dom = await JSDOM.fromURL(url)
    const document = dom.window.document
    const links = document.querySelectorAll('a')

    // Cleaning data
    const entries = Object.values(links).map(link => ({
      name: link.textContent,
      url: link.href
    }))

    // Removing pages which are not a definition
    // Comparing the page's depth in the website's tree allows to do that
    const filteredEntries = entries.filter(
      entry =>
        entry &&
        entry.url &&
        entry.url.startsWith(urlBase) &&
        entry.url.split('/').length !== slashes
    )

    return filteredEntries
  } catch (error) {
    console.error(error)
  }
}

// Getting the description and related pages for a specified entry from the lexicon
const getEntryDetails = async entry => {
  try {
    const dom = await JSDOM.fromURL(entry.url)
    const document = dom.window.document

    // Getting the description
    const descriptionElement = document.querySelector('p')

    // The links are filtered to make sur they are also a lexicon entry
    const linksWithDuplicates = Object.values(document.querySelectorAll('a'))
      .map(link => link.href)
      .filter(
        url =>
          url && url.startsWith(urlBase) && url.split('/').length !== slashes
      )
      .map(url => url.split('.html')[0] + '.html')
    // Some links appear twice in some articles : de-duplicating
    const links = Array.from(new Set(linksWithDuplicates))

    // Removing unnecessary \n in descriptions
    const description = descriptionElement.textContent.replace(
      /(\n+\s*)+/g,
      ' '
    )

    return { ...entry, description, links }
  } catch (error) {
    console.error(error)
  }
}

getEntries(url).then(async entries => {
  const result = []

  for (entry of entries) {
    entry = await getEntryDetails(entry)
    result.push(entry)

    fs.writeFile('entries.json', JSON.stringify(result, null, 2), function(
      err
    ) {
      if (err) {
        console.log(err)
      }
    })
    console.log(entry)
  }

  return result
})
