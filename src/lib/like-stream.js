const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:like-stream')

const login = require('./twitter-login')
const twitterQuery = require('./twitter-query')

class LikeStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0
  _lastReadTweetId = undefined

  constructor (username, { env, count } = {}) {
    super({ objectMode: true })
    this.username = username
    this.env = env
    this.count = count
    debug(`LikeStream for ${this.username} created with `, {
      count: this.count
    })
  }

  _read () {
    if (this.isLocked) {
      debug('LikeStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('LikeStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('LikeStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('LikeStream is now locked')

    debug(
      `LikeStream reads timeline${
        this._lastReadTweetId
          ? ` from tweet ${this._lastReadTweetId} onwards`
          : ''
      }`
    )

    login(this.env)
      .then(() =>
        twitterQuery
          .getUserLikes(this.username, this._lastReadTweetId)
          .then(tweets => {
            let lastReadTweetId
            for (const tweet of tweets) {
              lastReadTweetId = tweet.id

              this.push(tweet)
              this._numberOfTweetsRead++
              if (this._numberOfTweetsRead >= this.count) {
                debug('LikeStream has read up to the max count')
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
              debug('LikeStream has no more tweets:', {
                hasZeroTweets,
                hasDifferentLastTweet,
                hasMoreTweets
              })
              this.push(null)
            } else {
              debug('LikeStream has more tweets:', {
                hasZeroTweets,
                hasDifferentLastTweet,
                hasMoreTweets
              })
            }

            debug(`LikeStream sets the last tweet to ${lastReadTweetId}`)
            this._lastReadTweetId = lastReadTweetId

            this.isLocked = false
            debug('LikeStream is now unlocked')

            if (hasMoreTweets) {
              debug('LikeStream has more tweets so calls this._read')
              this._read()
            }
          })
          .catch(err => this.emit('error', err))
      )
      .catch(err => this.emit('error', err))
  }
}

module.exports = LikeStream
