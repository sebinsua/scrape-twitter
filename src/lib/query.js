const fetch = require('isomorphic-fetch')
const queryString = require('query-string')
const debug = require('debug')('scrape-twitter:query')

const checkStatus = (response) => {
  if (response.ok) {
    debug('response was ok')
    return response
  } else {
    debug('response was error:', response)
    const error = new Error(response.statusText)
    error.response = response
    error.statusCode = response.status
    throw error
  }
}

const toJson = response => response.json()
const toText = response => response.text()

const toHtml = response => {
  let html = null
  if ('items_html' in response) {
    html = response['items_html'].trim()
  } else if ('conversation_html' in response) {
    html = response['conversation_html'].trim()
  }
  debug('received html of length:', html.length)
  return html
}

const query = (url, options) => {
  const qs = queryString.stringify(options)
  const resource = url + (qs.length ? `?${qs}` : '')
  debug('query on resource:', resource)
  return fetch(resource)
    .then(checkStatus)
    .then(toJson)
    .then(toHtml)
}

const get = (resource) => {
  debug('get on resource:', resource)
  return fetch(resource)
    .then(checkStatus)
    .then(toText)
}

module.exports = query
module.exports.query = query
module.exports.get = get
