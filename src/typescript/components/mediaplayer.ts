/*
	This is a file containing the Media Player Component
*/

/// <reference path="../component.ts" />
/// <reference path="../events.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="../style.ts" />
/// <reference path="../utilities.ts" />

// #region Media Player Component

module syiro.mediaplayer{

	// #region New Media Player

	export function New(properties : Object) : ComponentObject {
		var syiroComponentData : Object = { "scaling" : {}}; // Define syiroComponentData as an Object to hold data we'll be writing to the Syiro Data System

		var componentObject : ComponentObject = { // Create a Component Onject
			"id" : syiro.component.IdGen("media-player"), // Generate a Component Id of the Media Player
			"type" : "media-player"
		};

		var componentElement : Element = syiro.utilities.ElementCreator("div", { // Create the Media Player container div
			"data-syiro-component-id" : componentObject.id, "data-syiro-component" : "media-player", // Set the id and component
			"data-syiro-component-type" : properties["type"], "name" : componentObject.id // Set the sub-type and name (name so we can jump to it)
		});

		var mediaPlayerElement : HTMLMediaElement; // Define mediaPlayerElement as the Element we'll be generated that'll either be audio or video Element
		var mediaPlayerProperties : Object = { "preload" : "metadata", "UIWebView" : "allowsInlineMediaPlayback","volume" : "0.5" }; // Define mediaPlayerProperties as the default properties we'll use with the mediaPlayerELement

		if (typeof properties["type"] == "undefined"){ // If a type is not defined
			properties["type"] = "video"; // Default to having a Video Player
		}

		if (navigator.userAgent.indexOf("iPhone") == -1) { // If we are not using an iPhone
			// #region Force Live User Interface
			// This section will determine if we should force the live UX to be applied to the content

			if ((typeof properties["ForceLiveUX"] == "boolean") && (properties["ForceLiveUX"])){ // If Force Live UX is defined as true
				syiroComponentData["ForceLiveUX"] = true; // Define the syiroComponentData ForceLiveUX as true
			}

			// #endregion

			// #region Player Menu Element Creation (If Applicable)

			if (syiro.utilities.TypeOfThing(properties["menu"], "ComponentObject")){ // If the menu defined is a ComponentObject (List)
				if (properties["menu"]["type"] == "list"){ // If the component provided is a List
					var playerMenuDialog : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "player-menu" } ); // Create a div element with the minor-component of player-menu
					playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content" : "Menu" })); // Create a label with the content "Menu"
					playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"])); // Append the List Element to the playerMenuDialog
					componentElement.insertBefore(playerMenuDialog, componentElement.firstChild); // Prepend the Menu Dialog
				}
			}

			// #endregion

			// #region Type-specific  Checking and Implementations

			if (properties["type"] == "audio"){ // If this is an audio-type player
				if ((typeof properties["title"] !== "undefined") || (typeof properties["artist"] !== "undefined")){ // If the properties has the artist information or audio file title defined
					properties["generate-content-info"] = true; // Set "generate-info" to true since we will pass that to the mediacontrol generator
				}
			}

			// #endregion

			var mediaControlComponent : ComponentObject = syiro.mediacontrol.New(properties); // Create a new Media Control
			var mediaControlElement : Element = syiro.component.Fetch(mediaControlComponent); // Fetch the HTMLElement

