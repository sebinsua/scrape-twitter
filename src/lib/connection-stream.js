const Readable = require('readable-stream/readable')
const debug = require('debug')('scrape-twitter:connection-stream')

const login = require('./twitter-login')
const twitterQuery = require('./twitter-query')

class ConnectionStream extends Readable {
  isLocked = false

  _numberOfConnectionsRead = 0
  _lastMinPosition = undefined

  constructor (username, type, env = {}) {
    super({ objectMode: true })
    this.username = username
    this.type = type
    this.env = env
    debug(`ConnectionStream for ${this.username} created for `, {
      type: this.type
    })
  }

  _read () {
    if (this.isLocked) {
      debug('ConnectionStream cannot be read as it is locked')
      return false
    }
    if (this._readableState.destroyed) {
      debug('ConnectionStream cannot be read as it is destroyed')
      this.push(null)
      return false
    }

    this.isLocked = true
    debug('ConnectionStream is now locked')

    debug(
      `ConnectionStream reads profiles${
        this._lastMinPosition
          ? ` from position ${this._lastMinPosition} onwards`
          : ''
      }`
    )

    login(this.env)
      .then(() =>
        twitterQuery
          .getUserConnections(this.username, this.type, this._lastMinPosition)
          .then(connections => {
            let lastReadConnectionId
            for (const connection of connections) {
              lastReadConnectionId = connection.screenName

              this.push(connection)
              this._numberOfConnectionsRead++
            }

            // We have to check to see if there are more connections,
            // by seeing if the last connection id has been repeated or not.
            const hasZeroConnections = lastReadConnectionId === undefined
            const hasDifferentLastConnection =
              this._lastReadConnectionId !== lastReadConnectionId
            const hasMoreConnections =
              !hasZeroConnections && hasDifferentLastConnection
            if (hasMoreConnections === false) {
              debug('ConnectionStream has no more connections:', {
                hasZeroConnections,
                hasDifferentLastConnection,
                hasMoreConnections
              })
              this.push(null)
            } else {
              debug('ConnectionStream has more connections:', {
                hasZeroConnections,
                hasDifferentLastConnection,
                hasMoreConnections
              })
            }

            debug(
              `ConnectionStream sets the last min position to ${
                connections._minPosition
              }`
            )
            this._lastMinPosition = connections._minPosition

            this.isLocked = false
            debug('ConnectionStream is now unlocked')

            if (hasMoreConnections) {
              debug('ConnectionStream has more connections so calls this._read')
              this._read()
            }
          })
          .catch(err => this.emit('error', err))
      )
      .catch(err => this.emit('error', err))
  }
}

module.exports = ConnectionStream
