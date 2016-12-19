const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ConversationStream = require('./lib/conversation-stream')
const ThreadedConversationStream = require('./lib/threaded-conversation-stream')
const cliUtils = require('./lib/cli-utils')

const cli = meow(`
  Usage
    $ scrape-twitter-conversation <username> <id>
`, {
  string: [ '_' ] // It turns out Twitter ids are very large...
})

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  let tweets
  if (cli.input.length >= 2) {
    const username = cliUtils.parseUsername(cli.input[0])
    const id = cli.input[1]
    tweets = new ConversationStream(username, id)
  } else {
    const id = cli.input[0]
    tweets = new ThreadedConversationStream(id)
  }
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)))
}
