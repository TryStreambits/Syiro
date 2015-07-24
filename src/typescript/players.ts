/*
    This is a file containing the namespace for the Syiro Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via syiro.audioplayer.
    The Video Player is exposed via syiro.videoplayer.
    The shared Player functionality is exposed via syiro.player.
*/

/// <reference path="component.ts" />
/// <reference path="events.ts" />
/// <reference path="generator.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="utilities.ts" />

// #region Shared Player Functionality

namespace syiro.player {

    // #region Shared Player Initialization

    export function Init(component : Object){
        if (syiro.data.Read(component["id"] + "->NoUX") == false){ // If NoUX is NOT applied (NoUX is applied for iPhones so we don't render the Player Controls)
            var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element
            var innerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Fetch the Audio or Video Player Element

            // #region Player Controls List

            var playerControlArea = componentElement.querySelector('div[data-syiro-component="player-control"]'); // Get the Player Control section
            var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlArea); // Get the Player Control Component Object

            // #endregion

            // #region Audio / Video Player Timing Events

                // #region Audio / Video Duration Changed
                // This event is triggered when the audio or video content is first initialized as well as when the source is changed and therefore duration changed.

                syiro.events.Add("durationchange", innerContentElement, // Add an event listener to the audio / video durationchange
                    function(){
                        // #region Player Component & Element Defining

                        var playerElement = arguments[0]; // Define the audio or video element as the Element being effected by timeupdate
                        var playerComponentElement = playerElement.parentElement; // Set the playerComponentElement as the parentElement of the innerContentElement (argument [0])
                        var playerComponent = syiro.component.FetchComponentObject(playerComponentElement); // Fetch the Player Component Object

                        // #endregion

                        // #region Player Range Configuration

                        if (syiro.data.Read(playerComponent["id"] + "->IsStreaming") == false){ // If the Player is NOT streaming content
                        	var playerControlElement  = playerComponentElement.querySelector('div[data-syiro-component="player-control"]');
                        	var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get the Player Control Component
                        	var playerRange : Element = playerComponentElement.querySelector('input[type="range"]'); // Get the input range

                            var playerMediaLengthInformation : Object = syiro.player.GetPlayerLengthInfo(playerComponent); // Get information about the appropriate settings for the input range
                            playerMediaLengthInformation["value"] = "0";

                            for (var playerRangeAttribute in playerMediaLengthInformation){ // For each attribute defined in the playerRangeAttributes Object
                                playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]); // Set the attribute on the playerRange
                            }

                            syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);
                        }

