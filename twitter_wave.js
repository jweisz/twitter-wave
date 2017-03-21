/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TJBot = require('tjbot');
var config = require('./config');
var Twitter = require('twitter');

// obtain our credentials from config.js
var credentials = config.credentials;

// obtain user-specific config
var OWNER_NAME = config.owner_name;
var SENTIMENT_KEYWORD = config.sentiment_keyword;
var SPEAK_INTRO = config.speak_intro;
var SPEAK_ON_SENTIMENT_CHANGE = config.speak_on_sentiment_change;
var WAVE_ON_SENTIMENT_CHANGE = config.wave_on_sentiment_change;
var SENTIMENT_ANALYSIS_FREQUENCY_MSEC = config.sentiment_analysis_frequency_sec * 1000;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['led', 'servo', 'speaker'];

// turn on debug logging to the console
var config = {
    verboseLogging: true
};

// instantiate our TJBot!
var tj = new TJBot(hardware, config, credentials);

// create the twitter service
var twitter = new Twitter({
    consumer_key: config.credentials.twitter.consumer_key,
    consumer_secret: config.credentials.twitter.consumer_secret,
    access_token_key: config.credentials.twitter.access_token_key,
    access_token_secret: config.credentials.twitter.access_token_secret
});

console.log("I am monitoring twitter for " + SENTIMENT_KEYWORD);

// raise the arm
tj.raiseArm();

// flash random colors
for (var i = 0; i < 10; i++) {
    tj.shine('random');
    tj.sleep(150);
}
tj.shine('off');

// speak a greeting
if (SPEAK_INTRO) {
    var now = new Date();
    var greeting = greetingForHour(now.getHours(), OWNER_NAME);
    
    tj.speak(greeting).then(function() {
        // wave
        tj.wave();
        tj.wave();
        return tj.speak("I am monitoring Twitter for sentiment related to " + SENTIMENT_KEYWORD + ".");
    }).then(function() {
        return tj.speak("When I see that people are happy, I shine yellow!");
    }).then(function() {
        tj.shine('yellow');
        return tj.speak("When they are sad, I shine blue.");
    }).then(function() {
        tj.shine('blue');
        return tj.speak("I also shine red when they are angry");
    }).then(function() {
        tj.shine('red');
        return tj.speak("purple when they are afraid");
    }).then(function() {
        tj.shine('purple');
        return tj.speak("and green when they express disgust.");
    }).then(function() {
        tj.shine('green');
        return tj.speak("Here we go!");
    }).then(function() {
        tj.shine('off');
        return tj.speak("It may take some time for me to collect enough tweets to analyze.");
    }).then(function() {
        monitorTwitter();
    });
} else {
    // don't speak the intro, just wave and go straight to the monitoring
    tj.wave();
    tj.wave();
    monitorTwitter();
}


// ---

function greetingForHour(hour, name) {
    if (hour >= 5 && hour < 8) {
        // wee-hours
        return "Yawn. " + name + ", why are we up so early?";   
    } else if (hour >= 8 && hour < 12) {
        // morning
        return "Good morning " + name;
    } else if (hour >= 12 && hour < 17) {
        // afternoon
        return "Good afternoon " + name;
    } else if (hour >= 17 && hour < 22) {
        // evening
        return "Good evening " + name;
    } else if (hour >= 22 && hour < 24) {
        // late evening
        return "Good evening " + name + ", it looks like we're up late!";
    } else if (hour >= 0 && hour < 5) {
        // night
        return name + ", isn't it time for bed?";
    } else {
        return "Hello, " + name;
    }
}

var TWEETS = [];
var MAX_TWEETS = 100;
var CONFIDENCE_THRESHOLD = 0.5;

function monitorTwitter() {
    // start the pulse to show we are thinking
    tj.pulse('white', 1.5, 2.0);
    
    // monitor twitter
    twitter.stream('statuses/filter', {
        track: SENTIMENT_KEYWORD
    }, function(stream) {
        stream.on('data', function(event) {
            if (event && event.text) {
                var tweet = event.text;
                
                // Remove non-ascii characters (e.g chinese, japanese, arabic, etc.) and
                // remove hyperlinks
                tweet = tweet.replace(/[^\x00-\x7F]/g, "");
                tweet = tweet.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
                
                // keep a buffer of MAX_TWEETS tweets for sentiment analysis
                while (TWEETS.length >= MAX_TWEETS) {
                    TWEETS.shift();
                }
                TWEETS.push(cleanTweet);
            }
        });
        
        stream.on('error', function(error) {
            console.log("\nAn error has occurred while connecting to Twitter. Please check your twitter credentials, and also refer to https://dev.twitter.com/overview/api/response-codes for more information on Twitter error codes.\n");
            throw error;
        });
    });
    
    // perform sentiment analysis every N seconds
    setInterval(function() {
        console.log("Performing sentiment analysis of the tweets");
        shineFromTweetSentiment();
    }, SENTIMENT_ANALYSIS_FREQUENCY_MSEC);
}

function shineFromTweetSentiment() {
    // make sure we have at least 5 tweets to analyze, otherwise it
    // is probably not enough.
    if (TWEETS.length > 5) {
        var text = TWEETS.join(' ');
        console.log("Analyzing tone of " + TWEETS.length + " tweets");
        tj.analyzeTone(text, function(tone) {
            tone.document_tone.tone_categories.forEach(function(category) {
                if (category.category_id == "emotion_tone") {
                    // find the emotion with the highest confidence
                    var max = category.tones.reduce(function(a, b) {
                        return (a.score > b.score) ? a : b;
                    });
                    
                    // make sure we really are confident
                    if (max.score >= CONFIDENCE_THRESHOLD) {
                        // stop pulsing at this point, we are going to change color
                        if (tj.isPulsing()) {
                            tj.stopPulsing();
                        }
                        shineForEmotion(max.tone_id);
                    }
                }
            });
        });
    } else {
        console.log("Not enough tweets collected to perform sentiment analysis");
    }
}

var PREVIOUS_EMOTION = undefined;

function shineForEmotion(emotion) {
    console.log("Current emotion around " + SENTIMENT_KEYWORD + " is " + emotion);
    
    var msg = "";
    
    switch (emotion) {
        case 'anger':
            tj.shine('red');
            msg = "people are feeling angry about " + SENTIMENT_KEYWORD + " right now";
        break;
        
        case 'joy':
            tj.shine('yellow');
            msg = "people are feeling happy about " + SENTIMENT_KEYWORD + " right now";
        break;
        
        case 'fear':
            tj.shine('magenta');
            msg = "people are feeling afraid about " + SENTIMENT_KEYWORD + " right now";
        break;
        
        case 'disgust':
            tj.shine('green');
            msg = "people are feeling disgusted about " + SENTIMENT_KEYWORD + " right now";
        break;
        
        case 'sadness':
            tj.shine('blue');
            msg = "people are feeling sad about " + SENTIMENT_KEYWORD + " right now";
        break;
        
        default:
        break;
    }
    
    if (PREVIOUS_EMOTION == undefined || PREVIOUS_EMOTION != emotion) {
        if (WAVE_ON_SENTIMENT_CHANGE) {
            tj.wave();
        }
        if (SPEAK_ON_SENTIMENT_CHANGE) {
            tj.speakAsync("Hey " + OWNER_NAME + ", " + msg);
        }
    }
    
    PREVIOUS_EMOTION = emotion;
}
