const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ConversationStream = require('./lib/conversation-stream')

const cli = meow(`
  Usage
    $ scrape-conversation <username> --id=<id>

  Options
    --id=<id>   Show conversation connected to a tweet id.
`, {
  string: [ 'id' ] // Twitter ids are very large...
})

// TODO: This is currently broken: 
if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cli.input[0]
  const tweets = new ConversationStream(username, cli.flags)
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, err => {
    if (err != null) {
      console.error(err.message)
      console.error(err.stack)
      return process.exit(1)
    }
  })
}
