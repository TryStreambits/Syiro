/*
    This is a file containing the modules for the Rocket Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via rocket.audioplayer.
    The Video Player is exposed via rocket.videoplayer.
    The shared Player functionality is exposed via rocket.player.
*/

// #region Shared Player Functionality

module rocket.player {

    // #region Shared Player Initialization

    export function Init(component : Object){
        console.log(component);
        var componentElement : Element = rocket.component.Fetch(component); // Fetch the Component Element
        var innerContentElement : Element = rocket.player.GetInnerContentElement(component); // Fetch the Audio or Video Player Element

        // #region Player Controls List
        var playerControlArea = componentElement.querySelector('div[data-rocket-minor-component="player-controls"]'); // Get the Player Controls section
        var playerControlComponent = { "id" : playerControlArea.getAttribute("data-rocket-component-id"), "type" : "player-control" }; // Create the Component Object based on information from playerControlArea

        var playerRange = playerControlArea.querySelector('input[type="range"]'); // Get the input range

        // #endregion

        // #region Audio / Video Time Updating

        innerContentElement.addEventListener("timeupdate", // Add an event listener to track timeupdate
            function(){
                var playerComponent = arguments[0];
                var playerComponentElement = rocket.component.Fetch(playerComponent); // Fetch the Player Component Element
                var playerControlElement = rocket.component.Fetch(playerControlComponent); // Fetch the Player Control Element

                if (playerComponentElement.getAttribute("data-rocket-component-changevolume") !== "true"){ // If the user is NOT using the input range to change volume
                    playerComponentElement.querySelector('div[data-rocket-component="player-control"]').querySelector("input").value = rocket.player.GetInnerContentElement(playerComponent).currentTime; // Set the range input to the currentTime
                }
            }.bind(this, component) // Pass along the Player Component and Player Control Component
        );

        // #endregion

        // #region Player Control Listeners

            // #region Play Button Listener

            var playButtonId = playerControlArea.querySelector('div[data-rocket-minor-component="player-button-play"]').getAttribute("data-rocket-component-id"); // Get the Component ID of the Play Button
            var playButtonComponent = { "id" : playButtonId, "type" : "button" }; // Create a Component Object based on the ID we've gotten

            rocket.component.AddListeners(playButtonComponent,
                function(){
                    var playButtonComponent : Object = arguments[0]; // Get the Play Button that was clicked
                    var playButton : Element = rocket.component.Fetch(playButtonComponent); // Get the Play Button Element

                    if (playButton.hasAttribute("data-rocket-component-disabled") == false){ // If the play button is not disabled (done when tweaking volume)
                        var playerElement = playButton.parentElement.parentElement; // Get the Play Button's player-controls section's player
                        var playerId = playerElement.getAttribute("data-rocket-component-id"); // Get the player's Component ID
                        var playerType = playerElement.getAttribute("data-rocket-component"); // Get the player's Component type
                        var playerComponent = { "id" : playerId, "type" : playerType}; // Create a Component Object based on the ID and Type of Player

                        rocket.player.PlayOrPause(playerComponent); // Switch the status of the Player to either play or pause

                        if (rocket.player.IsPlaying(playerComponent) == true){ // If the Player is now playing
                            rocket.component.CSS(playButtonComponent, "background-image", "css/img/pause.png"); // Set background-image to pause
                        }
                        else{ // If the Player is paused
                            rocket.component.CSS(playButtonComponent, "background-image", "css/img/play.png"); // Set background-image to pause
                        }
                    }
                }
            );

            // #endregion

            // #region Player Range Listener

            playerRange.addEventListener("mousedown touchstart MSPointerDown", // When the individual first starts changing the player range value
                function(){
                    var playerControlComponent : Object = arguments[0]; // Get the Player Control Component passed by binding
                    var playerControl : Element = rocket.component.Fetch(playerControlComponent); // Fetch the Player Control Element

                    var playerRange = playerControl.querySelector("input"); // Get the Player Control Range
                    playerRange.parentElement.setAttribute("data-rocket-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                }.bind(this, playerControlComponent)
            );

            playerRange.addEventListener("mouseup touchend MSPointerUp", rocket.player.TimeOrVolumeChanger.bind(this, playerControlComponent)); // When the individual lets go of the mouse / tap, call the TimeOrVolumeChanger()

            // #endregion

            // #region Volume Button Listener

            var volumeButtonId = playerControlArea.querySelector('div[data-rocket-minor-component="player-button-volume"]').getAttribute("data-rocket-component-id"); // Get the Component ID of the Volume Button
            var volumeButtonComponent = { "id" : volumeButtonId, "type" : "button" }; // Create a Component Object based on the ID we've gotten

            rocket.component.AddListeners(volumeButtonComponent,
                function(){
                    var volumeButtonComponent : Object = arguments[0]; // Get the Volume Button that was clicked
                    var volumeButton : Element = rocket.component.Fetch(volumeButtonComponent); // Get the Volume Button Element

                    var playerElement = volumeButton.parentElement.parentElement; // Get the Volume Button's player-controls section's player
                    var playerId : string = playerElement.getAttribute("data-rocket-component-id"); // Get the Player Component Id
                    var playerType : string = playerElement.getAttribute("data-rocket-component"); // Get the Player Component Type
                    var playerRange = playerElement.querySelector("input"); // Get the Player Control Range
                    var playerRangeAttributes : Object= {}; // Set playerRangeAttributes as an empty Object to hold attribute information that we'll apply to the input range later

                    var playerComponent = { "id" : playerId, "type" : playerType}; // Create a Component Object based on the Id and Type of Player

                    if (rocket.player.IsDoingTimeChange(playerComponent) == true){ // If we are NOT already actively doing a volume change
                        playerElement.setAttribute("data-rocket-component-changevolume"); // Set the player component-changing so the TimeOrVolumeChanger() knows to change volume settings

                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').setAttribute("data-rocket-component-disabled", ""); // Set to a "disabled" UI
                        volumeButton.setAttribute("data-rocket-component-status", "true"); // Set component status to true to imply it is active

                        playerRangeAttributes["max"] = "10"; // Set max to 10
                        playerRangeAttributes["step"] = "1"; // Set step to 1
                        playerRangeAttributes["value"] = (rocket.player.GetInnerContentElement(playerComponent).volume * 10).toString(); // Set the value to the volume (which is 0.0 to 1.0) times 10
                    }
                    else{ // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').removeAttribute("data-rocket-component-disabled"); // Remove the "disabled" UI
                        volumeButton.setAttribute("data-rocket-component-status", "false"); // Set component status to false to imply the volume button is not active

                        // #region Reset Input Range to have the proper min, max values, steps.
                        // Current Time (input range value) is only changed if the player is paused, since if it is playing, it'll be auto-updated by the Player's timeupdate listener.

                        playerRangeAttributes = rocket.player.GetPlayerLengthInfo(playerComponent); // Get a returned Object with the max the input range should be, as well as a reasonable, pre-calculated amount of steps.

                        if (rocket.player.IsPlaying(playerComponent) == false){ // If the Player is paused / not playing
                            playerRangeAttributes["value"] = rocket.player.GetInnerContentElement(playerComponent).currentTime.toString(); // Set to the current time
                        }

                        // #endregion

                        playerElement.removeAttribute("data-rocket-component-changevolume"); // Remove the changevolume attribute.
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

    // #region Get Internal Audio or Video Element of Player container Component

    export function GetInnerContentElement(component : Object) : HTMLMediaElement {
        var componentElement = rocket.component.Fetch(component); // Get the Player Component
        return componentElement.querySelector(component["type"].replace("-player", "")); // Return the Element fetched from querySelector (audio or video)
    }

    // #endregion

    // #region Get Information about the Player's Length and reasonable step intervals

    export function GetPlayerLengthInfo(component : Object) : Object{
        var playerLengthInfo : Object = {}; // Define playerLengthInfo as an empty Object to hold length information about the audio or video

        var contentDuration = rocket.player.GetInnerContentElement(component).duration; // Get the Player's internal audio or video Element and its duration property
        playerLengthInfo["max"] = contentDuration; // Set the maximum to the contentDuration

        if (contentDuration <= 300){ // If the contentDuration is less than or equal to 5 minutes
            playerLengthInfo["step"] = 5; // Set the step value to 5 seconds
        }
        else if ((contentDuration > 300) && (contentDuration < 900)){ // If the contentDuration is greater than 5 minutes but less than 15 minutes
            playerLengthInfo["step"] = 10; // Set the step value to 10 seconds
        }
        else{ // If the video is greater than 15 minutes
            playerLengthInfo["step"] = 15; // Set the step value to 15 seconds
        }

        return playerLengthInfo; // Return the playerLengthInfo Object
    }

    // #endregion

    // #region Player Time or Volume Changer

    export function TimeOrVolumeChanger(){
        var playerControlComponent = arguments[0]; // Define playerControlComponent as the first argument passed.
        var playerControlElement = rocket.component.Fetch(playerControlComponent); // Get the Player Control Element
        var playerRange : HTMLInputElement = playerControlElement.querySelector("input"); // Get the Player Control Element's input

        var playerElement = playerControlElement.parentElement; // Get the Player Control's parent Player container
        var playerId : string = playerElement.getAttribute("data-rocket-component-id"); // Get the Player Component Id
        var playerType : string = playerElement.getAttribute("data-rocket-component"); // Get the Player Component Type

        var contentElement : HTMLMediaElement = rocket.player.GetInnerContentElement({ "id" : playerId, "type" : playerType}); // Get the Player's Audio or Video ELement

        if (rocket.player.IsDoingTimeChange({ "id" : playerId, "type" : playerType}) == true){ // If we are doing a time change
            contentElement.currentTime = Number(playerRange.value); // Set the contentElement's currentTime to the converted playerRange value
        }
        else{
            contentElement.volume = (Number(playerRange.value) / 10); // Set the volume to the converted playerRange value divided by 10
        }
    }

    // #endregion

    // #region Get Information about if the Player is playing

    export function IsPlaying(component : Object) : boolean {
        var componentElement = rocket.component.Fetch(component); // Fetch the Player Element
        var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused; // Get the value of paused on the Player (opposite of what we will return)

        if (isPaused == true){ // If the Player is Paused
            return false; // Return that the Player is not playing
        }
        else{ // If the Player is NOT paused
            return true; // Return that the Player IS playing
        }
    }

    // #endregion

    // #region Get Information about if the Player slider is doing time change or volume changing

    export function IsDoingTimeChange(component : Object) : boolean {
        var componentElement = rocket.component.Fetch(component); // Get the Component's Element

        if (componentElement.getAttribute("data-rocket-component-changevolume") !== "true"){ // If the changevolume attribute is NOT true, meaning we ARE doing a time change
            return true;
        }
        else{ // If changevolume attribute IS true, meaning we are NOT doing a time change
            return false;
        }
    }

    // #endregion

    // #region Play or Pause Audio or Video based on current state

    export function PlayOrPause(component : Object) : string {
        var newPlayerStatus : string; // Define newPlayerStatus as the new status of the player

        var innerContentElement = rocket.player.GetInnerContentElement(component); // Get the inner audio or video Element

        if (innerContentElement.paused == false){ // If the audio or video Element is playing
            innerContentElement.pause(); // Pause the audio or video Element
            newPlayerStatus = "pause"; // Set newPlayerStatus to pause
        }
        else{ // If the audio or video Element is paused
            innerContentElement.play(); // Play the audio or video Element
            newPlayerStatus = "play"; // Set newPlayerStatus to play
        }

        return newPlayerStatus;
    }
}

// #endregion

// #region Rocket Player Controls Component

module rocket.playercontrol {

    // #region Player Control Generator

    export function Generate(properties : Object) : Object {
        var componentId : string = rocket.generator.IdGen("player-control"); // Generate an ID for the Player Control
        var componentElement = rocket.generator.ElementCreator(componentId, "player-control"); // Generate the basic playerControl container

        var playButton = rocket.button.Generate( // Generate a Play Button
            {
                "data-rocket-minor-component" : "player-button-play" // Set the icon to the play icon
            }
        );

        var inputRange : HTMLElement = rocket.generator.ElementCreator(null, "input", { "type" : "range" }); // Create an input range
        var timeStamp : HTMLElement = rocket.generator.ElementCreator(null, "label"); // Create a timestamp label

        var volumeButton = rocket.button.Generate( // Generate a Volume Button
            {
                "data-rocket-minor-component" : "player-button-volume" // Set the icon to the volume icon
            }
        );

        componentElement.appendChild(rocket.component.Fetch(playButton)); // Append the play button
        componentElement.appendChild(inputRange); // Append the input range
        componentElement.appendChild(timeStamp); // Append the timestamp label
        componentElement.appendChild(rocket.component.Fetch(volumeButton)); // Append the volume control

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
            audioPlayer.autoplay = false; // Set autoplay of audio to false
            componentElement.appendChild(audioPlayer); // Append the audio player

            if ((properties["art"] !== undefined) && (properties["title"] !== undefined)){ // If the properties has cover art and the audio title defined
                var playerInformation : HTMLElement = rocket.generator.ElementCreator(null, "div", // Create the player information
                    {
                        "data-rocket-minor-component" : "player-information"
                    }
                );

                var playerTextualInformation : HTMLElement = rocket.generator.ElementCreator(null, "section"); // Create a section to hold the textual information like audio title

                playerInformation.appendChild(rocket.generator.ElementCreator(null, "img", { "src" : properties["art"]})); // Create the covert art and append the cover art to the playerInformation

                var audioTitle : HTMLElement = rocket.generator.ElementCreator(null, "b", { "content" : properties["title"]}); // Create a "bold" tag with the audio title

                playerTextualInformation.appendChild(audioTitle); // Append the audio title to the playerInformationDetails section

                if (properties["artist"] !== undefined){ // If the artist is NOT undefined
                    var artistInfo = rocket.generator.ElementCreator(null, "label", { "content" : properties["artist"] }); // Create a label with the artist info
                    playerTextualInformation.appendChild(artistInfo);
                }

                if (properties["album"] !== undefined){ // If the album is NOT undefined
                    var albumInfo = rocket.generator.ElementCreator(null, "label", { "content" : properties["album"] }); // Create a label with the album info
                    playerTextualInformation.appendChild(albumInfo);
                }

                playerInformation.appendChild(playerTextualInformation); // Append the textual information section to the parent Player Information area

                componentElement.appendChild(playerInformation); // Append the player information details to the component Element
            }

            var playerControlComponent : Object = rocket.playercontrol.Generate({ "type" : "audio" }); // Pass along the "audio" type so we know NOT to append the fullscreen
            var playerControlElement : Element = rocket.component.Fetch(playerControlComponent); // Fetch the HTMLElement
            componentElement.appendChild(playerControlElement); // Append the player control

            rocket.component.storedComponents[componentId] = componentElement;

            return { "id" : componentId, "type" : "audio-player" }; // Return a Component Object
        }
        else{ // If audio is not defined in the properties
            return { "error" : "no audio defined" }; // Return an error Object
        }

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

            if (properties["art"] !== undefined){ // If art has been defined
                videoPlayerAttributes["poster"] = properties["art"]; // Define the poster attribute as the art
            }

            var videoPlayer : HTMLElement = rocket.generator.ElementCreator(null, "video", videoPlayerAttributes); // Create the video player
            videoPlayer.autoplay = false; // Set autoplay of video to false
            componentElement.appendChild(videoPlayer); // Append the video player

            var playerControlComponent : Object = rocket.playercontrol.Generate({ "type" : "video" }); // Pass along the "video" type so we know NOT to append the fullscreen
            var playerControlElement : Element = rocket.component.Fetch(playerControlComponent); // Fetch the HTMLElement
            componentElement.appendChild(playerControlElement); // Append the player control

            rocket.component.storedComponents[componentId] = componentElement;
            return { "id" : componentId, "type" : "video-player" }; // Return a Component Object
        }
        else{ // If video is not defined in the properties
            return { "error" : "no video defined" }; // Return an error Object
        }
    }

    // #endregion

}

// #endregion
