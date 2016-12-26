const TimelineStream = require('./lib/timeline-stream')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')
const TweetStream = require('./lib/tweet-stream')
const ListStream = require('./lib/list-stream')
const getUserProfile = require('./lib/twitter-query').getUserProfile

/*
TODO:
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
