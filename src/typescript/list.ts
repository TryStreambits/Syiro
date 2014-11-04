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

	// #region Setting Label or Component in List Item

	export function Set(component : Object, section : string, content : any) : boolean{
		var setSectionSucceeded : boolean; // Variable we return with a boolean value of success

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement : Element = rocket.component.Fetch(component); // Get the corresponding Element

			if ((section == "left") && (typeof content == "string")){ // If the content we are adding is a string and going to the left section
				var listItemLeftElement : Element = listItemElement.querySelector("label"); // Get the label element

				if (listItemLeftElement == null){ // If the List Item Label element doesn't exist
					listItemLeftElement = document.createElement("label"); // Create a new label
					listItemElement.insertBefore(listItemLeftElement, listItemElement.firstChild); // Prepend the label
				}

				listItemLeftElement.textContent = content; // Set the label content to what is defined
				setSectionSucceeded = true; // Define success as true
			}
			else if (section == "right"){ // If the content we are setting is a Component for the right section of the List Item
				var listItemRightElement : Element = listItemElement.querySelector("section"); // Get the section element

				if (typeof content == "Object"){ // If the content is an Object (Rocket component)
					if (listItemRightElement == null){ // If the List Item Section element doesn't exist'
						listItemRightElement = document.createElement("section"); // Create a new section
						listItemElement.appendChild(listItemRightElement); // Append the section
					}

					listItemRightElement.appendChild(rocket.component.Fetch(content)); // Append the fetched Element to the listItemRightElement
				}
				else{ // If the content is NOT an Object
					listItemElement.removeChild(listItemRightElement); // Remove the section
				}

				rocket.component.Update(component["id"], listItemElement); // Update the storedComponent HTMLElement if necessary
				setSectionSucceeded = true; // Define success as true
			}
			else{ // If either we aren't using an appropriate section, content is a mismatch, etc.
				setSectionSucceeded = true; // Define success as true
			}
		}
		else{ // If component is NOT a List Item
			setSectionSucceeded = false; // Define success as false
		}

		return setSectionSucceeded;
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
