/*
    This is a file containing the modules for the Rocket Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via rocket.audioplayer.
    The Video Player is exposed via rocket.videoplayer.
    The shared Player functionality is exposed via rocket.player.
*/

// #region Shared Player Functionality

module rocket.player {

    // #region Generic Player Controls Generator

    export function GenerateCpntrols(playerType : string) : HTMLElement { // Generate player controls for either the Audio or Video Player
        var playerControls = rocket.generator.ElementCreator(null, "div",
            {
                "data-rocket-minor-component" : "player-controls" // Define as a minor component
            }
        );

        var playButton = rocket.generate.Button( // Generate a Play Button
            {
                "icon" : "css/img/play.png" // Set the icon to the play icon
            }
        );

        var inputRange : HTMLElement = rocket.generator.ElementCreator(null, "input", { "type" : "range" }); // Create an input range
        var timeStamp : HTMLElement = rocket.generator.ElementCreator(null, "label"); // Create a timestamp label

        var volumeButton = rocket.generate.Button( // Generate a Volume Button
            {
                "icon" : "css/img/volume.png" // Set the icon to the volume icon
            }
        );

        playerControls.appendChild(playButton); // Append the play button
        playerControls.appendChild(inputRange); // Append the input range
        playerControls.appendChild(timeStamp); // Append the timestamp label
        playerControls.appendChild(volumeButton); // Append the volume control

        if (playerType == "video"){ // If the player type is a video
            var fullscreenButton = rocket.generate.Button( // Generate a Fullscreen Button
                {
                    "icon" : "css/img/fullescreen.png" // Set the icon to the fullscreen icon
                }
            );

            playerControls.appendChild(fullscreenButton); // Append the fullscreen control
        }

        return playerControls; // Return the playerControls HTMLElement
    }

    // #endregion

}

// #endregion

// #region Audio Player Component

module rocket.audioplayer {

    // #region Audio Player Generator

    export function Generate(properties : Object) : Object { // Generate a Audio Player Component and return a Component Object
        if (properties["audio"] !== undefined){ // If the audio property is defined
            var componentId : string = rocket.generator.IdGen("audio-player"); // Generate a component Id
            var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "audio-player"); // Generate an Audio Player Element

            var audioPlayer : HTMLElement = rocket.generator.ElementCreator(null, "audio", // Create the audio player
                {
                    "preload" : "metadata", // Only download metadata
                    "src" : properties["audio"], // Set the src to the audio source defined
                    "volume" : "0.5" // Set volume to 50%
                }
            );
            componentElement.appendChild(audioPlayer); // Append the audio player

            if ((properties["art"] !== undefined) && (properties["song"] !== undefined)){ // If the properties has cover art and the song title defined
                var playerInformation : HTMLElement = rocket.generator.ElementCreator(null, "div", // Create the player information
                    {
                        "data-rocket-minor-component" : "player-information"
                    }
                );

                var playerInformationDetails : HTMLElement = document.createElement("section");

                var coverArt : HTMLELement = rocket.generator.ElementCreator(null, "img", { "src" : properties["art"]}); // Create the cover art
                var songTitle : HTMLElement = rocket.generator.ElementCreator(null, "b", { "content" : properties["song"]}); // Create a "bold" tag with the song title

                playerInformationDetails.appendChild(coverArt); // Append the cover art to the playerInformationDetails section
                playerInformationDetails.appendChild(songTitle); // Append the song title to the playerInformationDetails section

                if (properties["artist"] !== undefined){ // If the artist is NOT undefined
                    var artistInfo = rocket.generator.ElementCreator(null, "label", { "content" : properties["artist"] }); // Create a label with the artist info
                    playerInformationDetails.appendChild(artistInfo);
                }

                if (properties["album"] !== undefined){ // If the album is NOT undefined
                    var albumInfo = rocket.generator.ElementCreator(null, "label", { "content" : properties["album"] }); // Create a label with the album info
                    playerInformationDetails.appendChild(albumInfo);
                }

                componentElement.appendChild(playerInformationDetails); // Append the player information details to the component Element
            }

            var playerControls : HTMLElement = rocket.player.GenerateControls("audio"); // Pass along the "audio" variable so we know NOT to append the fullscreen
            componentElement.appendChild(playerControls); // Append the player controls
        }

        return { "id" : componentId, "type" : "audio-player" }; // Return a Component Object
    }

    // #endregion

}

// #endregion

// #region Video Player Component

module rocket.videoplayer {

    // #region Video Player Generator

    export function Generate(properties : Object) : Object { // Generate a Video Player Component and return a Component Object
        if (properties["video"] !== undefined){ // If the video property is defined
            var componentId : string = rocket.generator.IdGen("video-player"); // Generate a component Id
            var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "video-player"); // Generate an Video Player Element

            var videoPlayerAttributes = { // Define videoPlayerAttributes as an Object
                "preload" : "metadata", // Only download metadata
                "src" : properties["video"], // Set the src to the audio source defined
                "volume" : "0.5" // Set volume to 50%
            };

            var videoPlayer : HTMLElement = rocket.generator.ElementCreator(null, "video", videoPlayerAttributes); // Create the video player
            componentElement.appendChild(videoPlayer); // Append the video player

            var playerControls : HTMLElement = rocket.generator.PlayerControls("video"); // Pass along the "video" variable so we know to append the fullscreen
            componentElement.appendChild(playerControls); // Append the player controls
        }

        return { "id" : componentId, "type" : "audio-player" }; // Return a Component Object
    }

    // #endregion

}

// #endregion
