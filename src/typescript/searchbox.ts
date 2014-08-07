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

			searchboxElement.setAttribute("placeholder", placeholderText); // Set the placeholder string
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

	}

	// #endregion

}