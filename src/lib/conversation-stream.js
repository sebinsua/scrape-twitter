const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:conversation-stream')

const twitterQuery = require('./twitter-query')

class ConversationStream extends Readable {

  isLocked = false

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
    twitterQuery.getUserConversation(this.username, this.id)
      .then(tweets => {
        for (const tweet of tweets) {
          this.push(tweet)
        }

        this.isLocked = false
        debug('ConversationStream is now unlocked')

        this.push(null)
      })
      .catch(err => this.emit('error', err))
  }

}

module.exports = ConversationStream
