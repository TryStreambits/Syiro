/*
 This is the module for Syiro Dropdown component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />

module syiro.dropdown {

	// #region Meta-function for fetching the linked List Component Object of the Dropdown

	export var FetchLinkedListComponentObject : Function = syiro.component.FetchLinkedListComponentObject;

	// #endregion

	// #region Dropdown Generator

	export function Generate(properties : Object) : Object { // Generate a Dropdown Component and return a Component Object
		if ((typeof properties["items"] !== "undefined") || (typeof properties["list"] !== "undefined")){ // If the necessary List or List Item(s) Object(s) are provided
			var componentId : string = syiro.generator.IdGen("dropdown"); // Generate a component Id
			var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "dropdown"); // Generate a Dropdown Element

			// #region Dropdown Creation

			if (properties["image"] !== undefined){ // If an image (like an avatar) is defined in the labelProperties
				var primaryImage : HTMLElement = syiro.generator.ElementCreator("img", { "src" : properties["image"] }); // Create an img Element with the image source
				componentElement.appendChild(primaryImage); // Append the primary image
			}

			if (properties["label"] !== undefined){ // If content is defined in the labelProperties
				var dropdownLabelText : HTMLElement = syiro.generator.ElementCreator("label", { "content" : properties["label"] }); // Create a label for the Dropdown content
				componentElement.appendChild(dropdownLabelText); // Append the label to the Dropdown
			}

			if (properties["icon"] !== undefined){ // If an icon is defined in the labelProperties
				syiro.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")"); // Set the background-image to the icon
			}

			// #endregion

			// #region Dropdown List Creation or Linking

			var listComponent : Object; // Define listComponent as the Component Object of the List

			if (properties["items"] !== undefined){ // If List Items are provided in the properties
				listComponent = syiro.list.Generate({ "items" : properties["items"]}); // Simply generate a new List component from the provided list items and set the listComponent Object to the one provided by Generate
			}
			else{ // If a List is provided
				listComponent = properties["list"]; // Simply set the listComponent to the List Component Object that was provided
			}

			var listComponentElement : Element = syiro.component.Fetch(listComponent); // Fetch the List Component Element
			document.querySelector("body").appendChild(listComponentElement); // Append the List Element to the end of the document
			listComponentElement.setAttribute("data-syiro-component-owner", componentId); // Set the List's owner to be the Dropdown

			// #endregion

			// #region Dropdown List Position (For the Dropdown toggling of the List)

			if (properties["position"] == undefined){ // If the position information is NOT defined
				properties["position"] = { "vertical" : "below", "horizontal" : "center"}; // Default to showing the List centered, below the Dropdown
			}

			syiro.component.componentData[listComponent["id"]] = { "render" : properties["position"]["vertical"] + "-" + properties["position"]["horizontal"]}; // Set the componentData for the List with a render key/val with vertical-horizontal value (ex. bottom-center)

			// #endregion

			syiro.component.componentData[componentId] = { "HTMLElement" : componentElement }; // Add the component to the componentData
			return { "id" : componentId, "type" : "dropdown" }; // Return a Component Object
		}
		else{ // If the necessary properties are NOT defined
			return false; // Return false
		}
	}

	// #endregion

	// #region Common Component Handlers

	export function Toggle(component ?: Object){ // Function that will handle toggling the Dropdown
		var component : Object = arguments[0]; // Get the component that was passed to this function as a bound argument
		var componentElement : Element = syiro.component.Fetch(component); // Get the componentElement based on the component Object

		var linkedListComponentObject : Object = syiro.component.FetchLinkedListComponentObject(component); // Get the linked List Component Object of the Dropdown
		var linkedListComponentElement : Element = syiro.component.Fetch(linkedListComponentObject); // Get the List Component's Element

		var currentIcon = syiro.component.CSS(component, "background-image"); // Get the background-image, assuming it isn't the default

		if (syiro.component.CSS(linkedListComponentElement, "visibility") !== false){ // If the CSS of the linked List Component is stating the List is active (visibility is visible)
			if (currentIcon !== false){ // If the currentIcon exists
				syiro.component.CSS(component, "background-image", currentIcon.replace("-inverted", "")); // Remove the -inverted from the icon
			}

			componentElement.removeAttribute("active"); // Remove the "active" attribute
			syiro.component.CSS(linkedListComponentElement, "visibility", false); // Remove the visibility attribute and hide the List
		}
		else{ // If the linked List is not active / showing
			var positionInformation : Array<string> = syiro.component.componentData[linkedListComponentObject["id"]]["render"].split("-"); // Get the position information on where we should render the List, split it into an array
			syiro.render.Position(positionInformation, linkedListComponentObject, component); // Set the position of the List according to the position information for the Dropdown

			if (currentIcon !== false){ // If the currentIcon exists
				var currentIconWithoutExtension = currentIcon.substr(0, currentIcon.indexOf(".")); // Get the entire name of the file without the extension
				syiro.CSS(component, "background-image", currentIcon.replace(currentIconWithoutExtension, currentIconWithoutExtension + "-inverted")); // Replace the file name with filename-inverted
			}

			componentElement.setAttribute("active", ""); // Set the "active" attribute
			syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important"); // Show the List
		}
	};

	// #endregion

	// #region Set Dropdown Label Text

	export function SetText(component : Object, content : any) : void {
		var dropdownElement : Element = syiro.component.Fetch(component); // Get the Element
		var dropdownLabel : Element = dropdownElement.querySelector("label"); // Get the label

		if (content !== false){ // If the content is not set to FALSE
			dropdownLabel.textContent = content; // Set the label content to the content provided
		}
		else if (content == false){ // If the content is set to false
			dropdownElement.removeChild(dropdownLabel); // Remove the label
		}

		syiro.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Set Dropdown Label Image

	export function SetImage(component : Object, content : any) : void {
		var dropdownElement : Element = syiro.component.Fetch(component); // Get the Element

		var dropdownLabelImage : Element = dropdownElement.querySelector("img"); // Get the image from the Dropdown

		if (content !== false){ // If the content is not set to FALSE
			if (dropdownLabelImage == null){ // If the image element does not exist
				dropdownLabelImage = syiro.generator.ElementCreator("img"); // Create an image
				dropdownElement.insertBefore(dropdownLabelImage, dropdownElement.firstChild); // Prepend the img in the Dropdown
			}

			dropdownLabelImage.setAttribute("src", content); // Set the dropdown label image source
		}
		else { // If the content is set to false
			dropdownElement.removeChild(dropdownLabelImage); // Remove the label image
		}

		syiro.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Set Dropdown Label Icon

	export function SetIcon(component : Object, content : string) : void {
		var dropdownElement : Element = syiro.component.Fetch(component); // Get the Dropdown
		syiro.component.CSS(component, "background-image", content); // Set the background-image CSS attribute
	}

	// #endregion

	// #region Function for adding an List Item component to the Dropdown's linked List, where component equals the Dropdown component

	export function AddItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = syiro.component.FetchLinkedListComponentObject(component); // Fetch the internal List component from the Dropdown
		syiro.component.Add(true, listComponentObject, listItemComponent); // Add the List Item component to the inner List
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's linked List, where component equals the Dropdown component

	export function RemoveItem(component : Object, listItemComponent : Object) : void {
		syiro.component.Remove(listItemComponent); // Remove the List Item component from the List Component
	}

	// #endregion

}
