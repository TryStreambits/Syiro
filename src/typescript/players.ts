/*
    This is a file containing the modules for the Syiro Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via syiro.audioplayer.
    The Video Player is exposed via syiro.videoplayer.
    The shared Player functionality is exposed via syiro.player.
*/

/// <reference path="interfaces.ts" />
/// <reference path="utilities.ts" />

// #region Shared Player Functionality

module syiro.player {

    // #region Shared Player Initialization

    export function Init(component : Object){
        var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element
        var innerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Fetch the Audio or Video Player Element

        // #region Player Controls List
        var playerControlArea = componentElement.querySelector('div[data-syiro-component="player-control"]'); // Get the Player Control section
        var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlArea); // Get the Player Control Component Object

        // #endregion

        // #region Audio / Video Time Updating

        syiro.events.Add("timeupdate", innerContentElement, // Add an event listener to track timeupdate
            function(){
                // #region Player Component & Element Defining

                var playerComponentElement = arguments[0].parentElement; // Set the playerComponentElement as the parentElement of the innerContentElement (argument [0])
                var playerComponent = syiro.component.FetchComponentObject(playerComponentElement); // Fetch the Player Component Object

                // #endregion

                // #region Player Control Component & Element Defining

                var playerControlElement = playerComponentElement.querySelector('div[data-syiro-component="player-control"]'); // Fetch the Player Control Element
                var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get the Component Object of the Player Control

                // #endregion

                var playerElement = syiro.player.FetchInnerContentElement(playerComponent); // Get the Player Audio or Video Element
                var currentTime = playerElement.currentTime; // Get the currentTime

                syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime); // Update the label

                if (playerComponentElement.hasAttribute("data-syiro-component-status") == false){ // If the user is NOT using the input range to change volume or time
                    playerComponentElement.querySelector('div[data-syiro-component="player-control"]').querySelector("input").value = Math.floor(currentTime); // Set the range input to the currentTime (rounded down)
                }

                if (playerElement.ended == true){ // If playback has ended
                    syiro.player.Reset(playerComponent); // Reset the Player
                }
            }
        );

        // #endregion

        // #region Video Player Specific Functionality

        if (component["type"] == "video-player"){ // If this is a Video Player Component

            // #region Poster Art Check

            var posterImageElement : Element = componentElement.querySelector('img[data-syiro-minor-component="video-poster"]'); // Get the video poster img tag if it exists

            if (posterImageElement !== null){ // If the posterImageElement exists
                syiro.component.CSS(playerControlArea, "opacity", "0.8"); // Set opacity to 0.8

                syiro.events.Add(syiro.events.eventStrings["up"], posterImageElement, // Add mouseup, touchend, etc listeners to the posterImageElement
                    function(){
                        var posterImageElement : Element = arguments[0]; // Set the posterImageElement as the first argument passed
                        var e : MouseEvent = arguments[1]; // Get the Mouse Event typically passed to the function
                        var playerComponentObject = syiro.component.FetchComponentObject(posterImageElement.parentElement); // Fetch the Video Player Component (which is the parent of posterImageElement)

                        syiro.component.CSS(posterImageElement, "visibility", "hidden"); // Hide the element
                        syiro.player.PlayOrPause(playerComponentObject); // Play the video

                        if (e.type.indexOf("touchend") !== -1){ // If the event was touch
                            syiro.player.TogglePlayerControl(playerComponentObject, false); // Hide the Player Control as well
                        }
                    }
                );
            }

            // #endregion

            // #region Video Element Click / Tap Handling

            syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, // Add mouseup / touchup listeners to the innerContentElement
                function(){
                    var innerContentElement : Element = arguments[0]; // Get the innerContentElement passed as argument 0
                    var e : MouseEvent = arguments[1]; // Get the Mouse Event typically passed to the function

                    var playerComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement); // Fetch the Component Object of the innerContentElement's parentElement

                    if (e.type.indexOf("touchend") == -1){ // If it was not touch that triggered the event
                        syiro.player.PlayOrPause(playerComponent); // Play / pause the video
                    }
                    else{ // If it was touch that triggered the event
                        syiro.player.TogglePlayerControl(playerComponent); // Toggle the control
                    }
                }
            );

            // #endregion

            // #region Video ContextMenu Prevention

            syiro.events.Add("contextmenu", componentElement,
                function(){
                    var e : Event = arguments[1]; // Get the Mouse Event typically passed to the function
                    e.preventDefault();
                }
            );

            // #endregion

            // #region Video Player Mousenter / Mouseleave Handling

            syiro.events.Add("mouseenter", componentElement, // Add a mouseenter event for the Video Player that shows the Video Player inner Player Control
                function(){
                    var componentElement : Element = arguments[0]; // Get the componentElement passed as argument 0
                    syiro.player.TogglePlayerControl(syiro.component.FetchComponentObject(componentElement), true); // Show the control (send true, signifying to show as oppose to hide)
                }
            );

            syiro.events.Add("mouseleave", componentElement, // Add a mouseleave event for the Video Player that hides the Video Player inner Player Control
                function(){
                    var componentElement : Element = arguments[0]; // Get the componentElement passed as argument 0
                    syiro.player.TogglePlayerControl(syiro.component.FetchComponentObject(componentElement), false); // Hide the control (send false, signifying to hide as oppose to show)
                }
            );

            // #endregion

        }

        // #endregion

        // #region Player Control Listeners

            // #region Play Button Listener

            var playButtonComponent : Object = syiro.component.FetchComponentObject(playerControlArea.querySelector('div[data-syiro-minor-component="player-button-play"]')); // Get the Component Object of the Play Button

            syiro.events.Add(playButtonComponent,
                function(){
                    var playButtonComponent : Object = arguments[0]; // Get the Play Button that was clicked
                    var e : MouseEvent = arguments[1]; // Get the Mouse Event typically passed to the function
                    var playButton : Element = syiro.component.Fetch(playButtonComponent); // Get the Play Button Element

                    // #region Player Component & Element Defining

                    var playerElement = playButton.parentElement.parentElement; // Get the Play Button's parent Player
                    var playerElementComponent : Object = syiro.component.FetchComponentObject(playerElement); // Get the Player Component based on the playerElement

                    // #endregion

                    syiro.player.PlayOrPause(playerElementComponent, playButtonComponent); // Switch the status of the Player to either play or pause

                    if ((playerElementComponent["type"] == "video-player") && (syiro.player.IsPlaying(playerElementComponent) == true) && (e.type.indexOf("touchend") !== -1)){ // If the play button was triggered by touch and we are now playing video content
                        syiro.player.TogglePlayerControl(playerElementComponent); // Toggle the control
                    }
                }
            );

            // #endregion

            // #region Player Range Initialization

            var playerRange = playerControlArea.querySelector('input[type="range"]'); // Get the input range

            syiro.events.Add(syiro.events.eventStrings["down"], playerRange, // Add mousedown / touchstart events to the playerRange
                function(){
                    var playerRangeElement : Element = arguments[0]; // Get the Player Range element passed
                    playerRange.parentElement.parentElement.setAttribute("data-syiro-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                }
            );

            syiro.events.Add(syiro.events.eventStrings["up"], playerRange, syiro.player.TimeOrVolumeChanger); // Add mouseup / touchend events to the playerRange, which calls syiro.player.TimeOrVolumeChanger

            // #endregion

            // #region Volume Button Listener

            var volumeButtonComponent = syiro.component.FetchComponentObject(playerControlArea.querySelector('div[data-syiro-minor-component="player-button-volume"]')); // Get the Component Object of the Volume Button

            syiro.events.Add(volumeButtonComponent,
                function(){
                    var volumeButtonComponent : Object = arguments[0]; // Get the Volume Button that was clicked
                    var volumeButton : Element = syiro.component.Fetch(volumeButtonComponent); // Get the Volume Button Element

                    var playerElement = volumeButton.parentElement.parentElement; // Get the Volume Button's player-controls section's player
                    var playerElementComponent : Object = syiro.component.FetchComponentObject(playerElement); // Get the Player Component based on the playerElement

                    var playerRange : any = playerElement.querySelector("input"); // Get the Player Control Range
                    var playerRangeAttributes : Object= {}; // Set playerRangeAttributes as an empty Object to hold attribute information that we'll apply to the input range later

                    var playerTimeElement = playerElement.querySelector("time"); // Get the time Element

                    if (playerElement.hasAttribute("data-syiro-component-changevolume") !== true){ // If we are NOT already actively doing a volume change
                        playerElement.setAttribute("data-syiro-component-status", "true"); // Set the status to true to imply that the audio / video time changing should not change playerRange
                        playerElement.setAttribute("data-syiro-component-changevolume", ""); // Set the player component-changing so the TimeOrVolumeChanger() knows to change volume settings

                        volumeButton.parentElement.querySelector('div[data-syiro-minor-component="player-button-play"]').setAttribute("data-syiro-component-disabled", ""); // Set to a "disabled" UI
                        volumeButton.setAttribute("data-syiro-component-status", "true"); // Set component status to true to imply it is active

                        playerTimeElement.setAttribute("data-syiro-component-disabled", ""); // Set to a "disabled" UI

                        playerRangeAttributes["max"] = "100"; // Set max to 100
                        playerRangeAttributes["step"] = "1"; // Set step to 1
                        playerRange.value = (syiro.player.FetchInnerContentElement(playerElementComponent).volume * 100).toString(); // Set the value to the volume (which is 0.1 to 1.0) times 10
                    }
                    else{ // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
                        volumeButton.parentElement.querySelector('div[data-syiro-minor-component="player-button-play"]').removeAttribute("data-syiro-component-disabled"); // Remove the "disabled" UI
                        volumeButton.removeAttribute("data-syiro-component-status"); // Remove component-status to imply volume icon is not active

                        playerTimeElement.removeAttribute("data-syiro-component-disabled"); // Removed the "disabled" UI

                        // #region Reset Input Range to have the proper min, max values, steps.
                        // Current Time (input range value) is only changed if the player is paused, since if it is playing, it'll be auto-updated by the Player's timeupdate listener.

                        playerRangeAttributes = syiro.player.GetPlayerLengthInfo(playerElementComponent); // Get a returned Object with the max the input range should be, as well as a reasonable, pre-calculated amount of steps.

                        playerElement.removeAttribute("data-syiro-component-status"); // Remove component-status to we are not modifying the playerRange
                        playerElement.removeAttribute("data-syiro-component-changevolume"); // Remove the changevolume attribute.
                    }

                    for (var playerRangeAttribute in playerRangeAttributes){ // For each attribute defined in the playerRangeAttributes Object
                        playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]); // Set the attribute on the playerRange
                    }
                }
            );

            // #endregion

            // #region Player Menu Dialog

            var menuButton = componentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]'); // Get the menuButton if it exists

            if (menuButton !== null){ // If the menu button exists
                syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(menuButton), syiro.player.ToggleMenuDialog.bind(this, component)); // Add an event listener to the button that calls ToggleMenuDialog, binding to the Player Component
            }

            // #endregion

        // #endregion
    }

    // #endregion

    // #region Get Internal Audio or Video Element of Player container Component

    export function FetchInnerContentElement(component : Object) : HTMLMediaElement {
        var componentElement = syiro.component.Fetch(component); // Get the Player Component
        return componentElement.querySelector(component["type"].replace("-player", "")); // Return the Element fetched from querySelector (audio or video)
    }

    // #endregion

    // #region Get Information about the Player's Length and reasonable step intervals

    export function GetPlayerLengthInfo(component : Object) : Object{
        var playerLengthInfo : Object = {}; // Define playerLengthInfo as an empty Object to hold length information about the audio or video

        var contentDuration : any = syiro.player.FetchInnerContentElement(component).duration; // Get the Player's internal audio or video Element and its duration property

        if ((isNaN(contentDuration) == false) && (String(contentDuration) !== "Infinity")){ // If we are able to properly fetch the duration and we are not streaming
            contentDuration = Math.floor(Number(contentDuration)); // Round down the contentDuration
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
        }
        else if (isNaN(contentDuration)){ // If the contentDuration is unknowned
            playerLengthInfo["max"] = "Unknown"; // Set max to unknown
            playerLengthInfo["step"] = 1; // Set step value to 1 second
        }
        else if (String(contentDuration) == "Infinity"){ // If we are streaming content
            playerLengthInfo["max"] = "Streaming"; // Set max to Streaming
            playerLengthInfo["step"] = 1; // Set step value to 1 second
        }

        return playerLengthInfo; // Return the playerLengthInfo Object
    }

    // #endregion

    // #region Player Time or Volume Changer

    export function TimeOrVolumeChanger(){
        var playerRange : HTMLInputElement = arguments[0]; // Define playerRangeElement as the Element passed to us
        var playerControlElement = playerRange.parentElement; // Get the Player Control Element, which is the parent of the playerRange

        var playerElement = playerControlElement.parentElement; // Get the Player Control's parent Player container
        var playerComponentObject : Object = syiro.component.FetchComponentObject(playerElement); // Get the Component Object of the Player
        var contentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(playerComponentObject); // Get the Player's Audio or Video Element

        var valueNum : any = Number(playerRange.value); // Define valueNum as "any" (actually Number), which we do calculation for later

        if (playerElement.hasAttribute("data-syiro-component-changevolume") == false){ // If we are doing a time change
            syiro.player.SetTime(playerComponentObject, valueNum.toFixed()); // Set the Time
        }
        else{
            syiro.player.SetVolume(playerComponentObject, (valueNum / 100)); // Set the volume to value of the range, diving the number by 100 to get an int from 0.0 to 1.0.
        }

        if (playerElement.hasAttribute("data-syiro-component-changevolume") !== true){ // If we are not currently changing the volume
            playerElement.removeAttribute("data-syiro-component-status"); // Remove the status to indicate we are no longer changing the playerRange values
        }
    }

    // #endregion

    // #region Get Information about if the Player is playing

    export function IsPlaying(component : Object) : boolean {
        var componentElement = syiro.component.Fetch(component); // Fetch the Player Element
        var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused; // Get the value of paused on the Player (opposite of what we will return)

        return !isPaused; // Return the opposite boolean value (playing = (paused = false), therefore true. paused = (paused = true), therefore false)
    }

    // #endregion

    // #region Play or Pause Audio or Video based on current state

    export function PlayOrPause(component : Object, playButtonComponentObject ?: Object) {
        var allowPlaying : boolean = false; // Define allowPlaying as a boolean as to whether we should allow playing or not. Defaults to false, set to true if we might be able to play the source(s)

        var playerComponentElement = syiro.component.Fetch(component); // Get the Component Element of the Player
        var innerContentElement = syiro.player.FetchInnerContentElement(component); // Get the inner audio or video Element

        var playerSources : Array<Object> = syiro.player.FetchSources(component); // Fetch the sources from the innerContentElement

        for (var playerSourceIndex in playerSources){ // For each source in playerSources
            if (innerContentElement.canPlayType(playerSources[playerSourceIndex]["type"]) !== ""){ // If we do not get an empty string returned, meaning we may be able to play the content
                allowPlaying = true; // Set allowPlaying to true
            }
        }

        if (allowPlaying == true){ // If the content is able to be played
            if (playButtonComponentObject == undefined){ // If the Play Button Component is not defined
                playButtonComponentObject = syiro.component.FetchComponentObject(playerComponentElement.querySelector('div[data-syiro-minor-component="player-button-play"]')); // Get the Play Button Component Object
            }

            var playButton : Element = syiro.component.Fetch(playButtonComponentObject); // Get the Play Button Element

            if (playButton.hasAttribute("data-syiro-component-disabled") == false){ // If the play button is not disabled (done when tweaking volume)
                if (innerContentElement.currentTime == 0){ // If the video current time is zero when played
                    var playerControlComponent : Object = syiro.component.FetchComponentObject(playButton.parentElement); // Get the Player Control Component based on the Play Button's Parent Element
                    var playerRange : Element = playerComponentElement.querySelector('input[type="range"]'); // Get the input range
                    var playerMediaLengthInformation : Object = syiro.player.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range

                    // #region Poster Image Hiding

                    var posterImageElement : HTMLElement = playerComponentElement.querySelector('img[data-syiro-minor-component="video-poster"]'); // Get the video poster img tag if it exists

                    if (posterImageElement !== null){ // If the posterImageElement is defined
                        syiro.component.CSS(posterImageElement, "visibility", "hidden"); // Hide the element
                        syiro.component.CSS(playerControlComponent, "opacity", false); // Remove opacity setting
                    }

                    // #endregion

                    for (var playerRangeAttribute in playerMediaLengthInformation){ // For each attribute defined in the playerRangeAttributes Object
                        playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]); // Set the attribute on the playerRange
                    }

                    syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);
                }

                if (innerContentElement.paused !== true){ // If the audio or video Element is playing
                    innerContentElement.pause(); // Pause the audio or video Element
                    syiro.component.CSS(playButtonComponentObject, "background-image", false); // Remove the background-image style / reset to play
                }
                else{ // If the audio or video Element is paused
                    innerContentElement.play(); // Play the audio or video Element
                    syiro.component.CSS(playButtonComponentObject, "background-image", "url(css/img/pause.png)"); // Set background-image to pause
                }
            }
        }
        else{ // If the content can not be played
            var codecErrorElement = syiro.generator.ElementCreator("div", // Create a div to add to the player stating there is a codec error
                {
                    "data-syiro-minor-component" : "player-error",
                    "content" : "This " + component["type"].replace("-player", "") + " is not capable of being played on this browser or device. Please try a different device or browser."
                }
            );

            var playerHalfHeight = ((playerComponentElement.clientHeight - 40) / 2); // Define playerHalfHeight equal to half the height of the Player, minus 40 (height of the codecErrorElement)

            syiro.component.CSS(codecErrorElement, "width", playerComponentElement.clientWidth.toString() + "px"); // Set the width to the width of the Player
            syiro.component.CSS(codecErrorElement, "padding-top", playerHalfHeight.toString() + "px"); // Set the padding-top to the playerHalfHeight
            syiro.component.CSS(codecErrorElement, "padding-bottom", playerHalfHeight.toString() + "px"); // Set the padding-bottom to the playerHalfHeight

            playerComponentElement.insertBefore(codecErrorElement, playerComponentElement.firstChild); // Prepend the codecErrorElement to the Player

            syiro.component.CSS(codecErrorElement, "visibility", "visible"); // Set the codecErrorElement to be visible
        }
    }

    // #endregion

    // #region Fetch Audio or Video Element Sources

    export function FetchSources(component : Object) : Array<Object> { // Return an array of source types (string)
        var innerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Fetch the inner audio or video Element from the Audio Player or Video Player Component
        var sourceTags : NodeListOf<HTMLSourceElement> = innerContentElement.getElementsByTagName("SOURCE"); // Get all source tags within the innerContentElement
        var sourcesArray : Array<Object> = []; // Define sourcesArray as an empty Array to hold source information

        for (var sourceElementIndex = 0; sourceElementIndex < sourceTags.length; sourceElementIndex++){ // For each source Element in the sourceTags
            var sourceElement : HTMLSourceElement = sourceTags.item(sourceElementIndex); // Get the individual source Element

            if (sourceElement !== undefined){
                sourcesArray.push(
                    {
                        "src" : sourceElement.getAttribute("src"), // Get the "src" attribute from the sourceElement
                        "type" : sourceElement.getAttribute("type") // Get the "type" attribute from the sourceElement, which should have information like "video/webm"
                    }
                );
            }
        }

        return sourcesArray;
    }

    // #endregion

    // #region Multi-Source Generation

    export function GenerateSources(type: string, sources : any) : Array<HTMLElement> { // Returns an array of HTMLElements
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
                else if (sourceExtension == "m3u8"){ // If we are dealing with a playlist m3u8 (live streaming)
                    if (type == "audio"){ // If we are dealing with an audio player
                        sourceTagAttributes["type"] = "mp3"; // Set the type to an mp3, which is the most common audio streaming codec
                    }
                    else{ // If the player is video
                        sourceTagAttributes["type"] = "mp4"; // Set the type to an mp4, which is the most common video streaming codec
                    }
                }
                else if (sourceExtension == "mov"){ // If the source extension IS mov
                    sourceTagAttributes["type"] = "quicktime"; // Append the quicktime string
                }

                if (sourceTagAttributes["type"] !== undefined){ // If we have defined a type for the source
                    sourceTagAttributes["type"] = type + "/" + sourceTagAttributes["type"] // Prepend the type (audio or video) and a / delimiter
                }
            }

            var sourceTag = syiro.generator.ElementCreator("source", sourceTagAttributes); // Create a source tag with the attributes we've applied

            arrayOfSourceElements.push(sourceTag); // Push this source tag
        }

        return arrayOfSourceElements;
    }

    // #endregion

    // #region Reset Player - Function for resetting the player state to default (except for volume). Handy for source changing

    export function Reset(component : Object){
        var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player
        var playerControl = playerElement.querySelector('div[data-syiro-component="player-control"]'); // Get the Player Control

        // #region Button Attribute Resetting

        var playButton = playerControl.querySelector('div[data-syiro-minor-component="player-button-play"]'); // Get the Play Button from the Player Control
        playButton.removeAttribute("data-syiro-component-disabled"); // Remove the "disabled" UI for the Play Button
        syiro.component.CSS(playButton, "background-image", false); // Remove the background-image style / reset to play image for Play Button

        var timeLabel = playerControl.querySelector("time"); // Get the Time Label from the Player Control
        timeLabel.removeAttribute("data-syiro-component-disabled"); // Removed the "disabled" UI from the time label

        var volumeControl = playerControl.querySelector('div[data-syiro-minor-component="player-button-volume"]'); // Get the Volume Button from the Player Control
        volumeControl.removeAttribute("data-syiro-component-status"); // Remove component-status to imply volume icon is not active

        // #endregion

        if (playerElement.querySelector('div[data-syiro-minor-component="player-error"]') !== null){ // If the Player Error dialog exists
            playerElement.removeChild(playerElement.querySelector('div[data-syiro-minor-component="player-error"]')); // Remove the Player Error dialog
        }

        playerElement.removeAttribute("data-syiro-component-status"); // Remove component-status to we are not modifying the playerRange
        playerElement.removeAttribute("data-syiro-component-changevolume"); // Remove the changevolume attribute.

        if (syiro.player.IsPlaying(component)){ // If the Audio Player or Video Player is playing
            playerInnerContentElement.pause(); // Start by pausing the player to prevent timeupdate events
        }

        syiro.player.SetTime(component, 0); // Reset the time (if it needs to be reset to zero)
    }

    // #endregion

    // #region Set Source - Function for easily setting the source(s) of an Audio or Video Player Component

    export function SetSources(component : Object, sources : any){
        var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player

        if (typeof sources == "string"){ // If only a single source is defined
            sources = [sources]; // Convert to an array
        }

        var arrayofSourceElements : Array<HTMLElement> = syiro.player.GenerateSources(component["type"].replace("-player", ""), sources); // Get an array of Source Elements

        syiro.player.Reset(component); // Reset the component

        if (component["type"] == "video-player"){ // If this is a video player
            syiro.component.CSS(playerElement.querySelector('img[data-syiro-minor-component="video-poster"]'), "visibility", "hidden"); // Hide the Video Poster
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
        var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player

        if (playerInnerContentElement.currentTime !== time){ // If we are not setting the time to what it already is (for instance 0, which would cause an InvalidStateError)
            playerInnerContentElement.currentTime = time; // Set the playerInnerContentElement's currentTime to the time provided
            playerElement.querySelector('div[data-syiro-component="player-control"]').querySelector("input").value = Math.floor(time); // Set the range input to the currentTime (rounded down)
            syiro.playercontrol.TimeLabelUpdater(syiro.component.FetchComponentObject(playerElement.querySelector('div[data-syiro-component="player-control"]')), 0, time); // Update the label
        }
    }

    // #endregion

    // #region Set Volume - Function for easily setting the volume of an Audio or Video Player

    export function SetVolume(component : Object, volume : number){
        var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player
        playerInnerContentElement.volume = volume; // Set the Player volume
    }

    // #endregion

    // #region Toggle Player Control

    export function TogglePlayerControl(component : Object, forceShow ?: boolean){
        var playerElement : Element = syiro.component.Fetch(component); // Fetch the Player Component
        var playerControlElement : Element = playerElement.querySelector('div[data-syiro-component="player-control"]'); // Get the Player Control of this particular Player
        var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get this particular Player Control Component Object for animation
        var currentAnimationStored : any = null; // Define currentAnimationStored initially as null. We will define it as the current animation if it has one

        syiro.component.CSS(playerControlElement, "opacity", false); // Remove the opacity styling set by the Video Player Component init for the Player Control to ensure fade animations run properly

        if (playerControlElement.hasAttribute("class")){ // If the Player Control Element has an animation "class" (like fade-in-animation)
            currentAnimationStored = playerControlElement.getAttribute("class"); // Get the current animation stored in "class"
        }
        else { // If it doesn't have a class (the event has been triggered for the first time)
            if (typeof forceShow == "undefined"){ // If forceShow is not defined
                forceShow  = true; // Force to set the fade-in-animation value
            }
        }

        if (forceShow == true){ // If we are forcing to show the Player Control
            syiro.animation.FadeIn(playerControlComponent); // Fade in the Player Control
        }
        else if (forceShow == false){ // If we are forcing to hide the Player Control
            if (currentAnimationStored == null){ // If the intent is to force hide the Player Control while the playerControlElement has no class
                playerControlElement.setAttribute("class", "fade-in-animation"); // Set the Player Control Element to fade-in-animation to ensure that the animation runs
            }

            syiro.animation.FadeOut(playerControlComponent); // Fade out the Player Control
        }
        else { // If the forceShow is not defined
            if (currentAnimationStored == "fade-out-animation"){ // If the current status is the Player Control is faded out
                syiro.animation.FadeIn(playerControlComponent); // Fade in the Player Control
            }
            else{ // If the current status is the Player Control is faded in (showing)
                syiro.animation.FadeOut(playerControlComponent); // Fade out the Player Control
            }
        }
    }

    // #endregion

    // #region Toggle Menu Dialog

    export function ToggleMenuDialog(component : Object){
        var component : Object = arguments[0]; // Define the Player Component Object as the first argument
        var componentElement : Element = syiro.component.Fetch(component); // Fetch the Player Element

        var menuDialog : Element = componentElement.querySelector('div[data-syiro-minor-component="player-menu"]'); // Get the Menu Dialog
        var menuButton : Element = componentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]'); // Get the menu button element

        if (syiro.component.CSS(menuDialog, "visibility") !== "visible"){ // If the Menu Dialog is currently not showing
            var playerMenuHeight : number; // Define playerMenuHeight as a number (height that the dialog should be)

            if (component["type"] == "audio-player"){ // If we are showing a menu dialog for an Audio Player
                playerMenuHeight = 100; // Set to 100 since the Audio Player has a fixed height of 100px
            }
            else{ // If we are showing a menu dialog for the Video Player
                playerMenuHeight = syiro.player.FetchInnerContentElement(component).clientHeight; // Set to the height of the inner video (content) Element
            }

            syiro.component.CSS(menuDialog, "height", playerMenuHeight.toString() + "px"); // Set the height of the menu dialog
            syiro.component.CSS(menuDialog, "width", componentElement.clientWidth.toString() + "px"); // Set the width of the menu dialog to be the same as the componentElement

            menuButton.setAttribute("data-syiro-component-status", "true"); // Set the menu button status to true
            syiro.component.CSS(menuDialog, "visibility", "visible"); // Show the menu dialog
        }
        else{ // If the Menu dialog currently IS showing
            menuButton.removeAttribute("data-syiro-component-status"); // Remove the menu button status
            syiro.component.CSS(menuDialog, "visibility", false); // Hide the menu dialog (removing the visibility attribute, putting the Menu Dialog back to default state)
            syiro.component.CSS(menuDialog, "height", false); // Remove the height attribute from the Player Menu Dialog
            syiro.component.CSS(menuDialog, "width", false); // Remove the width attribute from the Player Menu Dialog
        }
    }

    export var ToggleShareDialog : Function = ToggleMenuDialog; // Define ToggleShareDialog as a meta-function of ToggleMenuDialog for backwards compatibility

    // #endregion
}

