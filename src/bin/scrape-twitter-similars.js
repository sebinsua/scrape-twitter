const meow = require('meow')
const twitterQuery = require('../lib/twitter-query')
const cliUtils = require('../lib/cli-utils')

const stringify = v => console.log(JSON.stringify(v, null, 2))

const SCRAPE_TWITTER_CONFIG = cliUtils.SCRAPE_TWITTER_CONFIG
const env = cliUtils.getEnv()

const cli = meow(
  `
  Usage
    $ TWITTER_USERNAME=jack TWITTER_PASSWORD=p4ssw0rd scrape-twitter similars <username>
`,
  {
    string: ['_']
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

    twitterQuery
    .getSimilarProfiles(username)
    .then(stringify)
    .catch(cliUtils.handleError(process.exit.bind(process)))
  }
