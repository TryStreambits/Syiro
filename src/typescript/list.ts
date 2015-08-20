/*
 This is the namespace for Syiro List component and it's sub-component, List Item
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />

// #region Syiro List Component

namespace syiro.list {

	// #region List Generator

	export function New(properties : Object) : Object { // Generate a List Component and return a Component Object
		var componentId : string = syiro.component.IdGen("list"); // Generate a component Id
		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", {  "data-syiro-component" : "list", "data-syiro-component-id" : componentId, "aria-live" : "polite", "id" : componentId, "role" : "listbox" }); // Generate a List Element with an ID and listbox role for ARIA purposes

		if ((typeof properties["items"] !== "undefined") && (properties["items"].length > 0)){ // If we are adding sub-Lists or List Items

			if (typeof properties["header"] !== "undefined"){ // If a List Header is defined
				var listHeaderElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "list-header", "content" : properties["header"]}); // Generate the listHeaderElement
				componentElement.appendChild(listHeaderElement); // Add the listHeaderElement
			}

			// #region Sub-List and List Item Adding

			var listContentContainer : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "list-content" }); // Create the listContent container

			for (var individualItem of properties["items"]){ // For each list item in navigationItems Object array
				var individualItemComponentObject : Object; // Define individualItemComponentObject as the Component Object of the individualitem
				var typeOfIndividualItem : string = syiro.utilities.TypeOfThing(individualItem); // Get the type of the individualItem

				if (typeOfIndividualItem == "ComponentObject"){ // If this is a Component Object
					individualItemComponentObject = individualItem; // Define individualItemComponentObject as the individualItem
				}
				else if (typeOfIndividualItem == "Object"){ // If this is an Object
					if ((typeof individualItem["header"] !== "undefined") && (typeof individualItem["items"] !== "undefined")){ // If this is a List (with the necessary List Header and List Items properties)
						individualItemComponentObject = syiro.list.New(individualItem); // Create a List based on the individualItem
					}
					else if ((typeof individualItem["header"] == "undefined") && (typeof individualItem["items"] == "undefined")){ // If this is a List Item
						individualItemComponentObject = syiro.listitem.New(individualItem); // Generate a List Item based on the individualItem
					}
				}

				if (typeof individualItemComponentObject !== "undefined"){ // If we have a valid Component Object
					listContentContainer.appendChild(syiro.component.Fetch(individualItemComponentObject)); // Append the List or List Item component to the List
				}
			}

			componentElement.appendChild(listContentContainer); // Append the List Content Container
		}

		// #endregion

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "list" }; // Return a Component Object
	}

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Set Header of List

	export function SetHeader(component : Object, content : any){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the componentElement of the List
		var listHeader : any = componentElement.querySelector('div[data-syiro-minor-component="list-header"]'); // Fetch the List's Header

		if (content !== ""){ // If we are adding content to the List Header (or generated a List Header)
			if (listHeader == null){ // If the listHeader does not exist
				listHeader = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "list-header" }); // Generate the listHeader
				componentElement.insertBefore(listHeader, componentElement.firstChild); // Prepend the listHeader
			}

			content = syiro.utilities.SanitizeHTML(content); // Sanitize the content

			if (typeof content == "string"){ // If the content is a string
				listHeader.innerHTML = content; // Set innerHTML to content
			}
			else{ // If it is an Element
				listHeader.innerHTML = ""; // Clean up the listHeader
				listHeader.appendChild(content); // Append the Element
			}
		}
		else if ((listHeader !== null) && (content == "")){ // If we are removing the List Header
			componentElement.removeChild(listHeader); // Remove the listHeader
		}

		syiro.component.Update(component["id"], componentElement); // Update if necessary
	}

	// #endregion

	// #region Toggle - Toggle visibility of List's inner content container

	export function Toggle(component : Object){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the componentElement of the List

		if (componentElement.parentElement.getAttribute("data-syiro-minor-component") == "list-content"){ // If this is indeed a nested List
			var listHeader : Element = componentElement.querySelector('div[data-syiro-minor-component="list-header"]'); // Fetch the List's Header
			var listContent : Element = componentElement.querySelector('div[data-syiro-minor-component="list-content"]'); // Fetch the List's Content Container

			if (syiro.component.CSS(listContent, "display") !== "block"){ // If the listContent is currently hidden
				listHeader.setAttribute("active", ""); // Set listHeader "active" attribute to flip the Dropdown icon
				syiro.component.CSS(listContent, "display", "block"); // Show the List content
			}
			else{ // If the listContent is currently showing
				listHeader.removeAttribute("active"); // Remove the active attribute to unflip the Dropdown icon
				syiro.component.CSS(listContent, "display", ""); // Hide the List content
			}
		}
	}

	export var AddItem = syiro.component.Add; // Meta-function for adding a List Item component to a List component

	export var RemoveItem = syiro.component.Remove; // Meta-function for removing a List Item component from a List Item component

}

// #endregion

// #region List Item Component

namespace syiro.listitem {

	// #region List Item Generator

	export function New(properties : Object) : Object { // Generate a ListItem Component and return a Component Object
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

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Set Control in List Item

	export function SetControl(component : Object, control : Object) : boolean {
		var setControlSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

			if ((syiro.utilities.TypeOfThing(control) == "ComponentObject") && (control["type"] == "button")){ // If the content is a Component Object and is a Button
				if (listItemElement.querySelector("div") !== null){ // If there is already a control inside the List Item
					listItemElement.removeChild(listItemElement.querySelector("div")); // Remove the inner Control
				}

				if ((listItemElement.querySelector("label") !== null) && (listItemElement.querySelector("img") !== null)){ // If there already is an image and a label
					var innerListImage : Element = listItemElement.querySelector("img"); // Get this inner image and set it to innerlistImage
					syiro.component.Remove(innerListImage); // Remove the innerListImage
				}

				var innerControlElement = syiro.component.Fetch(control); // Get the Element of the inner control Component

				listItemElement.appendChild(innerControlElement); // Append the control Component
				syiro.events.Remove(syiro.events.eventStrings["up"], component); // Ensure the List Item has no up listeners after adding the new Control
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
				var listItemImage = listItemElement.querySelector('img'); // Get any existing image within the List Item

				if ((listItemLabel !== null) && (listItemControl !== null)){ // If there is already a label and control in the List Item
					syiro.component.Remove(listItemControl); // Remove this inner control
				}

				if (content !== ""){ // If content is not empty (adding an image source)
					 if (listItemImage == null){ // If listItemImage does not exist
						listItemImage = document.createElement("img"); // Create an image tag
						syiro.component.Add("prepend", component, listItemImage); // Prepend the img tag
					}

					listItemImage.setAttribute("src", syiro.utilities.SanitizeHTML(content)); // Set the src to a sanitized form of the content provided
					syiro.component.Update(component["id"], listItemElement); // Update the List Item Element if necessary in syiro.data
				}
				else if ((content == "") && (listItemImage !== null)){ // If content is empty (removing the image) and listItemImage exists
					syiro.component.Remove(listItemImage); // Remove the List Item Image
				}

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
				var listItemLabelElement : Element = listItemElement.querySelector("label"); // Get any label if it exists

				var listItemImage = listItemElement.querySelector("img"); // Define listItemImage as the potential image within the List Item Element
				var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]'); // Define listItemControl as the potential control within the List Item Element

				if ((listItemImage !== null) && (listItemControl !== null)){ // If there is already an image and control in the List Item
					syiro.component.Remove(listItemControl); // Remove this inner control
				}

				if (content !== ""){ // If the content is not empty
					if (listItemLabelElement == null){ // If the label Element does not exist
						listItemLabelElement = document.createElement("label"); // Create a label and assign it to the listItemLabelElement

						if (listItemImage !== null){ // If there is an image in this List Item
							syiro.component.Add("prepend", component, listItemLabelElement); // Prepend the label
						}
						else { // If there is not an image in this List Item
							syiro.component.Add("prepend", component, listItemLabelElement); // Prepend the label
						}
					}

					listItemLabelElement.textContent = syiro.utilities.SanitizeHTML(content); // Set the textContent to a sanitized form of the content
					syiro.component.Update(component["id"], listItemElement); // Update the List Item Element if necessary in syiro.data
				}
				else if ((content == "") && (listItemLabelElement !== null)){ // If content is empty, meaning delete the label, and the label exists
					syiro.component.Remove(listItemLabelElement); // Remove the label
				}

				setLabelSucceeded = true; // Set setLabelSucceeded to true
			}
		}

		return setLabelSucceeded;
	}

	// #endregion

}

// #endregion
