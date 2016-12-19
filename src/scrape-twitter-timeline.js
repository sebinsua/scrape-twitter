const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const TimelineStream = require('./lib/timeline-stream')
const cliUtils = require('./lib/cli-utils')

const cli = meow(`
  Usage
    $ scrape-twitter-timeline <username>

  Options
    --with-retweets, -t   Include retweets
    --with-replies,  -p   Include replies
`, {
  alias: { t: 'withRetweets', p: 'withReplies' }
})

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cliUtils.parseUsername(cli.input[0])
  const tweets = new TimelineStream(username, {
    retweets: cli.flags.withRetweets || false,
    replies: cli.flags.withReplies || false
  })
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)))
}
