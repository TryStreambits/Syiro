/*
	This is a file containing the Media Player Component
*/

/// <reference path="../component.ts" />
/// <reference path="../events.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="../style.ts" />
/// <reference path="../utilities.ts" />

module syiro.mediaplayer{

	// New Media Player
	export function New(properties : MediaPlayerPropertiesObject) : ComponentObject {
		let syiroComponentData : Object = { "scaling" : {}}; // Define syiroComponentData as an Object to hold data we'll be writing to the Syiro Data System

		let componentObject : ComponentObject = { // Create a Component Onject
			"id" : syiro.component.IdGen("media-player"), // Generate a Component Id of the Media Player
			"type" : "media-player"
		};

		let componentElement : Element = syiro.utilities.ElementCreator("div", { // Create the Media Player container div
			"data-syiro-component-id" : componentObject.id, "data-syiro-component" : "media-player", // Set the id and component
			"data-syiro-component-type" : properties.type, "name" : componentObject.id // Set the sub-type and name (name so we can jump to it)
		});

		let mediaPlayerElement : HTMLMediaElement; // Define mediaPlayerElement as the Element we'll be generated that'll either be audio or video Element
		let mediaPlayerProperties : Object = { "preload" : "metadata", "UIWebView" : "allowsInlineMediaPlayback","volume" : "0.5" }; // Define mediaPlayerProperties as the default properties we'll use with the mediaPlayerELement

		if (typeof properties.type == "undefined"){ // If a type is not defined
			properties.type = "video"; // Default to having a Video Player
		}
		
		// #region Media Player Art

		if (typeof properties.art !== "undefined"){
			if (navigator.userAgent.indexOf("iPhone") == -1) { // If we are not using an iPhone
				syiroComponentData["BackgroundImage"] = properties.art; // Set the BackgroundImage in the syiroComponentData
			} else { // If we are using an iPhone
				mediaPlayerProperties["poster"] = properties.art; // Define the poster property of the Media Element to be the art
			}
		}

		// #endregion		

		if (navigator.userAgent.indexOf("iPhone") == -1) { // If we are not using an iPhone
			if ((typeof properties.ForceLiveUX == "boolean") && (properties.ForceLiveUX)){ // If Force Live UX is defined as true
				syiroComponentData["ForceLiveUX"] = true; // Define the syiroComponentData ForceLiveUX as true
			}

			// #region Type-specific Checking and Implementations

			if (properties.type == "audio"){ // If this is an audio-type player
				delete properties.menu; // Delete the menu properties
				if ((typeof properties.title == "string") || (typeof properties.artist == "string")){ // If the properties has the artist information or audio file title defined
					properties.generateContentInfo = true; // Set generatedContentInfo to true since we will pass that to the mediacontrol generator
				}
			} else { // If this is a video-type player
				if (syiro.utilities.TypeOfThing(properties.menu, "ComponentObject") && (properties.menu.type == "list")){ // If the menu defined is a ComponentObject (List)
					let playerMenuDialog : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "player-menu" } ); // Create a div element with the minor-component of player-menu
					playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content" : "Menu" })); // Create a label with the content "Menu"
					playerMenuDialog.appendChild(syiro.component.Fetch(properties.menu)); // Append the List Element to the playerMenuDialog
					componentElement.insertBefore(playerMenuDialog, componentElement.firstChild); // Prepend the Menu Dialog
				}				
			}

			// #endregion

			let mediaControlComponent : ComponentObject = syiro.mediacontrol.New(properties); // Create a new Media Control
			let mediaControlElement : Element = syiro.component.Fetch(mediaControlComponent); // Fetch the HTMLElement

