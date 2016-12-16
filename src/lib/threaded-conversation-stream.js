const Readable = require('readable-stream/readable')

const twitterQuery = require('./twitter-query')

class ThreadedConversationStream extends Readable {

  isLocked = false

  constructor ({ id }) {
    super({ objectMode: true })
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
    twitterQuery.getThreadedConversation(this.id)
      .then(tweets => {
        for (const tweet of tweets) {
          this.push(tweet)
        }

        this.isLocked = false
      })
      .catch(err => this.emit('error', err))
  }

}

module.exports = ThreadedConversationStream
