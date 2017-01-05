#!/usr/bin/env node

var cheerio = require('cheerio')

// Place default kdt into tough-cookie.
var expandHome = require('expand-home-dir')
require('dotenv').config({ path: expandHome('~/.scrape-twitter') })

var twitterUsername = process.env.TWITTER_USERNAME
var twitterPassword = process.env.TWITTER_PASSWORD
if (!twitterUsername || !twitterPassword) {
  process.exit(1)
}

var fetchDecorator = require('fetch-cookie')
var isomorphicFetch = require('isomorphic-fetch')
var tough = require('tough-cookie')
var denodeify = require('es6-denodeify')(Promise)

function getFetchWithKdt () {
  var jar = new tough.CookieJar()
  var setCookie = denodeify(jar.setCookie.bind(jar))

  var fetch = fetchDecorator(isomorphicFetch, jar)
  if (process.env.TWITTER_KDT) {
    var cookie = 'kdt=' + process.env.TWITTER_KDT + '; Expires=Fri, 06 Jul 2018 02:30:12 GMT; Path=/; Domain=.twitter.com; Secure; HTTPOnly'
    var url = 'https://twitter.com/sessions'
    return setCookie(cookie, url).then(function () {
      return fetch
    })
  } else {
    return Promise.resolve().then(function () {
      return fetch
    })
  }
}

var toText = function (response) { return response.text() }

getFetchWithKdt().then(function (fetch) {
  fetch('https://twitter.com').then(toText).then(function (body) {
    var $ = cheerio.load(body)
    var authToken = $('input[name="authenticity_token"]').val()

    var formData = 'session%5Busername_or_email%5D=' + twitterUsername + ' &session%5Bpassword%5D=' + twitterPassword + '&remember_me=1&return_to_ssl=true&scribe_log=&redirect_after_login=%2F&authenticity_token=' + authToken
    return fetch('https://twitter.com/sessions', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0'
      },
      body: formData
    }).then(function (res) {
      // TODO: Store the KDT.
      // var getCookieString = denodeify(jar.getCookieString.bind(jar))
      return fetch('https://twitter.com/i/likes')
        .then(toText)
        .then(function (_body) {
          var $ = cheerio.load(_body)
          console.log($('.original-tweet:first-child .tweet-text').text())
        })
    })
  })
})
