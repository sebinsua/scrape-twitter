const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ConversationStream = require('../lib/conversation-stream')
const ThreadedConversationStream = require('../lib/threaded-conversation-stream')
const cliUtils = require('../lib/cli-utils')

const cli = meow(
  `
  Usage
    $ scrape-twitter conversation [--count=<count>] <username> <id>

  Options
    --count, -c   Get first N items
`,
  {
    string: ['_'], // Twitter ids too large for JavaScript numbers. And hexadecimal usernames break minimist.
    alias: { c: 'count' }
  }
)

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  let tweets
  if (cli.input.length >= 2) {
    const username = cliUtils.parseUsername(cli.input[0])
    const id = cli.input[1]
    tweets = new ConversationStream(username, id, { count: cli.flags.count })
  } else {
    const id = cli.input[0]
    tweets = new ThreadedConversationStream(id, { count: cli.flags.count })
  }
  pump(
    tweets,
    JSONStream.stringify('[\n', ',\n', '\n]\n'),
    process.stdout,
    cliUtils.handleError(process.exit.bind(process))
  )
}
