/*
 This is the module for Syiro Searchbox component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Syiro Searchbox Component

module syiro.searchbox {

	// #region Searchbox Generator

	export function Generate(properties : Object) : Object { // Generate a Searchbox Component and return a Component Object
		var componentId : string = syiro.generator.IdGen("searchbox"); // Generate a component Id
		var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "searchbox"); // Generate a Searchbox Element

		if (properties == undefined){ // If no properties were passed during the Generate call
			properties = {}; // Set as an empty Object
		}

		if (properties["content"] == undefined){ // If a placeholder text is not provided
			properties["content"] = "Search here..."; // Default to "Search here..." message
		}

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "icon"){ // If we are adding an icon
				syiro.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")"); // Set the backgroundImage to the icon URL specified
			}
			else if (propertyKey == "content"){ // If we are adding a placeholder / content
				componentElement.setAttribute("placeholder", properties["content"]); // Set the searchbox input placeholder to the one defined
			}
		}

		syiro.component.componentData[componentId] = { "HTMLElement" : componentElement }; // Add the component to the componentData

		return { "id" : componentId, "type" : "searchbox" }; // Return a Component Object
	}

	// #endregion

	// #region Setting Searchbox Text / Placeholder

	export function SetText(component : Object, placeholderText : any) : void {
		var searchboxElement : Element = syiro.component.Fetch(component); // Get the Searchbox Syiro component element

		if (searchboxElement !== null){ // If the searchboxElement exists in syiro.component.componentData or DOM
			var searchboxInputElement : HTMLInputElement = searchboxElement.getElementsByTagName("input")[0]; // Get the inner input tag of the searchboxElement

			if (placeholderText !== false){ // If we are updating the placeholderText
				searchboxInputElement.setAttribute("placeholder", placeholderText); // Set the placeholder string
			}
			else if (placeholderText == false){ // If the placeholderText is set to false, meaning we are removing the placeholder
				searchboxInputElement.removeAttribute("placeholder"); // Remove the placeholder attribute
			}

			syiro.component.Update(component["id"], searchboxElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

}
