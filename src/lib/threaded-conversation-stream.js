const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:threaded-conversation-stream')

const twitterQuery = require('./twitter-query')

class ThreadedConversationStream extends Readable {
  isLocked = false

  _numberOfTweetsRead = 0

  constructor (id, { count } = {}) {
    super({ objectMode: true })
    this.id = id
    this.count = count
    debug(`ThreadedConversationStream for ${this.id}`)
  }

  _read () {
    if (this.isLocked) {
      debug('ThreadedConversationStream cannot be read as it is locked')
      return false
    }
    if (!!this.count && this._numberOfTweetsRead >= this.count) {
      debug('ThreadedConversationStream has read up to the max count')
      this.push(null)
      return false
    }
    if (this._readableState.destroyed) {
      debug('ThreadedConversationStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('ThreadedConversationStream is now locked')
    twitterQuery
      .getThreadedConversation(this.id)
      .then(tweets => {
        for (const tweet of tweets) {
          this.push(tweet)
          this._numberOfTweetsRead++
          if (this._numberOfTweetsRead >= this.count) {
            debug('ThreadedConversationStream has read up to the max count')
            break
          }
        }

        this.isLocked = false
        debug('ThreadedConversationStream is now unlocked')

        this.push(null)
      })
      .catch(err => this.emit('error', err))
  }
}

module.exports = ThreadedConversationStream
