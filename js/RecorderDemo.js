
// the following was extracted from the spec in October 2014

// Media control API -------------------------------

var media_events = new Array();
media_events["loadstart"] = 0;
media_events["progress"] = 0;
media_events["suspend"] = 0;
media_events["abort"] = 0;
media_events["error"] = 0;
media_events["emptied"] = 0;
media_events["stalled"] = 0;
media_events["loadedmetadata"] = 0;
media_events["loadeddata"] = 0;
media_events["canplay"] = 0;
media_events["canplaythrough"] = 0;
media_events["playing"] = 0;
media_events["waiting"] = 0;
media_events["seeking"] = 0;
media_events["seeked"] = 0;
media_events["ended"] = 0;
media_events["durationchange"] = 0;
media_events["timeupdate"] = 0;
media_events["play"] = 0;
media_events["pause"] = 0;
media_events["ratechange"] = 0;
media_events["resize"] = 0;
media_events["volumechange"] = 0;


var videos =
    [
        [
            "http://media.w3.org/2010/05/sintel/poster.png",
            "http://media.w3.org/2010/05/sintel/trailer.mp4",
            "http://media.w3.org/2010/05/sintel/trailer.webm"
        ],
        [
            "http://media.w3.org/2010/05/bunny/poster.png",
            "http://media.w3.org/2010/05/bunny/trailer.mp4"
        ],
        [
            "http://media.w3.org/2010/05/bunny/poster.png",
            "http://media.w3.org/2010/05/bunny/movie.mp4"
        ],
        [
            "http://media.w3.org/2010/05/video/poster.png",
            "http://media.w3.org/2010/05/video/movie_300.mp4",
            "http://media.w3.org/2010/05/video/movie_300.webm"
        ]
    ];

var media_properties = ["error", "src", "srcObject", "currentSrc", "crossOrigin", "networkState", "preload", "buffered", "readyState", "seeking", "currentTime", "duration",
    "paused", "defaultPlaybackRate", "playbackRate", "played", "seekable", "ended", "autoplay", "loop", "controls", "volume",
    "muted", "defaultMuted", "audioTracks", "videoTracks", "textTracks", "width", "height", "videoWidth", "videoHeight", "poster"];
var media_properties_elts = null;
var webm = null;

function capture(event) {
    media_events[event.type]++;
}

function init() {
    document._video = document.getElementById("video");
    webm = document.getElementById("webm");
    media_properties_elts = new Array(media_properties.length);
    for (key in media_events) {
        document._video.addEventListener(key, capture, false);
    }
    // properties are updated even if no event was triggered
}
document.addEventListener("DOMContentLoaded", init, false);

function resize() {
    document._video.width = document._video.videoWidth + 10;
    document._video.height = document._video.videoHeight + 10;
}

function getVideo() {
    return document._video;
}

function switchVideo(n) {
    if (n >= videos.length) n = 0;

    var mp4 = document.getElementById("mp4");
    var parent = mp4.parentNode;

    document._video.setAttribute("poster", videos[n][0]);
    mp4.setAttribute("src", videos[n][1]);

    if (videos[n][2]) {
        if (webm.parentNode == null) {
            parent.insertBefore(webm, mp4);
        }
        webm.setAttribute("src", videos[n][2]);
    } else {
        if (webm.parentNode != null) {
            parent.removeChild(webm);
        }
    }
    document._video.width = 0;
    document._video.height = 0;
    document._video.load();
}

// Audio control API -------------------------------

var $audioInLevel, $audioInSelect, $bufferSize, $cancel, $dateTime, $echoCancellation, $encoding, $encodingOption, $encodingProcess, $modalError, $modalLoading, $modalProgress, $record, $recording, $recordingList, $reportInterval, $testToneLevel, $timeDisplay, $timeLimit, BUFFER_SIZE, ENCODING_OPTION, MP3_BIT_RATE, OGG_KBPS, OGG_QUALITY, URL, audioContext, audioIn, audioInLevel, audioRecorder, defaultBufSz, disableControlsOnRecord, encodingProcess, iDefBufSz, minSecStr, mixer, onChangeAudioIn, onError, onGotAudioIn, onGotDevices, optionValue, plural, progressComplete, saveRecording, setProgress, startRecording, stopRecording, testTone, testToneLevel, updateBufferSizeText, updateDateTime;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var $ultimateRecord;

URL = window.URL || window.webkitURL;
audioContext = new AudioContext;

if (audioContext.createScriptProcessor == null) {
    audioContext.createScriptProcessor = audioContext.createJavaScriptNode;
}