			componentElement.appendChild(mediaControlElement); // Append the Media Control
		} else { // If we are using an iPhone
			mediaPlayerProperties["NoUX"] = true; // NoUX set to true
			mediaPlayerProperties["controls"] = "controls"; // Use the build-in iOS controls
		}


		// #region Dimension Setting

		if (!syiro.utilities.TypeOfThing(properties.height, "number")){ // If height is not a number
			if (properties.type == "audio"){ // If this is an audio player
				properties.height = 60;
			} else { // If this is a video player
				properties.height = 300;
			}
		}

		if (!syiro.utilities.TypeOfThing(properties.width, "number")){ // If width is not a number
			if (properties.type == "audio"){ // If this is an audio player
				properties.width = 400; // Default to 400
			} else { // If this is a video player
				if (syiro.utilities.TypeOfThing(properties.height, "number")){ // If we have a number for height (pixels)
					properties.width = properties.height * 1.77; // Ensure we have a widescreen ratio
				} else { // If we likely have a string
					properties.width = properties.height; // Have width reflect height, like if height is set to 100%
				}
			}
		}

		for (let dimension of ["height", "width"]) { // For height and width in array
			let dimensionValue = properties[dimension];

			if (syiro.utilities.TypeOfThing(dimensionValue, "number")){ // If the dimension value is a fixed number
				properties[dimension] = dimensionValue.toString() + "px"; // Change to string and append px
			}

			syiro.style.Set(componentElement, dimension, properties[dimension]); // Set the height or width of the componentElement
		}

		// #endregion

		// #region HTMLMediaElement and inner-Source Creation

		mediaPlayerElement = syiro.utilities.ElementCreator(properties.type, mediaPlayerProperties); // Generate the correct HTMLMediaElement with the mediaPlayerProperties

		let sourceElements : Array<HTMLElement> = syiro.mediaplayer.GenerateSources(properties.type, properties.sources); // Get an array of Source Elements

		for (let sourceElement of sourceElements){ // For each sourceElement in arrayofSourceElements
			mediaPlayerElement.appendChild(sourceElement); // Append the sourceElement
		}

		// #endregion

		// #region Third-Party Streaming Support
		// This section will determine if we are using a third-party library for live streaming support (like dashjs)

		if ((typeof properties.UsingExternalLibrary == "boolean") && (properties.UsingExternalLibrary)){ // If an external library is going to be tied into the Syiro Video Player
			syiroComponentData["UsingExternalLibrary"] = true; // Set the UsingExternalLibrary to true
		}

		// #endregion

		componentElement.insertBefore(mediaPlayerElement, componentElement.firstChild); // Append the media player
		syiroComponentData["HTMLElement"] = componentElement; // Define the HTMLElement in syiroComponentData as the

		syiro.data.Write(componentObject.id, syiroComponentData); // Write the syiroComponentData of this Video Player to Syiro's Data System
		return componentObject; // Return a Component Object
	}

	// Configure
	// Configures the Media Player if necessary
	export function Configure(component : ComponentObject){
		let componentElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		let playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player
		let mediaControl = componentElement.querySelector('div[data-syiro-component="media-control"]'); // Get the Media Control

		if (syiro.data.Read(component.id + "->NoUX") == false){ // If this player has UX
			if (componentElement.getAttribute("data-syiro-component-type") == "video"){ // If this is a video-type Media Player
				componentElement.removeAttribute("data-syiro-show-video"); // Remove data-syiro-show-video attribute so the video Element is now hidden
			}

			// #region Button Attribute Resetting

			let playButton = mediaControl.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button from the Media Control
			syiro.style.Set(playButton, "background-image", ""); // Remove the background-image style / reset to play image for Play Button
			playButton.removeAttribute("active"); // Remove component-status to imply play icon is not active (in this case, paused)

			let volumeControl = mediaControl.querySelector('div[data-syiro-render-icon="volume"]'); // Get the Volume Button from the Media Control

			if (volumeControl !== null){ // If there is a volume control (there is not on iOS)
				volumeControl.removeAttribute("active"); // Remove component-status to imply volume icon is not active
			}

			// #endregion

			let isPlayableOrStreamable = syiro.mediaplayer.IsPlayable(component, true); // Check if the sources are playable (as well as streamable)
			let playerErrorNotice : Element = componentElement.querySelector('div[data-syiro-minor-component="player-error"]'); // Define playerErrorNotice as any error notice on this Player

			if (playerErrorNotice == null){ // If the playerErrorNotice doesn't exist
				playerErrorNotice = syiro.utilities.ElementCreator("div", { // Create a div to add to the player stating there is a codec error
					"data-syiro-minor-component" : "player-error", "content" : "This content is not capable of being played on this browser or device."
				});

				componentElement.insertBefore(playerErrorNotice, componentElement.firstChild); // Prepend the codecErrorElement to the Player
			}

			let innerTimeLabel : HTMLElement = mediaControl.querySelector("time"); // Get the inner time Element

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

						let playerMediaLengthInformation : Object = syiro.mediaplayer.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range
						let mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControl); // Fetch the ComponentObject of this Media Control

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

	// DurationChange
	// Triggered on durationchange of innerContentElement
	export function DurationChange(component : ComponentObject){
		if (syiro.data.Read(component.id + "->IsStreaming") == false){ // If the Player is NOT streaming content
			let componentElement = syiro.component.Fetch(component); // Fetch the Player Element
			let mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(componentElement.querySelector('div[data-syiro-component="media-control"]')); // Get the Media Control Component
			let playerRange : Element = componentElement.querySelector('div[data-syiro-minor-component="progressbar"] > input'); // Get the input range
			let playerMediaLengthInformation : Object = syiro.mediaplayer.GetPlayerLengthInfo(component); // Get information about the appropriate settings for the input range

			playerRange.setAttribute("max", playerMediaLengthInformation["max"]); // Set max attribute the playerMediaLengthInformation max key/val
			playerRange.setAttribute("step", playerMediaLengthInformation["step"]); // Set step attribute the playerMediaLengthInformation step key/val
			syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 1, playerMediaLengthInformation["max"]);
		}
	}

	// FetchInnerContentElement
	// Fetch Internal Audio or Video Element of Player container Component
	export function FetchInnerContentElement(component : ComponentObject) : HTMLMediaElement {
		let componentElement = syiro.component.Fetch(component); // Get the Player Component
		return componentElement.querySelector(componentElement.getAttribute("data-syiro-component-type")); // Return the Element fetched from querySelector (audio or video)
	}

	// FetchSources
	// Fetch Audio or Video Element Sources
	export function FetchSources(component : ComponentObject) : Array<Object> { // Return an array of source types (string)
		let innerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Fetch the inner audio or video Element from the Audio Player or Video Player Component
		let sourceTags : any = innerContentElement.querySelectorAll("source"); // Get all source tags within the innerContentElement
		let sourcesArray : Array<Object> = []; // Define sourcesArray as an empty Array to hold source information

		for (let sourceElementIndex in sourceTags){ // For each source Element in the sourceTags
			let sourceElement : any = sourceTags[sourceElementIndex]; // Get the individual source Element

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

	// GenerateSources
	// Generates source Elements
	export function GenerateSources(type : string, sources : Array<string>) : Array<HTMLElement> {
		let sourceElements : Array<HTMLElement> = []; // Define sourceElements as an array of source Elements

		for (let source of sources){ // For each source in sources
			let streamingProtocol : string = source.substr(0, source.indexOf(":")); // Get the streaming protocol (rtsp, rtmp, hls) by creating a substring, starting at 0 and ended at the protocol end mark (://)
			let sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", ""); // Get the last index of ., get the substring based on that, and then remove the period on the extension.
			let sourceTagAttributes = { "src" : source, "data-syiro-streamable-source" : "false" }; // Create an initial source tag attributes Object that we'll pass to ElementCreator

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

	// GetPlayerLengthInfo
	// Get Information about the Player's Length and reasonable step intervals
	export function GetPlayerLengthInfo(component : ComponentObject) : Object{
		let playerLengthInfo : Object = {}; // Define playerLengthInfo as an empty Object to hold length information about the audio or video
		let contentDuration : any = syiro.mediaplayer.FetchInnerContentElement(component).duration; // Get the Player's internal audio or video Element and its duration property

		if ((isNaN(contentDuration) == false) && (isFinite(contentDuration))){ // If we are able to properly fetch the duration and we are not streaming
			playerLengthInfo["max"] = contentDuration; // Set the maximum to the contentDuration

			if (contentDuration < 30){ // If the contentDuration is less than 30 seconds
				playerLengthInfo["step"] = 1; // Set the step value to 1 second.
			} else if ((contentDuration >= 30) && (contentDuration <= 60)){ // If the contentDuration is 30s to 1min
				playerLengthInfo["step"] = 2; // Set the step value to 2 seconds
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

	// IsPlayable
	// Fetch whether content in player is playable
	export function IsPlayable(component : ComponentObject, returnIsStreamble ?: boolean) : (string | boolean) {
		let componentElement : Element = syiro.component.Fetch(component); // Define componentElement as the fetched Element of the Component
		let innerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Fetch the inner content Element

		let isPlayable : boolean = false; // Set isPlayable as a boolean default to false
		let isStreamable : boolean = false; // Set isStreamable as the returned boolean

		if (syiro.data.Read(component.id + "->UsingExternalLibrary")){ // If we are using an external library
			isPlayable = true; // Set to being playable by default
			isStreamable = true; // Set to being streamable by default
		} else { // If we are not using an external library
			let sourceElementsInfo : Array<Object> = syiro.mediaplayer.FetchSources(component); // Define sourceElementsInfo as the fetched objects containing the information from the sources

			for (let sourceElementInfo of sourceElementsInfo){ // For each source in playerSources
				isPlayable = (innerContentElement.canPlayType(sourceElementInfo["type"]) !== ""); // Define isPlayable as to if we can play a particular type does not return an empty syting
				isStreamable = (sourceElementInfo["streamable"] == "true");

				if (isPlayable || isStreamable){ // If the content is playable or streamable
					break; // End the checking
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

	// IsPlaying
	// Get Information about if the Player is playing
	export function IsPlaying(component : ComponentObject) : boolean {
		let componentElement = syiro.component.Fetch(component); // Fetch the Player Element
		return !syiro.mediaplayer.FetchInnerContentElement(component).paused; // Get the value of paused on the Player and return opposite value (since we're checking if something is playing)
	}

	// IsStreamable
	// Fetch information about whether or not the content is streamable
	export function IsStreamable(component : ComponentObject) : boolean {
		return (syiro.mediaplayer.IsPlayable(component, true) == "streamable"); // Call IsPlayable, checking if returned string is "streamable"
	}

	// PlayOrPause
	// Play or Pause Audio or Video based on current state
	export function PlayOrPause(component : ComponentObject, forcePlayOrButton: any) {
		let componentElement = syiro.component.Fetch(component); // Get the Component Element of the Player
		let innerContentElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the inner audio or video Element

		if (componentElement.getAttribute("data-syiro-component-type") == "video"){ // If this is a video-type Media Player
			componentElement.setAttribute("data-syiro-show-video", "true"); // Set attribute of data-syiro-show-video to true, indicating to no longer hide the innerContentElement
		}
		
		if (!syiro.utilities.TypeOfThing(forcePlayOrButton, "boolean")){ // If forcePlay is not a boolean
			forcePlayOrButton = false; // Do not force play
		}

		if (syiro.mediaplayer.IsPlaying(component) && !forcePlayOrButton){ // If the audio or video Element is playing and we are not enforcing playback
			innerContentElement.pause(); // Pause the audio or video Element
		} else { // If the audio or video Element is paused
			innerContentElement.play(); // Play the audio or video Element
		}
	}

	// Reset Player
	// Reset the player state to default (except for volume). Handy for source changing
	export function Reset(component : ComponentObject){
		let playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		let playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player

		if (syiro.mediaplayer.IsPlaying(component)){ // If the Audio Player or Video Player is playing
			playerInnerContentElement.pause(); // Start by pausing the player to prevent timeupdate events
		}

		syiro.mediaplayer.SetTime(component, 0); // Reset the time (if it needs to be reset to zero)
		syiro.mediaplayer.Configure(component); // Re-configure the Media Player
	}

	// SetSource
	// Function for easily setting the source(s) of the Media Player
	export function SetSources(component : ComponentObject, sources : any){
		let playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		let playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player
		let contentType : string = playerInnerContentElement.nodeName.toLowerCase(); // Get the type of the Media Player based on the nodeName of the inner content Element

		if (typeof sources == "string"){ // If only a single source is defined
			sources = [sources]; // Convert to an array
		}

		let sourceElements : Array<HTMLElement> = syiro.mediaplayer.GenerateSources(contentType, sources); // Generate the source tag Elements
		playerInnerContentElement.innerHTML = ""; // Remove all inner source tags from the InnerContentElement (audio or video tag) by resetting the innerHTML

		for (let sourceElement of sourceElements){ // For each sourceElement in sourceElements
			playerInnerContentElement.appendChild(sourceElement); // Append the HTMLElement
		}

		playerInnerContentElement.setAttribute("src", sources[0]); // Set via attribute to trigger MutationObserver
		playerInnerContentElement.src = sources[0]; // Set the initial src of the audio or video player to the first source provide

		syiro.mediaplayer.Reset(component); // Reset the media player
	}

	// SetTime
	// Function for easily setting the time location of an Audio or Video Player Component
	export function SetTime(component : ComponentObject, setting : any){
		if (syiro.data.Read(component.id + "->IsStreaming") == false){ // If we are not streaming
			let componentElement = syiro.component.Fetch(component); // Define componentElement as the fetched Component Element

			let playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Define playerInnerContentElement as the HTMLMediaElement
			let currentTime : number = playerInnerContentElement.currentTime; // Set time to currentTime of the content Element
			let time : number = currentTime; // Set time to default to same as currentTime and only change if setting is a number
			let fromEvent : boolean = (typeof setting == "string"); // Set fromEvent equal to if setting is a string (update-input) or number (SetTime)

			if (!fromEvent){ // If this is not from an event
				if ((currentTime !== setting) && (setting <= playerInnerContentElement.duration)){ // If we are not setting the time to the exact same time as before or larger than the duration
					playerInnerContentElement.currentTime = setting; // Set the playerInnerContentElement's currentTime to the time provided
					time = setting; // Set time to the setting pased
				}
			}

			// #region Media Control Component & Element Defining

			let mediaControlElement = componentElement.querySelector('div[data-syiro-component="media-control"]'); // Fetch the Media Control Element
			let mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControlElement); // Get the Component Object of the Media Control
			let playerRange = mediaControlElement.querySelector('div[data-syiro-minor-component="progressbar"] > input'); // Get the input range of the Media Control

			// #endregion

			syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 0, time); // Update the label

			let isChangingInputValue : boolean = syiro.data.Read(component.id + "->IsChangingInputValue"); // Get the boolean value if we are changing the input value or not
			let allowUpdatingGradient : boolean = false;

			if (isChangingInputValue && !fromEvent){ // If we are changing the input value (calling SetTime with a number)
				allowUpdatingGradient = true;
			} else if (!isChangingInputValue && fromEvent){ // If we are NOT changing the input value and it is from an event (normal input range gradient updating from playback)
				allowUpdatingGradient = true;
			}

			if (allowUpdatingGradient){ // If we are allowing the updating of the gradient
				let roundedDownTime : number = Math.floor(time);
				playerRange.value = roundedDownTime; // Set the value to the volume (which is 0.1 to 1.0) times 10

				let priorInputSpaceWidth : number = (roundedDownTime / Number(playerRange.max)) * playerRange.clientWidth; // Get the width of the empty space before the input range thumb by getting the currentTime, dividing by the max value and times the clientWidth
				let updatedGradient : string = ""; // Default updatedGradient to an empty string

				if (time !== 0){ // If the time is not zero
					updatedGradient = "linear-gradient(to right, " + syiro.primaryColor + " " + priorInputSpaceWidth + "px, transparent 0px)"; // Define updatedGradient as the information we'd apply to linear-gradient
				}

				syiro.style.Set(playerRange, "background", updatedGradient); // Set background to updated linear-gradient
			}
		}
	}

	// SetVolume
	// Function for easily setting the volume of an Audio or Video Player
	export function SetVolume(component : ComponentObject, volume : number, fromEvent ?: string){
		let playerElement = syiro.component.Fetch(component); // Get the Audio or Video Player Component Element
		let playerInnerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Get the associated audio or video player
		let playerRange : HTMLInputElement = playerElement.querySelector('div[data-syiro-minor-component="progressbar"] > input'); // Get the Media Control Range
		let inputVolumeValue : number = volume; // Set inputVolumeValue equal to volume

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

	// ToggleFullscreen
	export function ToggleFullscreen(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Define componentElement as the fetched Element of the Video Player

		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement){ // If we are currently NOT fullscreen
			if (typeof componentElement.requestFullscreen !== "undefined"){ // If requestFullscreen is a valid function of componentElement
				componentElement.requestFullscreen(); // Define fullscreenAction as requestFullscreen
			} else if (typeof componentElement.msRequestFullscreen !== "undefined"){ // If msRequestFullscreen (IE API call for Fullscreen) is a valid function of componentElement
				componentElement.msRequestFullscreen(); // Define fullscreenAction as msRequestFullscreen
			} else if (typeof componentElement.mozRequestFullScreen !== "undefined"){ // If mozRequestFullScreen (Gecko API call for Fullscreen) is a valid function of componentElement
				componentElement.mozRequestFullScreen(); // Define fullscreenAction as mozRequestFullScreen
			} else if (typeof componentElement.webkitRequestFullscreen !== "undefined"){ // If webkitRequestFullscreen (Blink / Webkit call for Fullscreen) is a valid function of componentElement
				componentElement.webkitRequestFullscreen(); // Define fullscreenAction as webkitRequestFullscreen
			}
		} else { // If we are currently fullscreen
			if (typeof document.exitFullscreen !== "undefined"){ // If exitFullscreen is a valid function of document
				document.exitFullscreen(); // Define fullscreenAction as exitFullscreen
			} else if (typeof document.msExitFullscreen !== "undefined"){ // If msExitFullscreen (IE API call for exiting Fullscreen) is a valid function of document
				document.msExitFullscreen(); // Define fullscreenAction as msExitFullscreen
			} else if (typeof document.mozCancelFullScreen !== "undefined"){ // If mozCancelFullScreen (Gecko API call for exiting Fullscreen) is a valid function of document
				document.mozCancelFullScreen(); // Define fullscreenAction as mozCancelFullScreen
			} else if (typeof document.webkitExitFullscreen !== "undefined"){ // If webkitExitFullscreen (Blink / Webkit call for exiting Fullscreen) is a valid function of document
				document.webkitExitFullscreen(); // Define fullscreenAction as webkitExitFullscreen
			}
		}
	}

	// ToggleMenuDialog
	export function ToggleMenuDialog(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Fetch the Player Element

		let menuDialog : Element = componentElement.querySelector('div[data-syiro-minor-component="player-menu"]'); // Get the Menu Dialog
		let menuButton : Element = componentElement.querySelector('div[data-syiro-render-icon="menu"]'); // Get the menu button element

		if (syiro.style.Get(menuDialog, "visibility") !== "visible"){ // If the Menu Dialog is currently not showing
			menuButton.setAttribute("active", "true"); // Set the menu button active to true
			syiro.style.Set(menuDialog, "visibility", "visible"); // Show the menu dialog
		} else { // If the Menu dialog currently IS showing
			menuButton.removeAttribute("active"); // Remove the menu button active status
			syiro.style.Set(menuDialog, "visibility", ""); // Hide the menu dialog (removing the visibility attribute, putting the Menu Dialog back to default state)
		}
	}
}

module syiro.mediacontrol {

	// New Media Control
	export function New(properties : MediaPlayerPropertiesObject) : ComponentObject {
		let component : ComponentObject = { "id" : syiro.component.IdGen("media-control"), "type" : "media-control" }; // Generate the Component Object of the Media Control
		let componentElement = syiro.utilities.ElementCreator("div",  { "data-syiro-component" : component.type, "data-syiro-component-id" : component.id }); // Generate the basic mediaControl container

		let playButton = syiro.button.New( { "icon" : "play" } ); // Create a play button
		let progressBar : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "progressbar" }); // Create a progressbar
		let inputRange : HTMLElement = syiro.utilities.ElementCreator("input", { "type" : "range" } ); // Create an input range

		progressBar.appendChild(inputRange); // Append the input to the progressbar
		componentElement.appendChild(progressBar); // Append the progressBar
		componentElement.appendChild(syiro.component.Fetch(playButton)); // Append the play button

		if (typeof properties.generateContentInfo !== "undefined"){ // If we are adding content (for Audio Player)
			let infoSection : HTMLElement = document.createElement("section"); // Generate a section Element

			if (typeof properties.title !== "undefined"){ // If a title is defined
				infoSection.appendChild(syiro.utilities.ElementCreator("b", { "content" : properties.title})); // Create the Audio b tag and append it to the infoSection section
			}

			if (typeof properties.artist !== "undefined"){ // If an artist is defined
				infoSection.appendChild(syiro.utilities.ElementCreator("label", { "content" : properties.artist})); // Create the Artist label and append it to the infoSection section
			}

			componentElement.appendChild(infoSection); // Append the info section
		} else { // If we are not generating content info
			if (properties.type == "video"){ // If we are generated a Media Control for a video-type Media Player
				let timeStamp : HTMLElement = syiro.utilities.ElementCreator("time", { "content" : "00:00 / 00:00"} ); // Create a timestamp time element
				componentElement.appendChild(timeStamp); // Append the timestamp time element
			}
		}

		// #region Player Menu Element Creation (If Applicable)

		if (syiro.utilities.TypeOfThing(properties.menu, "ComponentObject") && (properties.menu.type == "list")){ // If the menu defined is a ComponentObject (List) with the player being video
			let menuButton = syiro.button.New( { "icon" : "menu"} ); // Generate a Menu Button
			componentElement.appendChild(syiro.component.Fetch(menuButton)); // Append the menuButton to the mediaControlElement
		}

		// #endregion

		// #region Video Player - Additional Functionality Adding

		if (properties.type == "video"){ // If the type is a video Media Player
			let fullscreenButton = syiro.button.New( { "icon" : "fullscreen"} ); // Create a fullscreen button
			componentElement.appendChild(syiro.component.Fetch(fullscreenButton)); // Append the fullscreen control
		}

		// #endregion

		if (syiro.device.OperatingSystem !== "iOS"){ // As iOS does not allow manual control of volume (it has to be done with hardware controls), check if the OS is NOT iOS before volume button generation
			let volumeButton = syiro.button.New( { "icon" : "volume" } ); // Generate a Volume Button
			componentElement.appendChild(syiro.component.Fetch(volumeButton)); // Append the volume control
		}

		syiro.data.Write(component.id + "->HTMLElement", componentElement); // Store the Component HTMLElement of the Media Control
		return component; // Return the Component Object
	}

	// ShowVolumeSlider
	export function ShowVolumeSlider(mediaControlComponent : ComponentObject, volumeButtonComponent : ComponentObject){
		let mediaControl : Element = syiro.component.Fetch(mediaControlComponent); // Fetch the Media Control Element
		let volumeButton : Element = syiro.component.Fetch(volumeButtonComponent); // Fetch the Volume Button Element

		let playerComponentObject : ComponentObject = syiro.component.FetchComponentObject(mediaControl.parentElement); // Get the Component Object of the parent Player Component
		let playerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(playerComponentObject); // Get the audio or video Element of the parent Player Component

		let playerRange : any = mediaControl.querySelector('div[data-syiro-minor-component="progressbar"] > input'); // Get the Media Control Range

		if (syiro.data.Read(playerComponentObject.id + "->IsChangingVolume") == false){ // If we are NOT already actively doing a volume change
			syiro.data.Write(playerComponentObject.id + "->IsChangingInputValue", true); // Set the IsChangingInputValue so Tick doesn't update slider while we have the Volume Slider area showing
			syiro.data.Write(playerComponentObject.id + "->IsChangingVolume", true); // Set the IsChangingVolume to true so we don't end up changing the "location" in the content

			volumeButton.setAttribute("active", "true"); // Set component active to true to imply it is active

			if (syiro.data.Read(playerComponentObject.id + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
				mediaControl.removeAttribute("data-syiro-component-streamstyling"); // Default to NOT having the Media Control "Stream Styling"
			}

			playerRange.setAttribute("max", "10"); // Set max attribute to 10 in playerRange
			playerRange.setAttribute("step", "1"); // Set step attribute to 1 in playerRange
			syiro.mediaplayer.SetVolume(playerComponentObject, playerContentElement.volume); // Call SetVolume initially to do proper playerRange gradient styling
		} else { // If we are already actively doing a volume change, meaning the user wants to switch back to the normal view
			volumeButton.removeAttribute("active"); // Remove component-active to imply volume icon is not active

			if (syiro.data.Read(playerComponentObject.id + "->IsStreaming")){ // If we are streaming content and have the player range hidden unless changing volume
				mediaControl.setAttribute("data-syiro-component-streamstyling", ""); // Default to having a "Stream Styling"
			}

			let playerMediaLengthInformation : Object = syiro.mediaplayer.GetPlayerLengthInfo(playerComponentObject); // Get information about the appropriate settings for the input range
			playerRange.setAttribute("max", playerMediaLengthInformation["max"]); // Set max attribute the playerMediaLengthInformation max key/val
			playerRange.setAttribute("step", playerMediaLengthInformation["step"]); // Set step attribute the playerMediaLengthInformation step key/val

			syiro.data.Delete(playerComponentObject.id + "->IsChangingInputValue"); // Since we not changing the volume, immediately remove  IsChangingInputValue
			syiro.data.Delete(playerComponentObject.id + "->IsChangingVolume"); // Delete the IsChangingVolume key from this Player's data
			syiro.mediaplayer.SetTime(playerComponentObject, "update-input"); // Call SetTime to update the slider to the accurate position
		}
	}

	// TimeLabelUpdater
	export function TimeLabelUpdater(component : ComponentObject, timePart : number, value : any){
		let mediaControlElement : HTMLElement = syiro.component.Fetch(component); // Get the Media Control's Element
		let playerTimeElement = mediaControlElement.querySelector("time"); // Get the time Element

		if (playerTimeElement !== null){ // If the time Element exists
			// #region Seconds Parsing to String

			let parsedSecondsToString : string = ""; // Define parsedSecondsToString as our converted seconds to Object then concatenated string

			if (typeof value == "number"){ // If we passed a number
				let timeFormatObject = syiro.utilities.SecondsToTimeFormat(value); // Get the time format (rounded down value)

				for (let timeObjectKey in timeFormatObject){ // For each key in the timeObject
					let timeObjectValue = timeFormatObject[timeObjectKey]; // Set timeObjectValue as the value based on key

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

			let playerTimeElementParts = playerTimeElement.textContent.split(" / "); // Split time textContent based on " / "
			playerTimeElementParts[timePart] = parsedSecondsToString; // Set the value of the part specified
			playerTimeElement.textContent = playerTimeElementParts[0] + " / " + playerTimeElementParts[1];
		}
	}

	// Toggle
	// Toggle the Media Control
	export function Toggle(component : ComponentObject, forceShow ?: boolean){
		let mediaControlElement : Element = syiro.component.Fetch(component); // Fetch the Syiro Media Control Component Element
		let currentAnimationStored : string; // Define currentAnimationStored as an undefined string

		if (mediaControlElement.hasAttribute("data-syiro-animation")){ // If the Media Control Element has an animation attribute
			currentAnimationStored = mediaControlElement.getAttribute("data-syiro-animation"); // Get the current animation stored in "data-syiro-animation"
		}

		if (typeof forceShow !== "boolean"){ // If we are passed eventData rather than a boolean
			forceShow = null; // Set forceShow to null
		}

		if (forceShow){ // If we are forcing to show the Media Control
			syiro.animation.FadeIn(component); // Fade in the Media Control
		} else if (forceShow == false){ // If we are forcing to hide the Media Control
			syiro.animation.FadeOut(component); // Fade out the Media Control
		} else if ((typeof forceShow == "undefined") || (forceShow == null)){ // If the forceShow is not defined or defined as null
			if ((currentAnimationStored == "fade-out") || (mediaControlElement.hasAttribute("data-syiro-animation") == false)){ // If the current status is the Media Control is faded out OR the Media Control does not have the animation attribute
				syiro.animation.FadeIn(component); // Fade in the Media Control
			} else { // If the current status is the Media Control is faded in (showing)
				syiro.animation.FadeOut(component); // Fade out the Media Control
			}
		}
	}

}