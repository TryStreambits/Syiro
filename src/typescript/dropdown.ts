/*
 This is the module for Syiro Dropdown component.
 */

/// <reference path="button.ts" />
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />

module syiro.dropdown {

	// #region Meta-function for fetching the linked List Component Object of the Dropdown

	export var FetchLinkedListComponentObject : Function = syiro.component.FetchLinkedListComponentObject;

	// #endregion

	// #region Generator Meta Function

	export function Generate(properties : Object) : Object { // Generate a Dropdown Component and return a Component Object
		if ((typeof properties["items"] !== "undefined") || (typeof properties["list"] !== "undefined")){ // If the necessary List or List Item(s) Object(s) are provided
			properties["type"] = "dropdown"; // Set Button Type to Dropdown

			if (properties["label"] !== undefined){ // If content is defined in the labelProperties
				properties["content"] = properties["label"];
				delete properties["label"];
			}

			return syiro.button.Generate(properties);
		}
		else{ // If the necessary properties are NOT defined
			return false; // Return false
		}
	}

	// #endregion

	export var Toggle : Function = syiro.button.Toggle; // Meta-function for toggling

	// #region Set Dropdown Label Text - Meta function for syiro.button.SetLabel

	export function SetText(component : Object, content : any) : boolean {
		if (content == false){ // If the content is set to FALSE
			content = ""; // Change to empty string
		}

		return syiro.button.SetText(component, content);
	}

	// #endregion

	export var SetIcon : Function = syiro.button.SetIcon; // Meta-function for setting icon

	// #region Set Dropdown Label Image - Meta function for syiro.button.SetImage

	export function SetImage(component : Object, content : any) : boolean {
		if (content == false){ // If the content is set to FALSE
			content = ""; // Change to an empty string
		}

		return syiro.button.SetImage(component, content);
	}

	// #endregion

	// #region Function for adding an List Item component to the Dropdown's linked List, where component equals the Dropdown component
	// Planned deprecation around 1.8

	export function AddItem(component : Object, listItemComponent : Object) : void {
		var listComponentObject = syiro.component.FetchLinkedListComponentObject(component); // Fetch the internal List component from the Dropdown
		syiro.component.Add(true, listComponentObject, listItemComponent); // Add the List Item component to the inner List
	}

	// #endregion

	// #region Function for removing a List Item component from the Dropdown's linked List, where component equals the Dropdown component
	// Planned deprecation around 1.8

	export function RemoveItem(component : Object, listItemComponent : Object) : void {
		syiro.component.Remove(listItemComponent); // Remove the List Item component from the List Component
	}

	// #endregion

}
