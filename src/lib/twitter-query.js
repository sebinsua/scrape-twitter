const cheerio = require('cheerio')
const query = require('./query')
const parser = require('./parser')
const fetchWithCookie = require('./twitter-login').fetch

const toCheerio = ({ html, _minPosition }) => ({
  $: cheerio.load(html),
  _minPosition
})

const getUserTimeline = (username, startingId, { replies = false }) => {
  const url = `https://twitter.com/i/profiles/show/${username}/timeline${
    replies ? '/with_replies' : ''
  }`
  const options = {
    include_available_features: '1',
    include_entities: '1',
    max_position: startingId
  }
  return query(url, options, replies ? fetchWithCookie : undefined)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getUserMediaTimeline = (username, maxPosition) => {
  const url = 'https://twitter.com/i/search/timeline'
  const options = {
    vertical: 'default',
    src: 'typd',
    include_available_features: '1',
    include_entities: '1',
    f: 'tweets',
    q: `from:${username} filter:images`,
    max_position: maxPosition
  }
  return query(url, options)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getUserLikes = (username, startingId) => {
  const url = `https://twitter.com/${username}/likes/timeline`
  const options = {
    include_available_features: '1',
    include_entities: '1',
    max_position: startingId
  }
  return query(url, options, fetchWithCookie)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getUserList = (username, list, startingId) => {
  const url = `https://twitter.com/${username}/lists/${list}/timeline`
  const options = {
    max_position: startingId
  }
  return query(url, options)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getUserConnections = (username, type, maxPosition) => {
  if (typeof maxPosition === 'undefined') {
    const url = `https://twitter.com/${username}/${type}`
    return query
      .get(url, fetchWithCookie)
      .then(toCheerio)
      .then(parser.toConnections)
  } else {
    const url = `https://twitter.com/${username}/${type}/users`
    const options = {
      include_available_features: '1',
      include_entities: '1',
      max_position: maxPosition
    }
    return query(url, options, fetchWithCookie)
      .then(toCheerio)
      .then(parser.toConnections)
  }
}

const getUserConversation = (username, id, maxPosition) => {
  if (typeof maxPosition === 'undefined') {
    const url = `https://twitter.com/${username}/status/${id}`
    return query
      .get(url)
      .then(toCheerio)
      .then(parser.toThreadedTweets(id))
  } else {
    const url = `https://twitter.com/i/${username}/conversation/${id}`
    const options = {
      include_available_features: '1',
      include_entities: '1',
      max_position: maxPosition
    }
    return query(url, options)
      .then(toCheerio)
      .then(parser.toThreadedTweets(id))
  }
}

const getThreadedConversation = id => {
  const url = `https://twitter.com/i/threaded_conversation/${id}`
  return query(url)
    .then(toCheerio)
    .then(parser.toThreadedTweets(id))
}

const getUserProfile = username => {
  const url = `https://twitter.com/${username}`
  return query
    .get(url)
    .then(toCheerio)
    .then(parser.toTwitterProfile)
}

const queryTweets = (q, type, maxPosition) => {
  const url = 'https://twitter.com/i/search/timeline'
  const options = {
    vertical: 'default',
    src: 'typd',
    include_available_features: '1',
    include_entities: '1',
    f: type,
    q: q,
    max_position: maxPosition
  }
  return query(url, options)
    .then(toCheerio)
    .then(parser.toTweets)
}

module.exports = {
  getUserProfile,
  getUserTimeline,
  getUserMediaTimeline,
  getUserLikes,
  getUserConnections,
  getUserList,
  getUserConversation,
  getThreadedConversation,
  queryTweets
}
