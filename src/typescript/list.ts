/*
 This is the module for Rocket List component and it's sub-component, List Item
 */

/// <reference path="core.ts" />

// #region Rocket List Component

module rocket.list {

	// #region Add a List Item component to a List component

	export function AddItem(listComponent : Object, listItemComponent : Object) : boolean {
		var addItemSucceeded : boolean; // Variable we return with a boolean value of success

		if ((listComponent["type"] == "list") && (listItemComponent["type"] == "list-item")){ // If the List Component type is in fact a List and the List Item component is in fact a List Item
			addItemSucceeded = rocket.core.AddComponent(true, listComponent, listItemComponent); // Append the List Item to the List and assign the value returned to addItemSucceeded
		}
		else{ // If either of the components is NOT valid
			addItemSucceeded = false;
		}

		return addItemSucceeded;
	}

	// #endregion

	// #region Remove a List Item component from a List Item component

	export function RemoveItem(listComponent : Object, listItemComponent : Object) : boolean {
		return rocket.core.RemoveComponent(listComponent, listItemComponent);
	}

	// #endregion

}

// #endregion

// #region List Item Component

module rocket.listitem {

	// #region Setting Label or Component in List Item

	export function Set(component : Object, section : string, content : any) : boolean{
		var setSectionSucceeded : boolean; // Variable we return with a boolean value of success

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement : Element = rocket.core.Get(component); // Get the corresponding Element

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

					listItemRightElement.appendChild(rocket.core.Get(content)); // Append the fetched Element to the listItemRightElement
				}
				else{ // If the content is NOT an Object
					listItemElement.removeChild(listItemRightElement); // Remove the section
				}

				rocket.core.UpdateStoredComponent(component["id"], listItemElement); // Update the storedComponent HTMLElement if necessary
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

	// #region Add Listener to List Item

	export function AddListener(component : Object, callback : Function) : boolean{
		var addEventListenerSucceeded : boolean; // Variable we return with a boolean value of success

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement : Element = rocket.core.Get(component); // Get the corresponding Element

			if (listItemElement.querySelector("section") == null){ // If there is no section defined in the List Item, meaning it is only the text label
				listItemElement.addEventListener("click touchend MSPointerUp", callback(component)); // Call the callback on "click" with the component that was clicked / touched / etc.
				addEventListenerSucceeded = true; // Define success as true
			}
			else{ // If there IS a section defined
				addEventListenerSucceeded = false; // Define success as false since we have a section, which could potentially hold a component that requires listeners
			}
		}
		else{ // If component is NOT a List Item
			addEventListenerSucceeded = false; // Define success as false
		}

		return addEventListenerSucceeded;
	}

	// #endregion

	// #region Remove Listener From List Item

	export function RemoveListener(component : Object) : boolean {
		var removeEventListenerSucceeded : boolean; // Variable we return with a boolean value of success

		if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
			var listItemElement : Element = rocket.core.Get(component); // Get the corresponding Element

			listItemElement.removeEventListener("click touchend MSPointerUp", function(){}); // Remove the Event Listener
			removeEventListenerSucceeded = true; // Define success as true
		}
		else{ // If component is NOT a List Item
			removeEventListenerSucceeded = false; // Define success as false
		}

		return removeEventListenerSucceeded;
	}

	// #endregion

}

// #endregion