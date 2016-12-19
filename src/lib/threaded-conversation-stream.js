const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:threaded-conversation-stream')

const twitterQuery = require('./twitter-query')

class ThreadedConversationStream extends Readable {

  isLocked = false

  constructor (id) {
    super({ objectMode: true })
    this.id = id
    debug(`ThreadedConversationStream for ${this.id}`)
  }

  _read () {
    if (this.isLocked) {
      debug('ThreadedConversationStream cannot be read as it is locked')
      return false
    }
    if (this._readableState.destroyed) {
      debug('ThreadedConversationStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('ThreadedConversationStream is now locked')
    twitterQuery.getThreadedConversation(this.id)
      .then(tweets => {
        for (const tweet of tweets) {
          this.push(tweet)
        }

        this.isLocked = false
        debug('ThreadedConversationStream is now unlocked')

        this.push(null)
      })
      .catch(err => this.emit('error', err))
  }

}

module.exports = ThreadedConversationStream