$testToneLevel = $('#test-tone-level');
$audioInSelect = $('#audio-in-select');
$audioInLevel = $('#audio-in-level');
$echoCancellation = $('#echo-cancellation');
$timeLimit = $('#time-limit');
$encoding = $('input[name="encoding"]');
$encodingOption = $('#encoding-option');
$encodingProcess = $('input[name="encoding-process"]');
$reportInterval = $('#report-interval');
$bufferSize = $('#buffer-size');
$recording = $('#recording');
$timeDisplay = $('#time-display');
$record = $('#record');
$ultimateRecord = $('#ultimateRecord');
$cancel = $('#cancel');
$dateTime = $('#date-time');
$recordingList = $('#recording-list');
$modalLoading = $('#modal-loading');
$modalProgress = $('#modal-progress');
$modalError = $('#modal-error');

$audioInLevel.attr('disabled', false);
$audioInLevel[0].valueAsNumber = 0;

$testToneLevel.attr('disabled', false);
$testToneLevel[0].valueAsNumber = 0;

$timeLimit.attr('disabled', false);
$timeLimit[0].valueAsNumber = 3;

$encoding.attr('disabled', false);
$encoding[0].checked = true;

$encodingProcess.attr('disabled', false);
$encodingProcess[0].checked = true;

$reportInterval.attr('disabled', false);
$reportInterval[0].valueAsNumber = 1;

$bufferSize.attr('disabled', false);

testTone = (function () {
    var lfo, osc, oscMod, output;
    osc = audioContext.createOscillator();
    lfo = audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 2;
    oscMod = audioContext.createGain();
    osc.connect(oscMod);
    lfo.connect(oscMod.gain);
    output = audioContext.createGain();
    output.gain.value = 0.5;
    oscMod.connect(output);
    osc.resume();
    lfo.resume();
    osc.start();
    lfo.start();
    return output;
})();

testToneLevel = audioContext.createGain();
testToneLevel.gain.value = 0;
testTone.connect(testToneLevel);

audioInLevel = audioContext.createGain();
audioInLevel.gain.value = 0;

mixer = audioContext.createGain();
testToneLevel.connect(mixer);

audioIn = void 0;
audioInLevel.connect(mixer);
mixer.connect(audioContext.destination);

audioRecorder = new WebAudioRecorder(mixer, {
    workerDir: 'js/',
    onEncoderLoading: function (recorder, encoding) {
        $modalLoading.find('.modal-title').html("Loading " + (encoding.toUpperCase()) + " encoder ...");
        $modalLoading.modal('show');
    }
});

audioRecorder.onEncoderLoaded = function () {
    $modalLoading.modal('hide');
};

$testToneLevel.on('input', function () {
    var level;
    level = $testToneLevel[0].valueAsNumber / 100;
    testToneLevel.gain.value = level * level;
});

$audioInLevel.on('input', function () {
    var level;
    level = $audioInLevel[0].valueAsNumber / 100;
    audioInLevel.gain.value = level * level;
});

onGotDevices = function (devInfos) {
    var index, info, name, options, _i, _len;
    options = '<option value="no-input" selected>(No input)</option>';
    index = 0;
    for (_i = 0, _len = devInfos.length; _i < _len; _i++) {
        info = devInfos[_i];
        if (info.kind !== 'audioinput') {
            continue;
        }
        name = info.label || ("Audio in " + (++index));
        options += "<option value=" + info.deviceId + ">" + name + "</option>";
    }
    $audioInSelect.html(options);
};

onError = function (msg) {
    $modalError.find('.alert').html(msg);
    $modalError.modal('show');
};

if ((navigator.mediaDevices != null) && (navigator.mediaDevices.enumerateDevices != null)) {
    navigator.mediaDevices.enumerateDevices().then(onGotDevices)["catch"](function (err) {
        return onError("Could not enumerate audio devices: " + err);
    });
} else {
    $audioInSelect.html('<option value="no-input" selected>(No input)</option><option value="default-audio-input">Default audio input</option>');
}

onGotAudioIn = function (stream) {
    if (audioIn != null) {
        audioIn.disconnect();
    }
    audioIn = audioContext.createMediaStreamSource(stream);
    audioIn.connect(audioInLevel);
    return $audioInLevel.removeClass('hidden');
};

