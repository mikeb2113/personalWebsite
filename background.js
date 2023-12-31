let CicadaCaught = 0;
let MoleCricketsCaught = 0;

// Replace these with your actual file paths
const musicFilePath = 'City Folk/City Folk %hour%%ampm%.mp3';
const randomEventFilePath1 = 'misc/Cicada sounds.mp3';
const randomEventFilePath2 = 'misc/Mole Cricket.mp3';
const catchingBug = 'misc/Catching bug.mp3';
const clapping = 'misc/Clapping.mp3';
const rain = 'misc/Rain.mp3';
let lastPlayedHour = null; // Variable to store the last hour when music was played
let isMusicPlaying = false;
let currentAudio = null;
let fadeOutDuration = 5; // Duration of the fade out in seconds
let intervalId;
let musicInterval; // Global variable to store the music interval ID
let randomEventInterval; // Global variable to store the music interval ID
let rainEventInterval;

/*
    private final String musicFilePath = "Animal crossing time music player/City Folk/City Folk %d%s.mp3";
    private final String randomEventFilePath1 = "Animal crossing time music player/misc/Cicada sounds.mp3";
    private final String randomEventFilePath2 = "Animal crossing time music player/misc/Mole Cricket.mp3";
    private final String catchingBug = "Animal crossing time music player/misc/Catching bug.mp3";
    private final String clapping = "Animal crossing time music player/misc/Clapping.mp3";
    private final String rain = "Animal crossing time music player/misc/Rain.mp3";
    */
   //City Folk/City Folk 12am.mp3

   function stopMusicAndEvents() {
    console.log("stopMusicAndEvents called");
    if (isMusicPlaying) {
        console.log("detected that music is playing");
        clearInterval(musicInterval); // Clear the music interval
        clearInterval(randomEventInterval); // Clear the random event interval
        clearInterval(rainEventInterval); // Clear the rain event interval
        isMusicPlaying = false;

        // Stop the currently playing audio
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
    }
}

function playMusicAndEvents() {
    console.log("playMusicAndEvents called");
    if (!isMusicPlaying) {
        console.log("detected that music is not playing");
        isMusicPlaying = true;
        // Music playback logic
        setInterval(function() {
            let currentHour = getHour(); // Get the current hour

            // Check if the current hour is different from the last played hour
            if (lastPlayedHour !== currentHour) {
                let hour12 = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
                let ampm = currentHour < 12 ? 'am' : 'pm';
                let path = musicFilePath.replace('%hour%', hour12).replace('%ampm%', ampm);
                console.log("path: " + path);
                playAudio(path); // Play the audio for the current hour

                lastPlayedHour = currentHour; // Update the last played hour
            }
        }, 600);

        // Implementing task2: Random events logic
        setInterval(function() {
            let eventCalculator = Math.floor(Math.random() * 100);
            if (eventCalculator >= 50) { // Increased chance for this event
                // Logic for one type of event
                handleEvent(randomEventFilePath1);
            } else if (eventCalculator >= 40 && eventCalculator < 50) { // Increased chance for another event
                // Logic for another type of event
                handleEvent(randomEventFilePath2);
            }
        }, 60000);

        // Implementing task3: Rain event logic
        setInterval(function() {
            let random = Math.floor(Math.random() * 100);
            if (random >= 80) { 
                handleRainEvent(rain);
            }
        }, 60000);
    }
}

function triggerRandomEvent() {
    let eventCalculator = Math.floor(Math.random() * 100); // Range from 0 to 99

    // Cicada sounds with a 5% chance
    if (eventCalculator < 2) { // 0 to 4 represents 5% of the range 0-99
        handleEvent(randomEventFilePath1, () => {
            CicadaCaught++;
            playAudio(catchingBug);
            playAudio(clapping);
        });
    } 
    // Rain with a 13% chance, ensuring no overlap with the cicada event
    else if (eventCalculator >= 5 && eventCalculator < 7) { // 5 to 17 represents 13% of the range
        handleEvent(randomEventFilePath2, () => {
            MoleCricketsCaught++;
            playAudio(catchingBug);
            playAudio(clapping);
        });
    }
}




function handleEvent(filePath, callback) {
    let durationSeconds = Math.floor(Math.random() * 120) + 60; // 60-179 seconds
    let durationMillis = durationSeconds * 1000;

    playEventSound(filePath); // Use playEventSound to handle event sounds

    setTimeout(() => {
        if (typeof callback === 'function') {
            callback();
        }
    }, durationMillis);
}

function playEventSound(filePath) {
    let eventAudio = new Audio(filePath);
    eventAudio.play().then(() => {
        console.log("Event sound started successfully:", filePath);
    }).catch((error) => {
        console.error("Error during event sound playback for:", filePath, error);
    });
}



function handleRainEvent(filePath) {
    let rainAudio = new Audio(filePath);
    rainAudio.loop = true; // If you want the rain sound to loop
    rainAudio.play().then(() => {
        console.log("Rain sound started successfully:", filePath);
    }).catch((error) => {
        console.error("Error during rain sound playback for:", filePath, error);
    });

    // You can store rainAudio in a global variable if you need to stop it later
}

function playAudio(filePath) {
    // Stop the currently playing audio
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset the audio to the start
    }

    // Start the new audio track
    currentAudio = new Audio(filePath);
    currentAudio.loop = false; // Disable auto looping

    currentAudio.play().then(() => {
        console.log("Playback started successfully for:", filePath);
    }).catch((error) => {
        console.error("Error during playback for:", filePath, error);
    });

    // Event listener for when the audio ends
    currentAudio.addEventListener('ended', function() {
        console.log("Audio track ended.");

        let currentHour = getHour(); // Get the current hour again
        let hour12 = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
        let ampm = currentHour < 12 ? 'am' : 'pm';
        let newPath = musicFilePath.replace('%hour%', hour12).replace('%ampm%', ampm);

        if (newPath !== filePath) {
            console.log("Hour changed. Playing track for the new hour.");
            playAudio(newPath); // Play the audio for the new hour if it has changed
        } else {
            console.log("Replaying track for the same hour.");
            playAudio(filePath); // Replay the same track if the hour hasn't changed
        }
    });
}

function playNextTrack() {
    let currentHour = getHour(); // Assuming getHour() returns the current hour
    let nextHour = (currentHour + 1) % 24; // Calculate the next hour, wrap around at 24
    let hour12 = nextHour > 12 ? nextHour - 12 : (nextHour === 0 ? 12 : nextHour);
    let ampm = nextHour < 12 ? 'am' : 'pm';
    let path = musicFilePath.replace('%hour%', hour12).replace('%ampm%', ampm);
    
    playAudio(path); // Play the audio for the next hour
}

function fadeOutAudio(audio, duration) {
    let originalVolume = audio.volume;
    // Adjust the step calculation for a more gradual decrease
    // Increasing the divisor will decrease the step size
    let step = originalVolume / (duration * 1000 / 50); // Decrease step size for more subtlety

    let fadeOutInterval = setInterval(() => {
        if (audio.volume > step) {
            audio.volume -= step;
        } else {
            // Stop and reset the audio when the volume is almost zero
            audio.pause();
            audio.volume = originalVolume;
            audio.currentTime = 0;
            clearInterval(fadeOutInterval);
        }
    }, 50); // Increase interval duration for smoother transition
}

function getHour() {
    let date = new Date();
    return date.getHours();
}