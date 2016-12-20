const TimelineStream = require('./lib/timeline-stream')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')
const TweetStream = require('./lib/tweet-stream')
const ListStream = require('./lib/list-stream')
const getUserProfile = require('./lib/twitter-query').getUserProfile

/*
- [ ] Find out the API structure that Twitter uses and then impersonate the response (to an extent.)
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
