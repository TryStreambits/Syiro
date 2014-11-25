/*
 This is the module for Rocket Dropdown component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />

module rocket.dropdown {

	// #region Dropdown Generator

	export function Generate(properties : Object) : Object { // Generate a Dropdown Component and return a Component Object
		var componentId : string = rocket.generator.IdGen("dropdown"); // Generate a component Id
		var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "dropdown"); // Generate a Dropdown Element

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "items"){ // If we are adding List Items to the Dropdown Inner List
				var newListComponent = rocket.list.Generate({ "items" : properties["items"]}); // Simply generate a new List component from the provided list items
				var newListElement = rocket.component.Fetch(newListComponent); // Fetch the new List component element

				componentElement.appendChild(newListElement);

				delete rocket.component.storedComponents[newListComponent["id"]]; // Delete the Component from the storedComponents
			}
			else if (propertyKey == "label"){ // If we are adding a Label to the Dropdown
				var labelProperties : string = properties["label"]; // Get the label properties
				var dropdownLabel : HTMLElement = rocket.generator.ElementCreator("div", // Create a documentLabel
					{
						"data-rocket-minor-component": "dropdown-label" // Set the Dropdown label to a minor-component.
					}
				);

				if (labelProperties["icon"] !== undefined){ // If an icon is defined for the dropdown label
					dropdownLabel.style.backgroundImage = labelProperties["icon"]; // Set the background image to the icon src provided
				}

				if (labelProperties["image"] !== undefined){ // If an image is defined for the dropdown label
					var dropdownLabelImage : Element = rocket.generator.ElementCreator("img", // Create an img element
						{
							"src" : labelProperties["image"] // Set the src property
						}
					);
					dropdownLabel.appendChild(dropdownLabelImage); // Append the dropdown image
				}

				if (labelProperties["content"] !== undefined){ // If text is defined for the dropdown
					var dropdownLabelText : HTMLElement = rocket.generator.ElementCreator("label", // Create a label within the "label" (labelception) to hold the defined text.
						{
							"content" : labelProperties["content"] // Set the text content of the Dropdown's label label (yes, two intentional labels) to the text defined
						}
					);
					dropdownLabel.appendChild(dropdownLabelText); // Append the label to the label.
				}

				componentElement.insertBefore(dropdownLabel, componentElement.firstChild); // Prepend the dropdown label to the dropdown
			}
			else if (propertyKey == "list") { // If we are adding a List component
				var listComponent : Element = rocket.component.Fetch(properties[propertyKey]); // Get the list component from the embedded List component Object
				componentElement.appendChild(listComponent); // Append the List component to the Dropdown

				delete rocket.component.storedComponents[properties[propertyKey]["id"]]; // Delete the Component from the storedComponents
			}
		}

		rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

		return { "id" : componentId, "type" : "dropdown" }; // Return a Component Object
	}

	// #endregion

	// #region Function for fetching the internal List component of the Dropdown. This function is meant to be only a List component

	export function InnerListComponentFetcher(dropdownComponent) : Object {
		var dropdownElement : Element = rocket.component.Fetch(dropdownComponent); // Get the Element
		return rocket.component.FetchComponentObject(dropdownElement.querySelector('div[data-rocket-component="list"]')); // Get the Dropdown's List Component Object
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

	// #region Function for adding an List Item component to the Dropdown's list, where component equals the Dropdown component

	export function AddItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = rocket.dropdown.InnerListComponentFetcher(component); // Fetch the internal List component from the Dropdown
		rocket.component.Add(true, listComponentObject, listItemComponent); // Add the List Item component to the inner List
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's list, where component equals the Dropdown component

	export function RemoveItem(component : Object, listItemComponent : Object) : void {
		rocket.list.RemoveItem(listItemComponent); // Remove the List Item component from the inner List (which we auto-magically get in ```rocket.component.Remove()```)
	}

	// #endregion

}
