/*
	This is the namespace for Syiro Navbar component (previously referred to as Header and Footer Components).
*/

/// <reference path="../interfaces/navbar.ts" />
/// <reference path="../component.ts" />
/// <reference path="../utilities.ts" />

namespace syiro.navbar {

	// New
	// Create a Navbar
	export function New(properties : NavbarPropertiesObject) : ComponentObject {
		if ((properties.position !== "top") && (properties.position !== "bottom")){ // If position is not defined as top or bottom
			properties.position = "top"; // Default to be a top-positioned navbar / Header
		}

		let componentId : string = syiro.component.IdGen("navbar"); // Generate a component Id using "navbar"
		let componentElement : HTMLElement = syiro.utilities.ElementCreator("div", { // Create a Navbar div Element
			"data-syiro-component" : "navbar",
			"data-syiro-component-id" : componentId,
			"data-syiro-component-type" : properties.position, // Type should be the position (top or bottom)
			"role" : "navigation" // Define role as "navigation" for ARIA
		});

		if (properties.position == "top"){ // If Navbar is top-positioned
			if (syiro.utilities.TypeOfThing(properties.logo, "string") && (properties.logo.length !== 0)){ // If a logo is defined
				properties.logo = syiro.picture.New({ "default" : properties.logo }); // Create a new Picture Component, set to properties.logo
			}

			if (syiro.component.IsComponentObject(properties.logo) && (properties.logo.type == "picture")) { // If logo is a Picture Component
				let logoElement : HTMLElement = syiro.component.Fetch(properties.logo); // Fetch the Logo
				componentElement.appendChild(logoElement); // Append the logoElement
			}
		} else { // If Navbar is bottom-positioned
			if (syiro.utilities.TypeOfThing(properties.content, "string") && (properties.content.length !== 0)){ // If content is defined
				let generatedElement : HTMLElement = syiro.utilities.ElementCreator("label", { "content" : properties.content }); // Generate a generic label element
				componentElement.insertBefore(generatedElement, componentElement.firstChild); // Prepend the label to the navbar
			}
		}

		for (let individualItem of properties.items){ // For each individualItem in navigationItems Object array
			let typeOfItem : string = syiro.utilities.TypeOfThing(individualItem); // Get the type of the individualItem

			if (typeOfItem == "LinkPropertiesObject"){ // If we are adding a link
				let generatedElement  : HTMLElement = syiro.utilities.ElementCreator("a", { "href" : individualItem["link"], "content" : individualItem["title"] }); // Generate a generic Link
				componentElement.appendChild(generatedElement); // Append the component to the parent component element
			} else if ((typeOfItem == "ComponentObject") && (properties.position == "top")){ // If we are adding a Syiro Component (whether it be a Dropdown Button or a Searchbox) and the navbarType is top
				componentElement.appendChild(syiro.component.Fetch(individualItem)); // Append the fetched Component Element
			}
		}

		if (properties.fixed){ // If the "fixed" property is defined and is set to true
			componentElement.setAttribute("data-syiro-position", "fixed"); // Set position attribute to fixed so we can more dynamically set CSS values without needing to use JavaScript
		}

		syiro.data.Write(componentId + "->Position", properties.position); // In addition to data-syiro-component-type on the componentElement to indicate where you position
		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "navbar" }; // Return a Component Object

	}

	// AddLink
	// Add a link to a Navbar based on properties of that link
	export function AddLink(append : string, component : ComponentObject, elementOrProperties : any) : boolean { // Returns boolean if it was successful or not
		let componentAddingSucceeded : boolean = false; // Variable to store the determination of success (default to false)

		if (syiro.component.IsComponentObject("ComponentObject") && (component.type == "navbar")){ // If this is a Navbar Component and elementOrProperties is defined
			let typeOfElementOrProperties : string = syiro.utilities.TypeOfThing(elementOrProperties); // Get the type of elementOrProperties
			let generatedElement : HTMLElement; // Define generatedElement as the element we will be appending

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

	// RemoveLink
	// Remove a link from a Navbar based on the properties of that link
	export function RemoveLink(component : ComponentObject, elementOrProperties : any) : boolean { // Return boolean if it was successful or not
		let componentRemovingSucceed : boolean = false; // Variable to store the determination of success

		if (syiro.component.IsComponentObject(component) && (component.type == "navbar")){ // If this is a Navbar Component
			let navbarElement : Element = syiro.component.Fetch(component); // Get the Element of the Navbar component
			let typeOfElementOrProperties : string = syiro.utilities.TypeOfThing(elementOrProperties); // Get the type of elementOrProperties
			let potentialLinkElement : Element; // Get the potential link element.

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

	// #region Top Navbar Specific Functions

	// SetLogo
	// Set a logo for a top Navbar
	export function SetLogo(component : ComponentObject, content : string) : boolean { // Requires the component object and string of the image URL
		let setLogo = false; // Define setLogo as default false

		if (syiro.component.IsComponentObject(component) && (component.type == "navbar") && (syiro.data.Read(component.id + "->Position") == "top")){ // If this is a "top" Navbar Component
			let navbarElement : Element = syiro.component.Fetch(component); // Get the HTMLElement
			let imageElement : Element = navbarElement.querySelector('img[data-syiro-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

			if (content !== ""){ // If image is defined
				if (imageElement == null){ // If there is NOT already a logo in the top Navbar component
					imageElement = document.createElement("img");
					navbarElement.insertBefore(imageElement, navbarElement.firstChild); // Prepend the logo component
				}

				imageElement.setAttribute("src", syiro.utilities.SanitizeHTML(content)); // Set the image to a sanitized form of the content
				syiro.component.Update(component.id, navbarElement); // Update any existing navbarElement in syiro.data if needed
			} else if ((content == "") && (imageElement !== null)){ // If image is not defined / defined as empty string
				syiro.component.Remove(imageElement); // Remove the imageElement and update the navbarElement
			}

			setLogo = true;
		}

		return setLogo;
	}

	// #endregion

	// #region Bottom Navbar Specific Functions

	// SetLabel
	// Set the label (typically something like a Copyright notice) of a bottom Navbar
	export function SetLabel(component : ComponentObject, content : string) : boolean { // Set the label text of the footer component to the labelText defined
		let setLabel : boolean = false; // Define setLabel as a boolean default to false

		if (syiro.component.IsComponentObject(component) && (component.type == "navbar") && (syiro.data.Read(component.id + "->Position") == "bottom")){ // If this is a "bottom" Navbar Component
			let navbarElement = syiro.component.Fetch(component); // Get the Element of the Navbar component
			let labelComponent : Element = navbarElement.querySelector("label"); // Fetch the labelComponent if it exists

			if (content !== ""){ // If the labelText is not an empty string
				if (labelComponent == null){ // If the labelComponent does not exist
					labelComponent = document.createElement("label"); // Create the label
					navbarElement.insertBefore(labelComponent, navbarElement.firstChild); // Pre-emptively insert the empty label
				}

				labelComponent.textContent = syiro.utilities.SanitizeHTML(content); // Set the labelComponent textContent to a sanitized form of the content
				syiro.component.Update(component.id, navbarElement); // Update the navbarElement's Component if necessary
			} else if ((content == "") && (labelComponent !== null)){ // If content is an empty string and the label Component exists
				syiro.component.Remove(labelComponent); // Remove the labelComponent, updating the navbarElement
			}

			setLabel = true;
		}

		return setLabel;
	}

	// #endregion

}