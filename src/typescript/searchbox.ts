/*
 This is the module for Rocket Searchbox component.
 */

/// <reference path="core.ts" />

// #region Rocket Searchbox Component

module rocket.searchbox {

	// #region Setting Searchbox Placeholder

	export function Set(component : Object, placeholderText : string) : boolean {
		var placeholderSettingSucceeded : boolean;

		if (component["type"] == "searchbox"){ // If the component is a Searchbox
			var searchboxElement : Element = rocket.core.Get(component); // Get the Searchbox Rocket component element

			var searchboxInputElement : HTMLInputElement = searchboxElement.getElementsByTagName("input")[0]; // Get the inner input tag of the searchboxElement
			searchboxInputElement.setAttribute("placeholder", placeholderText); // Set the placeholder string

			rocket.core.UpdateStoredComponent(component["id"], searchboxElement); // Update the storedComponent HTMLElement if necessary
			placeholderSettingSucceeded = true; // Define success as true
		}
		else{ // If the component is not a Searchbox
			placeholderSettingSucceeded = false; // Define success as false
		}

		return placeholderSettingSucceeded;
	}

	// #endregion

	// #region Listener For Searchbox. Allows per-character or on Enter / Return listening.

	export function Listen(component : Object, onEnter : boolean, callback : Function) : boolean {
		var listenerSettingSucceeded : boolean;

		if (component["type"] == "searchbox"){ // If the component is a Searchbox
			var searchboxElement : Element = rocket.core.Get(component); // Get the Searchbox Rocket component element
			var searchboxInputElement : HTMLInputElement = searchboxElement.getElementsByTagName("input")[0];

			// #region Remove existing Listeners

			searchboxInputElement.removeEventListener("keyup", function(){}); // Remove any potentially existing event listener for keyup (enter) checking
			searchboxInputElement.removeEventListener("val", function(){}); // Remove any potentially existing event listener for value (input value changing) checking

			// #endregion

			// #region Searchbox Input Handler

			rocket.core.storedComponents[component["id"]]["handler"] = [callback]; // Set the handler array of functions to an array with the callback
			component["handler"] = [callback]; // Add the array with the callback to the Rocket component Object as well

			var searchboxHandler = function(e : KeyboardEvent){ // Set searchboxHandler to a function we create and bind to
				var searchboxComponent : Object = arguments[0];
				var searchboxCallback : Function = searchboxComponent["handler"];

				var searchboxElement : Element = rocket.core.Get(searchboxComponent); //Get the Rocket component Element
				var searchboxInputElement : HTMLInputElement = searchboxElement.getElementsByTagName("input")[0];

				var searchboxValue = searchboxInputElement.value; // Get the Searchbox Input value

				if (arguments[1] == false){ // If onEnter (arguments[1]) is false
					searchboxCallback(searchboxValue); // Call the Callback with the value
				}
				else{ // If onEnter is enabled
					if (e.keyCode == 13){ // If the keyCode matches 13 (the return key keyCode)
						searchboxCallback(searchboxValue); // Call the Callback with the value
					}
				}
			}.bind(this, component, onEnter);

			// #endregion

			searchboxElement.addEventListener(
				"keyup",
				searchboxHandler
			);

			listenerSettingSucceeded = true; // Define success as true
		}
		else{ // If the component is not a Searchbox
			listenerSettingSucceeded = true; // Define success as true
		}

		return listenerSettingSucceeded;
	}

	// #endregion

}