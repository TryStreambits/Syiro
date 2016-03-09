/*
 This is the namespace for Syiro List component and it's sub-component, List Item
 */

/// <reference path="component.ts" />
/// <reference path="utilities.ts" />

// #region Syiro List Component

namespace syiro.list {

	// #region List Generator

	export function New(properties : Object) : ComponentObject { // Generate a List Component and return a Component Object
		var componentId : string = syiro.component.IdGen("list"); // Generate a component Id
		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", {  "data-syiro-component" : "list", "data-syiro-component-id" : componentId, "aria-live" : "polite", "id" : componentId, "role" : "listbox" }); // Generate a List Element with an ID and listbox role for ARIA purposes

		if ((syiro.utilities.TypeOfThing(properties["items"], "Array")) && (properties["items"].length > 0)){ // If we are adding sub-Lists or List Items
			if (syiro.utilities.TypeOfThing(properties["header"], "string")){ // If a List Header is defined
				var listHeaderElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "list-header", "content" : properties["header"]}); // Generate the listHeaderElement
				componentElement.appendChild(listHeaderElement); // Add the listHeaderElement
			}

			// #region Sub-List and List Item Adding

			var listContentContainer : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "list-content" }); // Create the listContent container

			for (var individualItem of properties["items"]){ // For each list item in navigationItems Object array
				var individualItemComponentObject : ComponentObject; // Define individualItemComponentObject as the Component Object of the individualitem
				var typeOfIndividualItem : string = syiro.utilities.TypeOfThing(individualItem); // Get the type of the individualItem

				if (typeOfIndividualItem == "ComponentObject"){ // If this is a Component Object
					individualItemComponentObject = individualItem; // Define individualItemComponentObject as the individualItem
				} else if (typeOfIndividualItem == "Object"){ // If this is an Object
					var typeOfHeader : string = syiro.utilities.TypeOfThing(individualItem["header"]); // Get the type of the header key/val
					var typeOfItems : string = syiro.utilities.TypeOfThing(individualItem["item"]); // Get the type of items /key/val

					if ((typeOfHeader == "string") && (typeOfItems == "Array")){ // If this is a List (with the necessary List Header and List Items properties)
						individualItemComponentObject = syiro.list.New(individualItem); // Create a List based on the individualItem
					} else if ((typeOfHeader == "undefined") && (typeOfItems == "undefined")){ // If this is a List Item
						individualItemComponentObject = syiro.listitem.New(individualItem); // Generate a List Item based on the individualItem
					}
				}

				if (syiro.utilities.TypeOfThing(individualItemComponentObject, "ComponentObject")){ // If we have a valid Component Object
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

	export function SetHeader(component : ComponentObject, content : any){
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the componentElement of the List
		var listHeader : any = componentElement.querySelector('div[data-syiro-minor-component="list-header"]'); // Fetch the List's Header
		var typeOfContent : string = syiro.utilities.TypeOfThing(content); // Get the type of the content

		if ((typeOfContent == "string") || (typeOfContent == "Element")){ // If the content is a string or Element
			if (listHeader == null){ // If the listHeader does not exist
				listHeader = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "list-header" }); // Generate the listHeader
				componentElement.insertBefore(listHeader, componentElement.firstChild); // Prepend the listHeader
			}

			content = syiro.utilities.SanitizeHTML(content); // Sanitize the content

			if (typeOfContent == "string"){ // If the content is a string
				if (content !== ""){ // If the content is not an empty string
					listHeader.innerHTML = content; // Set innerHTML to content
				} else { // If the content is empty
					componentElement.removeChild(listHeader); // Remove the listHeader
				}
			} else { // If it is an Element
				listHeader.innerHTML = ""; // Clean up the listHeader
				listHeader.appendChild(content); // Append the Element
			}
		}

		syiro.component.Update(component.id, componentElement); // Update if necessary
	}

	// #endregion

	// #region Toggle - Toggle visibility of List's inner content container

	export function Toggle(component : any){
		var componentElement : any; // Define componentElement as the Element of the List Component

		if (syiro.utilities.TypeOfThing(component, "ComponentObject")){ // If this is a Component Object (List) that is provided
			componentElement = syiro.component.Fetch(component); // Fetch the componentElement of the List
		} else if (syiro.utilities.TypeOfThing(component, "Element")){ // If we were provided an Element
			componentElement = component.parentElement; // Set as the parentElement of the List Header
		}

		if ((typeof componentElement !== "undefined") && (componentElement !== null) && (componentElement !== false)){ // If componentElement is defined and is not false (from Fetch) or null (parentElement)
			if (componentElement.parentElement.getAttribute("data-syiro-minor-component") == "list-content"){ // If this is indeed a nested List
				var listHeader : Element = componentElement.querySelector('div[data-syiro-minor-component="list-header"]'); // Fetch the List's Header
				var listContent : Element = componentElement.querySelector('div[data-syiro-minor-component="list-content"]'); // Fetch the List's Content Container

				if (syiro.component.CSS(listContent, "display") !== "block"){ // If the listContent is currently hidden
					listHeader.setAttribute("active", ""); // Set listHeader "active" attribute to flip the Dropdown icon
					syiro.component.CSS(listContent, "display", "block"); // Show the List content
				} else { // If the listContent is currently showing
					listHeader.removeAttribute("active"); // Remove the active attribute to unflip the Dropdown icon
					syiro.component.CSS(listContent, "display", ""); // Hide the List content
				}
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

	export function New(properties : Object) : ComponentObject { // Generate a ListItem Component and return a Component Object
		var componentId : string = syiro.component.IdGen("list-item"); // Generate a component Id
		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", {  "data-syiro-component" : "list-item", "data-syiro-component-id" : componentId, "role" : "option" }); // Generate a List Item Element with the role as "option" for ARIA

		var generatedElement : Element; // Define generatedElement as an Element we'll assign generated content to

		if (syiro.utilities.TypeOfThing(properties["html"], "Element") == false){ // If we are not adding ANY HTML code to the List Item (therefore not needing nonstrict formatting)
			for (var propertyKey in properties){ // Recursive go through each propertyKey
				var append : boolean = false; // Define append as boolean defaulting to false
				var thing : any = properties[propertyKey]; // Define thing

				if ((propertyKey == "control") && (typeof properties["image"] == "undefined")){ // If we are adding a control and image is not defined
					if (thing["type"] == "button"){ // If the component is either a basic or toggle button
						generatedElement= syiro.component.Fetch(thing); // Get the component's (HTML)Element
						append = true; // Define append as true
					}
				} else if ((propertyKey == "image") && (typeof properties["control"] == "undefined")){ // If we are adding an image and a control is NOT defined
					generatedElement = syiro.utilities.ElementCreator("img", { "src" : thing } ); // Create an image with the source set the properties["image"]
				} else if ((propertyKey == "label") && (typeof properties["link"] == "undefined")){ // If we are adding a label (and link is undefined)
					generatedElement = syiro.utilities.ElementCreator("label", { "content" : thing }); // Create a label within the "label" (labelception) to hold the defined text.

					if (componentElement.querySelector("img") !== null){ // If we have added an image to the List Item
						append = true; // Define append as true
					}
				} else if ((propertyKey == "link") && (typeof properties["control"] == "undefined") && (typeof properties["label"] == "undefined")){ // If we are adding a link (and no control or label)
					append = true; // Define append as true
					generatedElement  = syiro.utilities.ElementCreator("a", { "href" : thing["link"], "content" : thing["title"] }); // Generate a generic Link
				}

				if (append){ // If we are appending the generatedElement
					componentElement.appendChild(generatedElement); // Append the generatedElement
				} else { // If we are prepending the generatedElement
					componentElement.insertBefore(generatedElement, componentElement.firstChild); // Prepend the generated Element
				}
			}
		} else { // If HTML is being added to the List Item
			componentElement.setAttribute("data-syiro-nonstrict-formatting", ""); // Add the nonstrict-formatting attribute to the List Item so we know not to apply any styling
			generatedElement = properties["html"];
			componentElement.innerHTML = syiro.utilities.SanitizeHTML(generatedElement).outerHTML; // Set the innerHTML of the componentElement to the outerHTML of the sanitized HTML
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component

		return { "id" : componentId, "type" : "list-item" }; // Return a Component Object
	}

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Set Control in List Item

	export function SetControl(component : ComponentObject, control : ComponentObject) : boolean {
		var setControlSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")){ // Make sure the component is in fact a List Item
			if ((syiro.utilities.TypeOfThing(control) == "ComponentObject") && (control["type"] == "button")){ // If the content is a Component Object and is a Button
				var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

				if (listItemElement.querySelector("div") !== null){ // If there is already a control inside the List Item
					listItemElement.removeChild(listItemElement.querySelector("div")); // Remove the inner Control
				}

				var innerListImage : Element = listItemElement.querySelector("img"); // Get the inner image if it exists
				if (innerListImage !== null){ // If there already is an image
					syiro.component.Remove(innerListImage); // Remove the innerListImage
				}

				var innerLink : Element = listItemElement.querySelector("a"); // Get the inner link if it exists
				if (listItemElement.querySelector("a") !== null){ // If there is a link
					syiro.component.Remove(innerLink); // Remove the innerLink
				}

				syiro.events.Remove(syiro.events.eventStrings["up"], component); // Ensure the List Item has no up listeners after adding the new Control
				syiro.component.Add("append", component, control); // Append the control to the List Item

				setControlSucceeded = true; // Set setLabelSucceeded to true
			}
		}

		return setControlSucceeded;
	}

	// #endregion

	// #region Set Image in List Item

	export function SetImage(component : ComponentObject, content : string) : boolean {
		var setImageSucceeded : boolean = false; // Variable we return with a boolean value, defaulint to false.

		if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")){ // Make sure the component is in fact a List Item
			if (typeof content == "string"){ // Make sure the content is a string
				var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

				var listItemLabel = listItemElement.querySelector("label"); // Define listItemLabel as the potential label within the List Item Element
				var listItemImage = listItemElement.querySelector('img'); // Get any existing image within the List Item

				if (content !== ""){ // If content is not empty (adding an image source)
					var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]'); // Define listItemControl as the potential control within the List Item Element

					if (listItemControl !== null){ // If there is already a control in the List Item
						syiro.component.Remove(listItemControl); // Remove this inner control
					}

					 if (listItemImage == null){ // If listItemImage does not exist
						listItemImage = document.createElement("img"); // Create an image tag
						syiro.component.Add("prepend", component, listItemImage); // Prepend the img tag
					}

					listItemImage.setAttribute("src", syiro.utilities.SanitizeHTML(content)); // Set the src to a sanitized form of the content provided
					syiro.component.Update(component.id, listItemElement); // Update the List Item Element if necessary in syiro.data
				} else if ((content == "") && (listItemImage !== null)){ // If content is empty (removing the image) and listItemImage exists
					syiro.component.Remove(listItemImage); // Remove the List Item Image
				}

				setImageSucceeded = true; // Set setImageSucceeded to true
			}
		}

		return setImageSucceeded;
	}

	// #endregion

	// #region Set Label in List Item

	export function SetLabel(component : ComponentObject, content : string) : boolean {
		var setLabelSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")){ // Make sure the component is in fact a List Item
			if (typeof content == "string"){ // If the content is of type string
				var listItemElement = syiro.component.Fetch(component); // Get the List Item Element

				var listItemLabelElement : Element = listItemElement.querySelector("label"); // Get any label if it exists

				if (content !== ""){ // If the content is not empty
					var listItemImage = listItemElement.querySelector("img"); // Define listItemImage as the potential image within the List Item Element
					var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]'); // Define listItemControl as the potential control within the List Item Element

					if ((listItemImage !== null) && (listItemControl !== null)){ // If there is already an image and control in the List Item
						syiro.component.Remove(listItemControl); // Remove this inner control
					}

					var innerLink = listItemElement.querySelector("a"); // Get any innerLink
					if (innerLink !== null){ // If there is a link in the List Item
						syiro.component.Remove(innerLink); // Remove the innerLink
					}

					if (listItemLabelElement == null){ // If the label Element does not exist
						listItemLabelElement = document.createElement("label"); // Create a label and assign it to the listItemLabelElement

						if (listItemImage !== null){ // If there is an image in this List Item
							syiro.component.Add("append", component, listItemLabelElement); // Append the label
						} else { // If there is not an image in this List Item
							syiro.component.Add("prepend", component, listItemLabelElement); // Prepend the label
						}
					}

					listItemLabelElement.textContent = syiro.utilities.SanitizeHTML(content); // Set the textContent to a sanitized form of the content
				} else if ((content == "") && (listItemLabelElement !== null)){ // If content is empty, meaning delete the label, and the label exists
					syiro.component.Remove(listItemLabelElement); // Remove the label
				}

				syiro.component.Update(component.id, listItemElement); // Update the List Item Element if necessary in syiro.data
				setLabelSucceeded = true; // Set setLabelSucceeded to true
			}
		}

		return setLabelSucceeded;
	}

	// #endregion

	// #region Set Link in List Item

	export function SetLink(component : ComponentObject, properties : any) : boolean {
		var setSucceeded : boolean = false;

		if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")){ // Make sure the component is in fact a List Item
			var componentElement : HTMLElement = syiro.component.Fetch(component); // Fetch the componentElement of the List Item Component
			var innerLink : Element = componentElement.querySelector("a"); // Get the innerLink if it doesn't exist already

			if (syiro.utilities.TypeOfThing(properties, "LinkPropertiesObject")){ // If the properties is a LinkPropertiesObject
				setSucceeded = true;

				if (innerLink !== null){ // If there is already an innerLink here
					innerLink.setAttribute("href", properties["link"]); // Change the href attribute
					innerLink.setAttribute("title", properties["title"]); // Change the title attribute
				} else { // If there is NOT an innerLink already
					var innerControl : Element = componentElement.querySelector('div[data-syiro-component]'); // Get any innerControl
					if (innerControl !== null){ // If there is an innerControl
						syiro.component.Remove(innerControl); // Remove the control
					}

					var innerLabel : Element = componentElement.querySelector("label"); // Get any innerLabel
					if (innerLabel !== null){ // If there is an innerLabel
						syiro.component.Remove(innerLabel); // Remove the label
					}

					innerLink = syiro.utilities.ElementCreator("a", { "href" : properties["link"], "content" : properties["title"] }); // Set the innerHTML of the List Item to to the outerHTML of the link Element
					syiro.component.Add("append", component, innerLink); // Append the innerLink to the List Item
				}
			} else if (properties == ""){ // If the properties is an empty string
				setSucceeded = true;
				syiro.component.Remove(innerLink); // Remove the link
			}

		}

		return setSucceeded;
	}

	// #endregion

}

// #endregion
