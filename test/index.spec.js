const streamToPromise = require('stream-to-promise')

const scrapeTwitter = require('../src')

const {
  TimelineStream,
  ConversationStream,
  ThreadedConversationStream,
  TweetStream,
  ListStream,
  getUserProfile
} = scrapeTwitter

/*
TODO:
- [ ] Write integration tests.
*/

test.skip('TimelineStream should emit a particular set of tweets', () => {

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

test.skip('TweetStream should emit a particular set of tweets', () => {

})

test.skip('ListStream should emit a particular set of tweets', () => {

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
