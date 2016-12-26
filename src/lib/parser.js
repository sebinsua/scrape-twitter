const urlRegex = require('url-regex')

const debug = require('debug')('scrape-twitter:parser')

const parseTweetText = ($, element) => {
  const textElement = $(element).find('.tweet-text').first()
  // Replace each emoji image with the actual emoji unicode
  textElement.find('img.twitter-emoji').each((i, emoji) => {
    const alt = $(emoji).attr('alt')
    return $(emoji).html(alt)
  })
  // Remove hidden URLS
  textElement.find('a.u-hidden').remove()
  return textElement.text()
}

const parseActionCount = ($, element, action) => {
  const wrapper = $(element).find(`.ProfileTweet-action--${action} .ProfileTweet-actionCount`)
  return wrapper.length !== 0 ? +$(wrapper).first().attr('data-tweet-stat-count') : 0
}

const parseImages = ($, element) => {
  const pics = $(element).find(`
    .multi-photos .multi-photo[data-image-url],
    [data-card-type=photo] [data-image-url],
    .AdaptiveMedia-photoContainer[data-image-url]
  `).toArray()
  const images = []
  for (const pic of pics) {
    images.push($(pic).attr('data-image-url'))
  }
  return images
}

const parseUsernamesFromText = (text) => {
  // NOTE: Currently this will match `someText@username@anotherUsername@someOtherUserName`
  //       but it should not.
  const USERNAME_REGEX = /@(\w+)/g

  const toUsernames = []
  let usernameMatched
  while ((usernameMatched = USERNAME_REGEX.exec(text)) !== null) {
    toUsernames.push({
      screenName: usernameMatched[1],
      indices: [ usernameMatched.index, USERNAME_REGEX.lastIndex ]
    })
  }

  return toUsernames
}

const parseHashtagsFromText = (text) => {
  // NOTE: Currently this will match `someText#hashtag#anotherHashtag#someOtherHashtag`
  //       but it should not.
  const HASHTAG_REGEX = /#(\w+)/g

  const hashtags = []
  let hashtagMatched
  while ((hashtagMatched = HASHTAG_REGEX.exec(text)) !== null) {
    hashtags.push({
      hashtag: hashtagMatched[1],
      indices: [ hashtagMatched.index, HASHTAG_REGEX.lastIndex ]
    })
  }

  return hashtags
}

const parseUrlsFromText = (text) => {
  const URL_REGEX = urlRegex()

  const urls = []
  let urlMatched
  while ((urlMatched = URL_REGEX.exec(text)) !== null) {
    urls.push({
      url: urlMatched[0],
      indices: [ urlMatched.index, URL_REGEX.lastIndex ]
    })
  }

  return urls
}

const fromUnixEpochToISO8601 = (unixDateString) => (new Date(+unixDateString)).toISOString()

const parseTweet = ($, element) => {
  const screenName = $(element).attr('data-screen-name')
  const id = $(element).attr('data-item-id')
  const text = parseTweetText($, element)
  const images = parseImages($, element)

  const userMentions = parseUsernamesFromText(text)
  const hashtags = parseHashtagsFromText(text)
  const urls = parseUrlsFromText(text)

  debug(`${screenName} tweeted ${id}${userMentions.length ? ` @ ${userMentions.join(' ')}` : ''}: ${text}`)

  const isReplyTo = $(element).attr('data-is-reply-to') === 'true' || $(element).attr('data-has-parent-tweet') === 'true'
  const isPinned = $(element).hasClass('user-pinned')
  const isRetweet = $(element).find('.js-retweet-text').length !== 0
  const time = fromUnixEpochToISO8601($(element).find('.js-short-timestamp').first().attr('data-time-ms'))

  const replyCount = parseActionCount($, element, 'reply')
  const retweetCount = parseActionCount($, element, 'retweet')
  const favoriteCount = parseActionCount($, element, 'favorite')
  debug(`tweet ${id} received ${replyCount} replies`)
  debug(`tweet ${id} received ${retweetCount} retweets`)
  debug(`tweet ${id} received ${favoriteCount} favorites`)

  const quotedTweetElement = $(element).find('.QuoteTweet-innerContainer')
  const quotedScreenName = quotedTweetElement.attr('data-screen-name')
  const quotedId = quotedTweetElement.attr('data-item-id')
  const quotedText = parseTweetText($, quotedTweetElement)
  let quote
  if (quotedTweetElement.length) {
    debug(`tweet ${id} quotes the tweet ${quotedId} by ${quotedScreenName}: ${quotedText}`)
    quote = {
      screenName: quotedScreenName,
      id: quotedId,
      text: quotedText
    }
  }

  const tweet = {
    screenName,
    id,
    time,
    isRetweet,
    isPinned,
    isReplyTo,
    text,
    userMentions,
    hashtags,
    images,
    urls,
    replyCount,
    retweetCount,
    favoriteCount,
    quote
  }

  debug('tweet found:', tweet)

  return tweet
}

