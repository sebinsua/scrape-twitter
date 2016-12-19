# `scrape-twitter` [![Build Status](https://travis-ci.org/sebinsua/scrape-twitter.png)](https://travis-ci.org/sebinsua/scrape-twitter) [![npm version](https://badge.fury.io/js/scrape-twitter.svg)](https://npmjs.org/package/scrape-twitter)
> 🐦 Access Twitter data without an API key

This module provides command line interfaces to scrape: profiles, timelines, search and conversations.

It also exposes both streams and a promise returning function to help accessing Twitter in your own applications.

## Example

```sh
$ scrape-twitter profile sebinsua
# ...

$ scrape-twitter timeline nouswaves
# ...

$ scrape-twitter conversation ctbeiser 691766715835924484
# ...

$ scrape-twitter search --query "from:afoolswisdom motivation" --type latest
# ...

$ scrape-twitter list nouswaves list
# ...
```

#### JSON interface plays nicely with CLI tools like [`jq`](https://github.com/stedolan/jq), [`coreutils/gshuf`](https://github.com/wertarbyte/coreutils) and [`terminal-notifier`](https://github.com/julienXX/terminal-notifier)

For example, a [MOTD-like](https://en.wikipedia.org/wiki/Motd_(Unix)) script might contain:

```sh
scrape-tweets afoolswisdom | jq -r 'map(select(.text | contains("knowledge"))) | .[].text' | gshuf -n 1 | terminal-notifier -title "Knowledge (MOTD)"
```

## Install

*With `yarn`*:
```sh
yarn global add scrape-twitter
```

*With `npm`*:
```sh
npm install -g scrape-twitter
```

## API

### `new TimelineStream(username: string, { retweets: boolean, replies: boolean })`

Create a `ReadableStream<Tweet>` for the timeline of a `username`.

### `new ConversationStream(username: string, id: string)`

Create a `ReadableStream<Tweet>` for the conversation that belongs to a `username` and tweet `id`.

### `new ThreadedConversationStream(id: string)`

Create a `ReadableStream<Tweet>` for the conversation that belongs to a tweet `id`.

### `new TweetStream(query: string, type: 'top' | 'latest')`

Create a `ReadableStream<Tweet>` for the `query` and `type`.

### `new ListStream(username: string, list: string)`

Create a `ReadableStream<Tweet>` for the `username` and `list`.

### `getUserProfile(username: string)`

Get a `Promise<UserProfile>` for a particular `username`.
