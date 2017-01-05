const meow = require('meow')
const expandHome = require('expand-home-dir')

const JSONStream = require('JSONStream')
const pump = require('pump')
const LikeStream = require('../lib/like-stream')
const cliUtils = require('../lib/cli-utils')

const scrapeTwitterConfig = expandHome('~/.scrape-twitter')
require('dotenv').config({ path: scrapeTwitterConfig })
const env = {
  SCRAPE_TWITTER_CONFIG: scrapeTwitterConfig,
  TWITTER_USERNAME: process.env.TWITTER_USERNAME,
  TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
  TWITTER_KDT: process.env.TWITTER_KDT // used to determine whether a new device is logging in
}

const cli = meow(`
  Usage
    $ scrape-twitter likes [--count=<count>] <username>

  Options
    --count,         -c   Get first N items
`, {
  alias: { c: 'count' }
})

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cliUtils.parseUsername(cli.input[0])
  const tweets = new LikeStream(username, {
    env,
    count: cli.flags.count
  })
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)))
}
