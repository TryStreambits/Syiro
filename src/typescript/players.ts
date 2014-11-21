/*
    This is a file containing the modules for the Rocket Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via rocket.audioplayer.
    The Video Player is exposed via rocket.videoplayer.
    The shared Player functionality is exposed via rocket.player.
*/

// #region Shared Player Functionality

module rocket.player {

    // #region Shared Player Initialization

    export function PlayerInit(component : Object){
        var componentElement : Element = rocket.component.Fetch(component); // Fetch the Component Element

        // #region Player Controls List
        var playerControlArea = componentElement.querySelector('div[data-rocket-minor-component="player-controls"]'); // Get the Player Controls section
        var playerControlComponent = { "id" : playControlArea.getAttribute("data-rocket-component-id"), "type" : "player-control" }; // Create the Component Object based on information from playerControlArea

        var playButtonId = playerControlArea.querySelector('div[data-rocket-minor-component="player-button-play"]').getAttribute("data-rocket-component-id"); // Get the Component ID of the Play Button
        var playButtonComponent = { "id" : playButtonId, "type" : "button" }; // Create a Component Object based on the ID we've gotten

        var playerRange = playerControlArea.querySelector('input[type="range"]'); // Get the input range

        var volumeButtonId = playerControlArea.querySelector('div[data-rocket-minor-component="player-button-volume"]').getAttribute("data-rocket-component-id"); // Get the Component ID of the Volume Button
        var volumeButtonComponent = { "id" : volumeButtonId, "type" : "button" }; // Create a Component Object based on the ID we've gotten

        // #endregion

        // #region Player Control Listeners

            // #region Play Button Listener

            rocket.component.AddListeners(playButtonComponent,
                function(){
                    var playButtonComponent : Object = arguments[0]; // Get the Play Button that was clicked
                    var playButton : Element = rocket.component.Fetch(playButtonComponent); // Get the Play Button Element

                    var playerElement = playButton.parentElement.parentElement; // Get the Play Button's player-controls section's player
                    var playerId = playerElement.getAttribute("data-rocket-component-id"); // Get the player's Component ID
                    var playerType = playerElement.getAttribute("data-rocket-component"); // Get the player's Component type
                    var playerComponent = { "id" : playerId, "type" : playerType}; // Create a Component Object based on the ID and Type of Player

                    rocket.player.PlayOrPause(playerComponent); // Switch the status of the Player to either play or pause
                }
            );

            // #endregion

            // #region Player Range Listener

            playerRange.addListener("mousedown", // When the individual first starts changing the player range value
                function(){
                    var playerControlComponent : Object = arguments[0]; // Get the Player Control Component passed by binding
                    var playerControl : Element = rocket.component.Fetch(playerControlComponent); // Fetch the Player Control Element

                    var playerRange = playerControl.querySelector("input"); // Get the Player Control Range
                    playerRange.parentElement.setAttribute("data-rocket-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                }.bind(this, playerControlComponent)
            );

            playerRange.addListener("mouseup", // When the individual first starts changing the player range value
                function(){
                    var playerControlComponent : Object = arguments[0]; // Get the Player Control Component passed by binding
                    var playerControl : Element = rocket.component.Fetch(playerControlComponent); // Fetch the Player Control Element

                    var playerRange = playerControl.querySelector("input"); // Get the Player Control Range
                    var playerRangeValue = playerControl.value; // Get the value of the input range
                }
            );

            // #endregion

            // #region Volume Button Listener

            rocket.component.AddListeners(volumeButtonComponent,
                function(){
                    var volumeButtonComponent : Object = arguments[0]; // Get the Volume Button that was clicked
                    var volumeButton : Element = rocket.component.Fetch(volumeButtonComponent); // Get the Volume Button Element

                    var playerElement = volumeButton.parentElement.parentElement; // Get the Volume Button's player-controls section's player
                    var playerId : string = playerElement.getAttribute("data-rocket-component-id"); // Get the Player Component Id
                    var playerType : string = playerElement.getAttribute("data-rocket-component"); // Get the Player Component Type
                    var playerRange = playerElement.querySelector("input"); // Get the Player Control Range
                    var playerRangeAttributes : Object= {}; // Set playerRangeAttributes as an empty Object to hold attribute information that we'll apply to the input range later

                    playerElement.setAttribute("data-rocket-component-changevolume"); // Set the player component-changing so the TimeOrVolumeChanger() knows to change volume settings

                    var playerComponent = { "id" : playerId, "type" : playerType}; // Create a Component Object based on the Id and Type of Player

                    if (rocket.player.IsDoingTimeChange(playerComponent) == false){ // If the player is not already doing a time change when the volume button is pressed
                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').setAttribute("data-rocket-component-disabled", ""); // Set to a "disabled" UI
                        volumeButton.setAttribute("data-rocket-component-status", "true"); // Set component status to true to imply it is active

                        playerRangeAttributes["max"] = "10"; // Set max to 10
                        playerRangeAttributes["step"] = "1"; // Set step to 1
                        playerRangeAttributes["value"] = (playerElement.querySelector(playerType.replace("-player", "")).volume * 10).toString(); // Set the value to the volume (which is 0.0 to 1.0) times 10
                    }
                    else{
                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').removeAttribute("data-rocket-component-disabled"); // Remove the "disabled" UI
                        volumeButton.setAttribute("data-rocket-component-status", "false"); // Set component status to false to imply the volume button is not active

                        // #region Reset Input Range to have the proper min, max values, steps.
                        // Current Time (input range value) is only changed if the player is paused, since if it is playing, it'll be auto-updated by the Player's timeupdate listener.

                        playerRangeAttributes = rocket.player.FetchPlayerLengthInfo(playerComponent); // Get a returned Object with the max the input range should be, as well as a reasonable, pre-calculated amount of steps.

                        if (rocket.player.IsPlaying(playerComponent) == false){ // If the Player is paused / not playing
                            playerRangeAttributes["value"] = playerElement.querySelector(playerType.replace("-player", "")).currentTime.toString(); // Set to the current time
                        }

                        // #endregion
                    }

                    for (var playerRangeAttribute in playerRangeAttributes){ // For each attribute defined in the playerRangeAttributes Object
                        playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]); // Set the attribute on the playerRange
                    }
                }
            );

            // #endregion

        // #endregion
    }

