#!/usr/bin/env node
'use strict'

const execa = require('execa')

const args = process.argv.slice(2)

const scrapeTwitterCommand = `scrape-twitter-${args[0]}`
const scrapeTwitterFlags = args.slice(1)

const command = execa(scrapeTwitterCommand, scrapeTwitterFlags)
command.stdout.pipe(process.stdout)
command.stderr.pipe(process.stderr)

command.catch(() => {
  console.log(`
    Access Twitter data without an API key.

    Usage
      $ scrape-twitter <command>

    Commands
      profile       Get a user's profile.
      timeline      Get a user's timeline.
      likes         Get a user's likes.
      connections   Get a user's connections.
      conversation  Get a particular conversation.
      list          Get the timeline of a particular list.
      search        Query Twitter for matching tweets.
  `)
  return true
})
