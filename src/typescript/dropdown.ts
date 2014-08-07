/*
 This is the module for Rocket Dropdown component.
 */

/// <reference path="core.ts" />

module rocket.dropdown {

	// #region Function for fetching the internal List component of the Dropdown. This function is meant to be only a List component

	export function InternalListComponentFetcher(dropdownComponent) : Object {
		var dropdownElement : Element = rocket.core.Get(dropdownComponent); // Get the Element
		var dropdownListElement : Element = dropdownElement.querySelector('*[data-rocket-component="list"]'); // Get the dropdown component list

		return { // Return an object we have generated
			"id" : dropdownListElement.getAttribute("data-rocket-component-id"), // Set the ID to the ID we fetched from the dropdown list component
			"type" : "list" // Set the type to List
		};
	}

	// #endregion

	// region Function for setting particular properties in a Dropdown label

	export function Set(component : Object, type : string, content : string) : void { // Takes the component, the type (label, image, icon) and the content
		if (component["type"] == "dropdown"){ // If the component is in fact a dropdown
			var dropdownElement : Element = rocket.core.Get(component); // Get the Element
			var dropdownLabel : Element = dropdownElement.querySelector('*[data-rocket-minor-component="dropdown-label"]'); // Get the dropdown component label

			if (type == "label"){ // If we are changing the label text
				var dropdownLabelText : Element = dropdownLabel.querySelector("label"); // Get the label

				if (content.length > 0){ // If the content is not empty
					dropdownLabelText.textContent = content; // Set the label content to the content provided
				}
				else{ // If the content is set to nothing
					if (dropdownLabelText !== null){ // If the dropdown label image exists.
						dropdownLabel.removeChild(dropdownLabelText); // Remove the label image
					}
				}
			}
			else if (type == "image"){ // If we are changing the image source
				var dropdownLabelImage : Element = dropdownLabel.querySelector("img");

				if (content.length > 0){ // If the content is NOT empty
					if (dropdownLabelImage == null){ // If the image element does not exist
						dropdownLabelImage = document.createElement("img"); // Create an image
						dropdownLabel.insertBefore(dropdownLabelImage, dropdownLabel.firstChild); // Prepend the img in the dropdown label
					}

					dropdownLabelImage.setAttribute("src", content); // Set the dropdown label image source
				}
				else{ // If the content is set to nothing
					if (dropdownLabelImage !== null){ // If the dropdown label image exists.
						dropdownLabel.removeChild(dropdownLabelImage); // Remove the label image
					}
				}
			}
			else if (type == "icon"){ // If we are changing or setting an icon
				var currentDropdownLabelCSS = dropdownLabel.getAttribute("style"); // Get the current CSS of the Dropdown Label
				var newBackgroundCSS = "background-image: " + icon + ";"; // Set newBackgroundCSS to the newly generated background-image styling

				var firstIndexOfBackgroundImage = currentDropdownLabelCSS.indexOf("background-image");

				if ((currentDropdownLabelCSS.length > 0) && (firstIndexOfBackgroundImage !== -1)){ // If there is content that already exists and the background-image already exists
					var endingOfBackgroundImageCSS = currentDropdownLabelCSS.indexOf(";", firstIndexOfBackgroundImage); // Get the first index of ; based on the index of the background-image
					var fullBackgroundImageStyling = currentDropdownLabelCSS.substring(firstIndexOfBackgroundImage, (endingOfBackgroundImageCSS +1)); // Get the entire background-image styling

					currentDropdownLabelCSS = currentDropdownLabelCSS.replace(fullBackgroundImageStyling, newBackgroundCSS); // Replace old with the new
				}
				else{ // Whether or not there is content, append the newBackgroundCSS
					currentDropdownLabelCSS += newBackgroundCSS; // Append
				}

				dropdownLabel.setAttribute("style", currentDropdownLabelCSS); // Update the style with the new styling
			}

			rocket.core.UpdateStoredComponent(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

	// #region Function for adding an List Item component to the Dropdown's list, where component equals the Dropdown component

	export function AddItem(component : Object, listItemComponent : Object) : void{
		var fauxListComponentObject = rocket.dropdown.InternalListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.list.AddItem(fauxListComponentObject, listItemComponent); // Call the rocket.list.AddItem, which calls rocket.core.AddComponent.
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's list, where component equals the Dropdown component

	export function RemoveItem(component : Object, listItemComponent : Object) : void{
		var fauxListComponentObject = rocket.dropdown.InternalListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.list.RemoveItem(fauxListComponentObject, listItemComponent); // Call the rocket.list.AddItem, which calls rocket.core.AddComponent.
	}

	// #endregion

}