const meow = require('meow')
const twitterQuery = require('../lib/twitter-query')
const cliUtils = require('../lib/cli-utils')

const stringify = v => console.log(JSON.stringify(v, null, 2))

const cli = meow(
  `
  Usage
    $ scrape-twitter profile <username>
`,
  {
    string: ['_']
  }
)

if (cli.input.length === 0) {
  cli.showHelp()
} else {
  const username = cliUtils.parseUsername(cli.input[0])
  twitterQuery
    .getUserProfile(username)
    .then(stringify)
    .catch(cliUtils.handleError(process.exit.bind(process)))
}
