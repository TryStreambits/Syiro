/*
 This is the module for Rocket Dropdown component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />

module rocket.dropdown {

	// #region Dropdown Generator

	export function Generate(properties : Object) : Object { // Generate a Dropdown Component and return a Component Object
		if ((properties["items"] !== undefined) || (properties["list"] !== undefined)){ // If the necessary List or List Item(s) Object(s) are provided
			var componentId : string = rocket.generator.IdGen("dropdown"); // Generate a component Id
			var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "dropdown"); // Generate a Dropdown Element

			// #region Dropdown Creation

			if (properties["image"] !== undefined){ // If an image (like an avatar) is defined in the labelProperties
				var primaryImage : HTMLElement = rocket.generator.ElementCreator("img", { "src" : properties["image"] }); // Create an img Element with the image source
				componentElement.appendChild(primaryImage); // Append the primary image
			}

			if (properties["label"] !== undefined){ // If content is defined in the labelProperties
				var dropdownLabelText : HTMLElement = rocket.generator.ElementCreator("label", { "content" : properties["label"] }); // Create a label for the Dropdown content
				componentElement.appendChild(dropdownLabelText); // Append the label to the Dropdown
			}

			if (properties["icon"] !== undefined){ // If an icon is defined in the labelProperties
				rocket.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")"); // Set the background-image to the icon
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

			var listComponentElement : Element = rocket.component.Fetch(listComponent); // Fetch the List Component Element
			document.querySelector("body").appendChild(listComponentElement); // Append the List Element to the end of the document
			listComponentElement.setAttribute("data-rocket-component-owner", componentId); // Set the List's owner to be the Dropdown

			// #endregion

			// #region Dropdown List Position (For the Dropdown toggling of the List)

			if (properties["position"] == undefined){ // If the position information is NOT defined
				properties["position"] = { "vertical" : "below", "horizontal" : "center"}; // Default to showing the List centered, below the Dropdown
			}

			listComponentElement.setAttribute("data-rocket-component-render", properties["position"]["vertical"] + "-" + properties["position"]["horizontal"]); // Set the data-rocket-component-render to vertical-horizontal (ex. bottom-center)

			// #endregion

			rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents
			return { "id" : componentId, "type" : "dropdown" }; // Return a Component Object
		}
		else{ // If the necessary properties are NOT defined
			return false; // Return false
		}
	}

	// #endregion

	// #region Common Component Handlers

	export function Toggle(){ // Function that will handle toggling the Dropdown
		var component : Object = arguments[0]; // Get the component that was passed to this function as a bound argument
		var componentElement : Element = rocket.component.Fetch(component); // Get the componentElement based on the component Object

		var linkedListComponentObject : Object = rocket.dropdown.FetchLinkedListComponentObject(component); // Get the linked List Component Object of the Dropdown
		var currentIcon = rocket.component.CSS(component, "background-image"); // Get the background-image, assuming it isn't the default

		if (rocket.component.CSS(linkedListComponentObject, "visibility") == "visible"){ // If the CSS of the linked List Component is stating the List is active (visibility is visible)
			if (currentIcon !== false){ // If the currentIcon exists
				rocket.component.CSS(component, "background-image", currentIcon.replace("-inverted", "")); // Remove the -inverted from the icon
			}

			componentElement.removeAttribute("active"); // Remove the "active" attribute
			rocket.component.CSS(linkedListComponentObject, "visibility", false); // Remove the visibility attribute and hide the List
		}
		else{ // If the linked List is not active / showing
			var linkedListComponentElement : Element = rocket.component.Fetch(linkedListComponentObject); // Get the List Component's Element
			var positionInformation : Array<string> = linkedListComponentElement.getAttribute("data-rocket-component-render").split("-"); // Get the position information on where we should render the List, split it into an array

			var listToDropdownVerticalRelation : string = positionInformation[0]; // Get the first key, which is the vertical position in relation to the Dropdown
			var listToDropdownHorizontalRelation : string = positionInformation[1]; // Get the second key, which is the horizontal position in relation to the Dropdown

			// #region Dropdown and List Dimensions & Position Variable Defining

			var dropdownDimensionsAndPosition : ClientRect = componentElement.getBoundingClientRect(); // Get the dimensions and position of the Dropdown Element
			var listDimensionsAndPosition : ClientRect = linkedListComponentElement.getBoundingClientRect(); // Get the dimensions mainly (mainly for height and width)

			var dropdownHeight : number = dropdownDimensionsAndPosition.height; // Get the height of the Dropdown
			var dropdownWidth : number = dropdownDimensionsAndPosition.width; // Get the width of the Dropdown
			var dropdownVerticalPosition : number = dropdownDimensionsAndPosition.y; // Get the vertical position (Y coord) of the Dropdown
			var dropdownHorizontalPosition : number = dropdownDimensionsAndPosition.x; // Get the horizontal position (X coord) of the Dropdown

			var listHeight : number = listDimensionsAndPosition.height; // Get the height of the List
			var listWidth : number = listDimensionsAndPosition.width; // Get the width of the List

			// #endregion

			// #region End Result Variables

			var listVerticalPosition : number; // Define listVerticalPosition as the variable to hold the Y coordinate of where the List should render
			var listHorizontalPosition : number; // Define listHorizontalPosition as the variable to hold the X coordinate of where the List should render

			// #region List Vertical Position Calculation

			if (listToDropdownVerticalRelation == "above"){ // If we are putting the List above the Dropdown
				listVerticalPosition = (dropdownVerticalPosition - listHeight); // Set the position be the Y coord position minus the height of the List (ex: Y = 300. LH = 200. LVP = 300 - 200)
			}
			else{ // If we are putting the List below the Dropdown
				listVerticalPosition = (dropdownVerticalPosition + dropdownHeight); // Set the position to be the Y coord position plus the height the Dropdown (ex. Y = 300. DH = 40. LVP = 300 + 40)
			}

			// #endregion

			// #region Horizontal Vertical Position

			var listWidthInRelationToDropdown = (listWidth - dropdownWidth); // Set the listWidthInRelationToDropdown as the  List width minus the Dropdown width (ex. LW = 200. DW = 40. LWRD = 160)

			if (listToDropdownHorizontalRelation == "left"){ // If we are putting the List to the left of the Dropdown
				listHorizontalPosition = (dropdownHorizontalPosition - listWidthInRelationToDropdown); // Set the position to be the X coord position minus listWidthInRelationToDropdown (ex. X = 300. LWRD = 160. LWP = 140)
			}
			else if (listToDropdownHorizontalRelation == "center"){ // If we are putting the List in the center of the Dropdown
				listHorizontalPosition = (dropdownHorizontalPosition + (listWidthInRelationToDropdown / 2)); // Set the position to be the X coord position plus listWidthInRelationToDropdown divided by 2. (ex. X  = 300. LWRD / 2 = 80. LWP = 380.)
			}
			else if (listToDropdownHorizontalRelation == "right"){ // If we are putting the List to the right of the Dropdown
				listHorizontalPosition = dropdownHorizontalPosition; // Set the position to the X coord position, since we are having the left edge of the List meet the left edge of the Dropdown
			}

			// #endregion

			if (currentIcon !== false){ // If the currentIcon exists
				var currentIconWithoutExtension = currentIcon.substr(0, currentIcon.indexOf(".")); // Get the entire name of the file without the extension
				rocket.CSS(component, "background-image", currentIcon.replace(currentIconWithoutExtension, currentIconWithoutExtension + "-inverted")); // Replace the file name with filename-inverted
			}

			componentElement.setAttribute("active", ""); // Set the "active" attribute
			rocket.component.CSS(linkedListComponentObject, "top", listVerticalPosition.toString() + "px"); // Set the top variable to be the Y position + px (ex. 100px)
			rocket.component.CSS(linkedListComponentObject, "left", listHorizontalPosition.toString() + "px"); // Set the left variable to the X position + px (ex. 400px)
			rocket.component.CSS(linkedListComponentObject, "visibility", "visible"); // Show the List
		}
	};

	// #endregion

	// #region Function for fetching the Linked List component of the Dropdown.

	export function FetchLinkedListComponentObject(component) : Object {
		var listSelector : string = 'div[data-rocket-component="list"][data-rocket-component-owner="' + component["id"] + '"]'; // Generate a List CSS selector with the owner set to the Dropdown Component's Id
		return rocket.component.FetchComponentObject(document.querySelector(listSelector)); // Get the Dropdown's Linked Component Object
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

		var dropdownLabelImage : Element = dropdownElement.querySelector("img"); // Get the image from the Dropdown

		if (content !== false){ // If the content is not set to FALSE
			if (dropdownLabelImage == null){ // If the image element does not exist
				dropdownLabelImage = rocket.generator.ElementCreator("img"); // Create an image
				dropdownElement.insertBefore(dropdownLabelImage, dropdownElement.firstChild); // Prepend the img in the Dropdown
			}

			dropdownLabelImage.setAttribute("src", content); // Set the dropdown label image source
		}
		else { // If the content is set to false
			dropdownElement.removeChild(dropdownLabelImage); // Remove the label image
		}

		rocket.component.Update(component["id"], dropdownElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Set Dropdown Label Icon

	export function SetIcon(component : Object, content : string) : void {
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the Dropdown
		rocket.component.CSS(component, "background-image", content); // Set the background-image CSS attribute
	}

	// #endregion

	// #region Function for adding an List Item component to the Dropdown's linked List, where component equals the Dropdown component

	export function AddItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = rocket.dropdown.FetchLinkedListComponentObject(component); // Fetch the internal List component from the Dropdown
		rocket.component.Add(true, listComponentObject, listItemComponent); // Add the List Item component to the inner List
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's linked List, where component equals the Dropdown component

	export function RemoveItem(component : Object, listItemComponent : Object) : void {
		rocket.component.Remove(listItemComponent); // Remove the List Item component from the List Component
	}

	// #endregion

}
