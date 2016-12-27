const streamToPromise = require('stream-to-promise')

const scrapeTwitter = require('../src')

const {
  TimelineStream,
  ConversationStream,
  TweetStream,
  ListStream,
  getUserProfile
} = scrapeTwitter

test('TimelineStream should emit a particular set of tweets', () => {
  const expectedTweetIds = [
    '509087583348195329'
  ]
  const expectedTweet = {
    screenName: 'peterthiel',
    id: '509087583348195329',
    text: expect.stringMatching('from zero to one'),
    time: '2014-09-08T21:15:12.000Z',
    userMentions: [],
    hashtags: [],
    images: [],
    urls: [
      { indices: [17, 39], url: 'http://amzn.to/1u6xqLU' }
    ],
    isPinned: false,
    isReplyTo: false,
    isRetweet: false,
    replyCount: expect.any(Number),
    retweetCount: expect.any(Number),
    favoriteCount: expect.any(Number)
  }
  const timelineStream = new TimelineStream('peterthiel')
  return streamToPromise(timelineStream).then(tweets => {
    const tweetIds = tweets.map(tweet => tweet.id)
    expect(tweetIds).toEqual(expectedTweetIds)
    expect(tweets[0]).toEqual(expectedTweet)
  })
})

test('ConversationStream should emit a particular set of tweets', () => {
  const expectedTweetIds = [
    '691761191182532608',
    '691762148842807297',
    '691766715835924484',
    '691768456463675394',
    '691769286482862080',
    '691771378731782145',
    '691777639678414848',
    '691777773183049729',
    '691779293467275264',
    '691779731579146240',
    '691782437634981888',
    '691783075156606976',
    '691783591395774465',
    '691784317958225920',
    '691788752759476225'
  ]
  const expectedTweet = {
    id: '691762148842807297',
    screenName: 'nouswaves',
    text: `1. Write a Twitter screen scraper on which I might build an interesting UI.
2. Study more ML.
3. Write 10s of unit tests for my bank CLI.`,
    time: '2016-01-25T23:18:43.000Z',
    isPinned: false,
    isReplyTo: true,
    isReplyToId: '691761191182532608',
    isRetweet: false,
    userMentions: [],
    urls: [],
    hashtags: [],
    images: [],
    favoriteCount: expect.any(Number),
    replyCount: expect.any(Number),
    retweetCount: expect.any(Number)
  }

  const conversationStream = new ConversationStream('ctbeiser', '691766715835924484', {})
  return streamToPromise(conversationStream).then(tweets => {
    const tweetIds = tweets.map(tweet => tweet.id)
    expect(tweetIds).toEqual(expectedTweetIds)
    expect(tweets[1]).toEqual(expectedTweet)
  })
})

test('TweetStream should emit a particular set of tweets', () => {
  const expectedTweetIds = ['453896154439499776', '448460333808877568', '444111658508898304', '443801915756138497', '443749290717241344', '443683376764317696', '443077086786633728', '442030176873238528', '441937334221950976', '441871397091291136']
  const expectedTweet = {
    id: '453896154439499776',
    screenName: 'bemomentum',
    text: expect.stringMatching('8 tips for creating the perfect pitch deck'),
    time: '2014-04-09T14:04:10.000Z',
    isPinned: false,
    isReplyTo: false,
    isRetweet: false,
    userMentions: [],
    urls: [
      { indices: [ 76, 98 ], url: 'http://buff.ly/1qq7VRw' }
    ],
    hashtags: [],
    images: [],
    favoriteCount: expect.any(Number),
    replyCount: expect.any(Number),
    retweetCount: expect.any(Number)
  }

  const timelineStream = new TweetStream('from:bemomentum', 'latest', { count: 10 })
  return streamToPromise(timelineStream).then(tweets => {
    const tweetIds = tweets.map(tweet => tweet.id)
    expect(tweetIds).toEqual(expectedTweetIds)
    expect(tweets[0]).toEqual(expectedTweet)
  })
})

test('ListStream should emit a particular set of tweets', () => {
  const expectedTweet = {
    id: expect.any(String),
    screenName: expect.any(String),
    text: expect.any(String),
    time: expect.any(String),
    isPinned: expect.any(Boolean),
    isReplyTo: expect.any(Boolean),
    isRetweet: expect.any(Boolean),
    userMentions: expect.any(Array),
    urls: expect.any(Array),
    hashtags: expect.any(Array),
    images: expect.any(Array),
    favoriteCount: expect.any(Number),
    replyCount: expect.any(Number),
    retweetCount: expect.any(Number)
  }

  const listStream = new ListStream('nouswaves', 'list', { count: 5 })
  return streamToPromise(listStream).then(tweets => {
    expect(tweets).toHaveLength(5)
    expect(tweets[0]).toEqual(expectedTweet)
  })
})

test('getUserProfile() should return my account', () => {
  const expectedUserProfile = {
    screenName: 'sebinsua',
    name: 'Seb Insua',
    profileImage: 'https://pbs.twimg.com/profile_images/643854442362720256/nSrJUpet_400x400.png',
    bio: 'musing → @nouswaves',
    joinDate: '2015-09-01T00:00:00.000Z',
    urls: [],
    hashtags: [],
    userMentions: [
      {
        screenName: 'nouswaves',
        indices: [ 9, 19 ]
      }
    ],
    followingCount: expect.any(Number),
    followerCount: expect.any(Number),
    likeCount: expect.any(Number),
    tweetCount: expect.any(Number)
  }
  return getUserProfile('sebinsua').then(userProfile => {
    expect(userProfile).toEqual(expectedUserProfile)
  })
})
