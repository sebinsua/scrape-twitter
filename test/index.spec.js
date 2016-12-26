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

test.skip('ConversationStream should emit a particular set of tweets', () => {

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
