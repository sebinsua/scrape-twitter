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
  const username = $(element).attr('data-screen-name')
  const id = $(element).attr('data-item-id')
  const isReplyTo = $(element).attr('data-is-reply-to') === 'true' || $(element).attr('data-has-parent-tweet') === 'true'
  const isPinned = $(element).hasClass('user-pinned')
  const isRetweet = $(element).find('.js-retweet-text').length !== 0
  const time = +$(element).find('.js-short-timestamp').first().attr('data-time')

  const text = parseTweetText($, element)
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
    text,
    images,
    reply,
    retweet,
    favorite,
    quote
  }

  return tweet
}

module.exports = parseTweet
