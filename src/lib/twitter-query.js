const cheerio = require('cheerio')
const query = require('./query')
const parser = require('./parser')

const toCheerio = html => cheerio.load(html)

const getUserTimeline = (username, startingId, { replies = false }) => {
  const url = `https://twitter.com/i/profiles/show/${username}/timeline${replies ? '/with_replies' : ''}`
  const options = {
    'include_available_features': '1',
    'include_entities': '1',
    'max_position': startingId
  }
  return query(url, options)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getUserConversation = (username, id) => {
  const url = `https://twitter.com/${username}/status/${id}`
  return query.get(url)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getThreadedConversation = (id) => {
  const url = `https://twitter.com/i/threaded_conversation/${id}`
  return query(url)
    .then(toCheerio)
    .then(parser.toTweets)
}

const getUserProfile = (username) => {
  const url = `https://twitter.com/${username}`
  return query.get(url)
    .then(toCheerio)
    .then(parser.toTwitterProfile)
}

module.exports.getUserProfile = getUserProfile
module.exports.getUserTimeline = getUserTimeline
module.exports.getUserConversation = getUserConversation
module.exports.getThreadedConversation = getThreadedConversation
