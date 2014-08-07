/*
	This is the module for core Rocket functionality.
*/

/// <reference path="interfaces/component-object.ts" />

module rocket.core {
	export var storedComponents : Object = {}; // An object that stores generated component(s) / component(s) information
	export var lastUniqueId : Number = 0; // Default the lastUniqueId to zero

	// #region Component Id Generator

	export function IdGen(type : string) : string { // Takes a component type and returns the new component Id
		var componentId : string = type + (rocket.core.lastUniqueId + 1).toString(); // Increment the lastUniqueId by one and append it to the type to create a "unique" ID
		rocket.core.lastUniqueId = rocket.core.lastUniqueId + 1;
		return componentId;
	}

	// #endregion

	// #region Defining existing Rocket components

	export function Define(type : string, selector : string) : ComponentObject {
		var component : ComponentObject = {}; // Create an object called component that stores the component information
		component["type"] = type; // Define the key "type" as the type we've defined

		var componentID : string = rocket.core.IdGen(type); // Generate a unque ID for this component

		var selectedElement : Element = document.querySelector(selector); // Get the first recognized HTMLElement that has this selector.
		selectedElement.setAttribute("data-rocket-component-id", componentID); // Set this component's ID

		rocket.core.storedComponents[componentID] = component; // Add the component object (without the nested identifier ID) with the key being componentID

		component["id"] = componentID; // Add the component ID to the object that we will be returning to the developer

		return component; // Return the component Object
	}

	// #endregion

	// #region Generator for creating Rocket components