                        // #endregion

                    }
                );

                // #endregion

                // #region Audio / Video Time Updating

                syiro.events.Add("timeupdate", innerContentElement, // Add an event listener to track timeupdate
                    function(){
                        // #region Player Component & Element Defining

                        var playerElement = arguments[0]; // Define the audio or video element as the Element being effected by timeupdate
                        var playerComponentElement = playerElement.parentElement; // Set the playerComponentElement as the parentElement of the innerContentElement (argument [0])
                        var playerComponent = syiro.component.FetchComponentObject(playerComponentElement); // Fetch the Player Component Object

                        // #endregion

                        if (syiro.data.Read(playerComponent["id"] + "->IsStreaming") == false){ // If the Player is NOT streaming content
                            // #region Player Control Component & Element Defining

                            var playerControlElement = playerComponentElement.querySelector('div[data-syiro-component="player-control"]'); // Fetch the Player Control Element
                            var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get the Component Object of the Player Control
                            var playerRange = playerControlElement.querySelector("input"); // Get the input range of the Player Control

                            // #endregion

                            var currentTime = playerElement.currentTime; // Get the currentTime
                            syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime); // Update the label

                            if (syiro.data.Read(playerComponent["id"] + "->IsChangingInputValue") == false){ // If the user is NOT using the input range to change volume or time
                                var roundedDownTime : number = Math.floor(currentTime);
                                playerRange.value = roundedDownTime; // Set the range input to roundedDownTime

                                var priorInputSpaceWidth : number = Math.round((roundedDownTime / Number(playerRange.max)) * playerRange.clientWidth); // Get the width of the empty space before the input range thumb by getting the currentTime, dividing by the max value and times the clientWidth

                                var updatedGradient : string = "linear-gradient(to right, " + syiro.primaryColor + " " + (priorInputSpaceWidth +2) + "px, ";

                                if (playerComponent["type"] == "audio-player"){ // If this is an Audio Player's Player Range
                                    updatedGradient += "transparent"; // Set to transparent background
                                }
                                else{ // IF this is a Video Player's Player Range
                                    updatedGradient += "white"; // Set to white background
                                }

                                updatedGradient += " 0px)"; // Ending of linear-gradient content
                                syiro.component.CSS(playerRange, "background", updatedGradient);
                            }
                        }
                    }
                );

                // #endregion

                // #region Audio / Video Time Ending

                syiro.events.Add("ended", innerContentElement, syiro.player.Reset.bind(this, component)); // Add ended event that triggers syiro.player.Reset with the bound component Object

                // #endregion

            // #endregion

            // #region Video Player Specific Functionality

            if (component["type"] == "video-player"){ // If this is a Video Player Component

                // #region Mouse Specific Functionality

                if (syiro.device.SupportsTouch == false){ // If the device uses a mouse instead of touch

                    // #region Video Player Mousenter / Mouseleave Handling

                    syiro.events.Add("mouseenter", componentElement, // Add a mouseenter event for the Video Player that shows the Video Player inner Player Control
                        function(){
                            var componentElement : Element = arguments[0]; // Get the componentElement passed as argument 0
                            var playerControlComponent : Object = syiro.component.FetchComponentObject(componentElement.querySelector('div[data-syiro-component="player-control"]')); // Fetch the Component Object of the Player Control
                            syiro.playercontrol.Toggle(playerControlComponent, true); // Show the control (send true, signifying to show as oppose to hide)
                        }
                    );

                    syiro.events.Add("mouseleave", componentElement, // Add a mouseleave event for the Video Player that hides the Video Player inner Player Control
                        function(){
                            var componentElement : Element = arguments[0]; // Get the componentElement passed as argument 0
                            var playerControlComponent : Object = syiro.component.FetchComponentObject(componentElement.querySelector('div[data-syiro-component="player-control"]')); // Fetch the Component Object of the Player Control
                            syiro.playercontrol.Toggle(playerControlComponent, false); // Hide the control (send false, signifying to hide as oppose to show)
                        }
                    );

                    // #endregion
                }

                // #endregion

                // #region Video Element Click / Tap Handling

                syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, // Add mouseup / touchup listeners to the innerContentElement
                    function(){
                        var innerContentElement : Element = arguments[0]; // Get the innerContentElement passed as argument 0

                        if (syiro.device.SupportsTouch !== true){ // If it was not touch that triggered the event
                            var playerComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement); // Fetch the Component Object of the innerContentElement's parentElement
                            syiro.player.PlayOrPause(playerComponent); // Play / pause the video
                        }
                        else{ // If it was touch that triggered the event
                            var playerControlComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement.querySelector('div[data-syiro-component="player-control"]')); // Fetch the Component Object of the innerContentElement's Player Control
                            syiro.playercontrol.Toggle(playerControlComponent); // Toggle the control
                        }
                    }
                );

                // #endregion

                // #region Video ContextMenu Prevention

                syiro.events.Add("contextmenu", innerContentElement,
                    function(){
                        var e : Event = arguments[1]; // Get the Mouse Event typically passed to the function
                        e.preventDefault();
                    }
                );

                // #endregion

                // #region Video Player Fullscreen Button Enabling

                var fullscreenButtonElement : Element = componentElement.querySelector('div[data-syiro-render-icon="fullscreen"]'); // Define fullscreenButtonElement as the fetched Fullscreen Button
                syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(fullscreenButtonElement), syiro.player.ToggleFullscreen.bind(this, component)); // Listen to up events on the fullscreen button

                // #endregion

            }

            // #endregion

            // #region Player Control Listeners

                // #region Play Button Listener

                var playButton : Element = playerControlArea.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button Element
                syiro.events.Add(syiro.events.eventStrings["up"], playButton, syiro.player.PlayOrPause.bind(this, component)); // Listen to up events on the playButton to the PlayOrPause (binding the component Object)

                // #endregion

                // #region Player Range Initialization

                var playerRange = playerControlArea.querySelector('input[type="range"]'); // Get the input range

                syiro.events.Add(syiro.events.eventStrings["down"], playerRange, // Add mousedown / touchstart events to the playerRange
                    function(){
                        var playerRangeElement : Element = arguments[0]; // Get the Player Range element passed
                        var playerComponent : Object = syiro.component.FetchComponentObject(playerRangeElement.parentElement.parentElement) // Define playerComponentElement as the player range's player control's parent and fetch the Component Object
                        syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", true); // Set the ChangingInputValue to true to infer we are changing the input value of the playerRange
                    }
                );

                syiro.events.Add(syiro.events.eventStrings["up"], playerRange, // Add mouseup / touchend events to the playerRange, which calls a function to indicate we are no longer changing the input value
                    function(){
                        var playerRange : HTMLInputElement = arguments[0]; // Define playerRangeElement as the Element passed to us
                        var playerComponent : Object = syiro.component.FetchComponentObject(playerRange.parentElement.parentElement); // Get the Component Object of the Player

                        if (syiro.data.Read(playerComponent["id"] + "->IsChangingVolume") !== true){ // If we are doing a time change and not a volume change
                            syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", false); // Since we not changing the volume, immediately set IsChangingInputValue to false
                        }
                    }
                );

                syiro.events.Add("input", playerRange, // Add input event to the playerRange, which updates either the time or volume whenever the input is changed
                    function(){
                        var playerRange : HTMLInputElement = arguments[0]; // Define playerRangeElement as the Element passed to us
                        var playerComponent : Object = syiro.component.FetchComponentObject(playerRange.parentElement.parentElement); // Get the Component Object of the Player

                        var valueNum : number = Number(playerRange.value); // Define valueNum as the converted string-to-number, where the value was the playerRange value

                        if (syiro.data.Read(playerComponent["id"] + "->IsChangingVolume") !== true){ // If we are doing a time change and not a volume change
                            syiro.player.SetTime(playerComponent, valueNum); // Set the Time
                        }
                        else{ // If we are doing a volume change
                            syiro.player.SetVolume(playerComponent, (valueNum / 100)); // Set the volume to value of the range, diving the number by 100 to get an int from 0.0 to 1.0.
                        }

                        var priorInputSpaceWidth : number = (valueNum / Number(playerRange.max)) * playerRange.clientWidth; // Get the width of the empty space before the input range thumb by getting the current value, dividing by the max value and times the clientWidth
                        syiro.component.CSS(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + " " + priorInputSpaceWidth + "px, white 0px)");
                    }
                );

                // #endregion

                // #region Volume Button Listener

                var volumeButtonElement = playerControlArea.querySelector('div[data-syiro-render-icon="volume"]'); // Get any existing volume button in this player

                if (volumeButtonElement !== null){ // If there is a volume button (there is no for iOS)
                    var volumeButtonComponent = syiro.component.FetchComponentObject(volumeButtonElement); // Get the Component Object of the Volume Button

                    syiro.events.Add(syiro.events.eventStrings["up"], volumeButtonElement,
                        function(){
                            var volumeButton : Element = arguments[0]; // Get the Volume Button Element

                            var playerElement : Element = volumeButton.parentElement.parentElement; // Get the outer parent Player
                            var playerComponent : Object = syiro.component.FetchComponentObject(playerElement); // Get the Player Component based on the playerElement
                            var playerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(playerComponent); // Fetch the inner audio or video tag

                            var playerRange : any = playerElement.querySelector("input"); // Get the Player Control Range
                            var playerRangeAttributes : Object= {}; // Set playerRangeAttributes as an empty Object to hold attribute information that we'll apply to the input range later

                            if (syiro.data.Read(playerComponent["id"] + "->IsChangingVolume") !== true){ // If we are NOT already actively doing a volume change
                                syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", true); // Set the IsChangingInputValue to true so the timeupdate won't change the value on us
                                syiro.data.Write(playerComponent["id"] + "->IsChangingVolume", true); // Set the IsChangingVolume to true so we don't end up changing the "location" in the content

                                volumeButton.setAttribute("active", "true"); // Set component active to true to imply it is active

                                var playerRangeValueFromVolume : string = (playerContentElement.volume * 100).toString();

                                playerRangeAttributes["max"] = "100"; // Set max to 100
                                playerRangeAttributes["step"] = "1"; // Set step to 1
                                playerRange.value = playerRangeValueFromVolume; // Set the value to the volume (which is 0.1 to 1.0) times 10

                                if (syiro.data.Read(playerComponent["id"] + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
                                    playerElement.querySelector('div[data-syiro-component="player-control"]').removeAttribute("data-syiro-component-streamstyling"); // Default to NOT having the Player Control "Stream Styling"
                                }
                            }
                            else{ // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
                                volumeButton.removeAttribute("active"); // Remove component-active to imply volume icon is not active

                                playerRangeAttributes = syiro.player.GetPlayerLengthInfo(playerComponent); // Get a returned Object with the max the input range should be, as well as a reasonable, pre-calculated amount of steps.
                                playerRange.value = playerContentElement.currentTime; // Set the playerRange value to the currentTime

                                if (syiro.data.Read(playerComponent["id"] + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
                                    playerElement.querySelector('div[data-syiro-component="player-control"]').setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"
                                }

                                syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", false); // Set the IsChangingInputValue to infer we are no longer changing the input value
                                syiro.data.Write(playerComponent["id"] + "->IsChangingVolume", false); // Set the IsChangingVolume to false to infer we are no longer changing the volume
                            }

                            for (var playerRangeAttribute in playerRangeAttributes){ // For each attribute defined in the playerRangeAttributes Object
                                playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]); // Set the attribute on the playerRange
                            }

                            var priorInputSpaceWidth : number = Math.round((Number(playerRange.value) / Number(playerRange.max)) * playerRange.clientWidth); // Get the width of the empty space before the input range thumb by getting the current value, dividing by the max value and times the clientWidth
                            syiro.component.CSS(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + "  " + priorInputSpaceWidth + "px, white 0px)");
                        }
                    );
                }

                // #endregion

                // #region Player Menu Dialog

                var menuButton = componentElement.querySelector('div[data-syiro-render-icon="menu"]'); // Get the menuButton if it exists

                if (menuButton !== null){ // If the menu button exists
                    syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(menuButton), syiro.player.ToggleMenuDialog.bind(this, component)); // Add an event listener to the button that calls ToggleMenuDialog, binding to the Player Component
                }

                // #endregion

                syiro.player.CheckIfStreamable(component); // Check if the content is streamable

            // #endregion

            // #region Audio Player Specific Code

            if (component["type"] == "audio-player"){ // If this is an Audio Player
                syiro.audioplayer.CenterInformation(component); // Center the potential audio information
            }
        }
    }

    // #endregion

    // #region Check if content is streamable and if so, change Player attributes

    export function CheckIfStreamable(component : Object) : void {
        var componentElement = syiro.component.Fetch(component); // Fetch the componentElement
        var playerControlElement  = componentElement.querySelector('div[data-syiro-component="player-control"]');
        var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get the Player Control Component
        var playerRange : Element = playerControlElement.querySelector('input[type="range"]'); // Get the input range

        // #region Live Streaming Detection and Player Range Configuration
        var isStreamable : boolean = false; // Declare isStreamable as a boolean variable as to whether or not the content is streamable

        if (syiro.data.Read(component["id"] + "->ForceLiveUX") !== true){ // If we are not forcing live UX
            var contentSources : Array<Object> = syiro.player.FetchSources(component); // Get the contentSources

            for (var contentSourceIndex in contentSources){ // For each content source in contentSources
                var contentSource : string = contentSources[contentSourceIndex]["src"];
                var sourceExtension = contentSource.substr(contentSource.lastIndexOf(".")).replace(".", ""); // Get the last index of ., get the substring based on that, and then remove the period on the extension.

                if ((sourceExtension == "m3u8") || (sourceExtension == "mpd")){ // If the source ends in m3u8 (RTMP, RTSP, etc.) or mpd (MPEG-DASH), then we are streaming content
                    isStreamable = true; // Define isStreamable as true
                    break; // Break out of the for loop
                }
            }
        }
        else{ // If we are forcing live UX
            isStreamable = true; // Set isStreamable to true
        }

        if (isStreamable == true){ // If the content IS streamable
            syiro.data.Write(component["id"] + "->IsStreaming", true); // Declare that we are streaming by recording it in the Syiro Data System
            playerControlElement.setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"

            if (playerControlElement.querySelector("time") !== null){ // If there is a time Element
                playerControlElement.querySelector("time").setAttribute("data-syiro-component-live", ""); // Use "Live" View of Time Label
                playerControlElement.querySelector("time").textContent = "Live"; // Set the time label to "Live"
            }
        }
        else { // If the content is NOT streamable
            syiro.data.Write(component["id"] + "->IsStreaming", false); // Declare that we are NOT streaming by recording it in the Syiro Data System
            playerControlElement.removeAttribute("data-syiro-component-streamstyling"); // Remove Stream Styling if it exists in the Player Control

            if (playerControlElement.querySelector("time") !== null){ // If there is a time Element
                playerControlElement.querySelector("time").removeAttribute("data-syiro-component-live"); // Remove the "Live" View of Time Label
                playerControlElement.querySelector("time").textContent = "00:00"; // Set the time label to "00:00"
            }
        }

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

        if ((isNaN(contentDuration) == false) && (isFinite(contentDuration))){ // If we are able to properly fetch the duration and we are not streaming
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
        else if (isNaN(contentDuration)){ // If the contentDuration is unknown
            playerLengthInfo["max"] = "Unknown"; // Set max to unknown
            playerLengthInfo["step"] = 1; // Set step value to 1 second
        }
        else if (isFinite(contentDuration) == false){ // If we are streaming content
            playerLengthInfo["max"] = "Streaming"; // Set max to Streaming
            playerLengthInfo["step"] = 1; // Set step value to 1 second
        }

        return playerLengthInfo; // Return the playerLengthInfo Object
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

    export function PlayOrPause(component : Object, playButtonObjectOrElement ?: any) {
        var allowPlaying : boolean = false; // Define allowPlaying as a boolean as to whether we should allow playing or not. Defaults to false, set to true if we might be able to play the source(s)

        var playerComponentElement = syiro.component.Fetch(component); // Get the Component Element of the Player
        var innerContentElement = syiro.player.FetchInnerContentElement(component); // Get the inner audio or video Element

        if (syiro.data.Read(component["id"] + "->ExternalLibrary") !== true){ // If an external library is not being used to tie into Syiro Players, check for codec support
            var playerSources : Array<Object> = syiro.player.FetchSources(component); // Fetch the sources from the innerContentElement

            for (var playerSourceIndex in playerSources){ // For each source in playerSources
                if (innerContentElement.canPlayType(playerSources[playerSourceIndex]["type"]) !== ""){ // If we do not get an empty string returned, meaning we may be able to play the content
                    allowPlaying = true; // Set allowPlaying to true
                }
            }
        }
        else{ // If an external library is being used, assume it will make the content playable (else, what is the point in having the library?)
            allowPlaying = true; // Set allowPlaying to true
        }

        if (allowPlaying == true){ // If the content is able to be played
			var playButton : Element; // Define playButton as an Element

            if (component["type"] == "video-player"){ // If this is a Video Player
                playerComponentElement.setAttribute("data-syiro-show-video", "true"); // Set attribute of data-syiro-show-video to true, indicating to no longer hide the innerContentElement
            }

            if (typeof playButtonObjectOrElement == "undefined"){ // If the playButtonObjectOrElement is undefined
				playButton = playerComponentElement.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button Element
			}
			else if (syiro.component.IsComponentObject(playButtonObjectOrElement) == false){ // If what was passed is not a Component Object
				playButton = playButtonObjectOrElement; // Define the playButton as the playButtonComponentObject passed
            }
			else { // If what was passed is a Component Object
				playButton = syiro.component.Fetch(playButtonObjectOrElement); // Fetch the playButton
			}

            if (innerContentElement.paused !== true){ // If the audio or video Element is playing
                innerContentElement.pause(); // Pause the audio or video Element
                playButton.removeAttribute("active"); // Remove the active attribute if it exists, since it is used to imply play / pause iconography
            }
            else{ // If the audio or video Element is paused
                innerContentElement.play(); // Play the audio or video Element
                playButton.setAttribute("active", "pause"); // Set the active attribute to "pause" to indicate using the pause icon
            }
        }
        else{ // If the content can not be played
            var codecErrorElement = syiro.utilities.ElementCreator("div", // Create a div to add to the player stating there is a codec error
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
        var sourceTags : any = innerContentElement.getElementsByTagName("source"); // Get all source tags within the innerContentElement
        var sourcesArray : Array<Object> = []; // Define sourcesArray as an empty Array to hold source information

        for (var sourceElementIndex = 0; sourceElementIndex < sourceTags.length; sourceElementIndex++){ // For each source Element in the sourceTags
            var sourceElement : any = sourceTags.item(sourceElementIndex); // Get the individual source Element

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

            if (type == "video"){ // If we are dealing with video
                if (source.substr(-1) !== ";"){ // If the source does not end with a semi-colon, common to prevent Shoutcast browser detection
                    var streamingProtocol : string = source.substr(0, source.indexOf(":")); // Get the streaming protocol (rtsp, rtmp, hls) by creating a substring, starting at 0 and ended at the protocol end mark (://)

                    if ((streamingProtocol == "rtsp") || (streamingProtocol == "rtmp")){ // If we are working strictly with a streaming protocol and not normal HTTP (or HLS)
                        sourceTagAttributes["type"] = streamingProtocol + "/" + sourceExtension; // Define the type as streaming protocol + sourceExtension, like rtmp/mp4
                    }
                    else{ // If we are not dealing with a streaming protocol (or are but in the form of HLS)
                        if (sourceExtension == "m3u8"){ // If we are dealing with a playlist m3u8 (live streaming)
                            sourceTagAttributes["type"] = "application/x-mpegurl"; // Set the type to a valid mpegurl type which is accepted by Android, iOS, etc.
                        }
                        else{
                            if (sourceExtension == "mov"){ // IF the source extension is MOV
                                sourceExtension = "quicktime"; // Change sourceExtension to quicktime to enable easier type setting
                            }

                            sourceTagAttributes["type"] = type + "/" + sourceExtension; // Append sourceExtension to the type
                        }
                    }
                }
            }

            var sourceTag = syiro.utilities.ElementCreator("source", sourceTagAttributes); // Create a source tag with the attributes we've applied

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

        if (syiro.data.Read(component["id"] + "->NoUX") == false){ // If this player has UX
            if (component["type"] == "video-player"){ // If this is a Video Player
                playerElement.removeAttribute("data-syiro-show-video"); // Remove data-syiro-show-video attribute so the video Element is now hidden
            }
            // #region Button Attribute Resetting

            var playButton = playerControl.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button from the Player Control
            syiro.component.CSS(playButton, "background-image", ""); // Remove the background-image style / reset to play image for Play Button
            playButton.removeAttribute("active"); // Remove component-status to imply play icon is not active (in this case, paused)

            var volumeControl = playerControl.querySelector('div[data-syiro-render-icon="volume"]'); // Get the Volume Button from the Player Control

            if (volumeControl !== null){ // If there is a volume control (there is not on iOS)
                volumeControl.removeAttribute("active"); // Remove component-status to imply volume icon is not active
            }

            // #endregion

            var playerErrorNotice : HTMLElement = playerElement.querySelector('div[data-syiro-minor-component="player-error"]'); // Define playerErrorNotice as any error notice on this Player

            if (playerErrorNotice !== null){ // If the Player Error dialog exists
                playerElement.removeChild(playerErrorNotice); // Remove the Player Error dialog
            }
        }

        syiro.data.Write(component["id"] + "->IsChangingInputValue", false); // Set IsChangingInputValue for this Component to false
        syiro.data.Write(component["id"] + "->IsChangingVolume", false); // Set IsChangingVolume for this Component to false

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
        playerInnerContentElement.innerHTML = ""; // Remove all inner source tags from the InnerContentElement (audio or video tag) by resetting the innerHTML

        for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
            playerInnerContentElement.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
        }

        playerInnerContentElement.src = sources[0]; // Set the initial src of the audio or video player to the first source provided
        syiro.player.CheckIfStreamable(component); // Check if the content is streamable
    }

    // #endregion

    // #region Set Time - Function for easily setting the time location of an Audio or Video Player Component

    export function SetTime(component : Object, time : number){
        var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
        var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player

        if (playerInnerContentElement.currentTime !== time){ // If we are not setting the time to what it already is (for instance 0, which would cause an InvalidStateError)
            playerInnerContentElement.currentTime = time; // Set the playerInnerContentElement's currentTime to the time provided

            if (syiro.data.Read(component["id"] + "->NoUX") == false){ // If the player has a UX
                playerElement.querySelector('input[type="range"]').value = Math.floor(time); // Set the range input to the currentTime (rounded down)
                syiro.playercontrol.TimeLabelUpdater(syiro.component.FetchComponentObject(playerElement.querySelector('div[data-syiro-component="player-control"]')), 0, time); // Update the label
            }
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

    // #region Toggle Fullscreen

    export function ToggleFullscreen(...args : any[]){
        var videoPlayerComponent : Object; // Define videoPlayerComponent as the Video Player Component Object
        var videoPlayerElement : Element; // Define videoPlayerElement as the Video Player Element

        if (arguments[0]["type"] == "video-player"){ // If the Component passed is the Video Player
            videoPlayerComponent = arguments[0]; // Define videoPlayerComponent as the first argument
            videoPlayerElement = syiro.component.Fetch(videoPlayerComponent); // Define videoPlayerElement as the fetched Element of the Video Player
        }
        else{ // If the type is a Button
            var fullscreenButtonComponent = arguments[0]; // Define fullscreenButtonComponent as the first argument
            var fullscreenButtonElement : Element = syiro.component.Fetch(fullscreenButtonComponent); // Define fullscreenButtonElement as the fetched fullscreen button Element

            videoPlayerElement = fullscreenButtonElement.parentElement.parentElement; // Define videoPlayerElement as the parentElement's parentElement of the Button (parentElement of the Player Control)
            videoPlayerComponent = syiro.component.FetchComponentObject(videoPlayerElement); // Define videoPlayerComponent as the fetched Video Player Component Object
        }

        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement){ // If we are currently NOT fullscreen
            if (typeof videoPlayerElement.requestFullscreen !== "undefined"){ // If requestFullscreen is a valid function of componentElement
                videoPlayerElement.requestFullscreen(); // Define fullscreenAction as requestFullscreen
            }
            else if (typeof videoPlayerElement.msRequestFullscreen !== "undefined"){ // If msRequestFullscreen (IE API call for Fullscreen) is a valid function of componentElement
                videoPlayerElement.msRequestFullscreen(); // Define fullscreenAction as msRequestFullscreen
            }
            else if (typeof videoPlayerElement.mozRequestFullScreen !== "undefined"){ // If mozRequestFullScreen (Gecko API call for Fullscreen) is a valid function of componentElement
                videoPlayerElement.mozRequestFullScreen(); // Define fullscreenAction as mozRequestFullScreen
            }
            else if (typeof videoPlayerElement.webkitRequestFullscreen !== "undefined"){ // If webkitRequestFullscreen (Blink / Webkit call for Fullscreen) is a valid function of componentElement
                videoPlayerElement.webkitRequestFullscreen(); // Define fullscreenAction as webkitRequestFullscreen
            }
        }
        else{ // If we are currently fullscreen
            if (typeof document.exitFullscreen !== "undefined"){ // If exitFullscreen is a valid function of document
                document.exitFullscreen(); // Define fullscreenAction as exitFullscreen
            }
            else if (typeof document.msExitFullscreen !== "undefined"){ // If msExitFullscreen (IE API call for exiting Fullscreen) is a valid function of document
                document.msExitFullscreen(); // Define fullscreenAction as msExitFullscreen
            }
            else if (typeof document.mozCancelFullScreen !== "undefined"){ // If mozCancelFullScreen (Gecko API call for exiting Fullscreen) is a valid function of document
                document.mozCancelFullScreen(); // Define fullscreenAction as mozCancelFullScreen
            }
            else if (typeof document.webkitExitFullscreen !== "undefined"){ // If webkitExitFullscreen (Blink / Webkit call for exiting Fullscreen) is a valid function of document
                document.webkitExitFullscreen(); // Define fullscreenAction as webkitExitFullscreen
            }
        }
    }

    // #endregion

    // #region Toggle Menu Dialog

    export function ToggleMenuDialog(component : Object){
        var component : Object = arguments[0]; // Define the Player Component Object as the first argument
        var componentElement : Element = syiro.component.Fetch(component); // Fetch the Player Element

        var menuDialog : Element = componentElement.querySelector('div[data-syiro-minor-component="player-menu"]'); // Get the Menu Dialog
        var menuButton : Element = componentElement.querySelector('div[data-syiro-render-icon="menu"]'); // Get the menu button element

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

            menuButton.setAttribute("active", "true"); // Set the menu button active to true
            syiro.component.CSS(menuDialog, "visibility", "visible"); // Show the menu dialog
        }
        else{ // If the Menu dialog currently IS showing
            menuButton.removeAttribute("active"); // Remove the menu button active status
            syiro.component.CSS(menuDialog, "visibility", ""); // Hide the menu dialog (removing the visibility attribute, putting the Menu Dialog back to default state)
            syiro.component.CSS(menuDialog, "height", ""); // Remove the height attribute from the Player Menu Dialog
            syiro.component.CSS(menuDialog, "width", ""); // Remove the width attribute from the Player Menu Dialog
        }
    }

    // #endregion
}

// #endregion

// #region Syiro Player Controls Component

namespace syiro.playercontrol {

    // #region Player Control Generator

    export function New(properties : Object) : Object {
        var componentId : string = syiro.component.IdGen("player-control"); // Generate an ID for the Player Control
        var componentElement = syiro.utilities.ElementCreator("div",  { "data-syiro-component" : "player-control", "data-syiro-component-id" : componentId }); // Generate the basic playerControl container

        var playButton = syiro.button.New( { "data-syiro-render-icon" : "play" } ); // Create a play button
        var inputRange : HTMLElement = syiro.utilities.ElementCreator("input", { "type" : "range", "value" : "0"} ); // Create an input range

        componentElement.appendChild(inputRange); // Append the input range
        componentElement.appendChild(syiro.component.Fetch(playButton)); // Append the play button

        if (typeof properties["generate-content-info"] !== "undefined"){ // If we are adding content (for Audio Player)
            var infoSection : HTMLElement = document.createElement("section"); // Generate a section Element
            infoSection.appendChild(syiro.utilities.ElementCreator("b", { "content" : properties["title"]})); // Create the Audio b tag and append it to the infoSection section
            infoSection.appendChild(syiro.utilities.ElementCreator("label", { "content" : properties["artist"]})); // Create the Artist label and append it to the infoSection section
            componentElement.appendChild(infoSection); // Append the info section
        }
        else{ // If we are not generating content info
            if (properties["is-video-player"]){ // If we are generated a Player Control for a Video Player
                var timeStamp : HTMLElement = syiro.utilities.ElementCreator("time", { "content" : "00:00 / 00:00"} ); // Create a timestamp time element
                componentElement.appendChild(timeStamp); // Append the timestamp time element
            }
        }


        // #region Player Menu Element Creation (If Applicable)

        if (properties["menu"] !== undefined){ // If the menu attribute is defined
            if (properties["menu"]["type"] == "list"){ // If the component provided is a List
                var menuButton = syiro.button.New( { "data-syiro-render-icon" : "menu"} ); // Generate a Menu Button
                componentElement.appendChild(syiro.component.Fetch(menuButton)); // Append the menuButton to the playerControlElement
            }
        }

        // #endregion

        // #region Video Player - Additional Functionality Adding

        if (typeof properties["is-video-player"] !== "undefined"){ // If the properties passed has "is-video-player"
            var fullscreenButton = syiro.button.New( { "data-syiro-render-icon" : "fullscreen"} ); // Create a fullscreen button
            componentElement.appendChild(syiro.component.Fetch(fullscreenButton)); // Append the fullscreen control
        }

        // #endregion

        if (syiro.device.OperatingSystem !== "iOS"){ // As iOS does not allow manual control of volume (it has to be done with hardware controls), check if the OS is NOT iOS before volume button generation
            var volumeButton = syiro.button.New( { "data-syiro-render-icon" : "volume" } ); // Generate a Volume Button
            componentElement.appendChild(syiro.component.Fetch(volumeButton)); // Append the volume control
        }

        syiro.data.Write(componentId + "->HTMLElement", componentElement); // Store the Component HTMLElement of the Player Control
        return { "id" : componentId, "type" : "player-control" }; // Return a Component Object
    }

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

    // #endregion

    // #region Player Time Label Updating

    export function TimeLabelUpdater(component : Object, timePart : number, value : any){
        var playerControlElement : HTMLElement = syiro.component.Fetch(component); // Get the Player Control's Element
        var playerTimeElement = playerControlElement.querySelector("time"); // Get the time Element

        if (playerTimeElement !== null){ // If the time Element exists
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
    }

    // #endregion

    // #region Toggle Player Control

    export function Toggle(component : Object, forceShow ?: boolean){
        var playerControlElement : Element = syiro.component.Fetch(component); // Fetch the Syiro Player Control Component Element
        var currentAnimationStored : any = null; // Define currentAnimationStored initially as null. We will define it as the current animation if it has one

        if (playerControlElement.hasAttribute("data-syiro-animation")){ // If the Player Control Element has an animation attribute
            currentAnimationStored = playerControlElement.getAttribute("data-syiro-animation"); // Get the current animation stored in "data-syiro-animation"
        }

        if (forceShow == true){ // If we are forcing to show the Player Control
            syiro.animation.FadeIn(component); // Fade in the Player Control
        }
        else if (forceShow == false){ // If we are forcing to hide the Player Control
            syiro.animation.FadeOut(component); // Fade out the Player Control
        }
        else if (typeof forceShow == "undefined"){ // If the forceShow is not defined
            if ((currentAnimationStored == "fade-out") || (playerControlElement.hasAttribute("data-syiro-animation") == false)){ // If the current status is the Player Control is faded out OR the Player Control does not have the animation attribute
                syiro.animation.FadeIn(component); // Fade in the Player Control
            }
            else{ // If the current status is the Player Control is faded in (showing)
                syiro.animation.FadeOut(component); // Fade out the Player Control
            }
        }
    }

    // #endregion
}

// #endregion

// #region Audio Player Component

namespace syiro.audioplayer {

    // #region Audio Player Generator

    export function New(properties : Object) : Object { // Generate a Audio Player Component and return a Component Object
        if (properties["sources"] !== undefined){ // If the audio property is defined
            var componentId : string = syiro.component.IdGen("audio-player"); // Generate a component Id
            var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "audio-player", "data-syiro-component-id" : componentId, "id" : componentId, "name" : componentId });

            if (typeof properties["share"] !== "undefined"){ // If the "share" menu attribute is still being used
                properties["menu"] = properties["share"]; // Set "menu" attribute equal to "share" attribute
            }

            // #region Audio Element and Source Creation

            var audioPlayer : HTMLMediaElement = syiro.utilities.ElementCreator("audio", { "preload" : "metadata", "volume" : "0.5" }); // Generate an audio Element with only preloading metadata, setting volume to 50%
            audioPlayer.autoplay = false; // Set autoplay of audio to false

            var arrayofSourceElements : Array<HTMLElement> = syiro.player.GenerateSources("audio", properties["sources"]); // Get an array of Source Elements

            for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
                audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
            }

            // #endregion

            componentElement.appendChild(audioPlayer); // Append the audio player

            // #region Audio Player Album Art

            if (typeof properties["art"] !== "undefined"){
                syiro.component.CSS(componentElement, "background-image", 'url("' + properties["art"] + '")'); // Set it as the background image of the audio player
            }
            else{ // If art has not been defined
                componentElement.setAttribute("data-syiro-audio-player", "mini"); // Set to "mini" player
                delete properties["menu"]; // Disable a menu option
            }

            // #endregion

            // #region Audio Player - Content Information Filtering

             if ((typeof properties["title"] !== "undefined") && (typeof properties["artist"] !== "undefined")){ // If the properties has the artist information and audio file title defined
                properties["generate-content-info"] = true; // Set "generate-info" to true since we will pass that to the playercontrol generator
            }
            else { // If it has neither or one
                delete properties["title"]; // Delete title from properties (if it exists)
                delete properties["artist"]; // Delete artist from properties (if it exists)
            }

            // #endregion

            if (properties["width"] == undefined){ // If the width attribute is not defined
                properties["width"] = 400; // Set width property to 400, which we'll pass to the Player Control Generation
            }

            syiro.component.CSS(componentElement, "width", properties["width"].toString() + "px"); // Set the width of the Audio Player Component Element

            var playerControlComponent : Object = syiro.playercontrol.New(properties);
            var playerControlElement : Element = syiro.component.Fetch(playerControlComponent); // Fetch the HTMLElement

            // #region Player Menu Element Creation (If Applicable)

            if (properties["menu"] !== undefined){ // If the menu attribute is defined
                if (properties["menu"]["type"] == "list"){ // If the component provided is a List
                    var playerMenuDialog : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "player-menu" } ); // Create a div element with the minor-component of player-menu
                    playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content" : "Menu" })); // Create a label with the content "Menu"
                    playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"])); // Append the List Element to the playerMenuDialog
                    componentElement.insertBefore(playerMenuDialog, componentElement.firstChild); // Prepend the Menu Dialog
                }
            }

            // #endregion

            componentElement.appendChild(playerControlElement); // Append the player control

            // #region Third-Party Streaming Support
            // This section will determine if we are using a third-party library for live streaming support (like dashjs)

            var usingExternalLibrary = false; // Declare a variable that we'll use to determine if we are using an external library and tying that into Syiro Player

            if ((typeof properties["UsingExternalLibrary"] !== "undefined")&& (properties["UsingExternalLibrary"] == true)){ // If an external library is going to be tying into the Syiro Video Player
                usingExternalLibrary = true;
            }

            // #endregion

            syiro.data.Write(componentId, // Store the Audio Player Component Element Details we generated
                {
                    "ExternalLibrary" : usingExternalLibrary, // Define whether we are using an external library with the player or not
                    "HTMLElement" : componentElement, // Set the HTMLElement to the componentElement
                    "scaling" : { // Create a scaling details Object
                        "initialDimensions" : [150, properties["width"]], // Set the initialDimensions to 150px height and width as properties[width]
                        "ratio" : [0,0] // Do not scale (unless forced)
                    }
                }
            );

            return { "id" : componentId, "type" : "audio-player" }; // Return a Component Object
        }
        else{ // If audio is not defined in the properties
            return { "error" : "no sources defined" }; // Return an error Object
        }

    }

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

    // #endregion

    // #region Audio Information Center

    export function CenterInformation(component : Object){
        var componentElement : Element = syiro.component.Fetch(component); // Fetch the Element
        var playerControlElement : Element = componentElement.querySelector('div[data-syiro-component="player-control"]'); // Get the Player Control Element
        var audioInformation : Element = playerControlElement.querySelector("section"); // Audio Information section (if it exists)

        if (audioInformation !== null){ // If the audioInformation is a section within the Player Control
            var audioInformationWidth : number = ((componentElement.clientWidth / 2) - (audioInformation.clientWidth / 2) - 40); // Set audioInformationWidth to half width of Audio Player minus half width of audio Information, offset by -40
            syiro.component.CSS(audioInformation, "margin-left", audioInformationWidth.toString() + "px"); // Set the margin-left of the audioInformationWidth
        }
    }

    // #endregion

}