// #endregion

// #region Syiro Player Controls Component

module syiro.playercontrol {

    // #region Player Control Generator

    export function Generate(properties : Object) : Object {
        var componentId : string = syiro.generator.IdGen("player-control"); // Generate an ID for the Player Control
        var componentElement = syiro.generator.ElementCreator(componentId, "player-control"); // Generate the basic playerControl container

        var playButton = syiro.button.Generate( { "data-syiro-minor-component" : "player-button-play" } ); // Create a play button

        var inputRange : HTMLElement = syiro.generator.ElementCreator("input", { "type" : "range", "value" : "0"} ); // Create an input range
        var timeStamp : HTMLElement = syiro.generator.ElementCreator("time", { "content" : "00:00 / 00:00"} ); // Create a timestamp time element

        var volumeButton = syiro.button.Generate( { "data-syiro-minor-component" : "player-button-volume" } ); // Generate a Volume Button

        componentElement.appendChild(inputRange); // Append the input range
        componentElement.appendChild(syiro.component.Fetch(playButton)); // Append the play button
        componentElement.appendChild(timeStamp); // Append the timestamp time element

        // #region Player Menu Element Creation (If Applicable)

        if (properties["menu"] !== undefined){ // If the menu attribute is defined
            if (properties["menu"]["type"] == "list"){ // If the component provided is a List
                var menuButton = syiro.button.Generate( { "data-syiro-minor-component" : "player-button-menu"} ); // Generate a Menu Button
                componentElement.appendChild(syiro.component.Fetch(menuButton)); // Append the menuButton to the playerControlElement
            }
        }

        // #endregion

        componentElement.appendChild(syiro.component.Fetch(volumeButton)); // Append the volume control

        syiro.component.componentData[componentId] = { "HTMLElement" : componentElement }; // Store the Player Control

        return { "id" : componentId, "type" : "player-control" }; // Return a Component Object
    }

