var config = require('./config.production');
var events = require('./events');
var Twitter = require('twitter');
var moment = require('moment');
var schedule = require('node-schedule');
var weather = require('openweather-apis');


//////////////////////////////////////////////////////
/////                                            /////
/////       Cycling Countdown @DaysCycling       /////
/////                                            /////
//////////////////////////////////////////////////////


console.log("The bot has started");


//Create a new twitter client
var client = new Twitter(config.credentials);



checkEvents();
//console.log("First time finished");



function checkEvents(){
    for(var i = 0; i < events.length; i++) {
        var obj = events[i];
        console.log("Event: " + obj.name)

        var hasEnded =  moment(moment()).isAfter(obj.end);

        //Check if event is to show and end date has not passed
        if(obj.show == true && !hasEnded){

            //Check if the event has been cancelled
            if(obj.cancelled == false){

                //Number of days left
                var daysLeft = daysLeftText(obj.begin);
                var isPast = moment(moment()).isAfter(obj.begin);
                if(!isPast){
                    if(daysLeft != "month"){
                        var tweet = composeTweetDaysLeft(daysLeft, obj);
                        if(config.post){
                            postTweet(client, tweet);
                        }
                        console.log("Tweet: " + tweet);
                    }

                }else{
                    if(daysLeft == "today"){
                        var tweet = composeTweetDaysToday(daysLeft, obj);
                        if(config.post){
                            if(obj.retweet != null){
                                postRetweet(client, obj.retweet, tweet);
                            }
                            postTweet(client, tweet);
                        }
                        console.log("Tweet: " + tweet);

                    }
                }

                //Post daily weather report
                //Check if locations are defined
                if(obj.locations != undefined){
                    var stageNumber = getStageNumber(obj);
                    console.log("Stage today: " + stageNumber);
                    console.log("Location: " + obj.locations[stageNumber]);

                    getWeatherReport(obj,obj.locations[stageNumber]);

                }


            }else{
                if(config.post){
                    postTweet(client,obj.name + " has been cancelled!");
                }

            }



        }


    }
}


function getStageNumber(event){
    var now   = moment();
    var starts = moment(event.begin);
    var stage = moment.duration(starts.diff(now, 'days'));
    return Math.abs(stage);
}



function getWeatherReport(obj, location){
    weather.setLang('en');
    weather.setAPPID(config.openweathermap);
    weather.setUnits('metric');

    weather.setCity(location);

    weather.getAllWeather(function(err, JSONObj){

        //Description
        var description = JSONObj.weather[0].main;
        //Icon
        var icon = getWeatherIcon(JSONObj.weather[0].icon);
        //Temperature
        var temperature = JSONObj.main.temp;
        //hHumidity
        var humidity = JSONObj.main.humidity;
        //Wind speed
        var speed = JSONObj.wind.speed;
        //Wind direction
        var direction = JSONObj.wind.deg;


        var weatherReport =
            "Todays weather at " + obj.name + ": " +
            icon + " " + description + " 🌡️ " + temperature + "ºC 💦 " +
            humidity + "% 💨 " + speed + "km/h " + direction + "ª (" + location + ")";
        console.log("Weather: " + weatherReport);
        if(config.post){
            postTweet(client, weatherReport);
        }

    });

}

/*
 *  Generate the icon for the weather
 */
function getWeatherIcon(code){
    switch(code.substring(0, 2)) {
        case '01':
            return '☀️';
        case '02':
            return '🌤';
        case '03':
            return '🌥';
        case '04':
            return '☁️';
        case '09':
            return '🌦️';
        case '10':
            return '🌧️';
        case '11':
            return '⛈️';
        case '13':
            return '❄️';
        case '50':
            return '🌫️';
        default:
            return '☀️';
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


function daysLeftText(date) {
    var starts   = moment();
    var ends = moment(date);



    var left = moment.duration(ends.diff(starts));

    if(starts.isSame(ends, 'day')){
        return "today";
    }

    if(left._data.months >= 1){
        return "month";
    }

    var days = ends.diff(starts, 'days') + 1;
    // x days
    if(days == 1){
        return "a day"
    }

    return days + " days";
    // x days
    //return left.humanize();
}
