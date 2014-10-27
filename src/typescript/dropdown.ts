/*
 This is the module for Rocket Dropdown component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />

module rocket.dropdown {

	// #region Function for fetching the internal List component of the Dropdown. This function is meant to be only a List component

	export function InternalListComponentFetcher(dropdownComponent) : Object {
		var dropdownElement : Element = rocket.component.Fetch(dropdownComponent); // Get the Element
		var dropdownListElement : Element = dropdownElement.querySelector('div[data-rocket-component="list"]'); // Get the dropdown component list

		return { // Return an object we have generated
			"id" : dropdownListElement.getAttribute("data-rocket-component-id"), // Set the ID to the ID we fetched from the dropdown list component
			"type" : "list" // Set the type to List
		};
	}

	// #endregion

	// #region Set Dropdown Label Text

	export function SetText(component : Object, content : any) : void {
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the Element
		var dropdownLabel : Element = dropdownElement.querySelector('*[data-rocket-minor-component="dropdown-label"]'); // Get the dropdown component label
		var dropdownLabelText : Element = dropdownLabel.querySelector("label"); // Get the label

		if (content !== false){ // If the content is not set to FALSE
			dropdownLabelText.textContent = content; // Set the label content to the content provided
		}
		else if (content == false){ // If the content is set to false
			dropdownLabel.removeChild(dropdownLabelText); // Remove the label image
		}

		rocket.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Set Dropdown Label Image

	export function SetImage(component : Object, content : any) : void {
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the Element
		var dropdownLabel : Element = dropdownElement.querySelector('*[data-rocket-minor-component="dropdown-label"]'); // Get the dropdown component label

		var dropdownLabelImage : Element = dropdownLabel.querySelector("img");

		if (content !== false){ // If the content is not set to FALSE
			if (dropdownLabelImage == null){ // If the image element does not exist
				dropdownLabelImage = rocket.generator.ElementCreator(null, "img"); // Create an image
				dropdownLabel.insertBefore(dropdownLabelImage, dropdownLabel.firstChild); // Prepend the img in the dropdown label
			}

			dropdownLabelImage.setAttribute("src", content); // Set the dropdown label image source
		}
		else if (content == false){ // If the content is set to false
			dropdownLabel.removeChild(dropdownLabelImage); // Remove the label image
		}

		rocket.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Set Dropdown Label Icon

	export function SetIcon(component : Object, content : string) : void {
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the Element
		var dropdownLabel : Element = dropdownElement.querySelector('*[data-rocket-minor-component="dropdown-label"]'); // Get the dropdown component label

		var currentDropdownLabelCSS = dropdownLabel.getAttribute("style"); // Get the current CSS of the Dropdown Label
		var newBackgroundCSS = "background-image: " + content + ";"; // Set newBackgroundCSS to the newly generated background-image styling

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

		rocket.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Function for adding an List Item component to the Dropdown's list, where component equals the Dropdown component

	export function AddItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = rocket.dropdown.InternalListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.component.Add(true, listComponentObject, listItemComponent); // Add the List Item component to the inner List
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's list, where component equals the Dropdown component

	export function RemoveItem(component : Object, listItemComponent : Object) : void{
		var listComponentObject = rocket.dropdown.InternalListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.list.RemoveItem(listComponentObject, listItemComponent); // Remove the List Item component from the inner List
	}

	// #endregion

}
