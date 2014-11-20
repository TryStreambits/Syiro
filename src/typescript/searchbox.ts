/*
 This is the module for Rocket Searchbox component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Rocket Searchbox Component

module rocket.searchbox {

	// #region Searchbox Generator

	export function Generate(properties : Object) : Object { // Generate a Searchbox Component and return a Component Object
		var componentId : string = rocket.generator.IdGen("searchbox"); // Generate a component Id
		var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "searchbox"); // Generate a Searchbox Element

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "icon"){ // If we are adding an icon
				componentElement.style.backgroundImage = properties["icon"]; // Set the backgroundImage to the icon URL specified
			}
			else if (propertyKey == "content"){ // If we are adding a placeholder / content
				componentElement.setAttribute("placeholder", properties["content"]); // Set the searchbox input placeholder to the one defined
			}
		}

		rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

		return { "id" : componentId, "type" : "searchbox" }; // Return a Component Object
	}

	// #endregion

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

}
