/*
 This is the module for Syiro List component and it's sub-component, List Item
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />

// #region Syiro List Component

module syiro.list {

	// #region List Generator

	export function Generate(properties : Object) : Object { // Generate a List Component and return a Component Object
		var componentId : string = syiro.component.IdGen("list"); // Generate a component Id
		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", {  "data-syiro-component" : "list", "data-syiro-component-id" : componentId, "aria-live" : "polite", "id" : componentId, "role" : "listbox" }); // Generate a List Element with an ID and listbox role for ARIA purposes

		if ((typeof properties["items"] !== "undefined") && (properties["items"].length > 0)){ // If we are adding List Items
			for (var individualItemIndex in properties["items"]){ // For each list item in navigationItems Object array
				var individualItem : Object = properties["items"][individualItemIndex]; // Define individualItem as an Object

				if (syiro.component.IsComponentObject(individualItem) == false){ // If the individualItem is NOT a List Item Object
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
		var componentId : string = syiro.component.IdGen("list-item"); // Generate a component Id
		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", {  "data-syiro-component" : "list-item", "data-syiro-component-id" : componentId, "role" : "option" }); // Generate a List Item Element with the role as "option" for ARIA

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
						var imageComponent : HTMLElement = syiro.utilities.ElementCreator("img", { "src" : properties["image"]} ); // Create an image with the source set the properties["image"]
						componentElement.insertBefore(imageComponent, componentElement.firstChild); // Prepend the label to the List Item component
					}
				}
				else if (propertyKey == "label"){ // If we are adding a label
					var labelComponent : HTMLElement = syiro.utilities.ElementCreator("label", { "content" : properties["label"] }); // Create a label within the "label" (labelception) to hold the defined text.

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

			if ((syiro.component.IsComponentObject(control)) && (control["type"] == "button")){ // If the content is a Component Object and is a Button
				if (listItemElement.querySelector("div") !== null){ // If there is already a control inside the List Item
					listItemElement.removeChild(listItemElement.querySelector("div")); // Remove the inner Control
				}

				if ((listItemElement.querySelector("label") !== null) && (listItemElement.querySelector("img") !== null)){ // If there already is an image and a label
					var innerListImage : Element = listItemElement.querySelector("img"); // Get this inner image and set it to innerlistImage
					syiro.component.Remove(innerListImage); // Remove the innerListImage
				}

				var innerControlElement = syiro.component.Fetch(control); // Get the Element of the inner control Component

				listItemElement.appendChild(innerControlElement); // Append the control Component
				syiro.events.Remove(component); // Ensure the List Item has no Listeners after adding the new Control
				syiro.component.Update(component["id"], listItemElement); // Update the storedComponent HTMLElement if necessary

				setControlSucceeded = true; // Set setLabelSucceeded to true
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

			if (typeof content == "string"){ // Make sure the content is a string
				var listItemLabel = listItemElement.querySelector("label"); // Define listItemLabel as the potential label within the List Item Element
				var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]'); // Define listItemControl as the potential control within the List Item Element

				if ((listItemLabel !== null) && (listItemControl !== null)){ // If there is already a label and control in the List Item
					syiro.component.Remove(listItemControl); // Remove this inner control
				}

				var generatedImage = syiro.utilities.ElementCreator("img", { "src" : content } ); // Generate an img
				listItemElement.insertBefore(generatedImage, listItemElement.firstChild); // Prepend the img tag

				setImageSucceeded = true; // Set setImageSucceeded to true
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

				var listItemImage = listItemElement.querySelector("img"); // Define listItemImage as the potential image within the List Item Element
				var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]'); // Define listItemControl as the potential control within the List Item Element

				if ((listItemImage !== null) && (listItemControl !== null)){ // If there is already a label and control in the List Item
					syiro.component.Remove(listItemImage); // Remove this inner control
				}

				if (listItemElement.querySelector("label") !== null){ // If a label is already in the List Item
					listItemLabelElement = listItemElement.querySelector("label"); // Set listItemLabelElement as the queried label tag from listItemElement
				}
				else{
					listItemLabelElement = document.createElement("label"); // Create a label and assign it to the listItemLabelElement
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
