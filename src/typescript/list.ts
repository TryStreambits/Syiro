/*
 This is the module for Rocket List component and it's sub-component, List Item
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Rocket List Component

module rocket.list {

	// #region List Generator

	export function Generate(properties : Object) : Object { // Generate a List Component and return a Component Object
		var componentId : string = rocket.generator.IdGen("list"); // Generate a component Id
		var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "list"); // Generate a List Element

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "items"){ // If we are adding navigation elements
				for (var individualItemIndex in properties["items"]){ // For each list item in navigationItems Object array
					var individualItem : Object = properties["items"][individualItemIndex]; // Define individualItem as an Object

					if (individualItem["type"] !== "list-item"){ // If the individualItem is NOT a List Item Object
						individualItem = rocket.listitem.Generate(individualItem); // Generate a List Item based on the individualItem properties
					}

					componentElement.appendChild(rocket.component.Fetch(individualItem)); // Append the List Item component to the List
					delete rocket.component.storedComponents[individualItem["id"]]; // Delete the HTMLElement from the component in the storedComponents
				}
			}
		}

		rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

		return { "id" : componentId, "type" : "list" }; // Return a Component Object
	}

	// #endregion

	export var AddItem = rocket.component.Add; // Meta-function for adding a List Item component to a List component

	export var RemoveItem = rocket.component.Remove; // Meta-function for removing a List Item component from a List Item component

}

// #endregion

// #region List Item Component

module rocket.listitem {

	// #region List Item Generator

	export function Generate(properties : Object) : Object { // Generate a ListItem Component and return a Component Object
		var componentId : string = rocket.generator.IdGen("list-item"); // Generate a component Id
		var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "list-item"); // Generate a List Item Element

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "control"){ // If we are adding a control
				var controlComponentObject = properties[propertyKey]; // Get the Rocket component's Object

				if (controlComponentObject["type"] == "button"){ // If the component is either a basic or toggle button
					var controlComponentElement : Element= rocket.component.Fetch(controlComponentObject); // Get the component's (HTML)Element
					componentElement.appendChild(controlComponentElement); // Append the component to the List Item

					delete rocket.component.storedComponents[controlComponentObject["id"]]; // Delete the Component from the storedComponents
				}
			}
			else if (propertyKey == "label"){ // If we are adding a label
				var labelComponent : HTMLElement = rocket.generator.ElementCreator(null, "label", // Create a label within the "label" (labelception) to hold the defined text.
					{
						"content" : properties["label"] // Set the text content of the Dropdown's label label (yes, two intentional labels) to the text defined
					}
				);
				componentElement.insertBefore(labelComponent, componentElement.firstChild); // Prepend the label to the List Item component
			}
		}

		rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

		return { "id" : componentId, "type" : "list-item" }; // Return a Component Object
	}

	// #endregion

	// #region Set Label in List Item

	export function SetLabel(component : Object, content : string) : boolean {
		var setLabelSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = rocket.component.Fetch(component); // Get the List Item Element

			if (typeof content == "string"){ // If the content is of type string
				var listItemLabelElement : Element; // Define listItemLabelElement to be an Element

				if (listItemElement.querySelector("label") !== null){ // If a label is already in the List Item
					listItemLabelElement = listItemElement.querySelector("label"); // Set listItemLabelElement as the queried label tag from listItemElement
				}
				else{
					listItemLabelElement = rocket.generator.ElementCreator(null, "label"); // Create a label and assign it to the listItemLabelElement
					listItemElement.insertBefore(listItemLabelElement, listItemElement.firstChild); // Prepend the label
				}

				listItemLabelElement.textContent = content; // Set the content of the List Item Label
				setLabelSucceeded = true; // Set setLabelSucceeded to true
			}
		}

		return setLabelSucceeded;
	}

	// #endregion

	// #region Set Control in List Item

	export function SetControl(component : Object, control : Object) : boolean {
		var setControlSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = rocket.component.Fetch(component); // Get the List Item Element

			if (typeof control == "object"){ // If the content is of type Object
				if (listItemElement.querySelector("div") !== null){ // If there is already a control inside the List Item
					listItemElement.removeChild(listItemElement.querySelector("div")); // Remove the inner Control
				}

				if (control["type"] == "button"){ // If the type of the control Component is a button
					var innerControlElement = rocket.component.Fetch(control); // Get the Element of the inner control Component

					if (innerControlElement !== null){ // If the Component Element is actually stored in rocket.component.storedComponents
						delete rocket.component.storedComponents[control["id"]]; // Delete the Element from storedComponents
						listItemElement.appendChild(innerControlElement); // Append the control Component
						rocket.component.RemoveListeners(component); // Ensure the List Item has no Listeners after adding the new Control
						rocket.component.Update(component["id"], listItemElement); // Update the storedComponent HTMLElement if necessary

						setControlSucceeded = true; // Set setLabelSucceeded to true
					}
				}
			}
		}

		return setControlSucceeded;
	}

	// #endregion

}

// #endregion
