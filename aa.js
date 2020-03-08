var config = require('./config.production');
var weather = require('openweather-apis');



getWeatherReport('Saint-Martin-Vesubie');






function getWeatherReport(location){
    weather.setLang('en');
    weather.setAPPID(config.openweathermap);
    weather.setUnits('metric');

    weather.setCity(location);

    weather.getAllWeather(function(err, JSONObj){
        console.log(JSONObj);

            //Description
            console.log(JSONObj.weather[0].main);

            console.log(JSONObj.weather[0].icon);

            console.log(JSONObj.main.temp);
            console.log(JSONObj.main.humidity);

            console.log(JSONObj.wind.speed);
            console.log(JSONObj.wind.deg);

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
