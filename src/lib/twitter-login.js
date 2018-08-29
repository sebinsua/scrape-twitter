const debug = require('debug')('scrape-twitter:twitter-login')

const cheerio = require('cheerio')

const denodeify = require('es6-denodeify')(Promise)
const fetchCookieDecorator = require('fetch-cookie')
const isomorphicFetch = require('isomorphic-fetch')
const tough = require('tough-cookie')

const SCRAPE_TWITTER_CONFIG = require('./cli-utils').SCRAPE_TWITTER_CONFIG

const jar = new tough.CookieJar()
const setCookie = denodeify(jar.setCookie.bind(jar))

const fetch = fetchCookieDecorator(isomorphicFetch, jar)

const DEFAULT_TIMEOUT = 10000

const toText = response => response.text()

const setCookieWithKdt = kdt => {
  if (kdt) {
    const cookie =
      'kdt=' +
      kdt +
      '; Expires=' +
      new Date(2050, 0).toUTCString() +
      '; Path=/; Domain=.twitter.com; Secure; HTTPOnly'
    const url = 'https://twitter.com/sessions'
    return setCookie(cookie, url)
  } else {
    return Promise.resolve()
  }
}

const getAuthToken = () => {
  return fetch('https://twitter.com', {
    timeout: process.env.SCRAPE_TWITTER_TIMEOUT || DEFAULT_TIMEOUT
  })
    .then(toText)
    .then(body => {
      const $ = cheerio.load(body)
      const authToken = $('input[name="authenticity_token"]').val()
      debug(`found authToken ${authToken} on home page`)
      return authToken
    })
}

const checkForKdt = previousKdt => response => {
  // Set-Cookie rather than set-cookie here...
  const cookies = (response.headers.getAll('Set-Cookie') || []).join(' ')
  const [, kdt] = cookies.match(/kdt=([\w0-9]*);/) || []
  debug(`found the TWITTER_KDT ${kdt}`)
  if (kdt && previousKdt !== kdt) {
    console.log(
      `Please ensure that the environment variable TWITTER_KDT is set with ${kdt}`
    )
    console.log()
    console.log(
      `Environment variables can be set within the dotenv file: ${SCRAPE_TWITTER_CONFIG}`
    )
    process.exit(1)
  }
  return response
}

const loginWithAuthToken = (
  TWITTER_USERNAME,
  TWITTER_PASSWORD,
  TWITTER_KDT
) => {
  return authToken => {
    const formData = `session%5Busername_or_email%5D=${TWITTER_USERNAME}&session%5Bpassword%5D=${encodeURIComponent(TWITTER_PASSWORD)}&remember_me=1&return_to_ssl=true&scribe_log=&redirect_after_login=%2F&authenticity_token=${authToken}`
    return fetch('https://twitter.com/sessions', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0'
      },
      body: formData,
      timeout: process.env.SCRAPE_TWITTER_TIMEOUT || DEFAULT_TIMEOUT
    })
      .then(response => {
        const location = response.headers.get('location') || ''
        if (location.includes('error')) {
          debug(`unable to login with ${TWITTER_USERNAME}`)
          throw new Error(
            `Could not login with ${TWITTER_USERNAME} and the password supplied`
          )
        }
        return response
      })
      .then(checkForKdt(TWITTER_KDT))
      .then(response => {
        debug(`logged in using ${TWITTER_USERNAME}`)
        return response
      })
  }
}

function login (env = {}) {
  const { TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_KDT } = env
  return setCookieWithKdt(TWITTER_KDT)
    .then(getAuthToken)
    .then(loginWithAuthToken(TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_KDT))
}

module.exports = login
module.exports.fetch = fetch
