	var phrase;
	var gender = null;
	var filetype = "mp3";
	const port = process.env.PORT || 3000;
	const fs = require('fs');
	const sdk = require('microsoft-cognitiveservices-speech-sdk');
	const { Buffer } = require('buffer');
    const { PassThrough } = require('stream');
	const dotenv = require('dotenv').config();
	const genders = ["male", "female"];
	const malevoices = ["en-US-AIGenerate1Neural", "en-US-BrandonNeural", "en-US-ChristopherNeural", "en-US-DavisNeural", "en-US-TonyNeural", "en-US-SteffanNeural", "en-US-EricNeural", "en-US-GuyNeural", "en-US-JacobNeural","en-US-DavisNeural", "en-US-TonyNeural", "en-US-SteffanNeural", "en-US-EricNeural", "en-US-GuyNeural",  "en-US-JasonNeural"];
	const femalevoices = ["en-US-AIGenerate2Neural", "en-US-ElizabethNeural", "en-US-AmberNeural", "en-US-JaneNeural", "en-US-AnaNeural", "en-US-AriaNeura", "en-US-AshleyNeural", "en-US-CoraNeural", "en-US-JennyNeural", "en-US-MichelleNeural", "en-US-MonicaNeural", "en-US-NancyNeural", "en-US-SaraNeural", "en-US-SaraNeural","en-US-ElizabethNeural", "en-US-AmberNeural", "en-US-JaneNeural", "en-US-CoraNeural", "en-US-JennyNeural" ];
	const filetypes = ["wav", "mp3", "ogg"];
	const express = require('express');
	const path = require('path');
	const utils = require('./utils');
	const { textToSpeech } = require('./azure-cognitiveservices-speech');
	const timestamp = require('timestamp');
	const key = (Math.round(Math.random())) ? process.env.key1 : process.env.key;
	const region = process.env.region;
	const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
		  speechConfig.speechSynthesisLanguage = "en-US"; // language - default 
		  speechConfig.speechSynthesisOutputFormat = 5; // mp3 - default  
	
	      	  
    // server
    const app = express();
 
 // Log request
    app.use(utils.appLogger);
	
    // root route - serve static file
    app.get('/', (req, res) => {
        res.json({Description: 'textToAudio API'});
        res.end();

    });
	
    // creates a temp file on server, then streams to client
    /* eslint-disable no-unused-vars */
	
    app.get('/textToSpeechFile', async (req, res, next) => {
		
		// convert callback function to promise
		return new Promise((resolve, reject) => {
      			
			phrase = req.query.phrase;
			gender = req.query.voice;
			filetype  = req.query.type;
			
			if (!phrase) res.status(404).send('text phrase to be converted required');
			
			// init configuration
			initTTSConfigurations();
	
			let audioConfig = null;
			
			let fileName = "./temp/stream-from-file-" + timestamp() + "." + filetype;
			
		    audioConfig = sdk.AudioConfig.fromAudioFileOutput(fileName);
		
    		const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

			synthesizer.speakTextAsync(
				phrase,
				result => {
					
					const { audioData } = result;

					synthesizer.close();
						
					// return stream from file
					const audioFile = fs.createReadStream(fileName);
				    resolve(audioFile);
					res.download(fileName);
					
					// Check if file specified by the filePath exists
					/*fs.exists(fileName, function (exists) {
						if (exists) {
							// Content-type is very interesting part that guarantee that
							// Web browser will handle response in an appropriate manner.
							res.writeHead(200, {
								"Content-Type": "application/octet-stream",
								"Content-Disposition": "attachment; filename=" + fileName
							});
							fs.createReadStream(fileName).pipe(res);
							return;
						}
						res.writeHead(400, { "Content-Type": "text/plain" });
						res.end("ERROR File does not exist");
					});*/
					
				},
				error => {
					synthesizer.close();
					reject(error);
			}); 
		});
	});
	
	// creates a temp file on server, then streams to client
    /* eslint-disable no-unused-vars */
	
    app.get('/textToSpeechMem', async (req, res) => {
				
		let audioConfig = null;
			
		const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
			
		// convert callback function to promise
		return new Promise((resolve, reject) => {
      		
            phrase = req.query.phrase;		
			gender = req.query.voice;
			filetype  = req.query.type;
			
			if (!phrase) res.status(404).send('text phrase to be converted required');
			
			// init configuration
		    initTTSConfigurations();
		
			synthesizer.speakTextAsync(
				phrase,
				result => {
					
					const { audioData } = result;

					synthesizer.close();
					
					// return stream from memory
					const bufferStream = new PassThrough();
					bufferStream.end(Buffer.from(audioData));
					//bufferStream.push(audioData);
					resolve(bufferStream);
					/*res.set({
						'Content-Type': 'audio/mpeg',
						'Transfer-Encoding': 'chunked'
					});*/
					
					bufferStream.pipe(res.set({
						'Content-Type': 'audio/mpeg',
						'Transfer-Encoding': 'chunked'
					}));
					
				},
				error => {
					synthesizer.close();
					reject(error);
			}); 
		});
	});

    // Catch errors
    app.use(utils.logErrors);
    app.use(utils.clientError404Handler);
    app.use(utils.clientError500Handler);
    app.use(utils.errorHandler);
	
	function initTTSConfigurations(){
		
		var rnd = (Math.round(Math.random())) ? 0 : 1 ;
		
		console.log(rnd);
		 
		if ( gender == undefined ) {
			console.log("in");
			if (rnd == 1) {
				speechConfig.speechSynthesisVoiceName = malevoices[Math.floor(Math.random()*malevoices.length)];
				speechConfig.SynthesisVoiceGender = 2; // male
			} else {
				speechConfig.speechSynthesisVoiceName = femalevoices[Math.floor(Math.random()*femalevoices.length)];
				speechConfig.SynthesisVoiceGender = 1; // female 
			}
			
		}
		
		if (( gender != undefined ) &&( gender.toLowerCase() == "male" )) {
			
			speechConfig.SynthesisVoiceGender = 2; // male - default
			var rndmale = malevoices[Math.floor(Math.random()*malevoices.length)];
			console.log(rndmale);
			speechConfig.speechSynthesisVoiceName = rndmale;

		} 
		if (( gender != undefined ) &&( gender.toLowerCase() == "female" )) {
			
			speechConfig.SynthesisVoiceGender = 1; // female 
			var rndfemale = femalevoices[Math.floor(Math.random()*femalevoices.length)];
			console.log(rndfemale);
			speechConfig.speechSynthesisVoiceName = rndfemale;
			
		}
		
		if (filetype == "wav") {
			
			speechConfig.speechSynthesisOutputFormat = 12; // wav 
			
		} else if (filetype == "ogg") {
			
			speechConfig.speechSynthesisOutputFormat = 18; // ogg
			
		} else {
			
			speechConfig.speechSynthesisOutputFormat = 5; // mp3
			filetype = "mp3";
		}							
	}

	// start the server listening for requests
	app.listen(port, 
		() => console.log("TTS Server is running..."));