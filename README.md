# `scrape-twitter` [![Build Status](https://travis-ci.org/sebinsua/scrape-twitter.png)](https://travis-ci.org/sebinsua/scrape-twitter) [![npm version](https://badge.fury.io/js/scrape-twitter.svg)](https://npmjs.org/package/scrape-twitter)
> 🐦 Access Twitter data without an API key

This module provides command line interfaces to scrape: profiles, timelines, connections, likes, search and conversations.

It also exposes both streams and a promise returning function to help accessing Twitter in your own applications.

Real-time firehoses can be created using the companion module [`monitor-head-stream`](https://github.com/sebinsua/monitor-head-stream#example). 

## Features

- [x] Get Twitter data without being required to configure an API key.
- [x] Twitter can't constrain access as easily as they can to an API or an individual API key. Any constraints introduced would apply to their public site. A scraper can be fixed; you are no longer beholden to Twitter.
- [x] Grab timelines, whole conversations, profiles, connections, likes, etc.
- [x] Automatically pages to fetch all tweets.
- [x] Provides metadata on how tweet replies are linked together. *e.g. `isReplyToId`*

## Example

### Get profile

```sh
$ scrape-twitter profile sebinsua
# ...
```

### Get timeline

```sh
$ scrape-twitter timeline nouswaves
# ...
```

### Get likes

This command requires a valid login. It will check for the following environment variables: `TWITTER_USERNAME`, `TWITTER_PASSWORD`, `TWITTER_KDT`. But can also pick these up from a [`dotenv`](https://github.com/motdotla/dotenv) file at the path `~/.scrape-twitter`. The first time you login you will be asked to store the `TWITTER_KDT` - this is used by Twitter to recognise your device.

```sh
$ scrape-twitter likes sebinsua
# ...
```

### Get connections

This command also requires a valid login.

```sh
$ scrape-twitter connections sebinsua --type=following
# ...
```

### Get conversation

```sh
$ scrape-twitter conversation ctbeiser 691766715835924484
# ...
```

### Search

```sh
$ scrape-twitter search --query "from:afoolswisdom motivation" --type latest
# ...
```

### Get list

```sh
$ scrape-twitter list nouswaves list
# ...
```

#### JSON interface plays nicely with CLI tools like [`jq`](https://github.com/stedolan/jq), [`coreutils/gshuf`](https://github.com/wertarbyte/coreutils) and [`terminal-notifier`](https://github.com/julienXX/terminal-notifier)

For example, a [MOTD-like](https://en.wikipedia.org/wiki/Motd_(Unix)) script might contain:

```sh
scrape-twitter search --query="from:afoolswisdom knowledge" | jq -r '.[].text' | gshuf -n 1 | terminal-notifier -title "Knowledge (MOTD)"
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

### `new TimelineStream(username: string, { retweets: boolean, replies: boolean, count: ?number })`

Create a `ReadableStream<Tweet>` for the timeline of a `username`.

### `new LikeStream(username: string, { count: ?number, env: process.env })`

Create a `ReadableStream<Tweet>` for the likes of a `username`.

### `new ConnectionStream(username: string, type: 'following' | 'followers', process.env)`

Create a `ReadableStream<UserConnection>` for the connections of a `username`.

### `new ConversationStream(username: string, id: string, { count: ?number })`

Create a `ReadableStream<Tweet>` for the conversation that belongs to a `username` and tweet `id`.

### `new ThreadedConversationStream(id: string)`

Create a `ReadableStream<Tweet>` for the thread that belongs to a tweet `id`.

### `new TweetStream(query: string, type: 'top' | 'latest', { count: ?number })`

Create a `ReadableStream<Tweet>` for the tweets that match a `query` and `type`.

### `new ListStream(username: string, list: string, { count: ?number })`

Create a `ReadableStream<Tweet>` for the `username`'s `list`.

### `getUserProfile(username: string)`

Get a `Promise<UserProfile>` for a particular `username`.
