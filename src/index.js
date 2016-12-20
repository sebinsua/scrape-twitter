const TimelineStream = require('./lib/timeline-stream')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')
const TweetStream = require('./lib/tweet-stream')
const ListStream = require('./lib/list-stream')
const getUserProfile = require('./lib/twitter-query').getUserProfile

/*
TODO:
- [ ] Find out the API structure that Twitter uses and then impersonate the response (to an extent.)
      See: https://dev.twitter.com/overview/api/users
      See: https://dev.twitter.com/overview/api/tweets
      See: https://dev.twitter.com/overview/api/entities
      See: https://dev.twitter.com/rest/reference/get/statuses/user_timeline
      See: https://dev.twitter.com/rest/reference/get/lists/statuses
      See: https://dev.twitter.com/rest/reference/get/search/tweets
      See: https://dev.twitter.com/rest/public/search
- [ ] Write integration tests.
 */

module.exports = {
  TimelineStream,
  ConversationStream,
  ThreadedConversationStream,
  TweetStream,
  ListStream,
  getUserProfile
}
