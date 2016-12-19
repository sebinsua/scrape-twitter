const debug = require('debug')('scrape-twitter:parser')

const parseTweetText = ($, element) => {
  const textElement = $(element).find('.tweet-text').first()
  // Replace each emoji image with the actual emoji unicode
  textElement.find('img.twitter-emoji').each((i, emoji) => {
    const alt = $(emoji).attr('alt')
    return $(emoji).html(alt)
  })
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
    toUsernames.push(usernameMatched[1])
  }

  return toUsernames
}

const parseHashtagsFromText = (text) => {
  // NOTE: Currently this will match `someText#hashtag#anotherHashtag#someOtherHashtag`
  //       but it should not.
  const HASHTAG_REGEX = /(#\w+)/g

  const hashtags = []
  let hashtagMatched
  while ((hashtagMatched = HASHTAG_REGEX.exec(text)) !== null) {
    hashtags.push(hashtagMatched[1])
  }

  return hashtags
}

const fromUnixEpochToISO8601 = (unixDateString) => (new Date(+unixDateString)).toISOString()

const parseTweet = ($, element) => {
  const username = $(element).attr('data-screen-name')
  const id = $(element).attr('data-item-id')
  const text = parseTweetText($, element)
  const images = parseImages($, element)

  const toUsernames = parseUsernamesFromText(text)
  const hashtags = parseHashtagsFromText(text)

  debug(`${username} tweeted ${id}${toUsernames.length ? ` @ ${toUsernames.join(' ')}` : ''}: ${text}`)

  const isMarkedAsReply = $(element).attr('data-is-reply-to') === 'true' || $(element).attr('data-has-parent-tweet') === 'true'
  const isReplyTo = isMarkedAsReply || toUsernames.length > 0
  const isPinned = $(element).hasClass('user-pinned')
  const isRetweet = $(element).find('.js-retweet-text').length !== 0
  const time = fromUnixEpochToISO8601($(element).find('.js-short-timestamp').first().attr('data-time-ms'))

  const reply = parseActionCount($, element, 'reply')
  const retweet = parseActionCount($, element, 'retweet')
  const favorite = parseActionCount($, element, 'favorite')
  debug(`tweet ${id} received ${reply} replies`)
  debug(`tweet ${id} received ${retweet} retweets`)
  debug(`tweet ${id} received ${favorite} favorites`)

  const quotedTweetElement = $(element).find('.QuoteTweet-innerContainer')
  const quotedUsername = quotedTweetElement.attr('data-screen-name')
  const quotedId = quotedTweetElement.attr('data-item-id')
  const quotedText = parseTweetText($, quotedTweetElement)
  let quote
  if (quotedTweetElement.length) {
    debug(`tweet ${id} quotes the tweet ${quotedId} by ${quotedUsername}: ${quotedText}`)
    quote = {
      username: quotedUsername,
      id: quotedId,
      text: quotedText
    }
  }

  const tweet = {
    username,
    id,
    time,
    isRetweet,
    isPinned,
    isReplyTo,
    toUsernames,
    text,
    hashtags,
    images,
    reply,
    retweet,
    favorite,
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
  const $header = $('.ProfileHeaderCard')
  const $nav = $('.ProfileNav')

  const name = $header.find('.ProfileHeaderCard-name a').first().text()
  const username = $header.find('.ProfileHeaderCard-screenname > a').first().text().substring(1)
  const bio = parseBio($, $header.find('.ProfileHeaderCard-bio').first())
  const joinDate = fromJoinDateToIso8601($header.find('.ProfileHeaderCard-joinDate .ProfileHeaderCard-joinDateText').first().text())
  const tweets = toNumber($nav.find('.ProfileNav-item--tweets .ProfileNav-value').first().text())
  const following = toNumber($nav.find('.ProfileNav-item--following .ProfileNav-value').first().text())
  const followers = toNumber($nav.find('.ProfileNav-item--followers .ProfileNav-value').first().text())
  const likes = toNumber($nav.find('.ProfileNav-item--favorites .ProfileNav-value').first().text())

  const usernames = parseUsernamesFromText(bio)
  const hashtags = parseHashtagsFromText(bio)

  const userProfile = {
    username,
    name,
    bio,
    usernames,
    hashtags,
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

module.exports.toTwitterProfile = toTwitterProfile
module.exports.toTweets = toTweets
