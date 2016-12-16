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

const parseTweet = ($, element) => {
  const USERNAME_REGEX = /@(\w+)/

  const username = $(element).attr('data-screen-name')
  const id = $(element).attr('data-item-id')
  const text = parseTweetText($, element)

  const usernamesMatched = USERNAME_REGEX.exec(text) || []
  const toUsernames = usernamesMatched.slice(1)
  const isMarkedAsReply = $(element).attr('data-is-reply-to') === 'true' || $(element).attr('data-has-parent-tweet') === 'true'
  const isReplyTo = isMarkedAsReply || toUsernames.length > 0
  const isPinned = $(element).hasClass('user-pinned')
  const isRetweet = $(element).find('.js-retweet-text').length !== 0
  const time = +$(element).find('.js-short-timestamp').first().attr('data-time')

  const reply = parseActionCount($, element, 'reply')
  const retweet = parseActionCount($, element, 'retweet')
  const favorite = parseActionCount($, element, 'favorite')
  const images = parseImages($, element)

  const quotedTweetElement = $(element).find('.QuoteTweet-innerContainer')
  const quotedUsername = quotedTweetElement.attr('data-screen-name')
  const quotedId = quotedTweetElement.attr('data-item-id')
  const quotedText = parseTweetText($, quotedTweetElement)
  let quote
  if (quotedTweetElement.length) {
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
    images,
    reply,
    retweet,
    favorite,
    quote
  }

  return tweet
}

const toNumber = (value) => parseInt((value || '').replace(/[^0-9]/g, '')) || 0

const toTwitterProfile = $ => {
  const $header = $('.ProfileHeaderCard')
  const $nav = $('.ProfileNav')

  const name = $header.find('.ProfileHeaderCard-name a').first().text()
  const username = $header.find('.ProfileHeaderCard-screenname > a').first().text().substring(1)
  const bio = $header.find('.ProfileHeaderCard-bio').first().text()
  const joinDate = $header.find('.ProfileHeaderCard-joinDate .ProfileHeaderCard-joinDateText').first().text().replace('Joined', '').substring(1)
  const tweets = toNumber($nav.find('.ProfileNav-item--tweets .ProfileNav-value').first().text())
  const following = toNumber($nav.find('.ProfileNav-item--following .ProfileNav-value').first().text())
  const followers = toNumber($nav.find('.ProfileNav-item--followers .ProfileNav-value').first().text())
  const likes = toNumber($nav.find('.ProfileNav-item--favorites .ProfileNav-value').first().text())

  return {
    username,
    name,
    bio,
    joinDate,
    tweets,
    following,
    followers,
    likes
  }
}

const toTweets = $ => {
  return $('.tweet').toArray().map(tweetElement => parseTweet($, tweetElement))
}

module.exports.toTwitterProfile = toTwitterProfile
module.exports.toTweets = toTweets
