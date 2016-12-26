const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const TimelineStream = require('../lib/timeline-stream')
const cliUtils = require('../lib/cli-utils')

const cli = meow(`
  Usage
    $ scrape-twitter timeline [--count=<count>] <username>

  Options
    --with-retweets, -t   Include retweets
    --with-replies,  -p   Include replies
    --count,         -c   Get first N items
`, {
  alias: { t: 'withRetweets', p: 'withReplies', c: 'count' }
})

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cliUtils.parseUsername(cli.input[0])
  const tweets = new TimelineStream(username, {
    retweets: cli.flags.withRetweets || false,
    replies: cli.flags.withReplies || false,
    count: cli.flags.count
  })
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)))
}
