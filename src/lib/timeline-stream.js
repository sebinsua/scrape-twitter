const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:timeline-stream')

const twitterLogin = require('./twitter-login')
const twitterQuery = require('./twitter-query')

const loginWhenReplies = (replies, env = {}) =>
  replies ? twitterLogin(env) : Promise.resolve()

class TimelineStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0
  _lastReadTweetId = undefined

  constructor (username, { retweets, replies, count, env } = {}) {
    super({ objectMode: true })
    this.username = username
    this.retweets = retweets == null ? false : retweets
    this.replies = replies == null ? false : replies
    this.count = count
    this.env = env
    debug(`TimelineStream for ${this.username} created with`, {
      retweets: this.retweets,
      replies: this.replies,
      count: this.count
    })
  }

  _read () {
    if (this.isLocked) {
      debug('TimelineStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('TimelineStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('TimelineStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('TimelineStream is now locked')

    debug(
      `TimelineStream reads timeline${
        this._lastReadTweetId
          ? ` from tweet ${this._lastReadTweetId} onwards`
          : ''
      }`
    )

    loginWhenReplies(this.replies, this.env)
      .then(() =>
        twitterQuery
          .getUserTimeline(this.username, this._lastReadTweetId, {
            replies: this.replies
          })
          .then(tweets => {
            let lastReadTweetId
            for (const tweet of tweets) {
              if (this.retweets === false && tweet.isRetweet) {
                debug(`tweet ${tweet.id} was skipped as it is a retweet`)
                continue // Skip retweet.
              }
              lastReadTweetId = tweet.id

              this.push(tweet)
              this._numberOfTweetsRead++
              if (this._numberOfTweetsRead >= this.count) {
                debug('TimelineStream has read up to the max count')
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
              debug('TimelineStream has no more tweets:', {
                hasZeroTweets,
                hasDifferentLastTweet,
                hasMoreTweets
              })
              this.push(null)
            } else {
              debug('TimelineStream has more tweets:', {
                hasZeroTweets,
                hasDifferentLastTweet,
                hasMoreTweets
              })
            }

            debug(`TimelineStream sets the last tweet to ${lastReadTweetId}`)
            this._lastReadTweetId = lastReadTweetId

            this.isLocked = false
            debug('TimelineStream is now unlocked')

            if (hasMoreTweets) {
              debug('TimelineStream has more tweets so calls this._read')
              this._read()
            }
          })
          .catch(err => this.emit('error', err))
      )
      .catch(err => this.emit('error', err))
  }
}

module.exports = TimelineStream
