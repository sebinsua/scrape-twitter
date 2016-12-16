const fetch = require('isomorphic-fetch')
const queryString = require('query-string')

const checkStatus = (response) => {
  if (response.ok) {
    return response
  } else {
    const error = new Error(response.statusText)
    error.response = response
    error.statusCode = response.status
    throw error
  }
}

const toJson = response => response.json()
const toText = response => response.text()

const toHtml = response => {
  if ('items_html' in response) {
    return response['items_html'].trim()
  } else if ('conversation_html' in response) {
    return response['conversation_html'].trim()
  }
  return null
}

const query = (url, options) => {
  const qs = queryString.stringify(options)
  return fetch(url + (qs.length ? `?${qs}` : ''))
    .then(checkStatus)
    .then(toJson)
    .then(toHtml)
}

const get = (url) => {
  return fetch(url)
    .then(checkStatus)
    .then(toText)
}

module.exports = query
module.exports.query = query
module.exports.get = get