    // #endregion

    // #region Fetch Information about the Player's Length and reasonable step intervals

    export function FetchPlayerLengthInfo(component : Object) : Object{
        var playerLengthInfo : Object = {}; // Define playerLengthInfo as an empty Object to hold length information about the audio or video
        var playerElement : Element = rocket.component.Fetch(component); // Get the Player's Element

        var contentDuration = playerElement.querySelector(component["type"].replace("-player")).duration; // Get the Player's internal audio or video Element and its duration property
        playerLengthInfo["max"] = contentDuration; // Set the maximum to the contentDuration

        if (contentDuration <= 300){ // If the contentDuration is less than or equal to 5 minutes
            playerLengthInfo["step"] = 5; // Set the step value to 5 seconds
        }
        else if ((contentDuration > 300) && (contentDuration < 900){ // If the contentDuration is greater than 5 minutes but less than 15 minutes
            playerLengthInfo["step"] = 10; // Set the step value to 10 seconds
        }
        else{ // If the video is greater than 15 minutes
            playerLength["step"] = 15; // Set the step value to 15 seconds
        }

        return playerLengthInfo; // Return the playerLengthInfo Object
    }

    // #endregion

    // #region Player Time or Volume Changer

    export function TimeOrVolumeChanger(component : Object){

    }

    // #endregion

    // #region Fetch Information about if the Player is playing

    export function IsPlaying(component : Object) : boolean {
        var playerElement = rocket.component.Fetch(component); // Fetch the Player Element
        var isPaused = playerElement.querySelector(playerType.replace("-player", "")).paused; // Get the value of paused on the Player (opposite of what we will return)

        if (isPaused == true){ // If the Player is Paused
            return false; // Return that the Player is not playing
        }
        else{ // If the Player is NOT paused
            return true; // Return that the Player IS playing
        }
    }

}

// #endregion

// #region Rocket Player Controls Component

module rocket.playercontrol {

    // #region Player Control Generator

    export function Generate(properties : Object) : Object {
        var componentId : string = rocket.generator.IdGen("player-control"); // Generate an ID for the Player Control
        var componentElement = rocket.generator.ElementCreator(componentId, "player-control"); // Generate the basic playerControl container

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

        componentElement.appendChild(playButton); // Append the play button
        componentElement.appendChild(inputRange); // Append the input range
        componentElement.appendChild(timeStamp); // Append the timestamp label
        componentElement.appendChild(volumeButton); // Append the volume control

        rocket.component.storedComponents[componentId] = componentElement; // Store the Player Control

        return { "id" : componentId, "type" : "player-control" }; // Return a Component Object
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

            var playerControlComponent : Object = rocket.playercontrol.Generate({ "type" : "audio" }); // Pass along the "audio" type so we know NOT to append the fullscreen
            var playerControlElement : Element = rocket.component.Fetch(playerControlComponent); // Fetch the HTMLElement
            componentElement.appendChild(playerControlElement); // Append the player control
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

            var playerControlComponent : Object = rocket.playercontrol.Generate({ "type" : "video" }); // Pass along the "video" type so we know NOT to append the fullscreen
            var playerControlElement : Element = rocket.component.Fetch(playerControlComponent); // Fetch the HTMLElement
            componentElement.appendChild(playerControlElement); // Append the player control
        }

        return { "id" : componentId, "type" : "audio-player" }; // Return a Component Object
    }

    // #endregion

}

// #endregion
