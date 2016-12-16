const cheerio = require('cheerio')
const query = require('./query')

const toCheerio = html => cheerio.load(html)

const getUserTimeline = (username, startingId) => {
  const url = `https://twitter.com/i/profiles/show/${username}/timeline`
  const options = {
    'include_available_features': '1',
    'include_entities': '1',
    'max_position': startingId
  }
  return query(url, options)
    .then(toCheerio)
}

/*
const getConversation = () => {
  if ('isReplyTo') {
    // Get the rest of the conversation from:
    // `https://twitter.com/i/etiquiet/conversation/${id}?include_available_features=1&include_entities=1&reset_error_state=false`
  }
}
*/

module.exports.getUserTimeline = getUserTimeline
