/*
	This is the namespace for Syiro Navbar component (previously referred to as Header and Footer Components).
*/

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />

// #region Navbar Component

namespace syiro.navbar {

	// #region Shared Functionality

	// #region Generator
	// Used for generating both "top" navbars (previously referred to as Header) and "bottom" navbars (previously referred to as Footer)

	export function New(properties : Object) : ComponentObject {
		var navbarType : string; // Define navbarType as either "top" or "bottom"

		if ((typeof properties["position"] !== "string") || ((properties["position"] !== "top") && (properties["position"] !== "bottom"))){ // If position is not defined as a string or is defined as neither top or bottom
			navbarType = "top"; // Default to be a top-positioned navbar / Header
		} else { // If it is defined as either top or bottom
			navbarType = properties["position"]; // Define navbarType as top or bottom
		}

		var componentId : string = syiro.component.IdGen("navbar"); // Generate a component Id using "navbar"
		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", {  "data-syiro-component" : "navbar", "data-syiro-component-id" : componentId, "role" : "navigation", "data-syiro-component-type" : navbarType }); // Generate a div Element with the role of "navigation" (for ARIA) and data-syiro-component-type to navbarType

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "items"){ // If we are adding items to the Header
				for (var individualItem of properties["items"]){ // For each individualItem in navigationItems Object array
					var typeOfItem : string = syiro.utilities.TypeOfThing(individualItem); // Get the type of the individualItem

					if (typeOfItem == "LinkPropertiesObject"){ // If we are adding a link
						var generatedElement  : HTMLElement = syiro.utilities.ElementCreator("a", { "href" : individualItem["link"], "content" : individualItem["title"] }); // Generate a generic Link
						componentElement.appendChild(generatedElement); // Append the component to the parent component element
					} else if ((typeOfItem == "ComponentObject") && (navbarType == "top")){ // If we are adding a Syiro Component (whether it be a Dropdown Button or a Searchbox) and the navbarType is top
						componentElement.appendChild(syiro.component.Fetch(individualItem)); // Append the fetched Component Element
					}
				}
			} else if ((propertyKey == "logo") && (navbarType == "top")){ // If we are adding a Logo to the top-positioned navbar (Header)
				var generatedElement : HTMLElement = syiro.utilities.ElementCreator("img", { "data-syiro-minor-component" : "logo", "src" : properties["logo"] }); // Generate an image with data-syiro-minor-component set to logo and src set to logo defined
				componentElement.appendChild(generatedElement); // Append the logo to the generatedElement
			} else if ((propertyKey == "content") && (navbarType == "bottom")){ // If content or label prop are not undefined and the navbarType is botto (Footer)
				var labelContent : string = ""; // Define labelContent initially as an empty string

				if (typeof properties["content"] !== "undefined"){ // If the content property is defined
					labelContent = properties["content"]; // Assign content key/val to labelContent
				} else { // If the label property is defined
					labelContent = properties["label"]; // Assign label key/val to labelContent
				}

				var generatedElement : HTMLElement = syiro.utilities.ElementCreator("label", { "content" : labelContent }); // Generate a generic label element
				componentElement.insertBefore(generatedElement, componentElement.firstChild); // Prepend the label to the navbar
			}
		}

		// #region Fixed Positioning Check

		if ((typeof properties["fixed"] == "boolean") && (properties["fixed"])){ // If the "fixed" property is defined and is set to true
			componentElement.setAttribute("data-syiro-position", "fixed"); // Set position attribute to fixed so we can more dynamically set CSS values without needing to use JavaScript
		}

		// #endregion

		syiro.data.Write(componentId + "->Position", navbarType); // In addition to data-syiro-component-type on the componentElement to indicate where you position
		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "navbar" }; // Return a Component Object

	}

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Function to add a link to the Navbar based on properties of that link

	export function AddLink(append : any, component : ComponentObject, elementOrProperties : any) : boolean { // Returns boolean if it was successful or not
		if (typeof append == "boolean"){ // If append was passed as a boolean
			if (append){ // If we are appending
				append = "append"; // Set as append
			} else { // If we are not appending
				append = "prepend"; // Set as prepend
			}
		}

		var componentAddingSucceeded : boolean = false; // Variable to store the determination of success (default to false)

		if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component["type"] == "navbar")){ // If this is a Navbar Component and elementOrProperties is defined
			var typeOfElementOrProperties : string = syiro.utilities.TypeOfThing(elementOrProperties); // Get the type of elementOrProperties
			var generatedElement : HTMLElement; // Define generatedElement as the element we will be appending

			if (typeOfElementOrProperties == "LinkPropertiesObject"){ // If elementOrProperties is a LinkPropertiesObject
				generatedElement = syiro.utilities.ElementCreator("a", { "href" : elementOrProperties["link"], "content" : elementOrProperties["title"] }); // Generate a generic Link
			} else if ((typeOfElementOrProperties == "Element") && (elementOrProperties.nodeName == "A")){ // If this is a link Element
				generatedElement = elementOrProperties; // Define generatedElement as elementOrProperties
			}

			if (typeof generatedElement !== "undefined"){ // If the generatedElement is not undefined
				componentAddingSucceeded = true; // Set to true
				syiro.component.Add(append, component, generatedElement); // Prepend or append the component to the parent component element
			}
		}

		return componentAddingSucceeded;
	}

	// #endregion

	// #region Function to remove a link from the Navbar based on the properties of that link

	export function RemoveLink(component : ComponentObject, elementOrProperties : any) : boolean { // Return boolean if it was successful or not
		var componentRemovingSucceed : boolean = false; // Variable to store the determination of success

		if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component["type"] == "navbar")){ // If this is a Navbar Component
			var navbarElement : Element = syiro.component.Fetch(component); // Get the Element of the Navbar component
			var typeOfElementOrProperties : string = syiro.utilities.TypeOfThing(elementOrProperties); // Get the type of elementOrProperties
			var potentialLinkElement : Element; // Get the potential link element.

			if (typeOfElementOrProperties == "LinkPropertiesObject"){ // If this is an Object
				potentialLinkElement =  navbarElement.querySelector('a[href="' + elementOrProperties["link"] + '"]'); // Get the potential link element.
			} else if ((typeOfElementOrProperties == "Element") && (elementOrProperties.nodeName == "A")){ // If this is a link Element
				potentialLinkElement = elementOrProperties; // Define potentialLinkElement as elementOrProperties
			}

			if (typeof potentialLinkElement !== "undefined"){ // If the potentialLinkElement is not undefined
				componentRemovingSucceed = true; // Set to true
				syiro.component.Remove(potentialLinkElement); // Remove the element
			}
		}

		return componentRemovingSucceed;
	}

	// #endregion

	// #endregion

	// #region Top Navbar Specific Functions

	// #region Function for setting the top Navbar's logo

	export function SetLogo(component : ComponentObject, content : string) : boolean{ // Requires the component object and string of the image URL
		if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component["type"] == "navbar") && (syiro.data.Read(component["id"] + "->Position") == "top")){ // If this is a "top" Navbar Component
			var navbarElement : Element = syiro.component.Fetch(component); // Get the HTMLElement
			var imageElement : Element = navbarElement.querySelector('img[data-syiro-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

			if (content !== ""){ // If image is defined
				if (imageElement == null){ // If there is NOT already a logo in the top Navbar component
					imageElement = document.createElement("img");
					navbarElement.insertBefore(imageElement, navbarElement.firstChild); // Prepend the logo component
				}

				imageElement.setAttribute("src", syiro.utilities.SanitizeHTML(content)); // Set the image to a sanitized form of the content
				syiro.component.Update(component["id"], navbarElement); // Update any existing navbarElement in syiro.data if needed
			} else if ((content == "") && (imageElement !== null)){ // If image is not defined / defined as empty string
				syiro.component.Remove(imageElement); // Remove the imageElement and update the navbarElement
			}

			return true;
		} else { // If this is not a top Navbar Component
			return false;
		}
	}

	// #endregion

	// #endregion

	// #region Bottom Navbar Specific Functions

	// #region Function to set the bottom navbar label (typically something like a Copyright notice)

	export function SetLabel(component : ComponentObject, content : string) : boolean{ // Set the label text of the footer component to the labelText defined
		if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component["type"] == "navbar") && (syiro.data.Read(component["id"] + "->Position") == "bottom")){ // If this is a "bottom" Navbar Component
			var navbarElement = syiro.component.Fetch(component); // Get the Element of the Navbar component
			var labelComponent : Element = navbarElement.querySelector("label"); // Fetch the labelComponent if it exists

			if (content !== ""){ // If the labelText is not an empty string
				if (labelComponent == null){ // If the labelComponent does not exist
					labelComponent = document.createElement("label"); // Create the label
					navbarElement.insertBefore(labelComponent, navbarElement.firstChild); // Pre-emptively insert the empty label
				}
				labelComponent.textContent = syiro.utilities.SanitizeHTML(content); // Set the labelComponent textContent to a sanitized form of the content
				syiro.component.Update(component["id"], navbarElement); // Update the navbarElement's Component if necessary
			} else if ((content == "") && (labelComponent !== null)){ // If content is an empty string and the label Component exists
				syiro.component.Remove(labelComponent); // Remove the labelComponent, updating the navbarElement
			}

			return true; // Return a success boolean
		} else { // If this is not a bottom Navbar Component
			return false;
		}
	}

	// #endregion

}

// #endregion
