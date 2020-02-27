var config = require('./config.production');
var events = require('./events');
var Twitter = require('twitter');
var moment = require('moment');
var schedule = require('node-schedule');



//var client = new Twitter(config.credentials);



//0 10 * * *
var j = schedule.scheduleJob('* * * * *', function(){
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
                //postTweet(client, tweet);
                console.log(tweet);
                sleep(3000);

            }else if(days != "month"){
                var tweet = composeTweetDaysLeft(days, obj);
                //postTweet(client, tweet);
                console.log(tweet);
                sleep(3000);

            }

        }

    }
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
