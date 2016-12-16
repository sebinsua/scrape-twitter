const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')

const cli = meow(`
  Usage
    $ scrape-conversation [<username>] --id=<id>

  Options
    --id=<id>   Show conversation connected to a tweet id.
`, {
  string: [ 'id' ] // It turns out Twitter ids are very large...
})

// TODO: This is currently broken:
// https://twitter.com/i/wikileaks/conversation/809333174098657280?include_available_features=1&include_entities=1&max_position=AUBWF5yqOwsBcNfQUFQ7CwBAlRCYVDsLAIAX0YhVOwsBQJTMVVY7CwLw1qvgVDsL&reset_error_state=false
if (!cli.flags.id) {
  cli.showHelp()
} else {
  const username = cli.input[0]
  const tweets = username ? new ConversationStream(username, cli.flags) : new ThreadedConversationStream(cli.flags)
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, err => {
    if (err != null) {
      console.error(err.message)
      console.error(err.stack)
      return process.exit(1)
    }
  })
}
