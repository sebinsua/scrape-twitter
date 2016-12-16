const Readable = require('readable-stream/readable')

const tweetQuery = require('./tweet-query')
const parseTweet = require('./tweet-parser')

class TweetStream extends Readable {

  isLocked = false

  _lastReadTweetId = undefined

  constructor (username, { retweets }) {
    super({ objectMode: true })
    this.username = username
    this.retweets = retweets == null ? false : retweets
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
    tweetQuery.getUserTimeline(this.username, this._lastReadTweetId)
      .then($ => {
        const originalTweetElements = $('.original-tweet').toArray()

        let lastReadTweetId
        for (const element of originalTweetElements) {
          const tweet = parseTweet($, element)

          lastReadTweetId = tweet.id
          if (this.retweets === false && tweet.isRetweet) {
            continue // skip retweet
          }

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

module.exports = TweetStream
