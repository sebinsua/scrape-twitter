const Readable = require('readable-stream/readable')

const twitterQuery = require('./twitter-query')

class ConversationStream extends Readable {

  isLocked = false

  constructor (username, id) {
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
    twitterQuery.getUserConversation(this.username, this.id)
      .then(tweets => {
        for (const tweet of tweets) {
          this.push(tweet)
        }

        this.isLocked = false
      })
      .catch(err => this.emit('error', err))
  }

}

module.exports = ConversationStream
