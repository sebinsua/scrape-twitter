const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:list-stream')

const twitterQuery = require('./twitter-query')

class ListStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0
  _lastReadTweetId = undefined

  constructor (username, list, { count } = {}) {
    super({ objectMode: true })
    this.username = username
    this.list = list
    this.count = count
    debug(`ListStream for ${this.username}/${this.list} created`)
  }

  _read () {
    if (this.isLocked) {
      debug('ListStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('ListStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('ListStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('ListStream is now locked')

    debug(
      `ListStream reads list${
        this._lastReadTweetId
          ? ` from tweet ${this._lastReadTweetId} onwards`
          : ''
      }`
    )
    twitterQuery
      .getUserList(this.username, this.list, this._lastReadTweetId)
      .then(tweets => {
        let lastReadTweetId
        for (const tweet of tweets) {
          lastReadTweetId = tweet.id

          this.push(tweet)
          this._numberOfTweetsRead++
          if (this._numberOfTweetsRead >= this.count) {
            debug('ListStream has read up to the max count')
            break
          }
        }

        // We have to check to see if there are more tweets, by seeing if the
        // last tweet id has been repeated or not.
        const hasZeroTweets = lastReadTweetId === undefined
        const hasDifferentLastTweet = this._lastReadTweetId !== lastReadTweetId
        const hasMoreTweets = !hasZeroTweets && hasDifferentLastTweet
        if (hasMoreTweets === false) {
          debug('ListStream has no more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
          this.push(null)
        } else {
          debug('ListStream has more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
        }

        debug(`ListStream sets the last tweet to ${lastReadTweetId}`)
        this._lastReadTweetId = lastReadTweetId

        this.isLocked = false
        debug('ListStream is now unlocked')

        if (hasMoreTweets) {
          debug('ListStream has more tweets so calls this._read')
          this._read()
        }
      })
      .catch(err => this.emit('error', err))
  }
}

module.exports = ListStream
