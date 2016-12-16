const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const TweetStream = require('./lib/tweet-stream')

const cli = meow(`
  Usage
    $ scrape-tweets <username>

  Options
    --with-retweets   Include retweets
`)

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cli.input[0]
  const tweets = new TweetStream(username, { retweets: cli.flags.withRetweets || false })
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, err => {
    if (err != null) {
      console.error(err.message)
      console.error(err.stack)
      return process.exit(1)
    }
  })
}
