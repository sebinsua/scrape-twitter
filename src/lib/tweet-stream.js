const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:tweet-stream')

const twitterQuery = require('./twitter-query')

class TweetStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0
  _firstReadTweet = undefined
  _lastReadTweet = undefined

  constructor (query, type, { count } = {}) {
    super({ objectMode: true })
    this.query = query
    this.type = type === 'latest' ? 'tweets' : 'top'
    this.count = count
    debug(`TweetStream for "${this.query}" and type ${type} created`)
  }

  _read () {
    if (this.isLocked) {
      debug('TweetStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('TweetStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('TweetStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('TweetStream is now locked')

    debug(
      `TweetStream queries for tweets outside [ ${this._firstReadTweet}, ..., ${
        this._lastReadTweet
      } ]`
    )
    const maxPosition =
      this._firstReadTweet && this._lastReadTweet
        ? `TWEET-${this._lastReadTweet}-${this._firstReadTweet}`
        : null
    twitterQuery
      .queryTweets(this.query, this.type, maxPosition)
      .then(tweets => {
        if (!this._firstReadTweet) {
          this._firstReadTweet = tweets[0] ? tweets[0].id : null
        }

        let lastReadTweetId
        for (const tweet of tweets) {
          lastReadTweetId = tweet.id

          this.push(tweet)
          this._numberOfTweetsRead++
          if (this._numberOfTweetsRead >= this.count) {
            debug('TweetStream has read up to the max count')
            break
          }
        }

        // We have to check to see if there are more tweets, by seeing if the
        // last tweet id has been repeated or not.
        const hasZeroTweets = lastReadTweetId === undefined
        const hasDifferentLastTweet = this._lastReadTweet !== lastReadTweetId
        const hasMoreTweets = !hasZeroTweets && hasDifferentLastTweet
        if (hasMoreTweets === false) {
          debug('TweetStream has no more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
          this.push(null)
        } else {
          debug('TweetStream has more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
        }

        debug(`TweetStream sets the last tweet to ${lastReadTweetId}`)
        this._lastReadTweet = lastReadTweetId

        this.isLocked = false
        debug('TweetStream is now unlocked')

        if (hasMoreTweets) {
          debug('TweetStream has more tweets so calls this._read')
          this._read()
        }
      })
      .catch(err => this.emit('error', err))
  }
}

module.exports = TweetStream