// #endregion

// #region Video Player Component

namespace syiro.videoplayer {

    // #region Video Player Generator

    export function New(properties : Object) : Object { // Generate a Video Player Component and return a Component Object
        if (properties["sources"] !== undefined){ // If the video property is defined
            var componentId : string = syiro.component.IdGen("video-player"); // Generate a component Id
            var syiroComponentData : Object = { "scaling" : {}}; // Define syiroComponentData as an Object to hold data we'll be writing to the Syiro Data System
            var syiroVideoElementProperties : Object = { "preload" : "metadata", "UIWebView" : "allowsInlineMediaPlayback"}; // Define syiroVideoElementProperties as a core set of properties we need for the Video Element

            var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "video-player", "data-syiro-component-id" : componentId, "id" : componentId, "name" : componentId }); // Generate a Video Player

            if (navigator.userAgent.indexOf("iPhone") == -1) { // If the browser is NOT an iPhone, generate a proper Video Player Component
                syiroVideoElementProperties["volume"] = "0.5"; // Set volume to 0.5

                // #region Video Art

                if (typeof properties["art"] !== "undefined"){ // If art has been defined
                    syiro.component.CSS(componentElement, "background-image", 'url("' + properties["art"] + '")'); // Set the background-image of the main Video container to be the provided art
                }

                // #endregion

                // #region Player Menu Element Creation (If Applicable)

                if (properties["menu"] !== undefined){ // If the menu attribute is defined
                    if (properties["menu"]["type"] == "list"){ // If the component provided is a List
                        var playerMenuDialog : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "player-menu" } ); // Create a div element with the minor-component of player-menu
                        playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content" : "Menu" })); // Create a label with the content "Menu"
                        playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"])); // Append the List Element to the playerMenuDialog
                        componentElement.insertBefore(playerMenuDialog, componentElement.firstChild); // Prepend the Menu Dialog
                    }
                }

                // #endregion

                // #region Player Control Creation

                properties["is-video-player"] = true; // Add "is-video-player" key before calling playercontrol Generate so it'll generate the fullscreen button
                var playerControlComponent : Object = syiro.playercontrol.New(properties);
                componentElement.appendChild(syiro.component.Fetch(playerControlComponent)); // Fetch the HTMLElement and append the player control

                // #endregion

                // #region Force Live User Interface
                // This section will determine if we should force the live UX to be applied to the content

                if ((typeof properties["ForceLiveUX"] !== "undefined") && (properties["ForceLiveUX"] == true)){ // If Force Live UX is defined as true
                    syiroComponentData["ForceLiveUX"] = true; // Define the syiroComponentData ForceLiveUX as true
                }

                // #endregion
            }
            else{ // If the device IS an iPhone
                syiroComponentData["NoUX"] = true; // Define NoUX as true so we know to simplify player initialization

                if (typeof properties["art"] !== "undefined"){ // If art has been defined
                    syiroVideoElementProperties["poster"] = properties["art"]; // Define the poster property of the Video Element to be the art
                }

                syiroVideoElementProperties["controls"] = "controls"; // Use the build-in iOS controls
            }

            // #region Video Element and Sources Creation

            var videoPlayer : HTMLMediaElement = syiro.utilities.ElementCreator("video", syiroVideoElementProperties); // Create the video player with the defined properties

            videoPlayer.autoplay = false; // Set autoplay of video to false

            var arrayofSourceElements : Array<HTMLElement> = syiro.player.GenerateSources("video", properties["sources"]); // Get an array of Source Elements

            for (var sourceElementKey in arrayofSourceElements){ // For each sourceElement in arrayofSourceElements
                videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]); // Append the HTMLElement
            }

            componentElement.insertBefore(videoPlayer, componentElement.lastChild); // Append the video player

            syiroComponentData["HTMLElement"] = componentElement; // Define the HTMLElement in syiroComponentData as the componentElement

            // #endregion

            // #region Scaling Check

            if (typeof properties["ratio"] !== "undefined"){ // If ratio is defined
                syiroComponentData["scaling"]["ratio"] = properties["ratio"]; // Define the ratio properties in syiroComponentData->scaling as the provided ratio property
                syiroComponentData["scaling"]["initialDimensions"] = [properties["height"], properties["width"]]; // Define initialDimensions as [height, width]
            }
            else if (typeof properties["fill"] !== "undefined"){ // If fill is defined
                syiroComponentData["scaling"]["fill"] = properties["fill"]; // Define the fill properties in syiroComponentData->scaling as the provided fill property
            }
            else{ // If neither ratio nor fill are defined
                syiroComponentData["scaling"]["initialDimensions"] = [properties["height"], properties["width"]]; // Define initialDimensions as [height, width]
            }

            // #endregion

            // #region Third-Party Streaming Support
            // This section will determine if we are using a third-party library for live streaming support (like dashjs)

            var usingExternalLibrary = false; // Declare a variable that we'll use to determine if we are using an external library and tying that into Syiro Player

            if ((typeof properties["UsingExternalLibrary"] !== "undefined") && (properties["UsingExternalLibrary"] == true)){ // If an external library is going to be tying into the Syiro Video Player
                usingExternalLibrary = true;
            }

            // #endregion

            syiro.data.Write(componentId, syiroComponentData); // Write the syiroComponentData of this Video Player to Syiro's Data System
            return { "id" : componentId, "type" : "video-player" }; // Return a Component Object
        }
        else{ // If video is not defined in the properties
            return { "error" : "no video defined" }; // Return an error Object
        }
    }

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

    // #endregion

}

// #endregion
