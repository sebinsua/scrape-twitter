const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:tweet-stream')

const twitterQuery = require('./twitter-query')

class TweetStream extends Readable {

  isLocked = false

  _lastReadTweetId = undefined

  constructor (username, { retweets, replies }) {
    super({ objectMode: true })
    this.username = username
    this.retweets = retweets == null ? false : retweets
    this.replies = replies == null ? false : replies
    debug(`TweetStream for ${this.username} created with`, { retweets: this.retweets, replies: this.replies })
  }

  _read () {
    if (this.isLocked) {
      debug('TweetStream cannot be read as it is locked')
      return false
    }
    if (this._readableState.destroyed) {
      debug('TweetStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('TweetStream is now locked')

    debug(`TweetStream reads timeline${this._lastReadTweetId ? ` from tweet ${this._lastReadTweetId} onwards` : ''}`)
    twitterQuery.getUserTimeline(this.username, this._lastReadTweetId, { replies: this.replies })
      .then(tweets => {
        let lastReadTweetId
        for (const tweet of tweets) {
          lastReadTweetId = tweet.id
          if (this.retweets === false && tweet.isRetweet) {
            debug(`tweet ${tweet.id} was skipped as it is a retweet`)
            continue // Skip retweet.
          }

          this.push(tweet)
        }

        // We have to check to see if there are more tweets, by seeing if the
        // last tweet id has been repeated or not.
        const hasZeroTweets = lastReadTweetId === undefined
        const hasDifferentLastTweet = this._lastReadTweetId !== lastReadTweetId
        const hasMoreTweets = !hasZeroTweets && hasDifferentLastTweet
        if (hasMoreTweets === false) {
          debug('TweetStream has no more tweets')
          this.push(null)
        } else {
          debug('TweetStream has more tweets:', {
            hasZeroTweets,
            hasDifferentLastTweet,
            hasMoreTweets
          })
        }

        debug(`TweetStream sets the last tweet to ${lastReadTweetId}`)
        this._lastReadTweetId = lastReadTweetId

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
