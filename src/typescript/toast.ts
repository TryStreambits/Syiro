/*
 This is the namespace for Syiro Toast component.
 Contrary to common belief, this does not actually have anything to do with toast.
*/

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />

// #region Syiro Toast Component

namespace syiro.toast {

	// #region Generate Function

	export function New(properties : Object){
		if ((typeof properties["type"] == "undefined") || ((properties["type"] !== "normal") && (properties["type"] !== "dialog"))){ // If no "type" is defined or it was defined as NOT normal or dialog
			properties["type"] = "normal"; // Define as a "normal" Toast
		}

		if ((typeof properties["title"] == "undefined") && (properties["type"] == "dialog")){ // If no title was provided for this Dialog Toast
			properties["type"] = "normal"; // Define as a "normal" Toast
		}

		var componentId = syiro.component.IdGen("toast"); // Generate a Component Id for this Toast
		var componentElement : Element = syiro.utilities.ElementCreator("div", { "data-syiro-component-id" : componentId, "data-syiro-component" : "toast", "data-syiro-component-type" : properties["type"] }); // Generate the Toast container

		// #region Title Generation / Properties Redirect

		if (typeof properties["title"] !== "undefined"){ // If a title is defined
			if (typeof properties["message"] !== "undefined"){ // If a message is defined (meaning don't do a properties change
				var titleLabel : Element = syiro.utilities.ElementCreator("label", { "content" : properties["title"] }); // Generate a title
				componentElement.appendChild(titleLabel); // Append the label to the componentElement
			}
			else { // If a message is not defined, do a properties change
				properties["message"] = properties["title"] ; // Redefine message as title content
				delete properties["title"]; // Delete title from properties
			}
		}

		// #endregion

		var message : Element = syiro.utilities.ElementCreator("span", { "content" : properties["message"] }); // Generate a span to hold the message content
		componentElement.appendChild(message); // Append the message span to the componentElement

		// #region Toast Buttons Generation

		if (typeof properties["title"] !== "undefined"){ // If both a title and message are provided (only check title since if title is provided but no message, it is automatically changed to message and therefore title = undefined
			var toastButtonsContainer : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "toast-buttons" }); // Create a "container" to hold the Buttons
			var futureButtonHandlers : Object = {}; // Define futureButtonHandlers as an Object

			// #region Buttons Properties Check

			if (typeof properties["buttons"] == "undefined"){ // If no Buttons were provided
				properties["buttons"] = [{ "action" : "deny", "content" : "Ok" }]; // Default the content to "Ok"
			}

			// #endregion

			// #region Deny Before Affirm Button Checking

			if (properties["buttons"][0]["action"] == "affirm"){ // If the affirm action is provided before the deny action
				properties["buttons"].reverse(); // Reverse the array
			}

			// #endregion

			for (var toastButtonProperties of properties["buttons"]){ // For each Toast Button Properties Object of properties["buttons"]
				if (typeof toastButtonProperties["content"] == "undefined"){ // If content is not defined
					if (toastButtonProperties["action"] == "deny"){ // If this is a "deny" action
						toastButtonProperties["content"] = "No"; // Simply set to "No"
					}
					else{ // If this is an "affirm" action
						toastButtonProperties["content"] = "Yes"; // Simply set to "Yes"
					}
				}

				if (typeof toastButtonProperties["function"] !== "undefined"){ // If a function was defined for this action
					futureButtonHandlers[toastButtonProperties["action"]] =  toastButtonProperties["function"]; // Push to the futureButtonHandlers Object a key/val where the action is the key and value is the func
				}

				var toastButtonObject : Object = syiro.button.New({ "type" : "basic", "content" : toastButtonProperties["content"] });
				var toastButtonElement : Element = syiro.component.Fetch(toastButtonObject); // Fetch the Button Element
				toastButtonElement.setAttribute("data-syiro-dialog-action", toastButtonProperties["action"]); // Set the dialog-action of attribute of the toastButtonElement

				toastButtonsContainer.appendChild(toastButtonElement); // Append the Toast Button Element to the Toast Buttons Container
			}

			componentElement.appendChild(toastButtonsContainer); // Append the Toast Buttons Container

