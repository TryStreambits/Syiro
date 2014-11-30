/*
    This is a file containing the modules for the Rocket Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via rocket.audioplayer.
    The Video Player is exposed via rocket.videoplayer.
    The shared Player functionality is exposed via rocket.player.
*/

/// <reference path="utilities.ts" />

// #region Shared Player Functionality

module rocket.player {

    // #region Shared Player Initialization

    export function Init(component : Object){
        var componentElement : Element = rocket.component.Fetch(component); // Fetch the Component Element
        var innerContentElement : HTMLMediaElement = rocket.player.FetchInnerContentElement(component); // Fetch the Audio or Video Player Element

        // #region Player Controls List
        var playerControlArea = componentElement.querySelector('div[data-rocket-component="player-control"]'); // Get the Player Control section
        var playerControlComponent : Object = rocket.component.FetchComponentObject(playerControlArea); // Get the Player Control Component Object

        // #endregion

        // #region Audio / Video Time Updating

        rocket.component.AddListeners("timeupdate", innerContentElement, // Add an event listener to track timeupdate
            function(){
                // #region Player Component & Element Defining

                var playerComponentElement = arguments[0].parentElement; // Set the playerComponentElement as the parentElement of the innerContentElement (argument [0])
                var playerComponent = rocket.component.FetchComponentObject(playerComponentElement); // Fetch the Player Component Object

                // #endregion

                // #region Player Control Component & Element Defining

                var playerControlElement = playerComponentElement.querySelector('div[data-rocket-component="player-control"]'); // Fetch the Player Control Element
                var playerControlComponent : Object = rocket.component.FetchComponentObject(playerControlElement); // Get the Component Object of the Player Control

                // #endregion

                var playerElement = rocket.player.FetchInnerContentElement(playerComponent); // Get the Player Audio or Video Element
                var currentTime = playerElement.currentTime; // Get the currentTime

                rocket.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime); // Update the label

                if (playerComponentElement.hasAttribute("data-rocket-component-status") == false){ // If the user is NOT using the input range to change volume or time
                    playerComponentElement.querySelector('div[data-rocket-component="player-control"]').querySelector("input").value = Math.floor(currentTime); // Set the range input to the currentTime (rounded down)
                }

                if (playerElement.ended == true){ // If playback has ended
                    rocket.player.Reset(playerComponent); // Reset the Player
                }
            }
        );

        // #endregion

        // #region Video Player Specific Functionality

