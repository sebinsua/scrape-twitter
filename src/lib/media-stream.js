const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:timeline-stream')

const twitterLogin = require('./twitter-login')
const twitterQuery = require('./twitter-query')

const loginWithOptionalEnv = (env = {}) =>
  Object.keys(env).length ? twitterLogin(env) : Promise.resolve()

class MediaTimelineStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0
  _lastReadTweetId = undefined

  constructor (username, { count, env } = {}) {
    super({ objectMode: true })
    this.username = username
    this.count = count
    this.env = env
    debug(`MediaTimelineStream for ${this.username} created with`, {
      count: this.count
    })
  }

  _read () {
    if (this.isLocked) {
      debug('MediaTimelineStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('MediaTimelineStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('MediaTimelineStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('MediaTimelineStream is now locked')

    debug(
      `MediaTimelineStream reads timeline${
        this._lastReadTweetId
          ? ` from tweet ${this._lastReadTweetId} onwards`
          : ''
      }`
    )

    loginWithOptionalEnv(this.env)
      .then(() =>
        twitterQuery
          .getUserMediaTimeline(this.username, this._lastReadTweetId)
          .then(tweets => {
            let lastReadTweetId
            for (const tweet of tweets) {
              lastReadTweetId = tweet.id

              this.push(tweet)
              this._numberOfTweetsRead++
              if (this._numberOfTweetsRead >= this.count) {
                debug('MediaTimelineStream has read up to the max count')
                break
              }
            }

            // We have to check to see if there are more tweets, by seeing if the
            // last tweet id has been repeated or not.
            const hasZeroTweets = lastReadTweetId === undefined
            const hasDifferentLastTweet =
              this._lastReadTweetId !== lastReadTweetId
            const hasMoreTweets = !hasZeroTweets && hasDifferentLastTweet
            if (hasMoreTweets === false) {
              debug('MediaTimelineStream has no more tweets:', {
                hasZeroTweets,
                hasDifferentLastTweet,
                hasMoreTweets
              })
              this.push(null)
            } else {
              debug('MediaTimelineStream has more tweets:', {
                hasZeroTweets,
                hasDifferentLastTweet,
                hasMoreTweets
              })
            }

            debug(
              `MediaTimelineStream sets the last tweet to ${lastReadTweetId}`
            )
            this._lastReadTweetId = lastReadTweetId

            this.isLocked = false
            debug('MediaTimelineStream is now unlocked')

            if (hasMoreTweets) {
              debug('MediaTimelineStream has more tweets so calls this._read')
              this._read()
            }
          })
          .catch(err => this.emit('error', err))
      )
      .catch(err => this.emit('error', err))
  }
}

module.exports = MediaTimelineStream
