/*
	This is the namespace for Syiro's init system
*/

/// <reference path="components/mediaplayer.ts" />
/// <reference path="interfaces/core.ts" />
/// <reference path="component.ts" />
/// <reference path="style.ts" />

namespace syiro.init {

	// Parser
	// Determines what the Component is and does the correct initialization
	export function Parser(componentElement : Element){
		if ((componentElement.localName !== null) && (syiro.utilities.TypeOfThing(componentElement.hasAttribute, "function")) && (componentElement.hasAttribute("data-syiro-component"))){ // If the element is a Syiro component
			let component = syiro.component.FetchComponentObject(componentElement); // Fetch the (potential) Component Object of the componentElement

			switch (component.type) { // Do initialization based on Component Object type
				case "button" : // If it is a Button Component
					if (componentElement.getAttribute("data-syiro-component-type") !== "basic"){ // If it is a Dropdown or Toggle Button Component type
						syiro.events.Add(syiro.events.Strings["up"], component, syiro.button.Toggle); // Add the syiro.button.Toggle event to the Button types Dropdown and Toggle
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
					break;
				case "picture" : // If the Component is a Picture Component
					syiro.init.Picture(component);
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

			let innerComponentElements : any = componentElement.querySelectorAll('div[data-syiro-component]'); // Get every inner Syiro Component within this Component Element

			for (let childComponentElement of innerComponentElements){ // For each Syiro Component
				syiro.init.Parser(childComponentElement); // Also parse this childNode
			}

			// #endregion

			syiro.data.Delete(component.id + "->HTMLElement"); // Ensure the Component's Element stored via syiro.data is deleted
		}
	}

	// createContentOverlay
	// This function creates a Content Overlay
	export function createContentOverlay(purpose : string): Element {
		let contentOverlay : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "overlay", "data-syiro-overlay-purpose" : purpose}); // Generate an Content Overlay
		document.body.appendChild(contentOverlay); // Append the contentOverlay to the body
		return contentOverlay; // Return the contentOverlay variable
	}

	// Buttongroup Initialization
	export function Buttongroup(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element
		let innerButtons : any = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all the Button Components inside this Buttongroup

		for (let innerButton of innerButtons){ // For each Button Component in the Buttongroup
			let buttonComponentObject = syiro.component.FetchComponentObject(innerButton); // Get the buttonComponentObject
			syiro.events.Add(syiro.events.Strings["up"], buttonComponentObject, syiro.buttongroup.Toggle); // Immediately enable parent toggling for this Button
		}
	}

	// Grid Initialization
	export function Grid(component : ComponentObject){
		syiro.events.Add(syiro.events.Strings["orientationchange"], syiro.device.OrientationObject, syiro.grid.Scale.bind(this, component)); // Add an event listener on orientationchange to scale this Grid
		syiro.events.Add("resize", window, syiro.grid.Scale.bind(this, component)); // Add an event listener on window resize to scale this Grid

		syiro.grid.Scale(component); // Do an initial Grid scaling
	}

	// List Initialization
	export function List(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		if (componentElement.parentElement.getAttribute("data-syiro-minor-component") == "list-content"){ // If the List is nested in another List
			let listHeader : Element = componentElement.querySelector('div[data-syiro-minor-component="list-header"]'); // Get the listHeader of the List
			syiro.events.Add(syiro.events.Strings["up"], listHeader, syiro.list.Toggle); // Add an up event to Toggle the showing / hiding of the List's content
		}
	}

