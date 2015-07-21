/*
    This is the module for Syiro's init system
*/

/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

// #region Syiro Init System

module syiro.init {

	// #region Parser - Determines what the Component is and does the correct initialization

	export function Parser(componentElement : Element){
		if ((componentElement.localName !== null) && (componentElement.hasAttribute("data-syiro-component"))){ // If the element is a Syiro component
			var componentObject = syiro.component.FetchComponentObject(componentElement); // Fetch the (potential) Component Object of the componentElement

			switch (componentObject["type"]) { // Do initialization based on Component Object type
				case "button" : // If it is a Button Component
					if (componentElement.getAttribute("data-syiro-component-type") !== "basic"){ // If it is a Dropdown or Toggle Button Component type
						syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.button.Toggle); // Add the syiro.button.Toggle event to the Button types Dropdown and Toggle
					}

					break;
				case "buttongroup" : // If it is a Buttongroup Component
					syiro.init.Buttongroup(componentObject); // Initialize the Buttongroup
					break;
				case "audio-player" : // If the Component is an Audio Player Component
					syiro.player.Init(componentObject); // Initialize the Player  - WILL BE MERGED INTO SYIRO.INIT
					syiro.render.Scale(componentObject); // Scale  the Player
					break;
				case "video-player" : // If the Component is an Video Player Component
					syiro.player.Init(componentObject); // Initialize the Player  - WILL BE MERGED INTO SYIRO.INIT
					syiro.render.Scale(componentObject); // Scale  the Player
					break;
				case "searchbox" : // If it is a Searchbox Component
					syiro.init.Searchbox(componentObject); // Initialize the Searchbox
					break;
				case "sidepane" : // If it is a Sidepane Component
					syiro.init.Sidepane(componentObject); // Initialize the Sidepane
					break;
				case "toast" : // If it is a Toast Component
					syiro.init.Toast(componentObject); // Initialize the Toast
					break;
			}

			// #region Recursive Inner Component Parsing

			var innerComponentElements : any = componentElement.querySelectorAll('div[data-syiro-component]'); // Get every inner Syiro Component within this Component Element

			for (var childComponentElement of innerComponentElements){ // For each Syiro Component
				syiro.init.Parser(childComponentElement); // Also parse this childNode
			}

			// #endregion

			syiro.data.Delete(componentObject["id"] + "->HTMLElement"); // Ensure the Component's Element stored via syiro.data is deleted
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

	export function Buttongroup(componentObject : Object){
		var componentElement : Element = syiro.component.Fetch(componentObject); // Fetch the Component Element
		var innerButtons : any = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all the Button Components inside this Buttongroup

		for (var innerButton of innerButtons){ // For each Button Component in the Buttongroup
			var buttonComponentObject = syiro.component.FetchComponentObject(innerButton); // Get the buttonComponentObject
			syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle); // Immediately enable parent toggling for this Button
		}
	}

	// #endregion

	// #region Searchbox Initialization

	export function Searchbox(componentObject : Object){
		if (syiro.data.Read(componentObject["id"] + "->suggestions") !== false){ // If suggestions is enabled on this Searchbox
			var componentElement : Element = syiro.component.Fetch(componentObject); // Fetch the Component Element

			syiro.events.Add("keyup", componentElement.querySelector("input"), syiro.searchbox.Suggestions);// Add  an event with the Suggestions function to the Searchbox's inner input Element to listen on keyup value
			syiro.events.Add("blur", componentElement.querySelector("input"),// Add an event to the Searchbox inner input Element to listen to when it loses focus
				function(){
					var searchboxObject : Object = arguments[0]; // Define searchboxObject as a Syiro Component Object of the Searchbox
					var searchboxLinkedList : Object = syiro.component.FetchLinkedListComponentObject(searchboxObject); // Define searchboxLinkedList as the fetched Linked List Component
					syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important"); // Hide the Linked List
				}.bind(this, componentObject)
			);
		}
	}

	// #endregion

	// #region Sidepane Initialization

	export function Sidepane(componentObject : Object){
		var componentElement : Element = syiro.component.Fetch(componentObject); // Fetch the Component Element

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
			}.bind(this, componentObject));
		}
	}

	// #endregion

	// #region Toast Initialization

	export function Toast(componentObject : Object){
		var componentElement : Element = syiro.component.Fetch(componentObject); // Fetch the Component Element

		var actionHandlers = syiro.data.Read(componentObject["id"] + "->ActionHandlers"); // Get any potential ActionHandlers for this Toast
		var toastButtons : any = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all inner Syiro Buttons

		if (componentElement.getAttribute("data-syiro-component-type") == "dialog"){ // If this is a Dialog Toast
			var toastContentOverlayElement  : Element = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="toast"]'); // Get an existing Toast ContentOverlay if one exists already, no need to create unnecessary ContentOverlays

			if (toastContentOverlayElement == null){ // If the toastContentOverlayElement does not exist already
				toastContentOverlayElement = syiro.init.createContentOverlay("toast"); // Create the ContentOverlay (with the purpose of Toast), appending it to the page, and declare contentOverlay as the var pointing to the Element
			}
		}

		for (var toastButton of toastButtons){ // For each toastButton in toastbuttons
			var toastButtonObject : Object = syiro.component.FetchComponentObject(toastButton); // Get the Component Object of this Syiro Button

			var dialogAction = toastButton.getAttribute("data-syiro-dialog-action"); // Get the dialog-action of this Button

			syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, syiro.toast.Toggle.bind(this, componentObject)); // Add to each Button the action to Toggle (force hide) the Toast

			if (actionHandlers !== false){ // If there are actionHandlers
				if (typeof actionHandlers[dialogAction] !== "undefined"){ // If there is a function for this action
					syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, actionHandlers[dialogAction]); // Assign the function from this actionHandler Object key/val to the Button
				}
			}
		}

		if (actionHandlers !== false){ // If there were actionHandlers
			syiro.data.Delete(componentObject["id"] + "->ActionHandlers"); // Delete the ActionHandlers from the data of this Toast
		}
	}

	// #endregion

}

// #endregion