onChangeAudioIn = function () {
    var constraint, deviceId;
    deviceId = $audioInSelect[0].value;
    if (deviceId === 'no-input') {
        if (audioIn != null) {
            audioIn.disconnect();
        }
        audioIn = void 0;
        $audioInLevel.addClass('hidden');
    } else {
        if (deviceId === 'default-audio-input') {
            deviceId = void 0;
        }
        if (navigator.webkitGetUserMedia !== undefined) {
            constraint = {
                video: false,
                audio: {
                    optional: [
                        {sourceId:deviceId},
                        {googAutoGainControl: false},
                        {googAutoGainControl2: false},
                        {echoCancellation: false},
                        {googEchoCancellation: false},
                        {googEchoCancellation2: false},
                        {googDAEchoCancellation: false},
                        {googNoiseSuppression: false},
                        {googNoiseSuppression2: false},
                        {googHighpassFilter: false},
                        {googTypingNoiseDetection: false},
                        {googAudioMirroring: false}
                    ]
                }
            }
        }
        else if (navigator.mozGetUserMedia !== undefined) {
            constraint = {
                video: false,
                audio: {
                    deviceId: deviceId ? { exact: deviceId } : void 0,
                    echoCancellation: false,
                    mozAutoGainControl: false
                    //mozNoiseSuppression: false
                }
            }
        
        }
        else {
            constraint = {
                video: false,
                audio: {
                    deviceId: deviceId ? {exact: deviceId} : void 0,
                    echoCancellation: false
                }
            }
        }
        // constraint = {
        //     audio: {
        //         deviceId: deviceId != null ? {
        //             exact: deviceId
        //         } : void 0,
        //         mandatory: {
        //             echoCancellation: $echoCancellation[0].checked
        //         }
        //     }
        // };
        if ((navigator.mediaDevices != null) && (navigator.mediaDevices.getUserMedia != null)) {
            navigator.mediaDevices.getUserMedia(constraint).then(onGotAudioIn)["catch"](function (err) {
                return onError("Could not get audio media device: " + err);
            });
        } else {
            navigator.getUserMedia(constraint, onGotAudioIn, function () {
                return onError("Could not get audio media device: " + err);
            });
        }
    }
};

$audioInSelect.on('change', onChangeAudioIn);
$echoCancellation.on('change', onChangeAudioIn);

plural = function (n) {
    if (n > 1) {
        return 's';
    } else {
        return '';
    }
};

$timeLimit.on('input', function () {
    var min;
    min = $timeLimit[0].valueAsNumber;
    $('#time-limit-text').html("" + min + " minute" + (plural(min)));
});

OGG_QUALITY = [-0.1, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
OGG_KBPS = [45, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 500];
MP3_BIT_RATE = [64, 80, 96, 112, 128, 160, 192, 224, 256, 320];

ENCODING_OPTION = {
    wav: {
        label: '',
        hidden: true,
        max: 1,
        text: function (val) {
            return '';
        }
    },
    ogg: {
        label: 'Quality',
        hidden: false,
        max: OGG_QUALITY.length - 1,
        text: function (val) {
            return "" + (OGG_QUALITY[val].toFixed(1)) + " (~" + OGG_KBPS[val] + "kbps)";
        }
    },
    mp3: {
        label: 'Bit rate',
        hidden: false,
        max: MP3_BIT_RATE.length - 1,
        text: function (val) {
            return "" + MP3_BIT_RATE[val] + "kbps";
        }
    }
};

optionValue = {
    wav: null,
    ogg: 6,
    mp3: 5
};

$encoding.on('click', function (event) {
    var encoding, option;
    encoding = $(event.target).attr('encoding');
    audioRecorder.setEncoding(encoding);
    option = ENCODING_OPTION[encoding];
    $('#encoding-option-label').html(option.label);
    $('#encoding-option-text').html(option.text(optionValue[encoding]));
    $encodingOption.toggleClass('hidden', option.hidden).attr('max', option.max);
    $encodingOption[0].valueAsNumber = optionValue[encoding];
});

$encodingOption.on('input', function () {
    var encoding, option;
    encoding = audioRecorder.encoding;
    option = ENCODING_OPTION[encoding];
    optionValue[encoding] = $encodingOption[0].valueAsNumber;
    $('#encoding-option-text').html(option.text(optionValue[encoding]));
});

encodingProcess = 'background';

$encodingProcess.on('click', function (event) {
    var hidden;
    encodingProcess = $(event.target).attr('mode');
    hidden = encodingProcess === 'background';
    $('#report-interval-label').toggleClass('hidden', hidden);
    $reportInterval.toggleClass('hidden', hidden);
    $('#report-interval-text').toggleClass('hidden', hidden);
});

$reportInterval.on('input', function () {
    var sec;
    sec = $reportInterval[0].valueAsNumber;
    $('#report-interval-text').html("" + sec + " second" + (plural(sec)));
});

defaultBufSz = (function () {
    var processor;
    processor = audioContext.createScriptProcessor(void 0, 2, 2);
    return processor.bufferSize;
})();

BUFFER_SIZE = [256, 512, 1024, 2048, 4096, 8192, 16384];

iDefBufSz = BUFFER_SIZE.indexOf(defaultBufSz);

updateBufferSizeText = function () {
    var iBufSz, text;
    iBufSz = $bufferSize[0].valueAsNumber;
    text = "" + BUFFER_SIZE[iBufSz];
    if (iBufSz === iDefBufSz) {
        text += ' (browser default)';
    }
    $('#buffer-size-text').html(text);
};

$bufferSize.on('input', updateBufferSizeText);
$bufferSize[0].valueAsNumber = iDefBufSz;

updateBufferSizeText();

saveRecording = function (blob, enc) {
    var html, time, url;
    time = new Date();
    url = URL.createObjectURL(blob);
    html = ("<p recording='" + url + "'>") + ("<audio controls src='" + url + "'></audio> ") + ("(" + enc + ") " + (time.toString()) + " ") + ("<a class='btn btn-default' href='" + url + "' download='recording." + enc + "'>") + "Save..." + "</a> " + ("<button class='btn btn-danger' recording='" + url + "'>Delete</button>");
    "</p>";
    $recordingList.prepend($(html));
};

$recordingList.on('click', 'button', function (event) {
    var url;
    url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
});

minSecStr = function (n) {
    return (n < 10 ? "0" : "") + n;
};

updateDateTime = function () {
    var sec;
    $dateTime.html((new Date).toString());
    sec = audioRecorder.recordingTime() | 0;
    $timeDisplay.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));
};