	export function Generate(type : string, properties : Object) : Object { // Takes type as the type of Rocket component, properties as Object where properties are attributes for the component
		var generatedComponent : Object = {}; // Define generatedComponent as the object we'll return to the developer
		var componentElement : HTMLElement; // Define componentElement as the generated HTMLElement

		var componentId : string =rocket.core.IdGen(type); // Generate a component ID

		if (type == "header"){ // If we are creating a header
			componentElement = document.createElement("header"); // Use the HTML5 header tag
		}
		else if (type == "footer") { // If we are creating a footer
				componentElement = document.createElement("footer"); // Use the HTML5 footer tag
		}
		else if (type == "searchbox"){ // If we create a searchbox
			componentElement = document.createElement("input"); // Create a searchbox input
			componentElement.setAttribute("type", "text"); // Set the searchbox input type to text
		}
		else{ // Otherwise
			componentElement = document.createElement("div"); // Create a div tag
		}

		if ((type == "button") && (properties["type"] == undefined)){ // If the component is a button and the type is undefined
			properties["type"] = "basic"; // Default to a basic button
		}

		componentElement.setAttribute("data-rocket-component", type); // Set the rocket-component to the type specified (ex. header)
		componentElement.setAttribute("data-rocket-component-id", componentId); // Set the rocket-component-id to the unique ID created

		for (var propertyKey  in properties){ // Recursive go through each propertyKey
			switch (propertyKey){
				case "control": // If we are adding a control
					if (type == "list-item"){ // If we are adding a Rocket component (only specific ones) to a List Item
						var controlComponentObject = properties[propertyKey]; // Get the Rocket component's Object

						if (controlComponentObject["type"].indexOf("button")){ // If the component is either a basic or toggle button
							var controlComponentElement : Element= rocket.core.Get(controlComponentObject); // Get the component's (HTML)Element
							componentElement.appendChild(controlComponentElement); // Append the component to the List Item

							delete rocket.core.storedComponents[controlComponentObject["id"]]["HTMLElement"]; // Delete the HTMLElement from the component in the storedComponents
						}
					}
					break;
				case "icon": // If we are adding an icon
					if (((type == "button") && (properties["type"] == "basic")) || (type == "searchbar")){ // If we are adding an icon to a Basic Button or Searchbar component
						componentElement.style.backgroundImage = properties[propertyKey]; // Set the backgroundImage to the icon URL specified
					}
					break;
				case "items": // If we are adding navigation elements
					var navigationItems : Object = properties["items"]; // Get the object array of navigation items

					if (type == ("header" || "footer" || "list")){ // If we are adding items to either a Header, Footer, or List component
						for (var navigationItem  in navigationItems){ // For each navigationItem in navigationItems Object array
							if (type == ("header" || "footer")){ // If the component is header or footer
								if (navigationItem["type"] == "dropdown"){ // If the navigationItem type is a Dropdown
									var component : Object = navigationItem["component"]; // Get the embedded component object
									componentElement.appendChild(rocket.core.Get(component)); // Append the HTMLElement fetched from rocket.core.Get(component)

									delete rocket.core.storedComponents[component["id"]]["HTMLElement"]; // Delete the HTMLElement from the component in the storedComponents
								}
								else if (navigationItem["type"] == "link"){ // If we are adding a link
									var component : HTMLElement = document.createElement("a"); // Create a link address
									component.setAttribute("href", navigationItem["link"]); // Set the href (link)
									component.title = navigationItem["title"]; // Set the <a> link title
									component.innerText = navigationItem["title"]; // Also set the innerText of the <a> tag to title

									componentElement.appendChild(component); // Append the component to the parent component element
								}
							}
							else if (type == "list"){ // If the component we are adding items to is a List
								if (navigationItem["type"] == "list-item"){ // If it is a Rocket List Item component that is defined
									var listItemComponent : Element = rocket.core.Get(navigationItem); // Fetch the List Item element

									componentElement.appendChild(listItemComponent); // Append the List Item component to the List

									delete rocket.core.storedComponents[navigationItem["id"]]["HTMLElement"]; // Delete the HTMLElement from the component in the storedComponents
								}
							}
						}
					}
					else if (type == "dropdown"){ // Else if we are adding items to a Dropdown component
						var newListComponent = rocket.core.Generate("list", { "items" : navigationItems}); // Simply generate a new List component from the provided list items
						var newListElement = rocket.core.Get(newListComponent); // Fetch the new List component element

						componentElement.appendChild(newListElement);

						delete rocket.core.storedComponents[newListComponent["id"]]["HTMLElement"]; // Delete the HTMLElement from the component in the storedComponents
					}
					break;
				case "label": // If we are adding a label
					if (type == "dropdown"){ // If we are adding a label to a dropdown
						var labelProperties = properties[propertyKey]; // Get the label properties
						var dropdownLabel = document.createElement("div"); // Create a documentLabel
						dropdownLabel.setAttribute("data-rocket-minor-component", "dropdown-label"); // Set the Dropdown label to a minor-component.

						if (labelProperties["text"] !== undefined){ // If text is defined for the dropdown
							var dropdownLabelText = document.createElement("label"); // Create a label within the "label" (labelception) to hold the labe text. Wow...that was a lot of label.
							dropdownLabelText.innerHTML = labelProperties["text"]; // Set the text content of the dropdown label label (yes, two intentional labels) to the text defined
							dropdownLabel.appendChild(dropdownLabelText); // Append the label to the label.
						}

						if (labelProperties["image"] !== undefined){ // If an image is defined for the dropdown label
							var dropdownLabelImage = document.createElement("img"); // Create an img element
							dropdownLabelImage.setAttribute("src", labelProperties["image"]); // Set the src property
							dropdownLabel.insertBefore(dropdownLabelImage, dropdownLabel.firstChild); // Prepend the dropdown image
						}

						if (labelProperties["icon"] !== undefined){ // If an icon is defined for the dropdown label
							dropdownLabel.style.backgroundImage = labelProperties["icon"]; // Set the background image to the icon src provided
						}

						componentElement.insertBefore(dropdownLabel, componentElement.firstChild); // Prepend the dropdown label to the dropdown
					}
					else if (type == "list-item"){ // If we are adding a label to a List Item component
						var labelComponent : HTMLElement = componentElement.getElementsByTagName("label").item(0); // Define labelComponent as an HTMLElement that we attempt to fetch

						if (labelComponent == null){ // If there is no label component already
							labelComponent = document.createElement("label"); // Create a label HTMLElement
							componentElement.insertBefore(labelComponent, componentElement.firstChild); // Prepend the label to the List Item component
						}

						labelComponent.innerText = properties[propertyKey]; // Set the List Item label component text
					}
					break;
				case "list": // If we are adding a List component
					if (type == "dropdown"){ // If we are adding a List to a Dropdown component
						var listComponent : Element = rocket.core.Get(properties[propertyKey]); // Get the list component from the embedded List component Object
						componentElement.appendChild(listComponent); // Append the List component to the Dropdown

						delete rocket.core.storedComponents[properties[propertyKey]["id"]]["HTMLElement"]; // Delete the HTMLElement from the component in the storedComponents
					}
					break;
				case "logo": // If we are added a logo
					if (type == "header"){ // If the component is header
						var logoElement : HTMLElement = document.createElement("img");
						logoElement.setAttribute("data-rocket-minor-component", "logo"); // Set the minor component to logo
						logoElement.setAttribute("src", properties["logo"]); // Set the src to the one provided as the value of "logo"
						componentElement.appendChild(logoElement); // Append the logo to the header
					}
					break;
				case "text": // If we are adding text
					if (type == "button"){ // If we are adding text to a button
						componentElement.innerText = properties[propertyKey]; // Set the innerText of the button
					}
					else if (type == "footer"){ // If we are adding text to a Footer component
						var footerLabel : HTMLElement = componentElement.getElementsByTagName("label").item(0); // Assign footerLabel as the potential label defined in the footer (or NULL)

						if (footerLabel == null){ // If a label element does NOT exist in the footer
							footerLabel = document.createElement("label"); // Create a label element
							componentElement.insertBefore(footerLabel, componentElement.firstChild); // Prepend the label to the footer
						}

						footerLabel.innerText = properties[propertyKey]; // Set the innerText of the footer label
					}
					else if (type == "searchbar"){ // If we are adding text to a Searchbar component
						componentElement.setAttribute("placeholder", properties[propertyKey]); // Set the searchbox input placeholder to the one defined
					}
					break;
				case "type": // If we are specifying a type even further
					if (type == "button"){ // If the component type is a button
						componentElement.setAttribute("data-rocket-component-type", properties[propertyKey]); // Set the data-rocket-component-type to the type define, like "basic".

						if (properties[propertyKey] == "toggle"){ // If we are making a toggle button
							var buttonToggle = document.createElement("div"); // Create a button toggle (differs from the toggle button itself in that it is the button that gets pressed to toggle the toggle button)
							buttonToggle.setAttribute("data-rocket-minor-component", "buttonToggle"); // Set the buttonToggle data-rocket-minor-component attribute to buttonToggle

							if (properties["default"] == undefined){ // If a default state for the button is NOT defined
								properties["default"] = false; // Set the default state to false
							}

							buttonToggle.setAttribute("data-rocket-component-status", properties["default"].toString()); // Set the buttonToggle default state to either the one defined or false

							componentElement.appendChild(buttonToggle); // Append the buttonToggle to the toggle button
						}
					}
			}
		}

		rocket.core.storedComponents[componentId] = {"type" : type, "HTMLElement" : componentElement}; // Add the component to the storedComponents

		generatedComponent["id"] = componentId; // Set the id key to the componentId
		generatedComponent["type"] = type; // Set the type to the one defined

		return generatedComponent; // Return the generatedComponent
	}

