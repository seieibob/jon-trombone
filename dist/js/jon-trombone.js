(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GUI = exports.GUI = function () {
    function GUI() {
        _classCallCheck(this, GUI);
    }

    _createClass(GUI, null, [{
        key: "Init",


        /**
         * Creates and attaches a GUI to the page if DAT.GUI is included.
         */
        value: function Init(controller) {
            if (typeof dat === "undefined") {
                console.warn("No DAT.GUI instance found. Import on the page to use!");
                return;
            }

            var gui = new dat.GUI();

            var jon = controller;

            gui.add(jon.trombone, 'ToggleMute');

            var jonGUI = gui.addFolder("Jon");
            jonGUI.add(jon, "moveJaw").listen();
            jonGUI.add(jon, "jawFlapSpeed").min(0).max(100);
            jonGUI.add(jon, "jawOpenOffset").min(0).max(1);

            var voiceGUI = gui.addFolder("Voice");
            voiceGUI.add(jon.trombone, 'autoWobble');
            voiceGUI.add(jon.trombone.Glottis, 'addPitchVariance').listen();
            voiceGUI.add(jon.trombone.Glottis, 'addTensenessVariance').listen();
            voiceGUI.add(jon.trombone.Glottis, 'UITenseness').min(0).max(1);
            voiceGUI.add(jon.trombone.Glottis, 'vibratoAmount').min(0).max(0.5);
            voiceGUI.add(jon.trombone.Glottis, 'UIFrequency').min(1).max(1000).listen();
            voiceGUI.add(jon.trombone.Glottis, 'loudness').min(0).max(1).listen();

            var tractGUI = gui.addFolder("Tract");
            tractGUI.add(jon.trombone.Tract, 'movementSpeed').min(1).max(30).step(1);
            tractGUI.add(jon.trombone.Tract, 'velumTarget').min(0.001).max(2);
            tractGUI.add(jon.trombone.TractUI, 'target').min(0.001).max(1);
            tractGUI.add(jon.trombone.TractUI, 'index').min(0).max(43).step(1);
            tractGUI.add(jon.trombone.TractUI, 'radius').min(0).max(5).step(1);

            var songGUI = gui.addFolder("midi");
            songGUI.add(jon.midiController, 'PlaySong');
            songGUI.add(jon.midiController, 'Stop');
            songGUI.add(jon.midiController, 'Restart');
            songGUI.add(jon.midiController, 'currentTrack').min(0).max(20).step(1).listen();
            songGUI.add(jon.midiController, 'baseFreq').min(1).max(2000);
            songGUI.add(jon, 'flapWhileSinging');
            songGUI.add(jon, 'legato').listen();
        }
    }]);

    return GUI;
}();

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JonTrombone = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _modelLoader = require("./utils/model-loader.js");

var _pinkTrombone = require("./pink-trombone/pink-trombone.js");

var _midiController = require("./midi/midi-controller.js");

var _midiDropArea = require("./midi/midi-drop-area.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JonTrombone = function () {
    function JonTrombone(container) {
        var _this = this;

        _classCallCheck(this, JonTrombone);

        this.container = container;
        this.container.style.position = "relative";
        this.container.style.cursor = "default";

        // Set up renderer and embed in container
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Set up scene and view
        var aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.scene = new THREE.Scene();

        // Export scene for three js inspector
        //window.scene = this.scene;

        // Set up clock for timing
        this.clock = new THREE.Clock();

        var startDelayMS = 1000;
        this.trombone = new _pinkTrombone.PinkTrombone(this);
        setTimeout(function () {
            _this.trombone.StartAudio();
            //this.trombone.SetMute(true);
            _this.moveJaw = true;
        }, startDelayMS);

        // Mute button for trombone
        // let button = document.createElement("button");
        // button.innerHTML = "Mute";
        // button.style.cssText = "position: absolute; display: block; top: 0; left: 0;";
        // this.container.appendChild(button);
        // button.addEventListener ("click", () => {
        //     this.trombone.ToggleMute();
        //     button.innerHTML = this.trombone.muted ? "Unmute" : "Mute";
        // });

        this.jawFlapSpeed = 20.0;
        this.jawOpenOffset = 0.19;
        this.moveJaw = false;
        this.legato = false;
        this.flapWhileSinging = false;

        this.midiController = new _midiController.MidiController(this);
        var dropArea = new _midiDropArea.MidiDropArea(this);

        this.SetUpThree();
        this.SetUpScene();

        // Start the update loop
        this.OnUpdate();
    }

    /**
     * Set up non-scene config for Three.js
     */


    _createClass(JonTrombone, [{
        key: "SetUpThree",
        value: function SetUpThree() {
            if (THREE.OrbitControls !== undefined) {
                // Add orbit controls
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.target.set(0, 0, 0);
                this.controls.update();
            } else {
                console.warn("No THREE.OrbitControls detected. Include to allow interaction with the model.");
            }
        }

        /**
         * Populates and configures objects within the scene.
         */

    }, {
        key: "SetUpScene",
        value: function SetUpScene() {
            var _this2 = this;

            // Set camera position
            this.camera.position.set(0, 0, 0.5);

            // Lights
            var light1 = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
            light1.name = "Hemisphere Light";
            light1.position.set(0, 1, 0);
            this.scene.add(light1);

            var light2 = new THREE.DirectionalLight(0xffffff, 1.0);
            light2.name = "Directional Light";
            light2.position.set(0, 1, 0);
            this.scene.add(light2);

            // Load the Jon model and place it in the scene
            _modelLoader.ModelLoader.LoadJSON("../resources/jon/three/jon.json", function (object) {
                _this2.jon = object;
                _this2.scene.add(_this2.jon);
                _this2.jon.rotation.y = THREE.Math.degToRad(15);

                _this2.jaw = _this2.jon.skeleton.bones.find(function (obj) {
                    return obj.name == "Bone.006";
                });
                if (_this2.jaw) {
                    _this2.jawShutZ = _this2.jaw.position.z;
                }
            });
        }

        /**
         * Called every frame. Continues indefinitely after being called once.
         */

    }, {
        key: "OnUpdate",
        value: function OnUpdate() {
            var deltaTime = this.clock.getDelta();
            requestAnimationFrame(this.OnUpdate.bind(this));

            if (this.midiController.playing) {

                this.notes = this.midiController.GetPitches();
                if (this.notes != this.lastNotes) {
                    // Do the note
                    if (this.notes !== undefined && this.notes.length != 0) {
                        // Note on
                        // Play frequency
                        var note = this.notes[0];
                        if (this.notes.length > 1) {
                            //console.log ("chord");
                        }
                        var freq = this.midiController.MIDIToFrequency(note.midi);
                        //console.log(freq);
                        this.trombone.Glottis.UIFrequency = freq;
                        this.trombone.Glottis.loudness = note.velocity;
                        // Open jaw
                        this.jaw.position.z = this.jawShutZ + this.jawOpenOffset;
                        this.trombone.TractUI.SetLipsClosed(0);
                    } else {
                        // Note off
                        if (!this.legato) this.trombone.Glottis.loudness = 0;
                        // Close jaw
                        this.jaw.position.z = this.jawShutZ;
                        this.trombone.TractUI.SetLipsClosed(1);
                    }

                    this.lastNotes = this.notes;
                }
            }

            if (this.jaw && this.moveJaw && (!this.midiController.playing || this.flapWhileSinging)) {
                var time = this.clock.getElapsedTime(); // % 60;

                // Move the jaw
                var percent = (Math.sin(time * this.jawFlapSpeed) + 1.0) / 2.0;
                this.jaw.position.z = this.jawShutZ + percent * this.jawOpenOffset;

                // Make the audio match the jaw position
                this.trombone.TractUI.SetLipsClosed(1.0 - percent);
            }

            // Render
            this.renderer.render(this.scene, this.camera);
        }
    }]);

    return JonTrombone;
}();

exports.JonTrombone = JonTrombone;

},{"./midi/midi-controller.js":4,"./midi/midi-drop-area.js":5,"./pink-trombone/pink-trombone.js":12,"./utils/model-loader.js":13}],3:[function(require,module,exports){
"use strict";

var _webglDetect = require("./utils/webgl-detect.js");

var _jonTrombone = require("./jon-trombone.js");

var _gui = require("./gui.js");

// Optionally bundle three.js as part of the project
//import THREELib from "three-js";
//var THREE = THREELib(); // return THREE JS

var container = document.getElementById("jon-trombone-container");

if (!_webglDetect.Detector.HasWebGL()) {
    //exit("WebGL is not supported on this browser.");
    console.log("WebGL is not supported on this browser.");
    container.innerHTML = _webglDetect.Detector.GetErrorHTML();
    container.classList.add("no-webgl");
} else {
    var jonTrombone = new _jonTrombone.JonTrombone(container);
    _gui.GUI.Init(jonTrombone);
}

},{"./gui.js":1,"./jon-trombone.js":2,"./utils/webgl-detect.js":14}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MidiConvert = require('midiconvert');

/**
 * Simple class for MIDI playback.
 * The paradigm here's a bit weird; it's up to an external
 * source to actually produce audio. This class just manages
 * a timer, which GetPitch() reads to produce the "current"
 * note information. 
 * 
 * As an example of usage, jon-trombone calls PlaySong() to
 * begin, and then every frame uses GetPitch() to figure out
 * what the current frequency to produce is.
 */

var MidiController = function () {
    function MidiController(controller) {
        _classCallCheck(this, MidiController);

        this.controller = controller;

        this.midi = null;

        this.playing = false;
        this.currentTrack = 5;

        this.baseFreq = 440; //110 is A4

        this.clock = new THREE.Clock(false);
    }

    /**
     * Loads and parses a MIDI file.
     */


    _createClass(MidiController, [{
        key: "LoadSong",
        value: function LoadSong(path, callback) {
            var _this = this;

            this.Stop();
            this.midi = null;
            MidiConvert.load(path, function (midi) {
                console.log("MIDI loaded.");
                _this.midi = midi;
                console.log(_this.midi);
                if (callback) callback(midi);
            });
        }
    }, {
        key: "LoadSongDirect",
        value: function LoadSongDirect(file) {
            this.Stop();
            this.midi = MidiConvert.parse(file);
            console.log("MIDI loaded.");
            console.log(this.midi);
        }

        /**
         * Gets the pitch for the specified track at the current time in the song.
         */

    }, {
        key: "GetPitch",
        value: function GetPitch() {
            var trackIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currentTrack;

            var time = this.GetSongProgress();

            // Constrain track specified to valid range
            trackIndex = Math.min(trackIndex, this.midi.tracks.length - 1);
            trackIndex = Math.max(trackIndex, 0);

            return this.midi.tracks[trackIndex].notes.find(function (item) {
                return item.noteOn <= time && time <= item.noteOff;
            });
        }
    }, {
        key: "GetPitches",
        value: function GetPitches() {
            var trackIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currentTrack;

            var time = this.GetSongProgress();

            // Constrain track specified to valid range
            trackIndex = Math.min(trackIndex, this.midi.tracks.length - 1);
            trackIndex = Math.max(trackIndex, 0);

            return this.midi.tracks[trackIndex].notes.filter(function (item) {
                return item.noteOn <= time && time <= item.noteOff;
            });
        }
    }, {
        key: "PlaySong",
        value: function PlaySong() {
            var _this2 = this;

            var track = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

            if (this.playing) {
                return;
            }

            // If no song is specified, load a song
            if (!this.midi) {
                console.log("No MIDI is loaded. Loading an example...");
                this.LoadSong('../resources/midi/un-owen-was-her.mid', function () {
                    _this2.PlaySong();
                });
                return;
            }

            // Turn off some stuff so the singing kind of sounds okay
            this.EnterSingMode();

            this.currentTrack = track;
            this.clock.start();
            this.playing = true;

            console.log("Playback started.");
        }
    }, {
        key: "GetSongProgress",
        value: function GetSongProgress() {
            return this.clock.getElapsedTime();
        }

        /**
         * Converts from a MIDI note code to its corresponding frequency.
         * @param {*} midiCode 
         */

    }, {
        key: "MIDIToFrequency",
        value: function MIDIToFrequency(midiCode) {
            return this.baseFreq * Math.pow(2, (midiCode - 69) / 12);
        }

        /**
         * Restarts the playback.
         */

    }, {
        key: "Restart",
        value: function Restart() {
            console.log("Playback moved to beginning.");
            this.clock = new THREE.Clock();
        }

        /**
         * Stops playback.
         */

    }, {
        key: "Stop",
        value: function Stop() {
            if (!this.playing) {
                return;
            }
            console.log("Playback stopped.");
            this.clock.stop();
            this.playing = false;
            this.ExitSingMode();
        }

        /**
         * Sets up the trombone for singing.
         */

    }, {
        key: "EnterSingMode",
        value: function EnterSingMode() {
            if (this.backup_settings) {
                return;
            }

            this.backup_settings = {};

            this.backup_settings["autoWobble"] = this.controller.trombone.autoWobble;
            this.controller.trombone.autoWobble = false;

            this.backup_settings["addPitchVariance"] = this.controller.trombone.Glottis.addPitchVariance;
            this.controller.trombone.Glottis.addPitchVariance = false;

            this.backup_settings["addTensenessVariance"] = this.controller.trombone.Glottis.addTensenessVariance;
            this.controller.trombone.Glottis.addTensenessVariance = false;

            this.backup_settings["vibratoFrequency"] = this.controller.trombone.Glottis.vibratoFrequency;
            this.controller.trombone.Glottis.vibratoFrequency = 0;

            this.backup_settings["frequency"] = this.controller.trombone.Glottis.UIFrequency;

            this.backup_settings["loudness"] = this.controller.trombone.Glottis.loudness;
        }

        /**
         * Restores the trombone to the state it was in before singing.
         */

    }, {
        key: "ExitSingMode",
        value: function ExitSingMode() {
            if (!this.backup_settings) {
                return;
            }

            this.controller.trombone.autoWobble = this.backup_settings["autoWobble"];
            this.controller.trombone.Glottis.addPitchVariance = this.backup_settings["addPitchVariance"];
            this.controller.trombone.Glottis.addTensenessVariance = this.backup_settings["addTensenessVariance"];
            this.controller.trombone.Glottis.vibratoFrequency = this.backup_settings["vibratoFrequency"];
            this.controller.trombone.Glottis.UIFrequency = this.backup_settings["frequency"];
            this.controller.trombone.Glottis.loudness = this.backup_settings["loudness"];

            this.backup_settings = null;
        }
    }]);

    return MidiController;
}();

exports.MidiController = MidiController;

},{"midiconvert":15}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Drop-in drag and drop support for the MidiController
 */
var MidiDropArea = exports.MidiDropArea = function () {
    function MidiDropArea(controller) {
        var _this = this;

        _classCallCheck(this, MidiDropArea);

        this.controller = controller;

        this.dropArea = document.createElement("div");

        this.dropArea.style.position = "absolute";
        this.dropArea.style.top = "0";
        this.dropArea.style.left = "0";
        this.dropArea.style.width = "100%";
        this.dropArea.style.height = "100%";

        this.MakeDroppable(this.dropArea, function (files) {
            //read the file
            var reader = new FileReader();
            reader.onload = function (e) {
                _this.controller.midiController.LoadSongDirect(reader.result);
            };
            reader.readAsBinaryString(files[0]);
        });

        this.controller.container.appendChild(this.dropArea);
    }

    _createClass(MidiDropArea, [{
        key: "Callback",
        value: function Callback() {
            console.log("Callback");
        }

        // From http://bitwiser.in/2015/08/08/creating-dropzone-for-drag-drop-file.html

    }, {
        key: "MakeDroppable",
        value: function MakeDroppable(element, callback) {

            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('multiple', true);
            input.style.display = 'none';

            input.addEventListener('change', triggerCallback);
            element.appendChild(input);

            element.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                element.classList.add('dragover');
            });

            element.addEventListener('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                element.classList.remove('dragover');
            });

            element.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                element.classList.remove('dragover');
                triggerCallback(e);
            });

            // element.addEventListener('click', function() {
            //     input.value = null;
            //     input.click();
            // });

            function triggerCallback(e) {
                var files;
                if (e.dataTransfer) {
                    files = e.dataTransfer.files;
                } else if (e.target) {
                    files = e.target.files;
                }
                callback.call(null, files);
            }
        }
    }]);

    return MidiDropArea;
}();

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioSystem = function () {
    function AudioSystem(trombone) {
        _classCallCheck(this, AudioSystem);

        this.trombone = trombone;

        this.blockLength = 512;
        this.blockTime = 1;
        this.soundOn = false;
    }

    _createClass(AudioSystem, [{
        key: "init",
        value: function init() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new window.AudioContext();
            this.trombone.sampleRate = this.audioContext.sampleRate;

            this.blockTime = this.blockLength / this.trombone.sampleRate;
        }
    }, {
        key: "startSound",
        value: function startSound() {
            //scriptProcessor may need a dummy input channel on iOS
            this.scriptProcessor = this.audioContext.createScriptProcessor(this.blockLength, 2, 1);
            this.scriptProcessor.connect(this.audioContext.destination);
            this.scriptProcessor.onaudioprocess = this.doScriptProcessor.bind(this);

            var whiteNoise = this.createWhiteNoiseNode(2 * this.trombone.sampleRate); // 2 seconds of noise

            var aspirateFilter = this.audioContext.createBiquadFilter();
            aspirateFilter.type = "bandpass";
            aspirateFilter.frequency.value = 500;
            aspirateFilter.Q.value = 0.5;
            whiteNoise.connect(aspirateFilter); // Use white noise as input for filter
            aspirateFilter.connect(this.scriptProcessor); // Use this as input 0 for script processor

            var fricativeFilter = this.audioContext.createBiquadFilter();
            fricativeFilter.type = "bandpass";
            fricativeFilter.frequency.value = 1000;
            fricativeFilter.Q.value = 0.5;
            whiteNoise.connect(fricativeFilter); // Use white noise as input
            fricativeFilter.connect(this.scriptProcessor); // Use this as input 1 for script processor

            whiteNoise.start(0);

            // Generate just white noise (test)
            // var wn = this.createWhiteNoiseNode(2*this.trombone.sampleRate);
            // wn.connect(this.audioContext.destination);
            // wn.start(0);
        }
    }, {
        key: "createWhiteNoiseNode",
        value: function createWhiteNoiseNode(frameCount) {
            var myArrayBuffer = this.audioContext.createBuffer(1, frameCount, this.trombone.sampleRate);

            var nowBuffering = myArrayBuffer.getChannelData(0);
            for (var i = 0; i < frameCount; i++) {
                nowBuffering[i] = Math.random(); // gaussian();
            }

            var source = this.audioContext.createBufferSource();
            source.buffer = myArrayBuffer;
            source.loop = true;

            return source;
        }

        // createNode() {
        //     let buffer = this.audioContext.createBuffer(1, frameCount, this.trombone.sampleRate);


        //     var source = this.audioContext.createBufferSource();
        //     source.buffer = buffer;
        //     source.loop = true;

        //     return source;
        // }


    }, {
        key: "doScriptProcessor",
        value: function doScriptProcessor(event) {
            var inputArray1 = event.inputBuffer.getChannelData(0); // Glottis input
            var inputArray2 = event.inputBuffer.getChannelData(1); // Tract input
            var outArray = event.outputBuffer.getChannelData(0); // Output (mono)
            for (var j = 0, N = outArray.length; j < N; j++) {
                var lambda1 = j / N;
                var lambda2 = (j + 0.5) / N;
                var glottalOutput = this.trombone.Glottis.runStep(lambda1, inputArray1[j]);

                var vocalOutput = 0;
                //Tract runs at twice the sample rate 
                this.trombone.Tract.runStep(glottalOutput, inputArray2[j], lambda1);
                vocalOutput += this.trombone.Tract.lipOutput + this.trombone.Tract.noseOutput;
                this.trombone.Tract.runStep(glottalOutput, inputArray2[j], lambda2);
                vocalOutput += this.trombone.Tract.lipOutput + this.trombone.Tract.noseOutput;
                outArray[j] = vocalOutput * 0.125;
            }
            // if(this.trombone.controller.notes !== undefined){
            //     for (var noteIndex = 1; noteIndex < this.trombone.controller.notes.length; noteIndex++){
            //         if(noteIndex > this.numVoices - 1) return;
            //         let note = this.trombone.controller.notes[noteIndex];
            //         //console.log(note);

            //     }
            // }
            this.trombone.Glottis.finishBlock();
            this.trombone.Tract.finishBlock();
        }
    }, {
        key: "mute",
        value: function mute() {
            this.scriptProcessor.disconnect();
        }
    }, {
        key: "unmute",
        value: function unmute() {
            this.scriptProcessor.connect(this.audioContext.destination);
        }
    }]);

    return AudioSystem;
}();

exports.AudioSystem = AudioSystem;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Glottis = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _noise = require("../noise.js");

var _noise2 = _interopRequireDefault(_noise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Glottis = function () {
    function Glottis(trombone) {
        _classCallCheck(this, Glottis);

        this.trombone = trombone;

        this.timeInWaveform = 0;
        this.oldFrequency = 140;
        this.newFrequency = 140;
        this.UIFrequency = 140;
        this.smoothFrequency = 140;
        this.oldTenseness = 0.6;
        this.newTenseness = 0.6;
        this.UITenseness = 0.6;
        this.totalTime = 0;
        this.vibratoAmount = 0.005;
        this.vibratoFrequency = 6;
        this.intensity = 0;
        this.loudness = 1;
        this.isTouched = false;
        this.touch = 0;
        this.x = 240;
        this.y = 530;

        this.keyboardTop = 500;
        this.keyboardLeft = 0;
        this.keyboardWidth = 600;
        this.keyboardHeight = 100;
        this.semitones = 20;
        this.marks = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
        this.baseNote = 87.3071; //F

        this.output;

        /// Allow pitch to wobble over time
        this.addPitchVariance = true;
        /// Allow tenseness to wobble over time
        this.addTensenessVariance = true;
    }

    _createClass(Glottis, [{
        key: "init",
        value: function init() {
            this.setupWaveform(0);
        }
    }, {
        key: "handleTouches",
        value: function handleTouches() {
            if (this.touch != 0 && !this.touch.alive) this.touch = 0;

            if (this.touch == 0) {
                for (var j = 0; j < UI.touchesWithMouse.length; j++) {
                    var touch = UI.touchesWithMouse[j];
                    if (!touch.alive) continue;
                    if (touch.y < this.keyboardTop) continue;
                    this.touch = touch;
                }
            }

            if (this.touch != 0) {
                var local_y = this.touch.y - this.keyboardTop - 10;
                var local_x = this.touch.x - this.keyboardLeft;
                local_y = Math.clamp(local_y, 0, this.keyboardHeight - 26);
                var semitone = this.semitones * local_x / this.keyboardWidth + 0.5;
                Glottis.UIFrequency = this.baseNote * Math.pow(2, semitone / 12);
                if (Glottis.intensity == 0) Glottis.smoothFrequency = Glottis.UIFrequency;
                //Glottis.UIRd = 3*local_y / (this.keyboardHeight-20);
                var t = Math.clamp(1 - local_y / (this.keyboardHeight - 28), 0, 1);
                Glottis.UITenseness = 1 - Math.cos(t * Math.PI * 0.5);
                Glottis.loudness = Math.pow(Glottis.UITenseness, 0.25);
                this.x = this.touch.x;
                this.y = local_y + this.keyboardTop + 10;
            }
            Glottis.isTouched = this.touch != 0;
        }
    }, {
        key: "runStep",
        value: function runStep(lambda, noiseSource) {
            var timeStep = 1.0 / this.trombone.sampleRate;
            this.timeInWaveform += timeStep;
            this.totalTime += timeStep;
            if (this.timeInWaveform > this.waveformLength) {
                this.timeInWaveform -= this.waveformLength;
                this.setupWaveform(lambda);
            }
            var out = this.normalizedLFWaveform(this.timeInWaveform / this.waveformLength);
            var aspiration = this.intensity * (1.0 - Math.sqrt(this.UITenseness)) * this.getNoiseModulator() * noiseSource;
            aspiration *= 0.2 + 0.02 * _noise2.default.simplex1(this.totalTime * 1.99);
            out += aspiration;
            return out;
        }
    }, {
        key: "getNoiseModulator",
        value: function getNoiseModulator() {
            var voiced = 0.1 + 0.2 * Math.max(0, Math.sin(Math.PI * 2 * this.timeInWaveform / this.waveformLength));
            //return 0.3;
            return this.UITenseness * this.intensity * voiced + (1 - this.UITenseness * this.intensity) * 0.3;
        }
    }, {
        key: "finishBlock",
        value: function finishBlock() {
            var vibrato = 0;
            if (this.addPitchVariance) {
                // Add small imperfections to the vocal output
                vibrato += this.vibratoAmount * Math.sin(2 * Math.PI * this.totalTime * this.vibratoFrequency);
                vibrato += 0.02 * _noise2.default.simplex1(this.totalTime * 4.07);
                vibrato += 0.04 * _noise2.default.simplex1(this.totalTime * 2.15);
            }

            if (this.trombone.autoWobble) {
                vibrato += 0.2 * _noise2.default.simplex1(this.totalTime * 0.98);
                vibrato += 0.4 * _noise2.default.simplex1(this.totalTime * 0.5);
            }

            if (this.UIFrequency > this.smoothFrequency) this.smoothFrequency = Math.min(this.smoothFrequency * 1.1, this.UIFrequency);
            if (this.UIFrequency < this.smoothFrequency) this.smoothFrequency = Math.max(this.smoothFrequency / 1.1, this.UIFrequency);
            this.oldFrequency = this.newFrequency;
            this.newFrequency = this.smoothFrequency * (1 + vibrato);
            this.oldTenseness = this.newTenseness;

            if (this.addTensenessVariance) this.newTenseness = this.UITenseness + 0.1 * _noise2.default.simplex1(this.totalTime * 0.46) + 0.05 * _noise2.default.simplex1(this.totalTime * 0.36);else this.newTenseness = this.UITenseness;

            if (!this.isTouched && this.trombone.alwaysVoice) this.newTenseness += (3 - this.UITenseness) * (1 - this.intensity);

            if (this.isTouched || this.trombone.alwaysVoice) this.intensity += 0.13;
            this.intensity = Math.clamp(this.intensity, 0, 1);
        }
    }, {
        key: "setupWaveform",
        value: function setupWaveform(lambda) {
            this.frequency = this.oldFrequency * (1 - lambda) + this.newFrequency * lambda;
            var tenseness = this.oldTenseness * (1 - lambda) + this.newTenseness * lambda;
            this.Rd = 3 * (1 - tenseness);
            this.waveformLength = 1.0 / this.frequency;

            var Rd = this.Rd;
            if (Rd < 0.5) Rd = 0.5;
            if (Rd > 2.7) Rd = 2.7;
            // normalized to time = 1, Ee = 1
            var Ra = -0.01 + 0.048 * Rd;
            var Rk = 0.224 + 0.118 * Rd;
            var Rg = Rk / 4 * (0.5 + 1.2 * Rk) / (0.11 * Rd - Ra * (0.5 + 1.2 * Rk));

            var Ta = Ra;
            var Tp = 1 / (2 * Rg);
            var Te = Tp + Tp * Rk; //

            var epsilon = 1 / Ta;
            var shift = Math.exp(-epsilon * (1 - Te));
            var Delta = 1 - shift; //divide by this to scale RHS

            var RHSIntegral = 1 / epsilon * (shift - 1) + (1 - Te) * shift;
            RHSIntegral = RHSIntegral / Delta;

            var totalLowerIntegral = -(Te - Tp) / 2 + RHSIntegral;
            var totalUpperIntegral = -totalLowerIntegral;

            var omega = Math.PI / Tp;
            var s = Math.sin(omega * Te);
            var y = -Math.PI * s * totalUpperIntegral / (Tp * 2);
            var z = Math.log(y);
            var alpha = z / (Tp / 2 - Te);
            var E0 = -1 / (s * Math.exp(alpha * Te));
            this.alpha = alpha;
            this.E0 = E0;
            this.epsilon = epsilon;
            this.shift = shift;
            this.Delta = Delta;
            this.Te = Te;
            this.omega = omega;
        }
    }, {
        key: "normalizedLFWaveform",
        value: function normalizedLFWaveform(t) {
            if (t > this.Te) this.output = (-Math.exp(-this.epsilon * (t - this.Te)) + this.shift) / this.Delta;else this.output = this.E0 * Math.exp(this.alpha * t) * Math.sin(this.omega * t);

            return this.output * this.intensity * this.loudness;
        }
    }]);

    return Glottis;
}();

exports.Glottis = Glottis;

},{"../noise.js":11}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TractUI = function () {
    function TractUI(trombone) {
        _classCallCheck(this, TractUI);

        this.trombone = trombone;

        this.originX = 340;
        this.originY = 449;
        this.radius = 298;
        this.scale = 60;
        this.tongueIndex = 12.9;
        this.tongueDiameter = 2.43;
        this.innerTongueControlRadius = 2.05;
        this.outerTongueControlRadius = 3.5;
        this.tongueTouch = 0;
        this.angleScale = 0.64;
        this.angleOffset = -0.24;
        this.noseOffset = 0.8;
        this.gridOffset = 1.7;

        /// Final openness of the mouth (closer to 0 is more closed)
        this.target = 0.1;
        /// Index in the throat array to move to target
        this.index = 42;
        /// Number of throat segments to close around the index
        this.radius = 0;
    }

    _createClass(TractUI, [{
        key: "init",
        value: function init() {
            var Tract = this.trombone.Tract;

            this.setRestDiameter();
            for (var i = 0; i < Tract.n; i++) {
                Tract.diameter[i] = Tract.targetDiameter[i] = Tract.restDiameter[i];
            }

            this.tongueLowerIndexBound = Tract.bladeStart + 2;
            this.tongueUpperIndexBound = Tract.tipStart - 3;
            this.tongueIndexCentre = 0.5 * (this.tongueLowerIndexBound + this.tongueUpperIndexBound);
        }
    }, {
        key: "getIndex",
        value: function getIndex(x, y) {
            var Tract = this.trombone.Tract;

            var xx = x - this.originX;var yy = y - this.originY;
            var angle = Math.atan2(yy, xx);
            while (angle > 0) {
                angle -= 2 * Math.PI;
            }return (Math.PI + angle - this.angleOffset) * (Tract.lipStart - 1) / (this.angleScale * Math.PI);
        }
    }, {
        key: "getDiameter",
        value: function getDiameter(x, y) {
            var xx = x - this.originX;var yy = y - this.originY;
            return (this.radius - Math.sqrt(xx * xx + yy * yy)) / this.scale;
        }
    }, {
        key: "setRestDiameter",
        value: function setRestDiameter() {
            var Tract = this.trombone.Tract;

            for (var i = Tract.bladeStart; i < Tract.lipStart; i++) {
                var t = 1.1 * Math.PI * (this.tongueIndex - i) / (Tract.tipStart - Tract.bladeStart);
                var fixedTongueDiameter = 2 + (this.tongueDiameter - 2) / 1.5;
                var curve = (1.5 - fixedTongueDiameter + this.gridOffset) * Math.cos(t);
                if (i == Tract.bladeStart - 2 || i == Tract.lipStart - 1) curve *= 0.8;
                if (i == Tract.bladeStart || i == Tract.lipStart - 2) curve *= 0.94;
                Tract.restDiameter[i] = 1.5 - curve;
            }
        }

        /**
         * Sets the lips of the modeled tract to be closed by the specified amount.
         * @param {number} progress Percentage closed (number between 0 and 1)
         */

    }, {
        key: "SetLipsClosed",
        value: function SetLipsClosed(progress) {

            var Tract = this.trombone.Tract;

            this.setRestDiameter();
            for (var i = 0; i < Tract.n; i++) {
                Tract.targetDiameter[i] = Tract.restDiameter[i];
            } // Disable this behavior if the mouth is closed a certain amount
            //if (progress > 0.8 || progress < 0.1) return;

            for (var _i = this.index - this.radius; _i <= this.index + this.radius; _i++) {
                if (_i > Tract.targetDiameter.length || _i < 0) continue;
                var interp = Math.lerp(Tract.restDiameter[_i], this.target, progress);
                Tract.targetDiameter[_i] = interp;
            }
        }
    }]);

    return TractUI;
}();