			if (Object.keys(futureButtonHandlers).length !== 0){ // If the Future Button Handlers Object is not empty
				syiro.data.Write(componentId + "->ActionHandlers", futureButtonHandlers); // Write to componentId -> ActionHandlers the handlers
			}
		}
		else{ // If just a message is provided
			var closeIconButtonObject : Object = syiro.button.New({ "type" : "basic", "content": "x" }); // TEMP "x" LABEL
			componentElement.appendChild(syiro.component.Fetch(closeIconButtonObject)); // Append the closeIconButton (that we fetch from closeIconButtonObject) to the Toast
		}

		// #endregion

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "toast" }; // Return a Component Object
	}

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Clear - This function will remove a specific Toasts from DOM

	export function Clear(component : Object){
		var componentElement = syiro.component.Fetch(component); // Fetch the componentElement

		if (componentElement !== null){ // If the componentElement exists
			syiro.toast.Toggle(component, "hide"); // Force hide if it isn't hidden already
			syiro.component.Remove(component); // Remove this Toast from the DOM
		}
	}

	// #endregion

	// #region ClearAll - This function is a helper function for removing all Toasts from DOM

	export function ClearAll(){
		var toasts : NodeList = document.body.querySelectorAll('div[data-syiro-component="toast"]'); // Get all Toasts

		if (toasts.length !== 0){ // If there are Toasts in the DOM
			for (var i = 0; i < toasts.length; i++){ // For each toast in toasts
				var toastComponentObject : Object = syiro.component.FetchComponentObject(toasts[i]); // Get the Component Object of this Toast
				syiro.toast.Clear(toastComponentObject); // Clear this Toast
			}
		}
	}

	// #endregion

	// #region Toggle - This function will show or hide a particular Toast

	export function Toggle(component : Object, action ?: string){
		var componentElement = syiro.component.Fetch(component); // Fetch the componentElement

		if (componentElement !== null){ // If the componentElement exists
			var currentAnimation = componentElement.getAttribute("data-syiro-animation"); // Get the currentAnimation (if any, none being null)
			var showAnimation = true; // Default to "show" animation
			var toastType = componentElement.getAttribute("data-syiro-component-type"); // Get the type of this Toast ("normal" or "dialog")
			var toastContentOverlayElement  : Element = document.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="toast"]'); // Get the Toast ContentOverlay if it exists

			if (typeof action !== "string"){ // If an action wasn't provided or it wasn't a string ("show" / "hide")
				if (toastType == "normal"){ // If this is a Normal Toast
					if ((syiro.device.width > 1024) && (currentAnimation == "slide")){ // If the document width is "large" and we did a Slide In
						showAnimation = false; // Slide Out the Normal Toast
					}
					else if ((syiro.device.width <= 1024) && ((currentAnimation == "fade-in") || (currentAnimation == "slide"))){ // If the document width is "small" and we did a Fade In or Slide (a Slide would happen if we had a large document width which "shrunk" down)
						showAnimation = false; // Fade Out the Normal Toast
					}
				}
				else if (toastType == "dialog"){ // If this is a Dialog Toast
					if (currentAnimation == "fade-in"){ // If we did a Fade In
						showAnimation = false; // Fade Out the Dialog Toast
					}
				}
			}
			else{ // If an action was provided
				if (action == "hide"){ // If we are forcing hide
					showAnimation = false; // Set to false
				}
			}

			if ((showAnimation == true) && ((syiro.device.width > 1024) && (toastType == "normal"))){ // If we are showing the Toast, document width is "large" and this is a Normal Toast
				syiro.animation.Slide(component); // Slide the Toast
			}
			else if ((showAnimation == true) && (((syiro.device.width <= 1024) && (toastType == "normal")) || (toastType == "dialog"))){ // If we are showing the Toast and it is either a Normal Toast w/ document width "small" OR a Dialog Toast
				 syiro.animation.FadeIn(component, // Fade In the Toast Notification
				 	function(){
					 	var toastElement = syiro.component.Fetch(component); // Get the Toast Element

						 if (toastElement.getAttribute("data-syiro-component-type") == "dialog"){
							 var toastContentOverlayElement  : Element = document.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="toast"]'); // Get the Toast ContentOverlay if it exists
						 	syiro.component.CSS(toastContentOverlayElement, "display", "block"); // Show the toastContentOverlayElement under the Sidepane
						 }
					 }
				 );
			}
			else if ((showAnimation == false) && ((syiro.device.width> 1024) && (toastType == "normal"))){ // If we are hiding the Toast, document width is "large" and this is a Normal Toast
				syiro.animation.Reset(component); // Simply reset the Toast
			}
			else if ((showAnimation == false) && (((syiro.device.width <= 1024) && (toastType == "normal")) || (toastType == "dialog"))){ // If we are hiding the Toast and it is either a Normal Toast w/ document width "small" OR a Dialog Toast
				 syiro.animation.FadeOut(component, // Fade Out the Toast Notification
				 	function(){
						 var toastElement = syiro.component.Fetch(component); // Get the Toast Element

						 if (toastElement.getAttribute("data-syiro-component-type") == "dialog"){
							 var toastContentOverlayElement  : Element = document.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="toast"]'); // Get the Toast ContentOverlay if it exists
							syiro.component.CSS(toastContentOverlayElement, "display", ""); // Hide the toastContentOverlayElement
						 }
					 }
				 );
			}
		}
	}

	// #endregion

}

// #endregion