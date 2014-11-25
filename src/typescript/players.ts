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
        var componentElement : Element = rocket.component.Fetch(component); // Fetch the Component Element
        var innerContentElement : HTMLMediaElement = rocket.player.GetInnerContentElement(component); // Fetch the Audio or Video Player Element

        var clickDownListeners = ["mousedown", "MSPointerDown", "touchstart"]; // Listeners for mousedown events
        var clickUpListeners = ["mouseup", "MSPointerUp", "touchend"]; // Listeners for mouseup events

        // #region Player Controls List
        var playerControlArea = componentElement.querySelector('div[data-rocket-component="player-control"]'); // Get the Player Control section
        var playerControlComponent : Object = rocket.component.FetchComponentObject(playerControlArea); // Get the Player Control Component Object

        var playerRange = playerControlArea.querySelector('input[type="range"]'); // Get the input range

        // #endregion

        // #region Audio / Video Time Updating

        innerContentElement.addEventListener("timeupdate", // Add an event listener to track timeupdate
            function(){
                // #region Player Component & Element Defining

                var playerComponent = arguments[0];
                var playerComponentElement = rocket.component.Fetch(playerComponent); // Fetch the Player Component Element

                // #endregion

                // #region Player Control Component & Element Defining

                var playerControlElement = playerComponentElement.querySelector('div[data-rocket-component="player-control"]'); // Fetch the Player Control Element
                var playerControlComponent : Object = rocket.component.FetchComponentObject(playerControlElement); // Get the Component Object of the Player Control

                // #endregion

                var playerElement = rocket.player.GetInnerContentElement(playerComponent); // Get the Player Audio or Video Element
                var currentTime = playerElement.currentTime; // Get the currentTime

                if (playerComponentElement.hasAttribute("data-rocket-component-status") == false){ // If the user is NOT using the input range to change volume or time
                    playerComponentElement.querySelector('div[data-rocket-component="player-control"]').querySelector("input").value = currentTime; // Set the range input to the currentTime
                }

                rocket.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime); // Update the label

                if (playerElement.ended == true){ // If playback has ended
                    var playButtonElement = playerControlElement.querySelector('div[data-rocket-minor-component="player-button-play"]'); // Get the Element of the Play Button from the Player Control
                    rocket.component.CSS(rocket.component.FetchComponentObject(playButtonElement), "background-image", false); // Get the Component Object of the Play Button and remove the background-image style / reset to play

                    var playerRange = playerControlElement.querySelector('input[type="range"]'); // Get the input range
                    playerRange.value = 0; // Reset value to zero
                }

            }.bind(this, component) // Pass along the Player Component and Player Control Component
        );

        // #endregion

        // #region Video Player Specific Functionality

        if (component["type"] == "video-player"){ // If this is a Video Player Component

            // #region Poster Art Check

            var posterImageElement : Element = componentElement.querySelector('img[data-rocket-minor-component="video-poster"]'); // Get the video poster img tag if it exists

            if (posterImageElement !== null){ // If the posterImageElement exists
                rocket.component.CSS(playerControlComponent, "opacity", "0.8"); // Set opacity to 80%

                for (var listenerKey in clickUpListeners){ // For each listener
                    posterImageElement.addEventListener(clickUpListeners[listenerKey],
                        function(){
                            var playerElementComponent : Object = arguments[0]; // Get the Component we passed
                            var posterImageElement : Element = arguments[1]; // Get the posterImageElement we passed
                            var e : MouseEvent = arguments[2]; // Get the Mouse Event typically passed to the function

                            if (e.button == 0){
                                posterImageElement.setAttribute("style", "display: none"); // Hide the element
                                rocket.player.PlayOrPause(playerElementComponent); // Play the video
                            }
                        }.bind(this, component, posterImageElement) // Call with "this", the Player Component Object, and the posterImageElement
                    );
                }
            }

            // #endregion

            // #region Video Click Handling

            for (var listenerKey in clickUpListeners){ // For each listener
                innerContentElement.addEventListener(clickUpListeners[listenerKey],
                    function(){
                        var e : MouseEvent = arguments[1]; // Get the Mouse Event typically passed to the function
                        if (e.button == 0){
                            var playerElementComponent : Object = arguments[0]; // Get the Component we passed
                            rocket.player.PlayOrPause(playerElementComponent); // Play the video
                        }
                    }.bind(this, component) // Call with "this", the Player Component Object, and the posterImageElement
                );
            }

            // #endregion

            // #region Video ContextMenu Prevention

            componentElement.addEventListener("contextmenu", // When the contextmenu is requested
                function(e : Event){
                    e.preventDefault(); // Prevent the default action, like showing a context menu for the poster image, or context menu for the video
                }
            );

            // #endregion
        }

        // #endregion

        // #region Player Control Listeners

            // #region Play Button Listener

            var playButtonComponent : Object = rocket.component.FetchComponentObject(playerControlArea.querySelector('div[data-rocket-minor-component="player-button-play"]')); // Get the Component Object of the Play Button

            rocket.component.AddListeners(playButtonComponent,
                function(){
                    var playButtonComponent : Object = arguments[0]; // Get the Play Button that was clicked
                    var playButton : Element = rocket.component.Fetch(playButtonComponent); // Get the Play Button Element

                    // #region Player Component & Element Defining

                    var playerElement = playButton.parentElement.parentElement; // Get the Play Button's parent Player
                    var playerElementComponent : Object = rocket.component.FetchComponentObject(playerElement); // Get the Player Component based on the playerElement

                    // #endregion

                    rocket.player.PlayOrPause(playerElementComponent, playButtonComponent); // Switch the status of the Player to either play or pause
                }
            );

            // #endregion

            // #region Player Range Initialization

            for (var listenerKey in clickDownListeners){ // For each listener
                playerRange.addEventListener(clickDownListeners[listenerKey], // When the individual first starts changing the player range value
                    function(){
                        var playerControlComponent : Object = arguments[0]; // Get the Player Control Component passed by binding
                        var playerControl : Element = rocket.component.Fetch(playerControlComponent); // Fetch the Player Control Element

                        var playerRange = playerControl.querySelector("input"); // Get the Player Control Range
                        playerRange.parentElement.parentElement.setAttribute("data-rocket-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                    }.bind(this, component)
                );
            }

            for (var listenerKey in clickUpListeners){ // For each listener
                playerRange.addEventListener(clickUpListeners[listenerKey], rocket.player.TimeOrVolumeChanger.bind(this, playerControlComponent)); // When the individual lets go of the mouse / tap, call the TimeOrVolumeChanger()
            }

            // #endregion

            // #region Volume Button Listener

            var volumeButtonComponent = rocket.component.FetchComponentObject(playerControlArea.querySelector('div[data-rocket-minor-component="player-button-volume"]')); // Get the Component Object of the Volume Button

            rocket.component.AddListeners(volumeButtonComponent,
                function(){
                    var volumeButtonComponent : Object = arguments[0]; // Get the Volume Button that was clicked
                    var volumeButton : Element = rocket.component.Fetch(volumeButtonComponent); // Get the Volume Button Element

                    var playerElement = volumeButton.parentElement.parentElement; // Get the Volume Button's player-controls section's player
                    var playerElementComponent : Object = rocket.component.FetchComponentObject(playerElement); // Get the Player Component based on the playerElement

                    var playerRange : any = playerElement.querySelector("input"); // Get the Player Control Range
                    var playerRangeAttributes : Object= {}; // Set playerRangeAttributes as an empty Object to hold attribute information that we'll apply to the input range later

                    var playerTimeElement = playerElement.querySelector("time"); // Get the time Element

                    if (rocket.player.IsDoingTimeChange(playerElementComponent) == true){ // If we are NOT already actively doing a volume change
                        playerElement.setAttribute("data-rocket-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                        playerElement.setAttribute("data-rocket-component-changevolume", ""); // Set the player component-changing so the TimeOrVolumeChanger() knows to change volume settings

                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').setAttribute("data-rocket-component-disabled", ""); // Set to a "disabled" UI
                        volumeButton.setAttribute("data-rocket-component-status", "true"); // Set component status to true to imply it is active

                        playerTimeElement.setAttribute("data-rocket-component-disabled", ""); // Set to a "disabled" UI

                        playerRangeAttributes["max"] = "100"; // Set max to 1
                        playerRangeAttributes["step"] = "1"; // Set step to 1
                        playerRange.value = (rocket.player.GetInnerContentElement(playerElementComponent).volume * 100).toString(); // Set the value to the volume (which is 0.1 to 1.0) times 10
                    }
                    else{ // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').removeAttribute("data-rocket-component-disabled"); // Remove the "disabled" UI
                        volumeButton.removeAttribute("data-rocket-component-status"); // Remove component-status to imply volume icon is not active

                        playerTimeElement.removeAttribute("data-rocket-component-disabled"); // Removed the "disabled" UI

                        // #region Reset Input Range to have the proper min, max values, steps.
                        // Current Time (input range value) is only changed if the player is paused, since if it is playing, it'll be auto-updated by the Player's timeupdate listener.

                        playerRangeAttributes = rocket.player.GetPlayerLengthInfo(playerElementComponent); // Get a returned Object with the max the input range should be, as well as a reasonable, pre-calculated amount of steps.

                        playerElement.removeAttribute("data-rocket-component-status"); // Remove component-status to we are not modifying the playerRange
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

        var contentDuration : any = Math.floor(Number(rocket.player.GetInnerContentElement(component).duration)); // Get the Player's internal audio or video Element and its duration property, rounding it down
        playerLengthInfo["max"] = contentDuration; // Set the maximum to the contentDuration

        if (contentDuration < 60){ // If the contentDuration is less than 60 seconds
            playerLengthInfo["step"] = 1; // Se the step value to 1 second.
        }
        else if ((contentDuration > 60) && (contentDuration <= 300)){ // If the contentDuration is greater than 1 minute but less than or equal to 5 minutes
            playerLengthInfo["step"] = 5; // Set the step value to 5 seconds
        }
        else if ((contentDuration > 300) && (contentDuration < 900)){ // If the contentDuration is greater than 5 minutes but less than 15 minutes
            playerLengthInfo["step"] = 10; // Set the step value to 10 seconds
        }
        else{ // If the video is greater than 15 seconds
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
        var playerComponentObject : Object = rocket.component.FetchComponentObject(playerElement); // Get the Component Object of the Player

        var contentElement : HTMLMediaElement = rocket.player.GetInnerContentElement(playerComponentObject); // Get the Player's Audio or Video Element

        var valueNum : any = Number(playerRange.value); // Define valueNum as "any" (actually Number), which we do calculation for later

        if (rocket.player.IsDoingTimeChange(playerComponentObject) == true){ // If we are doing a time change
            valueNum = valueNum.toFixed(); // Ensure the valueNum is fixed / precise
            contentElement.currentTime = valueNum; // Set the contentElement's currentTime to the converted playerRange value
        }
        else{
            valueNum = (valueNum / 100); // Divide the Number by 100 to get an int from 0.0 to 1.0.
            contentElement.volume = valueNum; // Set the volume to the converted playerRange value divided by 10
        }

        if (playerElement.hasAttribute("data-rocket-component-changevolume") !== true){ // If we are not currently changing the volume
            playerElement.removeAttribute("data-rocket-component-status"); // Remove the status to indicate we are no longer the playerRange values
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

        if (componentElement.hasAttribute("data-rocket-component-changevolume") !== true){ // If the changevolume attribute does not exist, meaning we ARE doing a time change
            return true;
        }
        else{ // If changevolume attribute exists, meaning we are NOT doing a time change
            return false;
        }
    }

    // #endregion

    // #region Play or Pause Audio or Video based on current state

    export function PlayOrPause(component : Object, playButtonComponentObject ?: Object) {
        var playerComponentElement = rocket.component.Fetch(component); // Get the Component Element of the Player
        var innerContentElement = rocket.player.GetInnerContentElement(component); // Get the inner audio or video Element

        if (playButtonComponentObject == undefined){ // If the Play Button Component is not defined
            playButtonComponentObject = rocket.component.FetchComponentObject(playerComponentElement.querySelector('div[data-rocket-minor-component="player-button-play"]')); // Get the Play Button Component Object
        }

        var playButton : Element = rocket.component.Fetch(playButtonComponentObject); // Get the Play Button Element

        if (playButton.hasAttribute("data-rocket-component-disabled") == false){ // If the play button is not disabled (done when tweaking volume)
            if (innerContentElement.played.length == 0){ // If the video has not been played been yet.
                var playerControlComponent : Object = rocket.component.FetchComponentObject(playButton.parentElement); // Get the Player Control Component based on the Play Button's Parent Element
                var playerRange : Element = playerComponentElement.querySelector('input[type="range"]'); // Get the input range
                var playerMediaLengthInformation : Object = rocket.player.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range

                // #region Poster Image Hiding

                var posterImageElement : HTMLElement = playerComponentElement.querySelector('img[data-rocket-minor-component="video-poster"]'); // Get the video poster img tag if it exists

                if (posterImageElement !== null){ // If the posterImageElement is defined
                    posterImageElement.setAttribute("style", "display: none"); // Hide the element
                    rocket.component.CSS(playerControlComponent, "opacity", false); // Remove opacity setting
                }

                // #endregion

                for (var playerRangeAttribute in playerMediaLengthInformation){ // For each attribute defined in the playerRangeAttributes Object
                    playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]); // Set the attribute on the playerRange

                    if (playerRangeAttribute == "max"){ // If we are updated the max (contentDuration) attribute
                        rocket.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation[playerRangeAttribute]);
                    }
                }
            }

            if (innerContentElement.paused !== true){ // If the audio or video Element is playing
                innerContentElement.pause(); // Pause the audio or video Element
                rocket.component.CSS(playButtonComponentObject, "background-image", false); // Remove the background-image style / reset to play
            }
            else{ // If the audio or video Element is paused
                innerContentElement.play(); // Play the audio or video Element
                rocket.component.CSS(playButtonComponentObject, "background-image", "url(css/img/pause.png)"); // Set background-image to pause
            }
        }
    }
}

// #endregion

// #region Rocket Player Controls Component

module rocket.playercontrol {

    // #region Player Control Generator

    export function Generate() : Object {
        var componentId : string = rocket.generator.IdGen("player-control"); // Generate an ID for the Player Control
        var componentElement = rocket.generator.ElementCreator(componentId, "player-control"); // Generate the basic playerControl container

        var playButton = rocket.button.Generate( // Generate a Play Button
            {
                "data-rocket-minor-component" : "player-button-play" // Set the icon to the play icon
            }
        );

        var inputRange : HTMLElement = rocket.generator.ElementCreator(null, "input", { "type" : "range", "value" : "0"}); // Create an input range
        var timeStamp : HTMLElement = rocket.generator.ElementCreator(null, "time", { "content" : "00:00 / 00:00"}); // Create a timestamp time element

        var volumeButton = rocket.button.Generate( // Generate a Volume Button
            {
                "data-rocket-minor-component" : "player-button-volume" // Set the icon to the volume icon
            }
        );

        componentElement.appendChild(rocket.component.Fetch(playButton)); // Append the play button
        componentElement.appendChild(inputRange); // Append the input range
        componentElement.appendChild(timeStamp); // Append the timestamp time element
        componentElement.appendChild(rocket.component.Fetch(volumeButton)); // Append the volume control

        rocket.component.storedComponents[componentId] = componentElement; // Store the Player Control

        return { "id" : componentId, "type" : "player-control" }; // Return a Component Object
    }

    // #endregion

    // #region Seconds to "Time" Object Format

    export function SecondsToTimeFormat(seconds : number) : Object { // Returns an Object with "hour", "minutes" and "seconds" key / vals
        var timeObject : Object = {};

        if (seconds >= 3600){ // If there is more than 1 hour in "seconds"
            timeObject["hours"] = Number((seconds / 3600).toPrecision(1)); // Divide the seconds by 1 hour to get the number of hours (rounded down)
            timeObject["minutes"] = Number(((seconds - (3600 * timeObject["hours"])) / 60).toPrecision(1)); // Set minutes = the seconds minus by 3600 (1 hour) times number of hours, divided by 60 to get total minutes
            timeObject["seconds"] = Number((seconds - (3600 * timeObject["hours"])) - (60 * timeObject["minutes"])); // Set seconds = seconds minus by 3600 (1 hour) times number of hours, minus 60 * number of minutes
        }
        else if ((seconds >= 60) && (seconds < 3600)){ // If there is greater than 1 minute in seconds, but less than 1 hour
            timeObject["minutes"] = Number((seconds / 60).toPrecision(1)); // Set number = minutes by dividing minutes by 60 and rounding down
            timeObject["seconds"] = Number((seconds - (timeObject["minutes"] * 60))); // Set seconds = seconds divided by minutes times 60
        }
        else{ // If there is less than 1 minute of content
            timeObject["minutes"] = 0; // Set minutes to zero
            timeObject["seconds"] = seconds; // Round down the seconds
        }

        timeObject["seconds"] = Math.floor(timeObject["seconds"]); // Seconds should always round down

        for (var timeObjectKey in timeObject){ // For each key in the timeObject
            var timeObjectValue = timeObject[timeObjectKey]; // Set timeObjectValue as the value based on key
            var timeObjectValueString = timeObjectValue.toString(); // Convert the int to string

            if (timeObjectValue < 10){ // If we are dealing with an int less than 10
                timeObjectValueString = "0" + timeObjectValueString; // Prepend a 0
            }

            timeObject[timeObjectKey] = timeObjectValueString; // Set the key/val to the stringified and parsed int
        }

        return timeObject;
    }

    // #endregion

    // #region Player Time Label Updating

    export function TimeLabelUpdater(component : Object, timePart : number, value : number){
        var playerControlElement : HTMLElement = rocket.component.Fetch(component); // Get the Player Control's Element
        var playerTimeElement = playerControlElement.querySelector("time"); // Get the time Element

        // #region Seconds Parsing to String

        var parsedSecondsToString : string = ""; // Define parsedSecondsToString as our converted seconds to Object then concatenated string
        var timeFormatObject = rocket.playercontrol.SecondsToTimeFormat(value); // Get the time format (rounded down value)

        for (var timeObjectKey in timeFormatObject){ // For each key in the timeObject
            var timeObjectValue = timeFormatObject[timeObjectKey]; // Set timeObjectValue as the value based on key

            if (parsedSecondsToString.length !== 0){ // If there is already content in parsedSecondsToString
                parsedSecondsToString = parsedSecondsToString + ":" + timeObjectValue; // Append :timeObjectValue
            }
            else{
                parsedSecondsToString = timeObjectValue; // Set parsedSecondsToString as value
            }
        }

        // #endregion

        var playerTimeElementParts = playerTimeElement.textContent.split(" / "); // Split time textContent based on " / "
        playerTimeElementParts[timePart] = parsedSecondsToString; // Set the value of the part specified

        playerTimeElement.textContent = playerTimeElementParts[0] + " / " + playerTimeElementParts[1];
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

            var playerControlComponent : Object = rocket.playercontrol.Generate(); // Pass along the "audio" type so we know NOT to append the fullscreen
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
                var posterImageElement : HTMLElement = rocket.generator.ElementCreator(null, "img", // Create an img Element with the src set to the artwork
                    {
                        "data-rocket-minor-component" : "video-poster",
                        "src" : properties["art"]
                    }
                );
                componentElement.appendChild(posterImageElement); // Append to the Video Player container
            }

            var videoPlayer : HTMLElement = rocket.generator.ElementCreator(null, "video", videoPlayerAttributes); // Create the video player
            videoPlayer.autoplay = false; // Set autoplay of video to false
            componentElement.appendChild(videoPlayer); // Append the video player

            var playerControlComponent : Object = rocket.playercontrol.Generate(); // Pass along the "video" type so we know NOT to append the fullscreen
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
