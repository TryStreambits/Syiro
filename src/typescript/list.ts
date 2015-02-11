/*
 This is the module for Syiro List component and it's sub-component, List Item
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Syiro List Component

module syiro.list {

	// #region List Generator

	export function Generate(properties : Object) : Object { // Generate a List Component and return a Component Object
		var componentId : string = syiro.generator.IdGen("list"); // Generate a component Id
		var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "list", { "aria-live" : "polite", "id" : componentId, "role" : "listbox" }); // Generate a List Element with an ID and listbox role for ARIA purposes

		if ((typeof properties["items"] !== "undefined") && (properties["items"].length > 0)){ // If we are adding List Items
			for (var individualItemIndex in properties["items"]){ // For each list item in navigationItems Object array
				var individualItem : Object = properties["items"][individualItemIndex]; // Define individualItem as an Object

				if (individualItem["type"] !== "list-item"){ // If the individualItem is NOT a List Item Object
					individualItem = syiro.listitem.Generate(individualItem); // Generate a List Item based on the individualItem properties
				}

				componentElement.appendChild(syiro.component.Fetch(individualItem)); // Append the List Item component to the List
			}
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component

		return { "id" : componentId, "type" : "list" }; // Return a Component Object
	}

	// #endregion

	export var AddItem = syiro.component.Add; // Meta-function for adding a List Item component to a List component

	export var RemoveItem = syiro.component.Remove; // Meta-function for removing a List Item component from a List Item component

}

// #endregion

// #region List Item Component

module syiro.listitem {

	// #region List Item Generator

	export function Generate(properties : Object) : Object { // Generate a ListItem Component and return a Component Object
		var componentId : string = syiro.generator.IdGen("list-item"); // Generate a component Id
		var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "list-item", { "role" : "option" }); // Generate a List Item Element with the role as "option" for ARIA

		if (typeof properties["html"] == "undefined"){ // If we are not adding ANY HTML code to the List Item (therefore not needing nonstrict formatting)
			for (var propertyKey in properties){ // Recursive go through each propertyKey
				if (propertyKey == "control"){ // If we are adding a control
					if (properties["image"] == undefined){ // If we are not adding an image, then allow for adding a control
						var controlComponentObject = properties[propertyKey]; // Get the Syiro component's Object

						if (controlComponentObject["type"] == "button"){ // If the component is either a basic or toggle button
							var controlComponentElement : Element= syiro.component.Fetch(controlComponentObject); // Get the component's (HTML)Element
							componentElement.appendChild(controlComponentElement); // Append the component to the List Item
						}
					}
				}
				else if (propertyKey == "image"){ // If we are adding an image
					if (properties["control"] == undefined){ // If we are not adding a control, then allow for adding an image
						var imageComponent : HTMLElement = syiro.generator.ElementCreator("img", { "src" : properties["image"]} ); // Create an image with the source set the properties["image"]
						componentElement.insertBefore(imageComponent, componentElement.firstChild); // Prepend the label to the List Item component
					}
				}
				else if (propertyKey == "label"){ // If we are adding a label
					var labelComponent : HTMLElement = syiro.generator.ElementCreator("label", { "content" : properties["label"] }); // Create a label within the "label" (labelception) to hold the defined text.

					if (componentElement.querySelector("img") == null){ // If we have not added an image to the List Item
						componentElement.insertBefore(labelComponent, componentElement.firstChild); // Prepend the label to the List Item component
					}
					else{ // If an image does exist
						componentElement.appendChild(labelComponent); // Append the label after the image
					}
				}
			}
		}
		else{ // If HTML is being added to the List Item
			componentElement.setAttribute("data-syiro-nonstrict-formatting", ""); // Add the nonstrict-formatting attribute to the List Item so we know not to apply any styling
			componentElement.appendChild(properties["html"]); // Insert the HTML (which should be an Element)
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component

		return { "id" : componentId, "type" : "list-item" }; // Return a Component Object
	}

	// #endregion

	// #region Set Control in List Item

	export function SetControl(component : Object, control : Object) : boolean {
		var setControlSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

			if (typeof control == "object"){ // If the content is of type Object
				if (listItemElement.querySelector("div") !== null){ // If there is already a control inside the List Item
					listItemElement.removeChild(listItemElement.querySelector("div")); // Remove the inner Control
				}

				if (control["type"] == "button"){ // If the type of the control Component is a button
					var innerControlElement = syiro.component.Fetch(control); // Get the Element of the inner control Component

					if (innerControlElement !== null){ // If the Component Element is actually stored in syiro.data.storage
						listItemElement.appendChild(innerControlElement); // Append the control Component
						syiro.events.Remove(component); // Ensure the List Item has no Listeners after adding the new Control
						syiro.component.Update(component["id"], listItemElement); // Update the storedComponent HTMLElement if necessary

						setControlSucceeded = true; // Set setLabelSucceeded to true
					}
				}
			}
		}

		return setControlSucceeded;
	}

	// #endregion

	// #region Set Image in List Item

	export function SetImage(component : Object, content : string) : boolean {
		var setImageSucceeded : boolean = false; // Variable we return with a boolean value, defaulint to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

			if (typeof content == "string"){ // Make sure the  content is a string
				var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]'); // Define listItemControl as the potential control within the List Item Element

				if (listItemControl !== null){ // If there is already a control in the List Item
					var generatedImage = syiro.generator.ElementCreator("img", { "src" : content } ); // Generate an img
					listItemElement.removeChild(listItemControl); // Remove the listItemControl
					listItemElement.insertBefore(generatedImage, listItemElement.firstChild); // Prepend the img tag

					setImageSucceeded = true; // Set setImageSucceeded to true
				}
			}
		}

		return setImageSucceeded;
	}

	// #endregion

	// #region Set Label in List Item

	export function SetLabel(component : Object, content : string) : boolean {
		var setLabelSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

			if (typeof content == "string"){ // If the content is of type string
				var listItemLabelElement : Element; // Define listItemLabelElement to be an Element

				if (listItemElement.querySelector("label") !== null){ // If a label is already in the List Item
					listItemLabelElement = listItemElement.querySelector("label"); // Set listItemLabelElement as the queried label tag from listItemElement
				}
				else{
					listItemLabelElement = syiro.generator.ElementCreator("label"); // Create a label and assign it to the listItemLabelElement
					listItemElement.insertBefore(listItemLabelElement, listItemElement.firstChild); // Prepend the label
				}

				listItemLabelElement.textContent = content; // Set the content of the List Item Label
				setLabelSucceeded = true; // Set setLabelSucceeded to true
			}
		}

		return setLabelSucceeded;
	}

	// #endregion

}

// #endregion