	// MediaPlayer Initialization
	export function MediaPlayer(component : ComponentObject){
		if (syiro.data.Read(component.id + "->NoUX") == false){ // If we are apply UX to events to the Player
			let componentElement : Element = syiro.component.Fetch(component); // Fetch the ComponentElement of the Media Player
			let innerContentElement : HTMLMediaElement = syiro.mediaplayer.FetchInnerContentElement(component); // Fetch the Player content Element

			let mediaControlArea = componentElement.querySelector('div[data-syiro-component="media-control"]'); // Get the Media Control section
			let mediaControlComponent : ComponentObject = syiro.component.FetchComponentObject(mediaControlArea); // Get the Media Control Component Object

			// #region ContextMenu Prevention

			syiro.events.Add("contextmenu", innerContentElement,
				function(){
					let e : Event = arguments[1]; // Get the Mouse Event typically passed to the function
					e.preventDefault();
				}
			);

			// #endregion

			// #region Audio / Video Player Timing Events

			syiro.events.Add("durationchange", innerContentElement, syiro.mediaplayer.DurationChange.bind(this, component)); // Add durationchange event to innerContentElement that calls syiro.mediaplayer.DurationChange with bound componentObject

			syiro.events.Add("timeupdate", innerContentElement, function(){ // Have timeupdate call a function, which calls SetTime with only the Component Object
				syiro.mediaplayer.SetTime(arguments[0], "update-input"); // Call SetTime with arguments[0] (Component Object) and "update-input"
			}.bind(this, component));

			syiro.events.Add("ended", innerContentElement, syiro.mediaplayer.Reset.bind(this, component)); // Add ended event to innerContentElement that calls syiro.mediaplayer.Reset with bound componentObject

			let playButton : Element = mediaControlArea.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button Element

			syiro.events.Add("playing", innerContentElement, function(){ // Have the play event trigger updating the play button
				let playButton : HTMLElement = arguments[0];
				playButton.setAttribute("active", "pause"); // Set the active attribute to "pause" to indicate your next action will pause the player
			}.bind(this, playButton));

			syiro.events.Add("pause", innerContentElement, function(){ // Have the pause event trigger updating the play button
				let playButton : HTMLElement = arguments[0];
				playButton.removeAttribute("active"); // Remove the active attribute if it exists, to indicate your next action will be to play
			}.bind(this, playButton));

			// #endregion

			syiro.init.MediaControl(component, mediaControlComponent); // Initialize the MediaControl and inner Buttons

			// #region Type Specific Initialization

			if (componentElement.getAttribute("data-syiro-component-type") == "video"){ // If this is a video-type Media Player
				if (syiro.device.SupportsTouch){ // If the device supports touch
					syiro.events.Add(syiro.events.Strings["up"], component, syiro.mediacontrol.Toggle.bind(this, mediaControlComponent)); // Add an "up" event to player container that toggles the Media Control
				} else { // If the device uses a mouse instead of touch
					syiro.events.Add(syiro.events.Strings["up"], innerContentElement, syiro.mediaplayer.PlayOrPause.bind(this, component)); // Add an "up" event to video to toggle play / pause the video
					syiro.events.Add(["mouseenter", "mouseleave"], componentElement, syiro.mediacontrol.Toggle.bind(this, mediaControlComponent)); // Add event to mouseenter and mouseleave to trigger syiro.mediacontrol.Toggle
				}
			}

			// #endregion

			syiro.utilities.Run(function(component : ComponentObject, componentElement : Element){
				let backgroundArt : any = syiro.data.Read(component.id + "->BackgroundImage"); // Get any background image stored for this Media Player

				if (backgroundArt !== false){
					syiro.style.Set(componentElement, "background-image", 'url("' + backgroundArt + '")'); // Set it as the background image of the player
				}
			}.bind(this, component, componentElement));

			syiro.mediaplayer.Configure(component); // Configure the Media Player
		}
	}

