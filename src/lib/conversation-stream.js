const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:conversation-stream')

const twitterQuery = require('./twitter-query')

class ConversationStream extends Readable {

  isLocked = false

  _lastMinPosition = undefined
  _lastReadTweetId = undefined

  constructor (username, id) {
    super({ objectMode: true })
    this.username = username
    this.id = id
    debug(`ConversationStream for ${this.username} and ${this.id}`)
  }

  _read () {
    if (this.isLocked) {
      debug('ConversationStream cannot be read as it is locked')
      return false
    }
    if (this._readableState.destroyed) {
      debug('ConversationStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('ConversationStream is now locked')
    twitterQuery.getUserConversation(this.username, this.id, this._lastMinPosition)
      .then(tweets => {
        let lastReadTweetId
        for (const tweet of tweets) {
          lastReadTweetId = tweet.id
          // TODO: Use _showMoreTweetsFromConversation to make an extra request for data.
          delete tweet._showMoreTweetsFromConversation
          this.push(tweet)
        }

        const hasZeroTweets = lastReadTweetId === undefined
        const hasDifferentLastTweet = this._lastReadTweetId !== lastReadTweetId
        const hasMoreTweets = !hasZeroTweets && hasDifferentLastTweet
        if (hasMoreTweets === false) {
          debug('ConversationStream has no more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
          this.push(null)
        } else {
          debug('ConversationStream has more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
        }

        if (tweets.minPosition) {
          debug(`ConversationStream sets the last min position to ${tweets.minPosition}`)
          this._lastMinPosition = tweets.minPosition
        }

        debug(`TimelineStream sets the last tweet to ${lastReadTweetId}`)
        this._lastReadTweetId = lastReadTweetId

        this.isLocked = false
        debug('ConversationStream is now unlocked')

        if (hasMoreTweets) {
          debug('ConversationStream has more tweets so calls this._read')
          this._read()
        }
      })
      .catch(err => this.emit('error', err))
  }

}

module.exports = ConversationStream