	// #endregion

	// #region Get - Function for obtaining the HTMLElement of a Component object

	export function Get(component : Object) : Element{ // Take a Rocket component object and return an HTMLElement (it's like magic!)
		var componentElement : Element; // The (HTML)Element of the Rocket component we'll be returning
		var componentId = component["identifier"]["id"]; // Get the Rocket component's ID

		if (typeof(rocket.core.storedComponents[componentId]["HTMLElement"]) !== undefined){ // If an HTMLElement  is defined, meaning this is a new component that has not been put in the DOM yet
			componentElement = rocket.core.storedComponents[componentId]["HTMLElement"]; // Get the HTMLElement stored in the tempStoredComponents
		}
		else{ // If the HTMLElement  is NOT defined (meaning the element is already in the DOM)
			componentElement = document.querySelector('*[data-rocket-component-id="' + componentId + '"');
		}

		return componentElement;
	}

	// #endregion

	// #region Add Component function - Responsible for adding components to other components or elements

	export function AddComponent(append : boolean, parentComponent : Object, childComponent : any) : boolean { // Returns boolean if the component adding was successful or not
		var parentElement : Element = rocket.core.Get(parentComponent); // Get the HTMLElement of the parentComponent

		// #region Child Component Details

		var childComponentId : string; // Define childComponentId as the childComponents potential ID (may not exist IF childComponentType is (HTML)Element)
		var childComponentType : string = (typeof childComponent).toString(); // Set childComponentType to the typeof childComponent and ensure it is a string
		var childElement : any; // Define childElement as any. In reality it is either an HTMLElement or an Element

		// #endregion

		var allowAdding : Boolean; // Define variable to determine if we should allow adding the childComponent to the parentComponent or not.

		if (childComponentType == "Object"){ // If the childComponent is an Object
			childComponentId = childComponent["id"]; // Get the component's ID
		}

		if (parentComponent["type"] == "header"){ // If the parent component's type is a header
			if ((childComponentType == "Object") && (childComponent["type"] == ("dropdown" || "searchbar"))){ // If the childComponent type is an Object and the component is either a dropdown or a searchbar
				allowAdding = true;
				childElement = rocket.core.Get(childComponent); // Get the HTMLElement of the childComponent
			}
			else{ // If it is NOT an allowed component
				allowAdding = false;
			}
		}
		else if (parentComponent["type"] == "footer"){ // If the parent component's type is a footer
			if (childComponentType.indexOf("Element") > -1){ // If the childComponentType is an (HTML)Element
				childElement = childComponent; // Set the childElement to the childComponent
			}
			else if (childComponentType == "Object"){ // If the childComponentType is Object
				childElement = document.createElement("a"); // Create a link element
				childElement.setAttribute("href", childComponent["link"]); // Add the link as href
				childElement.title = childComponent["title"]; // Set the title as the one specified in the component object
				childElement.innerText = childComponent["title"]; // Set the innerText as the component title key

				allowAdding = true; // Allow adding the childComponent
			}
			else{ // If the childComponent is not an (HTML)Element or Object
				allowAdding = false;
			}
		}
		else{
			childElement = rocket.core.Get(childComponent); // Get the HTMLElement of the childComponent
			allowAdding = true;
		}

		if (allowAdding == true){ // If we are allowing the adding of the childComponent
			if (prepend == true){ // If we are prepending the childElement
				parentElement.insertBefore(childElement, parentElement.firstChild); // Insert before the first component
			}
			else{ // If we are appending the childComponent
				parentElement.appendChild(childElement); // Append
			}

			if (childComponentId !== undefined){ // If we have defined the childComponentId, meaning it is an object and we should do cleanup
				if (typeof(rocket.core.storedComponents[childComponentId]["HTMLElement"]) !== undefined){ // If the childComponent has not been placed anywhere prior to the AddComponent
					delete rocket.core.storedComponents[childComponentId]["HTMLElement"]; // Delete the temporary stored component
				}
			}
		}


		return childComponent; // Return the updated component object
	}

	// #endregion

	// #region Remove Component function - Responsible for removing components or Elements from their parents

	export function RemoveComponent(parentComponent : Object, childComponent : any) : boolean{
		var parentElement : Element = rocket.core.Get(parentComponent); // Get the parent's Element

		if (typeof(childComponent).indexOf("Element") > -1){ // If the childComponent is an HTMLElement or an Element
			parentElement.removeChild(childComponent); // Remove the child element from the component
			return true; // Return success
		}
		else if (typeof(childComponent) == "Object"){ // If the childComponent is an Object
			parentElement.removeChild(rocket.core.Get(childComponent)); // Remove the fetched child component HTMLElement from the document
			delete rocket.core.storedComponents[childComponent["id"]]; // Remove the component from the storedComponents
			return true; // Return success
		}
		else{ // If it isn't an Element or an Object
			return false; // Return failure
		}
	}

	// #endregion
}