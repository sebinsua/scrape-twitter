const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const TimelineStream = require('../lib/timeline-stream')
const MediaTimelineStream = require('../lib/media-stream')
const cliUtils = require('../lib/cli-utils')

const SCRAPE_TWITTER_CONFIG = cliUtils.SCRAPE_TWITTER_CONFIG
const env = cliUtils.getEnv()

const cli = meow(
  `
  Usage
    $ TWITTER_USERNAME=jack TWITTER_PASSWORD=p4ssw0rd scrape-twitter timeline [--count=<count>] <username>

  Options
    --with-retweets, -t   Include retweets
    --with-replies,  -p   Include replies
    --media,  -m   Include media
    --count,         -c   Get first N items
`,
  {
    string: ['_'],
    alias: { t: 'withRetweets', p: 'withReplies', c: 'count', m: 'media' }
  }
)

if (cli.input.length === 0) {
  cli.showHelp()
} else if (
  cli.flags.withReplies &&
  (!env.TWITTER_USERNAME || !env.TWITTER_PASSWORD)
) {
  console.log(
    'Please ensure that the environment variables TWITTER_USERNAME and TWITTER_PASSWORD are set.'
  )
  console.log()
  console.log(
    `Environment variables can be set within the dotenv file: ${SCRAPE_TWITTER_CONFIG}`
  )
  process.exit(1)
} else {
  const username = cliUtils.parseUsername(cli.input[0])
  const tweets = cli.flags.media
    ? new MediaTimelineStream(username, {
      count: cli.flags.count,
      env
    })
    : new TimelineStream(username, {
      retweets: cli.flags.withRetweets || false,
      replies: cli.flags.withReplies || false,
      count: cli.flags.count,
      env
    })
  pump(
    tweets,
    JSONStream.stringify('[\n', ',\n', '\n]\n'),
    process.stdout,
    cliUtils.handleError(process.exit.bind(process))
  )
}
