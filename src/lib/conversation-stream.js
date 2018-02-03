const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:conversation-stream')

const twitterQuery = require('./twitter-query')

const flatten = arr => arr.reduce((prev, curr) => prev.concat(curr), [])

class ConversationStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0
  _lastMinPosition = undefined
  _lastReadTweetId = undefined

  constructor (username, id, { count } = {}) {
    super({ objectMode: true })
    this.username = username
    this.id = id
    this.count = count
    debug(`ConversationStream for ${this.username} and ${this.id}`)
  }

  _read () {
    if (this.isLocked) {
      debug('ConversationStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('ConversationStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('ConversationStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('ConversationStream is now locked')
    twitterQuery
      .getUserConversation(this.username, this.id, this._lastMinPosition)
      .then(tweets => {
        const extendedTweets = tweets.reduce((ets, ct, idx) => {
          const _showMoreTweetsFromConversation =
            ct._showMoreTweetsFromConversation
          delete ct._showMoreTweetsFromConversation

          ets.push(ct)
          if (_showMoreTweetsFromConversation) {
            ets.push(
              twitterQuery.getThreadedConversation(
                _showMoreTweetsFromConversation
              )
            )
          }

          return ets
        }, [])

        return Promise.all(extendedTweets).then(flatten)
      })
      .then(tweets => {
        const lastReadTweetId = tweets.length
          ? tweets[tweets.length - 1].id
          : undefined
        if (this._lastReadTweetId === lastReadTweetId) {
          this.push(null)
          this.isLocked = false
          return
        }

        for (const tweet of tweets) {
          this.push(tweet)
          this._numberOfTweetsRead++
          if (this._numberOfTweetsRead >= this.count) {
            debug('ConversationStream has read up to the max count')
            break
          }
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
          debug(
            `ConversationStream sets the last min position to ${
              tweets.minPosition
            }`
          )
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
