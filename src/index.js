const TweetStream = require('./lib/tweet-stream')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')
const getUserProfile = require('./lib/twitter-query').getUserProfile

/*
#### TODO

- [ ] Find out the API which Twitter uses and then impersonate the response.
- [ ] Add search (for tweets and profiles).
      See: http://tomkdickinson.co.uk/2015/08/scraping-tweets-directly-from-twitters-search-update/
      See: https://twitter.com/i/search/timeline?vertical=default&q=whatever&src=typd&include_available_features=1&include_entities=1&max_position=TWEET-807327054211514368-810085813216247808-BD1UO2FFu9QAAAAAAAAETAAAAAcAAAASIgAABAAAAAAAAAAAAAAAAACYAAAAAAAAQAACAIAIAAEAAAAAAAAAAAAAAAAAAAAAAgAIAAAAAAAAQAQAAAAACAAAAAAAAAAAAAAAAiAAAAAAAgBAAAAAAAAAAAAAAEEAAAAAAAAAAgAAAAAACAAAIAgAAAAAIAAAAAgAABAACQAAgAAAACEAAAAAAAAAAAAA&reset_error_state=false
      See: “TWEET-{maxTweetId}-{minTweetId}”.
- [ ] Write integration tests.
 */

module.exports = {
  TweetStream,
  ConversationStream,
  ThreadedConversationStream,
  getUserProfile
}
