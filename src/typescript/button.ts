/*
 This is the module for Rocket Button component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

module rocket.button {

	// #region Function for easily adding event listeners to a Basic button
	// This is the same as using rocket.component.AddListener with click touchend MSPointerUp events

	export function AddListeners(component : Object, callback : Function){
		if (component["type"] == "button"){ // If the Rocket Component is a Button
			rocket.component.AddListeners("click touchend MSPointerUp", component, callback);
		}
	}

	// #endregion

	// #region Function for setting the label of a Button

	export function SetLabel(component : Object, content : string) : boolean { // Returns boolean value in relation to success
		var setSucceeded : boolean; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label

		var componentElement = rocket.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-rocket-component-type") == "basic")){ // If the button exists in storedComponents or DOM AND button is "basic" rather than toggle
			componentElement.textContent = content; // Set the button component textContent
			rocket.component.Update(component["id"], componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}
		else{ // If it is NOT a basic button
			setSucceeded = false; // Define setSucceeded as false
		}

		return setSucceeded; // Return the boolean value
	}

	// #endregion

}
