const parseUsername = username => (username || '').replace('@', '')

const handleError = exit => err => {
  if (err != null) {
    if (err.statusCode === 429) {
      console.error(err.message)
    } else if (err.statusCode !== 404) {
      console.error(err.message)
      console.error(err.stack)
    }
    return exit(1)
  }
}

module.exports = {
  parseUsername,
  handleError
}