    // #endregion

    // #region Player Time Label Updating

    export function TimeLabelUpdater(component : Object, timePart : number, value : any){
        var playerControlElement : HTMLElement = syiro.component.Fetch(component); // Get the Player Control's Element
        var playerTimeElement = playerControlElement.querySelector("time"); // Get the time Element

        // #region Seconds Parsing to String

        var parsedSecondsToString : string = ""; // Define parsedSecondsToString as our converted seconds to Object then concatenated string

        if (typeof value == "number"){ // If we passed a number
            var timeFormatObject = syiro.utilities.SecondsToTimeFormat(value); // Get the time format (rounded down value)

            for (var timeObjectKey in timeFormatObject){ // For each key in the timeObject
                var timeObjectValue = timeFormatObject[timeObjectKey]; // Set timeObjectValue as the value based on key

                if (parsedSecondsToString.length !== 0){ // If there is already content in parsedSecondsToString
                    parsedSecondsToString = parsedSecondsToString + ":" + timeObjectValue; // Append :timeObjectValue
                }
                else{
                    parsedSecondsToString = timeObjectValue; // Set parsedSecondsToString as value
                }
            }
        }
        else{ // If we did not pass a number (so a string, like "Unknown" or "Streaming")
            parsedSecondsToString = value; // Simply set the parsedSecondsToString as the value passed
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

module syiro.audioplayer {

    // #region Audio Player Generator

    export function Generate(properties : Object) : Object { // Generate a Audio Player Component and return a Component Object
        if (properties["sources"] !== undefined){ // If the audio property is defined
            var componentId : string = syiro.generator.IdGen("audio-player"); // Generate a component Id
            var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "audio-player", // Generate an Audio Player Element
                {
                    "id" : componentId, // Set the id (followed by name below) to act as a fragment ID for a page to jump to
                    "name" : componentId,
                }
            );

            if (typeof properties["share"] !== "undefined"){ // If the "share" menu attribute is still being used
                properties["menu"] = properties["share"]; // Set "menu" attribute equal to "share" attribute
            }

            // #region Audio Element and Source Creation

            var audioPlayer : HTMLElement = syiro.generator.ElementCreator("audio", { "preload" : "metadata", "volume" : "0.5" }); // Generate an audio Element with only preloading metadata, setting volume to 50%
            audioPlayer.autoplay = false; // Set autoplay of audio to false

            var arrayofSourceElements : Array<HTMLElement> = syiro.player.GenerateSources("audio", properties["sources"]); // Get an array of Source Elements

            for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
                audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
            }

            // #endregion

            componentElement.appendChild(audioPlayer); // Append the audio player

            // #region Audio Player Information Creation

            if ((properties["art"] !== undefined) && (properties["title"] !== undefined)){ // If the properties has cover art and the audio title defined
                var playerInformation : HTMLElement = syiro.generator.ElementCreator("div", { "data-syiro-minor-component" : "player-information" }); // Create the player information
                playerInformation.appendChild(syiro.generator.ElementCreator("img", { "src" : properties["art"]})); // Create the covert art and append the cover art to the playerInformation

                var playerTextualInformation : HTMLElement = syiro.generator.ElementCreator("section"); // Create a section to hold the textual information like audio title
                playerTextualInformation.appendChild(syiro.generator.ElementCreator("b", { "content" : properties["title"]})); // Create the Audio Title and append it to the playerTextualInformation section

                if (properties["artist"] !== undefined){ // If the artist is NOT undefined
                    playerTextualInformation.appendChild(syiro.generator.ElementCreator("label", { "content" : properties["artist"] })); // Create a label with the artist info and append it to the playerTextualInformation section
                }

                if (properties["album"] !== undefined){ // If the album is NOT undefined
                    playerTextualInformation.appendChild(syiro.generator.ElementCreator("label", { "content" : properties["album"] })); // Create a label with the album info and append it to the playerTextualInformation section
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

            syiro.component.CSS(componentElement, "width", properties["width"].toString() + "px"); // Set the width of the Audio Player Component Element

            var playerControlComponent : Object = syiro.playercontrol.Generate(properties);
            var playerControlElement : Element = syiro.component.Fetch(playerControlComponent); // Fetch the HTMLElement

            // #region Player Menu Element Creation (If Applicable)

            if (properties["menu"] !== undefined){ // If the menu attribute is defined
                if (properties["menu"]["type"] == "list"){ // If the component provided is a List
                    var playerMenuDialog : Element = syiro.generator.ElementCreator("div", { "data-syiro-minor-component" : "player-menu" } ); // Create a div element with the minor-component of player-menu
                    playerMenuDialog.appendChild(syiro.generator.ElementCreator("label", { "content" : "Menu" })); // Create a label with the content "Menu"
                    playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"])); // Append the List Element to the playerMenuDialog
                    componentElement.insertBefore(playerMenuDialog, componentElement.firstChild); // Prepend the Menu Dialog
                }
            }

            // #endregion

            componentElement.appendChild(playerControlElement); // Append the player control

            syiro.component.componentData[componentId] = { "HTMLElement" : componentElement }; // Store the Audio Player Component Element we generated

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

module syiro.videoplayer {

    // #region Video Player Generator

    export function Generate(properties : Object) : Object { // Generate a Video Player Component and return a Component Object
        if (properties["sources"] !== undefined){ // If the video property is defined
            var componentId : string = syiro.generator.IdGen("video-player"); // Generate a component Id
            var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "video-player", // Generate an Video Player Element
                {
                    "id" : componentId, // Set the id (followed by name below) to act as a fragment ID for a page to jump to
                    "name" : componentId
                }
            );

            if (typeof properties["share"] !== "undefined"){ // If the "share" menu attribute is still being used
                properties["menu"] = properties["share"]; // Set "menu" attribute equal to "share" attribute
            }

            // #region Video Dimensions / Proper Ratio Calculation

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

            var properVideoHeight : number = Number((videoWidth / 1.77).toFixed()); // Proper Component Height to ensure 16:9 aspect ratio

            if (videoHeight !== properVideoHeight){ // In the event the player has an incorrect aspect ratio
                videoHeight = properVideoHeight; // Set the height to enable the video to have the correct ratio
            }

            properties["width"] = videoWidth; // Set the properties width to the calculated videoWidth since we will be passing that to the Player Control Generation

            // #endregion

            // #region Video Art Poster Creation

            if (properties["art"] !== undefined){ // If art has been defined
                var posterImageElement : HTMLElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component" : "video-poster", "src" : properties["art"] }); // Create an img Element with the src set to the artwork
                syiro.component.CSS(posterImageElement, "height", videoHeight.toString() + "px"); // Set the posterImageElement height equal to the width of the video
                syiro.component.CSS(posterImageElement, "width", videoWidth.toString() + "px"); // Set the posterImageElement width equal to the width of the video
                componentElement.appendChild(posterImageElement); // Append to the Video Player container
            }

            // #endregion

            // #region Video Element and Sources Creation

            var videoPlayer : HTMLElement = syiro.generator.ElementCreator("video", { "preload" : "metadata", "volume" : "0.5"} ); // Create the video player, with the preloading to only metadata and volume to 50%

            videoPlayer.autoplay = false; // Set autoplay of video to false

            var arrayofSourceElements : Array<HTMLElement> = syiro.player.GenerateSources("video", properties["sources"]); // Get an array of Source Elements

            for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
                videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
            }

            componentElement.appendChild(videoPlayer); // Append the video player

            // #endregion

            // #region Player Control Creation

            var playerControlComponent : Object = syiro.playercontrol.Generate(properties);
            componentElement.appendChild(syiro.component.Fetch(playerControlComponent)); // Fetch the HTMLElement and append the player control

            // #endregion

            // #region Player Menu Element Creation (If Applicable)

            if (properties["menu"] !== undefined){ // If the menu attribute is defined
                if (properties["menu"]["type"] == "list"){ // If the component provided is a List
                    var playerMenuDialog : Element = syiro.generator.ElementCreator("div", { "data-syiro-minor-component" : "player-menu" } ); // Create a div element with the minor-component of player-menu
                    playerMenuDialog.appendChild(syiro.generator.ElementCreator("label", { "content" : "Menu" })); // Create a label with the content "Menu"
                    playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"])); // Append the List Element to the playerMenuDialog
                    componentElement.insertBefore(playerMenuDialog, componentElement.firstChild); // Prepend the Menu Dialog
                }
            }

            // #endregion

            syiro.component.CSS(componentElement, "height", videoHeight.toString() + "px"); // Set the height of the Video Player Component
            syiro.component.CSS(componentElement, "width", videoWidth.toString() + "px"); // Set the width of the Video Player Component

            syiro.component.componentData[componentId] = { // Store the Video Player Component Element data we generated
                "HTMLElement" : componentElement, // HTMLElement we generated
                "initialDimensions" : [videoHeight, videoWidth] // Initial Dimensions
            };

            return { "id" : componentId, "type" : "video-player" }; // Return a Component Object
        }
        else{ // If video is not defined in the properties
            return { "error" : "no video defined" }; // Return an error Object
        }
    }

    // #endregion

}

// #endregion
