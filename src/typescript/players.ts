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

	// #region DurationChange - Triggered on durationchange of innerContentElement

	export function DurationChange(){
		var playerComponent = arguments[0]; // Define playerComponent as the first argument since it is bound during Init

        if (syiro.data.Read(playerComponent["id"] + "->IsStreaming") == false){ // If the Player is NOT streaming content
			var componentElement = syiro.component.Fetch(playerComponent); // Fetch the Player Element
        	var playerControlElement  = componentElement.querySelector('div[data-syiro-component="player-control"]');
        	var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get the Player Control Component
        	var playerRange : Element = playerControlElement.querySelector('input[type="range"]'); // Get the input range

            var playerMediaLengthInformation : Object = syiro.player.GetPlayerLengthInfo(playerComponent); // Get information about the appropriate settings for the input range
            playerMediaLengthInformation["value"] = "0";

            for (var playerRangeAttribute in playerMediaLengthInformation){ // For each attribute defined in the playerRangeAttributes Object
                playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]); // Set the attribute on the playerRange
            }

            syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);
        }

        // #endregion
	}

	// #endregion

	// #region Tick - Triggered on timeupdate for innerContentElement

	export function Tick(){
        // #region Player Component & Element Defining

		var playerComponent = arguments[0]; // Define playerComponent as the first argument since it is bound during Init
		var componentElement = syiro.component.Fetch(playerComponent); // Fetch the Player Element
		var innerContentElement = arguments[1]; // Define innerContentElement as the second argument since it is what the event is actually bound to

        // #endregion

		if (syiro.data.Read(playerComponent["id"] + "->IsStreaming") == false){ // If the Player is NOT streaming content
			// #region Player Control Component & Element Defining

			var playerControlElement = componentElement.querySelector('div[data-syiro-component="player-control"]'); // Fetch the Player Control Element
			var playerControlComponent : Object = syiro.component.FetchComponentObject(playerControlElement); // Get the Component Object of the Player Control
			var playerRange = playerControlElement.querySelector("input"); // Get the input range of the Player Control

			// #endregion

			var currentTime = innerContentElement.currentTime; // Get the currentTime of innerContentElement
			syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime); // Update the label

			if (syiro.data.Read(playerComponent["id"] + "->IsChangingInputValue") == false){ // If the user is NOT using the input range to change volume or time
				var roundedDownTime : number = Math.floor(currentTime);
				playerRange.value = roundedDownTime; // Set the range input to roundedDownTime

				var priorInputSpaceWidth : number = Math.round((roundedDownTime / Number(playerRange.max)) * playerRange.clientWidth); // Get the width of the empty space before the input range thumb by getting the currentTime, dividing by the max value and times the clientWidth

				var updatedGradient : string = "(to right, " + syiro.primaryColor + " " + (priorInputSpaceWidth +2) + "px, "; // Define updatedGradient as the information we'd apply to linear-gradient and -webkit-linear-gradient

				if (playerComponent["type"] == "audio-player"){ // If this is an Audio Player's Player Range
					updatedGradient += "transparent"; // Set to transparent background
				}
				else{ // IF this is a Video Player's Player Range
					updatedGradient += "white"; // Set to white background
				}

				updatedGradient += " 0px)"; // Ending of linear-gradient content
				syiro.component.CSS(playerRange, "background", "linear-gradient" + updatedGradient + ", -webkit-linear-gradient" + updatedGradient); // Set background to both linear-gradient and -webkit-linear-gradient
			}
		}
	}

	// #endregion

    // #region Fetch Internal Audio or Video Element of Player container Component

    export function FetchInnerContentElement(component : Object) : HTMLMediaElement {
        var componentElement = syiro.component.Fetch(component); // Get the Player Component
        return componentElement.querySelector(component["type"].replace("-player", "")); // Return the Element fetched from querySelector (audio or video)
    }

    // #endregion

    // #region Fetch Audio or Video Element Sources

	export function FetchSources(component : Object) : Array<Object> { // Return an array of source types (string)
		var innerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Fetch the inner audio or video Element from the Audio Player or Video Player Component
		var sourceTags : any = innerContentElement.getElementsByTagName("source"); // Get all source tags within the innerContentElement
		var sourcesArray : Array<Object> = []; // Define sourcesArray as an empty Array to hold source information

		for (var sourceElementIndex = 0; sourceElementIndex < sourceTags.length; sourceElementIndex++){ // For each source Element in the sourceTags
			var sourceElement : any = sourceTags.item(sourceElementIndex); // Get the individual source Element

			if (typeof sourceElement !== "undefined"){
				sourcesArray.push({
					"src" : sourceElement.getAttribute("src"), // Get the "src" attribute from the sourceElement
					"type" : sourceElement.getAttribute("type") // Get the "type" attribute from the sourceElement, which should have information like "video/webm"
				});
			}
		}

		return sourcesArray;
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
            else{ // If the video is greater than 15 minutes
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

	// #region Fetch information about whether content in player is playable

	export function IsPlayable(component : Object) : boolean {
		var componentElement : Element = syiro.component.Fetch(component); // Define componentElement as the fetched Element of the Component
		var innerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Fetch the inner content Element
		var playerErrorNotice : Element = componentElement.querySelector('div[data-syiro-minor-component="player-error"]'); // Define playerErrorNotice as any error notice on this Player

		var isPlayable : boolean = false; // Set isPlayable as a boolean default to false
		var isStreamable : boolean = syiro.player.IsStreamable(component); // Set isStreamable as the returned boolean

		if (syiro.data.Read(component["id"] + "->UsingExternalLibrary")){ // If we are using an external library
			isPlayable = true; // Set to being playable by default
		}
		else{ // If we are not using an external library
			var sourceElementsInfo : Array<Object> = syiro.player.FetchSources(component); // Define sourceElementsInfo as the fetched objects containing the information from the sources

			for (var sourceElementInfo of sourceElementsInfo){ // For each source in playerSources
				if (innerContentElement.canPlayType(sourceElementInfo["type"]) !== ""){ // If we do not get an empty string returned, meaning we may be able to play the content
					isPlayable = true; // Set isPlayable to true
				}
			}
		}

		if (syiro.data.Read(component["id"] + "->NoUX") == false){ // If this player has UX
			if (isPlayable || isStreamable){ // If the content is playable
				syiro.component.CSS(playerErrorNotice, "visibility", ""); // Remove the playerErrorNotice visibility styling if it exists (it defaults to hidden)
			}
			else{ // If the content is not playable
				syiro.component.CSS(playerErrorNotice, "visibility", "visible"); // Set the playerErrorNotice visibility styling to visible
			}
		}

		return isPlayable;
	}

	// #region Get Information about if the Player is playing

	export function IsPlaying(component : Object) : boolean {
		var componentElement = syiro.component.Fetch(component); // Fetch the Player Element
		var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused; // Get the value of paused on the Player (opposite of what we will return)

		return !isPaused; // Return the opposite boolean value (playing = (paused = false), therefore true. paused = (paused = true), therefore false)
	}

	// #endregion

	// #region Fetch information about whether or not the content is streamable

	export function IsStreamable(component : Object) : boolean {
		var componentElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerControlElement  = componentElement.querySelector('div[data-syiro-component="player-control"]');
		var isStreamble : boolean = false; // Set isStreamable as a boolean default to false

		if (syiro.data.Read(component["id"] + "->UsingExternalLibrary")){ // If we are using an external library
			isStreamble = true; // Set to being streamable by default
		}
		else{ // If we are not using an external library
			var sourceElementsInfo : Array<Object> = syiro.player.FetchSources(component); // Define sourceElementsInfo as the fetched objects containing the information from the sources

			for (var sourceElementInfo of sourceElementsInfo){ // For each source in playerSources
				var source = sourceElementInfo["src"]; // Define source as the src key/ val in sourceElementInfo
				var streamingProtocol : string = source.substr(0, source.indexOf(":")); // Get the streaming protocol (rtsp, rtmp, hls) by creating a substring, starting at 0 and ended at the protocol end mark (://)
				var sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", ""); // Get the last index of ., get the substring based on that, and then remove the period on the extension.

				if ((streamingProtocol == "rtsp") || (streamingProtocol == "rtmp")){ // If we are working strictly with a streaming protocol and not normal HTTP (or HLS)
					isStreamble = true; // Define isStreamable as true
				}
				else if ((streamingProtocol.indexOf("http") == 0) && (sourceExtension == "m3u8")){ // If we are dealing with a m3u8 file over HTTP
					isStreamble = true; // Define isStreamable as true
				}
			}
		}

		if (isStreamble){ // If the content IS streamable
			syiro.data.Write(component["id"] + "->IsStreaming", true); // Declare that we are streaming by recording it in the Syiro Data System
			playerControlElement.setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"

			if (playerControlElement.querySelector("time") !== null){ // If there is a time Element
				playerControlElement.querySelector("time").setAttribute("data-syiro-component-live", ""); // Use "Live" View of Time Label
				playerControlElement.querySelector("time").textContent = "Live"; // Set the time label to "Live"
			}
		}
		else { // If the content is NOT streamable
			syiro.data.Delete(component["id"] + "->IsStreaming"); // Delete the IsStreaming key if it exists already to ensure we are changing it to non-streaming UX
			playerControlElement.removeAttribute("data-syiro-component-streamstyling"); // Remove Stream Styling if it exists in the Player Control

			if (playerControlElement.querySelector("time") !== null){ // If there is a time Element
				playerControlElement.querySelector("time").removeAttribute("data-syiro-component-live"); // Remove the "Live" View of Time Label
				playerControlElement.querySelector("time").textContent = "00:00"; // Set the time label to "00:00"
			}
		}

		return isStreamble;
	}

	// #region Generage Sources - Function for generating source Elements

	export function GenerateSources(type : string, sources : Array<string>) : Array<HTMLElement> {
		var sourceElements : Array<HTMLElement> = []; // Define sourceElements as an array of source Elements

		for (var source of sources){ // For each source in sources
			var streamingProtocol : string = source.substr(0, source.indexOf(":")); // Get the streaming protocol (rtsp, rtmp, hls) by creating a substring, starting at 0 and ended at the protocol end mark (://)
			var sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", ""); // Get the last index of ., get the substring based on that, and then remove the period on the extension.
            var sourceTagAttributes = { "src" : source}; // Create an initial source tag attributes Object that we'll pass to ElementCreator

			if (source.substr(-1) !== ";"){ // If the source does not end with a semi-colon, common to prevent Shoutcast browser detection
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

				sourceElements.push(syiro.utilities.ElementCreator("source", sourceTagAttributes)); // Generate a source tag and push to sourceElements
			}
		}

		return sourceElements;
	}

	// #endregion

	// #region Play or Pause Audio or Video based on current state

	export function PlayOrPause(component : Object, playButtonObjectOrElement ?: any) {
		var allowPlaying : boolean = false; // Define allowPlaying as a boolean as to whether we should allow playing or not. Defaults to false, set to true if we might be able to play the source(s)

		var playerComponentElement = syiro.component.Fetch(component); // Get the Component Element of the Player
		var innerContentElement = syiro.player.FetchInnerContentElement(component); // Get the inner audio or video Element

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

	// #endregion

	// #region Reset Player - Function for resetting the player state to default (except for volume). Handy for source changing

	export function Reset(component : Object){
		var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player
		var playerControl = playerElement.querySelector('div[data-syiro-component="player-control"]'); // Get the Player Control

		if (syiro.player.IsPlaying(component)){ // If the Audio Player or Video Player is playing
			playerInnerContentElement.pause(); // Start by pausing the player to prevent timeupdate events
		}

		syiro.player.SetTime(component, 0); // Reset the time (if it needs to be reset to zero)

		syiro.player.IsPlayable(component); // Check if the sources are playable (as well as streamable) and do the appropriate actions based on it

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
		}

		syiro.data.Delete(component["id"] + "->IsChangingInputValue"); // Remove IsChangingInputValue for this Component
		syiro.data.Delete(component["id"] + "->IsChangingVolume"); // Remove IsChangingVolume for this Component
	}

	// #endregion

	// #region Set Source - Function for easily setting the source(s) of an Audio or Video Player Component

	export function SetSources(component : Object, sources : any){
		var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerControlElement  = playerElement.querySelector('div[data-syiro-component="player-control"]');
		var playerInnerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(component); // Get the associated audio or video player
		var contentType : string = component["type"].replace("-player", ""); // Remove -player in the type of the Component to get base type (audio / video)
		var isStreamableContent : boolean = false; // Set isStreambleContent to false by default, only set to true if the content is streamable

		if (typeof sources == "string"){ // If only a single source is defined
			sources = [sources]; // Convert to an array
		}

		var sourceElements : Array<HTMLElement> = syiro.player.GenerateSources(contentType, sources); // Generate the source tag Elements
		playerInnerContentElement.innerHTML = ""; // Remove all inner source tags from the InnerContentElement (audio or video tag) by resetting the innerHTML

		for (var sourceElement of sourceElements){ // For each sourceElement in sourceElements
			playerInnerContentElement.appendChild(sourceElement); // Append the HTMLElement
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

	export function ToggleFullscreen(component : Object){
		var componentElement : Element = syiro.component.Fetch(component); // Define componentElement as the fetched Element of the Video Player

		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement){ // If we are currently NOT fullscreen
			if (typeof componentElement.requestFullscreen !== "undefined"){ // If requestFullscreen is a valid function of componentElement
				componentElement.requestFullscreen(); // Define fullscreenAction as requestFullscreen
			}
			else if (typeof componentElement.msRequestFullscreen !== "undefined"){ // If msRequestFullscreen (IE API call for Fullscreen) is a valid function of componentElement
				componentElement.msRequestFullscreen(); // Define fullscreenAction as msRequestFullscreen
			}
			else if (typeof componentElement.mozRequestFullScreen !== "undefined"){ // If mozRequestFullScreen (Gecko API call for Fullscreen) is a valid function of componentElement
				componentElement.mozRequestFullScreen(); // Define fullscreenAction as mozRequestFullScreen
			}
			else if (typeof componentElement.webkitRequestFullscreen !== "undefined"){ // If webkitRequestFullscreen (Blink / Webkit call for Fullscreen) is a valid function of componentElement
				componentElement.webkitRequestFullscreen(); // Define fullscreenAction as webkitRequestFullscreen
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

	// #region Show Volume Slider

	export function ShowVolumeSlider(playerControlComponent : Object, volumeButtonComponent : Object){
		var playerControl : Element = syiro.component.Fetch(playerControlComponent); // Fetch the Player Control Element
		var volumeButton : Element = syiro.component.Fetch(volumeButtonComponent); // Fetch the Volume Button Element

		var playerComponentObject : Object = syiro.component.FetchComponentObject(playerControl.parentElement); // Get the Component Object of the parent Player Component
		var playerContentElement : HTMLMediaElement = syiro.player.FetchInnerContentElement(playerComponentObject); // Get the audio or video Element of the parent Player Component

		var playerRange : any = playerControl.querySelector("input"); // Get the Player Control Range
		var playerRangeAttributes : Object= {}; // Set playerRangeAttributes as an empty Object to hold attribute information that we'll apply to the input range later

		if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") !== true){ // If we are NOT already actively doing a volume change
		    syiro.data.Write(playerComponentObject["id"] + "->IsChangingVolume", true); // Set the IsChangingVolume to true so we don't end up changing the "location" in the content

		    volumeButton.setAttribute("active", "true"); // Set component active to true to imply it is active

		    var playerRangeValueFromVolume : string = (playerContentElement.volume * 100).toString();

		    playerRangeAttributes["max"] = "100"; // Set max to 100
		    playerRangeAttributes["step"] = "1"; // Set step to 1
		    playerRange.value = playerRangeValueFromVolume; // Set the value to the volume (which is 0.1 to 1.0) times 10

		    if (syiro.data.Read(playerComponentObject["id"] + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
		        playerControl.removeAttribute("data-syiro-component-streamstyling"); // Default to NOT having the Player Control "Stream Styling"
		    }
		}
		else{ // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
		    volumeButton.removeAttribute("active"); // Remove component-active to imply volume icon is not active

		    playerRangeAttributes = syiro.player.GetPlayerLengthInfo(playerComponentObject); // Get a returned Object with the max the input range should be, as well as a reasonable, pre-calculated amount of steps.
		    playerRange.value = playerContentElement.currentTime; // Set the playerRange value to the currentTime

		    if (syiro.data.Read(playerComponentObject["id"] + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
		        playerControl.setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"
		    }

		    syiro.data.Write(playerComponentObject["id"] + "->IsChangingVolume", false); // Set the IsChangingVolume to false to infer we are no longer changing the volume
		}

		for (var playerRangeAttribute in playerRangeAttributes){ // For each attribute defined in the playerRangeAttributes Object
		    playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]); // Set the attribute on the playerRange
		}

		var priorInputSpaceWidth : number = Math.round((Number(playerRange.value) / Number(playerRange.max)) * playerRange.clientWidth); // Get the width of the empty space before the input range thumb by getting the current value, dividing by the max value and times the clientWidth
		syiro.component.CSS(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + "  " + priorInputSpaceWidth + "px, white 0px)");
	}

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

            if ((typeof properties["UsingExternalLibrary"] !== "undefined") && (properties["UsingExternalLibrary"] == true)){ // If an external library is going to be tying into the Syiro Video Player
                usingExternalLibrary = true;
            }

            // #endregion

            syiro.data.Write(componentId, // Store the Audio Player Component Element Details we generated
                {
                    "UsingExternalLibrary" : usingExternalLibrary, // Define whether we are using an external library with the player or not
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

            if ((typeof properties["UsingExternalLibrary"] !== "undefined") && (properties["UsingExternalLibrary"] == true)){ // If an external library is going to be tied into the Syiro Video Player
				syiroComponentData["UsingExternalLibrary"] = true; // Set the UsingExternalLibrary to true
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
