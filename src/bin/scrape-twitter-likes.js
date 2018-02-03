const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const LikeStream = require('../lib/like-stream')
const cliUtils = require('../lib/cli-utils')

const SCRAPE_TWITTER_CONFIG = cliUtils.SCRAPE_TWITTER_CONFIG
const env = cliUtils.getEnv()

const cli = meow(
  `
  Usage
    $ TWITTER_USERNAME=jack TWITTER_PASSWORD=p4ssw0rd scrape-twitter likes [--count=<count>] <username>

  Options
    --count,         -c   Get first N items
`,
  {
    string: ['_'],
    alias: { c: 'count' }
  }
)

if (cli.input.length === 0) {
  cli.showHelp()
} else if (!env.TWITTER_USERNAME || !env.TWITTER_PASSWORD) {
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
  const tweets = new LikeStream(username, {
    env,
    count: cli.flags.count
  })
  pump(
    tweets,
    JSONStream.stringify('[\n', ',\n', '\n]\n'),
    process.stdout,
    cliUtils.handleError(process.exit.bind(process))
  )
}