        if (component["type"] == "video-player"){ // If this is a Video Player Component

            // #region Poster Art Check

            var posterImageElement : Element = componentElement.querySelector('img[data-rocket-minor-component="video-poster"]'); // Get the video poster img tag if it exists

            if (posterImageElement !== null){ // If the posterImageElement exists
                rocket.component.CSS(playerControlComponent, "opacity", "0.8"); // Set opacity to 80%

                rocket.component.AddListeners(rocket.component.listenerStrings["press"], posterImageElement, // Add mousepress listeners to the posterImageElement
                    function(){
                        var posterImageElement : Element = arguments[0]; // Set the posterImageElement as the first argument passed

                        rocket.component.CSS(posterImageElement, "visibility", "hidden"); // Hide the element
                        rocket.player.PlayOrPause(rocket.component.FetchComponentObject(posterImageElement.parentElement)); // Play the video
                    }
                );
            }

            // #endregion

            // #region Video Element Click / Tap Handling

            rocket.component.AddListeners(rocket.component.listenerStrings["up"], innerContentElement, // Add mouseup / touchup listeners to the innerContentElement
                function(){
                    var innerContentElement : Element = arguments[0]; // Get the innerContentElement passed as argument 1
                    var e : MouseEvent = arguments[1]; // Get the Mouse Event typically passed to the function

                    if (e.button == 0){
                        rocket.player.PlayOrPause(rocket.component.FetchComponentObject(innerContentElement.parentElement)); // Play the video
                    }
                }
            );

            // #endregion

            // #region Video ContextMenu Prevention

            rocket.component.AddListeners("contextmenu", componentElement,
                function(){
                    var e : Event = arguments[1]; // Get the Mouse Event typically passed to the function
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

            var playerRange = playerControlArea.querySelector('input[type="range"]'); // Get the input range

            rocket.component.AddListeners(rocket.component.listenerStrings["down"], playerRange, // Add mousedown / touchstart events to the playerRange
                function(){
                    var playerRangeElement : Element = arguments[0]; // Get the Player Range element passed
                    playerRange.parentElement.parentElement.setAttribute("data-rocket-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                }
            );

            rocket.component.AddListeners(rocket.component.listenerStrings["up"], playerRange, rocket.player.TimeOrVolumeChanger); // Add mouseup / touchend events to the playerRange, which calls rocket.player.TimeOrVolumeChanger

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

                    if (playerElement.hasAttribute("data-rocket-component-changevolume") !== true){ // If we are NOT already actively doing a volume change
                        playerElement.setAttribute("data-rocket-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                        playerElement.setAttribute("data-rocket-component-changevolume", ""); // Set the player component-changing so the TimeOrVolumeChanger() knows to change volume settings

                        volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').setAttribute("data-rocket-component-disabled", ""); // Set to a "disabled" UI
                        volumeButton.setAttribute("data-rocket-component-status", "true"); // Set component status to true to imply it is active

                        playerTimeElement.setAttribute("data-rocket-component-disabled", ""); // Set to a "disabled" UI

                        playerRangeAttributes["max"] = "100"; // Set max to 100
                        playerRangeAttributes["step"] = "1"; // Set step to 1
                        playerRange.value = (rocket.player.FetchInnerContentElement(playerElementComponent).volume * 100).toString(); // Set the value to the volume (which is 0.1 to 1.0) times 10
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

            // #region Player Share Dialog

            var shareButton = componentElement.querySelector('div[data-rocket-minor-component="player-button-menu"]'); // Get the shareButton if it exists

            if (shareButton !== null){ // If the share button exists
                rocket.component.AddListeners(rocket.component.listenerStrings["press"], rocket.component.FetchComponentObject(shareButton), rocket.player.ToggleShareDialog.bind(this, component)); // Add an event listener to the button that calls ToggleShareDialog, binding to the Player Component
            }

            // #endregion

        // #endregion
    }

    // #endregion

    // #region Get Internal Audio or Video Element of Player container Component

    export function FetchInnerContentElement(component : Object) : HTMLMediaElement {
        var componentElement = rocket.component.Fetch(component); // Get the Player Component
        return componentElement.querySelector(component["type"].replace("-player", "")); // Return the Element fetched from querySelector (audio or video)
    }

    // #endregion

    // #region Get Information about the Player's Length and reasonable step intervals

    export function GetPlayerLengthInfo(component : Object) : Object{
        var playerLengthInfo : Object = {}; // Define playerLengthInfo as an empty Object to hold length information about the audio or video

        var contentDuration : any = Math.floor(Number(rocket.player.FetchInnerContentElement(component).duration)); // Get the Player's internal audio or video Element and its duration property, rounding it down
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
        var playerRange : HTMLInputElement = arguments[0]; // Define playerRangeElement as the Element passed to us
        var playerControlElement = playerRange.parentElement; // Get the Player Control Element, which is the parent of the playerRange

        var playerElement = playerControlElement.parentElement; // Get the Player Control's parent Player container
        var playerComponentObject : Object = rocket.component.FetchComponentObject(playerElement); // Get the Component Object of the Player
        var contentElement : HTMLMediaElement = rocket.player.FetchInnerContentElement(playerComponentObject); // Get the Player's Audio or Video Element

        var valueNum : any = Number(playerRange.value); // Define valueNum as "any" (actually Number), which we do calculation for later

        if (playerElement.hasAttribute("data-rocket-component-changevolume") == false){ // If we are doing a time change
            rocket.player.SetTime(playerComponentObject, valueNum.toFixed()); // Set the Time
        }
        else{
            rocket.player.SetVolume(playerComponentObject, (valueNum / 100)); // Set the volume to value of the range, diving the number by 100 to get an int from 0.0 to 1.0.
        }

        if (playerElement.hasAttribute("data-rocket-component-changevolume") !== true){ // If we are not currently changing the volume
            playerElement.removeAttribute("data-rocket-component-status"); // Remove the status to indicate we are no longer changing the playerRange values
        }
    }

    // #endregion

    // #region Get Information about if the Player is playing

    export function IsPlaying(component : Object) : boolean {
        var componentElement = rocket.component.Fetch(component); // Fetch the Player Element
        var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused; // Get the value of paused on the Player (opposite of what we will return)

        return !isPaused; // Return the opposite boolean value (playing = (paused = false), therefore true. paused = (paused = true), therefore false)
    }

    // #endregion

    // #region Play or Pause Audio or Video based on current state

    export function PlayOrPause(component : Object, playButtonComponentObject ?: Object) {
        var playerComponentElement = rocket.component.Fetch(component); // Get the Component Element of the Player
        var innerContentElement = rocket.player.FetchInnerContentElement(component); // Get the inner audio or video Element

        if (playButtonComponentObject == undefined){ // If the Play Button Component is not defined
            playButtonComponentObject = rocket.component.FetchComponentObject(playerComponentElement.querySelector('div[data-rocket-minor-component="player-button-play"]')); // Get the Play Button Component Object
        }

        var playButton : Element = rocket.component.Fetch(playButtonComponentObject); // Get the Play Button Element

        if (playButton.hasAttribute("data-rocket-component-disabled") == false){ // If the play button is not disabled (done when tweaking volume)
            if (innerContentElement.currentTime == 0){ // If the video current time is zero when played
                var playerControlComponent : Object = rocket.component.FetchComponentObject(playButton.parentElement); // Get the Player Control Component based on the Play Button's Parent Element
                var playerRange : Element = playerComponentElement.querySelector('input[type="range"]'); // Get the input range
                var playerMediaLengthInformation : Object = rocket.player.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range

                // #region Poster Image Hiding

                var posterImageElement : HTMLElement = playerComponentElement.querySelector('img[data-rocket-minor-component="video-poster"]'); // Get the video poster img tag if it exists

                if (posterImageElement !== null){ // If the posterImageElement is defined
                    rocket.component.CSS(posterImageElement, "visibility", "hidden"); // Hide the element
                    rocket.component.CSS(playerControlComponent, "opacity", false); // Remove opacity setting
                }

                // #endregion

                for (var playerRangeAttribute in playerMediaLengthInformation){ // For each attribute defined in the playerRangeAttributes Object
                    playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]); // Set the attribute on the playerRange

                    if (playerRangeAttribute == "max"){ // If we are updated the max (contentDuration) attribute
                        rocket.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);

                        // #region Input Range Width Calculation

                        var newTimeWidth = playButton.parentElement.querySelector("time").clientWidth + 25; // Get the current width (add an additional amount to compensate for margins and character width)
                        var inputRangeWidth = (playButton.parentElement.clientWidth - ((36 * 2) + (14 * 2) +  newTimeWidth)); // Do an initial calculation of the width of the input range, which is the width minus two buttons, their margins (14 each) and time width

                        if (playButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-menu"]') !== null){ // If the share attribute is defined
                            inputRangeWidth = inputRangeWidth - (36 + 14); // Make sure the inputRange size is changed since we are introducing another button
                        }

                        rocket.component.CSS(playerRange, "width", inputRangeWidth.toString() + "px !important"); // Update the inputRange CSS

                        // #endregion
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

    // #endregion

    // #region Multi-Source Generation

    export function FetchSources(type: string, sources : any) : Array<HTMLElement> { // Returns an array of HTMLElements
        var arrayOfSourceElements : Array<HTMLElement> = []; // Define arrayOfSourceElements as the array to hold all the source Elements we generate
        var sourcesList : Array<string>; // Define sourcesList as an array of string (sources)

        if (typeof sources == "string"){ // If only a single source is defined
            sourcesList = [sources]; // Set the sourcesList array to be the single item
        }
        else{ // If it is not a single source
            sourcesList = sources; // Set sourcesList to the src array provided
        }

        for (var sourceKey in sourcesList){ // For each source defined in videoSources
            var source : string = sourcesList[sourceKey]; // Get the source from the videoSources array
            var sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", ""); // Get the last index of ., get the substring based on that, and then remove the period on the extension.

            var sourceTagAttributes = { "src" : source}; // Create an initial source tag attributes Object that we'll pass to ElementCreator

            if (source.substr(-1) !== ";"){ // If the source does not end with a semi-colon, common to prevent Shoutcast browser detection
                if ((sourceExtension !== "mov") && (sourceExtension !== "m3u8")){ // If the source extension is not mov or a m3u8
                    sourceTagAttributes["type"] = sourceExtension; // Append videoExtension to the videoType
                }
                else if (sourceExtension == "mov"){ // If the source extension IS mov
                    sourceTagAttributes["type"] = "quicktime"; // Append the quicktime string
                }

                if (sourceTagAttributes["type"] !== undefined){ // If we have defined a type for the source
                    sourceTagAttributes["type"] = type + "/" + sourceTagAttributes["type"] // Prepend the type (audio or video) and a / delimiter
                }
            }

            var sourceTag = rocket.generator.ElementCreator("source", sourceTagAttributes); // Create a source tag with the attributes we've applied

            arrayOfSourceElements.push(sourceTag); // Push this source tag
        }

        return arrayOfSourceElements;
    }

    // #endregion

    // #region Reset Player - Function for resetting the player state to default (except for volume). Handy for source changing

    export function Reset(component : Object){
        var playerElement = rocket.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = rocket.player.FetchInnerContentElement(component); // Get the associated audio or video player

        var playerControl = playerElement.querySelector('div[data-rocket-component="player-control"]'); // Get the Player Control
        var playButton = playerControl.querySelector('div[data-rocket-minor-component="player-button-play"]'); // Get the Play Button from the Player Control
        var timeLabel = playerControl.querySelector('time'); // Get the Time Label from the Player Control
        var volumeControl = playerControl.querySelector('div[data-rocket-minor-component="player-button-volume"]'); // Get the Volume Button from the Player Control

        playButton.removeAttribute("data-rocket-component-disabled"); // Remove the "disabled" UI for the Play Button
        rocket.component.CSS(playButton, "background-image", false); // Remove the background-image style / reset to play image for Play Button

        timeLabel.removeAttribute("data-rocket-component-disabled"); // Removed the "disabled" UI from the time label
        volumeControl.removeAttribute("data-rocket-component-status"); // Remove component-status to imply volume icon is not active

        playerElement.removeAttribute("data-rocket-component-status"); // Remove component-status to we are not modifying the playerRange
        playerElement.removeAttribute("data-rocket-component-changevolume"); // Remove the changevolume attribute.

        playerInnerContentElement.pause(); // Start by pausing the player to prevent timeupdate events
        rocket.player.SetTime(component, 0); // Reset the time
    }

    // #endregion

    // #region Set Source - Function for easily setting the source(s) of an Audio or Video Player Component

    export function SetSources(component : Object, sources : any){
        var playerElement = rocket.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = rocket.player.FetchInnerContentElement(component); // Get the associated audio or video player

        if (typeof sources == "string"){ // If only a single source is defined
            sources = [sources]; // Convert to an array
        }

        var arrayofSourceElements : Array<HTMLElement> = rocket.player.FetchSources(component["type"].replace("-player", ""), sources); // Get an array of Source Elements

        rocket.player.Reset(component); // Reset the component

        if (component["type"] == "video-player"){ // If this is a video player
            rocket.component.CSS(playerElement.querySelector('img[data-rocket-minor-component="video-poster"]'), "visibility", "hidden"); // Hide the Video Poster
        }

        playerInnerContentElement.innerHTML = ""; // Remove all inner source tags from the InnerContentElement (audio or video tag) by resetting the innerHTML

        for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
            playerInnerContentElement.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
        }

        playerInnerContentElement.src = sources[0]; // Set the initial src of the audio or video player to the first source provided
    }

    // #endregion

    // #region Set Time - Function for easily setting the time location of an Audio or Video Player Component

    export function SetTime(component : Object, time : number){
        var playerElement = rocket.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = rocket.player.FetchInnerContentElement(component); // Get the associated audio or video player
        playerInnerContentElement.currentTime = time; // Set the playerInnerContentElement's currentTime to the time provided
        playerElement.querySelector('div[data-rocket-component="player-control"]').querySelector("input").value = Math.floor(time); // Set the range input to the currentTime (rounded down)
        rocket.playercontrol.TimeLabelUpdater(rocket.component.FetchComponentObject(playerElement.querySelector('div[data-rocket-component="player-control"]')), 0, time); // Update the label
    }

    // #endregion

    // #region Set Volume - Function for easily setting the volume of an Audio or Video Player

    export function SetVolume(component : Object, volume : number){
        var playerElement = rocket.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = rocket.player.FetchInnerContentElement(component); // Get the associated audio or video player
        playerInnerContentElement.volume = volume; // Set the Player volume
    }

    // #endregion

    // #region Toggle Share Dialog

    export function ToggleShareDialog(component ?: Object){
        var component : Object = arguments[0]; // Define the Player Component Object as the first argument
        var componentElement : Element = rocket.component.Fetch(component); // Fetch the Player Element

        var shareDialog : Element = componentElement.querySelector('div[data-rocket-minor-component="player-share"]'); // Get the Share Dialog
        var shareButton : Element = componentElement.querySelector('div[data-rocket-minor-component="player-button-menu"]'); // Get the share button element

        if (rocket.component.CSS(shareDialog, "visibility") !== "visible"){ // If the Share Dialog is currently not showing
            shareButton.setAttribute("data-rocket-component-status", "true"); // Set the share button status to true
            rocket.component.CSS(shareDialog, "visibility", "visible"); // Show the share dialog
        }
        else{ // If the Share dialog currently IS showing
            shareButton.removeAttribute("data-rocket-component-status"); // Remove the share button status
            rocket.component.CSS(shareDialog, "visibility", false); // Hide the share dialog (removing the visibility attribute, putting the Share Dialog back to default state)
        }
    }

    // #endregion
}

// #endregion

// #region Rocket Player Controls Component

module rocket.playercontrol {

    // #region Player Control Generator

    export function Generate(properties : Object) : Object {
        var componentId : string = rocket.generator.IdGen("player-control"); // Generate an ID for the Player Control
        var componentElement = rocket.generator.ElementCreator(componentId, "player-control"); // Generate the basic playerControl container

        var playButton = rocket.button.Generate( { "data-rocket-minor-component" : "player-button-play" } ); // Create a play button

        var inputRange : HTMLElement = rocket.generator.ElementCreator("input", { "type" : "range", "value" : "0"} ); // Create an input range
        var timeStamp : HTMLElement = rocket.generator.ElementCreator("time", { "content" : "00:00 / 00:00"} ); // Create a timestamp time element

        var volumeButton = rocket.button.Generate( { "data-rocket-minor-component" : "player-button-volume" } ); // Generate a Volume Button

        componentElement.appendChild(rocket.component.Fetch(playButton)); // Append the play button
        componentElement.appendChild(inputRange); // Append the input range
        componentElement.appendChild(timeStamp); // Append the timestamp time element

        // #region Input Range Width Calculation

        var inputRangeWidth = (properties["width"] - ((36 * 2) + (14 * 2) +  100)); // Do an initial calculation of the width of the input range, which is the width minus two buttons, their margins (14 each) and a minimum 100 (80 for element, 20 for margin)

        // #endregion

        // #region Player Share Element Creation (If Applicable)

        if (properties["share"] !== undefined){ // If the share attribute is defined
            if (properties["share"]["type"] == "list"){ // If the component provided is a List
                inputRangeWidth = inputRangeWidth - (36 + 14); // Make sure the inputRange size is changed since we are introducing another button

                var shareMenuButton = rocket.button.Generate( { "data-rocket-minor-component" : "player-button-menu"} ); // Generate a Share Menu Button
                componentElement.appendChild(rocket.component.Fetch(shareMenuButton)); // Append the shareMenuButton to the playerControlElement
            }
        }

        // #endregion

        rocket.component.CSS(inputRange, "width", inputRangeWidth.toString() + "px !important"); // Update the inputRange CSS

        componentElement.appendChild(rocket.component.Fetch(volumeButton)); // Append the volume control

        rocket.component.storedComponents[componentId] = componentElement; // Store the Player Control

        return { "id" : componentId, "type" : "player-control" }; // Return a Component Object
    }

    // #endregion

    // #region Player Time Label Updating

    export function TimeLabelUpdater(component : Object, timePart : number, value : any){
        var playerControlElement : HTMLElement = rocket.component.Fetch(component); // Get the Player Control's Element
        var playerTimeElement = playerControlElement.querySelector("time"); // Get the time Element

        // #region Seconds Parsing to String

        var parsedSecondsToString : string = ""; // Define parsedSecondsToString as our converted seconds to Object then concatenated string
        var timeFormatObject = rocket.utilities.SecondsToTimeFormat(value); // Get the time format (rounded down value)

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
        if (properties["sources"] !== undefined){ // If the audio property is defined
            var componentId : string = rocket.generator.IdGen("audio-player"); // Generate a component Id
            var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "audio-player", // Generate an Audio Player Element
                {
                    "id" : componentId, // Set the id (followed by name below) to act as a fragment ID for a page to jump to
                    "name" : componentId,
                }
            );

            // #region Audio Element and Source Creation

            var audioPlayer : HTMLElement = rocket.generator.ElementCreator("audio", { "preload" : "metadata", "volume" : "0.5" }); // Generate an audio Element with only preloading metadata, setting volume to 50%
            audioPlayer.autoplay = false; // Set autoplay of audio to false

            var arrayofSourceElements : Array<HTMLElement> = rocket.player.FetchSources("audio", properties["sources"]); // Get an array of Source Elements

            for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
                audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
            }

            // #endregion

            componentElement.appendChild(audioPlayer); // Append the audio player

            // #region Audio Player Information Creation

            if ((properties["art"] !== undefined) && (properties["title"] !== undefined)){ // If the properties has cover art and the audio title defined
                var playerInformation : HTMLElement = rocket.generator.ElementCreator("div", // Create the player information
                    {
                        "data-rocket-minor-component" : "player-information"
                    }
                );

                var playerTextualInformation : HTMLElement = rocket.generator.ElementCreator("section"); // Create a section to hold the textual information like audio title

                playerInformation.appendChild(rocket.generator.ElementCreator("img", { "src" : properties["art"]})); // Create the covert art and append the cover art to the playerInformation

                var audioTitle : HTMLElement = rocket.generator.ElementCreator("b", { "content" : properties["title"]}); // Create a "bold" tag with the audio title

                playerTextualInformation.appendChild(audioTitle); // Append the audio title to the playerInformationDetails section

                if (properties["artist"] !== undefined){ // If the artist is NOT undefined
                    var artistInfo = rocket.generator.ElementCreator("label", { "content" : properties["artist"] }); // Create a label with the artist info
                    playerTextualInformation.appendChild(artistInfo);
                }

                if (properties["album"] !== undefined){ // If the album is NOT undefined
                    var albumInfo = rocket.generator.ElementCreator("label", { "content" : properties["album"] }); // Create a label with the album info
                    playerTextualInformation.appendChild(albumInfo);
                }

                playerInformation.appendChild(playerTextualInformation); // Append the textual information section to the parent Player Information area

                componentElement.appendChild(playerInformation); // Append the player information details to the component Element
            }

            // #endregion

            if (properties["width"] == undefined){ // If the width attribute is not defined
                properties["width"] = 400; // Set width property to 400, which we'll pass to the Player Control Generation
            }

            if (window.screen.width < properties["width"]){ // If the screen width is smaller than the audio player width
                properties["width"] = window.screen.width - 10; // Set the videoWidth to screen width and some padding on the side
            }

            rocket.component.CSS(componentElement, "width", properties["width"].toString() + "px"); // Set the width of the Audio Player Component Element

            var playerControlComponent : Object = rocket.playercontrol.Generate(properties);
            var playerControlElement : Element = rocket.component.Fetch(playerControlComponent); // Fetch the HTMLElement

            // #region Player Share Element Creation (If Applicable)

            if (properties["share"] !== undefined){ // If the share attribute is defined
                if (properties["share"]["type"] == "list"){ // If the component provided is a List
                    var playerShareDialog : Element = rocket.generator.ElementCreator("div", { "data-rocket-minor-component" : "player-share" } ); // Create a div element with the minor-component of player-share-dialog
                    var playerShareLabel : Element = rocket.generator.ElementCreator("label", { "content" : "Share" }); // Create a label with the content "Share"
                    playerShareDialog.appendChild(playerShareLabel);
                    playerShareDialog.appendChild(rocket.component.Fetch(properties["share"])); // Append the List Element to the playerShareDialog
                    rocket.CSS(playerShareDialog, "height", "100px"); // Set the height of the share dialog to be 100px
                    rocket.CSS(playerShareDialog, "width", properties["width"].toString() + "px"); // Set the width of the share dialog to be the same as the Audio Player

                    componentElement.insertBefore(playerShareDialog, componentElement.firstChild); // Prepend the Share Dialog
                }
            }

            // #endregion

            componentElement.appendChild(playerControlElement); // Append the player control

            rocket.component.storedComponents[componentId] = componentElement;

            return { "id" : componentId, "type" : "audio-player" }; // Return a Component Object
        }
        else{ // If audio is not defined in the properties
            return { "error" : "no sources defined" }; // Return an error Object
        }

    }

    // #endregion

}

// #endregion

// #region Video Player Component

module rocket.videoplayer {

    // #region Video Player Generator

    export function Generate(properties : Object) : Object { // Generate a Video Player Component and return a Component Object
        if (properties["sources"] !== undefined){ // If the video property is defined
            var componentId : string = rocket.generator.IdGen("video-player"); // Generate a component Id
            var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "video-player", // Generate an Video Player Element
                {
                    "id" : componentId, // Set the id (followed by name below) to act as a fragment ID for a page to jump to
                    "name" : componentId
                }
            );

            // #region Video Dimensions Calculation
            var videoHeight : number = properties["height"]; // Define videoHeight as the height the video in the Video Player should be
            var videoWidth : number = properties["width"]; // Define videoWidth as the width the video in the Video Player should be

            if (videoHeight == undefined){ // If no height is defined for the video
                videoHeight = 300; // Set the height to 300px
            }

            if (videoWidth == undefined){ // If no width is defined
                videoWidth = Number((videoHeight * 1.77).toFixed()); // Ensure a 16:9 aspect ratio
            }

            if (videoWidth > window.screen.width){ // If the video's width is greater than the screen width
                videoWidth = window.screen.width - 10; // Set the videoWidth to screen width and some padding on the side
            }

            var properVideoHeight : number = Number((videoWidth / 1.77).toFixed()); // Proper Component Height to ensure 16:9 aspect ration

            if (videoHeight !== properVideoHeight){ // In the event the player has an incorrect aspect ratio
                videoHeight = properVideoHeight; // Set the height to enable the video to have the correct ratio
            }

            properties["width"] = videoWidth; // Set the properties width to the calculated videoWidth since we will be passing that to the Player Control Generation

            // #endregion

            // #region Video Art Poster Creation

            if (properties["art"] !== undefined){ // If art has been defined
                var posterImageElement : HTMLElement = rocket.generator.ElementCreator("img", { "data-rocket-minor-component" : "video-poster", "src" : properties["art"] }); // Create an img Element with the src set to the artwork
                rocket.component.CSS(posterImageElement, "height", (videoHeight + 50).toString() + "px"); // Set the posterImageElement height to be 50px taller than the videoHeight (so it flows under the Player Control)
                rocket.component.CSS(posterImageElement, "width", videoWidth.toString() + "px"); // Set the posterImageElement width equal to the width of the video
                componentElement.appendChild(posterImageElement); // Append to the Video Player container
            }

            // #endregion

            // #region Video Element and Sources Creation

            var videoPlayer : HTMLElement = rocket.generator.ElementCreator("video", { "preload" : "metadata", "volume" : "0.5"} ); // Create the video player, with the preloading to only metadata and volume to 50%
            rocket.component.CSS(videoPlayer, "height", videoHeight.toString() + "px"); // Set the video player height to be our calculated videoHeight
            rocket.component.CSS(videoPlayer, "width", videoWidth.toString() + "px"); // Set the video player width to be our calculated videoWidth

            videoPlayer.autoplay = false; // Set autoplay of video to false

            var arrayofSourceElements : Array<HTMLElement> = rocket.player.FetchSources("video", properties["sources"]); // Get an array of Source Elements

            for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
                videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
            }

            // #endregion

            componentElement.appendChild(videoPlayer); // Append the video player

            var playerControlComponent : Object = rocket.playercontrol.Generate(properties);
            var playerControlElement : Element = rocket.component.Fetch(playerControlComponent); // Fetch the HTMLElement

            // #region Player Share Element Creation (If Applicable)

            if (properties["share"] !== undefined){ // If the share attribute is defined
                if (properties["share"]["type"] == "list"){ // If the component provided is a List
                    var playerShareDialog : Element = rocket.generator.ElementCreator("div", { "data-rocket-minor-component" : "player-share" } ); // Create a div element with the minor-component of player-share-dialog
                    var playerShareLabel : Element = rocket.generator.ElementCreator("label", { "content" : "Share" }); // Create a label with the content "Share"
                    playerShareDialog.appendChild(playerShareLabel);
                    playerShareDialog.appendChild(rocket.component.Fetch(properties["share"])); // Append the List Element to the playerShareDialog
                    rocket.CSS(playerShareDialog, "height", videoHeight.toString() + "px"); // Set the height of the share dialog to be the same as the video
                    rocket.CSS(playerShareDialog, "width", videoWidth.toString() + "px"); // Set the width of the share dialog to be the same as the video

                    componentElement.insertBefore(playerShareDialog, componentElement.firstChild); // Prepend the Share Dialog
                }
            }

            // #endregion

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