	// MediaControl Initialization
	export function MediaControl(componentObject : ComponentObject, mediaControlComponentObject : ComponentObject){
		let mediaControlElement : Element = syiro.component.Fetch(mediaControlComponentObject); // Fetch the Media Control Element

		// Player Range Initialization

		let playerRange = mediaControlElement.querySelector('div[data-syiro-minor-component="progressbar"] > input'); // Get the input range

		syiro.events.Add(syiro.events.Strings["down"], playerRange, // Add mousedown / touchstart events to the playerRange
			function(){
				let playerComponentObject : ComponentObject = arguments[0]; // Get the Player Component Object passed as bound argument
				syiro.data.Write(playerComponentObject.id + "->IsChangingInputValue", true); // Set the ChangingInputValue to true to infer we are changing the input value of the playerRange
			}.bind(this, componentObject)
		);

		syiro.events.Add(syiro.events.Strings["up"], playerRange, // Add mouseup / touchend events to the playerRange, which calls a function to indicate we are no longer changing the input value
			function(){
				let playerComponentObject : ComponentObject = arguments[0]; // Get the Player Component Object passed as bound argument

				if (syiro.data.Read(playerComponentObject.id + "->IsChangingVolume") == false){ // If we are doing a time change and not a volume change
					syiro.data.Delete(playerComponentObject.id + "->IsChangingInputValue"); // Since we not changing the volume, immediately remove IsChangingInputValue

					if (!syiro.mediaplayer.IsPlaying(playerComponentObject)){ // If we're not playing the video
						syiro.mediaplayer.PlayOrPause(playerComponentObject, true); // Start playback
					}
				}
			}.bind(this, componentObject)
		);

		syiro.events.Add("input", playerRange, // Add input event to the playerRange, which updates either the time or volume whenever the input is changed
			function(){
				let playerComponentObject : ComponentObject = arguments[0]; // Get the Player Component Object passed as bound argument
				let playerRange : HTMLInputElement = arguments[1]; // Define playerRangeElement as the secound bound argument
				let valueNum : number = Number(playerRange.value); // Define valueNum as the converted string-to-number, where the value was the playerRange value

				if (syiro.data.Read(playerComponentObject.id + "->IsChangingVolume") !== true){ // If we are doing a time change and not a volume change
					syiro.mediaplayer.SetTime(playerComponentObject, valueNum); // Set the Time
				} else { // If we are doing a volume change
					syiro.mediaplayer.SetVolume(playerComponentObject, valueNum); // Set the volume to value of the range
				}
			}.bind(this, componentObject, playerRange)
		);

		// Play Button Listener

		let playButton : Element = mediaControlElement.querySelector('div[data-syiro-render-icon="play"]'); // Get the Play Button Element
		syiro.events.Add(syiro.events.Strings["up"], playButton, syiro.mediaplayer.PlayOrPause.bind(this, componentObject)); // Listen to up events on the playButton to the PlayOrPause (binding the component Object)

		// Volume Button Listener

		let volumeButton : Element = mediaControlElement.querySelector('div[data-syiro-render-icon="volume"]'); // Get the Volume Button Element
		let volumeButtonComponent : ComponentObject = syiro.component.FetchComponentObject(volumeButton); // Fetch the Component Object of the Volume Button so we may bind it during event adding
		syiro.events.Add(syiro.events.Strings["up"], volumeButtonComponent, syiro.mediacontrol.ShowVolumeSlider.bind(this, mediaControlComponentObject)); // Listen to up events on the volumeButton Component to ShowVolumeSlider (binding the Player Component Object)

		// Player Menu Dialog

		let menuButton = mediaControlElement.querySelector('div[data-syiro-render-icon="menu"]'); // Get the menuButton if it exists

		if (menuButton !== null){ // If the menu button exists
			let menuButtonObject : ComponentObject = syiro.component.FetchComponentObject(menuButton); // Fetch the Component object of the Menu Button
			syiro.events.Add(syiro.events.Strings["up"], menuButtonObject, syiro.mediaplayer.ToggleMenuDialog.bind(this, componentObject)); // Add an event listener to the button that calls ToggleMenuDialog, binding to the Player Component
		}

		// Fullscreen Button Listener

		let fullscreenButtonElement : Element = mediaControlElement.querySelector('div[data-syiro-render-icon="fullscreen"]'); // Define fullscreenButtonElement as the fetched Fullscreen Button

		if (fullscreenButtonElement !== null){ // If the fullscreen button exists
			syiro.events.Add(syiro.events.Strings["up"], fullscreenButtonElement, syiro.mediaplayer.ToggleFullscreen.bind(this, componentObject)); // Listen to up events on the fullscreen button
		}
	}

	// Picture Initialization
	export function Picture(component : ComponentObject){
		syiro.picture.Detect(component); // Do an initial detection of the best source for the Picture

		let detectListener : Function = function(component : ComponentObject){
			syiro.picture.Detect(component);
		}.bind(this, component);

		syiro.events.Add("resize", window, detectListener); // Listen on document resize
		syiro.events.Add(syiro.device.OrientationObject, syiro.events.Strings["orientationchange"], detectListener); // Listen on orientationchange
	}

