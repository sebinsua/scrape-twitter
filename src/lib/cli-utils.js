const expandHome = require('expand-home-dir')
const touch = require('touch')

const SCRAPE_TWITTER_CONFIG = expandHome('~/.scrape-twitter')

touch.sync(SCRAPE_TWITTER_CONFIG)

const parseUsername = username => (username || '').replace('@', '')

const handleError = exit => err => {
  if (err != null) {
    if (err.statusCode === 429) {
      console.error(err.message)
    } else if (err.statusCode !== 404) {
      console.error(err.message)
      console.error(err.stack)
    }
    return exit(1)
  }
}

const getEnv = () => {
  require('dotenv').config({ path: SCRAPE_TWITTER_CONFIG })
  const env = {
    SCRAPE_TWITTER_CONFIG: SCRAPE_TWITTER_CONFIG,
    TWITTER_USERNAME: process.env.TWITTER_USERNAME,
    TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
    TWITTER_KDT: process.env.TWITTER_KDT // used to determine whether a new device is logging in
  }
  return env
}

module.exports = {
  SCRAPE_TWITTER_CONFIG,
  getEnv,
  parseUsername,
  handleError
}