const toNumber = (value) => parseInt((value || '').replace(/[^0-9]/g, '')) || 0

const parseBio = ($, element) => {
  // Replace each emoji image with the actual emoji unicode
  element.find('img.Emoji').each((i, emoji) => {
    const alt = $(emoji).attr('alt')
    return $(emoji).html(alt)
  })
  return element.text()
}

const fromJoinDateToIso8601 = (joinDateString) => {
  const [ month, year ] = joinDateString.replace('Joined', '').trim().split(' ')
  const months = {
    'January': '01',
    'February': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12'
  }
  return `${year}-${months[month]}-01T00:00:00.000Z`
}

const toTwitterProfile = $ => {
  const $avatar = $('.ProfileAvatar')
  const $header = $('.ProfileHeaderCard')
  const $nav = $('.ProfileNav')

  const profileImage = $avatar.find('.ProfileAvatar-image').attr('src')
  const username = $header.find('.ProfileHeaderCard-screenname > a').first().text().substring(1)
  const name = $header.find('.ProfileHeaderCard-name a').first().text()
  const bio = parseBio($, $header.find('.ProfileHeaderCard-bio').first())
  const joinDate = fromJoinDateToIso8601($header.find('.ProfileHeaderCard-joinDate .ProfileHeaderCard-joinDateText').first().text())
  const tweets = toNumber($nav.find('.ProfileNav-item--tweets .ProfileNav-value').first().text())
  const following = toNumber($nav.find('.ProfileNav-item--following .ProfileNav-value').first().text())
  const followers = toNumber($nav.find('.ProfileNav-item--followers .ProfileNav-value').first().text())
  const likes = toNumber($nav.find('.ProfileNav-item--favorites .ProfileNav-value').first().text())

  const userMentions = parseUsernamesFromText(bio)
  const hashtags = parseHashtagsFromText(bio)
  const urls = parseUrlsFromText(bio)

  const userProfile = {
    username,
    profileImage,
    name,
    bio,
    userMentions,
    hashtags,
    urls,
    joinDate,
    tweets,
    following,
    followers,
    likes
  }

  debug('user profile found:', userProfile)

  return userProfile
}

const toTweets = $ => {
  const MATCH_TWEETS_ONLY = '.tweet:not(.modal-body)'
  return $(MATCH_TWEETS_ONLY).toArray().map(tweetElement => parseTweet($, tweetElement))
}

const toThreadedTweets = id => $ => {
  // NOTE: This will not pick up ancestors as they do not belong to threaded conversations.
  //       (It will instead pick up only the parent and its threaded tweets.)
  const flatten = arr => arr.reduce((prev, curr) => prev.concat(curr), [])

  const MATCH_THREADS = '.ThreadedConversation, .ThreadedConversation--loneTweet'
  const MATCH_PERMALINK_TWEET_ONLY = '.permalink-tweet:not(.modal-body)'
  const MATCH_TWEETS_ONLY = '.tweet:not(.modal-body)'

  const parentTweetElement = $(MATCH_PERMALINK_TWEET_ONLY).get(0)
  const parentTweet = parseTweet($, parentTweetElement)

  const threadedConversations = $(MATCH_THREADS).toArray().map(threadedConversationElement => {
    let lastTweetId = id
    return $(threadedConversationElement).find(MATCH_TWEETS_ONLY).toArray().map(tweetElement => {
      const tweet = { ...parseTweet($, tweetElement), isReplyToId: lastTweetId }
      lastTweetId = tweet.id
      return tweet
    })
  })
  const childTweets = flatten(threadedConversations)

  return [ parentTweet, ...childTweets ]
}

module.exports.toTwitterProfile = toTwitterProfile
module.exports.toTweets = toTweets
module.exports.toThreadedTweets = toThreadedTweets
