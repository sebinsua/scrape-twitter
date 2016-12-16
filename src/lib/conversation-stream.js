const Readable = require('readable-stream/readable')

const twitterQuery = require('./twitter-query')

class ConversationStream extends Readable {

  isLocked = false

  _lastReadTweetId = undefined

  constructor (username, { id }) {
    super({ objectMode: true })
    this.username = username
    this.id = id
  }

  _read () {
    if (this.isLocked) {
      return false
    }
    if (this._readableState.destroyed) {
      this.push(null)
      return false
    }

    this.isLocked = true
    twitterQuery.getUserConversation(this.username, this.id, this._lastReadTweetId)
      .then(tweets => {
        let lastReadTweetId
        for (const tweet of tweets) {
          lastReadTweetId = tweet.id
          this.push(tweet)
        }

        // We have to check to see if there are more tweets, by seeing if the
        // last tweet id has been repeated or not.
        const hasZeroTweets = lastReadTweetId === undefined
        const hasDifferentLastTweet = this._lastReadTweetId !== lastReadTweetId
        const hasMoreTweets = !hasZeroTweets && hasDifferentLastTweet
        if (hasMoreTweets === false) {
          this.push(null)
        }

        this._lastReadTweetId = lastReadTweetId
        this.isLocked = false

        if (hasMoreTweets) {
          this._read()
        }
      })
      .catch(err => this.emit('error', err))
  }

}

module.exports = ConversationStream
