/*
 This is the module for Rocket Searchbox component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Rocket Searchbox Component

module rocket.searchbox {

	// #region Setting Searchbox Text / Placeholder

	export function SetText(component : Object, placeholderText : any) : void {
		var searchboxElement : Element = rocket.component.Fetch(component); // Get the Searchbox Rocket component element

		if (searchboxElement !== null){ // If the searchboxElement exists in rocket.component.storedComponents or DOM
			var searchboxInputElement : HTMLInputElement = searchboxElement.getElementsByTagName("input")[0]; // Get the inner input tag of the searchboxElement

			if (placeholderText !== false){ // If we are updating the placeholderText
				searchboxInputElement.setAttribute("placeholder", placeholderText); // Set the placeholder string
			}
			else if (placeholderText == false){ // If the placeholderText is set to false, meaning we are removing the placeholder
				searchboxInputElement.removeAttribute("placeholder"); // Remove the placeholder attribute
			}

			rocket.component.Update(component["id"], searchboxElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

	// #region Add Event Listener - Meta-function
	// This function exists so we can default to using val events. When the searchbox value changes, send to the callback

	export function AddListeners(component : Object, callback : Function) : boolean {
		var listenerSettingSucceeded : boolean;

		if (component["type"] == "searchbox"){ // If the component is a Searchbox
			listenerSettingSucceeded = rocket.component.AddListeners("keyup", component, callback);
		}
		else{ // If the component is NOT a searchbox
			listenerSettingSucceeded = false;
		}

		return listenerSettingSucceeded;
	}

	// #endregion

	// #region Remove Event Listener - Meta-function
	// This function exists so we can defualt to using val events for removal.

	export function RemoveListeners(component : Object) : boolean {
		var listenerRemovalSucceeded : boolean;

		if (component["type"] == "searchbox"){ // If the component is a Searchbox
			rocket.component.RemoveListeners("keyup", component);
			listenerRemovalSucceeded = true;
		}
		else{ // If the component is NOT a searchbox
			listenerRemovalSucceeded = false;
		}

		return listenerRemovalSucceeded;
	}

}
