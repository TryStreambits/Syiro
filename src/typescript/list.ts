/*
 This is the module for Rocket List component and it's sub-component, List Item
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Rocket List Component

module rocket.list {

	export var AddItem = rocket.component.Add; // Meta-function for adding a List Item component to a List component

	export var RemoveItem = rocket.component.Remove; // Meta-function for removing a List Item component from a List Item component

}

// #endregion

// #region List Item Component

module rocket.listitem {

	// #region Set Label in List Item

	export function SetLabel(component : Object, content : string) : boolean {
		var setLabelSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = rocket.component.Fetch(component); // Get the List Item Element

			if (typeof content == "string"){ // If the content is of type string
				var listItemLabelElement : Element; // Define listItemLabelElement to be an Element

				if (listItemElement.querySelector("label") !== null){ // If a label is already in the List Item
					listItemLabelElement = listItemElement.querySelector("label"); // Set listItemLabelElement as the queried label tag from listItemElement
				}
				else{
					listItemLabelElement = rocket.generator.ElementCreator(null, "label"); // Create a label and assign it to the listItemLabelElement
					listItemElement.insertBefore(listItemLabelElement, listItemElement.firstChild); // Prepend the label
				}

				listItemLabelElement.textContent = content; // Set the content of the List Item Label
				setLabelSucceeded = true; // Set setLabelSucceeded to true
			}
		}

		return setLabelSucceeded;
	}

	// #endregion

	// #region Set Control in List Item

	export function SetControl(component : Object, control : Object) : boolean {
		var setControlSucceeded : boolean = false; // Variable we return with a boolean value of success, defaulting to false.

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement = rocket.component.Fetch(component); // Get the List Item Element

			if (typeof control == "object"){ // If the content is of type Object
				if (listItemElement.querySelector("div") !== null){ // If there is already a control inside the List Item
					listItemElement.removeChild(listItemElement.querySelector("div")); // Remove the inner Control
				}

				if (control["type"] == "button"){ // If the type of the control Component is a button
					var innerControlElement = rocket.component.Fetch(control); // Get the Element of the inner control Component

					if (innerControlElement !== null){ // If the Component Element is actually stored in rocket.component.storedComponents
						delete rocket.component.storedComponents[control["id"]]; // Delete the Element from storedComponents
						listItemElement.appendChild(innerControlElement); // Append the control Component
						rocket.component.RemoveListeners("click MSPointerUp", component); // Ensure the List Item has no Listeners after adding the new Control
						rocket.component.Update(component["id"], listItemElement); // Update the storedComponent HTMLElement if necessary

						setControlSucceeded = true; // Set setLabelSucceeded to true
					}
				}
			}
		}

		return setControlSucceeded;
	}

	// #endregion

	// #region Add Event Listener - Meta-function
	// This function exists so we can default to a reasonable set of click-related events. This is no different from actually calling the function rocket.component.AddListener

	export function AddListeners(component : Object, callback : Function) : boolean {
		var listenerSettingSucceeded : boolean;

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			listenerSettingSucceeded = rocket.component.AddListeners("click MSPointerUp", component, callback);
		}
		else{ // If the component is NOT a List Item
			listenerSettingSucceeded = false;
		}

		return listenerSettingSucceeded;
	}

	// #endregion

}

// #endregion