	// Searchbox Initialization
	export function Searchbox(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		if (syiro.data.Read(component.id + "->suggestions") !== false){ // If suggestions is enabled on this Searchbox
			syiro.events.Add("keyup", componentElement.querySelector("input"), syiro.searchbox.Suggestions);// Add  an event with the Suggestions function to the Searchbox's inner input Element to listen on keyup value
			syiro.events.Add("blur", componentElement.querySelector("input"),// Add an event to the Searchbox inner input Element to listen to when it loses focus
				function(){
					let searchboxObject : ComponentObject = arguments[0]; // Define searchboxObject as a Syiro Component Object of the Searchbox
					let searchboxLinkedList : ComponentObject = syiro.component.FetchLinkedListComponentObject(searchboxObject); // Define searchboxLinkedList as the fetched Linked List Component
					syiro.style.Set(searchboxLinkedList, "visibility", "hidden"); // Hide the Linked List
				}.bind(this, component)
			);
		}

		let innerSearchboxButton = componentElement.querySelector('div[data-syiro-component="button"]'); // Get the inner Button of the Searchbox
		syiro.events.Add(syiro.events.Strings["up"], innerSearchboxButton, function(){ // Add an up event handler to the innerSearchboxButton to trigger the input handlers of the Searchbox
			let searchboxComponent : ComponentObject = arguments[0]; // Set searchboxComponent as the bound first argument
			let searchboxElement : Element = syiro.component.Fetch(searchboxComponent); // Get the Searchbox's Element
			let searchboxInput : any = searchboxElement.querySelector("input"); // Define searchboxInput as the input element we fetched
			syiro.events.Trigger("input", arguments[0]);
		}.bind(this, component));
	}

	// Sidepane Initialization
	export function Sidepane(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		let sidepaneContentOverlayElement : Element = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="sidepane"]'); // Get an existing Sidepane ContentOverlay if one exists already, no need to create unnecessary ContentOverlays
		let innerSidepaneEdge = componentElement.querySelector('div[data-syiro-minor-component="sidepane-edge"]'); // Get the Sidepane Edge
		syiro.events.Add(syiro.events.Strings["down"], innerSidepaneEdge, syiro.sidepane.GestureInit); // Bind the Sidepane Edge to GestureInit function for "down"

		if (sidepaneContentOverlayElement == null){ // If there is no overlay on the page
			sidepaneContentOverlayElement = syiro.init.createContentOverlay("sidepane"); // Create the ContentOverlay (with the purpose of the Sidepane, appending it to the page, and declare contentOverlay as the let pointing to the Element

			syiro.events.Add(syiro.events.Strings["down"], sidepaneContentOverlayElement, function(){ // Create a "down" event so Sidepane dragging doesn't trigger an "up" event
				syiro.events.Add(syiro.events.Strings["up"], arguments[1], function(){ // Create the "up" event for the contentOverlay
					syiro.sidepane.Toggle(arguments[0]); // Toggle the Sidepane
					syiro.events.Remove(syiro.events.Strings["up"], arguments[1]); // Remove the "up" event on contentOverlay
				}.bind(this, arguments[0]));
			}.bind(this, component));
		}
	}

	// Toast Initialization
	export function Toast(component : ComponentObject){
		let componentElement : Element = syiro.component.Fetch(component); // Fetch the Component Element

		let actionHandlers = syiro.data.Read(component.id + "->ActionHandlers"); // Get any potential ActionHandlers for this Toast
		let toastButtons : any = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all inner Syiro Buttons

		if (componentElement.getAttribute("data-syiro-component-type") == "dialog"){ // If this is a Dialog Toast
			let toastContentOverlayElement  : Element = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="toast"]'); // Get an existing Toast ContentOverlay if one exists already, no need to create unnecessary ContentOverlays

			if (toastContentOverlayElement == null){ // If the toastContentOverlayElement does not exist already
				toastContentOverlayElement = syiro.init.createContentOverlay("toast"); // Create the ContentOverlay (with the purpose of Toast), appending it to the page, and declare contentOverlay as the let pointing to the Element
			}
		}

		for (let toastButton of toastButtons){ // For each toastButton in toastbuttons
			let toastButtonObject : ComponentObject = syiro.component.FetchComponentObject(toastButton); // Get the Component Object of this Syiro Button

			let dialogAction = toastButton.getAttribute("data-syiro-dialog-action"); // Get the dialog-action of this Button

			syiro.events.Add(syiro.events.Strings["up"], toastButtonObject, syiro.toast.Toggle.bind(this, component)); // Add to each Button the action to Toggle (force hide) the Toast

			if (actionHandlers !== false){ // If there are actionHandlers
				if (typeof actionHandlers[dialogAction] !== "undefined"){ // If there is a function for this action
					syiro.events.Add(syiro.events.Strings["up"], toastButtonObject, actionHandlers[dialogAction]); // Assign the function from this actionHandler Object key/val to the Button
				}
			}
		}

		if (actionHandlers !== false){ // If there were actionHandlers
			syiro.data.Delete(component.id + "->ActionHandlers"); // Delete the ActionHandlers from the data of this Toast
		}
	}
}