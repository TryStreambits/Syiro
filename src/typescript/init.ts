/*
	This is the namespace for Syiro's init system
*/

/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

// #region Syiro Init System

namespace syiro.init {

	// #region Parser - Determines what the Component is and does the correct initialization

	export function Parser(componentElement : Element){
		if ((componentElement.localName !== null) && (componentElement.hasAttribute("data-syiro-component"))){ // If the element is a Syiro component
			var component = syiro.component.FetchComponentObject(componentElement); // Fetch the (potential) Component Object of the componentElement

			switch (component["type"]) { // Do initialization based on Component Object type
				case "button" : // If it is a Button Component
					if (componentElement.getAttribute("data-syiro-component-type") !== "basic"){ // If it is a Dropdown or Toggle Button Component type
						syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.button.Toggle); // Add the syiro.button.Toggle event to the Button types Dropdown and Toggle
					}

					break;
				case "buttongroup" : // If it is a Buttongroup Component
					syiro.init.Buttongroup(component); // Initialize the Buttongroup
					break;
				case "grid" : // If this is a Grid Component
					syiro.init.Grid(component);
					break;
				case "list" : // If the Component is a List Component
					syiro.init.List(component); // Initialize the List if needed
					break;
				case "media-player" : // If the Component is a Media Player Component
					syiro.init.MediaPlayer(component); // Initialize the Player
					syiro.render.Scale(component); // Scale  the Player
					break;
				case "searchbox" : // If it is a Searchbox Component
					syiro.init.Searchbox(component); // Initialize the Searchbox
					break;
				case "sidepane" : // If it is a Sidepane Component
					syiro.init.Sidepane(component); // Initialize the Sidepane
					break;
				case "toast" : // If it is a Toast Component
					syiro.init.Toast(component); // Initialize the Toast
					break;
			}

			// #region Recursive Inner Component Parsing

			var innerComponentElements : any = componentElement.querySelectorAll('div[data-syiro-component]'); // Get every inner Syiro Component within this Component Element

			for (var childComponentElement of innerComponentElements){ // For each Syiro Component
				syiro.init.Parser(childComponentElement); // Also parse this childNode
			}

			// #endregion

			syiro.data.Delete(component["id"] + "->HTMLElement"); // Ensure the Component's Element stored via syiro.data is deleted
		}
	}

	// #endregion

	// #region Content Overlay Creation Function

	export function createContentOverlay(purpose : string): Element {
		var contentOverlay : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "overlay", "data-syiro-overlay-purpose" : purpose}); // Generate an Content Overlay
		document.body.appendChild(contentOverlay); // Append the contentOverlay to the body
		return contentOverlay; // Return the contentOverlay variable
	}

	// #endregion

	// #region Buttongroup Initialization

	export function Buttongroup(component : ComponentObject){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element
		var innerButtons : any = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all the Button Components inside this Buttongroup

		for (var innerButton of innerButtons){ // For each Button Component in the Buttongroup
			var buttonComponentObject = syiro.component.FetchComponentObject(innerButton); // Get the buttonComponentObject
			syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle); // Immediately enable parent toggling for this Button
		}
	}

	// #endregion

	// #region Grid Initialization

	export function Grid(component : ComponentObject){
		syiro.events.Add(syiro.events.eventStrings["orientationchange"], syiro.device.OrientationObject, syiro.grid.Scale.bind(this, component)); // Add an event listener on orientationchange to scale this Grid
		syiro.events.Add("resize", window, syiro.grid.Scale.bind(this, component)); // Add an event listener on window resize to scale this Grid

		syiro.grid.Scale(component); // Do an initial Grid scaling
	}

	// #endregion

	// #region List Initialization

	export function List(component : ComponentObject){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		if (componentElement.parentElement.getAttribute("data-syiro-minor-component") == "list-content"){ // If the List is nested in another List
			var listHeader : Element = componentElement.querySelector('div[data-syiro-minor-component="list-header"]'); // Get the listHeader of the List
			syiro.events.Add(syiro.events.eventStrings["up"], listHeader, syiro.list.Toggle); // Add an up event to Toggle the showing / hiding of the List's content
		}
	}

	// #endregion

	// #region Media Player Initialization

	export function MediaPlayer(component : ComponentObject){
		if (syiro.data.Read(component["id"] + "->NoUX") == false){ // If we are apply UX to events to the Player
			var componentElement : Element = syiro.component.Fetch(component); // Fetch the ComponentElement of the Media Player
			var innerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Fetch the Player content Element
			var mediaPlayerType : string = componentElement.getAttribute("data-syiro-component-type"); // Get the type of Media Player

			// #region Media Controls List

			var mediaControlArea = componentElement.querySelector('div[data-syiro-component="media-control"]'); // Get the Media Control section
			var mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControlArea); // Get the Media Control Component Object

			// #endregion

			// #region ContextMenu Prevention

			syiro.events.Add("contextmenu", innerContentElement,
				function(){
					var e : Event = arguments[1]; // Get the Mouse Event typically passed to the function
					e.preventDefault();
				}
			);

			// #endregion

			// #region Audio / Video Player Timing Events

			syiro.events.Add("durationchange", innerContentElement, syiro.mediaplayer.DurationChange.bind(this, component)); // Add durationchange event to innerContentElement that calls syiro.mediaplayer.DurationChange with bound componentObject

			syiro.events.Add("timeupdate", innerContentElement, function(){ // Have timeupdate call a function, which calls SetTime with only the Component Object and "tick"
				syiro.mediaplayer.SetTime(arguments[0], "tick"); // Call SetTime with arguments[0] (Component Object) and "tick"
			}.bind(this, component, "tick"));

			syiro.events.Add("ended", innerContentElement, syiro.mediaplayer.Reset.bind(this, component)); // Add ended event to innerContentElement that calls syiro.mediaplayer.Reset with bound componentObject

			// #endregion

			// #region InnerContentElement Source Change Detection

			var contentElementObserver = new MutationObserver(
				function(){
					syiro.mediaplayer.Reset(arguments[0]);
				}.bind(this, component)
			);

			var contentElementObserverOptions : MutationObserverInit = { // Define mutationWatcherOptions as the options we'll pass to contentElementObserver.observe()
				childList : false, // Watch child nodes of the element we are watching
				attributes : true, // Watch for attribute changes
				characterData : false, // Don't bother to watch character data changes
				subtree: false
			};

			contentElementObserver.observe(innerContentElement, contentElementObserverOptions); // Observe the innerContentElement with the options to watch for attribute changes, calling IsPlayable

			// #endregion

			syiro.init.MediaControl(component, mediaControlComponent); // Initialize the MediaControl and inner Buttons

			// #region Type Specific Initialization

			if (mediaPlayerType== "audio"){ // If this is an audio-type Media Player
				syiro.audioplayer.CenterInformation(component); // Center the potential audio information
			} else if (mediaPlayerType == "video"){ // If this is a video-type Media Player
				if (syiro.device.SupportsTouch){ // If the device supports touch
					syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.mediacontrol.Toggle.bind(this, mediaControlComponent)); // Add an "up" event to player container that toggles the Media Control
				} else { // If the device uses a mouse instead of touch
					syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, syiro.mediaplayer.PlayOrPause.bind(this, component)); // Add an "up" event to video to toggle play / pause the video
					syiro.events.Add(["mouseenter", "mouseleave"], componentElement, syiro.mediacontrol.Toggle.bind(this, mediaControlComponent)); // Add event to mouseenter and mouseleave to trigger syiro.mediacontrol.Toggle
				}
			}

			// #endregion

			syiro.mediaplayer.Configure(component); // Configure the Media Player
		}
	}

	// #endregion

	// #region Media Control Initialization

	export function MediaControl(componentObject : ComponentObject, mediaControlComponentObject : ComponentObject){
		var mediaControlElement : Element = syiro.component.Fetch(mediaControlComponentObject); // Fetch the Media Control Element

		// #region Player Range Initialization

		var playerRange = mediaControlElement.querySelector('input[type="range"]'); // Get the input range

		syiro.events.Add(syiro.events.eventStrings["down"], playerRange, // Add mousedown / touchstart events to the playerRange
			function(){
				var playerComponentObject : ComponentObject = arguments[0]; // Get the Player Component Object passed as bound argument
				syiro.data.Write(playerComponentObject["id"] + "->IsChangingInputValue", true); // Set the ChangingInputValue to true to infer we are changing the input value of the playerRange

				if ((syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false) && (syiro.mediaplayer.IsPlaying(playerComponentObject))){ // If we are not changing the volume and the video is playing
					syiro.mediaplayer.PlayOrPause(playerComponentObject); // Pause the video
				}
			}.bind(this, componentObject)
		);

		syiro.events.Add(syiro.events.eventStrings["up"], playerRange, // Add mouseup / touchend events to the playerRange, which calls a function to indicate we are no longer changing the input value
			function(){
				var playerComponentObject : ComponentObject = arguments[0]; // Get the Player Component Object passed as bound argument
				var playerRange = arguments[1]; // Get the playerRange passed as the second argument

				if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false){ // If we are doing a time change and not a volume change
					syiro.data.Delete(playerComponentObject["id"] + "->IsChangingInputValue"); // Since we not changing the volume, immediately remove  IsChangingInputValue
					syiro.mediaplayer.PlayOrPause(playerComponentObject); // Play the video
				}
			}.bind(this, componentObject)
		);

		syiro.events.Add("input", playerRange, // Add input event to the playerRange, which updates either the time or volume whenever the input is changed
			function(){
				var playerComponentObject : ComponentObject = arguments[0]; // Get the Player Component Object passed as bound argument
				var playerRange : HTMLInputElement = arguments[1]; // Define playerRangeElement as the Element passed as the second arg

				var valueNum : number = Number(playerRange.value); // Define valueNum as the converted string-to-number, where the value was the playerRange value

				if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false){ // If we are doing a time change and not a volume change
					syiro.mediaplayer.SetTime(playerComponentObject, valueNum); // Set the Time
				}
				else{ // If we are doing a volume change
					syiro.mediaplayer.SetVolume(playerComponentObject, valueNum, "input"); // Set the volume to value of the range, diving the number by 100 to get an int from 0.0 to 1.0.
				}
			}.bind(this, componentObject)
		);

		// #endregion

		// #region Play Button Listener

		var playButton : Element = mediaControlElement.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button Element
		syiro.events.Add(syiro.events.eventStrings["up"], playButton, syiro.mediaplayer.PlayOrPause.bind(this, componentObject)); // Listen to up events on the playButton to the PlayOrPause (binding the component Object)

		// #endregion

		// #region Volume Button Listener

		var volumeButton : Element = mediaControlElement.querySelector('div[data-syiro-render-icon="volume"]'); // Get the Volume Button Element
		var volumeButtonComponent : ComponentObject = syiro.component.FetchComponentObject(volumeButton); // Fetch the Component Object of the Volume Button so we may bind it during event adding
		syiro.events.Add(syiro.events.eventStrings["up"], volumeButtonComponent, syiro.mediacontrol.ShowVolumeSlider.bind(this, mediaControlComponentObject)); // Listen to up events on the volumeButton Component to ShowVolumeSlider (binding the Player Component Object)

		// #endregion

		// #region Player Menu Dialog

		var menuButton = mediaControlElement.querySelector('div[data-syiro-render-icon="menu"]'); // Get the menuButton if it exists

		if (menuButton !== null){ // If the menu button exists
			var menuButtonObject : ComponentObject = syiro.component.FetchComponentObject(menuButton); // Fetch the Component object of the Menu Button
			syiro.events.Add(syiro.events.eventStrings["up"], menuButtonObject, syiro.mediaplayer.ToggleMenuDialog.bind(this, componentObject)); // Add an event listener to the button that calls ToggleMenuDialog, binding to the Player Component
		}

		// #endregion

		if (componentObject["type"] == "video-player"){ // If this is a Video Player Component
			// #region Video Player Fullscreen Button Enabling

			var fullscreenButtonElement : Element = mediaControlElement.querySelector('div[data-syiro-render-icon="fullscreen"]'); // Define fullscreenButtonElement as the fetched Fullscreen Button

			if (fullscreenButtonElement !== null){ // If the fullscreen button exists
				syiro.events.Add(syiro.events.eventStrings["up"], fullscreenButtonElement, syiro.mediaplayer.ToggleFullscreen.bind(this, componentObject)); // Listen to up events on the fullscreen button
			}

			// #endregion
		}
	}

	// #endregion

	// #region Searchbox Initialization

	export function Searchbox(component : ComponentObject){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		if (syiro.data.Read(component["id"] + "->suggestions") !== false){ // If suggestions is enabled on this Searchbox
			syiro.events.Add("keyup", componentElement.querySelector("input"), syiro.searchbox.Suggestions);// Add  an event with the Suggestions function to the Searchbox's inner input Element to listen on keyup value
			syiro.events.Add("blur", componentElement.querySelector("input"),// Add an event to the Searchbox inner input Element to listen to when it loses focus
				function(){
					var searchboxObject : ComponentObject = arguments[0]; // Define searchboxObject as a Syiro Component Object of the Searchbox
					var searchboxLinkedList : ComponentObject = syiro.component.FetchLinkedListComponentObject(searchboxObject); // Define searchboxLinkedList as the fetched Linked List Component
					syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important"); // Hide the Linked List
				}.bind(this, component)
			);
		}

		var innerSearchboxButton = componentElement.querySelector('div[data-syiro-component="button"]'); // Get the inner Button of the Searchbox
		syiro.events.Add(syiro.events.eventStrings["up"], innerSearchboxButton, function(){ // Add an up event handler to the innerSearchboxButton to trigger the input handlers of the Searchbox
			var searchboxComponent : ComponentObject = arguments[0]; // Set searchboxComponent as the bound first argument
			var searchboxElement : Element = syiro.component.Fetch(searchboxComponent); // Get the Searchbox's Element
			var searchboxInput : any = searchboxElement.querySelector("input"); // Define searchboxInput as the input element we fetched
			syiro.events.Trigger("input", arguments[0]);
		}.bind(this, component));
	}

	// #endregion

	// #region Sidepane Initialization

	export function Sidepane(component : ComponentObject){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		var sidepaneContentOverlayElement : Element = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="sidepane"]'); // Get an existing Sidepane ContentOverlay if one exists already, no need to create unnecessary ContentOverlays
		var innerSidepaneEdge = componentElement.querySelector('div[data-syiro-minor-component="sidepane-edge"]'); // Get the Sidepane Edge
		syiro.events.Add(syiro.events.eventStrings["down"], innerSidepaneEdge, syiro.sidepane.GestureInit); // Bind the Sidepane Edge to GestureInit function for "down"

		if (sidepaneContentOverlayElement == null){ // If there is no overlay on the page
			sidepaneContentOverlayElement = syiro.init.createContentOverlay("sidepane"); // Create the ContentOverlay (with the purpose of the Sidepane, appending it to the page, and declare contentOverlay as the var pointing to the Element

			syiro.events.Add(syiro.events.eventStrings["down"], sidepaneContentOverlayElement, function(){ // Create a "down" event so Sidepane dragging doesn't trigger an "up" event
				syiro.events.Add(syiro.events.eventStrings["up"], arguments[1], function(){ // Create the "up" event for the contentOverlay
					syiro.sidepane.Toggle(arguments[0]); // Toggle the Sidepane
					syiro.events.Remove(syiro.events.eventStrings["up"], arguments[1]); // Remove the "up" event on contentOverlay
				}.bind(this, arguments[0]));
			}.bind(this, component));
		}
	}

	// #endregion

	// #region Toast Initialization

	export function Toast(component : ComponentObject){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		var actionHandlers = syiro.data.Read(component["id"] + "->ActionHandlers"); // Get any potential ActionHandlers for this Toast
		var toastButtons : any = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all inner Syiro Buttons

		if (componentElement.getAttribute("data-syiro-component-type") == "dialog"){ // If this is a Dialog Toast
			var toastContentOverlayElement  : Element = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="toast"]'); // Get an existing Toast ContentOverlay if one exists already, no need to create unnecessary ContentOverlays

			if (toastContentOverlayElement == null){ // If the toastContentOverlayElement does not exist already
				toastContentOverlayElement = syiro.init.createContentOverlay("toast"); // Create the ContentOverlay (with the purpose of Toast), appending it to the page, and declare contentOverlay as the var pointing to the Element
			}
		}

		for (var toastButton of toastButtons){ // For each toastButton in toastbuttons
			var toastButtonObject : ComponentObject = syiro.component.FetchComponentObject(toastButton); // Get the Component Object of this Syiro Button

			var dialogAction = toastButton.getAttribute("data-syiro-dialog-action"); // Get the dialog-action of this Button

			syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, syiro.toast.Toggle.bind(this, component)); // Add to each Button the action to Toggle (force hide) the Toast

			if (actionHandlers !== false){ // If there are actionHandlers
				if (typeof actionHandlers[dialogAction] !== "undefined"){ // If there is a function for this action
					syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, actionHandlers[dialogAction]); // Assign the function from this actionHandler Object key/val to the Button
				}
			}
		}

		if (actionHandlers !== false){ // If there were actionHandlers
			syiro.data.Delete(component["id"] + "->ActionHandlers"); // Delete the ActionHandlers from the data of this Toast
		}
	}

	// #endregion

}

// #endregion
