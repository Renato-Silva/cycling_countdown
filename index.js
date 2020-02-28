//var config = require('./config.production');
var events = require('./events');
var Twitter = require('twitter');
var moment = require('moment');
var schedule = require('node-schedule');
var weather = require('openweather-apis');



/*
console.log(config.openweathermap);

weather.setLang('en');
weather.setAPPID(config.openweathermap);
weather.setUnits('metric');

weather.setCity('Roubaix');
weather.getAllWeather(function(err, JSONObj){
        console.log(JSONObj);
});
*/


//Interval vetween tweets in minutes
var interval = 5;

//var client = new Twitter(config.credentials);
var client = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

//postTweet(client, "This is a test");
//postRetweet(client, "1104341929733619713", "Test");

checkEvents();


//0 10 * * *
// Run every day at 10am
var j = schedule.scheduleJob('0 10 * * *', function(){
    checkEvents();
});




function checkEvents(){
    for(var i = 0; i < events.length; i++) {
        var obj = events[i];

        var days = daysLeft(obj.date);


        var isPast = moment(moment()).isAfter(obj.date);

        if(!isPast){
            if(days == "today"){
                var tweet = composeTweetDaysToday(days, obj);
                if(obj.retweet != null){
                    postRetweet(client, obj.retweet, tweet);
                }

                postTweet(client, tweet);



                //console.log(tweet);



                sleep(interval*1000);

            }else if(days != "month"){
                var tweet = composeTweetDaysLeft(days, obj);
                postTweet(client, tweet);
                //console.log(tweet);
                sleep(interval*1000);

            }

        }

    }
}


function postRetweet(client, tweetID){
    client.post('statuses/retweet/' + tweetID,
     function(error, tweet, response) {
          if (!error) {
            console.log(tweet);
          }
      });
}

function postTweet(client, tweet){
    client.post('statuses/update', {
      status: tweet
    }, function(err, tweet, res) {
      if(err) console.log(err);
      console.log('Tweet posted: ', tweet);
  });
}


function composeTweetDaysLeft(days, event) {
    if(days.startsWith("a ")){
        return [
          'There is ',
          days,
          ' left until ',
          event.name,
          ' ',
          event.twitter,
          ' ',
          event.hashtag
        ].join('');
    }else{
        return [
          'There are ',
          days,
          ' left until ',
          event.name,
          ' ',
          event.twitter,
          ' ',
          event.hashtag
        ].join('');
    }

}


function composeTweetDaysToday(days, event) {
  return [
      event.name,
    ' is today! ',
    event.twitter,
    ' ',
    event.hashtag
  ].join('');
}


function daysLeft(date) {
    var starts   = moment();
    var ends = moment(date);

    var left = moment.duration(ends.diff(starts));

    if(left._data.days == 0){
        return "today";
    }

    if(left._data.months >= 1){
        return "month";
    }

    // x days
    return left.humanize();
}



function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
