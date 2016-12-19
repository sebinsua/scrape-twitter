const meow = require('meow')

const JSONStream = require('JSONStream')
const pump = require('pump')
const ListStream = require('./lib/list-stream')
const cliUtils = require('./lib/cli-utils')

const cli = meow(`
  Usage
    $ scrape-twitter-list <username> <list>
`)

if (cli.input.length < 2) {
  cli.showHelp()
} else {
  const username = cliUtils.parseUsername(cli.input[0])
  const list = cli.input[1]
  const tweets = new ListStream(username, list)
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)))
}
