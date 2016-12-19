const TimelineStream = require('./lib/timeline-stream')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')
const TweetStream = require('./lib/tweet-stream')
const ListStream = require('./lib/list-stream')
const getUserProfile = require('./lib/twitter-query').getUserProfile

/*
- [ ] `--count` flag should exist.
- [ ] Find out the API which Twitter uses and then impersonate the response.
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
