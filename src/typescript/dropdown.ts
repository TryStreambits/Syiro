/*
 This is the module for Rocket Dropdown component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />

module rocket.dropdown {

	// #region Dropdown Generator

	export function Generate(properties : Object) : Object { // Generate a Dropdown Component and return a Component Object
		if ((properties["label"] !== undefined) && ((properties["items"] !== undefined) || (properties["list"] !== undefined))){ // If the labeling properties and necessary List or List Item(s) Object(s) are provided
			var componentId : string = rocket.generator.IdGen("dropdown"); // Generate a component Id
			var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "dropdown"); // Generate a Dropdown Element
			var labelProperties : string = properties["label"]; // Get the label properties

			// #region Dropdown Creation

			if (labelProperties["image"] !== undefined){ // If an image (like an avatar) is defined in the labelProperties
				var primaryImage : HTMLElement = rocket.generator.ElementCreator("img", { "src" : labelProperties["image"] }); // Create an img Element with the image source
				componentElement.appendChild(primaryImage); // Append the primary image
			}

			if (labelProperties["content"] !== undefined){ // If content is defined in the labelProperties
				var dropdownLabelText : HTMLElement = rocket.generator.ElementCreator("label", { "content" : labelProperties["content"] }); // Create a label for the Dropdown content
				componentElement.appendChild(dropdownLabelText); // Append the label to the Dropdown
			}

			if (labelProperties["icon"] !== undefined){ // If an icon is defined in the labelProperties
				var dropdownIcon : HTMLElement = rocket.generator.ElementCreator("img", { "src" : labelProperties["icon"] }); // Create an img Element with the icon source
				componentElement.appendChild(dropdownIcon); // Append the icon
			}

			// #endregion

			// #region Dropdown List Creation or Linking

			var listComponent : Object; // Define listComponent as the Component Object of the List

			if (properties["items"] !== undefined){ // If List Items are provided in the properties
				listComponent = rocket.list.Generate({ "items" : properties["items"]}); // Simply generate a new List component from the provided list items and set the listComponent Object to the one provided by Generate
			}
			else{ // If a List is provided
				listComponent = properties["list"]; // Simply set the listComponent to the List Component Object that was provided
			}

			listComponentElement = rocket.component.Fetch(listComponent); // Fetch the List Component Element
			document.querySelector("body").appendChild(listComponentElement); // Append the List Element to the end of the document

			// #endregion

			// #region Dropdown List Position (For the Dropdown toggling of the List)

			if (properties["position"] == undefined){ // If the position information is NOT defined
				properties["position"] = { "vertical" : "bottom", "horizontal" : "center"}; // Default to showing the List centered, below the Dropdown
			}

			listComponentElement.setAttribute("data-rocket-component-render", position["vertical"] + "-" + position["horizontal"]); // Set the data-rocket-component-render to vertical-horizontal (ex. bottom-center)

			// #endregion

			rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents
			return { "id" : componentId, "type" : "dropdown" }; // Return a Component Object
		}
		else{ // If the necessary properties are NOT defined
			return false; // Return false
		}
	}

	// #endregion

	// #region Function for fetching the internal List component of the Dropdown. This function is meant to be only a List component

	export function LinkedListComponentFetcher(component) : Object {
		var listSelector : string = 'div[data-rocket-component="list"][div-data-rocket-component-owner="' + component["id"] + '"]'; // Generate a List CSS selector with the owner set to the Dropdown Component's Id
		return rocket.component.FetchComponentObject(dropdownElement.querySelector(listSelector)); // Get the Dropdown's Linked Component Object
	}

	// #endregion

	// #region Set Dropdown Label Text

	export function SetText(component : Object, content : any) : void {
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the Element
		var dropdownLabel : Element = dropdownElement.querySelector("label"); // Get the label

		if (content !== false){ // If the content is not set to FALSE
			dropdownLabel.textContent = content; // Set the label content to the content provided
		}
		else if (content == false){ // If the content is set to false
			dropdownElement.removeChild(dropdownLabel); // Remove the label
		}

		rocket.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Set Dropdown Label Image

	export function SetImage(component : Object, content : any) : void {
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the Element
		var dropdownLabelImage : Element = dropdownElement.querySelector("img:first-of-type"); // Get the first image specified

		if (content !== false){ // If the content is not set to FALSE
			if (dropdownLabelImage == null){ // If the image element does not exist
				dropdownLabelImage = rocket.generator.ElementCreator("img"); // Create an image
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

	// #region Function for adding an List Item component to the Dropdown's linked List, where component equals the Dropdown component

	export function AddItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = rocket.dropdown.LinkedListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.component.Add(true, listComponentObject, listItemComponent); // Add the List Item component to the inner List
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's linked List, where component equals the Dropdown component

	export function RemoveItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = rocket.dropdown.LinkedListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.component.Remove(listComponentObject, listItemComponent); // Remove the List Item component from the List Component
	}

	// #endregion

}
