/*
 This is the module for Rocket Button component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

module rocket.button {

	// #region Basic and Toggle Button Generator

	export function Generate(properties : Object) : Object { // Generate a Button Component and return a Component Object
		if (properties["type"] == undefined){ // If the type is undefined
			properties["type"] = "basic"; // Default to a basic button
		}

		var componentId : string = rocket.generator.IdGen("button"); // Generate a component Id
		var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "button", // Generate a Button Element
			{
				"data-rocket-component-type" : properties["type"] // Be more granular with exactly what type of Button this is
			}
		);

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if ((propertyKey == "icon") && (properties["type"] == "basic")){ // If we are adding an icon and the button type is basic
				rocket.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")"); // Set the backgroundImage to the icon URL specified
			}
			else if (propertyKey == "content"){ // If we are adding a label
				componentElement.textContent = properties["content"]; // Set the textContent of the button
			}
			else if ((propertyKey == "type") && (properties["type"] == "toggle")) { // If the Button type is toggle
				var buttonToggleAttributes = { "data-rocket-minor-component" : "buttonToggle"}; // Create an Object to hold the attributes we'll pass when creating the buttonToggle

				if (properties["default"] == true){ // If a default state for the button is defined as true (already active)
					buttonToggleAttributes["data-rocket-component-status"] = "true"; // Add the data-rocket-component-status attribute with "true" as the value
				}

				var buttonToggle = rocket.generator.ElementCreator("div", buttonToggleAttributes); // Create the buttonToggle of the Toggle Button
				componentElement.appendChild(buttonToggle); // Append the buttonToggle to the toggle button
			}
			else{ // If it is none of the above properties
				componentElement.setAttribute(propertyKey, properties[propertyKey]); // Treat it like an attribute
			}
		}

		rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

		return { "id" : componentId, "type" : "button" }; // Return a Component Object
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
