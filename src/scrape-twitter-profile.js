const meow = require('meow')
const twitterQuery = require('./lib/twitter-query')

const stringify = (v) => console.log(JSON.stringify(v, null, 2))

const cli = meow(`
  Usage
    $ scrape-twitter-profile <username>
`)

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cli.input[0]
  twitterQuery.getUserProfile(username).then(stringify).catch(err => {
    if (err.statusCode !== 404) {
      console.error(err.message)
      console.error(err.stack)
    }
  })
}