exports.TractUI = TractUI;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tract = function () {
    function Tract(trombone) {
        _classCallCheck(this, Tract);

        this.trombone = trombone;

        this.n = 44;
        this.bladeStart = 10;
        this.tipStart = 32;
        this.lipStart = 39;
        this.R = []; //component going right
        this.L = []; //component going left
        this.reflection = [];
        this.junctionOutputR = [];
        this.junctionOutputL = [];
        this.maxAmplitude = [];
        this.diameter = [];
        this.restDiameter = [];
        this.targetDiameter = [];
        this.newDiameter = [];
        this.A = [];
        this.glottalReflection = 0.75;
        this.lipReflection = -0.85;
        this.lastObstruction = -1;
        this.fade = 1.0; //0.9999,
        this.movementSpeed = 15; //cm per second
        this.transients = [];
        this.lipOutput = 0;
        this.noseOutput = 0;
        this.velumTarget = 0.01;
    }

    _createClass(Tract, [{
        key: "init",
        value: function init() {
            this.bladeStart = Math.floor(this.bladeStart * this.n / 44);
            this.tipStart = Math.floor(this.tipStart * this.n / 44);
            this.lipStart = Math.floor(this.lipStart * this.n / 44);
            this.diameter = new Float64Array(this.n);
            this.restDiameter = new Float64Array(this.n);
            this.targetDiameter = new Float64Array(this.n);
            this.newDiameter = new Float64Array(this.n);
            for (var i = 0; i < this.n; i++) {
                var diameter = 0;
                if (i < 7 * this.n / 44 - 0.5) diameter = 0.6;else if (i < 12 * this.n / 44) diameter = 1.1;else diameter = 1.5;
                this.diameter[i] = this.restDiameter[i] = this.targetDiameter[i] = this.newDiameter[i] = diameter;
            }
            this.R = new Float64Array(this.n);
            this.L = new Float64Array(this.n);
            this.reflection = new Float64Array(this.n + 1);
            this.newReflection = new Float64Array(this.n + 1);
            this.junctionOutputR = new Float64Array(this.n + 1);
            this.junctionOutputL = new Float64Array(this.n + 1);
            this.A = new Float64Array(this.n);
            this.maxAmplitude = new Float64Array(this.n);

            this.noseLength = Math.floor(28 * this.n / 44);
            this.noseStart = this.n - this.noseLength + 1;
            this.noseR = new Float64Array(this.noseLength);
            this.noseL = new Float64Array(this.noseLength);
            this.noseJunctionOutputR = new Float64Array(this.noseLength + 1);
            this.noseJunctionOutputL = new Float64Array(this.noseLength + 1);
            this.noseReflection = new Float64Array(this.noseLength + 1);
            this.noseDiameter = new Float64Array(this.noseLength);
            this.noseA = new Float64Array(this.noseLength);
            this.noseMaxAmplitude = new Float64Array(this.noseLength);
            for (var i = 0; i < this.noseLength; i++) {
                var diameter;
                var d = 2 * (i / this.noseLength);
                if (d < 1) diameter = 0.4 + 1.6 * d;else diameter = 0.5 + 1.5 * (2 - d);
                diameter = Math.min(diameter, 1.9);
                this.noseDiameter[i] = diameter;
            }
            this.newReflectionLeft = this.newReflectionRight = this.newReflectionNose = 0;
            this.calculateReflections();
            this.calculateNoseReflections();
            this.noseDiameter[0] = this.velumTarget;
        }
    }, {
        key: "reshapeTract",
        value: function reshapeTract(deltaTime) {
            var amount = deltaTime * this.movementSpeed;;
            var newLastObstruction = -1;
            for (var i = 0; i < this.n; i++) {
                var diameter = this.diameter[i];
                var targetDiameter = this.targetDiameter[i];
                if (diameter <= 0) newLastObstruction = i;
                var slowReturn;
                if (i < this.noseStart) slowReturn = 0.6;else if (i >= this.tipStart) slowReturn = 1.0;else slowReturn = 0.6 + 0.4 * (i - this.noseStart) / (this.tipStart - this.noseStart);
                this.diameter[i] = Math.moveTowards(diameter, targetDiameter, slowReturn * amount, 2 * amount);
            }
            if (this.lastObstruction > -1 && newLastObstruction == -1 && this.noseA[0] < 0.05) {
                this.addTransient(this.lastObstruction);
            }
            this.lastObstruction = newLastObstruction;

            amount = deltaTime * this.movementSpeed;
            this.noseDiameter[0] = Math.moveTowards(this.noseDiameter[0], this.velumTarget, amount * 0.25, amount * 0.1);
            this.noseA[0] = this.noseDiameter[0] * this.noseDiameter[0];
        }
    }, {
        key: "calculateReflections",
        value: function calculateReflections() {
            for (var i = 0; i < this.n; i++) {
                this.A[i] = this.diameter[i] * this.diameter[i]; //ignoring PI etc.
            }
            for (var i = 1; i < this.n; i++) {
                this.reflection[i] = this.newReflection[i];
                if (this.A[i] == 0) this.newReflection[i] = 0.999; //to prevent some bad behaviour if 0
                else this.newReflection[i] = (this.A[i - 1] - this.A[i]) / (this.A[i - 1] + this.A[i]);
            }

            //now at junction with nose

            this.reflectionLeft = this.newReflectionLeft;
            this.reflectionRight = this.newReflectionRight;
            this.reflectionNose = this.newReflectionNose;
            var sum = this.A[this.noseStart] + this.A[this.noseStart + 1] + this.noseA[0];
            this.newReflectionLeft = (2 * this.A[this.noseStart] - sum) / sum;
            this.newReflectionRight = (2 * this.A[this.noseStart + 1] - sum) / sum;
            this.newReflectionNose = (2 * this.noseA[0] - sum) / sum;
        }
    }, {
        key: "calculateNoseReflections",
        value: function calculateNoseReflections() {
            for (var i = 0; i < this.noseLength; i++) {
                this.noseA[i] = this.noseDiameter[i] * this.noseDiameter[i];
            }
            for (var i = 1; i < this.noseLength; i++) {
                this.noseReflection[i] = (this.noseA[i - 1] - this.noseA[i]) / (this.noseA[i - 1] + this.noseA[i]);
            }
        }
    }, {
        key: "runStep",
        value: function runStep(glottalOutput, turbulenceNoise, lambda) {
            var updateAmplitudes = Math.random() < 0.1;

            //mouth
            this.processTransients();
            this.addTurbulenceNoise(turbulenceNoise);

            //this.glottalReflection = -0.8 + 1.6 * Glottis.newTenseness;
            this.junctionOutputR[0] = this.L[0] * this.glottalReflection + glottalOutput;
            this.junctionOutputL[this.n] = this.R[this.n - 1] * this.lipReflection;

            for (var i = 1; i < this.n; i++) {
                var r = this.reflection[i] * (1 - lambda) + this.newReflection[i] * lambda;
                var w = r * (this.R[i - 1] + this.L[i]);
                this.junctionOutputR[i] = this.R[i - 1] - w;
                this.junctionOutputL[i] = this.L[i] + w;
            }

            //now at junction with nose
            var i = this.noseStart;
            var r = this.newReflectionLeft * (1 - lambda) + this.reflectionLeft * lambda;
            this.junctionOutputL[i] = r * this.R[i - 1] + (1 + r) * (this.noseL[0] + this.L[i]);
            r = this.newReflectionRight * (1 - lambda) + this.reflectionRight * lambda;
            this.junctionOutputR[i] = r * this.L[i] + (1 + r) * (this.R[i - 1] + this.noseL[0]);
            r = this.newReflectionNose * (1 - lambda) + this.reflectionNose * lambda;
            this.noseJunctionOutputR[0] = r * this.noseL[0] + (1 + r) * (this.L[i] + this.R[i - 1]);

            for (var i = 0; i < this.n; i++) {
                this.R[i] = this.junctionOutputR[i] * 0.999;
                this.L[i] = this.junctionOutputL[i + 1] * 0.999;

                //this.R[i] = Math.clamp(this.junctionOutputR[i] * this.fade, -1, 1);
                //this.L[i] = Math.clamp(this.junctionOutputL[i+1] * this.fade, -1, 1);    

                if (updateAmplitudes) {
                    var amplitude = Math.abs(this.R[i] + this.L[i]);
                    if (amplitude > this.maxAmplitude[i]) this.maxAmplitude[i] = amplitude;else this.maxAmplitude[i] *= 0.999;
                }
            }

            this.lipOutput = this.R[this.n - 1];

            //nose     
            this.noseJunctionOutputL[this.noseLength] = this.noseR[this.noseLength - 1] * this.lipReflection;

            for (var i = 1; i < this.noseLength; i++) {
                var w = this.noseReflection[i] * (this.noseR[i - 1] + this.noseL[i]);
                this.noseJunctionOutputR[i] = this.noseR[i - 1] - w;
                this.noseJunctionOutputL[i] = this.noseL[i] + w;
            }

            for (var i = 0; i < this.noseLength; i++) {
                this.noseR[i] = this.noseJunctionOutputR[i] * this.fade;
                this.noseL[i] = this.noseJunctionOutputL[i + 1] * this.fade;

                //this.noseR[i] = Math.clamp(this.noseJunctionOutputR[i] * this.fade, -1, 1);
                //this.noseL[i] = Math.clamp(this.noseJunctionOutputL[i+1] * this.fade, -1, 1);    

                if (updateAmplitudes) {
                    var amplitude = Math.abs(this.noseR[i] + this.noseL[i]);
                    if (amplitude > this.noseMaxAmplitude[i]) this.noseMaxAmplitude[i] = amplitude;else this.noseMaxAmplitude[i] *= 0.999;
                }
            }

            this.noseOutput = this.noseR[this.noseLength - 1];
        }
    }, {
        key: "finishBlock",
        value: function finishBlock() {
            this.reshapeTract(this.trombone.AudioSystem.blockTime);
            this.calculateReflections();
        }
    }, {
        key: "addTransient",
        value: function addTransient(position) {
            var trans = {};
            trans.position = position;
            trans.timeAlive = 0;
            trans.lifeTime = 0.2;
            trans.strength = 0.3;
            trans.exponent = 200;
            this.transients.push(trans);
        }
    }, {
        key: "processTransients",
        value: function processTransients() {
            for (var i = 0; i < this.transients.length; i++) {
                var trans = this.transients[i];
                var amplitude = trans.strength * Math.pow(2, -trans.exponent * trans.timeAlive);
                this.R[trans.position] += amplitude / 2;
                this.L[trans.position] += amplitude / 2;
                trans.timeAlive += 1.0 / (this.trombone.sampleRate * 2);
            }
            for (var i = this.transients.length - 1; i >= 0; i--) {
                var trans = this.transients[i];
                if (trans.timeAlive > trans.lifeTime) {
                    this.transients.splice(i, 1);
                }
            }
        }
    }, {
        key: "addTurbulenceNoise",
        value: function addTurbulenceNoise(turbulenceNoise) {
            // for (var j=0; j<UI.touchesWithMouse.length; j++)
            // {
            //     var touch = UI.touchesWithMouse[j];
            //     if (touch.index<2 || touch.index>Tract.n) continue;
            //     if (touch.diameter<=0) continue;            
            //     var intensity = touch.fricative_intensity;
            //     if (intensity == 0) continue;
            //     this.addTurbulenceNoiseAtIndex(0.66*turbulenceNoise*intensity, touch.index, touch.diameter);
            // }
        }
    }, {
        key: "addTurbulenceNoiseAtIndex",
        value: function addTurbulenceNoiseAtIndex(turbulenceNoise, index, diameter) {
            var i = Math.floor(index);
            var delta = index - i;
            turbulenceNoise *= this.trombone.Glottis.getNoiseModulator();
            var thinness0 = Math.clamp(8 * (0.7 - diameter), 0, 1);
            var openness = Math.clamp(30 * (diameter - 0.3), 0, 1);
            var noise0 = turbulenceNoise * (1 - delta) * thinness0 * openness;
            var noise1 = turbulenceNoise * delta * thinness0 * openness;
            this.R[i + 1] += noise0 / 2;
            this.L[i + 1] += noise0 / 2;
            this.R[i + 2] += noise1 / 2;
            this.L[i + 2] += noise1 / 2;
        }
    }]);

    return Tract;
}();

;

exports.Tract = Tract;

},{}],10:[function(require,module,exports){
"use strict";

Math.clamp = function (number, min, max) {
    if (number < min) return min;else if (number > max) return max;else return number;
};

Math.moveTowards = function (current, target, amount) {
    if (current < target) return Math.min(current + amount, target);else return Math.max(current - amount, target);
};

Math.moveTowards = function (current, target, amountUp, amountDown) {
    if (current < target) return Math.min(current + amountUp, target);else return Math.max(current - amountDown, target);
};

Math.gaussian = function () {
    var s = 0;
    for (var c = 0; c < 16; c++) {
        s += Math.random();
    }return (s - 8) / 4;
};

Math.lerp = function (a, b, t) {
    return a + (b - a) * t;
};

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

var Grad = function () {
    function Grad(x, y, z) {
        _classCallCheck(this, Grad);

        this.x = x;
        this.y = y;
        this.z = z;
    }

    _createClass(Grad, [{
        key: "dot2",
        value: function dot2(x, y) {
            return this.x * x + this.y * y;
        }
    }, {
        key: "dot3",
        value: function dot3(x, y, z) {
            return this.x * x + this.y * y + this.z * z;
        }
    }]);

    return Grad;
}();

var Noise = function () {
    function Noise() {
        _classCallCheck(this, Noise);

        this.grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
        this.p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

        // To remove the need for index wrapping, double the permutation table length
        this.perm = new Array(512);
        this.gradP = new Array(512);

        this.seed(Date.now());
    }

    _createClass(Noise, [{
        key: "seed",
        value: function seed(_seed) {
            if (_seed > 0 && _seed < 1) {
                // Scale the seed out
                _seed *= 65536;
            }

            _seed = Math.floor(_seed);
            if (_seed < 256) {
                _seed |= _seed << 8;
            }

            for (var i = 0; i < 256; i++) {
                var v;
                if (i & 1) {
                    v = this.p[i] ^ _seed & 255;
                } else {
                    v = this.p[i] ^ _seed >> 8 & 255;
                }

                this.perm[i] = this.perm[i + 256] = v;
                this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
            }
        }
    }, {
        key: "simplex2",


        // 2D simplex noise
        value: function simplex2(xin, yin) {
            // Skewing and unskewing factors for 2, 3, and 4 dimensions
            var F2 = 0.5 * (Math.sqrt(3) - 1);
            var G2 = (3 - Math.sqrt(3)) / 6;

            var F3 = 1 / 3;
            var G3 = 1 / 6;

            var n0, n1, n2; // Noise contributions from the three corners
            // Skew the input space to determine which simplex cell we're in
            var s = (xin + yin) * F2; // Hairy factor for 2D
            var i = Math.floor(xin + s);
            var j = Math.floor(yin + s);
            var t = (i + j) * G2;
            var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
            var y0 = yin - j + t;
            // For the 2D case, the simplex shape is an equilateral triangle.
            // Determine which simplex we are in.
            var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
            if (x0 > y0) {
                // lower triangle, XY order: (0,0)->(1,0)->(1,1)
                i1 = 1;j1 = 0;
            } else {
                // upper triangle, YX order: (0,0)->(0,1)->(1,1)
                i1 = 0;j1 = 1;
            }
            // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
            // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
            // c = (3-sqrt(3))/6
            var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
            var y1 = y0 - j1 + G2;
            var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
            var y2 = y0 - 1 + 2 * G2;
            // Work out the hashed gradient indices of the three simplex corners
            i &= 255;
            j &= 255;
            var gi0 = this.gradP[i + this.perm[j]];
            var gi1 = this.gradP[i + i1 + this.perm[j + j1]];
            var gi2 = this.gradP[i + 1 + this.perm[j + 1]];
            // Calculate the contribution from the three corners
            var t0 = 0.5 - x0 * x0 - y0 * y0;
            if (t0 < 0) {
                n0 = 0;
            } else {
                t0 *= t0;
                n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
            }
            var t1 = 0.5 - x1 * x1 - y1 * y1;
            if (t1 < 0) {
                n1 = 0;
            } else {
                t1 *= t1;
                n1 = t1 * t1 * gi1.dot2(x1, y1);
            }
            var t2 = 0.5 - x2 * x2 - y2 * y2;
            if (t2 < 0) {
                n2 = 0;
            } else {
                t2 *= t2;
                n2 = t2 * t2 * gi2.dot2(x2, y2);
            }
            // Add contributions from each corner to get the final noise value.
            // The result is scaled to return values in the interval [-1,1].
            return 70 * (n0 + n1 + n2);
        }
    }, {
        key: "simplex1",
        value: function simplex1(x) {
            return this.simplex2(x * 1.2, -x * 0.7);
        }
    }]);

    return Noise;
}();

var singleton = new Noise();
Object.freeze(singleton);

exports.default = singleton;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PinkTrombone = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require("./math-extensions.js");

var _audioSystem = require("./components/audio-system.js");

var _glottis = require("./components/glottis.js");

var _tract = require("./components/tract.js");

var _tractUi = require("./components/tract-ui.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PinkTrombone = function () {
    function PinkTrombone(controller) {
        _classCallCheck(this, PinkTrombone);

        this.controller = controller;

        this.sampleRate = 0;
        this.time = 0;
        this.alwaysVoice = true;
        this.autoWobble = true;
        this.noiseFreq = 500;
        this.noiseQ = 0.7;

        this.AudioSystem = new _audioSystem.AudioSystem(this);
        this.AudioSystem.init();

        this.Glottis = new _glottis.Glottis(this);
        this.Glottis.init();

        this.Tract = new _tract.Tract(this);
        this.Tract.init();

        this.TractUI = new _tractUi.TractUI(this);
        this.TractUI.init();

        //this.StartAudio();
        //this.SetMute(true);
    }

    _createClass(PinkTrombone, [{
        key: "StartAudio",
        value: function StartAudio() {
            this.muted = false;
            this.AudioSystem.startSound();
        }
    }, {
        key: "SetMute",
        value: function SetMute(doMute) {
            doMute ? this.AudioSystem.mute() : this.AudioSystem.unmute();
            this.muted = doMute;
        }
    }, {
        key: "ToggleMute",
        value: function ToggleMute() {
            this.SetMute(!this.muted);
        }
    }]);

    return PinkTrombone;
}();

exports.PinkTrombone = PinkTrombone;

},{"./components/audio-system.js":6,"./components/glottis.js":7,"./components/tract-ui.js":8,"./components/tract.js":9,"./math-extensions.js":10}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModelLoader = function () {
    function ModelLoader() {
        _classCallCheck(this, ModelLoader);
    }

    _createClass(ModelLoader, null, [{
        key: 'LoadOBJ',


        /**
         * Loads a model asynchronously. Expects an object containing
         * the path to the object, the relative path of the OBJ file,
         * and the relative path of the MTL file.
         * 
         * An example:
         * let modelInfo = {
         *      path: "../resources/obj/",
         *      objFile: "test.obj",
         *      mtlFile: "test.mtl"
         * }
         */
        value: function LoadOBJ(modelInfo, loadedCallback) {

            var onProgress = function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log(Math.round(percentComplete, 2) + '% downloaded');
                }
            };
            var onError = function onError(xhr) {};

            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath(modelInfo.path);

            mtlLoader.load(modelInfo.mtlFile, function (materials) {
                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(modelInfo.path);
                objLoader.load(modelInfo.objFile, function (object) {
                    loadedCallback(object);
                }, onProgress, onError);
            });
        }
    }, {
        key: 'LoadJSON',
        value: function LoadJSON(path, loadedCallback) {

            var onProgress = function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log(Math.round(percentComplete, 2) + '% downloaded');
                }
            };
            var onError = function onError(xhr) {};

            var loader = new THREE.JSONLoader();
            loader.load(path, function (geometry, materials) {
                // Apply skinning to each material so the verts are affected by bone movement
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = materials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var mat = _step.value;

                        mat.skinning = true;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var mesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
                mesh.name = "Jon";
                loadedCallback(mesh);
            }, onProgress, onError);
        }
    }, {
        key: 'LoadFBX',
        value: function LoadFBX(path, loadedCallback) {
            var manager = new THREE.LoadingManager();
            manager.onProgress = function (item, loaded, total) {
                console.log(item, loaded, total);
            };

            var onProgress = function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log(Math.round(percentComplete, 2) + '% downloaded');
                }
            };
            var onError = function onError(xhr) {};

            var loader = new THREE.FBXLoader(manager);
            loader.load(path, function (object) {
                loadedCallback(object);
            }, onProgress, onError);
        }
    }]);

    return ModelLoader;
}();

exports.ModelLoader = ModelLoader;

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Detector = function () {
    function Detector() {
        _classCallCheck(this, Detector);
    }

    _createClass(Detector, null, [{
        key: "HasWebGL",


        //http://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support
        value: function HasWebGL() {
            if (!!window.WebGLRenderingContext) {
                var canvas = document.createElement("canvas"),
                    names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
                    context = false;

                for (var i = 0; i < 4; i++) {
                    try {
                        context = canvas.getContext(names[i]);
                        if (context && typeof context.getParameter == "function") {
                            // WebGL is enabled
                            return true;
                        }
                    } catch (e) {}
                }

                // WebGL is supported, but disabled
                return false;
            }
            // WebGL not supported
            return false;
        }
    }, {
        key: "GetErrorHTML",
        value: function GetErrorHTML() {
            var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (message == null) {
                message = "Your graphics card does not seem to support \n                        <a href=\"http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">WebGL</a>. <br>\n                        Find out how to get it <a href=\"http://get.webgl.org/\">here</a>.";
            }
            return "\n        <div class=\"no-webgl-support\">\n        <p style=\"text-align: center;\">" + message + "</p>\n        </div>\n        ";
        }
    }]);

    return Detector;
}();

