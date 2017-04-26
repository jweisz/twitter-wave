# twitter-wave
> Enhanced Twitter recipe for [TJBot](http://ibm.biz/mytjbot)

This recipe is an enhancement of the [Sentiment Analysis](https://github.com/ibmtjbot/tjbot/tree/master/recipes/sentiment_analysis) recipe included in [TJBot](http://ibm.biz/mytjbot). This recipe adds options for TJBot to wave and announce when the sentiment for a topic changes.

## Hardware
This recipe requires a TJBot with an LED, a servo, and a speaker.

## Build and Run
Install the dependencies.

    $ cd twitter-wave
    $ npm install

Create an instance of the [Watson Tone Analyzer](http://www.ibm.com/watson/developercloud/tone-analyzer.html) service and note the authentication credentials.

Create a set of [Twitter developer credentials](https://apps.twitter.com/) and note the consumer key, consumer secret, access token key, and access token secret.

Make a copy the default configuration file and update it with the Watson service credentials.

    $ cp config.default.js config.js
    $ nano config.js
    <enter your credentials in the specified places>

Run!

    sudo node twitter-wave.js

> Note the `sudo` command. Root user access is required to run TJBot recipes.

At this point, TJBot will begin listening to Twitter for tweets containing the specified keyword (specified in `exports.sentiment_keyword`). It may take some time to collect enough tweets to perform sentiment analysis, so please be patient.

## Customize
You can make a number of customizations in `config.js`.

| Parameter | Description | Default value |
| --- | --- | --- |
| `owner_name` | How TJBot will address you | "human" |
| `sentiment_keyword` | The keyword to monitor in Twitter | "education" |
| `speak_intro` | If `true`, TJBot will speak an introduction describing the different colors | true |
| `speak_on_sentiment_change` | If `true`, TJBot will announce that sentiment has changed when it changes | true |
| `wave_on_sentiment_change` | If `true`, TJBot will wave when sentiment has changed | true |
| `sentiment_analysis_frequency_sec` | The number of seconds in between when TJBot performs sentiment analysis | 30 seconds |

With the default configuration, TJBot will greet you and describe how he is monitoring Twitter and what all the colors mean. Then, he will monitor Twitter for tweets containing `sentiment_keyword`. Every 30 seconds, he will send all the tweets he has collected to the Watson Tone Analyzer service. If the sentiment has changed from the last time (e.g. from joy to sadness), TJBot will wave, he will speak about the change in sentiment, and his LED will shine a different color.

# Watson Services
- [Watson Tone Analyzer](http://www.ibm.com/watson/developercloud/tone-analyzer.html)

# License
This project is licensed under Apache 2.0. Full license text is available in [LICENSE](../../LICENSE).

# Contributing
See [CONTRIBUTING.md](../../CONTRIBUTING.md).