window.setInterval(updateDateTime, 200);

progressComplete = false;

setProgress = function (progress) {
    var percent;
    percent = "" + ((progress * 100).toFixed(1)) + "%";
    $modalProgress.find('.progress-bar').attr('style', "width: " + percent + ";");
    $modalProgress.find('.text-center').html(percent);
    progressComplete = progress === 1;
};

$modalProgress.on('hide.bs.modal', function () {
    if (!progressComplete) {
        audioRecorder.cancelEncoding();
    }
});

disableControlsOnRecord = function (disabled) {
    $audioInSelect.attr('disabled', disabled);
    $echoCancellation.attr('disabled', disabled);
    $timeLimit.attr('disabled', disabled);
    $encoding.attr('disabled', disabled);
    $encodingOption.attr('disabled', disabled);
    $encodingProcess.attr('disabled', disabled);
    $reportInterval.attr('disabled', disabled);
    $bufferSize.attr('disabled', disabled);
};

startRecording = function () {
    $recording.removeClass('hidden');
    $record.html('STOP');
    $cancel.removeClass('hidden');
    disableControlsOnRecord(true);
    audioRecorder.setOptions({
        timeLimit: $timeLimit[0].valueAsNumber * 60,
        encodeAfterRecord: encodingProcess === 'separate',
        progressInterval: $reportInterval[0].valueAsNumber * 1000,
        ogg: {
            quality: OGG_QUALITY[optionValue.ogg]
        },
        mp3: {
            bitRate: MP3_BIT_RATE[optionValue.mp3]
        }
    });
    audioRecorder.startRecording();
    setProgress(0);
};

stopRecording = function (finish) {
    $recording.addClass('hidden');
    $record.html('RECORD');
    $cancel.addClass('hidden');
    disableControlsOnRecord(false);
    if (finish) {
        audioRecorder.finishRecording();
        if (audioRecorder.options.encodeAfterRecord) {
            $modalProgress.find('.modal-title').html("Encoding " + (audioRecorder.encoding.toUpperCase()));
            $modalProgress.modal('show');
        }
    } else {
        audioRecorder.cancelRecording();
    }
};

$record.on('click', function () {
    if (audioRecorder.isRecording()) {
        stopRecording(true);
    } else {
        startRecording();
    }
});

$cancel.on('click', function () {
    stopRecording(false);
});

audioRecorder.onTimeout = function (recorder) {
    stopRecording(true);
};

audioRecorder.onEncodingProgress = function (recorder, progress) {
    setProgress(progress);
};

audioRecorder.onComplete = function (recorder, blob) {
    if (recorder.options.encodeAfterRecord) {
        $modalProgress.modal('hide');
    }
    saveRecording(blob, recorder.encoding);
};

audioRecorder.onError = function (recorder, message) {
    onError(message);
};


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


$ultimateRecord.on('click', function () {
    audioContext.resume();
    if (audioRecorder.isRecording()) {
        stopRecording(true);
        getVideo().pause();
        var recDiv = document.getElementById("recording-list");
        var outDiv = recDiv.getElementsByTagName("audio");
        for (i = 0; i < outDiv.length; i++) {
            var audio = outDiv[i];
            audio.pause();
        }
    } else {
        startRecording();
        getVideo().currentTime = 0;
        getVideo().play();
        getVideo().muted = true;
        var recDiv = document.getElementById("recording-list");
        var outDiv = recDiv.getElementsByTagName("audio");
        for (i = 0; i < outDiv.length; i++) {
            var audio = outDiv[i];
            audio.currentTime = 0;
            audio.play();
        }
    }
});

