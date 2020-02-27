var config = require('./config');
var events = require('./events');
var Twitter = require('twitter');
var moment = require('moment');
var schedule = require('node-schedule');



//var client = new Twitter(config.credentials);



/**
 * Set interval to compose and send tweets.
 */
/*setInterval(function() {
  client.post('statuses/update', {
    status: composeTweet()
  }, function(err, tweet, res) {
    if(err) console.log(err);
    console.log('Tweet posted: ', tweet);
});
    checkEvents();
}, config.interval);*/

//0 10 * * *
var j = schedule.scheduleJob('* * * * *', function(){
    checkEvents();
});




function checkEvents(){
    for(var i = 0; i < events.length; i++) {
        var obj = events[i];

        var days = daysLeft(obj.date);

        if(days == "today"){
            console.log(composeTweetDaysToday(days, obj));
        }else if(days != "month"){
            console.log(composeTweetDaysLeft(days, obj));
        }



    }
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
