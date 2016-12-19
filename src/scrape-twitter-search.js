const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const TweetStream = require('./lib/tweet-stream')
const cliUtils = require('./lib/cli-utils')

const cli = meow(`
  Usage
    $ scrape-twitter-search --query <query> --type <type>

  Options
    --query, -q   The query to search for
    --type,  -t   The type of search. For example, 'top' or 'latest'
`, {
  default: { type: 'top' },
  alias: { q: 'query', t: 'type' }
})

if ('query' in cli.flags === false) {
  cli.showHelp()
} else {
  const tweets = new TweetStream(cli.flags.query, cli.flags.type)
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)))
}
