const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ConnectionStream = require('../lib/connection-stream')
const cliUtils = require('../lib/cli-utils')

const SCRAPE_TWITTER_CONFIG = cliUtils.SCRAPE_TWITTER_CONFIG
const env = cliUtils.getEnv()

const cli = meow(
  `
  Usage
    $ TWITTER_USERNAME=jack TWITTER_PASSWORD=p4ssw0rd scrape-twitter connections <username> --type=<type>

  Options
    --type,  -t   The type of connections: 'following' or 'followers'
`,
  {
    string: ['_'],
    default: { type: 'following' },
    alias: { t: 'type' }
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
  const type = cli.flags.type === 'following' ? 'following' : 'followers'
  const profiles = new ConnectionStream(username, type, env)
  pump(
    profiles,
    JSONStream.stringify('[\n', ',\n', '\n]\n'),
    process.stdout,
    cliUtils.handleError(process.exit.bind(process))
  )
}
