// binding this to that 
const that = this;
// initial value
var recorder = "";
var input = "";
var audio_context = "";
// body payload data
var data = {
    "content": null, // base64 format
    // "sample_rate": 44100, // sample rate value
    "command": 'call_solr_group_category', // fix solr command
    "language": 'th-TH'
}

var serverUrl = "http://localhost:8080/speech-to-text";

// Dedect client is support microphone and need a permission
function requestUserPermission () {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    this.audio_context = new AudioContext();
    that.startUserMedia()

  } catch (e) {
    alert("No web audio support in this browser!");
  }
}

function startUserMedia() {
  navigator.mediaDevices.getUserMedia({audio: true})
	.then(function(stream) {
		that.initialMedia(stream);
	})
	.catch(function(err) {
    console.log(err)
	});
}

function initialMedia(stream) {
  // Media stream created
  input = this.audio_context.createMediaStreamSource(stream);
  // Recorder initialised need to set numChannel to 1 cause support only mono 
  this.recorder =  new Recorder(input,{ numChannels:1 });
}

function startRecording () { 
  this.audio_context.resume().then(() => {
    this.recorder.record();
  })
}

// just create a download link for ui
function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var li = document.createElement('li');
    var au = document.createElement('audio');
    var hf = document.createElement('a');

    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    li.appendChild(au);
    li.appendChild(hf);
    recordingslist.appendChild(li);
}

//
function processRecording() {

    this.recorder && this.recorder.stop();

    //check user device cause sample rate on each device is different
    let sampleRate = that.audio_context.sampleRate;
    // this.data.sample_rate = sampleRate;
    return new Promise(function(resolve,reject)  {
      recorder && recorder.exportWAV(function(blob) {
        var reader = new window.FileReader();
        reader.readAsDataURL(blob);
        // generate download link and player
        this.createDownloadLink(blob)
        reader.onloadend = function () {
          const baseData = reader.result;
          const base64Data = baseData.replace("data:audio/wav;base64,", "");
          data.content = base64Data;
          // post data to api
          axios.post( serverUrl, data ) 
          .then(response => {
            if(response.data) {
              resolve(response.data)
              recorder.clear();
            }
          })
        };
      });
    })
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
      stopAndProcessRecording: function () {
        return new Promise(function(resolve,reject) {
          that.processRecording().then(result => {
            resolve(result)
          })
        })
      }
    };
    return voiceSearchInstance;
  }
}