exports.Detector = Detector;

},{}],15:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.MidiConvert=e():t.MidiConvert=e()}(this,function(){return function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return t[r].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(7),i=n(2),a={instrumentByPatchID:i.instrumentByPatchID,instrumentFamilyByID:i.instrumentFamilyByID,parse:function(t){return(new r.Midi).decode(t)},load:function(t,e){var n=(new r.Midi).load(t);return e&&n.then(e),n},create:function(){return new r.Midi}};e["default"]=a,t.exports=a},function(t,e){"use strict";function n(t){return t.replace(/\u0000/g,"")}function r(t,e){return 60/e.bpm*(t/e.PPQ)}function i(t){return"number"==typeof t}function a(t){return"string"==typeof t}function o(t){var e=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],n=Math.floor(t/12)-1,r=t%12;return e[r]+n}var s=function(){var t=/^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i;return function(e){return a(e)&&t.test(e)}}(),u=function(){var t=/^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,e={cbb:-2,cb:-1,c:0,"c#":1,cx:2,dbb:0,db:1,d:2,"d#":3,dx:4,ebb:2,eb:3,e:4,"e#":5,ex:6,fbb:3,fb:4,f:5,"f#":6,fx:7,gbb:5,gb:6,g:7,"g#":8,gx:9,abb:7,ab:8,a:9,"a#":10,ax:11,bbb:9,bb:10,b:11,"b#":12,bx:13};return function(n){var r=t.exec(n),i=r[1],a=r[2],o=e[i.toLowerCase()];return o+12*(parseInt(a)+1)}}();t.exports={cleanName:n,ticksToSeconds:r,isString:a,isNumber:i,isPitch:s,midiToPitch:o,pitchToMidi:u}},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});e.instrumentByPatchID=["acoustic grand piano","bright acoustic piano","electric grand piano","honky-tonk piano","electric piano 1","electric piano 2","harpsichord","clavi","celesta","glockenspiel","music box","vibraphone","marimba","xylophone","tubular bells","dulcimer","drawbar organ","percussive organ","rock organ","church organ","reed organ","accordion","harmonica","tango accordion","acoustic guitar (nylon)","acoustic guitar (steel)","electric guitar (jazz)","electric guitar (clean)","electric guitar (muted)","overdriven guitar","distortion guitar","guitar harmonics","acoustic bass","electric bass (finger)","electric bass (pick)","fretless bass","slap bass 1","slap bass 2","synth bass 1","synth bass 2","violin","viola","cello","contrabass","tremolo strings","pizzicato strings","orchestral harp","timpani","string ensemble 1","string ensemble 2","synthstrings 1","synthstrings 2","choir aahs","voice oohs","synth voice","orchestra hit","trumpet","trombone","tuba","muted trumpet","french horn","brass section","synthbrass 1","synthbrass 2","soprano sax","alto sax","tenor sax","baritone sax","oboe","english horn","bassoon","clarinet","piccolo","flute","recorder","pan flute","blown bottle","shakuhachi","whistle","ocarina","lead 1 (square)","lead 2 (sawtooth)","lead 3 (calliope)","lead 4 (chiff)","lead 5 (charang)","lead 6 (voice)","lead 7 (fifths)","lead 8 (bass + lead)","pad 1 (new age)","pad 2 (warm)","pad 3 (polysynth)","pad 4 (choir)","pad 5 (bowed)","pad 6 (metallic)","pad 7 (halo)","pad 8 (sweep)","fx 1 (rain)","fx 2 (soundtrack)","fx 3 (crystal)","fx 4 (atmosphere)","fx 5 (brightness)","fx 6 (goblins)","fx 7 (echoes)","fx 8 (sci-fi)","sitar","banjo","shamisen","koto","kalimba","bag pipe","fiddle","shanai","tinkle bell","agogo","steel drums","woodblock","taiko drum","melodic tom","synth drum","reverse cymbal","guitar fret noise","breath noise","seashore","bird tweet","telephone ring","helicopter","applause","gunshot"],e.instrumentFamilyByID=["piano","chromatic percussion","organ","guitar","bass","strings","ensemble","brass","reed","pipe","synth lead","synth pad","synth effects","ethnic","percussive","sound effects"]},function(t,e){"use strict";function n(t,e){var n=0,r=t.length,i=r;if(r>0&&t[r-1].time<=e)return r-1;for(;i>n;){var a=Math.floor(n+(i-n)/2),o=t[a],s=t[a+1];if(o.time===e){for(var u=a;u<t.length;u++){var c=t[u];c.time===e&&(a=u)}return a}if(o.time<e&&s.time>e)return a;o.time>e?i=a:o.time<e&&(n=a+1)}return-1}function r(t,e){if(t.length){var r=n(t,e.time);t.splice(r+1,0,e)}else t.push(e)}Object.defineProperty(e,"__esModule",{value:!0}),e.BinaryInsert=r},function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i={1:"modulationWheel",2:"breath",4:"footController",5:"portamentoTime",7:"volume",8:"balance",10:"pan",64:"sustain",65:"portamentoTime",66:"sostenuto",67:"softPedal",68:"legatoFootswitch",84:"portamentoContro"},a=function(){function t(e,r,i){n(this,t),this.number=e,this.time=r,this.value=i}return r(t,[{key:"name",get:function(){return i.hasOwnProperty(this.number)?i[this.number]:void 0}}]),t}();e.Control=a},function(t,e){"use strict";function n(t){for(var e={PPQ:t.header.ticksPerBeat},n=0;n<t.tracks.length;n++)for(var r=t.tracks[n],i=0;i<r.length;i++){var a=r[i];"meta"===a.type&&("timeSignature"===a.subtype?e.timeSignature=[a.numerator,a.denominator]:"setTempo"===a.subtype&&(e.bpm||(e.bpm=6e7/a.microsecondsPerBeat)))}return e.bpm=e.bpm||120,e}Object.defineProperty(e,"__esModule",{value:!0}),e.parseHeader=n},function(t,e){"use strict";function n(t,e){for(var n=0;n<t.length;n++){var r=t[n],i=e[n];if(r.length>i)return!0}return!1}function r(t,e,n){for(var r=0,i=1/0,a=0;a<t.length;a++){var o=t[a],s=e[a];o[s]&&o[s].time<i&&(r=a,i=o[s].time)}n[r](t[r][e[r]]),e[r]+=1}function i(){for(var t=arguments.length,e=Array(t),i=0;t>i;i++)e[i]=arguments[i];for(var a=e.filter(function(t,e){return e%2===0}),o=new Uint32Array(a.length),s=e.filter(function(t,e){return e%2===1});n(a,o);)r(a,o,s)}Object.defineProperty(e,"__esModule",{value:!0}),e.Merge=i},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0}),e.Midi=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=n(11),s=r(o),u=n(10),c=r(u),h=n(1),f=r(h),d=n(9),l=n(5),p=function(){function t(){i(this,t),this.header={bpm:120,timeSignature:[4,4],PPQ:480},this.tracks=[]}return a(t,[{key:"load",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"GET";return new Promise(function(i,a){var o=new XMLHttpRequest;o.open(r,t),o.responseType="arraybuffer",o.addEventListener("load",function(){4===o.readyState&&200===o.status?i(e.decode(o.response)):a(o.status)}),o.addEventListener("error",a),o.send(n)})}},{key:"decode",value:function(t){var e=this;if(t instanceof ArrayBuffer){var n=new Uint8Array(t);t=String.fromCharCode.apply(null,n)}var r=(0,s["default"])(t);return this.header=(0,l.parseHeader)(r),this.tracks=[],r.tracks.forEach(function(t){var n=new d.Track;e.tracks.push(n);var r=0;t.forEach(function(t){r+=f["default"].ticksToSeconds(t.deltaTime,e.header),"meta"===t.type&&"trackName"===t.subtype?n.name=f["default"].cleanName(t.text):"noteOn"===t.subtype?n.noteOn(t.noteNumber,r,t.velocity/127):"noteOff"===t.subtype?n.noteOff(t.noteNumber,r):"controller"===t.subtype&&t.controllerType?n.cc(t.controllerType,r,t.value/127):"meta"===t.type&&"instrumentName"===t.subtype?n.instrument=t.text:"channel"===t.type&&"programChange"===t.subtype&&n.patch(t.programNumber)})}),this}},{key:"encode",value:function(){var t=this,e=new c["default"].File({ticks:this.header.PPQ});return this.tracks.forEach(function(n,r){var i=e.addTrack();i.setTempo(t.bpm),n.encode(i,t.header)}),e.toBytes()}},{key:"toArray",value:function(){for(var t=this.encode(),e=new Array(t.length),n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}},{key:"track",value:function e(t){var e=new d.Track(t);return this.tracks.push(e),e}},{key:"get",value:function(t){return f["default"].isNumber(t)?this.tracks[t]:this.tracks.find(function(e){return e.name===t})}},{key:"slice",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.duration,r=new t;return r.header=this.header,r.tracks=this.tracks.map(function(t){return t.slice(e,n)}),r}},{key:"startTime",get:function(){var t=this.tracks.map(function(t){return t.startTime});return Math.min.apply(Math,t)}},{key:"bpm",get:function(){return this.header.bpm},set:function(t){var e=this.header.bpm;this.header.bpm=t;var n=e/t;this.tracks.forEach(function(t){return t.scale(n)})}},{key:"timeSignature",get:function(){return this.header.timeSignature},set:function(t){this.header.timeSignature=timeSignature}},{key:"duration",get:function(){var t=this.tracks.map(function(t){return t.duration});return Math.max.apply(Math,t)}}]),t}();e.Midi=p},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0}),e.Note=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=n(1),s=r(o),u=function(){function t(e,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;if(i(this,t),this.midi,s["default"].isNumber(e))this.midi=e;else{if(!s["default"].isPitch(e))throw new Error("the midi value must either be in Pitch Notation (e.g. C#4) or a midi value");this.name=e}this.time=n,this.duration=r,this.velocity=a}return a(t,[{key:"match",value:function(t){return s["default"].isNumber(t)?this.midi===t:s["default"].isPitch(t)?this.name.toLowerCase()===t.toLowerCase():void 0}},{key:"toJSON",value:function(){return{name:this.name,midi:this.midi,time:this.time,velocity:this.velocity,duration:this.duration}}},{key:"name",get:function(){return s["default"].midiToPitch(this.midi)},set:function(t){this.midi=s["default"].pitchToMidi(t)}},{key:"noteOn",get:function(){return this.time},set:function(t){this.time=t}},{key:"noteOff",get:function(){return this.time+this.duration},set:function(t){this.duration=t-this.time}}]),t}();e.Note=u},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0}),e.Track=void 0;var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=n(3),o=n(4),s=n(6),u=n(8),c=n(2),h=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1;r(this,t),this.name=e,this.notes=[],this.controlChanges={},this.instrumentNumber=n}return i(t,[{key:"note",value:function e(t,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1,e=new u.Note(t,n,r,i);return(0,a.BinaryInsert)(this.notes,e),this}},{key:"noteOn",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,r=new u.Note(t,e,0,n);return(0,a.BinaryInsert)(this.notes,r),this}},{key:"noteOff",value:function(t,e){for(var n=0;n<this.notes.length;n++){var r=this.notes[n];if(r.match(t)&&0===r.duration){r.noteOff=e;break}}return this}},{key:"cc",value:function n(t,e,r){this.controlChanges.hasOwnProperty(t)||(this.controlChanges[t]=[]);var n=new o.Control(t,e,r);return(0,a.BinaryInsert)(this.controlChanges[t],n),this}},{key:"patch",value:function(t){return this.instrumentNumber=t,this}},{key:"scale",value:function(t){return this.notes.forEach(function(e){e.time*=t,e.duration*=t}),this}},{key:"slice",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.duration,r=Math.max(this.notes.findIndex(function(t){return t.time>=e}),0),i=this.notes.findIndex(function(t){return t.noteOff>=n})+1,a=new t(this.name);return a.notes=this.notes.slice(r,i),a.notes.forEach(function(t){return t.time=t.time-e}),a}},{key:"encode",value:function(t,e){function n(t){var e=Math.floor(r*t),n=Math.max(e-i,0);return i=e,n}var r=e.PPQ/(60/e.bpm),i=0,a=0;-1!==this.instrumentNumber&&t.instrument(a,this.instrumentNumber),(0,s.Merge)(this.noteOns,function(e){t.addNoteOn(a,e.name,n(e.time),Math.floor(127*e.velocity))},this.noteOffs,function(e){t.addNoteOff(a,e.name,n(e.time))})}},{key:"noteOns",get:function(){var t=[];return this.notes.forEach(function(e){t.push({time:e.noteOn,midi:e.midi,name:e.name,velocity:e.velocity})}),t}},{key:"noteOffs",get:function(){var t=[];return this.notes.forEach(function(e){t.push({time:e.noteOff,midi:e.midi,name:e.name})}),t}},{key:"length",get:function(){return this.notes.length}},{key:"startTime",get:function(){if(this.notes.length){var t=this.notes[0];return t.noteOn}return 0}},{key:"duration",get:function(){if(this.notes.length){var t=this.notes[this.notes.length-1];return t.noteOff}return 0}},{key:"instrument",get:function(){return c.instrumentByPatchID[this.instrumentNumber]},set:function(t){var e=c.instrumentByPatchID.indexOf(t);-1!==e&&(this.instrumentNumber=e)}},{key:"instrumentFamily",get:function(){return c.instrumentFamilyByID[Math.floor(this.instrumentNumber/8)]}}]),t}();e.Track=h},function(t,e,n){(function(t){var n={};!function(t){var e=t.DEFAULT_VOLUME=90,n=(t.DEFAULT_DURATION=128,t.DEFAULT_CHANNEL=0,{midi_letter_pitches:{a:21,b:23,c:12,d:14,e:16,f:17,g:19},midiPitchFromNote:function(t){var e=/([a-g])(#+|b+)?([0-9]+)$/i.exec(t),r=e[1].toLowerCase(),i=e[2]||"",a=parseInt(e[3],10);return 12*a+n.midi_letter_pitches[r]+("#"==i.substr(0,1)?1:-1)*i.length},ensureMidiPitch:function(t){return"number"!=typeof t&&/[^0-9]/.test(t)?n.midiPitchFromNote(t):parseInt(t,10)},midi_pitches_letter:{12:"c",13:"c#",14:"d",15:"d#",16:"e",17:"f",18:"f#",19:"g",20:"g#",21:"a",22:"a#",23:"b"},midi_flattened_notes:{"a#":"bb","c#":"db","d#":"eb","f#":"gb","g#":"ab"},noteFromMidiPitch:function(t,e){var r,i=0,a=t,e=e||!1;return t>23&&(i=Math.floor(t/12)-1,a=t-12*i),r=n.midi_pitches_letter[a],e&&r.indexOf("#")>0&&(r=n.midi_flattened_notes[r]),r+i},mpqnFromBpm:function(t){var e=Math.floor(6e7/t),n=[];do n.unshift(255&e),e>>=8;while(e);for(;n.length<3;)n.push(0);return n},bpmFromMpqn:function(t){var e=t;if("undefined"!=typeof t[0]){e=0;for(var n=0,r=t.length-1;r>=0;++n,--r)e|=t[n]<<r}return Math.floor(6e7/t)},codes2Str:function(t){return String.fromCharCode.apply(null,t)},str2Bytes:function(t,e){if(e)for(;t.length/2<e;)t="0"+t;for(var n=[],r=t.length-1;r>=0;r-=2){var i=0===r?t[r]:t[r-1]+t[r];n.unshift(parseInt(i,16))}return n},translateTickTime:function(t){for(var e=127&t;t>>=7;)e<<=8,e|=127&t|128;for(var n=[];;){if(n.push(255&e),!(128&e))break;e>>=8}return n}}),r=function(t){return this?void(!t||null===t.type&&void 0===t.type||null===t.channel&&void 0===t.channel||null===t.param1&&void 0===t.param1||(this.setTime(t.time),this.setType(t.type),this.setChannel(t.channel),this.setParam1(t.param1),this.setParam2(t.param2))):new r(t)};r.NOTE_OFF=128,r.NOTE_ON=144,r.AFTER_TOUCH=160,r.CONTROLLER=176,r.PROGRAM_CHANGE=192,r.CHANNEL_AFTERTOUCH=208,r.PITCH_BEND=224,r.prototype.setTime=function(t){this.time=n.translateTickTime(t||0)},r.prototype.setType=function(t){if(t<r.NOTE_OFF||t>r.PITCH_BEND)throw new Error("Trying to set an unknown event: "+t);this.type=t},r.prototype.setChannel=function(t){if(0>t||t>15)throw new Error("Channel is out of bounds.");this.channel=t},r.prototype.setParam1=function(t){this.param1=t},r.prototype.setParam2=function(t){this.param2=t},r.prototype.toBytes=function(){var t=[],e=this.type|15&this.channel;return t.push.apply(t,this.time),t.push(e),t.push(this.param1),void 0!==this.param2&&null!==this.param2&&t.push(this.param2),t};var i=function(t){if(!this)return new i(t);this.setTime(t.time),this.setType(t.type),this.setData(t.data)};i.SEQUENCE=0,i.TEXT=1,i.COPYRIGHT=2,i.TRACK_NAME=3,i.INSTRUMENT=4,i.LYRIC=5,i.MARKER=6,i.CUE_POINT=7,i.CHANNEL_PREFIX=32,i.END_OF_TRACK=47,i.TEMPO=81,i.SMPTE=84,i.TIME_SIG=88,i.KEY_SIG=89,i.SEQ_EVENT=127,i.prototype.setTime=function(t){this.time=n.translateTickTime(t||0)},i.prototype.setType=function(t){this.type=t},i.prototype.setData=function(t){this.data=t},i.prototype.toBytes=function(){if(!this.type)throw new Error("Type for meta-event not specified.");var t=[];if(t.push.apply(t,this.time),t.push(255,this.type),Array.isArray(this.data))t.push(this.data.length),t.push.apply(t,this.data);else if("number"==typeof this.data)t.push(1,this.data);else if(null!==this.data&&void 0!==this.data){t.push(this.data.length);var e=this.data.split("").map(function(t){return t.charCodeAt(0)});t.push.apply(t,e)}else t.push(0);return t};var a=function(t){if(!this)return new a(t);var e=t||{};this.events=e.events||[]};a.START_BYTES=[77,84,114,107],a.END_BYTES=[0,255,47,0],a.prototype.addEvent=function(t){return this.events.push(t),this},a.prototype.addNoteOn=a.prototype.noteOn=function(t,i,a,o){return this.events.push(new r({type:r.NOTE_ON,channel:t,param1:n.ensureMidiPitch(i),param2:o||e,time:a||0})),this},a.prototype.addNoteOff=a.prototype.noteOff=function(t,i,a,o){return this.events.push(new r({type:r.NOTE_OFF,channel:t,param1:n.ensureMidiPitch(i),param2:o||e,time:a||0})),this},a.prototype.addNote=a.prototype.note=function(t,e,n,r,i){return this.noteOn(t,e,r,i),n&&this.noteOff(t,e,n,i),this},a.prototype.addChord=a.prototype.chord=function(t,e,n,r){if(!Array.isArray(e)&&!e.length)throw new Error("Chord must be an array of pitches");return e.forEach(function(e){this.noteOn(t,e,0,r)},this),e.forEach(function(e,r){0===r?this.noteOff(t,e,n):this.noteOff(t,e)},this),this},a.prototype.setInstrument=a.prototype.instrument=function(t,e,n){return this.events.push(new r({type:r.PROGRAM_CHANGE,channel:t,param1:e,time:n||0})),this},a.prototype.setTempo=a.prototype.tempo=function(t,e){return this.events.push(new i({type:i.TEMPO,data:n.mpqnFromBpm(t),time:e||0})),this},a.prototype.toBytes=function(){var t=0,e=[],r=a.START_BYTES,i=a.END_BYTES,o=function(n){var r=n.toBytes();t+=r.length,e.push.apply(e,r)};this.events.forEach(o),t+=i.length;var s=n.str2Bytes(t.toString(16),4);return r.concat(s,e,i)};var o=function(t){if(!this)return new o(t);var e=t||{};if(e.ticks){if("number"!=typeof e.ticks)throw new Error("Ticks per beat must be a number!");if(e.ticks<=0||e.ticks>=32768||e.ticks%1!==0)throw new Error("Ticks per beat must be an integer between 1 and 32767!")}this.ticks=e.ticks||128,this.tracks=e.tracks||[]};o.HDR_CHUNKID="MThd",o.HDR_CHUNK_SIZE="\x00\x00\x00",o.HDR_TYPE0="\x00\x00",o.HDR_TYPE1="\x00",o.prototype.addTrack=function(t){return t?(this.tracks.push(t),this):(t=new a,this.tracks.push(t),t)},o.prototype.toBytes=function(){var t=this.tracks.length.toString(16),e=o.HDR_CHUNKID+o.HDR_CHUNK_SIZE;return e+=parseInt(t,16)>1?o.HDR_TYPE1:o.HDR_TYPE0,e+=n.codes2Str(n.str2Bytes(t,2)),e+=String.fromCharCode(this.ticks/256,this.ticks%256),this.tracks.forEach(function(t){e+=n.codes2Str(t.toBytes())}),e},t.Util=n,t.File=o,t.Track=a,t.Event=r,t.MetaEvent=i}(n),"undefined"!=typeof t&&null!==t?t.exports=n:"undefined"!=typeof e&&null!==e?e=n:this.Midi=n}).call(e,n(12)(t))},function(t,e){function n(t){function e(t){var e=t.read(4),n=t.readInt32();return{id:e,length:n,data:t.read(n)}}function n(t){var e={};e.deltaTime=t.readVarInt();var n=t.readInt8();if(240==(240&n)){if(255==n){e.type="meta";var r=t.readInt8(),a=t.readVarInt();switch(r){case 0:if(e.subtype="sequenceNumber",2!=a)throw"Expected length for sequenceNumber event is 2, got "+a;return e.number=t.readInt16(),e;case 1:return e.subtype="text",e.text=t.read(a),e;case 2:return e.subtype="copyrightNotice",e.text=t.read(a),e;case 3:return e.subtype="trackName",e.text=t.read(a),e;case 4:return e.subtype="instrumentName",e.text=t.read(a),e;case 5:return e.subtype="lyrics",e.text=t.read(a),e;case 6:return e.subtype="marker",e.text=t.read(a),e;case 7:return e.subtype="cuePoint",e.text=t.read(a),e;case 32:if(e.subtype="midiChannelPrefix",1!=a)throw"Expected length for midiChannelPrefix event is 1, got "+a;return e.channel=t.readInt8(),e;case 47:if(e.subtype="endOfTrack",0!=a)throw"Expected length for endOfTrack event is 0, got "+a;return e;case 81:if(e.subtype="setTempo",3!=a)throw"Expected length for setTempo event is 3, got "+a;return e.microsecondsPerBeat=(t.readInt8()<<16)+(t.readInt8()<<8)+t.readInt8(),e;case 84:if(e.subtype="smpteOffset",5!=a)throw"Expected length for smpteOffset event is 5, got "+a;var o=t.readInt8();return e.frameRate={0:24,32:25,64:29,96:30}[96&o],e.hour=31&o,e.min=t.readInt8(),e.sec=t.readInt8(),e.frame=t.readInt8(),e.subframe=t.readInt8(),e;case 88:if(e.subtype="timeSignature",4!=a)throw"Expected length for timeSignature event is 4, got "+a;return e.numerator=t.readInt8(),e.denominator=Math.pow(2,t.readInt8()),e.metronome=t.readInt8(),e.thirtyseconds=t.readInt8(),e;case 89:if(e.subtype="keySignature",2!=a)throw"Expected length for keySignature event is 2, got "+a;return e.key=t.readInt8(!0),e.scale=t.readInt8(),e;case 127:return e.subtype="sequencerSpecific",e.data=t.read(a),e;default:return e.subtype="unknown",e.data=t.read(a),e}return e.data=t.read(a),e}if(240==n){e.type="sysEx";var a=t.readVarInt();return e.data=t.read(a),e}if(247==n){e.type="dividedSysEx";var a=t.readVarInt();return e.data=t.read(a),e}throw"Unrecognised MIDI event type byte: "+n}var s;0==(128&n)?(s=n,n=i):(s=t.readInt8(),i=n);var u=n>>4;switch(e.channel=15&n,e.type="channel",u){case 8:return e.subtype="noteOff",e.noteNumber=s,e.velocity=t.readInt8(),e;case 9:return e.noteNumber=s,e.velocity=t.readInt8(),0==e.velocity?e.subtype="noteOff":e.subtype="noteOn",e;case 10:return e.subtype="noteAftertouch",e.noteNumber=s,e.amount=t.readInt8(),e;case 11:return e.subtype="controller",e.controllerType=s,e.value=t.readInt8(),e;case 12:return e.subtype="programChange",e.programNumber=s,e;case 13:return e.subtype="channelAftertouch",e.amount=s,e;case 14:return e.subtype="pitchBend",e.value=s+(t.readInt8()<<7),e;default:throw"Unrecognised MIDI event type: "+u}}var i;stream=r(t);var a=e(stream);if("MThd"!=a.id||6!=a.length)throw"Bad .mid file - header not found";var o=r(a.data),s=o.readInt16(),u=o.readInt16(),c=o.readInt16();if(32768&c)throw"Expressing time division in SMTPE frames is not supported yet";ticksPerBeat=c;for(var h={formatType:s,trackCount:u,ticksPerBeat:ticksPerBeat},f=[],d=0;d<h.trackCount;d++){f[d]=[];var l=e(stream);if("MTrk"!=l.id)throw"Unexpected chunk - expected MTrk, got "+l.id;for(var p=r(l.data);!p.eof();){var m=n(p);f[d].push(m)}}return{header:h,tracks:f}}function r(t){function e(e){var n=t.substr(s,e);return s+=e,n}function n(){var e=(t.charCodeAt(s)<<24)+(t.charCodeAt(s+1)<<16)+(t.charCodeAt(s+2)<<8)+t.charCodeAt(s+3);return s+=4,e}function r(){var e=(t.charCodeAt(s)<<8)+t.charCodeAt(s+1);return s+=2,e}function i(e){var n=t.charCodeAt(s);return e&&n>127&&(n-=256),s+=1,n}function a(){return s>=t.length}function o(){for(var t=0;;){var e=i();if(!(128&e))return t+e;t+=127&e,t<<=7}}var s=0;return{eof:a,read:e,readInt32:n,readInt16:r,readInt8:i,readVarInt:o}}t.exports=function(t){return n(t)}},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children=[],t.webpackPolyfill=1),t}}])});

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9ndWkuanMiLCJqcy9qb24tdHJvbWJvbmUuanMiLCJqcy9tYWluLmpzIiwianMvbWlkaS9taWRpLWNvbnRyb2xsZXIuanMiLCJqcy9taWRpL21pZGktZHJvcC1hcmVhLmpzIiwianMvcGluay10cm9tYm9uZS9jb21wb25lbnRzL2F1ZGlvLXN5c3RlbS5qcyIsImpzL3BpbmstdHJvbWJvbmUvY29tcG9uZW50cy9nbG90dGlzLmpzIiwianMvcGluay10cm9tYm9uZS9jb21wb25lbnRzL3RyYWN0LXVpLmpzIiwianMvcGluay10cm9tYm9uZS9jb21wb25lbnRzL3RyYWN0LmpzIiwianMvcGluay10cm9tYm9uZS9tYXRoLWV4dGVuc2lvbnMuanMiLCJqcy9waW5rLXRyb21ib25lL25vaXNlLmpzIiwianMvcGluay10cm9tYm9uZS9waW5rLXRyb21ib25lLmpzIiwianMvdXRpbHMvbW9kZWwtbG9hZGVyLmpzIiwianMvdXRpbHMvd2ViZ2wtZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL21pZGljb252ZXJ0L2J1aWxkL01pZGlDb252ZXJ0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztJQ0NhLEcsV0FBQSxHOzs7Ozs7Ozs7QUFFVDs7OzZCQUdZLFUsRUFBVztBQUNuQixnQkFBRyxPQUFPLEdBQVAsS0FBZ0IsV0FBbkIsRUFBK0I7QUFDM0Isd0JBQVEsSUFBUixDQUFhLHVEQUFiO0FBQ0E7QUFDSDs7QUFFRCxnQkFBSSxNQUFNLElBQUksSUFBSSxHQUFSLEVBQVY7O0FBRUEsZ0JBQUksTUFBTSxVQUFWOztBQUVBLGdCQUFJLEdBQUosQ0FBUSxJQUFJLFFBQVosRUFBc0IsWUFBdEI7O0FBRUEsZ0JBQUksU0FBUyxJQUFJLFNBQUosQ0FBYyxLQUFkLENBQWI7QUFDQSxtQkFBTyxHQUFQLENBQVcsR0FBWCxFQUFnQixTQUFoQixFQUEyQixNQUEzQjtBQUNBLG1C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LDZHQUVpQyxPQUZqQztBQUtIOzs7Ozs7UUFJSSxRLEdBQUEsUTs7O0FDekNUO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5leHBvcnQgY2xhc3MgR1VJIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW5kIGF0dGFjaGVzIGEgR1VJIHRvIHRoZSBwYWdlIGlmIERBVC5HVUkgaXMgaW5jbHVkZWQuXG4gICAgICovXG4gICAgc3RhdGljIEluaXQoY29udHJvbGxlcil7XG4gICAgICAgIGlmKHR5cGVvZihkYXQpID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIk5vIERBVC5HVUkgaW5zdGFuY2UgZm91bmQuIEltcG9ydCBvbiB0aGUgcGFnZSB0byB1c2UhXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGd1aSA9IG5ldyBkYXQuR1VJKCk7XG5cbiAgICAgICAgdmFyIGpvbiA9IGNvbnRyb2xsZXI7XG5cbiAgICAgICAgZ3VpLmFkZChqb24udHJvbWJvbmUsICdUb2dnbGVNdXRlJyk7XG5cbiAgICAgICAgdmFyIGpvbkdVSSA9IGd1aS5hZGRGb2xkZXIoXCJKb25cIik7XG4gICAgICAgIGpvbkdVSS5hZGQoam9uLCBcIm1vdmVKYXdcIikubGlzdGVuKCk7XG4gICAgICAgIGpvbkdVSS5hZGQoam9uLCBcImphd0ZsYXBTcGVlZFwiKS5taW4oMCkubWF4KDEwMCk7XG4gICAgICAgIGpvbkdVSS5hZGQoam9uLCBcImphd09wZW5PZmZzZXRcIikubWluKDApLm1heCgxKTtcblxuICAgICAgICB2YXIgdm9pY2VHVUkgPSBndWkuYWRkRm9sZGVyKFwiVm9pY2VcIik7XG4gICAgICAgIHZvaWNlR1VJLmFkZChqb24udHJvbWJvbmUsICdhdXRvV29iYmxlJyk7XG4gICAgICAgIHZvaWNlR1VJLmFkZChqb24udHJvbWJvbmUuR2xvdHRpcywgJ2FkZFBpdGNoVmFyaWFuY2UnKS5saXN0ZW4oKTtcbiAgICAgICAgdm9pY2VHVUkuYWRkKGpvbi50cm9tYm9uZS5HbG90dGlzLCAnYWRkVGVuc2VuZXNzVmFyaWFuY2UnKS5saXN0ZW4oKTtcbiAgICAgICAgdm9pY2VHVUkuYWRkKGpvbi50cm9tYm9uZS5HbG90dGlzLCAnVUlUZW5zZW5lc3MnKS5taW4oMCkubWF4KDEpO1xuICAgICAgICB2b2ljZUdVSS5hZGQoam9uLnRyb21ib25lLkdsb3R0aXMsICd2aWJyYXRvQW1vdW50JykubWluKDApLm1heCgwLjUpO1xuICAgICAgICB2b2ljZUdVSS5hZGQoam9uLnRyb21ib25lLkdsb3R0aXMsICdVSUZyZXF1ZW5jeScpLm1pbigxKS5tYXgoMTAwMCkubGlzdGVuKCk7XG4gICAgICAgIHZvaWNlR1VJLmFkZChqb24udHJvbWJvbmUuR2xvdHRpcywgJ2xvdWRuZXNzJykubWluKDApLm1heCgxKS5saXN0ZW4oKTtcblxuICAgICAgICB2YXIgdHJhY3RHVUkgPSBndWkuYWRkRm9sZGVyKFwiVHJhY3RcIik7XG4gICAgICAgIHRyYWN0R1VJLmFkZChqb24udHJvbWJvbmUuVHJhY3QsICdtb3ZlbWVudFNwZWVkJykubWluKDEpLm1heCgzMCkuc3RlcCgxKTtcbiAgICAgICAgdHJhY3RHVUkuYWRkKGpvbi50cm9tYm9uZS5UcmFjdCwgJ3ZlbHVtVGFyZ2V0JykubWluKDAuMDAxKS5tYXgoMik7XG4gICAgICAgIHRyYWN0R1VJLmFkZChqb24udHJvbWJvbmUuVHJhY3RVSSwgJ3RhcmdldCcpLm1pbigwLjAwMSkubWF4KDEpO1xuICAgICAgICB0cmFjdEdVSS5hZGQoam9uLnRyb21ib25lLlRyYWN0VUksICdpbmRleCcpLm1pbigwKS5tYXgoNDMpLnN0ZXAoMSk7XG4gICAgICAgIHRyYWN0R1VJLmFkZChqb24udHJvbWJvbmUuVHJhY3RVSSwgJ3JhZGl1cycpLm1pbigwKS5tYXgoNSkuc3RlcCgxKTtcblxuICAgICAgICB2YXIgc29uZ0dVSSA9IGd1aS5hZGRGb2xkZXIoXCJtaWRpXCIpO1xuICAgICAgICBzb25nR1VJLmFkZChqb24ubWlkaUNvbnRyb2xsZXIsICdQbGF5U29uZycpO1xuICAgICAgICBzb25nR1VJLmFkZChqb24ubWlkaUNvbnRyb2xsZXIsICdTdG9wJyk7XG4gICAgICAgIHNvbmdHVUkuYWRkKGpvbi5taWRpQ29udHJvbGxlciwgJ1Jlc3RhcnQnKTtcbiAgICAgICAgc29uZ0dVSS5hZGQoam9uLm1pZGlDb250cm9sbGVyLCAnY3VycmVudFRyYWNrJykubWluKDApLm1heCgyMCkuc3RlcCgxKS5saXN0ZW4oKTtcbiAgICAgICAgc29uZ0dVSS5hZGQoam9uLm1pZGlDb250cm9sbGVyLCAnYmFzZUZyZXEnKS5taW4oMSkubWF4KDIwMDApO1xuICAgICAgICBzb25nR1VJLmFkZChqb24sICdmbGFwV2hpbGVTaW5naW5nJyk7XG4gICAgICAgIHNvbmdHVUkuYWRkKGpvbiwgJ2xlZ2F0bycpLmxpc3RlbigpO1xuICAgIH1cblxufSIsImltcG9ydCB7IE1vZGVsTG9hZGVyIH0gZnJvbSBcIi4vdXRpbHMvbW9kZWwtbG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBQaW5rVHJvbWJvbmUgfSBmcm9tIFwiLi9waW5rLXRyb21ib25lL3BpbmstdHJvbWJvbmUuanNcIjtcbmltcG9ydCB7IE1pZGlDb250cm9sbGVyIH0gZnJvbSBcIi4vbWlkaS9taWRpLWNvbnRyb2xsZXIuanNcIjtcbmltcG9ydCB7IE1pZGlEcm9wQXJlYSB9IGZyb20gXCIuL21pZGkvbWlkaS1kcm9wLWFyZWEuanNcIjtcblxuY2xhc3MgSm9uVHJvbWJvbmUge1xuXG4gICAgY29uc3RydWN0b3IoY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gXCJkZWZhdWx0XCI7XG5cbiAgICAgICAgLy8gU2V0IHVwIHJlbmRlcmVyIGFuZCBlbWJlZCBpbiBjb250YWluZXJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCB7IGFscGhhOiB0cnVlIH0gKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHRoaXMuY29udGFpbmVyLm9mZnNldFdpZHRoLCB0aGlzLmNvbnRhaW5lci5vZmZzZXRIZWlnaHQpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDApO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gICAgICAgIC8vIFNldCB1cCBzY2VuZSBhbmQgdmlld1xuICAgICAgICBsZXQgYXNwZWN0ID0gdGhpcy5jb250YWluZXIub2Zmc2V0V2lkdGggLyB0aGlzLmNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCA0NSwgYXNwZWN0LCAwLjEsIDEwMCApO1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICAgICAgLy8gRXhwb3J0IHNjZW5lIGZvciB0aHJlZSBqcyBpbnNwZWN0b3JcbiAgICAgICAgLy93aW5kb3cuc2NlbmUgPSB0aGlzLnNjZW5lO1xuXG4gICAgICAgIC8vIFNldCB1cCBjbG9jayBmb3IgdGltaW5nXG4gICAgICAgIHRoaXMuY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKTtcblxuICAgICAgICBsZXQgc3RhcnREZWxheU1TID0gMTAwMDtcbiAgICAgICAgdGhpcy50cm9tYm9uZSA9IG5ldyBQaW5rVHJvbWJvbmUodGhpcyk7XG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICAgICB0aGlzLnRyb21ib25lLlN0YXJ0QXVkaW8oKTtcbiAgICAgICAgICAgIC8vdGhpcy50cm9tYm9uZS5TZXRNdXRlKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5tb3ZlSmF3ID0gdHJ1ZTtcbiAgICAgICAgfSwgc3RhcnREZWxheU1TKTtcblxuICAgICAgICAvLyBNdXRlIGJ1dHRvbiBmb3IgdHJvbWJvbmVcbiAgICAgICAgLy8gbGV0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIC8vIGJ1dHRvbi5pbm5lckhUTUwgPSBcIk11dGVcIjtcbiAgICAgICAgLy8gYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgZGlzcGxheTogYmxvY2s7IHRvcDogMDsgbGVmdDogMDtcIjtcbiAgICAgICAgLy8gdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgLy8gYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIgKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAvLyAgICAgdGhpcy50cm9tYm9uZS5Ub2dnbGVNdXRlKCk7XG4gICAgICAgIC8vICAgICBidXR0b24uaW5uZXJIVE1MID0gdGhpcy50cm9tYm9uZS5tdXRlZCA/IFwiVW5tdXRlXCIgOiBcIk11dGVcIjtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgdGhpcy5qYXdGbGFwU3BlZWQgPSAyMC4wO1xuICAgICAgICB0aGlzLmphd09wZW5PZmZzZXQgPSAwLjE5O1xuICAgICAgICB0aGlzLm1vdmVKYXcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sZWdhdG8gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mbGFwV2hpbGVTaW5naW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5taWRpQ29udHJvbGxlciA9IG5ldyBNaWRpQ29udHJvbGxlcih0aGlzKTtcbiAgICAgICAgbGV0IGRyb3BBcmVhID0gbmV3IE1pZGlEcm9wQXJlYSh0aGlzKTtcblxuICAgICAgICB0aGlzLlNldFVwVGhyZWUoKTtcbiAgICAgICAgdGhpcy5TZXRVcFNjZW5lKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgdGhlIHVwZGF0ZSBsb29wXG4gICAgICAgIHRoaXMuT25VcGRhdGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdXAgbm9uLXNjZW5lIGNvbmZpZyBmb3IgVGhyZWUuanNcbiAgICAgKi9cbiAgICBTZXRVcFRocmVlKCkge1xuICAgICAgICBpZihUSFJFRS5PcmJpdENvbnRyb2xzICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgLy8gQWRkIG9yYml0IGNvbnRyb2xzXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoIHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbHMudGFyZ2V0LnNldCggMCwgMCwgMCApO1xuICAgICAgICAgICAgdGhpcy5jb250cm9scy51cGRhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIk5vIFRIUkVFLk9yYml0Q29udHJvbHMgZGV0ZWN0ZWQuIEluY2x1ZGUgdG8gYWxsb3cgaW50ZXJhY3Rpb24gd2l0aCB0aGUgbW9kZWwuXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUG9wdWxhdGVzIGFuZCBjb25maWd1cmVzIG9iamVjdHMgd2l0aGluIHRoZSBzY2VuZS5cbiAgICAgKi9cbiAgICBTZXRVcFNjZW5lKCkge1xuXG4gICAgICAgIC8vIFNldCBjYW1lcmEgcG9zaXRpb25cbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KCAwLCAwLCAwLjUgKTtcblxuICAgICAgICAvLyBMaWdodHNcbiAgICAgICAgbGV0IGxpZ2h0MSA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4NDQ0NDQ0LCAxLjApO1xuICAgICAgICBsaWdodDEubmFtZSA9IFwiSGVtaXNwaGVyZSBMaWdodFwiO1xuICAgICAgICBsaWdodDEucG9zaXRpb24uc2V0KDAsIDEsIDApO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChsaWdodDEpO1xuXG4gICAgICAgIGxldCBsaWdodDIgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMS4wKTtcbiAgICAgICAgbGlnaHQyLm5hbWUgPSBcIkRpcmVjdGlvbmFsIExpZ2h0XCI7XG4gICAgICAgIGxpZ2h0Mi5wb3NpdGlvbi5zZXQoMCwgMSwgMCk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGxpZ2h0Mik7XG5cbiAgICAgICAgLy8gTG9hZCB0aGUgSm9uIG1vZGVsIGFuZCBwbGFjZSBpdCBpbiB0aGUgc2NlbmVcbiAgICAgICAgTW9kZWxMb2FkZXIuTG9hZEpTT04oXCIuLi9yZXNvdXJjZXMvam9uL3RocmVlL2pvbi5qc29uXCIsIChvYmplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuam9uID0gb2JqZWN0O1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQoIHRoaXMuam9uICk7XG4gICAgICAgICAgICB0aGlzLmpvbi5yb3RhdGlvbi55ID0gKFRIUkVFLk1hdGguZGVnVG9SYWQoMTUpKTtcblxuICAgICAgICAgICAgdGhpcy5qYXcgPSB0aGlzLmpvbi5za2VsZXRvbi5ib25lcy5maW5kKChvYmopID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqLm5hbWUgPT0gXCJCb25lLjAwNlwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZih0aGlzLmphdyl7XG4gICAgICAgICAgICAgICAgdGhpcy5qYXdTaHV0WiA9IHRoaXMuamF3LnBvc2l0aW9uLno7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgZXZlcnkgZnJhbWUuIENvbnRpbnVlcyBpbmRlZmluaXRlbHkgYWZ0ZXIgYmVpbmcgY2FsbGVkIG9uY2UuXG4gICAgICovXG4gICAgT25VcGRhdGUoKSB7XG4gICAgICAgIGxldCBkZWx0YVRpbWUgPSB0aGlzLmNsb2NrLmdldERlbHRhKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5PblVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cbiAgICAgICAgaWYodGhpcy5taWRpQ29udHJvbGxlci5wbGF5aW5nKXtcblxuICAgICAgICAgICAgdGhpcy5ub3RlcyA9IHRoaXMubWlkaUNvbnRyb2xsZXIuR2V0UGl0Y2hlcygpO1xuICAgICAgICAgICAgaWYodGhpcy5ub3RlcyAhPSB0aGlzLmxhc3ROb3Rlcyl7XG4gICAgICAgICAgICAgICAgLy8gRG8gdGhlIG5vdGVcbiAgICAgICAgICAgICAgICBpZih0aGlzLm5vdGVzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5ub3Rlcy5sZW5ndGggIT0gMCl7IFxuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIG9uXG4gICAgICAgICAgICAgICAgICAgIC8vIFBsYXkgZnJlcXVlbmN5XG4gICAgICAgICAgICAgICAgICAgIGxldCBub3RlID0gdGhpcy5ub3Rlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5ub3Rlcy5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cgKFwiY2hvcmRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGZyZXEgPSB0aGlzLm1pZGlDb250cm9sbGVyLk1JRElUb0ZyZXF1ZW5jeShub3RlLm1pZGkpO1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGZyZXEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyb21ib25lLkdsb3R0aXMuVUlGcmVxdWVuY3kgPSBmcmVxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyb21ib25lLkdsb3R0aXMubG91ZG5lc3MgPSBub3RlLnZlbG9jaXR5O1xuICAgICAgICAgICAgICAgICAgICAvLyBPcGVuIGphd1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmphdy5wb3NpdGlvbi56ID0gdGhpcy5qYXdTaHV0WiArIHRoaXMuamF3T3Blbk9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cm9tYm9uZS5UcmFjdFVJLlNldExpcHNDbG9zZWQoMCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgeyBcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSBvZmZcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxlZ2F0bykgdGhpcy50cm9tYm9uZS5HbG90dGlzLmxvdWRuZXNzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2xvc2UgamF3XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuamF3LnBvc2l0aW9uLnogPSB0aGlzLmphd1NodXRaO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyb21ib25lLlRyYWN0VUkuU2V0TGlwc0Nsb3NlZCgxKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vdGVzID0gdGhpcy5ub3RlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5qYXcgJiYgdGhpcy5tb3ZlSmF3ICYmICghdGhpcy5taWRpQ29udHJvbGxlci5wbGF5aW5nIHx8IHRoaXMuZmxhcFdoaWxlU2luZ2luZykpe1xuICAgICAgICAgICAgbGV0IHRpbWUgPSB0aGlzLmNsb2NrLmdldEVsYXBzZWRUaW1lKCk7Ly8gJSA2MDtcblxuICAgICAgICAgICAgLy8gTW92ZSB0aGUgamF3XG4gICAgICAgICAgICBsZXQgcGVyY2VudCA9IChNYXRoLnNpbih0aW1lICogdGhpcy5qYXdGbGFwU3BlZWQpICsgMS4wKSAvIDIuMDtcbiAgICAgICAgICAgIHRoaXMuamF3LnBvc2l0aW9uLnogPSB0aGlzLmphd1NodXRaICsgKHBlcmNlbnQgKiB0aGlzLmphd09wZW5PZmZzZXQpO1xuXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSBhdWRpbyBtYXRjaCB0aGUgamF3IHBvc2l0aW9uXG4gICAgICAgICAgICB0aGlzLnRyb21ib25lLlRyYWN0VUkuU2V0TGlwc0Nsb3NlZCgxLjAgLSBwZXJjZW50KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVuZGVyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcblxuICAgIH1cblxufVxuXG5leHBvcnQgeyBKb25Ucm9tYm9uZSB9OyIsImltcG9ydCB7IERldGVjdG9yIH0gZnJvbSBcIi4vdXRpbHMvd2ViZ2wtZGV0ZWN0LmpzXCI7XG5pbXBvcnQgeyBKb25Ucm9tYm9uZSB9IGZyb20gXCIuL2pvbi10cm9tYm9uZS5qc1wiO1xuaW1wb3J0IHsgR1VJIH0gZnJvbSBcIi4vZ3VpLmpzXCI7XG5cbi8vIE9wdGlvbmFsbHkgYnVuZGxlIHRocmVlLmpzIGFzIHBhcnQgb2YgdGhlIHByb2plY3Rcbi8vaW1wb3J0IFRIUkVFTGliIGZyb20gXCJ0aHJlZS1qc1wiO1xuLy92YXIgVEhSRUUgPSBUSFJFRUxpYigpOyAvLyByZXR1cm4gVEhSRUUgSlNcblxubGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiam9uLXRyb21ib25lLWNvbnRhaW5lclwiKTtcblxuaWYgKCAhRGV0ZWN0b3IuSGFzV2ViR0woKSApIHtcbiAgICAvL2V4aXQoXCJXZWJHTCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3Nlci5cIik7XG4gICAgY29uc29sZS5sb2coXCJXZWJHTCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3Nlci5cIik7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IERldGVjdG9yLkdldEVycm9ySFRNTCgpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwibm8td2ViZ2xcIik7XG59XG5lbHNle1xuICAgIGxldCBqb25Ucm9tYm9uZSA9IG5ldyBKb25Ucm9tYm9uZShjb250YWluZXIpO1xuICAgIEdVSS5Jbml0KGpvblRyb21ib25lKTtcbn0iLCJsZXQgTWlkaUNvbnZlcnQgPSByZXF1aXJlKCdtaWRpY29udmVydCcpO1xuXG4vKipcbiAqIFNpbXBsZSBjbGFzcyBmb3IgTUlESSBwbGF5YmFjay5cbiAqIFRoZSBwYXJhZGlnbSBoZXJlJ3MgYSBiaXQgd2VpcmQ7IGl0J3MgdXAgdG8gYW4gZXh0ZXJuYWxcbiAqIHNvdXJjZSB0byBhY3R1YWxseSBwcm9kdWNlIGF1ZGlvLiBUaGlzIGNsYXNzIGp1c3QgbWFuYWdlc1xuICogYSB0aW1lciwgd2hpY2ggR2V0UGl0Y2goKSByZWFkcyB0byBwcm9kdWNlIHRoZSBcImN1cnJlbnRcIlxuICogbm90ZSBpbmZvcm1hdGlvbi4gXG4gKiBcbiAqIEFzIGFuIGV4YW1wbGUgb2YgdXNhZ2UsIGpvbi10cm9tYm9uZSBjYWxscyBQbGF5U29uZygpIHRvXG4gKiBiZWdpbiwgYW5kIHRoZW4gZXZlcnkgZnJhbWUgdXNlcyBHZXRQaXRjaCgpIHRvIGZpZ3VyZSBvdXRcbiAqIHdoYXQgdGhlIGN1cnJlbnQgZnJlcXVlbmN5IHRvIHByb2R1Y2UgaXMuXG4gKi9cbmNsYXNzIE1pZGlDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcblxuICAgICAgICB0aGlzLm1pZGkgPSBudWxsO1xuXG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmN1cnJlbnRUcmFjayA9IDU7XG5cbiAgICAgICAgdGhpcy5iYXNlRnJlcSA9IDQ0MDsgLy8xMTAgaXMgQTRcblxuICAgICAgICB0aGlzLmNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhbmQgcGFyc2VzIGEgTUlESSBmaWxlLlxuICAgICAqL1xuICAgIExvYWRTb25nKHBhdGgsIGNhbGxiYWNrKXtcbiAgICAgICAgdGhpcy5TdG9wKCk7XG4gICAgICAgIHRoaXMubWlkaSA9IG51bGw7XG4gICAgICAgIE1pZGlDb252ZXJ0LmxvYWQocGF0aCwgKG1pZGkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTUlESSBsb2FkZWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5taWRpID0gbWlkaTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubWlkaSk7XG4gICAgICAgICAgICBpZihjYWxsYmFjaykgY2FsbGJhY2sobWlkaSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIExvYWRTb25nRGlyZWN0KGZpbGUpe1xuICAgICAgICB0aGlzLlN0b3AoKTtcbiAgICAgICAgdGhpcy5taWRpID0gTWlkaUNvbnZlcnQucGFyc2UoZmlsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTUlESSBsb2FkZWQuXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm1pZGkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHBpdGNoIGZvciB0aGUgc3BlY2lmaWVkIHRyYWNrIGF0IHRoZSBjdXJyZW50IHRpbWUgaW4gdGhlIHNvbmcuXG4gICAgICovXG4gICAgR2V0UGl0Y2godHJhY2tJbmRleCA9IHRoaXMuY3VycmVudFRyYWNrKXtcbiAgICAgICAgbGV0IHRpbWUgPSB0aGlzLkdldFNvbmdQcm9ncmVzcygpO1xuXG4gICAgICAgIC8vIENvbnN0cmFpbiB0cmFjayBzcGVjaWZpZWQgdG8gdmFsaWQgcmFuZ2VcbiAgICAgICAgdHJhY2tJbmRleCA9IE1hdGgubWluKHRyYWNrSW5kZXgsIHRoaXMubWlkaS50cmFja3MubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRyYWNrSW5kZXggPSBNYXRoLm1heCh0cmFja0luZGV4LCAwKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5taWRpLnRyYWNrc1t0cmFja0luZGV4XS5ub3Rlcy5maW5kKChpdGVtKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5ub3RlT24gPD0gdGltZSAmJiB0aW1lIDw9IGl0ZW0ubm90ZU9mZjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgR2V0UGl0Y2hlcyh0cmFja0luZGV4ID0gdGhpcy5jdXJyZW50VHJhY2spe1xuICAgICAgICBsZXQgdGltZSA9IHRoaXMuR2V0U29uZ1Byb2dyZXNzKCk7XG5cbiAgICAgICAgLy8gQ29uc3RyYWluIHRyYWNrIHNwZWNpZmllZCB0byB2YWxpZCByYW5nZVxuICAgICAgICB0cmFja0luZGV4ID0gTWF0aC5taW4odHJhY2tJbmRleCwgdGhpcy5taWRpLnRyYWNrcy5sZW5ndGggLSAxKTtcbiAgICAgICAgdHJhY2tJbmRleCA9IE1hdGgubWF4KHRyYWNrSW5kZXgsIDApO1xuXG4gICAgICAgIHJldHVybiB0aGlzLm1pZGkudHJhY2tzW3RyYWNrSW5kZXhdLm5vdGVzLmZpbHRlcihpdGVtID0+IFxuICAgICAgICAgICAgaXRlbS5ub3RlT24gPD0gdGltZSAmJiB0aW1lIDw9IGl0ZW0ubm90ZU9mZik7XG4gICAgfVxuXG4gICAgUGxheVNvbmcodHJhY2sgPSA1KXtcbiAgICAgICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIG5vIHNvbmcgaXMgc3BlY2lmaWVkLCBsb2FkIGEgc29uZ1xuICAgICAgICBpZighdGhpcy5taWRpKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm8gTUlESSBpcyBsb2FkZWQuIExvYWRpbmcgYW4gZXhhbXBsZS4uLlwiKTtcbiAgICAgICAgICAgIHRoaXMuTG9hZFNvbmcoJy4uL3Jlc291cmNlcy9taWRpL3VuLW93ZW4td2FzLWhlci5taWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5QbGF5U29uZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUdXJuIG9mZiBzb21lIHN0dWZmIHNvIHRoZSBzaW5naW5nIGtpbmQgb2Ygc291bmRzIG9rYXlcbiAgICAgICAgdGhpcy5FbnRlclNpbmdNb2RlKCk7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50VHJhY2sgPSB0cmFjaztcbiAgICAgICAgdGhpcy5jbG9jay5zdGFydCgpO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUGxheWJhY2sgc3RhcnRlZC5cIik7XG5cbiAgICB9XG5cbiAgICBHZXRTb25nUHJvZ3Jlc3MoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvY2suZ2V0RWxhcHNlZFRpbWUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBmcm9tIGEgTUlESSBub3RlIGNvZGUgdG8gaXRzIGNvcnJlc3BvbmRpbmcgZnJlcXVlbmN5LlxuICAgICAqIEBwYXJhbSB7Kn0gbWlkaUNvZGUgXG4gICAgICovXG4gICAgTUlESVRvRnJlcXVlbmN5KG1pZGlDb2RlKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZUZyZXEgKiBNYXRoLnBvdygyLCAobWlkaUNvZGUgLSA2OSkgLyAxMik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIHBsYXliYWNrLlxuICAgICAqL1xuICAgIFJlc3RhcnQoKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJQbGF5YmFjayBtb3ZlZCB0byBiZWdpbm5pbmcuXCIpO1xuICAgICAgICB0aGlzLmNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgcGxheWJhY2suXG4gICAgICovXG4gICAgU3RvcCgpIHtcbiAgICAgICAgaWYoIXRoaXMucGxheWluZyl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJQbGF5YmFjayBzdG9wcGVkLlwiKTtcbiAgICAgICAgdGhpcy5jbG9jay5zdG9wKCk7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLkV4aXRTaW5nTW9kZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgdGhlIHRyb21ib25lIGZvciBzaW5naW5nLlxuICAgICAqL1xuICAgIEVudGVyU2luZ01vZGUoKXtcbiAgICAgICAgaWYodGhpcy5iYWNrdXBfc2V0dGluZ3Mpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iYWNrdXBfc2V0dGluZ3MgPSB7fTtcblxuICAgICAgICB0aGlzLmJhY2t1cF9zZXR0aW5nc1tcImF1dG9Xb2JibGVcIl0gPSB0aGlzLmNvbnRyb2xsZXIudHJvbWJvbmUuYXV0b1dvYmJsZTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnRyb21ib25lLmF1dG9Xb2JibGUgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmJhY2t1cF9zZXR0aW5nc1tcImFkZFBpdGNoVmFyaWFuY2VcIl0gPSB0aGlzLmNvbnRyb2xsZXIudHJvbWJvbmUuR2xvdHRpcy5hZGRQaXRjaFZhcmlhbmNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIudHJvbWJvbmUuR2xvdHRpcy5hZGRQaXRjaFZhcmlhbmNlID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5iYWNrdXBfc2V0dGluZ3NbXCJhZGRUZW5zZW5lc3NWYXJpYW5jZVwiXSA9IHRoaXMuY29udHJvbGxlci50cm9tYm9uZS5HbG90dGlzLmFkZFRlbnNlbmVzc1ZhcmlhbmNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIudHJvbWJvbmUuR2xvdHRpcy5hZGRUZW5zZW5lc3NWYXJpYW5jZSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYmFja3VwX3NldHRpbmdzW1widmlicmF0b0ZyZXF1ZW5jeVwiXSA9IHRoaXMuY29udHJvbGxlci50cm9tYm9uZS5HbG90dGlzLnZpYnJhdG9GcmVxdWVuY3k7XG4gICAgICAgIHRoaXMuY29udHJvbGxlci50cm9tYm9uZS5HbG90dGlzLnZpYnJhdG9GcmVxdWVuY3kgPSAwO1xuXG4gICAgICAgIHRoaXMuYmFja3VwX3NldHRpbmdzW1wiZnJlcXVlbmN5XCJdID0gdGhpcy5jb250cm9sbGVyLnRyb21ib25lLkdsb3R0aXMuVUlGcmVxdWVuY3k7XG5cbiAgICAgICAgdGhpcy5iYWNrdXBfc2V0dGluZ3NbXCJsb3VkbmVzc1wiXSA9IHRoaXMuY29udHJvbGxlci50cm9tYm9uZS5HbG90dGlzLmxvdWRuZXNzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc3RvcmVzIHRoZSB0cm9tYm9uZSB0byB0aGUgc3RhdGUgaXQgd2FzIGluIGJlZm9yZSBzaW5naW5nLlxuICAgICAqL1xuICAgIEV4aXRTaW5nTW9kZSgpe1xuICAgICAgICBpZighdGhpcy5iYWNrdXBfc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnRyb21ib25lLmF1dG9Xb2JibGUgPSB0aGlzLmJhY2t1cF9zZXR0aW5nc1tcImF1dG9Xb2JibGVcIl07XG4gICAgICAgIHRoaXMuY29udHJvbGxlci50cm9tYm9uZS5HbG90dGlzLmFkZFBpdGNoVmFyaWFuY2UgPSB0aGlzLmJhY2t1cF9zZXR0aW5nc1tcImFkZFBpdGNoVmFyaWFuY2VcIl07XG4gICAgICAgIHRoaXMuY29udHJvbGxlci50cm9tYm9uZS5HbG90dGlzLmFkZFRlbnNlbmVzc1ZhcmlhbmNlID0gdGhpcy5iYWNrdXBfc2V0dGluZ3NbXCJhZGRUZW5zZW5lc3NWYXJpYW5jZVwiXTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnRyb21ib25lLkdsb3R0aXMudmlicmF0b0ZyZXF1ZW5jeSA9IHRoaXMuYmFja3VwX3NldHRpbmdzW1widmlicmF0b0ZyZXF1ZW5jeVwiXTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnRyb21ib25lLkdsb3R0aXMuVUlGcmVxdWVuY3kgPSB0aGlzLmJhY2t1cF9zZXR0aW5nc1tcImZyZXF1ZW5jeVwiXTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnRyb21ib25lLkdsb3R0aXMubG91ZG5lc3MgPSB0aGlzLmJhY2t1cF9zZXR0aW5nc1tcImxvdWRuZXNzXCJdO1xuXG4gICAgICAgIHRoaXMuYmFja3VwX3NldHRpbmdzID0gbnVsbDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgTWlkaUNvbnRyb2xsZXIgfTsiLCJcbi8qKlxuICogRHJvcC1pbiBkcmFnIGFuZCBkcm9wIHN1cHBvcnQgZm9yIHRoZSBNaWRpQ29udHJvbGxlclxuICovXG5leHBvcnQgY2xhc3MgTWlkaURyb3BBcmVhIHtcbiAgICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyKXtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcblxuICAgICAgICB0aGlzLmRyb3BBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgICAgICB0aGlzLmRyb3BBcmVhLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICB0aGlzLmRyb3BBcmVhLnN0eWxlLnRvcCA9IFwiMFwiO1xuICAgICAgICB0aGlzLmRyb3BBcmVhLnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICAgICAgdGhpcy5kcm9wQXJlYS5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xuICAgICAgICB0aGlzLmRyb3BBcmVhLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuXG4gICAgICAgIHRoaXMuTWFrZURyb3BwYWJsZSh0aGlzLmRyb3BBcmVhLCAoZmlsZXMpID0+IHtcbiAgICAgICAgICAgIC8vcmVhZCB0aGUgZmlsZVxuXHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRyZWFkZXIub25sb2FkID0gKGUpID0+IHtcblx0XHRcdFx0dGhpcy5jb250cm9sbGVyLm1pZGlDb250cm9sbGVyLkxvYWRTb25nRGlyZWN0KHJlYWRlci5yZXN1bHQpO1xuXHRcdFx0fTtcblx0XHRcdHJlYWRlci5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZXNbMF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZHJvcEFyZWEpO1xuXG4gICAgfVxuXG4gICAgQ2FsbGJhY2soKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJDYWxsYmFja1wiKTtcbiAgICB9XG5cbiAgICAvLyBGcm9tIGh0dHA6Ly9iaXR3aXNlci5pbi8yMDE1LzA4LzA4L2NyZWF0aW5nLWRyb3B6b25lLWZvci1kcmFnLWRyb3AtZmlsZS5odG1sXG4gICAgTWFrZURyb3BwYWJsZShlbGVtZW50LCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdmaWxlJyk7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnbXVsdGlwbGUnLCB0cnVlKTtcbiAgICAgICAgaW5wdXQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0cmlnZ2VyQ2FsbGJhY2spO1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkcmFnb3ZlcicpO1xuICAgICAgICB9KTtcblxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XG4gICAgICAgICAgICB0cmlnZ2VyQ2FsbGJhY2soZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgaW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAvLyAgICAgaW5wdXQuY2xpY2soKTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdHJpZ2dlckNhbGxiYWNrKGUpIHtcbiAgICAgICAgICAgIHZhciBmaWxlcztcbiAgICAgICAgICAgIGlmKGUuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICBmaWxlcyA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzO1xuICAgICAgICAgICAgfSBlbHNlIGlmKGUudGFyZ2V0KSB7XG4gICAgICAgICAgICBmaWxlcyA9IGUudGFyZ2V0LmZpbGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChudWxsLCBmaWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBcbn0iLCJjbGFzcyBBdWRpb1N5c3RlbSB7ICBcblxuICAgIGNvbnN0cnVjdG9yKHRyb21ib25lKSB7XG4gICAgICAgIHRoaXMudHJvbWJvbmUgPSB0cm9tYm9uZTtcblxuICAgICAgICB0aGlzLmJsb2NrTGVuZ3RoID0gNTEyO1xuICAgICAgICB0aGlzLmJsb2NrVGltZSA9IDE7XG4gICAgICAgIHRoaXMuc291bmRPbiA9IGZhbHNlO1xuXG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgd2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG4gICAgICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKTtcbiAgICAgICAgdGhpcy50cm9tYm9uZS5zYW1wbGVSYXRlID0gdGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYmxvY2tUaW1lID0gdGhpcy5ibG9ja0xlbmd0aC90aGlzLnRyb21ib25lLnNhbXBsZVJhdGU7XG4gICAgfVxuICAgIFxuICAgIHN0YXJ0U291bmQoKSB7XG4gICAgICAgIC8vc2NyaXB0UHJvY2Vzc29yIG1heSBuZWVkIGEgZHVtbXkgaW5wdXQgY2hhbm5lbCBvbiBpT1NcbiAgICAgICAgdGhpcy5zY3JpcHRQcm9jZXNzb3IgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IodGhpcy5ibG9ja0xlbmd0aCwgMiwgMSk7XG4gICAgICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pOyBcbiAgICAgICAgdGhpcy5zY3JpcHRQcm9jZXNzb3Iub25hdWRpb3Byb2Nlc3MgPSB0aGlzLmRvU2NyaXB0UHJvY2Vzc29yLmJpbmQodGhpcyk7XG4gICAgXG4gICAgICAgIHZhciB3aGl0ZU5vaXNlID0gdGhpcy5jcmVhdGVXaGl0ZU5vaXNlTm9kZSgyICogdGhpcy50cm9tYm9uZS5zYW1wbGVSYXRlKTsgLy8gMiBzZWNvbmRzIG9mIG5vaXNlXG4gICAgICAgIFxuICAgICAgICB2YXIgYXNwaXJhdGVGaWx0ZXIgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcbiAgICAgICAgYXNwaXJhdGVGaWx0ZXIudHlwZSA9IFwiYmFuZHBhc3NcIjtcbiAgICAgICAgYXNwaXJhdGVGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gNTAwO1xuICAgICAgICBhc3BpcmF0ZUZpbHRlci5RLnZhbHVlID0gMC41O1xuICAgICAgICB3aGl0ZU5vaXNlLmNvbm5lY3QoYXNwaXJhdGVGaWx0ZXIpOyAgLy8gVXNlIHdoaXRlIG5vaXNlIGFzIGlucHV0IGZvciBmaWx0ZXJcbiAgICAgICAgYXNwaXJhdGVGaWx0ZXIuY29ubmVjdCh0aGlzLnNjcmlwdFByb2Nlc3Nvcik7ICAvLyBVc2UgdGhpcyBhcyBpbnB1dCAwIGZvciBzY3JpcHQgcHJvY2Vzc29yXG4gICAgICAgIFxuICAgICAgICB2YXIgZnJpY2F0aXZlRmlsdGVyID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XG4gICAgICAgIGZyaWNhdGl2ZUZpbHRlci50eXBlID0gXCJiYW5kcGFzc1wiO1xuICAgICAgICBmcmljYXRpdmVGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gMTAwMDtcbiAgICAgICAgZnJpY2F0aXZlRmlsdGVyLlEudmFsdWUgPSAwLjU7XG4gICAgICAgIHdoaXRlTm9pc2UuY29ubmVjdChmcmljYXRpdmVGaWx0ZXIpOyAgLy8gVXNlIHdoaXRlIG5vaXNlIGFzIGlucHV0XG4gICAgICAgIGZyaWNhdGl2ZUZpbHRlci5jb25uZWN0KHRoaXMuc2NyaXB0UHJvY2Vzc29yKTsgIC8vIFVzZSB0aGlzIGFzIGlucHV0IDEgZm9yIHNjcmlwdCBwcm9jZXNzb3JcbiAgICAgICAgXG4gICAgICAgIHdoaXRlTm9pc2Uuc3RhcnQoMCk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUganVzdCB3aGl0ZSBub2lzZSAodGVzdClcbiAgICAgICAgLy8gdmFyIHduID0gdGhpcy5jcmVhdGVXaGl0ZU5vaXNlTm9kZSgyKnRoaXMudHJvbWJvbmUuc2FtcGxlUmF0ZSk7XG4gICAgICAgIC8vIHduLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICAvLyB3bi5zdGFydCgwKTtcbiAgICB9XG4gICAgXG4gICAgY3JlYXRlV2hpdGVOb2lzZU5vZGUoZnJhbWVDb3VudCkge1xuICAgICAgICB2YXIgbXlBcnJheUJ1ZmZlciA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlcigxLCBmcmFtZUNvdW50LCB0aGlzLnRyb21ib25lLnNhbXBsZVJhdGUpO1xuXG4gICAgICAgIHZhciBub3dCdWZmZXJpbmcgPSBteUFycmF5QnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyYW1lQ291bnQ7IGkrKykgXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vd0J1ZmZlcmluZ1tpXSA9IE1hdGgucmFuZG9tKCk7Ly8gZ2F1c3NpYW4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzb3VyY2UgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IG15QXJyYXlCdWZmZXI7XG4gICAgICAgIHNvdXJjZS5sb29wID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZU5vZGUoKSB7XG4gICAgLy8gICAgIGxldCBidWZmZXIgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoMSwgZnJhbWVDb3VudCwgdGhpcy50cm9tYm9uZS5zYW1wbGVSYXRlKTtcblxuICAgICAgICBcblxuICAgIC8vICAgICB2YXIgc291cmNlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgLy8gICAgIHNvdXJjZS5idWZmZXIgPSBidWZmZXI7XG4gICAgLy8gICAgIHNvdXJjZS5sb29wID0gdHJ1ZTtcblxuICAgIC8vICAgICByZXR1cm4gc291cmNlO1xuICAgIC8vIH1cbiAgICBcbiAgICBcbiAgICBkb1NjcmlwdFByb2Nlc3NvcihldmVudCkge1xuICAgICAgICB2YXIgaW5wdXRBcnJheTEgPSBldmVudC5pbnB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTsgIC8vIEdsb3R0aXMgaW5wdXRcbiAgICAgICAgdmFyIGlucHV0QXJyYXkyID0gZXZlbnQuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMSk7ICAvLyBUcmFjdCBpbnB1dFxuICAgICAgICB2YXIgb3V0QXJyYXkgPSBldmVudC5vdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7ICAvLyBPdXRwdXQgKG1vbm8pXG4gICAgICAgIGZvciAodmFyIGogPSAwLCBOID0gb3V0QXJyYXkubGVuZ3RoOyBqIDwgTjsgaisrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgbGFtYmRhMSA9IGovTjtcbiAgICAgICAgICAgIHZhciBsYW1iZGEyID0gKGorMC41KS9OO1xuICAgICAgICAgICAgdmFyIGdsb3R0YWxPdXRwdXQgPSB0aGlzLnRyb21ib25lLkdsb3R0aXMucnVuU3RlcChsYW1iZGExLCBpbnB1dEFycmF5MVtqXSk7IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgdm9jYWxPdXRwdXQgPSAwO1xuICAgICAgICAgICAgLy9UcmFjdCBydW5zIGF0IHR3aWNlIHRoZSBzYW1wbGUgcmF0ZSBcbiAgICAgICAgICAgIHRoaXMudHJvbWJvbmUuVHJhY3QucnVuU3RlcChnbG90dGFsT3V0cHV0LCBpbnB1dEFycmF5MltqXSwgbGFtYmRhMSk7XG4gICAgICAgICAgICB2b2NhbE91dHB1dCArPSB0aGlzLnRyb21ib25lLlRyYWN0LmxpcE91dHB1dCArIHRoaXMudHJvbWJvbmUuVHJhY3Qubm9zZU91dHB1dDtcbiAgICAgICAgICAgIHRoaXMudHJvbWJvbmUuVHJhY3QucnVuU3RlcChnbG90dGFsT3V0cHV0LCBpbnB1dEFycmF5MltqXSwgbGFtYmRhMik7XG4gICAgICAgICAgICB2b2NhbE91dHB1dCArPSB0aGlzLnRyb21ib25lLlRyYWN0LmxpcE91dHB1dCArIHRoaXMudHJvbWJvbmUuVHJhY3Qubm9zZU91dHB1dDtcbiAgICAgICAgICAgIG91dEFycmF5W2pdID0gdm9jYWxPdXRwdXQgKiAwLjEyNTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih0aGlzLnRyb21ib25lLmNvbnRyb2xsZXIubm90ZXMgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIC8vICAgICBmb3IgKHZhciBub3RlSW5kZXggPSAxOyBub3RlSW5kZXggPCB0aGlzLnRyb21ib25lLmNvbnRyb2xsZXIubm90ZXMubGVuZ3RoOyBub3RlSW5kZXgrKyl7XG4gICAgICAgIC8vICAgICAgICAgaWYobm90ZUluZGV4ID4gdGhpcy5udW1Wb2ljZXMgLSAxKSByZXR1cm47XG4gICAgICAgIC8vICAgICAgICAgbGV0IG5vdGUgPSB0aGlzLnRyb21ib25lLmNvbnRyb2xsZXIubm90ZXNbbm90ZUluZGV4XTtcbiAgICAgICAgLy8gICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGUpO1xuXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy50cm9tYm9uZS5HbG90dGlzLmZpbmlzaEJsb2NrKCk7XG4gICAgICAgIHRoaXMudHJvbWJvbmUuVHJhY3QuZmluaXNoQmxvY2soKTtcbiAgICB9XG4gICAgXG4gICAgbXV0ZSgpIHtcbiAgICAgICAgdGhpcy5zY3JpcHRQcm9jZXNzb3IuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgICBcbiAgICB1bm11dGUoKSB7XG4gICAgICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pOyBcbiAgICB9XG4gICAgXG59XG5cbmV4cG9ydHMuQXVkaW9TeXN0ZW0gPSBBdWRpb1N5c3RlbTsiLCJpbXBvcnQgbm9pc2UgZnJvbSBcIi4uL25vaXNlLmpzXCI7XG5cbmNsYXNzIEdsb3R0aXMge1xuXG4gICAgY29uc3RydWN0b3IodHJvbWJvbmUpIHtcbiAgICAgICAgdGhpcy50cm9tYm9uZSA9IHRyb21ib25lO1xuXG4gICAgICAgIHRoaXMudGltZUluV2F2ZWZvcm0gPSAwO1xuICAgICAgICB0aGlzLm9sZEZyZXF1ZW5jeSA9IDE0MDtcbiAgICAgICAgdGhpcy5uZXdGcmVxdWVuY3kgPSAxNDA7XG4gICAgICAgIHRoaXMuVUlGcmVxdWVuY3kgPSAxNDA7XG4gICAgICAgIHRoaXMuc21vb3RoRnJlcXVlbmN5ID0gMTQwO1xuICAgICAgICB0aGlzLm9sZFRlbnNlbmVzcyA9IDAuNjtcbiAgICAgICAgdGhpcy5uZXdUZW5zZW5lc3MgPSAwLjY7XG4gICAgICAgIHRoaXMuVUlUZW5zZW5lc3MgPSAwLjY7XG4gICAgICAgIHRoaXMudG90YWxUaW1lID0gMDtcbiAgICAgICAgdGhpcy52aWJyYXRvQW1vdW50ID0gMC4wMDU7XG4gICAgICAgIHRoaXMudmlicmF0b0ZyZXF1ZW5jeSA9IDY7XG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gMDtcbiAgICAgICAgdGhpcy5sb3VkbmVzcyA9IDE7XG4gICAgICAgIHRoaXMuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudG91Y2ggPSAwO1xuICAgICAgICB0aGlzLnggPSAyNDA7XG4gICAgICAgIHRoaXMueSA9IDUzMDtcblxuICAgICAgICB0aGlzLmtleWJvYXJkVG9wID0gNTAwO1xuICAgICAgICB0aGlzLmtleWJvYXJkTGVmdCA9IDA7XG4gICAgICAgIHRoaXMua2V5Ym9hcmRXaWR0aCA9IDYwMDtcbiAgICAgICAgdGhpcy5rZXlib2FyZEhlaWdodCA9IDEwMDtcbiAgICAgICAgdGhpcy5zZW1pdG9uZXMgPSAyMDtcbiAgICAgICAgdGhpcy5tYXJrcyA9IFswLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAxLCAwLCAwLCAwLCAwXTtcbiAgICAgICAgdGhpcy5iYXNlTm90ZSA9IDg3LjMwNzE7IC8vRlxuXG4gICAgICAgIHRoaXMub3V0cHV0O1xuXG4gICAgICAgIC8vLyBBbGxvdyBwaXRjaCB0byB3b2JibGUgb3ZlciB0aW1lXG4gICAgICAgIHRoaXMuYWRkUGl0Y2hWYXJpYW5jZSA9IHRydWU7XG4gICAgICAgIC8vLyBBbGxvdyB0ZW5zZW5lc3MgdG8gd29iYmxlIG92ZXIgdGltZVxuICAgICAgICB0aGlzLmFkZFRlbnNlbmVzc1ZhcmlhbmNlID0gdHJ1ZTtcblxuICAgIH1cbiAgICBcbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLnNldHVwV2F2ZWZvcm0oMCk7XG4gICAgfVxuICAgIFxuICAgIGhhbmRsZVRvdWNoZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLnRvdWNoICE9IDAgJiYgIXRoaXMudG91Y2guYWxpdmUpIHRoaXMudG91Y2ggPSAwO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMudG91Y2ggPT0gMClcbiAgICAgICAgeyAgICAgICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8VUkudG91Y2hlc1dpdGhNb3VzZS5sZW5ndGg7IGorKykgIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB0b3VjaCA9IFVJLnRvdWNoZXNXaXRoTW91c2Vbal07XG4gICAgICAgICAgICAgICAgaWYgKCF0b3VjaC5hbGl2ZSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoLnk8dGhpcy5rZXlib2FyZFRvcCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgdGhpcy50b3VjaCA9IHRvdWNoO1xuICAgICAgICAgICAgfSAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMudG91Y2ggIT0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGxvY2FsX3kgPSB0aGlzLnRvdWNoLnkgLSAgdGhpcy5rZXlib2FyZFRvcC0xMDtcbiAgICAgICAgICAgIHZhciBsb2NhbF94ID0gdGhpcy50b3VjaC54IC0gdGhpcy5rZXlib2FyZExlZnQ7XG4gICAgICAgICAgICBsb2NhbF95ID0gTWF0aC5jbGFtcChsb2NhbF95LCAwLCB0aGlzLmtleWJvYXJkSGVpZ2h0LTI2KTtcbiAgICAgICAgICAgIHZhciBzZW1pdG9uZSA9IHRoaXMuc2VtaXRvbmVzICogbG9jYWxfeCAvIHRoaXMua2V5Ym9hcmRXaWR0aCArIDAuNTtcbiAgICAgICAgICAgIEdsb3R0aXMuVUlGcmVxdWVuY3kgPSB0aGlzLmJhc2VOb3RlICogTWF0aC5wb3coMiwgc2VtaXRvbmUvMTIpO1xuICAgICAgICAgICAgaWYgKEdsb3R0aXMuaW50ZW5zaXR5ID09IDApIEdsb3R0aXMuc21vb3RoRnJlcXVlbmN5ID0gR2xvdHRpcy5VSUZyZXF1ZW5jeTtcbiAgICAgICAgICAgIC8vR2xvdHRpcy5VSVJkID0gMypsb2NhbF95IC8gKHRoaXMua2V5Ym9hcmRIZWlnaHQtMjApO1xuICAgICAgICAgICAgdmFyIHQgPSBNYXRoLmNsYW1wKDEtbG9jYWxfeSAvICh0aGlzLmtleWJvYXJkSGVpZ2h0LTI4KSwgMCwgMSk7XG4gICAgICAgICAgICBHbG90dGlzLlVJVGVuc2VuZXNzID0gMS1NYXRoLmNvcyh0Kk1hdGguUEkqMC41KTtcbiAgICAgICAgICAgIEdsb3R0aXMubG91ZG5lc3MgPSBNYXRoLnBvdyhHbG90dGlzLlVJVGVuc2VuZXNzLCAwLjI1KTtcbiAgICAgICAgICAgIHRoaXMueCA9IHRoaXMudG91Y2gueDtcbiAgICAgICAgICAgIHRoaXMueSA9IGxvY2FsX3kgKyB0aGlzLmtleWJvYXJkVG9wKzEwO1xuICAgICAgICB9XG4gICAgICAgIEdsb3R0aXMuaXNUb3VjaGVkID0gKHRoaXMudG91Y2ggIT0gMCk7XG4gICAgfVxuICAgICAgICBcbiAgICBydW5TdGVwKGxhbWJkYSwgbm9pc2VTb3VyY2UpIHtcbiAgICAgICAgdmFyIHRpbWVTdGVwID0gMS4wIC8gdGhpcy50cm9tYm9uZS5zYW1wbGVSYXRlO1xuICAgICAgICB0aGlzLnRpbWVJbldhdmVmb3JtICs9IHRpbWVTdGVwO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSArPSB0aW1lU3RlcDtcbiAgICAgICAgaWYgKHRoaXMudGltZUluV2F2ZWZvcm0gPiB0aGlzLndhdmVmb3JtTGVuZ3RoKSBcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy50aW1lSW5XYXZlZm9ybSAtPSB0aGlzLndhdmVmb3JtTGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5zZXR1cFdhdmVmb3JtKGxhbWJkYSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG91dCA9IHRoaXMubm9ybWFsaXplZExGV2F2ZWZvcm0odGhpcy50aW1lSW5XYXZlZm9ybS90aGlzLndhdmVmb3JtTGVuZ3RoKTtcbiAgICAgICAgdmFyIGFzcGlyYXRpb24gPSB0aGlzLmludGVuc2l0eSooMS4wLU1hdGguc3FydCh0aGlzLlVJVGVuc2VuZXNzKSkqdGhpcy5nZXROb2lzZU1vZHVsYXRvcigpKm5vaXNlU291cmNlO1xuICAgICAgICBhc3BpcmF0aW9uICo9IDAuMiArIDAuMDIgKiBub2lzZS5zaW1wbGV4MSh0aGlzLnRvdGFsVGltZSAqIDEuOTkpO1xuICAgICAgICBvdXQgKz0gYXNwaXJhdGlvbjtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgXG4gICAgZ2V0Tm9pc2VNb2R1bGF0b3IoKSB7XG4gICAgICAgIHZhciB2b2ljZWQgPSAwLjErMC4yKk1hdGgubWF4KDAsTWF0aC5zaW4oTWF0aC5QSSoyKnRoaXMudGltZUluV2F2ZWZvcm0vdGhpcy53YXZlZm9ybUxlbmd0aCkpO1xuICAgICAgICAvL3JldHVybiAwLjM7XG4gICAgICAgIHJldHVybiB0aGlzLlVJVGVuc2VuZXNzKiB0aGlzLmludGVuc2l0eSAqIHZvaWNlZCArICgxLXRoaXMuVUlUZW5zZW5lc3MqIHRoaXMuaW50ZW5zaXR5ICkgKiAwLjM7XG4gICAgfVxuICAgIFxuICAgIGZpbmlzaEJsb2NrKCkge1xuICAgICAgICB2YXIgdmlicmF0byA9IDA7XG4gICAgICAgIGlmICh0aGlzLmFkZFBpdGNoVmFyaWFuY2UpIHtcbiAgICAgICAgICAgIC8vIEFkZCBzbWFsbCBpbXBlcmZlY3Rpb25zIHRvIHRoZSB2b2NhbCBvdXRwdXRcbiAgICAgICAgICAgIHZpYnJhdG8gKz0gdGhpcy52aWJyYXRvQW1vdW50ICogTWF0aC5zaW4oMipNYXRoLlBJICogdGhpcy50b3RhbFRpbWUgKnRoaXMudmlicmF0b0ZyZXF1ZW5jeSk7ICAgICAgICAgIFxuICAgICAgICAgICAgdmlicmF0byArPSAwLjAyICogbm9pc2Uuc2ltcGxleDEodGhpcy50b3RhbFRpbWUgKiA0LjA3KTtcbiAgICAgICAgICAgIHZpYnJhdG8gKz0gMC4wNCAqIG5vaXNlLnNpbXBsZXgxKHRoaXMudG90YWxUaW1lICogMi4xNSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnRyb21ib25lLmF1dG9Xb2JibGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZpYnJhdG8gKz0gMC4yICogbm9pc2Uuc2ltcGxleDEodGhpcy50b3RhbFRpbWUgKiAwLjk4KTtcbiAgICAgICAgICAgIHZpYnJhdG8gKz0gMC40ICogbm9pc2Uuc2ltcGxleDEodGhpcy50b3RhbFRpbWUgKiAwLjUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuVUlGcmVxdWVuY3k+dGhpcy5zbW9vdGhGcmVxdWVuY3kpIFxuICAgICAgICAgICAgdGhpcy5zbW9vdGhGcmVxdWVuY3kgPSBNYXRoLm1pbih0aGlzLnNtb290aEZyZXF1ZW5jeSAqIDEuMSwgdGhpcy5VSUZyZXF1ZW5jeSk7XG4gICAgICAgIGlmICh0aGlzLlVJRnJlcXVlbmN5PHRoaXMuc21vb3RoRnJlcXVlbmN5KSBcbiAgICAgICAgICAgIHRoaXMuc21vb3RoRnJlcXVlbmN5ID0gTWF0aC5tYXgodGhpcy5zbW9vdGhGcmVxdWVuY3kgLyAxLjEsIHRoaXMuVUlGcmVxdWVuY3kpO1xuICAgICAgICB0aGlzLm9sZEZyZXF1ZW5jeSA9IHRoaXMubmV3RnJlcXVlbmN5O1xuICAgICAgICB0aGlzLm5ld0ZyZXF1ZW5jeSA9IHRoaXMuc21vb3RoRnJlcXVlbmN5ICogKDErdmlicmF0byk7XG4gICAgICAgIHRoaXMub2xkVGVuc2VuZXNzID0gdGhpcy5uZXdUZW5zZW5lc3M7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRkVGVuc2VuZXNzVmFyaWFuY2UpXG4gICAgICAgICAgICB0aGlzLm5ld1RlbnNlbmVzcyA9IHRoaXMuVUlUZW5zZW5lc3MgKyAwLjEqbm9pc2Uuc2ltcGxleDEodGhpcy50b3RhbFRpbWUqMC40NikrMC4wNSpub2lzZS5zaW1wbGV4MSh0aGlzLnRvdGFsVGltZSowLjM2KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5uZXdUZW5zZW5lc3MgPSB0aGlzLlVJVGVuc2VuZXNzO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1RvdWNoZWQgJiYgdGhpcy50cm9tYm9uZS5hbHdheXNWb2ljZSkgdGhpcy5uZXdUZW5zZW5lc3MgKz0gKDMtdGhpcy5VSVRlbnNlbmVzcykqKDEtdGhpcy5pbnRlbnNpdHkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuaXNUb3VjaGVkIHx8IHRoaXMudHJvbWJvbmUuYWx3YXlzVm9pY2UpXG4gICAgICAgICAgICB0aGlzLmludGVuc2l0eSArPSAwLjEzO1xuICAgICAgICB0aGlzLmludGVuc2l0eSA9IE1hdGguY2xhbXAodGhpcy5pbnRlbnNpdHksIDAsIDEpO1xuICAgIH1cbiAgICBcbiAgICBzZXR1cFdhdmVmb3JtKGxhbWJkYSkge1xuICAgICAgICB0aGlzLmZyZXF1ZW5jeSA9IHRoaXMub2xkRnJlcXVlbmN5KigxLWxhbWJkYSkgKyB0aGlzLm5ld0ZyZXF1ZW5jeSpsYW1iZGE7XG4gICAgICAgIHZhciB0ZW5zZW5lc3MgPSB0aGlzLm9sZFRlbnNlbmVzcyooMS1sYW1iZGEpICsgdGhpcy5uZXdUZW5zZW5lc3MqbGFtYmRhO1xuICAgICAgICB0aGlzLlJkID0gMyooMS10ZW5zZW5lc3MpO1xuICAgICAgICB0aGlzLndhdmVmb3JtTGVuZ3RoID0gMS4wL3RoaXMuZnJlcXVlbmN5O1xuICAgICAgICBcbiAgICAgICAgdmFyIFJkID0gdGhpcy5SZDtcbiAgICAgICAgaWYgKFJkPDAuNSkgUmQgPSAwLjU7XG4gICAgICAgIGlmIChSZD4yLjcpIFJkID0gMi43O1xuICAgICAgICAvLyBub3JtYWxpemVkIHRvIHRpbWUgPSAxLCBFZSA9IDFcbiAgICAgICAgdmFyIFJhID0gLTAuMDEgKyAwLjA0OCpSZDtcbiAgICAgICAgdmFyIFJrID0gMC4yMjQgKyAwLjExOCpSZDtcbiAgICAgICAgdmFyIFJnID0gKFJrLzQpKigwLjUrMS4yKlJrKS8oMC4xMSpSZC1SYSooMC41KzEuMipSaykpO1xuICAgICAgICBcbiAgICAgICAgdmFyIFRhID0gUmE7XG4gICAgICAgIHZhciBUcCA9IDEgLyAoMipSZyk7XG4gICAgICAgIHZhciBUZSA9IFRwICsgVHAqUms7IC8vXG4gICAgICAgIFxuICAgICAgICB2YXIgZXBzaWxvbiA9IDEvVGE7XG4gICAgICAgIHZhciBzaGlmdCA9IE1hdGguZXhwKC1lcHNpbG9uICogKDEtVGUpKTtcbiAgICAgICAgdmFyIERlbHRhID0gMSAtIHNoaWZ0OyAvL2RpdmlkZSBieSB0aGlzIHRvIHNjYWxlIFJIU1xuICAgICAgICAgICBcbiAgICAgICAgdmFyIFJIU0ludGVncmFsID0gKDEvZXBzaWxvbikqKHNoaWZ0IC0gMSkgKyAoMS1UZSkqc2hpZnQ7XG4gICAgICAgIFJIU0ludGVncmFsID0gUkhTSW50ZWdyYWwvRGVsdGE7XG4gICAgICAgIFxuICAgICAgICB2YXIgdG90YWxMb3dlckludGVncmFsID0gLSAoVGUtVHApLzIgKyBSSFNJbnRlZ3JhbDtcbiAgICAgICAgdmFyIHRvdGFsVXBwZXJJbnRlZ3JhbCA9IC10b3RhbExvd2VySW50ZWdyYWw7XG4gICAgICAgIFxuICAgICAgICB2YXIgb21lZ2EgPSBNYXRoLlBJL1RwO1xuICAgICAgICB2YXIgcyA9IE1hdGguc2luKG9tZWdhKlRlKTtcbiAgICAgICAgdmFyIHkgPSAtTWF0aC5QSSpzKnRvdGFsVXBwZXJJbnRlZ3JhbCAvIChUcCoyKTtcbiAgICAgICAgdmFyIHogPSBNYXRoLmxvZyh5KTtcbiAgICAgICAgdmFyIGFscGhhID0gei8oVHAvMiAtIFRlKTtcbiAgICAgICAgdmFyIEUwID0gLTEgLyAocypNYXRoLmV4cChhbHBoYSpUZSkpO1xuICAgICAgICB0aGlzLmFscGhhID0gYWxwaGE7XG4gICAgICAgIHRoaXMuRTAgPSBFMDtcbiAgICAgICAgdGhpcy5lcHNpbG9uID0gZXBzaWxvbjtcbiAgICAgICAgdGhpcy5zaGlmdCA9IHNoaWZ0O1xuICAgICAgICB0aGlzLkRlbHRhID0gRGVsdGE7XG4gICAgICAgIHRoaXMuVGU9VGU7XG4gICAgICAgIHRoaXMub21lZ2EgPSBvbWVnYTtcbiAgICB9XG4gICAgXG4gXG4gICAgbm9ybWFsaXplZExGV2F2ZWZvcm0odCkgeyAgICAgXG4gICAgICAgIGlmICh0PnRoaXMuVGUpIHRoaXMub3V0cHV0ID0gKC1NYXRoLmV4cCgtdGhpcy5lcHNpbG9uICogKHQtdGhpcy5UZSkpICsgdGhpcy5zaGlmdCkvdGhpcy5EZWx0YTtcbiAgICAgICAgZWxzZSB0aGlzLm91dHB1dCA9IHRoaXMuRTAgKiBNYXRoLmV4cCh0aGlzLmFscGhhKnQpICogTWF0aC5zaW4odGhpcy5vbWVnYSAqIHQpO1xuICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXMub3V0cHV0ICogdGhpcy5pbnRlbnNpdHkgKiB0aGlzLmxvdWRuZXNzO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgR2xvdHRpcyB9OyIsImNsYXNzIFRyYWN0VUlcbntcblxuICAgIGNvbnN0cnVjdG9yKHRyb21ib25lKSB7XG4gICAgICAgIHRoaXMudHJvbWJvbmUgPSB0cm9tYm9uZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMub3JpZ2luWCA9IDM0MDsgXG4gICAgICAgIHRoaXMub3JpZ2luWSA9IDQ0OTsgXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjk4OyBcbiAgICAgICAgdGhpcy5zY2FsZSA9IDYwO1xuICAgICAgICB0aGlzLnRvbmd1ZUluZGV4ID0gMTIuOTtcbiAgICAgICAgdGhpcy50b25ndWVEaWFtZXRlciA9IDIuNDM7XG4gICAgICAgIHRoaXMuaW5uZXJUb25ndWVDb250cm9sUmFkaXVzID0gMi4wNTtcbiAgICAgICAgdGhpcy5vdXRlclRvbmd1ZUNvbnRyb2xSYWRpdXMgPSAzLjU7XG4gICAgICAgIHRoaXMudG9uZ3VlVG91Y2ggPSAwO1xuICAgICAgICB0aGlzLmFuZ2xlU2NhbGUgPSAwLjY0O1xuICAgICAgICB0aGlzLmFuZ2xlT2Zmc2V0ID0gLTAuMjQ7XG4gICAgICAgIHRoaXMubm9zZU9mZnNldCA9IDAuODtcbiAgICAgICAgdGhpcy5ncmlkT2Zmc2V0ID0gMS43O1xuXG4gICAgICAgIC8vLyBGaW5hbCBvcGVubmVzcyBvZiB0aGUgbW91dGggKGNsb3NlciB0byAwIGlzIG1vcmUgY2xvc2VkKVxuICAgICAgICB0aGlzLnRhcmdldCA9IDAuMTtcbiAgICAgICAgLy8vIEluZGV4IGluIHRoZSB0aHJvYXQgYXJyYXkgdG8gbW92ZSB0byB0YXJnZXRcbiAgICAgICAgdGhpcy5pbmRleCA9IDQyO1xuICAgICAgICAvLy8gTnVtYmVyIG9mIHRocm9hdCBzZWdtZW50cyB0byBjbG9zZSBhcm91bmQgdGhlIGluZGV4XG4gICAgICAgIHRoaXMucmFkaXVzID0gMDtcbiAgICB9XG4gICAgXG4gICAgaW5pdCgpIHtcbiAgICAgICAgbGV0IFRyYWN0ID0gdGhpcy50cm9tYm9uZS5UcmFjdDtcblxuICAgICAgICB0aGlzLnNldFJlc3REaWFtZXRlcigpO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8VHJhY3QubjsgaSsrKSBcbiAgICAgICAge1xuICAgICAgICAgICAgVHJhY3QuZGlhbWV0ZXJbaV0gPSBUcmFjdC50YXJnZXREaWFtZXRlcltpXSA9IFRyYWN0LnJlc3REaWFtZXRlcltpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9uZ3VlTG93ZXJJbmRleEJvdW5kID0gVHJhY3QuYmxhZGVTdGFydCsyO1xuICAgICAgICB0aGlzLnRvbmd1ZVVwcGVySW5kZXhCb3VuZCA9IFRyYWN0LnRpcFN0YXJ0LTM7XG4gICAgICAgIHRoaXMudG9uZ3VlSW5kZXhDZW50cmUgPSAwLjUqKHRoaXMudG9uZ3VlTG93ZXJJbmRleEJvdW5kK3RoaXMudG9uZ3VlVXBwZXJJbmRleEJvdW5kKTtcbiAgICB9XG4gICAgICAgIFxuICAgIGdldEluZGV4KHgseSkge1xuICAgICAgICBsZXQgVHJhY3QgPSB0aGlzLnRyb21ib25lLlRyYWN0O1xuXG4gICAgICAgIHZhciB4eCA9IHgtdGhpcy5vcmlnaW5YOyB2YXIgeXkgPSB5LXRoaXMub3JpZ2luWTtcbiAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMih5eSwgeHgpO1xuICAgICAgICB3aGlsZSAoYW5nbGU+IDApIGFuZ2xlIC09IDIqTWF0aC5QSTtcbiAgICAgICAgcmV0dXJuIChNYXRoLlBJICsgYW5nbGUgLSB0aGlzLmFuZ2xlT2Zmc2V0KSooVHJhY3QubGlwU3RhcnQtMSkgLyAodGhpcy5hbmdsZVNjYWxlKk1hdGguUEkpO1xuICAgIH1cblxuICAgIGdldERpYW1ldGVyKHgseSkge1xuICAgICAgICB2YXIgeHggPSB4LXRoaXMub3JpZ2luWDsgdmFyIHl5ID0geS10aGlzLm9yaWdpblk7XG4gICAgICAgIHJldHVybiAodGhpcy5yYWRpdXMtTWF0aC5zcXJ0KHh4Knh4ICsgeXkqeXkpKS90aGlzLnNjYWxlO1xuICAgIH1cbiAgICBcbiAgICBzZXRSZXN0RGlhbWV0ZXIoKSB7XG4gICAgICAgIGxldCBUcmFjdCA9IHRoaXMudHJvbWJvbmUuVHJhY3Q7XG5cbiAgICAgICAgZm9yICh2YXIgaT1UcmFjdC5ibGFkZVN0YXJ0OyBpPFRyYWN0LmxpcFN0YXJ0OyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciB0ID0gMS4xICogTWF0aC5QSSoodGhpcy50b25ndWVJbmRleCAtIGkpLyhUcmFjdC50aXBTdGFydCAtIFRyYWN0LmJsYWRlU3RhcnQpO1xuICAgICAgICAgICAgdmFyIGZpeGVkVG9uZ3VlRGlhbWV0ZXIgPSAyKyh0aGlzLnRvbmd1ZURpYW1ldGVyLTIpLzEuNTtcbiAgICAgICAgICAgIHZhciBjdXJ2ZSA9ICgxLjUtZml4ZWRUb25ndWVEaWFtZXRlcit0aGlzLmdyaWRPZmZzZXQpKk1hdGguY29zKHQpO1xuICAgICAgICAgICAgaWYgKGkgPT0gVHJhY3QuYmxhZGVTdGFydC0yIHx8IGkgPT0gVHJhY3QubGlwU3RhcnQtMSkgY3VydmUgKj0gMC44O1xuICAgICAgICAgICAgaWYgKGkgPT0gVHJhY3QuYmxhZGVTdGFydCB8fCBpID09IFRyYWN0LmxpcFN0YXJ0LTIpIGN1cnZlICo9IDAuOTQ7ICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBUcmFjdC5yZXN0RGlhbWV0ZXJbaV0gPSAxLjUgLSBjdXJ2ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGxpcHMgb2YgdGhlIG1vZGVsZWQgdHJhY3QgdG8gYmUgY2xvc2VkIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwcm9ncmVzcyBQZXJjZW50YWdlIGNsb3NlZCAobnVtYmVyIGJldHdlZW4gMCBhbmQgMSlcbiAgICAgKi9cbiAgICBTZXRMaXBzQ2xvc2VkKHByb2dyZXNzKSB7XG5cbiAgICAgICAgbGV0IFRyYWN0ID0gdGhpcy50cm9tYm9uZS5UcmFjdDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0UmVzdERpYW1ldGVyKCk7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxUcmFjdC5uOyBpKyspIFRyYWN0LnRhcmdldERpYW1ldGVyW2ldID0gVHJhY3QucmVzdERpYW1ldGVyW2ldOyAgICBcblxuICAgICAgICAvLyBEaXNhYmxlIHRoaXMgYmVoYXZpb3IgaWYgdGhlIG1vdXRoIGlzIGNsb3NlZCBhIGNlcnRhaW4gYW1vdW50XG4gICAgICAgIC8vaWYgKHByb2dyZXNzID4gMC44IHx8IHByb2dyZXNzIDwgMC4xKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICBmb3IobGV0IGk9IHRoaXMuaW5kZXggLSB0aGlzLnJhZGl1czsgaSA8PSB0aGlzLmluZGV4ICsgdGhpcy5yYWRpdXM7IGkrKyl7XG4gICAgICAgICAgICBpZiAoaSA+IFRyYWN0LnRhcmdldERpYW1ldGVyLmxlbmd0aCB8fCBpIDwgMCkgY29udGludWU7XG4gICAgICAgICAgICBsZXQgaW50ZXJwID0gTWF0aC5sZXJwKFRyYWN0LnJlc3REaWFtZXRlcltpXSwgdGhpcy50YXJnZXQsIHByb2dyZXNzKTtcbiAgICAgICAgICAgIFRyYWN0LnRhcmdldERpYW1ldGVyW2ldID0gaW50ZXJwO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IHsgVHJhY3RVSSB9OyIsImNsYXNzIFRyYWN0IHtcblxuICAgIGNvbnN0cnVjdG9yKHRyb21ib25lKSB7XG4gICAgICAgIHRoaXMudHJvbWJvbmUgPSB0cm9tYm9uZTtcblxuICAgICAgICB0aGlzLm4gPSA0NDtcbiAgICAgICAgdGhpcy5ibGFkZVN0YXJ0ID0gMTA7XG4gICAgICAgIHRoaXMudGlwU3RhcnQgPSAzMjtcbiAgICAgICAgdGhpcy5saXBTdGFydCA9IDM5O1xuICAgICAgICB0aGlzLlIgPSBbXTsgLy9jb21wb25lbnQgZ29pbmcgcmlnaHRcbiAgICAgICAgdGhpcy5MID0gW107IC8vY29tcG9uZW50IGdvaW5nIGxlZnRcbiAgICAgICAgdGhpcy5yZWZsZWN0aW9uID0gW107XG4gICAgICAgIHRoaXMuanVuY3Rpb25PdXRwdXRSID0gW107XG4gICAgICAgIHRoaXMuanVuY3Rpb25PdXRwdXRMID0gW107XG4gICAgICAgIHRoaXMubWF4QW1wbGl0dWRlID0gW107XG4gICAgICAgIHRoaXMuZGlhbWV0ZXIgPSBbXTtcbiAgICAgICAgdGhpcy5yZXN0RGlhbWV0ZXIgPSBbXTtcbiAgICAgICAgdGhpcy50YXJnZXREaWFtZXRlciA9IFtdO1xuICAgICAgICB0aGlzLm5ld0RpYW1ldGVyID0gW107XG4gICAgICAgIHRoaXMuQSA9IFtdO1xuICAgICAgICB0aGlzLmdsb3R0YWxSZWZsZWN0aW9uID0gMC43NTtcbiAgICAgICAgdGhpcy5saXBSZWZsZWN0aW9uID0gLTAuODU7XG4gICAgICAgIHRoaXMubGFzdE9ic3RydWN0aW9uID0gLTE7XG4gICAgICAgIHRoaXMuZmFkZSA9IDEuMDsgLy8wLjk5OTksXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDE1OyAvL2NtIHBlciBzZWNvbmRcbiAgICAgICAgdGhpcy50cmFuc2llbnRzID0gW107XG4gICAgICAgIHRoaXMubGlwT3V0cHV0ID0gMDtcbiAgICAgICAgdGhpcy5ub3NlT3V0cHV0ID0gMDtcbiAgICAgICAgdGhpcy52ZWx1bVRhcmdldCA9IDAuMDE7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5ibGFkZVN0YXJ0ID0gTWF0aC5mbG9vcih0aGlzLmJsYWRlU3RhcnQqdGhpcy5uLzQ0KTtcbiAgICAgICAgdGhpcy50aXBTdGFydCA9IE1hdGguZmxvb3IodGhpcy50aXBTdGFydCp0aGlzLm4vNDQpO1xuICAgICAgICB0aGlzLmxpcFN0YXJ0ID0gTWF0aC5mbG9vcih0aGlzLmxpcFN0YXJ0KnRoaXMubi80NCk7ICAgICAgICBcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5uKTtcbiAgICAgICAgdGhpcy5yZXN0RGlhbWV0ZXIgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubik7XG4gICAgICAgIHRoaXMudGFyZ2V0RGlhbWV0ZXIgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubik7XG4gICAgICAgIHRoaXMubmV3RGlhbWV0ZXIgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubik7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLm47IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGRpYW1ldGVyID0gMDtcbiAgICAgICAgICAgIGlmIChpPDcqdGhpcy5uLzQ0LTAuNSkgZGlhbWV0ZXIgPSAwLjY7XG4gICAgICAgICAgICBlbHNlIGlmIChpPDEyKnRoaXMubi80NCkgZGlhbWV0ZXIgPSAxLjE7XG4gICAgICAgICAgICBlbHNlIGRpYW1ldGVyID0gMS41O1xuICAgICAgICAgICAgdGhpcy5kaWFtZXRlcltpXSA9IHRoaXMucmVzdERpYW1ldGVyW2ldID0gdGhpcy50YXJnZXREaWFtZXRlcltpXSA9IHRoaXMubmV3RGlhbWV0ZXJbaV0gPSBkaWFtZXRlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLlIgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubik7XG4gICAgICAgIHRoaXMuTCA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5uKTtcbiAgICAgICAgdGhpcy5yZWZsZWN0aW9uID0gbmV3IEZsb2F0NjRBcnJheSh0aGlzLm4rMSk7XG4gICAgICAgIHRoaXMubmV3UmVmbGVjdGlvbiA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5uKzEpO1xuICAgICAgICB0aGlzLmp1bmN0aW9uT3V0cHV0UiA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5uKzEpO1xuICAgICAgICB0aGlzLmp1bmN0aW9uT3V0cHV0TCA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5uKzEpO1xuICAgICAgICB0aGlzLkEgPW5ldyBGbG9hdDY0QXJyYXkodGhpcy5uKTtcbiAgICAgICAgdGhpcy5tYXhBbXBsaXR1ZGUgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm5vc2VMZW5ndGggPSBNYXRoLmZsb29yKDI4KnRoaXMubi80NClcbiAgICAgICAgdGhpcy5ub3NlU3RhcnQgPSB0aGlzLm4tdGhpcy5ub3NlTGVuZ3RoICsgMTtcbiAgICAgICAgdGhpcy5ub3NlUiA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5ub3NlTGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ub3NlTCA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5ub3NlTGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ub3NlSnVuY3Rpb25PdXRwdXRSID0gbmV3IEZsb2F0NjRBcnJheSh0aGlzLm5vc2VMZW5ndGgrMSk7XG4gICAgICAgIHRoaXMubm9zZUp1bmN0aW9uT3V0cHV0TCA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5ub3NlTGVuZ3RoKzEpOyAgICAgICAgXG4gICAgICAgIHRoaXMubm9zZVJlZmxlY3Rpb24gPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubm9zZUxlbmd0aCsxKTtcbiAgICAgICAgdGhpcy5ub3NlRGlhbWV0ZXIgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubm9zZUxlbmd0aCk7XG4gICAgICAgIHRoaXMubm9zZUEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMubm9zZUxlbmd0aCk7XG4gICAgICAgIHRoaXMubm9zZU1heEFtcGxpdHVkZSA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy5ub3NlTGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMubm9zZUxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgZGlhbWV0ZXI7XG4gICAgICAgICAgICB2YXIgZCA9IDIqKGkvdGhpcy5ub3NlTGVuZ3RoKTtcbiAgICAgICAgICAgIGlmIChkPDEpIGRpYW1ldGVyID0gMC40KzEuNipkO1xuICAgICAgICAgICAgZWxzZSBkaWFtZXRlciA9IDAuNSsxLjUqKDItZCk7XG4gICAgICAgICAgICBkaWFtZXRlciA9IE1hdGgubWluKGRpYW1ldGVyLCAxLjkpO1xuICAgICAgICAgICAgdGhpcy5ub3NlRGlhbWV0ZXJbaV0gPSBkaWFtZXRlcjtcbiAgICAgICAgfSAgICAgICBcbiAgICAgICAgdGhpcy5uZXdSZWZsZWN0aW9uTGVmdCA9IHRoaXMubmV3UmVmbGVjdGlvblJpZ2h0ID0gdGhpcy5uZXdSZWZsZWN0aW9uTm9zZSA9IDA7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUmVmbGVjdGlvbnMoKTsgICAgICAgIFxuICAgICAgICB0aGlzLmNhbGN1bGF0ZU5vc2VSZWZsZWN0aW9ucygpO1xuICAgICAgICB0aGlzLm5vc2VEaWFtZXRlclswXSA9IHRoaXMudmVsdW1UYXJnZXQ7XG4gICAgfVxuICAgIFxuICAgIHJlc2hhcGVUcmFjdChkZWx0YVRpbWUpIHtcbiAgICAgICAgdmFyIGFtb3VudCA9IGRlbHRhVGltZSAqIHRoaXMubW92ZW1lbnRTcGVlZDsgOyAgICBcbiAgICAgICAgdmFyIG5ld0xhc3RPYnN0cnVjdGlvbiA9IC0xO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5uOyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBkaWFtZXRlciA9IHRoaXMuZGlhbWV0ZXJbaV07XG4gICAgICAgICAgICB2YXIgdGFyZ2V0RGlhbWV0ZXIgPSB0aGlzLnRhcmdldERpYW1ldGVyW2ldO1xuICAgICAgICAgICAgaWYgKGRpYW1ldGVyIDw9IDApIG5ld0xhc3RPYnN0cnVjdGlvbiA9IGk7XG4gICAgICAgICAgICB2YXIgc2xvd1JldHVybjsgXG4gICAgICAgICAgICBpZiAoaTx0aGlzLm5vc2VTdGFydCkgc2xvd1JldHVybiA9IDAuNjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGkgPj0gdGhpcy50aXBTdGFydCkgc2xvd1JldHVybiA9IDEuMDsgXG4gICAgICAgICAgICBlbHNlIHNsb3dSZXR1cm4gPSAwLjYrMC40KihpLXRoaXMubm9zZVN0YXJ0KS8odGhpcy50aXBTdGFydC10aGlzLm5vc2VTdGFydCk7XG4gICAgICAgICAgICB0aGlzLmRpYW1ldGVyW2ldID0gTWF0aC5tb3ZlVG93YXJkcyhkaWFtZXRlciwgdGFyZ2V0RGlhbWV0ZXIsIHNsb3dSZXR1cm4qYW1vdW50LCAyKmFtb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFzdE9ic3RydWN0aW9uPi0xICYmIG5ld0xhc3RPYnN0cnVjdGlvbiA9PSAtMSAmJiB0aGlzLm5vc2VBWzBdPDAuMDUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVHJhbnNpZW50KHRoaXMubGFzdE9ic3RydWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RPYnN0cnVjdGlvbiA9IG5ld0xhc3RPYnN0cnVjdGlvbjtcbiAgICAgICAgXG4gICAgICAgIGFtb3VudCA9IGRlbHRhVGltZSAqIHRoaXMubW92ZW1lbnRTcGVlZDsgXG4gICAgICAgIHRoaXMubm9zZURpYW1ldGVyWzBdID0gTWF0aC5tb3ZlVG93YXJkcyh0aGlzLm5vc2VEaWFtZXRlclswXSwgdGhpcy52ZWx1bVRhcmdldCwgXG4gICAgICAgICAgICAgICAgYW1vdW50KjAuMjUsIGFtb3VudCowLjEpO1xuICAgICAgICB0aGlzLm5vc2VBWzBdID0gdGhpcy5ub3NlRGlhbWV0ZXJbMF0qdGhpcy5ub3NlRGlhbWV0ZXJbMF07ICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgY2FsY3VsYXRlUmVmbGVjdGlvbnMoKSB7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLm47IGkrKykgXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuQVtpXSA9IHRoaXMuZGlhbWV0ZXJbaV0qdGhpcy5kaWFtZXRlcltpXTsgLy9pZ25vcmluZyBQSSBldGMuXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaT0xOyBpPHRoaXMubjsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnJlZmxlY3Rpb25baV0gPSB0aGlzLm5ld1JlZmxlY3Rpb25baV07XG4gICAgICAgICAgICBpZiAodGhpcy5BW2ldID09IDApIHRoaXMubmV3UmVmbGVjdGlvbltpXSA9IDAuOTk5OyAvL3RvIHByZXZlbnQgc29tZSBiYWQgYmVoYXZpb3VyIGlmIDBcbiAgICAgICAgICAgIGVsc2UgdGhpcy5uZXdSZWZsZWN0aW9uW2ldID0gKHRoaXMuQVtpLTFdLXRoaXMuQVtpXSkgLyAodGhpcy5BW2ktMV0rdGhpcy5BW2ldKTsgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vbm93IGF0IGp1bmN0aW9uIHdpdGggbm9zZVxuXG4gICAgICAgIHRoaXMucmVmbGVjdGlvbkxlZnQgPSB0aGlzLm5ld1JlZmxlY3Rpb25MZWZ0O1xuICAgICAgICB0aGlzLnJlZmxlY3Rpb25SaWdodCA9IHRoaXMubmV3UmVmbGVjdGlvblJpZ2h0O1xuICAgICAgICB0aGlzLnJlZmxlY3Rpb25Ob3NlID0gdGhpcy5uZXdSZWZsZWN0aW9uTm9zZTtcbiAgICAgICAgdmFyIHN1bSA9IHRoaXMuQVt0aGlzLm5vc2VTdGFydF0rdGhpcy5BW3RoaXMubm9zZVN0YXJ0KzFdK3RoaXMubm9zZUFbMF07XG4gICAgICAgIHRoaXMubmV3UmVmbGVjdGlvbkxlZnQgPSAoMip0aGlzLkFbdGhpcy5ub3NlU3RhcnRdLXN1bSkvc3VtO1xuICAgICAgICB0aGlzLm5ld1JlZmxlY3Rpb25SaWdodCA9ICgyKnRoaXMuQVt0aGlzLm5vc2VTdGFydCsxXS1zdW0pL3N1bTsgICBcbiAgICAgICAgdGhpcy5uZXdSZWZsZWN0aW9uTm9zZSA9ICgyKnRoaXMubm9zZUFbMF0tc3VtKS9zdW07ICAgICAgXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlTm9zZVJlZmxlY3Rpb25zKCkge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5ub3NlTGVuZ3RoOyBpKyspIFxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLm5vc2VBW2ldID0gdGhpcy5ub3NlRGlhbWV0ZXJbaV0qdGhpcy5ub3NlRGlhbWV0ZXJbaV07IFxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGk9MTsgaTx0aGlzLm5vc2VMZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5ub3NlUmVmbGVjdGlvbltpXSA9ICh0aGlzLm5vc2VBW2ktMV0tdGhpcy5ub3NlQVtpXSkgLyAodGhpcy5ub3NlQVtpLTFdK3RoaXMubm9zZUFbaV0pOyBcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBydW5TdGVwKGdsb3R0YWxPdXRwdXQsIHR1cmJ1bGVuY2VOb2lzZSwgbGFtYmRhKSB7XG4gICAgICAgIHZhciB1cGRhdGVBbXBsaXR1ZGVzID0gKE1hdGgucmFuZG9tKCk8MC4xKTtcbiAgICBcbiAgICAgICAgLy9tb3V0aFxuICAgICAgICB0aGlzLnByb2Nlc3NUcmFuc2llbnRzKCk7XG4gICAgICAgIHRoaXMuYWRkVHVyYnVsZW5jZU5vaXNlKHR1cmJ1bGVuY2VOb2lzZSk7XG4gICAgICAgIFxuICAgICAgICAvL3RoaXMuZ2xvdHRhbFJlZmxlY3Rpb24gPSAtMC44ICsgMS42ICogR2xvdHRpcy5uZXdUZW5zZW5lc3M7XG4gICAgICAgIHRoaXMuanVuY3Rpb25PdXRwdXRSWzBdID0gdGhpcy5MWzBdICogdGhpcy5nbG90dGFsUmVmbGVjdGlvbiArIGdsb3R0YWxPdXRwdXQ7XG4gICAgICAgIHRoaXMuanVuY3Rpb25PdXRwdXRMW3RoaXMubl0gPSB0aGlzLlJbdGhpcy5uLTFdICogdGhpcy5saXBSZWZsZWN0aW9uOyBcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGk9MTsgaTx0aGlzLm47IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHIgPSB0aGlzLnJlZmxlY3Rpb25baV0gKiAoMS1sYW1iZGEpICsgdGhpcy5uZXdSZWZsZWN0aW9uW2ldKmxhbWJkYTtcbiAgICAgICAgICAgIHZhciB3ID0gciAqICh0aGlzLlJbaS0xXSArIHRoaXMuTFtpXSk7XG4gICAgICAgICAgICB0aGlzLmp1bmN0aW9uT3V0cHV0UltpXSA9IHRoaXMuUltpLTFdIC0gdztcbiAgICAgICAgICAgIHRoaXMuanVuY3Rpb25PdXRwdXRMW2ldID0gdGhpcy5MW2ldICsgdztcbiAgICAgICAgfSAgICBcbiAgICAgICAgXG4gICAgICAgIC8vbm93IGF0IGp1bmN0aW9uIHdpdGggbm9zZVxuICAgICAgICB2YXIgaSA9IHRoaXMubm9zZVN0YXJ0O1xuICAgICAgICB2YXIgciA9IHRoaXMubmV3UmVmbGVjdGlvbkxlZnQgKiAoMS1sYW1iZGEpICsgdGhpcy5yZWZsZWN0aW9uTGVmdCpsYW1iZGE7XG4gICAgICAgIHRoaXMuanVuY3Rpb25PdXRwdXRMW2ldID0gcip0aGlzLlJbaS0xXSsoMStyKSoodGhpcy5ub3NlTFswXSt0aGlzLkxbaV0pO1xuICAgICAgICByID0gdGhpcy5uZXdSZWZsZWN0aW9uUmlnaHQgKiAoMS1sYW1iZGEpICsgdGhpcy5yZWZsZWN0aW9uUmlnaHQqbGFtYmRhO1xuICAgICAgICB0aGlzLmp1bmN0aW9uT3V0cHV0UltpXSA9IHIqdGhpcy5MW2ldKygxK3IpKih0aGlzLlJbaS0xXSt0aGlzLm5vc2VMWzBdKTsgICAgIFxuICAgICAgICByID0gdGhpcy5uZXdSZWZsZWN0aW9uTm9zZSAqICgxLWxhbWJkYSkgKyB0aGlzLnJlZmxlY3Rpb25Ob3NlKmxhbWJkYTtcbiAgICAgICAgdGhpcy5ub3NlSnVuY3Rpb25PdXRwdXRSWzBdID0gcip0aGlzLm5vc2VMWzBdKygxK3IpKih0aGlzLkxbaV0rdGhpcy5SW2ktMV0pO1xuICAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLm47IGkrKylcbiAgICAgICAgeyAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuUltpXSA9IHRoaXMuanVuY3Rpb25PdXRwdXRSW2ldKjAuOTk5O1xuICAgICAgICAgICAgdGhpcy5MW2ldID0gdGhpcy5qdW5jdGlvbk91dHB1dExbaSsxXSowLjk5OTsgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdGhpcy5SW2ldID0gTWF0aC5jbGFtcCh0aGlzLmp1bmN0aW9uT3V0cHV0UltpXSAqIHRoaXMuZmFkZSwgLTEsIDEpO1xuICAgICAgICAgICAgLy90aGlzLkxbaV0gPSBNYXRoLmNsYW1wKHRoaXMuanVuY3Rpb25PdXRwdXRMW2krMV0gKiB0aGlzLmZhZGUsIC0xLCAxKTsgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh1cGRhdGVBbXBsaXR1ZGVzKVxuICAgICAgICAgICAgeyAgIFxuICAgICAgICAgICAgICAgIHZhciBhbXBsaXR1ZGUgPSBNYXRoLmFicyh0aGlzLlJbaV0rdGhpcy5MW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAoYW1wbGl0dWRlID4gdGhpcy5tYXhBbXBsaXR1ZGVbaV0pIHRoaXMubWF4QW1wbGl0dWRlW2ldID0gYW1wbGl0dWRlO1xuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5tYXhBbXBsaXR1ZGVbaV0gKj0gMC45OTk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxpcE91dHB1dCA9IHRoaXMuUlt0aGlzLm4tMV07XG4gICAgICAgIFxuICAgICAgICAvL25vc2UgICAgIFxuICAgICAgICB0aGlzLm5vc2VKdW5jdGlvbk91dHB1dExbdGhpcy5ub3NlTGVuZ3RoXSA9IHRoaXMubm9zZVJbdGhpcy5ub3NlTGVuZ3RoLTFdICogdGhpcy5saXBSZWZsZWN0aW9uOyBcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGk9MTsgaTx0aGlzLm5vc2VMZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLm5vc2VSZWZsZWN0aW9uW2ldICogKHRoaXMubm9zZVJbaS0xXSArIHRoaXMubm9zZUxbaV0pO1xuICAgICAgICAgICAgdGhpcy5ub3NlSnVuY3Rpb25PdXRwdXRSW2ldID0gdGhpcy5ub3NlUltpLTFdIC0gdztcbiAgICAgICAgICAgIHRoaXMubm9zZUp1bmN0aW9uT3V0cHV0TFtpXSA9IHRoaXMubm9zZUxbaV0gKyB3O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5ub3NlTGVuZ3RoOyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMubm9zZVJbaV0gPSB0aGlzLm5vc2VKdW5jdGlvbk91dHB1dFJbaV0gKiB0aGlzLmZhZGU7XG4gICAgICAgICAgICB0aGlzLm5vc2VMW2ldID0gdGhpcy5ub3NlSnVuY3Rpb25PdXRwdXRMW2krMV0gKiB0aGlzLmZhZGU7ICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdGhpcy5ub3NlUltpXSA9IE1hdGguY2xhbXAodGhpcy5ub3NlSnVuY3Rpb25PdXRwdXRSW2ldICogdGhpcy5mYWRlLCAtMSwgMSk7XG4gICAgICAgICAgICAvL3RoaXMubm9zZUxbaV0gPSBNYXRoLmNsYW1wKHRoaXMubm9zZUp1bmN0aW9uT3V0cHV0TFtpKzFdICogdGhpcy5mYWRlLCAtMSwgMSk7ICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodXBkYXRlQW1wbGl0dWRlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYW1wbGl0dWRlID0gTWF0aC5hYnModGhpcy5ub3NlUltpXSt0aGlzLm5vc2VMW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAoYW1wbGl0dWRlID4gdGhpcy5ub3NlTWF4QW1wbGl0dWRlW2ldKSB0aGlzLm5vc2VNYXhBbXBsaXR1ZGVbaV0gPSBhbXBsaXR1ZGU7XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLm5vc2VNYXhBbXBsaXR1ZGVbaV0gKj0gMC45OTk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5vc2VPdXRwdXQgPSB0aGlzLm5vc2VSW3RoaXMubm9zZUxlbmd0aC0xXTtcbiAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZmluaXNoQmxvY2soKSB7ICAgICAgICAgXG4gICAgICAgIHRoaXMucmVzaGFwZVRyYWN0KHRoaXMudHJvbWJvbmUuQXVkaW9TeXN0ZW0uYmxvY2tUaW1lKTtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVSZWZsZWN0aW9ucygpO1xuICAgIH1cbiAgICBcbiAgICBhZGRUcmFuc2llbnQocG9zaXRpb24pIHtcbiAgICAgICAgdmFyIHRyYW5zID0ge31cbiAgICAgICAgdHJhbnMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgdHJhbnMudGltZUFsaXZlID0gMDtcbiAgICAgICAgdHJhbnMubGlmZVRpbWUgPSAwLjI7XG4gICAgICAgIHRyYW5zLnN0cmVuZ3RoID0gMC4zO1xuICAgICAgICB0cmFucy5leHBvbmVudCA9IDIwMDtcbiAgICAgICAgdGhpcy50cmFuc2llbnRzLnB1c2godHJhbnMpO1xuICAgIH1cbiAgICBcbiAgICBwcm9jZXNzVHJhbnNpZW50cygpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zaWVudHMubGVuZ3RoOyBpKyspICBcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHRyYW5zID0gdGhpcy50cmFuc2llbnRzW2ldO1xuICAgICAgICAgICAgdmFyIGFtcGxpdHVkZSA9IHRyYW5zLnN0cmVuZ3RoICogTWF0aC5wb3coMiwgLXRyYW5zLmV4cG9uZW50ICogdHJhbnMudGltZUFsaXZlKTtcbiAgICAgICAgICAgIHRoaXMuUlt0cmFucy5wb3NpdGlvbl0gKz0gYW1wbGl0dWRlLzI7XG4gICAgICAgICAgICB0aGlzLkxbdHJhbnMucG9zaXRpb25dICs9IGFtcGxpdHVkZS8yO1xuICAgICAgICAgICAgdHJhbnMudGltZUFsaXZlICs9IDEuMC8odGhpcy50cm9tYm9uZS5zYW1wbGVSYXRlKjIpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGk9dGhpcy50cmFuc2llbnRzLmxlbmd0aC0xOyBpPj0wOyBpLS0pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciB0cmFucyA9IHRoaXMudHJhbnNpZW50c1tpXTtcbiAgICAgICAgICAgIGlmICh0cmFucy50aW1lQWxpdmUgPiB0cmFucy5saWZlVGltZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaWVudHMuc3BsaWNlKGksMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkVHVyYnVsZW5jZU5vaXNlKHR1cmJ1bGVuY2VOb2lzZSkge1xuICAgICAgICAvLyBmb3IgKHZhciBqPTA7IGo8VUkudG91Y2hlc1dpdGhNb3VzZS5sZW5ndGg7IGorKylcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgdmFyIHRvdWNoID0gVUkudG91Y2hlc1dpdGhNb3VzZVtqXTtcbiAgICAgICAgLy8gICAgIGlmICh0b3VjaC5pbmRleDwyIHx8IHRvdWNoLmluZGV4PlRyYWN0Lm4pIGNvbnRpbnVlO1xuICAgICAgICAvLyAgICAgaWYgKHRvdWNoLmRpYW1ldGVyPD0wKSBjb250aW51ZTsgICAgICAgICAgICBcbiAgICAgICAgLy8gICAgIHZhciBpbnRlbnNpdHkgPSB0b3VjaC5mcmljYXRpdmVfaW50ZW5zaXR5O1xuICAgICAgICAvLyAgICAgaWYgKGludGVuc2l0eSA9PSAwKSBjb250aW51ZTtcbiAgICAgICAgLy8gICAgIHRoaXMuYWRkVHVyYnVsZW5jZU5vaXNlQXRJbmRleCgwLjY2KnR1cmJ1bGVuY2VOb2lzZSppbnRlbnNpdHksIHRvdWNoLmluZGV4LCB0b3VjaC5kaWFtZXRlcik7XG4gICAgICAgIC8vIH1cbiAgICB9XG4gICAgXG4gICAgYWRkVHVyYnVsZW5jZU5vaXNlQXRJbmRleCh0dXJidWxlbmNlTm9pc2UsIGluZGV4LCBkaWFtZXRlcikgeyAgIFxuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoaW5kZXgpO1xuICAgICAgICB2YXIgZGVsdGEgPSBpbmRleCAtIGk7XG4gICAgICAgIHR1cmJ1bGVuY2VOb2lzZSAqPSB0aGlzLnRyb21ib25lLkdsb3R0aXMuZ2V0Tm9pc2VNb2R1bGF0b3IoKTtcbiAgICAgICAgdmFyIHRoaW5uZXNzMCA9IE1hdGguY2xhbXAoOCooMC43LWRpYW1ldGVyKSwwLDEpO1xuICAgICAgICB2YXIgb3Blbm5lc3MgPSBNYXRoLmNsYW1wKDMwKihkaWFtZXRlci0wLjMpLCAwLCAxKTtcbiAgICAgICAgdmFyIG5vaXNlMCA9IHR1cmJ1bGVuY2VOb2lzZSooMS1kZWx0YSkqdGhpbm5lc3MwKm9wZW5uZXNzO1xuICAgICAgICB2YXIgbm9pc2UxID0gdHVyYnVsZW5jZU5vaXNlKmRlbHRhKnRoaW5uZXNzMCpvcGVubmVzcztcbiAgICAgICAgdGhpcy5SW2krMV0gKz0gbm9pc2UwLzI7XG4gICAgICAgIHRoaXMuTFtpKzFdICs9IG5vaXNlMC8yO1xuICAgICAgICB0aGlzLlJbaSsyXSArPSBub2lzZTEvMjtcbiAgICAgICAgdGhpcy5MW2krMl0gKz0gbm9pc2UxLzI7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgVHJhY3QgfTsiLCJNYXRoLmNsYW1wID0gZnVuY3Rpb24obnVtYmVyLCBtaW4sIG1heCkge1xuICAgIGlmIChudW1iZXI8bWluKSByZXR1cm4gbWluO1xuICAgIGVsc2UgaWYgKG51bWJlcj5tYXgpIHJldHVybiBtYXg7XG4gICAgZWxzZSByZXR1cm4gbnVtYmVyO1xufVxuXG5NYXRoLm1vdmVUb3dhcmRzID0gZnVuY3Rpb24oY3VycmVudCwgdGFyZ2V0LCBhbW91bnQpIHtcbiAgICBpZiAoY3VycmVudDx0YXJnZXQpIHJldHVybiBNYXRoLm1pbihjdXJyZW50K2Ftb3VudCwgdGFyZ2V0KTtcbiAgICBlbHNlIHJldHVybiBNYXRoLm1heChjdXJyZW50LWFtb3VudCwgdGFyZ2V0KTtcbn1cblxuTWF0aC5tb3ZlVG93YXJkcyA9IGZ1bmN0aW9uKGN1cnJlbnQsIHRhcmdldCwgYW1vdW50VXAsIGFtb3VudERvd24pIHtcbiAgICBpZiAoY3VycmVudDx0YXJnZXQpIHJldHVybiBNYXRoLm1pbihjdXJyZW50K2Ftb3VudFVwLCB0YXJnZXQpO1xuICAgIGVsc2UgcmV0dXJuIE1hdGgubWF4KGN1cnJlbnQtYW1vdW50RG93biwgdGFyZ2V0KTtcbn1cblxuTWF0aC5nYXVzc2lhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzID0gMDtcbiAgICBmb3IgKHZhciBjPTA7IGM8MTY7IGMrKykgcys9TWF0aC5yYW5kb20oKTtcbiAgICByZXR1cm4gKHMtOCkvNDtcbn1cblxuTWF0aC5sZXJwID0gZnVuY3Rpb24oYSwgYiwgdCkge1xuICAgIHJldHVybiBhICsgKGIgLSBhKSAqIHQ7XG59IiwiLypcbiAqIEEgc3BlZWQtaW1wcm92ZWQgcGVybGluIGFuZCBzaW1wbGV4IG5vaXNlIGFsZ29yaXRobXMgZm9yIDJELlxuICpcbiAqIEJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqIENvbnZlcnRlZCB0byBKYXZhc2NyaXB0IGJ5IEpvc2VwaCBHZW50bGUuXG4gKlxuICogVmVyc2lvbiAyMDEyLTAzLTA5XG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICpcbiAqL1xuXG5jbGFzcyBHcmFkIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB6KXtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICB9XG5cbiAgICBkb3QyKHgsIHkpe1xuICAgICAgICByZXR1cm4gdGhpcy54KnggKyB0aGlzLnkqeTtcbiAgICB9XG5cbiAgICBkb3QzKHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCp4ICsgdGhpcy55KnkgKyB0aGlzLnoqejtcbiAgICB9O1xufVxuXG5jbGFzcyBOb2lzZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ3JhZDMgPSBbbmV3IEdyYWQoMSwxLDApLG5ldyBHcmFkKC0xLDEsMCksbmV3IEdyYWQoMSwtMSwwKSxuZXcgR3JhZCgtMSwtMSwwKSxcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgR3JhZCgxLDAsMSksbmV3IEdyYWQoLTEsMCwxKSxuZXcgR3JhZCgxLDAsLTEpLG5ldyBHcmFkKC0xLDAsLTEpLFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBHcmFkKDAsMSwxKSxuZXcgR3JhZCgwLC0xLDEpLG5ldyBHcmFkKDAsMSwtMSksbmV3IEdyYWQoMCwtMSwtMSldO1xuICAgICAgICB0aGlzLnAgPSBbMTUxLDE2MCwxMzcsOTEsOTAsMTUsXG4gICAgICAgICAgICAxMzEsMTMsMjAxLDk1LDk2LDUzLDE5NCwyMzMsNywyMjUsMTQwLDM2LDEwMywzMCw2OSwxNDIsOCw5OSwzNywyNDAsMjEsMTAsMjMsXG4gICAgICAgICAgICAxOTAsIDYsMTQ4LDI0NywxMjAsMjM0LDc1LDAsMjYsMTk3LDYyLDk0LDI1MiwyMTksMjAzLDExNywzNSwxMSwzMiw1NywxNzcsMzMsXG4gICAgICAgICAgICA4OCwyMzcsMTQ5LDU2LDg3LDE3NCwyMCwxMjUsMTM2LDE3MSwxNjgsIDY4LDE3NSw3NCwxNjUsNzEsMTM0LDEzOSw0OCwyNywxNjYsXG4gICAgICAgICAgICA3NywxNDYsMTU4LDIzMSw4MywxMTEsMjI5LDEyMiw2MCwyMTEsMTMzLDIzMCwyMjAsMTA1LDkyLDQxLDU1LDQ2LDI0NSw0MCwyNDQsXG4gICAgICAgICAgICAxMDIsMTQzLDU0LCA2NSwyNSw2MywxNjEsIDEsMjE2LDgwLDczLDIwOSw3NiwxMzIsMTg3LDIwOCwgODksMTgsMTY5LDIwMCwxOTYsXG4gICAgICAgICAgICAxMzUsMTMwLDExNiwxODgsMTU5LDg2LDE2NCwxMDAsMTA5LDE5OCwxNzMsMTg2LCAzLDY0LDUyLDIxNywyMjYsMjUwLDEyNCwxMjMsXG4gICAgICAgICAgICA1LDIwMiwzOCwxNDcsMTE4LDEyNiwyNTUsODIsODUsMjEyLDIwNywyMDYsNTksMjI3LDQ3LDE2LDU4LDE3LDE4MiwxODksMjgsNDIsXG4gICAgICAgICAgICAyMjMsMTgzLDE3MCwyMTMsMTE5LDI0OCwxNTIsIDIsNDQsMTU0LDE2MywgNzAsMjIxLDE1MywxMDEsMTU1LDE2NywgNDMsMTcyLDksXG4gICAgICAgICAgICAxMjksMjIsMzksMjUzLCAxOSw5OCwxMDgsMTEwLDc5LDExMywyMjQsMjMyLDE3OCwxODUsIDExMiwxMDQsMjE4LDI0Niw5NywyMjgsXG4gICAgICAgICAgICAyNTEsMzQsMjQyLDE5MywyMzgsMjEwLDE0NCwxMiwxOTEsMTc5LDE2MiwyNDEsIDgxLDUxLDE0NSwyMzUsMjQ5LDE0LDIzOSwxMDcsXG4gICAgICAgICAgICA0OSwxOTIsMjE0LCAzMSwxODEsMTk5LDEwNiwxNTcsMTg0LCA4NCwyMDQsMTc2LDExNSwxMjEsNTAsNDUsMTI3LCA0LDE1MCwyNTQsXG4gICAgICAgICAgICAxMzgsMjM2LDIwNSw5MywyMjIsMTE0LDY3LDI5LDI0LDcyLDI0MywxNDEsMTI4LDE5NSw3OCw2NiwyMTUsNjEsMTU2LDE4MF07XG5cbiAgICAgICAgLy8gVG8gcmVtb3ZlIHRoZSBuZWVkIGZvciBpbmRleCB3cmFwcGluZywgZG91YmxlIHRoZSBwZXJtdXRhdGlvbiB0YWJsZSBsZW5ndGhcbiAgICAgICAgdGhpcy5wZXJtID0gbmV3IEFycmF5KDUxMik7XG4gICAgICAgIHRoaXMuZ3JhZFAgPSBuZXcgQXJyYXkoNTEyKTtcblxuICAgICAgICB0aGlzLnNlZWQoRGF0ZS5ub3coKSk7XG4gICAgfVxuXG4gICAgc2VlZChzZWVkKSB7XG4gICAgICAgIGlmKHNlZWQgPiAwICYmIHNlZWQgPCAxKSB7XG4gICAgICAgICAgICAvLyBTY2FsZSB0aGUgc2VlZCBvdXRcbiAgICAgICAgICAgIHNlZWQgKj0gNjU1MzY7XG4gICAgICAgIH1cblxuICAgICAgICBzZWVkID0gTWF0aC5mbG9vcihzZWVkKTtcbiAgICAgICAgaWYoc2VlZCA8IDI1Nikge1xuICAgICAgICAgICAgc2VlZCB8PSBzZWVkIDw8IDg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgICAgICAgIHZhciB2O1xuICAgICAgICAgICAgaWYgKGkgJiAxKSB7XG4gICAgICAgICAgICAgICAgdiA9IHRoaXMucFtpXSBeIChzZWVkICYgMjU1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdiA9IHRoaXMucFtpXSBeICgoc2VlZD4+OCkgJiAyNTUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBlcm1baV0gPSB0aGlzLnBlcm1baSArIDI1Nl0gPSB2O1xuICAgICAgICAgICAgdGhpcy5ncmFkUFtpXSA9IHRoaXMuZ3JhZFBbaSArIDI1Nl0gPSB0aGlzLmdyYWQzW3YgJSAxMl07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gMkQgc2ltcGxleCBub2lzZVxuICAgIHNpbXBsZXgyKHhpbiwgeWluKSB7XG4gICAgICAgIC8vIFNrZXdpbmcgYW5kIHVuc2tld2luZyBmYWN0b3JzIGZvciAyLCAzLCBhbmQgNCBkaW1lbnNpb25zXG4gICAgICAgIHZhciBGMiA9IDAuNSooTWF0aC5zcXJ0KDMpLTEpO1xuICAgICAgICB2YXIgRzIgPSAoMy1NYXRoLnNxcnQoMykpLzY7XG5cbiAgICAgICAgdmFyIEYzID0gMS8zO1xuICAgICAgICB2YXIgRzMgPSAxLzY7XG5cbiAgICAgICAgdmFyIG4wLCBuMSwgbjI7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICAgIHZhciBzID0gKHhpbit5aW4pKkYyOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4aW4rcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5aW4rcyk7XG4gICAgICAgIHZhciB0ID0gKGkraikqRzI7XG4gICAgICAgIHZhciB4MCA9IHhpbi1pK3Q7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luLCB1bnNrZXdlZC5cbiAgICAgICAgdmFyIHkwID0geWluLWordDtcbiAgICAgICAgLy8gRm9yIHRoZSAyRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgICB2YXIgaTEsIGoxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgKG1pZGRsZSkgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaikgY29vcmRzXG4gICAgICAgIGlmKHgwPnkwKSB7IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKVxuICAgICAgICAgICAgaTE9MTsgajE9MDtcbiAgICAgICAgfSBlbHNlIHsgICAgLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXG4gICAgICAgICAgICBpMT0wOyBqMT0xO1xuICAgICAgICB9XG4gICAgICAgIC8vIEEgc3RlcCBvZiAoMSwwKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYykgaW4gKHgseSksIGFuZFxuICAgICAgICAvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZVxuICAgICAgICAvLyBjID0gKDMtc3FydCgzKSkvNlxuICAgICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzI7IC8vIE9mZnNldHMgZm9yIG1pZGRsZSBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG4gICAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMjtcbiAgICAgICAgdmFyIHgyID0geDAgLSAxICsgMiAqIEcyOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcbiAgICAgICAgdmFyIHkyID0geTAgLSAxICsgMiAqIEcyO1xuICAgICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVyc1xuICAgICAgICBpICY9IDI1NTtcbiAgICAgICAgaiAmPSAyNTU7XG4gICAgICAgIHZhciBnaTAgPSB0aGlzLmdyYWRQW2krdGhpcy5wZXJtW2pdXTtcbiAgICAgICAgdmFyIGdpMSA9IHRoaXMuZ3JhZFBbaStpMSt0aGlzLnBlcm1baitqMV1dO1xuICAgICAgICB2YXIgZ2kyID0gdGhpcy5ncmFkUFtpKzErdGhpcy5wZXJtW2orMV1dO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG4gICAgICAgIHZhciB0MCA9IDAuNSAtIHgwKngwLXkwKnkwO1xuICAgICAgICBpZih0MDwwKSB7XG4gICAgICAgICAgICBuMCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgICAgIG4wID0gdDAgKiB0MCAqIGdpMC5kb3QyKHgwLCB5MCk7ICAvLyAoeCx5KSBvZiBncmFkMyB1c2VkIGZvciAyRCBncmFkaWVudFxuICAgICAgICB9XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxKngxLXkxKnkxO1xuICAgICAgICBpZih0MTwwKSB7XG4gICAgICAgICAgICBuMSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgICAgIG4xID0gdDEgKiB0MSAqIGdpMS5kb3QyKHgxLCB5MSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHQyID0gMC41IC0geDIqeDIteTIqeTI7XG4gICAgICAgIGlmKHQyPDApIHtcbiAgICAgICAgICAgIG4yID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHQyICo9IHQyO1xuICAgICAgICAgICAgbjIgPSB0MiAqIHQyICogZ2kyLmRvdDIoeDIsIHkyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwxXS5cbiAgICAgICAgcmV0dXJuIDcwICogKG4wICsgbjEgKyBuMik7XG4gICAgfVxuICAgIFxuICAgIHNpbXBsZXgxKHgpe1xuICAgICAgICByZXR1cm4gdGhpcy5zaW1wbGV4Mih4KjEuMiwgLXgqMC43KTtcbiAgICB9XG5cbn1cblxuY29uc3Qgc2luZ2xldG9uID0gbmV3IE5vaXNlKCk7XG5PYmplY3QuZnJlZXplKHNpbmdsZXRvbik7XG5cbmV4cG9ydCBkZWZhdWx0IHNpbmdsZXRvbjsiLCJpbXBvcnQgXCIuL21hdGgtZXh0ZW5zaW9ucy5qc1wiO1xuXG5pbXBvcnQgeyBBdWRpb1N5c3RlbSB9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW8tc3lzdGVtLmpzXCI7XG5pbXBvcnQgeyBHbG90dGlzIH0gZnJvbSBcIi4vY29tcG9uZW50cy9nbG90dGlzLmpzXCI7XG5pbXBvcnQgeyBUcmFjdCB9IGZyb20gXCIuL2NvbXBvbmVudHMvdHJhY3QuanNcIjtcbmltcG9ydCB7IFRyYWN0VUkgfSBmcm9tIFwiLi9jb21wb25lbnRzL3RyYWN0LXVpLmpzXCI7XG5cbmNsYXNzIFBpbmtUcm9tYm9uZSB7XG4gICAgY29uc3RydWN0b3IoY29udHJvbGxlcil7XG4gICAgICAgIHRoaXMuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNhbXBsZVJhdGUgPSAwO1xuICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgICAgICB0aGlzLmFsd2F5c1ZvaWNlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hdXRvV29iYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ub2lzZUZyZXEgPSA1MDA7XG4gICAgICAgIHRoaXMubm9pc2VRID0gMC43O1xuXG4gICAgICAgIHRoaXMuQXVkaW9TeXN0ZW0gPSBuZXcgQXVkaW9TeXN0ZW0odGhpcyk7XG4gICAgICAgIHRoaXMuQXVkaW9TeXN0ZW0uaW5pdCgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5HbG90dGlzID0gbmV3IEdsb3R0aXModGhpcyk7XG4gICAgICAgIHRoaXMuR2xvdHRpcy5pbml0KCk7XG5cbiAgICAgICAgdGhpcy5UcmFjdCA9IG5ldyBUcmFjdCh0aGlzKTtcbiAgICAgICAgdGhpcy5UcmFjdC5pbml0KCk7XG5cbiAgICAgICAgdGhpcy5UcmFjdFVJID0gbmV3IFRyYWN0VUkodGhpcyk7XG4gICAgICAgIHRoaXMuVHJhY3RVSS5pbml0KCk7XG5cbiAgICAgICAgLy90aGlzLlN0YXJ0QXVkaW8oKTtcbiAgICAgICAgLy90aGlzLlNldE11dGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgU3RhcnRBdWRpbygpIHtcbiAgICAgICAgdGhpcy5tdXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLkF1ZGlvU3lzdGVtLnN0YXJ0U291bmQoKTtcbiAgICB9XG5cbiAgICBTZXRNdXRlKGRvTXV0ZSkge1xuICAgICAgICBkb011dGUgPyB0aGlzLkF1ZGlvU3lzdGVtLm11dGUoKSA6IHRoaXMuQXVkaW9TeXN0ZW0udW5tdXRlKCk7XG4gICAgICAgIHRoaXMubXV0ZWQgPSBkb011dGU7XG4gICAgfVxuXG4gICAgVG9nZ2xlTXV0ZSgpIHtcbiAgICAgICAgdGhpcy5TZXRNdXRlKCF0aGlzLm11dGVkKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgUGlua1Ryb21ib25lIH07IiwiY2xhc3MgTW9kZWxMb2FkZXIge1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgYSBtb2RlbCBhc3luY2hyb25vdXNseS4gRXhwZWN0cyBhbiBvYmplY3QgY29udGFpbmluZ1xuICAgICAqIHRoZSBwYXRoIHRvIHRoZSBvYmplY3QsIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBPQkogZmlsZSxcbiAgICAgKiBhbmQgdGhlIHJlbGF0aXZlIHBhdGggb2YgdGhlIE1UTCBmaWxlLlxuICAgICAqIFxuICAgICAqIEFuIGV4YW1wbGU6XG4gICAgICogbGV0IG1vZGVsSW5mbyA9IHtcbiAgICAgKiAgICAgIHBhdGg6IFwiLi4vcmVzb3VyY2VzL29iai9cIixcbiAgICAgKiAgICAgIG9iakZpbGU6IFwidGVzdC5vYmpcIixcbiAgICAgKiAgICAgIG10bEZpbGU6IFwidGVzdC5tdGxcIlxuICAgICAqIH1cbiAgICAgKi9cbiAgICBzdGF0aWMgTG9hZE9CSihtb2RlbEluZm8sIGxvYWRlZENhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIG9uUHJvZ3Jlc3MgPSBmdW5jdGlvbiggeGhyICkge1xuICAgICAgICAgICAgaWYgKCB4aHIubGVuZ3RoQ29tcHV0YWJsZSApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGVyY2VudENvbXBsZXRlID0geGhyLmxvYWRlZCAvIHhoci50b3RhbCAqIDEwMDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggTWF0aC5yb3VuZCggcGVyY2VudENvbXBsZXRlLCAyICkgKyAnJSBkb3dubG9hZGVkJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uKCB4aHIgKSB7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG10bExvYWRlciA9IG5ldyBUSFJFRS5NVExMb2FkZXIoKTtcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoIG1vZGVsSW5mby5wYXRoICk7XG5cbiAgICAgICAgbXRsTG9hZGVyLmxvYWQoIG1vZGVsSW5mby5tdGxGaWxlLCAoIG1hdGVyaWFscyApID0+IHtcbiAgICAgICAgICAgIG1hdGVyaWFscy5wcmVsb2FkKCk7XG4gICAgICAgICAgICB2YXIgb2JqTG9hZGVyID0gbmV3IFRIUkVFLk9CSkxvYWRlcigpO1xuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyggbWF0ZXJpYWxzICk7XG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0UGF0aCggbW9kZWxJbmZvLnBhdGggKTtcbiAgICAgICAgICAgIG9iakxvYWRlci5sb2FkKCBtb2RlbEluZm8ub2JqRmlsZSwgKCBvYmplY3QgKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZGVkQ2FsbGJhY2sob2JqZWN0KTtcbiAgICAgICAgICAgIH0sIG9uUHJvZ3Jlc3MsIG9uRXJyb3IgKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHN0YXRpYyBMb2FkSlNPTihwYXRoLCBsb2FkZWRDYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBvblByb2dyZXNzID0gZnVuY3Rpb24oIHhociApIHtcbiAgICAgICAgICAgIGlmICggeGhyLmxlbmd0aENvbXB1dGFibGUgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRDb21wbGV0ZSA9IHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIE1hdGgucm91bmQoIHBlcmNlbnRDb21wbGV0ZSwgMiApICsgJyUgZG93bmxvYWRlZCcgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9uRXJyb3IgPSBmdW5jdGlvbiggeGhyICkge1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuICAgICAgICBsb2FkZXIubG9hZCggcGF0aCwgKCBnZW9tZXRyeSwgbWF0ZXJpYWxzICkgPT4ge1xuICAgICAgICAgICAgLy8gQXBwbHkgc2tpbm5pbmcgdG8gZWFjaCBtYXRlcmlhbCBzbyB0aGUgdmVydHMgYXJlIGFmZmVjdGVkIGJ5IGJvbmUgbW92ZW1lbnRcbiAgICAgICAgICAgIGZvcihsZXQgbWF0IG9mIG1hdGVyaWFscyl7XG4gICAgICAgICAgICAgICAgbWF0LnNraW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBtZXNoID0gbmV3IFRIUkVFLlNraW5uZWRNZXNoKCBnZW9tZXRyeSwgbmV3IFRIUkVFLk11bHRpTWF0ZXJpYWwoIG1hdGVyaWFscyApICk7XG4gICAgICAgICAgICBtZXNoLm5hbWUgPSBcIkpvblwiO1xuICAgICAgICAgICAgbG9hZGVkQ2FsbGJhY2sobWVzaCk7XG4gICAgICAgIH0sIG9uUHJvZ3Jlc3MsIG9uRXJyb3IpO1xuICAgIH1cblxuICAgIHN0YXRpYyBMb2FkRkJYKHBhdGgsIGxvYWRlZENhbGxiYWNrKSB7XG4gICAgICAgIGxldCBtYW5hZ2VyID0gbmV3IFRIUkVFLkxvYWRpbmdNYW5hZ2VyKCk7XG4gICAgICAgIG1hbmFnZXIub25Qcm9ncmVzcyA9IGZ1bmN0aW9uKCBpdGVtLCBsb2FkZWQsIHRvdGFsICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGl0ZW0sIGxvYWRlZCwgdG90YWwgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKCB4aHIgKSB7XG4gICAgICAgICAgICBpZiAoIHhoci5sZW5ndGhDb21wdXRhYmxlICkge1xuICAgICAgICAgICAgICAgIHZhciBwZXJjZW50Q29tcGxldGUgPSB4aHIubG9hZGVkIC8geGhyLnRvdGFsICogMTAwO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBNYXRoLnJvdW5kKCBwZXJjZW50Q29tcGxldGUsIDIgKSArICclIGRvd25sb2FkZWQnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24oIHhociApIHtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkZCWExvYWRlciggbWFuYWdlciApO1xuICAgICAgICBsb2FkZXIubG9hZCggcGF0aCwgKCBvYmplY3QgKSA9PiB7XG4gICAgICAgICAgICBsb2FkZWRDYWxsYmFjayhvYmplY3QpO1xuICAgICAgICB9LCBvblByb2dyZXNzLCBvbkVycm9yICk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IE1vZGVsTG9hZGVyIH07IiwiY2xhc3MgRGV0ZWN0b3Ige1xuXG4gICAgLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODcxMDc3L3Byb3Blci13YXktdG8tZGV0ZWN0LXdlYmdsLXN1cHBvcnRcbiAgICBzdGF0aWMgSGFzV2ViR0woKSB7XG4gICAgICAgIGlmICghIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLFxuICAgICAgICAgICAgICAgICAgICBuYW1lcyA9IFtcIndlYmdsXCIsIFwiZXhwZXJpbWVudGFsLXdlYmdsXCIsIFwibW96LXdlYmdsXCIsIFwid2Via2l0LTNkXCJdLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yKHZhciBpPTA7aTw0O2krKykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChuYW1lc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0LmdldFBhcmFtZXRlciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlYkdMIGlzIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7fVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXZWJHTCBpcyBzdXBwb3J0ZWQsIGJ1dCBkaXNhYmxlZFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlYkdMIG5vdCBzdXBwb3J0ZWRcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBHZXRFcnJvckhUTUwobWVzc2FnZSA9IG51bGwpe1xuICAgICAgICBpZihtZXNzYWdlID09IG51bGwpe1xuICAgICAgICAgICAgbWVzc2FnZSA9IGBZb3VyIGdyYXBoaWNzIGNhcmQgZG9lcyBub3Qgc2VlbSB0byBzdXBwb3J0IFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHA6Ly9raHJvbm9zLm9yZy93ZWJnbC93aWtpL0dldHRpbmdfYV9XZWJHTF9JbXBsZW1lbnRhdGlvblwiPldlYkdMPC9hPi4gPGJyPlxuICAgICAgICAgICAgICAgICAgICAgICAgRmluZCBvdXQgaG93IHRvIGdldCBpdCA8YSBocmVmPVwiaHR0cDovL2dldC53ZWJnbC5vcmcvXCI+aGVyZTwvYT4uYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwibm8td2ViZ2wtc3VwcG9ydFwiPlxuICAgICAgICA8cCBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIj4ke21lc3NhZ2V9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgYFxuICAgIH1cblxufVxuXG5leHBvcnQgeyBEZXRlY3RvciB9OyIsIiFmdW5jdGlvbih0LGUpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPWUoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuTWlkaUNvbnZlcnQ9ZSgpOnQuTWlkaUNvbnZlcnQ9ZSgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUocil7aWYobltyXSlyZXR1cm4gbltyXS5leHBvcnRzO3ZhciBpPW5bcl09e2V4cG9ydHM6e30saWQ6cixsb2FkZWQ6ITF9O3JldHVybiB0W3JdLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLGUpLGkubG9hZGVkPSEwLGkuZXhwb3J0c312YXIgbj17fTtyZXR1cm4gZS5tPXQsZS5jPW4sZS5wPVwiXCIsZSgwKX0oW2Z1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgcj1uKDcpLGk9bigyKSxhPXtpbnN0cnVtZW50QnlQYXRjaElEOmkuaW5zdHJ1bWVudEJ5UGF0Y2hJRCxpbnN0cnVtZW50RmFtaWx5QnlJRDppLmluc3RydW1lbnRGYW1pbHlCeUlELHBhcnNlOmZ1bmN0aW9uKHQpe3JldHVybihuZXcgci5NaWRpKS5kZWNvZGUodCl9LGxvYWQ6ZnVuY3Rpb24odCxlKXt2YXIgbj0obmV3IHIuTWlkaSkubG9hZCh0KTtyZXR1cm4gZSYmbi50aGVuKGUpLG59LGNyZWF0ZTpmdW5jdGlvbigpe3JldHVybiBuZXcgci5NaWRpfX07ZVtcImRlZmF1bHRcIl09YSx0LmV4cG9ydHM9YX0sZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0LnJlcGxhY2UoL1xcdTAwMDAvZyxcIlwiKX1mdW5jdGlvbiByKHQsZSl7cmV0dXJuIDYwL2UuYnBtKih0L2UuUFBRKX1mdW5jdGlvbiBpKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0fWZ1bmN0aW9uIGEodCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHR9ZnVuY3Rpb24gbyh0KXt2YXIgZT1bXCJDXCIsXCJDI1wiLFwiRFwiLFwiRCNcIixcIkVcIixcIkZcIixcIkYjXCIsXCJHXCIsXCJHI1wiLFwiQVwiLFwiQSNcIixcIkJcIl0sbj1NYXRoLmZsb29yKHQvMTIpLTEscj10JTEyO3JldHVybiBlW3JdK259dmFyIHM9ZnVuY3Rpb24oKXt2YXIgdD0vXihbYS1nXXsxfSg/OmJ8I3x4fGJiKT8pKC0/WzAtOV0rKS9pO3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gYShlKSYmdC50ZXN0KGUpfX0oKSx1PWZ1bmN0aW9uKCl7dmFyIHQ9L14oW2EtZ117MX0oPzpifCN8eHxiYik/KSgtP1swLTldKykvaSxlPXtjYmI6LTIsY2I6LTEsYzowLFwiYyNcIjoxLGN4OjIsZGJiOjAsZGI6MSxkOjIsXCJkI1wiOjMsZHg6NCxlYmI6MixlYjozLGU6NCxcImUjXCI6NSxleDo2LGZiYjozLGZiOjQsZjo1LFwiZiNcIjo2LGZ4OjcsZ2JiOjUsZ2I6NixnOjcsXCJnI1wiOjgsZ3g6OSxhYmI6NyxhYjo4LGE6OSxcImEjXCI6MTAsYXg6MTEsYmJiOjksYmI6MTAsYjoxMSxcImIjXCI6MTIsYng6MTN9O3JldHVybiBmdW5jdGlvbihuKXt2YXIgcj10LmV4ZWMobiksaT1yWzFdLGE9clsyXSxvPWVbaS50b0xvd2VyQ2FzZSgpXTtyZXR1cm4gbysxMioocGFyc2VJbnQoYSkrMSl9fSgpO3QuZXhwb3J0cz17Y2xlYW5OYW1lOm4sdGlja3NUb1NlY29uZHM6cixpc1N0cmluZzphLGlzTnVtYmVyOmksaXNQaXRjaDpzLG1pZGlUb1BpdGNoOm8scGl0Y2hUb01pZGk6dX19LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7ZS5pbnN0cnVtZW50QnlQYXRjaElEPVtcImFjb3VzdGljIGdyYW5kIHBpYW5vXCIsXCJicmlnaHQgYWNvdXN0aWMgcGlhbm9cIixcImVsZWN0cmljIGdyYW5kIHBpYW5vXCIsXCJob25reS10b25rIHBpYW5vXCIsXCJlbGVjdHJpYyBwaWFubyAxXCIsXCJlbGVjdHJpYyBwaWFubyAyXCIsXCJoYXJwc2ljaG9yZFwiLFwiY2xhdmlcIixcImNlbGVzdGFcIixcImdsb2NrZW5zcGllbFwiLFwibXVzaWMgYm94XCIsXCJ2aWJyYXBob25lXCIsXCJtYXJpbWJhXCIsXCJ4eWxvcGhvbmVcIixcInR1YnVsYXIgYmVsbHNcIixcImR1bGNpbWVyXCIsXCJkcmF3YmFyIG9yZ2FuXCIsXCJwZXJjdXNzaXZlIG9yZ2FuXCIsXCJyb2NrIG9yZ2FuXCIsXCJjaHVyY2ggb3JnYW5cIixcInJlZWQgb3JnYW5cIixcImFjY29yZGlvblwiLFwiaGFybW9uaWNhXCIsXCJ0YW5nbyBhY2NvcmRpb25cIixcImFjb3VzdGljIGd1aXRhciAobnlsb24pXCIsXCJhY291c3RpYyBndWl0YXIgKHN0ZWVsKVwiLFwiZWxlY3RyaWMgZ3VpdGFyIChqYXp6KVwiLFwiZWxlY3RyaWMgZ3VpdGFyIChjbGVhbilcIixcImVsZWN0cmljIGd1aXRhciAobXV0ZWQpXCIsXCJvdmVyZHJpdmVuIGd1aXRhclwiLFwiZGlzdG9ydGlvbiBndWl0YXJcIixcImd1aXRhciBoYXJtb25pY3NcIixcImFjb3VzdGljIGJhc3NcIixcImVsZWN0cmljIGJhc3MgKGZpbmdlcilcIixcImVsZWN0cmljIGJhc3MgKHBpY2spXCIsXCJmcmV0bGVzcyBiYXNzXCIsXCJzbGFwIGJhc3MgMVwiLFwic2xhcCBiYXNzIDJcIixcInN5bnRoIGJhc3MgMVwiLFwic3ludGggYmFzcyAyXCIsXCJ2aW9saW5cIixcInZpb2xhXCIsXCJjZWxsb1wiLFwiY29udHJhYmFzc1wiLFwidHJlbW9sbyBzdHJpbmdzXCIsXCJwaXp6aWNhdG8gc3RyaW5nc1wiLFwib3JjaGVzdHJhbCBoYXJwXCIsXCJ0aW1wYW5pXCIsXCJzdHJpbmcgZW5zZW1ibGUgMVwiLFwic3RyaW5nIGVuc2VtYmxlIDJcIixcInN5bnRoc3RyaW5ncyAxXCIsXCJzeW50aHN0cmluZ3MgMlwiLFwiY2hvaXIgYWFoc1wiLFwidm9pY2Ugb29oc1wiLFwic3ludGggdm9pY2VcIixcIm9yY2hlc3RyYSBoaXRcIixcInRydW1wZXRcIixcInRyb21ib25lXCIsXCJ0dWJhXCIsXCJtdXRlZCB0cnVtcGV0XCIsXCJmcmVuY2ggaG9yblwiLFwiYnJhc3Mgc2VjdGlvblwiLFwic3ludGhicmFzcyAxXCIsXCJzeW50aGJyYXNzIDJcIixcInNvcHJhbm8gc2F4XCIsXCJhbHRvIHNheFwiLFwidGVub3Igc2F4XCIsXCJiYXJpdG9uZSBzYXhcIixcIm9ib2VcIixcImVuZ2xpc2ggaG9yblwiLFwiYmFzc29vblwiLFwiY2xhcmluZXRcIixcInBpY2NvbG9cIixcImZsdXRlXCIsXCJyZWNvcmRlclwiLFwicGFuIGZsdXRlXCIsXCJibG93biBib3R0bGVcIixcInNoYWt1aGFjaGlcIixcIndoaXN0bGVcIixcIm9jYXJpbmFcIixcImxlYWQgMSAoc3F1YXJlKVwiLFwibGVhZCAyIChzYXd0b290aClcIixcImxlYWQgMyAoY2FsbGlvcGUpXCIsXCJsZWFkIDQgKGNoaWZmKVwiLFwibGVhZCA1IChjaGFyYW5nKVwiLFwibGVhZCA2ICh2b2ljZSlcIixcImxlYWQgNyAoZmlmdGhzKVwiLFwibGVhZCA4IChiYXNzICsgbGVhZClcIixcInBhZCAxIChuZXcgYWdlKVwiLFwicGFkIDIgKHdhcm0pXCIsXCJwYWQgMyAocG9seXN5bnRoKVwiLFwicGFkIDQgKGNob2lyKVwiLFwicGFkIDUgKGJvd2VkKVwiLFwicGFkIDYgKG1ldGFsbGljKVwiLFwicGFkIDcgKGhhbG8pXCIsXCJwYWQgOCAoc3dlZXApXCIsXCJmeCAxIChyYWluKVwiLFwiZnggMiAoc291bmR0cmFjaylcIixcImZ4IDMgKGNyeXN0YWwpXCIsXCJmeCA0IChhdG1vc3BoZXJlKVwiLFwiZnggNSAoYnJpZ2h0bmVzcylcIixcImZ4IDYgKGdvYmxpbnMpXCIsXCJmeCA3IChlY2hvZXMpXCIsXCJmeCA4IChzY2ktZmkpXCIsXCJzaXRhclwiLFwiYmFuam9cIixcInNoYW1pc2VuXCIsXCJrb3RvXCIsXCJrYWxpbWJhXCIsXCJiYWcgcGlwZVwiLFwiZmlkZGxlXCIsXCJzaGFuYWlcIixcInRpbmtsZSBiZWxsXCIsXCJhZ29nb1wiLFwic3RlZWwgZHJ1bXNcIixcIndvb2RibG9ja1wiLFwidGFpa28gZHJ1bVwiLFwibWVsb2RpYyB0b21cIixcInN5bnRoIGRydW1cIixcInJldmVyc2UgY3ltYmFsXCIsXCJndWl0YXIgZnJldCBub2lzZVwiLFwiYnJlYXRoIG5vaXNlXCIsXCJzZWFzaG9yZVwiLFwiYmlyZCB0d2VldFwiLFwidGVsZXBob25lIHJpbmdcIixcImhlbGljb3B0ZXJcIixcImFwcGxhdXNlXCIsXCJndW5zaG90XCJdLGUuaW5zdHJ1bWVudEZhbWlseUJ5SUQ9W1wicGlhbm9cIixcImNocm9tYXRpYyBwZXJjdXNzaW9uXCIsXCJvcmdhblwiLFwiZ3VpdGFyXCIsXCJiYXNzXCIsXCJzdHJpbmdzXCIsXCJlbnNlbWJsZVwiLFwiYnJhc3NcIixcInJlZWRcIixcInBpcGVcIixcInN5bnRoIGxlYWRcIixcInN5bnRoIHBhZFwiLFwic3ludGggZWZmZWN0c1wiLFwiZXRobmljXCIsXCJwZXJjdXNzaXZlXCIsXCJzb3VuZCBlZmZlY3RzXCJdfSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCxlKXt2YXIgbj0wLHI9dC5sZW5ndGgsaT1yO2lmKHI+MCYmdFtyLTFdLnRpbWU8PWUpcmV0dXJuIHItMTtmb3IoO2k+bjspe3ZhciBhPU1hdGguZmxvb3IobisoaS1uKS8yKSxvPXRbYV0scz10W2ErMV07aWYoby50aW1lPT09ZSl7Zm9yKHZhciB1PWE7dTx0Lmxlbmd0aDt1Kyspe3ZhciBjPXRbdV07Yy50aW1lPT09ZSYmKGE9dSl9cmV0dXJuIGF9aWYoby50aW1lPGUmJnMudGltZT5lKXJldHVybiBhO28udGltZT5lP2k9YTpvLnRpbWU8ZSYmKG49YSsxKX1yZXR1cm4tMX1mdW5jdGlvbiByKHQsZSl7aWYodC5sZW5ndGgpe3ZhciByPW4odCxlLnRpbWUpO3Quc3BsaWNlKHIrMSwwLGUpfWVsc2UgdC5wdXNoKGUpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGUuQmluYXJ5SW5zZXJ0PXJ9LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHI9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24oZSxuLHIpe3JldHVybiBuJiZ0KGUucHJvdG90eXBlLG4pLHImJnQoZSxyKSxlfX0oKSxpPXsxOlwibW9kdWxhdGlvbldoZWVsXCIsMjpcImJyZWF0aFwiLDQ6XCJmb290Q29udHJvbGxlclwiLDU6XCJwb3J0YW1lbnRvVGltZVwiLDc6XCJ2b2x1bWVcIiw4OlwiYmFsYW5jZVwiLDEwOlwicGFuXCIsNjQ6XCJzdXN0YWluXCIsNjU6XCJwb3J0YW1lbnRvVGltZVwiLDY2Olwic29zdGVudXRvXCIsNjc6XCJzb2Z0UGVkYWxcIiw2ODpcImxlZ2F0b0Zvb3Rzd2l0Y2hcIiw4NDpcInBvcnRhbWVudG9Db250cm9cIn0sYT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSxyLGkpe24odGhpcyx0KSx0aGlzLm51bWJlcj1lLHRoaXMudGltZT1yLHRoaXMudmFsdWU9aX1yZXR1cm4gcih0LFt7a2V5OlwibmFtZVwiLGdldDpmdW5jdGlvbigpe3JldHVybiBpLmhhc093blByb3BlcnR5KHRoaXMubnVtYmVyKT9pW3RoaXMubnVtYmVyXTp2b2lkIDB9fV0pLHR9KCk7ZS5Db250cm9sPWF9LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtmb3IodmFyIGU9e1BQUTp0LmhlYWRlci50aWNrc1BlckJlYXR9LG49MDtuPHQudHJhY2tzLmxlbmd0aDtuKyspZm9yKHZhciByPXQudHJhY2tzW25dLGk9MDtpPHIubGVuZ3RoO2krKyl7dmFyIGE9cltpXTtcIm1ldGFcIj09PWEudHlwZSYmKFwidGltZVNpZ25hdHVyZVwiPT09YS5zdWJ0eXBlP2UudGltZVNpZ25hdHVyZT1bYS5udW1lcmF0b3IsYS5kZW5vbWluYXRvcl06XCJzZXRUZW1wb1wiPT09YS5zdWJ0eXBlJiYoZS5icG18fChlLmJwbT02ZTcvYS5taWNyb3NlY29uZHNQZXJCZWF0KSkpfXJldHVybiBlLmJwbT1lLmJwbXx8MTIwLGV9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5wYXJzZUhlYWRlcj1ufSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCxlKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXSxpPWVbbl07aWYoci5sZW5ndGg+aSlyZXR1cm4hMH1yZXR1cm4hMX1mdW5jdGlvbiByKHQsZSxuKXtmb3IodmFyIHI9MCxpPTEvMCxhPTA7YTx0Lmxlbmd0aDthKyspe3ZhciBvPXRbYV0scz1lW2FdO29bc10mJm9bc10udGltZTxpJiYocj1hLGk9b1tzXS50aW1lKX1uW3JdKHRbcl1bZVtyXV0pLGVbcl0rPTF9ZnVuY3Rpb24gaSgpe2Zvcih2YXIgdD1hcmd1bWVudHMubGVuZ3RoLGU9QXJyYXkodCksaT0wO3Q+aTtpKyspZVtpXT1hcmd1bWVudHNbaV07Zm9yKHZhciBhPWUuZmlsdGVyKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIGUlMj09PTB9KSxvPW5ldyBVaW50MzJBcnJheShhLmxlbmd0aCkscz1lLmZpbHRlcihmdW5jdGlvbih0LGUpe3JldHVybiBlJTI9PT0xfSk7bihhLG8pOylyKGEsbyxzKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLk1lcmdlPWl9LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19ZnVuY3Rpb24gaSh0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5NaWRpPXZvaWQgMDt2YXIgYT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fXJldHVybiBmdW5jdGlvbihlLG4scil7cmV0dXJuIG4mJnQoZS5wcm90b3R5cGUsbiksciYmdChlLHIpLGV9fSgpLG89bigxMSkscz1yKG8pLHU9bigxMCksYz1yKHUpLGg9bigxKSxmPXIoaCksZD1uKDkpLGw9big1KSxwPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe2kodGhpcyx0KSx0aGlzLmhlYWRlcj17YnBtOjEyMCx0aW1lU2lnbmF0dXJlOls0LDRdLFBQUTo0ODB9LHRoaXMudHJhY2tzPVtdfXJldHVybiBhKHQsW3trZXk6XCJsb2FkXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcyxuPWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdP2FyZ3VtZW50c1sxXTpudWxsLHI9YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0/YXJndW1lbnRzWzJdOlwiR0VUXCI7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKGksYSl7dmFyIG89bmV3IFhNTEh0dHBSZXF1ZXN0O28ub3BlbihyLHQpLG8ucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIixvLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsZnVuY3Rpb24oKXs0PT09by5yZWFkeVN0YXRlJiYyMDA9PT1vLnN0YXR1cz9pKGUuZGVjb2RlKG8ucmVzcG9uc2UpKTphKG8uc3RhdHVzKX0pLG8uYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsYSksby5zZW5kKG4pfSl9fSx7a2V5OlwiZGVjb2RlXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcztpZih0IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3ZhciBuPW5ldyBVaW50OEFycmF5KHQpO3Q9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLG4pfXZhciByPSgwLHNbXCJkZWZhdWx0XCJdKSh0KTtyZXR1cm4gdGhpcy5oZWFkZXI9KDAsbC5wYXJzZUhlYWRlcikociksdGhpcy50cmFja3M9W10sci50cmFja3MuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgbj1uZXcgZC5UcmFjaztlLnRyYWNrcy5wdXNoKG4pO3ZhciByPTA7dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3IrPWZbXCJkZWZhdWx0XCJdLnRpY2tzVG9TZWNvbmRzKHQuZGVsdGFUaW1lLGUuaGVhZGVyKSxcIm1ldGFcIj09PXQudHlwZSYmXCJ0cmFja05hbWVcIj09PXQuc3VidHlwZT9uLm5hbWU9ZltcImRlZmF1bHRcIl0uY2xlYW5OYW1lKHQudGV4dCk6XCJub3RlT25cIj09PXQuc3VidHlwZT9uLm5vdGVPbih0Lm5vdGVOdW1iZXIscix0LnZlbG9jaXR5LzEyNyk6XCJub3RlT2ZmXCI9PT10LnN1YnR5cGU/bi5ub3RlT2ZmKHQubm90ZU51bWJlcixyKTpcImNvbnRyb2xsZXJcIj09PXQuc3VidHlwZSYmdC5jb250cm9sbGVyVHlwZT9uLmNjKHQuY29udHJvbGxlclR5cGUscix0LnZhbHVlLzEyNyk6XCJtZXRhXCI9PT10LnR5cGUmJlwiaW5zdHJ1bWVudE5hbWVcIj09PXQuc3VidHlwZT9uLmluc3RydW1lbnQ9dC50ZXh0OlwiY2hhbm5lbFwiPT09dC50eXBlJiZcInByb2dyYW1DaGFuZ2VcIj09PXQuc3VidHlwZSYmbi5wYXRjaCh0LnByb2dyYW1OdW1iZXIpfSl9KSx0aGlzfX0se2tleTpcImVuY29kZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxlPW5ldyBjW1wiZGVmYXVsdFwiXS5GaWxlKHt0aWNrczp0aGlzLmhlYWRlci5QUFF9KTtyZXR1cm4gdGhpcy50cmFja3MuZm9yRWFjaChmdW5jdGlvbihuLHIpe3ZhciBpPWUuYWRkVHJhY2soKTtpLnNldFRlbXBvKHQuYnBtKSxuLmVuY29kZShpLHQuaGVhZGVyKX0pLGUudG9CeXRlcygpfX0se2tleTpcInRvQXJyYXlcIix2YWx1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdD10aGlzLmVuY29kZSgpLGU9bmV3IEFycmF5KHQubGVuZ3RoKSxuPTA7bjx0Lmxlbmd0aDtuKyspZVtuXT10LmNoYXJDb2RlQXQobik7cmV0dXJuIGV9fSx7a2V5OlwidHJhY2tcIix2YWx1ZTpmdW5jdGlvbiBlKHQpe3ZhciBlPW5ldyBkLlRyYWNrKHQpO3JldHVybiB0aGlzLnRyYWNrcy5wdXNoKGUpLGV9fSx7a2V5OlwiZ2V0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIGZbXCJkZWZhdWx0XCJdLmlzTnVtYmVyKHQpP3RoaXMudHJhY2tzW3RdOnRoaXMudHJhY2tzLmZpbmQoZnVuY3Rpb24oZSl7cmV0dXJuIGUubmFtZT09PXR9KX19LHtrZXk6XCJzbGljZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0/YXJndW1lbnRzWzBdOjAsbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06dGhpcy5kdXJhdGlvbixyPW5ldyB0O3JldHVybiByLmhlYWRlcj10aGlzLmhlYWRlcixyLnRyYWNrcz10aGlzLnRyYWNrcy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuc2xpY2UoZSxuKX0pLHJ9fSx7a2V5Olwic3RhcnRUaW1lXCIsZ2V0OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy50cmFja3MubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LnN0YXJ0VGltZX0pO3JldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLHQpfX0se2tleTpcImJwbVwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmhlYWRlci5icG19LHNldDpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmhlYWRlci5icG07dGhpcy5oZWFkZXIuYnBtPXQ7dmFyIG49ZS90O3RoaXMudHJhY2tzLmZvckVhY2goZnVuY3Rpb24odCl7cmV0dXJuIHQuc2NhbGUobil9KX19LHtrZXk6XCJ0aW1lU2lnbmF0dXJlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaGVhZGVyLnRpbWVTaWduYXR1cmV9LHNldDpmdW5jdGlvbih0KXt0aGlzLmhlYWRlci50aW1lU2lnbmF0dXJlPXRpbWVTaWduYXR1cmV9fSx7a2V5OlwiZHVyYXRpb25cIixnZXQ6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnRyYWNrcy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZHVyYXRpb259KTtyZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCx0KX19XSksdH0oKTtlLk1pZGk9cH0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIodCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1mdW5jdGlvbiBpKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLk5vdGU9dm9pZCAwO3ZhciBhPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKGUsbixyKXtyZXR1cm4gbiYmdChlLnByb3RvdHlwZSxuKSxyJiZ0KGUsciksZX19KCksbz1uKDEpLHM9cihvKSx1PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlLG4pe3ZhciByPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdP2FyZ3VtZW50c1syXTowLGE9YXJndW1lbnRzLmxlbmd0aD4zJiZ2b2lkIDAhPT1hcmd1bWVudHNbM10/YXJndW1lbnRzWzNdOjE7aWYoaSh0aGlzLHQpLHRoaXMubWlkaSxzW1wiZGVmYXVsdFwiXS5pc051bWJlcihlKSl0aGlzLm1pZGk9ZTtlbHNle2lmKCFzW1wiZGVmYXVsdFwiXS5pc1BpdGNoKGUpKXRocm93IG5ldyBFcnJvcihcInRoZSBtaWRpIHZhbHVlIG11c3QgZWl0aGVyIGJlIGluIFBpdGNoIE5vdGF0aW9uIChlLmcuIEMjNCkgb3IgYSBtaWRpIHZhbHVlXCIpO3RoaXMubmFtZT1lfXRoaXMudGltZT1uLHRoaXMuZHVyYXRpb249cix0aGlzLnZlbG9jaXR5PWF9cmV0dXJuIGEodCxbe2tleTpcIm1hdGNoXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHNbXCJkZWZhdWx0XCJdLmlzTnVtYmVyKHQpP3RoaXMubWlkaT09PXQ6c1tcImRlZmF1bHRcIl0uaXNQaXRjaCh0KT90aGlzLm5hbWUudG9Mb3dlckNhc2UoKT09PXQudG9Mb3dlckNhc2UoKTp2b2lkIDB9fSx7a2V5OlwidG9KU09OXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm57bmFtZTp0aGlzLm5hbWUsbWlkaTp0aGlzLm1pZGksdGltZTp0aGlzLnRpbWUsdmVsb2NpdHk6dGhpcy52ZWxvY2l0eSxkdXJhdGlvbjp0aGlzLmR1cmF0aW9ufX19LHtrZXk6XCJuYW1lXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHNbXCJkZWZhdWx0XCJdLm1pZGlUb1BpdGNoKHRoaXMubWlkaSl9LHNldDpmdW5jdGlvbih0KXt0aGlzLm1pZGk9c1tcImRlZmF1bHRcIl0ucGl0Y2hUb01pZGkodCl9fSx7a2V5Olwibm90ZU9uXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGltZX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMudGltZT10fX0se2tleTpcIm5vdGVPZmZcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50aW1lK3RoaXMuZHVyYXRpb259LHNldDpmdW5jdGlvbih0KXt0aGlzLmR1cmF0aW9uPXQtdGhpcy50aW1lfX1dKSx0fSgpO2UuTm90ZT11fSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5UcmFjaz12b2lkIDA7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24oZSxuLHIpe3JldHVybiBuJiZ0KGUucHJvdG90eXBlLG4pLHImJnQoZSxyKSxlfX0oKSxhPW4oMyksbz1uKDQpLHM9big2KSx1PW4oOCksYz1uKDIpLGg9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0/YXJndW1lbnRzWzBdOlwiXCIsbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06LTE7cih0aGlzLHQpLHRoaXMubmFtZT1lLHRoaXMubm90ZXM9W10sdGhpcy5jb250cm9sQ2hhbmdlcz17fSx0aGlzLmluc3RydW1lbnROdW1iZXI9bn1yZXR1cm4gaSh0LFt7a2V5Olwibm90ZVwiLHZhbHVlOmZ1bmN0aW9uIGUodCxuKXt2YXIgcj1hcmd1bWVudHMubGVuZ3RoPjImJnZvaWQgMCE9PWFyZ3VtZW50c1syXT9hcmd1bWVudHNbMl06MCxpPWFyZ3VtZW50cy5sZW5ndGg+MyYmdm9pZCAwIT09YXJndW1lbnRzWzNdP2FyZ3VtZW50c1szXToxLGU9bmV3IHUuTm90ZSh0LG4scixpKTtyZXR1cm4oMCxhLkJpbmFyeUluc2VydCkodGhpcy5ub3RlcyxlKSx0aGlzfX0se2tleTpcIm5vdGVPblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0/YXJndW1lbnRzWzJdOjEscj1uZXcgdS5Ob3RlKHQsZSwwLG4pO3JldHVybigwLGEuQmluYXJ5SW5zZXJ0KSh0aGlzLm5vdGVzLHIpLHRoaXN9fSx7a2V5Olwibm90ZU9mZlwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjx0aGlzLm5vdGVzLmxlbmd0aDtuKyspe3ZhciByPXRoaXMubm90ZXNbbl07aWYoci5tYXRjaCh0KSYmMD09PXIuZHVyYXRpb24pe3Iubm90ZU9mZj1lO2JyZWFrfX1yZXR1cm4gdGhpc319LHtrZXk6XCJjY1wiLHZhbHVlOmZ1bmN0aW9uIG4odCxlLHIpe3RoaXMuY29udHJvbENoYW5nZXMuaGFzT3duUHJvcGVydHkodCl8fCh0aGlzLmNvbnRyb2xDaGFuZ2VzW3RdPVtdKTt2YXIgbj1uZXcgby5Db250cm9sKHQsZSxyKTtyZXR1cm4oMCxhLkJpbmFyeUluc2VydCkodGhpcy5jb250cm9sQ2hhbmdlc1t0XSxuKSx0aGlzfX0se2tleTpcInBhdGNoXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuaW5zdHJ1bWVudE51bWJlcj10LHRoaXN9fSx7a2V5Olwic2NhbGVcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UudGltZSo9dCxlLmR1cmF0aW9uKj10fSksdGhpc319LHtrZXk6XCJzbGljZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0/YXJndW1lbnRzWzBdOjAsbj1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06dGhpcy5kdXJhdGlvbixyPU1hdGgubWF4KHRoaXMubm90ZXMuZmluZEluZGV4KGZ1bmN0aW9uKHQpe3JldHVybiB0LnRpbWU+PWV9KSwwKSxpPXRoaXMubm90ZXMuZmluZEluZGV4KGZ1bmN0aW9uKHQpe3JldHVybiB0Lm5vdGVPZmY+PW59KSsxLGE9bmV3IHQodGhpcy5uYW1lKTtyZXR1cm4gYS5ub3Rlcz10aGlzLm5vdGVzLnNsaWNlKHIsaSksYS5ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3JldHVybiB0LnRpbWU9dC50aW1lLWV9KSxhfX0se2tleTpcImVuY29kZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gbih0KXt2YXIgZT1NYXRoLmZsb29yKHIqdCksbj1NYXRoLm1heChlLWksMCk7cmV0dXJuIGk9ZSxufXZhciByPWUuUFBRLyg2MC9lLmJwbSksaT0wLGE9MDstMSE9PXRoaXMuaW5zdHJ1bWVudE51bWJlciYmdC5pbnN0cnVtZW50KGEsdGhpcy5pbnN0cnVtZW50TnVtYmVyKSwoMCxzLk1lcmdlKSh0aGlzLm5vdGVPbnMsZnVuY3Rpb24oZSl7dC5hZGROb3RlT24oYSxlLm5hbWUsbihlLnRpbWUpLE1hdGguZmxvb3IoMTI3KmUudmVsb2NpdHkpKX0sdGhpcy5ub3RlT2ZmcyxmdW5jdGlvbihlKXt0LmFkZE5vdGVPZmYoYSxlLm5hbWUsbihlLnRpbWUpKX0pfX0se2tleTpcIm5vdGVPbnNcIixnZXQ6ZnVuY3Rpb24oKXt2YXIgdD1bXTtyZXR1cm4gdGhpcy5ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QucHVzaCh7dGltZTplLm5vdGVPbixtaWRpOmUubWlkaSxuYW1lOmUubmFtZSx2ZWxvY2l0eTplLnZlbG9jaXR5fSl9KSx0fX0se2tleTpcIm5vdGVPZmZzXCIsZ2V0OmZ1bmN0aW9uKCl7dmFyIHQ9W107cmV0dXJuIHRoaXMubm90ZXMuZm9yRWFjaChmdW5jdGlvbihlKXt0LnB1c2goe3RpbWU6ZS5ub3RlT2ZmLG1pZGk6ZS5taWRpLG5hbWU6ZS5uYW1lfSl9KSx0fX0se2tleTpcImxlbmd0aFwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm5vdGVzLmxlbmd0aH19LHtrZXk6XCJzdGFydFRpbWVcIixnZXQ6ZnVuY3Rpb24oKXtpZih0aGlzLm5vdGVzLmxlbmd0aCl7dmFyIHQ9dGhpcy5ub3Rlc1swXTtyZXR1cm4gdC5ub3RlT259cmV0dXJuIDB9fSx7a2V5OlwiZHVyYXRpb25cIixnZXQ6ZnVuY3Rpb24oKXtpZih0aGlzLm5vdGVzLmxlbmd0aCl7dmFyIHQ9dGhpcy5ub3Rlc1t0aGlzLm5vdGVzLmxlbmd0aC0xXTtyZXR1cm4gdC5ub3RlT2ZmfXJldHVybiAwfX0se2tleTpcImluc3RydW1lbnRcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYy5pbnN0cnVtZW50QnlQYXRjaElEW3RoaXMuaW5zdHJ1bWVudE51bWJlcl19LHNldDpmdW5jdGlvbih0KXt2YXIgZT1jLmluc3RydW1lbnRCeVBhdGNoSUQuaW5kZXhPZih0KTstMSE9PWUmJih0aGlzLmluc3RydW1lbnROdW1iZXI9ZSl9fSx7a2V5OlwiaW5zdHJ1bWVudEZhbWlseVwiLGdldDpmdW5jdGlvbigpe3JldHVybiBjLmluc3RydW1lbnRGYW1pbHlCeUlEW01hdGguZmxvb3IodGhpcy5pbnN0cnVtZW50TnVtYmVyLzgpXX19XSksdH0oKTtlLlRyYWNrPWh9LGZ1bmN0aW9uKHQsZSxuKXsoZnVuY3Rpb24odCl7dmFyIG49e307IWZ1bmN0aW9uKHQpe3ZhciBlPXQuREVGQVVMVF9WT0xVTUU9OTAsbj0odC5ERUZBVUxUX0RVUkFUSU9OPTEyOCx0LkRFRkFVTFRfQ0hBTk5FTD0wLHttaWRpX2xldHRlcl9waXRjaGVzOnthOjIxLGI6MjMsYzoxMixkOjE0LGU6MTYsZjoxNyxnOjE5fSxtaWRpUGl0Y2hGcm9tTm90ZTpmdW5jdGlvbih0KXt2YXIgZT0vKFthLWddKSgjK3xiKyk/KFswLTldKykkL2kuZXhlYyh0KSxyPWVbMV0udG9Mb3dlckNhc2UoKSxpPWVbMl18fFwiXCIsYT1wYXJzZUludChlWzNdLDEwKTtyZXR1cm4gMTIqYStuLm1pZGlfbGV0dGVyX3BpdGNoZXNbcl0rKFwiI1wiPT1pLnN1YnN0cigwLDEpPzE6LTEpKmkubGVuZ3RofSxlbnN1cmVNaWRpUGl0Y2g6ZnVuY3Rpb24odCl7cmV0dXJuXCJudW1iZXJcIiE9dHlwZW9mIHQmJi9bXjAtOV0vLnRlc3QodCk/bi5taWRpUGl0Y2hGcm9tTm90ZSh0KTpwYXJzZUludCh0LDEwKX0sbWlkaV9waXRjaGVzX2xldHRlcjp7MTI6XCJjXCIsMTM6XCJjI1wiLDE0OlwiZFwiLDE1OlwiZCNcIiwxNjpcImVcIiwxNzpcImZcIiwxODpcImYjXCIsMTk6XCJnXCIsMjA6XCJnI1wiLDIxOlwiYVwiLDIyOlwiYSNcIiwyMzpcImJcIn0sbWlkaV9mbGF0dGVuZWRfbm90ZXM6e1wiYSNcIjpcImJiXCIsXCJjI1wiOlwiZGJcIixcImQjXCI6XCJlYlwiLFwiZiNcIjpcImdiXCIsXCJnI1wiOlwiYWJcIn0sbm90ZUZyb21NaWRpUGl0Y2g6ZnVuY3Rpb24odCxlKXt2YXIgcixpPTAsYT10LGU9ZXx8ITE7cmV0dXJuIHQ+MjMmJihpPU1hdGguZmxvb3IodC8xMiktMSxhPXQtMTIqaSkscj1uLm1pZGlfcGl0Y2hlc19sZXR0ZXJbYV0sZSYmci5pbmRleE9mKFwiI1wiKT4wJiYocj1uLm1pZGlfZmxhdHRlbmVkX25vdGVzW3JdKSxyK2l9LG1wcW5Gcm9tQnBtOmZ1bmN0aW9uKHQpe3ZhciBlPU1hdGguZmxvb3IoNmU3L3QpLG49W107ZG8gbi51bnNoaWZ0KDI1NSZlKSxlPj49ODt3aGlsZShlKTtmb3IoO24ubGVuZ3RoPDM7KW4ucHVzaCgwKTtyZXR1cm4gbn0sYnBtRnJvbU1wcW46ZnVuY3Rpb24odCl7dmFyIGU9dDtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgdFswXSl7ZT0wO2Zvcih2YXIgbj0wLHI9dC5sZW5ndGgtMTtyPj0wOysrbiwtLXIpZXw9dFtuXTw8cn1yZXR1cm4gTWF0aC5mbG9vcig2ZTcvdCl9LGNvZGVzMlN0cjpmdW5jdGlvbih0KXtyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLHQpfSxzdHIyQnl0ZXM6ZnVuY3Rpb24odCxlKXtpZihlKWZvcig7dC5sZW5ndGgvMjxlOyl0PVwiMFwiK3Q7Zm9yKHZhciBuPVtdLHI9dC5sZW5ndGgtMTtyPj0wO3ItPTIpe3ZhciBpPTA9PT1yP3Rbcl06dFtyLTFdK3Rbcl07bi51bnNoaWZ0KHBhcnNlSW50KGksMTYpKX1yZXR1cm4gbn0sdHJhbnNsYXRlVGlja1RpbWU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTEyNyZ0O3Q+Pj03OyllPDw9OCxlfD0xMjcmdHwxMjg7Zm9yKHZhciBuPVtdOzspe2lmKG4ucHVzaCgyNTUmZSksISgxMjgmZSkpYnJlYWs7ZT4+PTh9cmV0dXJuIG59fSkscj1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcz92b2lkKCF0fHxudWxsPT09dC50eXBlJiZ2b2lkIDA9PT10LnR5cGV8fG51bGw9PT10LmNoYW5uZWwmJnZvaWQgMD09PXQuY2hhbm5lbHx8bnVsbD09PXQucGFyYW0xJiZ2b2lkIDA9PT10LnBhcmFtMXx8KHRoaXMuc2V0VGltZSh0LnRpbWUpLHRoaXMuc2V0VHlwZSh0LnR5cGUpLHRoaXMuc2V0Q2hhbm5lbCh0LmNoYW5uZWwpLHRoaXMuc2V0UGFyYW0xKHQucGFyYW0xKSx0aGlzLnNldFBhcmFtMih0LnBhcmFtMikpKTpuZXcgcih0KX07ci5OT1RFX09GRj0xMjgsci5OT1RFX09OPTE0NCxyLkFGVEVSX1RPVUNIPTE2MCxyLkNPTlRST0xMRVI9MTc2LHIuUFJPR1JBTV9DSEFOR0U9MTkyLHIuQ0hBTk5FTF9BRlRFUlRPVUNIPTIwOCxyLlBJVENIX0JFTkQ9MjI0LHIucHJvdG90eXBlLnNldFRpbWU9ZnVuY3Rpb24odCl7dGhpcy50aW1lPW4udHJhbnNsYXRlVGlja1RpbWUodHx8MCl9LHIucHJvdG90eXBlLnNldFR5cGU9ZnVuY3Rpb24odCl7aWYodDxyLk5PVEVfT0ZGfHx0PnIuUElUQ0hfQkVORCl0aHJvdyBuZXcgRXJyb3IoXCJUcnlpbmcgdG8gc2V0IGFuIHVua25vd24gZXZlbnQ6IFwiK3QpO3RoaXMudHlwZT10fSxyLnByb3RvdHlwZS5zZXRDaGFubmVsPWZ1bmN0aW9uKHQpe2lmKDA+dHx8dD4xNSl0aHJvdyBuZXcgRXJyb3IoXCJDaGFubmVsIGlzIG91dCBvZiBib3VuZHMuXCIpO3RoaXMuY2hhbm5lbD10fSxyLnByb3RvdHlwZS5zZXRQYXJhbTE9ZnVuY3Rpb24odCl7dGhpcy5wYXJhbTE9dH0sci5wcm90b3R5cGUuc2V0UGFyYW0yPWZ1bmN0aW9uKHQpe3RoaXMucGFyYW0yPXR9LHIucHJvdG90eXBlLnRvQnl0ZXM9ZnVuY3Rpb24oKXt2YXIgdD1bXSxlPXRoaXMudHlwZXwxNSZ0aGlzLmNoYW5uZWw7cmV0dXJuIHQucHVzaC5hcHBseSh0LHRoaXMudGltZSksdC5wdXNoKGUpLHQucHVzaCh0aGlzLnBhcmFtMSksdm9pZCAwIT09dGhpcy5wYXJhbTImJm51bGwhPT10aGlzLnBhcmFtMiYmdC5wdXNoKHRoaXMucGFyYW0yKSx0fTt2YXIgaT1mdW5jdGlvbih0KXtpZighdGhpcylyZXR1cm4gbmV3IGkodCk7dGhpcy5zZXRUaW1lKHQudGltZSksdGhpcy5zZXRUeXBlKHQudHlwZSksdGhpcy5zZXREYXRhKHQuZGF0YSl9O2kuU0VRVUVOQ0U9MCxpLlRFWFQ9MSxpLkNPUFlSSUdIVD0yLGkuVFJBQ0tfTkFNRT0zLGkuSU5TVFJVTUVOVD00LGkuTFlSSUM9NSxpLk1BUktFUj02LGkuQ1VFX1BPSU5UPTcsaS5DSEFOTkVMX1BSRUZJWD0zMixpLkVORF9PRl9UUkFDSz00NyxpLlRFTVBPPTgxLGkuU01QVEU9ODQsaS5USU1FX1NJRz04OCxpLktFWV9TSUc9ODksaS5TRVFfRVZFTlQ9MTI3LGkucHJvdG90eXBlLnNldFRpbWU9ZnVuY3Rpb24odCl7dGhpcy50aW1lPW4udHJhbnNsYXRlVGlja1RpbWUodHx8MCl9LGkucHJvdG90eXBlLnNldFR5cGU9ZnVuY3Rpb24odCl7dGhpcy50eXBlPXR9LGkucHJvdG90eXBlLnNldERhdGE9ZnVuY3Rpb24odCl7dGhpcy5kYXRhPXR9LGkucHJvdG90eXBlLnRvQnl0ZXM9ZnVuY3Rpb24oKXtpZighdGhpcy50eXBlKXRocm93IG5ldyBFcnJvcihcIlR5cGUgZm9yIG1ldGEtZXZlbnQgbm90IHNwZWNpZmllZC5cIik7dmFyIHQ9W107aWYodC5wdXNoLmFwcGx5KHQsdGhpcy50aW1lKSx0LnB1c2goMjU1LHRoaXMudHlwZSksQXJyYXkuaXNBcnJheSh0aGlzLmRhdGEpKXQucHVzaCh0aGlzLmRhdGEubGVuZ3RoKSx0LnB1c2guYXBwbHkodCx0aGlzLmRhdGEpO2Vsc2UgaWYoXCJudW1iZXJcIj09dHlwZW9mIHRoaXMuZGF0YSl0LnB1c2goMSx0aGlzLmRhdGEpO2Vsc2UgaWYobnVsbCE9PXRoaXMuZGF0YSYmdm9pZCAwIT09dGhpcy5kYXRhKXt0LnB1c2godGhpcy5kYXRhLmxlbmd0aCk7dmFyIGU9dGhpcy5kYXRhLnNwbGl0KFwiXCIpLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5jaGFyQ29kZUF0KDApfSk7dC5wdXNoLmFwcGx5KHQsZSl9ZWxzZSB0LnB1c2goMCk7cmV0dXJuIHR9O3ZhciBhPWZ1bmN0aW9uKHQpe2lmKCF0aGlzKXJldHVybiBuZXcgYSh0KTt2YXIgZT10fHx7fTt0aGlzLmV2ZW50cz1lLmV2ZW50c3x8W119O2EuU1RBUlRfQllURVM9Wzc3LDg0LDExNCwxMDddLGEuRU5EX0JZVEVTPVswLDI1NSw0NywwXSxhLnByb3RvdHlwZS5hZGRFdmVudD1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5ldmVudHMucHVzaCh0KSx0aGlzfSxhLnByb3RvdHlwZS5hZGROb3RlT249YS5wcm90b3R5cGUubm90ZU9uPWZ1bmN0aW9uKHQsaSxhLG8pe3JldHVybiB0aGlzLmV2ZW50cy5wdXNoKG5ldyByKHt0eXBlOnIuTk9URV9PTixjaGFubmVsOnQscGFyYW0xOm4uZW5zdXJlTWlkaVBpdGNoKGkpLHBhcmFtMjpvfHxlLHRpbWU6YXx8MH0pKSx0aGlzfSxhLnByb3RvdHlwZS5hZGROb3RlT2ZmPWEucHJvdG90eXBlLm5vdGVPZmY9ZnVuY3Rpb24odCxpLGEsbyl7cmV0dXJuIHRoaXMuZXZlbnRzLnB1c2gobmV3IHIoe3R5cGU6ci5OT1RFX09GRixjaGFubmVsOnQscGFyYW0xOm4uZW5zdXJlTWlkaVBpdGNoKGkpLHBhcmFtMjpvfHxlLHRpbWU6YXx8MH0pKSx0aGlzfSxhLnByb3RvdHlwZS5hZGROb3RlPWEucHJvdG90eXBlLm5vdGU9ZnVuY3Rpb24odCxlLG4scixpKXtyZXR1cm4gdGhpcy5ub3RlT24odCxlLHIsaSksbiYmdGhpcy5ub3RlT2ZmKHQsZSxuLGkpLHRoaXN9LGEucHJvdG90eXBlLmFkZENob3JkPWEucHJvdG90eXBlLmNob3JkPWZ1bmN0aW9uKHQsZSxuLHIpe2lmKCFBcnJheS5pc0FycmF5KGUpJiYhZS5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwiQ2hvcmQgbXVzdCBiZSBhbiBhcnJheSBvZiBwaXRjaGVzXCIpO3JldHVybiBlLmZvckVhY2goZnVuY3Rpb24oZSl7dGhpcy5ub3RlT24odCxlLDAscil9LHRoaXMpLGUuZm9yRWFjaChmdW5jdGlvbihlLHIpezA9PT1yP3RoaXMubm90ZU9mZih0LGUsbik6dGhpcy5ub3RlT2ZmKHQsZSl9LHRoaXMpLHRoaXN9LGEucHJvdG90eXBlLnNldEluc3RydW1lbnQ9YS5wcm90b3R5cGUuaW5zdHJ1bWVudD1mdW5jdGlvbih0LGUsbil7cmV0dXJuIHRoaXMuZXZlbnRzLnB1c2gobmV3IHIoe3R5cGU6ci5QUk9HUkFNX0NIQU5HRSxjaGFubmVsOnQscGFyYW0xOmUsdGltZTpufHwwfSkpLHRoaXN9LGEucHJvdG90eXBlLnNldFRlbXBvPWEucHJvdG90eXBlLnRlbXBvPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuZXZlbnRzLnB1c2gobmV3IGkoe3R5cGU6aS5URU1QTyxkYXRhOm4ubXBxbkZyb21CcG0odCksdGltZTplfHwwfSkpLHRoaXN9LGEucHJvdG90eXBlLnRvQnl0ZXM9ZnVuY3Rpb24oKXt2YXIgdD0wLGU9W10scj1hLlNUQVJUX0JZVEVTLGk9YS5FTkRfQllURVMsbz1mdW5jdGlvbihuKXt2YXIgcj1uLnRvQnl0ZXMoKTt0Kz1yLmxlbmd0aCxlLnB1c2guYXBwbHkoZSxyKX07dGhpcy5ldmVudHMuZm9yRWFjaChvKSx0Kz1pLmxlbmd0aDt2YXIgcz1uLnN0cjJCeXRlcyh0LnRvU3RyaW5nKDE2KSw0KTtyZXR1cm4gci5jb25jYXQocyxlLGkpfTt2YXIgbz1mdW5jdGlvbih0KXtpZighdGhpcylyZXR1cm4gbmV3IG8odCk7dmFyIGU9dHx8e307aWYoZS50aWNrcyl7aWYoXCJudW1iZXJcIiE9dHlwZW9mIGUudGlja3MpdGhyb3cgbmV3IEVycm9yKFwiVGlja3MgcGVyIGJlYXQgbXVzdCBiZSBhIG51bWJlciFcIik7aWYoZS50aWNrczw9MHx8ZS50aWNrcz49MzI3Njh8fGUudGlja3MlMSE9PTApdGhyb3cgbmV3IEVycm9yKFwiVGlja3MgcGVyIGJlYXQgbXVzdCBiZSBhbiBpbnRlZ2VyIGJldHdlZW4gMSBhbmQgMzI3NjchXCIpfXRoaXMudGlja3M9ZS50aWNrc3x8MTI4LHRoaXMudHJhY2tzPWUudHJhY2tzfHxbXX07by5IRFJfQ0hVTktJRD1cIk1UaGRcIixvLkhEUl9DSFVOS19TSVpFPVwiXFx4MDBcXHgwMFxceDAwXHUwMDA2XCIsby5IRFJfVFlQRTA9XCJcXHgwMFxceDAwXCIsby5IRFJfVFlQRTE9XCJcXHgwMFx1MDAwMVwiLG8ucHJvdG90eXBlLmFkZFRyYWNrPWZ1bmN0aW9uKHQpe3JldHVybiB0Pyh0aGlzLnRyYWNrcy5wdXNoKHQpLHRoaXMpOih0PW5ldyBhLHRoaXMudHJhY2tzLnB1c2godCksdCl9LG8ucHJvdG90eXBlLnRvQnl0ZXM9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnRyYWNrcy5sZW5ndGgudG9TdHJpbmcoMTYpLGU9by5IRFJfQ0hVTktJRCtvLkhEUl9DSFVOS19TSVpFO3JldHVybiBlKz1wYXJzZUludCh0LDE2KT4xP28uSERSX1RZUEUxOm8uSERSX1RZUEUwLGUrPW4uY29kZXMyU3RyKG4uc3RyMkJ5dGVzKHQsMikpLGUrPVN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy50aWNrcy8yNTYsdGhpcy50aWNrcyUyNTYpLHRoaXMudHJhY2tzLmZvckVhY2goZnVuY3Rpb24odCl7ZSs9bi5jb2RlczJTdHIodC50b0J5dGVzKCkpfSksZX0sdC5VdGlsPW4sdC5GaWxlPW8sdC5UcmFjaz1hLHQuRXZlbnQ9cix0Lk1ldGFFdmVudD1pfShuKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgdCYmbnVsbCE9PXQ/dC5leHBvcnRzPW46XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGUmJm51bGwhPT1lP2U9bjp0aGlzLk1pZGk9bn0pLmNhbGwoZSxuKDEyKSh0KSl9LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gbih0KXtmdW5jdGlvbiBlKHQpe3ZhciBlPXQucmVhZCg0KSxuPXQucmVhZEludDMyKCk7cmV0dXJue2lkOmUsbGVuZ3RoOm4sZGF0YTp0LnJlYWQobil9fWZ1bmN0aW9uIG4odCl7dmFyIGU9e307ZS5kZWx0YVRpbWU9dC5yZWFkVmFySW50KCk7dmFyIG49dC5yZWFkSW50OCgpO2lmKDI0MD09KDI0MCZuKSl7aWYoMjU1PT1uKXtlLnR5cGU9XCJtZXRhXCI7dmFyIHI9dC5yZWFkSW50OCgpLGE9dC5yZWFkVmFySW50KCk7c3dpdGNoKHIpe2Nhc2UgMDppZihlLnN1YnR5cGU9XCJzZXF1ZW5jZU51bWJlclwiLDIhPWEpdGhyb3dcIkV4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290IFwiK2E7cmV0dXJuIGUubnVtYmVyPXQucmVhZEludDE2KCksZTtjYXNlIDE6cmV0dXJuIGUuc3VidHlwZT1cInRleHRcIixlLnRleHQ9dC5yZWFkKGEpLGU7Y2FzZSAyOnJldHVybiBlLnN1YnR5cGU9XCJjb3B5cmlnaHROb3RpY2VcIixlLnRleHQ9dC5yZWFkKGEpLGU7Y2FzZSAzOnJldHVybiBlLnN1YnR5cGU9XCJ0cmFja05hbWVcIixlLnRleHQ9dC5yZWFkKGEpLGU7Y2FzZSA0OnJldHVybiBlLnN1YnR5cGU9XCJpbnN0cnVtZW50TmFtZVwiLGUudGV4dD10LnJlYWQoYSksZTtjYXNlIDU6cmV0dXJuIGUuc3VidHlwZT1cImx5cmljc1wiLGUudGV4dD10LnJlYWQoYSksZTtjYXNlIDY6cmV0dXJuIGUuc3VidHlwZT1cIm1hcmtlclwiLGUudGV4dD10LnJlYWQoYSksZTtjYXNlIDc6cmV0dXJuIGUuc3VidHlwZT1cImN1ZVBvaW50XCIsZS50ZXh0PXQucmVhZChhKSxlO2Nhc2UgMzI6aWYoZS5zdWJ0eXBlPVwibWlkaUNoYW5uZWxQcmVmaXhcIiwxIT1hKXRocm93XCJFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCBcIithO3JldHVybiBlLmNoYW5uZWw9dC5yZWFkSW50OCgpLGU7Y2FzZSA0NzppZihlLnN1YnR5cGU9XCJlbmRPZlRyYWNrXCIsMCE9YSl0aHJvd1wiRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCBcIithO3JldHVybiBlO2Nhc2UgODE6aWYoZS5zdWJ0eXBlPVwic2V0VGVtcG9cIiwzIT1hKXRocm93XCJFeHBlY3RlZCBsZW5ndGggZm9yIHNldFRlbXBvIGV2ZW50IGlzIDMsIGdvdCBcIithO3JldHVybiBlLm1pY3Jvc2Vjb25kc1BlckJlYXQ9KHQucmVhZEludDgoKTw8MTYpKyh0LnJlYWRJbnQ4KCk8PDgpK3QucmVhZEludDgoKSxlO2Nhc2UgODQ6aWYoZS5zdWJ0eXBlPVwic21wdGVPZmZzZXRcIiw1IT1hKXRocm93XCJFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCBcIithO3ZhciBvPXQucmVhZEludDgoKTtyZXR1cm4gZS5mcmFtZVJhdGU9ezA6MjQsMzI6MjUsNjQ6MjksOTY6MzB9Wzk2Jm9dLGUuaG91cj0zMSZvLGUubWluPXQucmVhZEludDgoKSxlLnNlYz10LnJlYWRJbnQ4KCksZS5mcmFtZT10LnJlYWRJbnQ4KCksZS5zdWJmcmFtZT10LnJlYWRJbnQ4KCksZTtjYXNlIDg4OmlmKGUuc3VidHlwZT1cInRpbWVTaWduYXR1cmVcIiw0IT1hKXRocm93XCJFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290IFwiK2E7cmV0dXJuIGUubnVtZXJhdG9yPXQucmVhZEludDgoKSxlLmRlbm9taW5hdG9yPU1hdGgucG93KDIsdC5yZWFkSW50OCgpKSxlLm1ldHJvbm9tZT10LnJlYWRJbnQ4KCksZS50aGlydHlzZWNvbmRzPXQucmVhZEludDgoKSxlO2Nhc2UgODk6aWYoZS5zdWJ0eXBlPVwia2V5U2lnbmF0dXJlXCIsMiE9YSl0aHJvd1wiRXhwZWN0ZWQgbGVuZ3RoIGZvciBrZXlTaWduYXR1cmUgZXZlbnQgaXMgMiwgZ290IFwiK2E7cmV0dXJuIGUua2V5PXQucmVhZEludDgoITApLGUuc2NhbGU9dC5yZWFkSW50OCgpLGU7Y2FzZSAxMjc6cmV0dXJuIGUuc3VidHlwZT1cInNlcXVlbmNlclNwZWNpZmljXCIsZS5kYXRhPXQucmVhZChhKSxlO2RlZmF1bHQ6cmV0dXJuIGUuc3VidHlwZT1cInVua25vd25cIixlLmRhdGE9dC5yZWFkKGEpLGV9cmV0dXJuIGUuZGF0YT10LnJlYWQoYSksZX1pZigyNDA9PW4pe2UudHlwZT1cInN5c0V4XCI7dmFyIGE9dC5yZWFkVmFySW50KCk7cmV0dXJuIGUuZGF0YT10LnJlYWQoYSksZX1pZigyNDc9PW4pe2UudHlwZT1cImRpdmlkZWRTeXNFeFwiO3ZhciBhPXQucmVhZFZhckludCgpO3JldHVybiBlLmRhdGE9dC5yZWFkKGEpLGV9dGhyb3dcIlVucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogXCIrbn12YXIgczswPT0oMTI4Jm4pPyhzPW4sbj1pKToocz10LnJlYWRJbnQ4KCksaT1uKTt2YXIgdT1uPj40O3N3aXRjaChlLmNoYW5uZWw9MTUmbixlLnR5cGU9XCJjaGFubmVsXCIsdSl7Y2FzZSA4OnJldHVybiBlLnN1YnR5cGU9XCJub3RlT2ZmXCIsZS5ub3RlTnVtYmVyPXMsZS52ZWxvY2l0eT10LnJlYWRJbnQ4KCksZTtjYXNlIDk6cmV0dXJuIGUubm90ZU51bWJlcj1zLGUudmVsb2NpdHk9dC5yZWFkSW50OCgpLDA9PWUudmVsb2NpdHk/ZS5zdWJ0eXBlPVwibm90ZU9mZlwiOmUuc3VidHlwZT1cIm5vdGVPblwiLGU7Y2FzZSAxMDpyZXR1cm4gZS5zdWJ0eXBlPVwibm90ZUFmdGVydG91Y2hcIixlLm5vdGVOdW1iZXI9cyxlLmFtb3VudD10LnJlYWRJbnQ4KCksZTtjYXNlIDExOnJldHVybiBlLnN1YnR5cGU9XCJjb250cm9sbGVyXCIsZS5jb250cm9sbGVyVHlwZT1zLGUudmFsdWU9dC5yZWFkSW50OCgpLGU7Y2FzZSAxMjpyZXR1cm4gZS5zdWJ0eXBlPVwicHJvZ3JhbUNoYW5nZVwiLGUucHJvZ3JhbU51bWJlcj1zLGU7Y2FzZSAxMzpyZXR1cm4gZS5zdWJ0eXBlPVwiY2hhbm5lbEFmdGVydG91Y2hcIixlLmFtb3VudD1zLGU7Y2FzZSAxNDpyZXR1cm4gZS5zdWJ0eXBlPVwicGl0Y2hCZW5kXCIsZS52YWx1ZT1zKyh0LnJlYWRJbnQ4KCk8PDcpLGU7ZGVmYXVsdDp0aHJvd1wiVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogXCIrdX19dmFyIGk7c3RyZWFtPXIodCk7dmFyIGE9ZShzdHJlYW0pO2lmKFwiTVRoZFwiIT1hLmlkfHw2IT1hLmxlbmd0aCl0aHJvd1wiQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmRcIjt2YXIgbz1yKGEuZGF0YSkscz1vLnJlYWRJbnQxNigpLHU9by5yZWFkSW50MTYoKSxjPW8ucmVhZEludDE2KCk7aWYoMzI3NjgmYyl0aHJvd1wiRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldFwiO3RpY2tzUGVyQmVhdD1jO2Zvcih2YXIgaD17Zm9ybWF0VHlwZTpzLHRyYWNrQ291bnQ6dSx0aWNrc1BlckJlYXQ6dGlja3NQZXJCZWF0fSxmPVtdLGQ9MDtkPGgudHJhY2tDb3VudDtkKyspe2ZbZF09W107dmFyIGw9ZShzdHJlYW0pO2lmKFwiTVRya1wiIT1sLmlkKXRocm93XCJVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290IFwiK2wuaWQ7Zm9yKHZhciBwPXIobC5kYXRhKTshcC5lb2YoKTspe3ZhciBtPW4ocCk7ZltkXS5wdXNoKG0pfX1yZXR1cm57aGVhZGVyOmgsdHJhY2tzOmZ9fWZ1bmN0aW9uIHIodCl7ZnVuY3Rpb24gZShlKXt2YXIgbj10LnN1YnN0cihzLGUpO3JldHVybiBzKz1lLG59ZnVuY3Rpb24gbigpe3ZhciBlPSh0LmNoYXJDb2RlQXQocyk8PDI0KSsodC5jaGFyQ29kZUF0KHMrMSk8PDE2KSsodC5jaGFyQ29kZUF0KHMrMik8PDgpK3QuY2hhckNvZGVBdChzKzMpO3JldHVybiBzKz00LGV9ZnVuY3Rpb24gcigpe3ZhciBlPSh0LmNoYXJDb2RlQXQocyk8PDgpK3QuY2hhckNvZGVBdChzKzEpO3JldHVybiBzKz0yLGV9ZnVuY3Rpb24gaShlKXt2YXIgbj10LmNoYXJDb2RlQXQocyk7cmV0dXJuIGUmJm4+MTI3JiYobi09MjU2KSxzKz0xLG59ZnVuY3Rpb24gYSgpe3JldHVybiBzPj10Lmxlbmd0aH1mdW5jdGlvbiBvKCl7Zm9yKHZhciB0PTA7Oyl7dmFyIGU9aSgpO2lmKCEoMTI4JmUpKXJldHVybiB0K2U7dCs9MTI3JmUsdDw8PTd9fXZhciBzPTA7cmV0dXJue2VvZjphLHJlYWQ6ZSxyZWFkSW50MzI6bixyZWFkSW50MTY6cixyZWFkSW50ODppLHJlYWRWYXJJbnQ6b319dC5leHBvcnRzPWZ1bmN0aW9uKHQpe3JldHVybiBuKHQpfX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIHQud2VicGFja1BvbHlmaWxsfHwodC5kZXByZWNhdGU9ZnVuY3Rpb24oKXt9LHQucGF0aHM9W10sdC5jaGlsZHJlbj1bXSx0LndlYnBhY2tQb2x5ZmlsbD0xKSx0fX1dKX0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TWlkaUNvbnZlcnQuanMubWFwIl19
