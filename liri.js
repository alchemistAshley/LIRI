// npm install dotenv
require('dotenv').config();

// required files
var keys = require ('./keys.js');

// required npm's
var inquirer = require ('inquirer');
var request = require('request');
var Twitter = require('twitter');
var fs = require("fs");
var Spotify = require('node-spotify-api');


// access keys
var client = new Twitter(keys.twitter);
var spotify = new Spotify(keys.spotify);

inquirer.prompt([
    {
        type: 'list',
        name: 'options',
        message: 'What would you like to do?',
        choices: ['my-tweets', 'spotify-this-song', 'movie-this', 'simon-says']
    }
]).then(function(inquirerRes) {
   decide(inquirerRes.options); 
});

function decide(options) {
    switch (options) {
        case 'my-tweets':
            getMyTweets();
            break;
        case 'simon-says':
            getFile();
            break;
        default:
            searchPrompt(options);
    }
}

function searchPrompt(options) {
    inquirer.prompt([
        {
            type: 'input',
            'name': 'searchTerm',
            message: 'What would you like to search for?'
        }
    ]).then(function(inquirerRes){
        var searchTerm = inquirerRes.searchTerm;
        switch (options) {
            case 'spotify-this-song':
                getSpotify(searchTerm);
                break;
            case 'movie-this':
                getMovie(searchTerm);
                break;
        }
    });
}

function getMyTweets() {
    var params = {screen_name: 'AlchemistAshley'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            var myTweets = [];
            for (var i = 0; i < 20; i++) {
                var myTweet = {
                    text: tweets[i].text,
                    created: tweets[i].created_at
                };
                myTweets.push(myTweet);
            }
            console.log(myTweets);
            log(myTweets);
        } else {
            console.log('Error: ' + JSON.stringify(error));
        }
    });
}

function getFile() {
    fs.readFile('random.txt', 'utf-8', function(error, data){
        if (error) {
            return console.log('Error: ' + error);
        }
        var fileArr = data.split(", ");
        // console.log("File Array: " + fileArr[1]);
        getSpotify(fileArr[1]);
    });
}

function getSpotify(songTitle) {
    if (songTitle === '' || !songTitle) {
        songTitle = 'This is America';
        console.log("We couldn't find what you were looking for but we found this one instead. Next time try to write a song title.");
    }
    spotify.search({ type: 'track', query: songTitle }, function(error, data) {
        if (error) {
            return console.log("Error: " + error);
        }
        var songData = data.tracks.items[0];
        var song = {
            artists: songData.artists[0].name,
            track: songData.name,
            album: songData.album.name,
            link: songData.preview_url
        };
        console.log(song);
        log(song);
    });
}

function getMovie(movieTitle) {
    if (movieTitle === '' || !movieTitle) {
        movieTitle = 'Mr. Nobody';
    }
    request('https://www.omdbapi.com/?apikey=trilogy&t=' + movieTitle + '&y=&plot=full&tomatoes=true', 
    function(error, response, body) {
        if (error) {
            return console.log('Error: ' + error);
        }
        var movieData = JSON.parse(body);
        var movie = {
            title: movieData.Title,
            actors: movieData.Actors,
            released: movieData.Year,
            country: movieData.Country,
            language: movieData.Language,
            rated: movieData.Rated,
            imdbRating: movieData.imdbRating,
            tomatoes: movieData.Ratings[1],
            plot: movieData.Plot 
        };
        console.log(movie);
        log(movie);
    });
}

function log(data) {
    fs.appendFile('./log.txt', JSON.stringify(data) + '\n', function() {
        console.log('This information has been logged in the log.txt file');
    });
}
