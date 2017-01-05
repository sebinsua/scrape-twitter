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
  let minPosition = null
  let html = null
  if ('items_html' in response) {
    minPosition = response['min_position']
    html = response['items_html'].trim()
  } else if ('conversation_html' in response) {
    minPosition = response['min_position']
    html = response['conversation_html'].trim()
  } else if ('descendants' in response && 'items-html' in response['descendants']) {
    minPosition = response['descendants']['min_position']
    html = response['descendants']['items_html'].trim()
  }

  debug('received html of length:', html.length)
  if (minPosition) {
    debug('the min_position within the response is:', minPosition)
  }
  return { html, _minPosition: minPosition }
}

const query = (url, options, fetcher = fetch) => {
  const qs = queryString.stringify(options)
  const resource = url + (qs.length ? `?${qs}` : '')
  debug('query on resource:', resource)
  return fetcher(resource)
    .then(checkStatus)
    .then(toJson)
    .then(toHtml)
}

const get = (resource, fetcher = fetch) => {
  debug('get on resource:', resource)
  return fetcher(resource)
    .then(checkStatus)
    .then(toText)
    .then(html => ({ html }))
}

module.exports = query
module.exports.query = query
module.exports.get = get
