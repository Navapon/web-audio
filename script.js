var recorder = "";
var input = "";
const that = this;
var audio_context = "";
var apiKey = "AIzaSyBb3gw82hDkzjZZGRkVz9Tw_MZnycJnekw"
var data = {
  audio: {
    content: null,
  },
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 44100,
    languageCode: "th-TH",
    enable_word_time_offsets: false
  }
}
var serverUrl = "localhost:8080";

// Dedect client is support microphone and need a permission
function requestUserPermission () {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    this.audio_context = new AudioContext();
    that.startUserMedia()

  } catch (e) {
    alert("No web audio support in this browser!");
  }
}

function startUserMedia() {
  navigator.getUserMedia(
    // constraints - only audio needed for this app
    {
      audio: true
    },
    function(stream) {
      that.initialMedia(stream);
    },
    function(e) {
      console.log("No live audio input: " + e);
    }
  );
}

function initialMedia(stream) {
  // Media stream created
  input = this.audio_context.createMediaStreamSource(stream);
  // Recorder initialised
  this.recorder =  new Recorder(input,{ numChannels:1 });
}

function startRecording () { 
  this.audio_context.resume().then(() => {
    this.recorder.record();
    console.log("Playback resumed successfully");
  })
}

function stopRecording() {
  // Stopped Recording
  this.recorder && this.recorder.stop();

  // create WAV download link using audio data blob
  // this.processRecording();
  recorder.clear();
}

function processRecording() {
  //check user device cause samplerate on each device is different
  let sampleRate = that.detectDevice();
  // this.data.audio.sampleRateHertz = sampleRate;
  this.data.config.sampleRateHertz = sampleRate;

  recorder && recorder.exportWAV(function(blob) {
      var reader = new window.FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const baseData = reader.result;
        const base64Data = baseData.replace("data:audio/wav;base64,", "");
        data.audio.content = base64Data;
        //axios.post( serverUrl, data ) 
        axios
        .post(
          `https://speech.googleapis.com/v1/speech:recognize?key=${
            apiKey
          }`,
          data
        )
          .then(response => {
          console.log(response)
        })
      };
    });
}

function detectDevice() {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return 48000;
  } else {
    return 44100;
  }
}


var voiceSearchInstance;
var VoiceSearch = {
  create: function () {
    if( voiceSearchInstance != null){
      return voiceSearchInstance;
    }
    voiceSearchInstance = {
      getPermission: function () {
        that.requestUserPermission();
      },
      startUserMedia: function () {
        that.startUserMedia();
      },
      startRecording: function () {
        that.startRecording();
      },
      stopRecording: function () {
        that.stopRecording();
      },
      processRecording: function () {
        that.processRecording()
      }
    };

    return voiceSearchInstance;

  }

}

