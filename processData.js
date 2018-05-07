// Returns a random entry from the given entries
export const randomEntry = entries =>
  entries[Math.floor(Math.random() * Math.floor(entries.length))]

// Fetches the right entry in the lexicon for an url
export const getRelatedEntry = entries => url =>
  entries.find(entry => entry.url === url)
