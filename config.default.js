// User-specific configuration
exports.owner_name = "human";                  // change this to your own name for better personalization  :)
exports.sentiment_keyword = "people";          // keyword to monitor in Twitter
exports.speak_intro = true;                    // speak the intro when the script is launched
exports.speak_on_sentiment_change = true;      // if true, TJ will speak when the sentiment changes
exports.wave_on_sentiment_change = true;       // if true, TJ will wave when the sentiment changes
exports.sentiment_analysis_frequency_sec = 30; // analyze sentiment every N seconds

// Create the credentials object for export
exports.credentials = {};

// Watson Text to Speech
// https://www.ibm.com/watson/developercloud/text-to-speech.html
exports.credentials.text_to_speech = {
	password: '',
	username: ''
};

// Watson Tone Analyzer
// https://www.ibm.com/watson/developercloud/tone-analyzer.html
exports.credentials.tone_analyzer = {
    password: '',
    username: ''
};

// Twitter
exports.credentials.twitter = {
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
};