			componentElement.appendChild(mediaControlElement); // Append the Media Control
		} else { // If we are using an iPhone
			mediaPlayerProperties["NoUX"] = true; // NoUX set to true
			mediaPlayerProperties["controls"] = "controls"; // Use the build-in iOS controls
		}

		// #endregion

		// #region Dimension Setting

		if (syiro.utilities.TypeOfThing(properties["height"], "undefined")){ // If height is not defined
			if (properties["type"] == "audio"){ // If this is an audio player
				if (syiro.utilities.TypeOfThing(properties["mini"], "boolean") && properties["mini"]){ // If this is a mini player
					properties["height"] = 50;
				} else { // If this is not a mini player
					properties["height"] = 150;
				}
			} else { // If this is a video player
				properties["height"] = 300;
			}
		}

		if (syiro.utilities.TypeOfThing(properties["width"], "undefined")){ // If width is not defined
			if (properties["type"] == "audio"){ // If this is an audio player
				properties["width"] = 400; // Default to 400
			} else { // If this is a video player
				if (syiro.utilities.TypeOfThing(properties["height"], "number")){ // If we have a number for height (pixels)
					properties["width"] = properties["height"] * 1.77; // Ensure we have a widescreen ratio
				} else { // If we likely have a string
					properties["width"] = properties["height"]; // Have width reflect height, like if height is set to 100%
				}
			}
		}

		for (var dimension of ["height", "width"]) { // For height and width in array
			var dimensionValue = properties[dimension];

			if (syiro.utilities.TypeOfThing(dimensionValue, "number")){ // If the dimension value is a fixed number
				properties[dimension] = dimensionValue.toString() + "px"; // Change to string and append px
			}

			syiro.style.Set(componentElement, dimension, properties[dimension]); // Set the height or width of the componentElement
		}

		// #endregion

		// #region Media Player Art

		if (typeof properties["art"] !== "undefined"){
			if (navigator.userAgent.indexOf("iPhone") == -1) { // If we are not using an iPhone
				syiroComponentData["BackgroundImage"] = properties["art"]; // Set the BackgroundImage in the syiroComponentData
			} else { // If we are using an iPhone
				mediaPlayerProperties["poster"] = properties["art"]; // Define the poster property of the Media Element to be the art
			}
		} else { // If art has not been defined
			if (properties["type"] == "audio"){ // If this is an audio-type Media Player
				componentElement.setAttribute("data-syiro-audio-player", "mini"); // Set to "mini" player
				delete properties["menu"]; // Disable a menu option
			}
		}

		// #endregion

		// #region HTMLMediaElement  and inner-Source Creation

		mediaPlayerElement = syiro.utilities.ElementCreator(properties["type"], mediaPlayerProperties); // Generate the correct HTMLMediaElement with the mediaPlayerProperties
		mediaPlayerElement.autoplay = false; // Set autoplay on the mediaPlayerElement to false

		var sourceElements : Array<HTMLElement> = syiro.mediaplayer.GenerateSources(properties["type"], properties["sources"]); // Get an array of Source Elements

		for (var sourceElement of sourceElements){ // For each sourceElement in arrayofSourceElements
			mediaPlayerElement.appendChild(sourceElement); // Append the sourceElement
		}

		// #endregion

		// #region Third-Party Streaming Support
		// This section will determine if we are using a third-party library for live streaming support (like dashjs)

		if ((typeof properties["UsingExternalLibrary"] == "boolean") && (properties["UsingExternalLibrary"])){ // If an external library is going to be tied into the Syiro Video Player
			syiroComponentData["UsingExternalLibrary"] = true; // Set the UsingExternalLibrary to true
		}

		// #endregion

		componentElement.insertBefore(mediaPlayerElement, componentElement.firstChild); // Append the media player
		syiroComponentData["HTMLElement"] = componentElement; // Define the HTMLElement in syiroComponentData as the

		syiro.data.Write(componentObject.id, syiroComponentData); // Write the syiroComponentData of this Video Player to Syiro's Data System
		return componentObject; // Return a Component Object
	}

	// #endregion

	// #region Configure - This function will configure the Media Player if necessary

	export function Configure(component : ComponentObject){
		var componentElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player
		var mediaControl = componentElement.querySelector('div[data-syiro-component="media-control"]'); // Get the Media Control

		if (syiro.data.Read(component.id + "->NoUX") == false){ // If this player has UX
			if (componentElement.getAttribute("data-syiro-component-type") == "video"){ // If this is a video-type Media Player
				componentElement.removeAttribute("data-syiro-show-video"); // Remove data-syiro-show-video attribute so the video Element is now hidden
			}

			// #region Button Attribute Resetting

			var playButton = mediaControl.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button from the Media Control
			syiro.style.Set(playButton, "background-image", ""); // Remove the background-image style / reset to play image for Play Button
			playButton.removeAttribute("active"); // Remove component-status to imply play icon is not active (in this case, paused)

			var volumeControl = mediaControl.querySelector('div[data-syiro-render-icon="volume"]'); // Get the Volume Button from the Media Control

			if (volumeControl !== null){ // If there is a volume control (there is not on iOS)
				volumeControl.removeAttribute("active"); // Remove component-status to imply volume icon is not active
			}

			// #endregion

			// #region Playable + Streamble Media Player Configuration

			var isPlayableOrStreamable = syiro.mediaplayer.IsPlayable(component, true); // Check if the sources are playable (as well as streamable)
			var playerErrorNotice : Element = componentElement.querySelector('div[data-syiro-minor-component="player-error"]'); // Define playerErrorNotice as any error notice on this Player

			if (playerErrorNotice == null){ // If the playerErrorNotice doesn't exist
				playerErrorNotice = syiro.utilities.ElementCreator("div", { // Create a div to add to the player stating there is a codec error
					"data-syiro-minor-component" : "player-error", "content" : "This content is not capable of being played on this browser or device."
				});

				componentElement.insertBefore(playerErrorNotice, componentElement.firstChild); // Prepend the codecErrorElement to the Player
			}

			var innerTimeLabel : HTMLElement = mediaControl.querySelector("time"); // Get the inner time Element

			if ((isPlayableOrStreamable == true) || (isPlayableOrStreamable == "streamable")){ // If the content is playable or streamable
				if (isPlayableOrStreamable == "streamable"){ // If the content is streamable
					syiro.data.Write(component.id + "->IsStreaming", true); // Declare that we are streaming by recording it in the Syiro Data System
					mediaControl.setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"

					if (innerTimeLabel !== null){ // If there is a time Element
						innerTimeLabel.setAttribute("data-syiro-component-live", ""); // Use "Live" View of Time Label
						innerTimeLabel.textContent = "Live"; // Set the time label to "Live"
					}
				} else { // If the content is playable
					syiro.data.Delete(component.id + "->IsStreaming"); // Delete the IsStreaming key if it exists already to ensure we are changing it to non-streaming UX
					mediaControl.removeAttribute("data-syiro-component-streamstyling"); // Remove Stream Styling if it exists in the Media Control

					if (innerTimeLabel !== null){ // If there is a time Element
						innerTimeLabel.removeAttribute("data-syiro-component-live"); // Remove the "Live" View of Time Label
						innerTimeLabel.textContent = "00:00"; // Set the time label to "00:00"

						var playerMediaLengthInformation : Object = syiro.mediaplayer.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range
						var mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControl); // Fetch the ComponentObject of this Media Control

						syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 1, playerMediaLengthInformation["max"]);
					}
				}

				syiro.style.Set(playerErrorNotice, "visibility", ""); // Remove the playerErrorNotice visibility styling if it exists (it defaults to hidden)
			} else { // If the content is not playable or streamable
				syiro.style.Set(playerErrorNotice, "visibility", "visible"); // Set the playerErrorNotice visibility styling to visible
			}

		}

		syiro.data.Delete(component.id + "->IsChangingInputValue"); // Remove IsChangingInputValue for this Component
		syiro.data.Delete(component.id + "->IsChangingVolume"); // Remove IsChangingVolume for this Component
	}

	// #region DurationChange - Triggered on durationchange of innerContentElement

	export function DurationChange(component : ComponentObject){
		if (syiro.data.Read(component.id + "->IsStreaming") == false){ // If the Player is NOT streaming content
			var componentElement = syiro.component.Fetch(component); // Fetch the Player Element
			var mediaControlElement  = componentElement.querySelector('div[data-syiro-component="media-control"]');
			var mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControlElement); // Get the Media Control Component
			var playerRange : Element = mediaControlElement.querySelector('input[type="range"]'); // Get the input range

			var playerMediaLengthInformation : Object = syiro.mediaplayer.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range
			playerRange.setAttribute("max", playerMediaLengthInformation["max"]); // Set max attribute the playerMediaLengthInformation max key/val
			playerRange.setAttribute("step", playerMediaLengthInformation["step"]); // Set step attribute the playerMediaLengthInformation step key/val
			syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 1, playerMediaLengthInformation["max"]);
		}

		// #endregion
	}

	// #endregion

	// #region Fetch Internal Audio or Video Element of Player container Component

	export function FetchInnerContentElement(component : ComponentObject) : HTMLMediaElement {
		var componentElement = syiro.component.Fetch(component); // Get the Player Component
		return componentElement.querySelector(componentElement.getAttribute("data-syiro-component-type")); // Return the Element fetched from querySelector (audio or video)
	}

	// #endregion

	// #region Fetch Audio or Video Element Sources

	export function FetchSources(component : ComponentObject) : Array<Object> { // Return an array of source types (string)
		var innerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Fetch the inner audio or video Element from the Audio Player or Video Player Component
		var sourceTags : any = innerContentElement.querySelectorAll("source"); // Get all source tags within the innerContentElement
		var sourcesArray : Array<Object> = []; // Define sourcesArray as an empty Array to hold source information

		for (var sourceElementIndex in sourceTags){ // For each source Element in the sourceTags
			var sourceElement : any = sourceTags[sourceElementIndex]; // Get the individual source Element

			if (syiro.utilities.TypeOfThing(sourceElement, "Element")){ // If sourceElement is an Element
				sourcesArray.push({
					"src" : sourceElement.getAttribute("src"), // Get the "src" attribute from the sourceElement
					"streamable" : sourceElement.getAttribute("data-syiro-streamable-source"), // Get the streamble attribute
					"type" : sourceElement.getAttribute("type") // Get the "type" attribute from the sourceElement, which should have information like "video/webm"
				});
			}
		}

		return sourcesArray;
	}

	// #endregion

	// #region Generage Sources - Function for generating source Elements

	export function GenerateSources(type : string, sources : Array<string>) : Array<HTMLElement> {
		var sourceElements : Array<HTMLElement> = []; // Define sourceElements as an array of source Elements

		for (var source of sources){ // For each source in sources
			var streamingProtocol : string = source.substr(0, source.indexOf(":")); // Get the streaming protocol (rtsp, rtmp, hls) by creating a substring, starting at 0 and ended at the protocol end mark (://)
			var sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", ""); // Get the last index of ., get the substring based on that, and then remove the period on the extension.
			var sourceTagAttributes = { "src" : source, "data-syiro-streamable-source" : "false" }; // Create an initial source tag attributes Object that we'll pass to ElementCreator

			if (source.substr(-1) !== ";"){ // If the source does not end with a semi-colon, common to prevent Shoutcast browser detection
				if ((streamingProtocol == "rtsp") || (streamingProtocol == "rtmp")){ // If we are working strictly with a streaming protocol and not normal HTTP (or HLS)
					sourceTagAttributes["data-syiro-streamable-source"] = "true"; // Define streamable as true
					sourceTagAttributes["type"] = streamingProtocol + "/" + sourceExtension; // Define the type as streaming protocol + sourceExtension, like rtmp/mp4
				} else { // If we are not dealing with a streaming protocol (or are but in the form of HLS)
					if (sourceExtension == "m3u8"){ // If we are dealing with a playlist m3u8 (live streaming)
						sourceTagAttributes["data-syiro-streamable-source"] = "true"; // Define streamable as true
						sourceTagAttributes["type"] = "application/x-mpegurl"; // Set the type to a valid mpegurl type which is accepted by Android, iOS, etc.
					} else {
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

	// #region Get Information about the Player's Length and reasonable step intervals

	export function GetPlayerLengthInfo(component : ComponentObject) : Object{
		var playerLengthInfo : Object = {}; // Define playerLengthInfo as an empty Object to hold length information about the audio or video
		var contentDuration : any = syiro.mediaplayer.FetchInnerContentElement(component).duration; // Get the Player's internal audio or video Element and its duration property

		if ((isNaN(contentDuration) == false) && (isFinite(contentDuration))){ // If we are able to properly fetch the duration and we are not streaming
			playerLengthInfo["max"] = contentDuration; // Set the maximum to the contentDuration

			if (contentDuration < 60){ // If the contentDuration is less than 60 seconds
				playerLengthInfo["step"] = 1; // Se the step value to 1 second.
			} else if ((contentDuration > 60) && (contentDuration <= 300)){ // If the contentDuration is greater than 1 minute but less than or equal to 5 minutes
				playerLengthInfo["step"] = 5; // Set the step value to 5 seconds
			} else if ((contentDuration > 300) && (contentDuration < 900)){ // If the contentDuration is greater than 5 minutes but less than 15 minutes
				playerLengthInfo["step"] = 10; // Set the step value to 10 seconds
			} else { // If the video is greater than 15 minutes
				playerLengthInfo["step"] = 15; // Set the step value to 15 seconds
			}
		} else if (isNaN(contentDuration)){ // If the contentDuration is unknown
			playerLengthInfo["max"] = "Unknown"; // Set max to unknown
			playerLengthInfo["step"] = 1; // Set step value to 1 second
		} else if (isFinite(contentDuration) == false){ // If we are streaming content
			playerLengthInfo["max"] = "Streaming"; // Set max to Streaming
			playerLengthInfo["step"] = 1; // Set step value to 1 second
		}

		return playerLengthInfo; // Return the playerLengthInfo Object
	}

	// #endregion

	// #region Fetch whether content in player is playable

	export function IsPlayable(component : ComponentObject, returnIsStreamble ?: boolean) : (string | boolean) {
		var componentElement : Element = syiro.component.Fetch(component); // Define componentElement as the fetched Element of the Component
		var innerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Fetch the inner content Element

		var isPlayable : boolean = false; // Set isPlayable as a boolean default to false
		var isStreamable : boolean = false; // Set isStreamable as the returned boolean

		if (syiro.data.Read(component.id + "->UsingExternalLibrary")){ // If we are using an external library
			isPlayable = true; // Set to being playable by default
			isStreamable = true; // Set to being streamable by default
		} else { // If we are not using an external library
			var sourceElementsInfo : Array<Object> = syiro.mediaplayer.FetchSources(component); // Define sourceElementsInfo as the fetched objects containing the information from the sources

			for (var sourceElementInfo of sourceElementsInfo){ // For each source in playerSources
				if (innerContentElement.canPlayType(sourceElementInfo["type"]) !== ""){ // If we do not get an empty string returned, meaning we may be able to play the content
					isPlayable = true; // Set isPlayable to true
					break;
				}

				if (!isStreamable){ // If we haven't already checked if the content is stream
					if ((syiro.utilities.TypeOfThing(sourceElementInfo["streamable"], "string")) && (sourceElementInfo["streamable"] == "true")){ // If the source is streamable
						isStreamable = true; // Set isStreamable to true
						break;
					}
				}
			}
		}

		if (returnIsStreamble && isStreamable){ // If we are returning whether the content is streamable and it is
			return "streamable"; // Return that it is streamable
		} else if (isPlayable) { // If it is playable
			return true; // Return boolean true
		} else { // If it is neither streamable nor playable
			return false;
		}
	}

	// #endregion

	// #region Get Information about if the Player is playing

	export function IsPlaying(component : ComponentObject) : boolean {
		var componentElement = syiro.component.Fetch(component); // Fetch the Player Element
		var isPaused = syiro.mediaplayer.FetchInnerContentElement(component).paused; // Get the value of paused on the Player (opposite of what we will return)

		return !isPaused; // Return the opposite boolean value (playing = (paused = false), therefore true. paused = (paused = true), therefore false)
	}

	// #endregion

	// #region Fetch information about whether or not the content is streamable

	export function IsStreamable(component : ComponentObject) : boolean {
		return (syiro.mediaplayer.IsPlayable(component, true) == "streamable"); // Call IsPlayable, checking if returned string is "streamable"
	}

	// #endregion

	// #region Play or Pause Audio or Video based on current state

	export function PlayOrPause(component : ComponentObject, playButtonObjectOrElement ?: any) {
		var componentElement = syiro.component.Fetch(component); // Get the Component Element of the Player
		var innerContentElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the inner audio or video Element

		var typeOfPlayButtonObject : string = syiro.utilities.TypeOfThing(playButtonObjectOrElement); // Get the type of the PlayButtonObject
		var playButton : Element; // Define playButton as an Element

		if (componentElement.getAttribute("data-syiro-component-type") == "video"){ // If this is a video-type Media Player
			componentElement.setAttribute("data-syiro-show-video", "true"); // Set attribute of data-syiro-show-video to true, indicating to no longer hide the innerContentElement
		}

		if (typeOfPlayButtonObject == "ComponentObject"){ // If what was passed is a Component Object
			playButton = syiro.component.Fetch(playButtonObjectOrElement); // Fetch the playButton
		} else {  // If what was passed is not a Component Object
			if ((typeOfPlayButtonObject !== "Element") || (playButtonObjectOrElement.getAttribute("data-syiro-render-icon") !== "play")){ // If the playButtonObjectOrElement is not an Element or isn't actually the Play Button
				playButton = componentElement.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button Element
			} else { // If what was passed was in fact the playButton Element
				playButton = playButtonObjectOrElement;
			}
		}

		if (syiro.mediaplayer.IsPlaying(component)){ // If the audio or video Element is playing
			innerContentElement.pause(); // Pause the audio or video Element
			playButton.removeAttribute("active"); // Remove the active attribute if it exists, since it is used to imply play / pause iconography
		} else { // If the audio or video Element is paused
			innerContentElement.play(); // Play the audio or video Element
			playButton.setAttribute("active", "pause"); // Set the active attribute to "pause" to indicate using the pause icon
		}
	}

	// #endregion

	// #region Reset Player - Function for resetting the player state to default (except for volume). Handy for source changing

	export function Reset(component : ComponentObject){
		var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player

		if (syiro.mediaplayer.IsPlaying(component)){ // If the Audio Player or Video Player is playing
			playerInnerContentElement.pause(); // Start by pausing the player to prevent timeupdate events
		}

		syiro.mediaplayer.SetTime(component, 0); // Reset the time (if it needs to be reset to zero)
		syiro.mediaplayer.Configure(component); // Re-configure the Media Player
	}

	// #endregion

	// #region Set Source - Function for easily setting the source(s) of the Media Player

	export function SetSources(component : ComponentObject, sources : any){
		var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player
		var contentType : string = playerInnerContentElement.nodeName.toLowerCase(); // Get the type of the Media Player based on the nodeName of the inner content Element

		if (typeof sources == "string"){ // If only a single source is defined
			sources = [sources]; // Convert to an array
		}

		var sourceElements : Array<HTMLElement> = syiro.mediaplayer.GenerateSources(contentType, sources); // Generate the source tag Elements
		playerInnerContentElement.innerHTML = ""; // Remove all inner source tags from the InnerContentElement (audio or video tag) by resetting the innerHTML

		for (var sourceElement of sourceElements){ // For each sourceElement in sourceElements
			playerInnerContentElement.appendChild(sourceElement); // Append the HTMLElement
		}

		playerInnerContentElement.setAttribute("src", sources[0]); // Set via attribute to trigger MutationObserver
		playerInnerContentElement.src = sources[0]; // Set the initial src of the audio or video player to the first source provide

		syiro.mediaplayer.Reset(component); // Reset the media player
	}

	// #endregion

	// #region Set Time - Function for easily setting the time location of an Audio or Video Player Component

	export function SetTime(component : ComponentObject, setting : any){
		var component : ComponentObject = arguments[0]; // Component Object is always passed on the first argument
		var componentElement = syiro.component.Fetch(component); // Define componentElement as the fetched Component Element
		var playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Define playerInnerContentElement as the HTMLMediaElement

		var currentTime : number = playerInnerContentElement.currentTime; // Set time to currentTime of the content Element
		var time : number = currentTime; // Set time to default to same as currentTime and only change if setting is a number
		var fromEvent : boolean = true; // Set fromEvent as a boolean, defaulting to true

		if (typeof setting == "number"){ // If setting is a number
			time = setting; // We'll be changing the time to this specific location
			fromEvent = false; // Declare that this is not from the timeupdate Event

			if ((currentTime !== time) && (time <= playerInnerContentElement.duration)){ // If we are not setting the time to the exact same time as before or larger than the duration
				playerInnerContentElement.currentTime = time; // Set the playerInnerContentElement's currentTime to the time provided
			}
		}

		// #region Media Control Component & Element Defining

		var mediaControlElement = componentElement.querySelector('div[data-syiro-component="media-control"]'); // Fetch the Media Control Element
		var mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControlElement); // Get the Component Object of the Media Control
		var playerRange = mediaControlElement.querySelector("input"); // Get the input range of the Media Control

		// #endregion

		syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 0, time); // Update the label

		if (syiro.data.Read(component.id + "->IsStreaming") == false){ // If we are not streaming
			var allowInputChange : boolean = false; // Default to not allowing input value changing
			var isChangingInputValue : boolean = syiro.data.Read(component.id + "->IsChangingInputValue"); // Get the boolean value if we are changing the input value or not

			if ((!fromEvent) && (isChangingInputValue)){ // If the SetTime call did not come from timeupdate and we are changing the input value
				allowInputChange = true; // Allow input change
			} else if (fromEvent && (!isChangingInputValue)){ // If the SetTime call came from timeupdate and we are not changing the input value
				allowInputChange = true; // Allow input change
			}

			if (allowInputChange){ // If we are allowing input change
				var roundedDownTime : number = Math.floor(time);
				playerRange.value = roundedDownTime; // Set the value to the volume (which is 0.1 to 1.0) times 10

				var priorInputSpaceWidth : number = (roundedDownTime / Number(playerRange.max)) * playerRange.clientWidth; // Get the width of the empty space before the input range thumb by getting the currentTime, dividing by the max value and times the clientWidth
				var updatedGradient : string = "linear-gradient(to right, " + syiro.primaryColor + " " + (priorInputSpaceWidth +2) + "px, transparent 0px)"; // Define updatedGradient as the information we'd apply to linear-gradient
				syiro.style.Set(playerRange, "background", updatedGradient); // Set background to updated linear-gradient
			}
		}
	}

	// #endregion

	// #region Set Volume - Function for easily setting the volume of an Audio or Video Player

	export function SetVolume(component : ComponentObject, volume : number, fromEvent ?: string){
		var playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		var playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player
		var playerRange : HTMLInputElement = playerElement.querySelector('input[type="range"]'); // Get the Media Control Range
		var inputVolumeValue : number = volume; // Set inputVolumeValue equal to volume

		if ((typeof fromEvent == "string") && (fromEvent == "input")){ // If it came from playerRange input change
			 inputVolumeValue *= 10; // Times the number by 100 to get absolute percentage value
			 volume /= 10; // Divide the number by 10 to get the floating point number we assign to HTMLMediaElement.volume
		} else { // If it is not from an event
			if ((inputVolumeValue > 10) && (inputVolumeValue <= 100)){ // If we are provided a number between 10 and 100
				inputVolumeValue = Math.round(volume / 10) * 10; // Round the number to nearest 10 after dividing it by 10 (example 84 -> 8.4 -> 8 * 10 -> 80)
				volume /= 100; // Divide the number by 100 to get the floating point number we assign to HTMLMediaElement.volume
			}
			else if ((inputVolumeValue > 1) && (inputVolumeValue <= 10)){ // If we are being provided a number between 1 and 10
				inputVolumeValue *= 10; // Times the number by 10 to get absolute percentage value
			 	volume /= 10; // Divide the number by 10 to get the floating point number we assign to HTMLMediaElement.volume
			}
			else if (inputVolumeValue <= 1){ // If we are being provided a floating number (or 1, which im passed by input change
				inputVolumeValue *= 100; // Times the number by 100 to get absolute percentage value
			}
		}

		syiro.style.Set(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + " " + inputVolumeValue  + "%, transparent 0px)");
		playerInnerContentElement.volume = volume; // Set the Player volume
	}

	// #endregion

	// #region Toggle Fullscreen

	export function ToggleFullscreen(component : ComponentObject){
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
		} else { // If we are currently fullscreen
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

	export function ToggleMenuDialog(component : ComponentObject){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the Player Element

		var menuDialog : Element = componentElement.querySelector('div[data-syiro-minor-component="player-menu"]'); // Get the Menu Dialog
		var menuButton : Element = componentElement.querySelector('div[data-syiro-render-icon="menu"]'); // Get the menu button element

		if (syiro.style.Get(menuDialog, "visibility") !== "visible"){ // If the Menu Dialog is currently not showing
			menuButton.setAttribute("active", "true"); // Set the menu button active to true
			syiro.style.Set(menuDialog, "visibility", "visible"); // Show the menu dialog
		} else { // If the Menu dialog currently IS showing
			menuButton.removeAttribute("active"); // Remove the menu button active status
			syiro.style.Set(menuDialog, "visibility", ""); // Hide the menu dialog (removing the visibility attribute, putting the Menu Dialog back to default state)
		}
	}

	// #endregion
}

// #endregion

// #region Media Control Component

module syiro.mediacontrol {
	// #region Media Control Creator

	export function New(properties : Object) : ComponentObject {
		var component : ComponentObject = { "id" : syiro.component.IdGen("media-control"), "type" : "media-control" }; // Generate the Component Object of the Media Control
		var componentElement = syiro.utilities.ElementCreator("div",  { "data-syiro-component" : component.type, "data-syiro-component-id" : component.id }); // Generate the basic mediaControl container

		var playButton = syiro.button.New( { "icon" : "play" } ); // Create a play button
		var inputRange : HTMLElement = syiro.utilities.ElementCreator("input", { "type" : "range", "value" : "0"} ); // Create an input range

		componentElement.appendChild(inputRange); // Append the input range
		componentElement.appendChild(syiro.component.Fetch(playButton)); // Append the play button

		if (typeof properties["generate-content-info"] !== "undefined"){ // If we are adding content (for Audio Player)
			var infoSection : HTMLElement = document.createElement("section"); // Generate a section Element

			if (typeof properties["title"] !== "undefined"){ // If a title is defined
				infoSection.appendChild(syiro.utilities.ElementCreator("b", { "content" : properties["title"]})); // Create the Audio b tag and append it to the infoSection section
			}

			if (typeof properties["artist"] !== "undefined"){ // If an artist is defined
				infoSection.appendChild(syiro.utilities.ElementCreator("label", { "content" : properties["artist"]})); // Create the Artist label and append it to the infoSection section
			}

			componentElement.appendChild(infoSection); // Append the info section
		} else { // If we are not generating content info
			if (properties["type"] == "video"){ // If we are generated a Media Control for a video-type Media Player
				var timeStamp : HTMLElement = syiro.utilities.ElementCreator("time", { "content" : "00:00 / 00:00"} ); // Create a timestamp time element
				componentElement.appendChild(timeStamp); // Append the timestamp time element
			}
		}

		// #region Player Menu Element Creation (If Applicable)

		if (syiro.utilities.TypeOfThing(properties["menu"], "ComponentObject")){ // If the menu defined is a ComponentObject (List)
			if (properties["menu"]["type"] == "list"){ // If the component provided is a List
				var menuButton = syiro.button.New( { "icon" : "menu"} ); // Generate a Menu Button
				componentElement.appendChild(syiro.component.Fetch(menuButton)); // Append the menuButton to the mediaControlElement
			}
		}

		// #endregion

		// #region Video Player - Additional Functionality Adding

		if (properties["type"] == "video"){ // If the type is a video Media Player
			var fullscreenButton = syiro.button.New( { "icon" : "fullscreen"} ); // Create a fullscreen button
			componentElement.appendChild(syiro.component.Fetch(fullscreenButton)); // Append the fullscreen control
		}

		// #endregion

		if (syiro.device.OperatingSystem !== "iOS"){ // As iOS does not allow manual control of volume (it has to be done with hardware controls), check if the OS is NOT iOS before volume button generation
			var volumeButton = syiro.button.New( { "icon" : "volume" } ); // Generate a Volume Button
			componentElement.appendChild(syiro.component.Fetch(volumeButton)); // Append the volume control
		}

		syiro.data.Write(component.id + "->HTMLElement", componentElement); // Store the Component HTMLElement of the Media Control
		return component; // Return the Component Object
	}

	// #endregion

	// #region Show Volume Slider

	export function ShowVolumeSlider(mediaControlComponent : ComponentObject, volumeButtonComponent : ComponentObject){
		var mediaControl : Element = syiro.component.Fetch(mediaControlComponent); // Fetch the Media Control Element
		var volumeButton : Element = syiro.component.Fetch(volumeButtonComponent); // Fetch the Volume Button Element

		var playerComponentObject : ComponentObject = syiro.component.FetchComponentObject(mediaControl.parentElement); // Get the Component Object of the parent Player Component
		var playerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(playerComponentObject); // Get the audio or video Element of the parent Player Component

		var playerRange : any = mediaControl.querySelector('input[type="range"]'); // Get the Media Control Range

		if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false){ // If we are NOT already actively doing a volume change
			syiro.data.Write(playerComponentObject["id"] + "->IsChangingInputValue", true); // Set the IsChangingInputValue so Tick doesn't update slider while we have the Volume Slider area showing
			syiro.data.Write(playerComponentObject["id"] + "->IsChangingVolume", true); // Set the IsChangingVolume to true so we don't end up changing the "location" in the content

			volumeButton.setAttribute("active", "true"); // Set component active to true to imply it is active

			if (syiro.data.Read(playerComponentObject["id"] + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
				mediaControl.removeAttribute("data-syiro-component-streamstyling"); // Default to NOT having the Media Control "Stream Styling"
			}

			playerRange.setAttribute("max", "10"); // Set max attribute to 10 in playerRange
			playerRange.setAttribute("step", "1"); // Set step attribute to 1 in playerRange
			syiro.mediaplayer.SetVolume(playerComponentObject, playerContentElement.volume); // Call SetVolume initially to do proper playerRange gradient styling
		} else { // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
			volumeButton.removeAttribute("active"); // Remove component-active to imply volume icon is not active

			if (syiro.data.Read(playerComponentObject["id"] + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
				mediaControl.setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"
			}

			var playerMediaLengthInformation : Object = syiro.mediaplayer.GetPlayerLengthInfo(playerComponentObject); // Get information about the appropriate settings for the input range
			playerRange.setAttribute("max", playerMediaLengthInformation["max"]); // Set max attribute the playerMediaLengthInformation max key/val
			playerRange.setAttribute("step", playerMediaLengthInformation["step"]); // Set step attribute the playerMediaLengthInformation step key/val

			syiro.data.Delete(playerComponentObject["id"] + "->IsChangingInputValue"); // Since we not changing the volume, immediately remove  IsChangingInputValue
			syiro.data.Delete(playerComponentObject["id"] + "->IsChangingVolume"); // Delete the IsChangingVolume key from this Player's data
			syiro.mediaplayer.SetTime(playerComponentObject, playerContentElement.currentTime); // Call SetTime (which will have no visual change of the video for the user) to update the slider to the accurate position
		}
	}

	// #endregion

	// #region Player Time Label Updating

	export function TimeLabelUpdater(component : ComponentObject, timePart : number, value : any){
		var mediaControlElement : HTMLElement = syiro.component.Fetch(component); // Get the Media Control's Element
		var playerTimeElement = mediaControlElement.querySelector("time"); // Get the time Element

		if (playerTimeElement !== null){ // If the time Element exists
			// #region Seconds Parsing to String

			var parsedSecondsToString : string = ""; // Define parsedSecondsToString as our converted seconds to Object then concatenated string

			if (typeof value == "number"){ // If we passed a number
				var timeFormatObject = syiro.utilities.SecondsToTimeFormat(value); // Get the time format (rounded down value)

				for (var timeObjectKey in timeFormatObject){ // For each key in the timeObject
					var timeObjectValue = timeFormatObject[timeObjectKey]; // Set timeObjectValue as the value based on key

					if (parsedSecondsToString.length !== 0){ // If there is already content in parsedSecondsToString
						parsedSecondsToString = parsedSecondsToString + ":" + timeObjectValue; // Append :timeObjectValue
					} else {
						parsedSecondsToString = timeObjectValue; // Set parsedSecondsToString as value
					}
				}
			} else { // If we did not pass a number (so a string, like "Unknown" or "Streaming")
				parsedSecondsToString = value; // Simply set the parsedSecondsToString as the value passed
			}

			// #endregion

			var playerTimeElementParts = playerTimeElement.textContent.split(" / "); // Split time textContent based on " / "
			playerTimeElementParts[timePart] = parsedSecondsToString; // Set the value of the part specified
			playerTimeElement.textContent = playerTimeElementParts[0] + " / " + playerTimeElementParts[1];
		}
	}

	// #endregion

	// #region Toggle Media Control

	export function Toggle(component : ComponentObject, forceShow ?: boolean){
		var mediaControlElement : Element = syiro.component.Fetch(component); // Fetch the Syiro Media Control Component Element
		var currentAnimationStored : string; // Define currentAnimationStored as an undefined string

		if (mediaControlElement.hasAttribute("data-syiro-animation")){ // If the Media Control Element has an animation attribute
			currentAnimationStored = mediaControlElement.getAttribute("data-syiro-animation"); // Get the current animation stored in "data-syiro-animation"
		}

		if (typeof forceShow !== "boolean"){ // If we are passed eventData rather than a boolean
			forceShow = null; // Set forceShow to null
		}

		if (forceShow){ // If we are forcing to show the Media Control
			syiro.animation.FadeIn(component); // Fade in the Media Control
		}
		else if (forceShow == false){ // If we are forcing to hide the Media Control
			syiro.animation.FadeOut(component); // Fade out the Media Control
		}
		else if ((typeof forceShow == "undefined") || (forceShow == null)){ // If the forceShow is not defined or defined as null
			if ((currentAnimationStored == "fade-out") || (mediaControlElement.hasAttribute("data-syiro-animation") == false)){ // If the current status is the Media Control is faded out OR the Media Control does not have the animation attribute
				syiro.animation.FadeIn(component); // Fade in the Media Control
			} else { // If the current status is the Media Control is faded in (showing)
				syiro.animation.FadeOut(component); // Fade out the Media Control
			}
		}
	}

	// #endregion
}

// #endregion
