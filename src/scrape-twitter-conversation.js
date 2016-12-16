const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')

const cli = meow(`
  Usage
    $ scrape-twitter-conversation <username> <id>
`, {
  string: [ '_' ] // It turns out Twitter ids are very large...
})

if (cli.input.length < 2) {
  cli.showHelp()
} else {
  const username = cli.input[0]
  const id = cli.input[1]
  const tweets = username ? new ConversationStream(username, id) : new ThreadedConversationStream(id)
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, err => {
    if (err != null) {
      if (err.statusCode !== 404) {
        console.error(err.message)
        console.error(err.stack)
      }
      return process.exit(1)
    }
  })
}
