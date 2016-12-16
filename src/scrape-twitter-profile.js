const meow = require('meow')
const twitterQuery = require('./lib/twitter-query')

const logger = console.log.bind(console)

const cli = meow(`
  Usage
    $ scrape-twitter-profile <username>
`)

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cli.input[0]
  twitterQuery.getUserProfile(username).then(logger)
}
