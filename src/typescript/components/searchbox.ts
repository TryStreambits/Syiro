/*
	This is the namespace for Syiro Searchbox component.
*/

/// <reference path="../interfaces/searchbox.ts" />
/// <reference path="../component.ts" />
/// <reference path="../style.ts" />
/// <reference path="../utilities.ts" />

namespace syiro.searchbox {

	// New
	// Create a Searchbox
	export function New(properties : SearchboxPropertiesObject) : ComponentObject { // Generate a Searchbox Component and return a Component Object
		let componentId : string = syiro.component.IdGen("searchbox"); // Generate a component Id
		let componentElement : HTMLElement; // Define componentElement as an HTMLElement
		let componentData : any = {}; // Define searchboxComponentData as the intended Component Data of the Searchbox that'll be stored via syiro.data

		let searchboxContainerData : Object = { "data-syiro-component" : "searchbox", "data-syiro-component-id" : componentId }; // Define searchboxContainerData to contain properties we should apply to the Searchbox

		if (!syiro.utilities.TypeOfThing(properties, "object")){ // If no properties were provided
			properties = {}; // Set as an empty Object
		}

		if (!syiro.utilities.TypeOfThing(properties.content, "string")){ // If a placeholder text is not provided
			properties.content = "Search here..."; // Default to "Search here..." message
		}

		if (properties.DisableInputTrigger){ // If we have DisableInputTrigger as true, we will prevent event handling on the input box of the Searchbox
			componentData["DisableInputTrigger"] = true; // Set it in componentData
		}

		let inputElement : HTMLElement = syiro.utilities.ElementCreator("input", { "aria-autocomplete" : "list", "role" : "textbox", "placeholder" : properties.content }); // Searchbox Inner Input Generation
		let searchButton : ComponentObject = syiro.button.New({ "icon" : "search" }); // Create a Search icon button

		// #region Suggestions Enabling

		if (properties.suggestions){ // If suggestions is enabled
			componentData["suggestions"] = "enabled"; // Define suggestions as a string "enabled" to imply suggestions are enabled

			componentData["handlers"] = { // Add "handlers" to the searchboxComponentData
				"listItemHandler" : properties.listItemHandler // Handler for dynamically generated List Items as well as preseeded ones.
			};

			let listItems : Array<Object> = []; // Define listItems as an array of Objects, defaulting to an empty array
			componentData["preseed"] = syiro.utilities.TypeOfThing(properties.preseed, "array"); // Define preseed as the truth of if preseed is an array

			if (componentData["preseed"]){ // If a preseed []string is provided
				for (let preseedItemIndex in properties.preseed){ // For each item in preseed
					listItems.push(syiro.listitem.New({ "label" : properties.preseed[preseedItemIndex] })); /// Push a new generated List Item Component Object to listItemsArray
				}
			} else { // If preseed []string is not provided
				componentData["handlers"]["suggestions"] = properties.handler; // Faux "suggestions" key with the val as the handler passed (that we will use to get suggestions)
			}

			let searchSuggestionsList : ComponentObject = syiro.list.New( { "items" : listItems }); // Generate a List with the items provided (if any)
			let searchSuggestionsListElement : Element = syiro.component.Fetch(searchSuggestionsList); // Get the List Component Element

			searchboxContainerData["aria-owns"] = searchSuggestionsList.id; // Define the aria-owns, setting it to the List Component to declare for ARIA that the Searchbox Component "owns" the List Component
			searchSuggestionsListElement.setAttribute("data-syiro-component-owner", componentId); // Set the List's Component owner to be the component Id

			document.body.appendChild(searchSuggestionsListElement); // Append the List Element to the end of the document

			if (componentData["preseed"]){ // If a preseed is enabled
				for (let listItemIndex in listItems){ // For each List Item in listItems array
					syiro.events.Add(syiro.events.Strings["up"], listItems[listItemIndex], properties.listItemHandler); // Add a mouseup / touchend event to List Item with the handler being list-item-handler
				}
			}
		}

		// #endregion

		componentElement = syiro.utilities.ElementCreator("div", searchboxContainerData); // Generate the Searchbox Container with the inner input as content
		componentElement.appendChild(inputElement); // Append the input Element
		componentElement.appendChild(syiro.component.Fetch(searchButton)); // Append the fetch Element of the searchButton

		componentData["HTMLElement"] = componentElement; // Define the HTMLElement of the Searchbox as the componentElement
		syiro.data.Write(componentId, componentData); // Add the searchboxComponentData to the syiro.data.storage for this Searchbox Component

		return { "id" : componentId, "type" : "searchbox" }; // Return a Component Object
	}

	// Suggestions
	// Searchbox Suggestions Handler
	export function Suggestions(...args : any[]){
		let searchboxElement : any;
		let searchboxValue : string;

		if (arguments.length == 2){ // If we were passed only two arguments (the input Element and value)
			searchboxElement = arguments[0].parentElement; // Define searchboxElement as the input Element's parent
			searchboxValue = arguments[1]; // Define the searchboxValue as the second argument
		} else if (arguments.length > 2){ // If we were passed more than two arguments
			searchboxElement = arguments[0]; // Define searchboxElement as the provided Element (which was bound)
			searchboxValue = searchboxElement.querySelector("input").value; // Define searchboxValue as the queried input Element's value
		}

		let searchboxComponent : ComponentObject = syiro.component.FetchComponentObject(searchboxElement); // Define the Searchbox Component as the fetched Component Object of searchboxElement

		let linkedListComponent : ComponentObject = syiro.component.FetchLinkedListComponentObject(searchboxComponent); // Fetch the Linked List of the Searchbox Component
		let linkedListComponentElement : Element = syiro.component.Fetch(linkedListComponent); // Fetch the Element of the List Component
		let innerListItemsOfLinkedList : NodeList = linkedListComponentElement.querySelectorAll('div[data-syiro-component="list-item"]'); // Fetch a NodeList of Elements of all the List Items in the List

		syiro.style.Set(linkedListComponentElement, "width", searchboxElement.clientWidth + "px"); // Ensure the Linked List is the same width of the Searchbox
		syiro.render.Position(["below", "center"], linkedListComponent, searchboxComponent); // Position the Linked List Component below and centered in relation to the Searchbox Component

		if (searchboxValue !== ""){ // If the value is not empty
			if (syiro.data.Read(searchboxComponent.id + "->preseed")){ // If preseed is enabled
				syiro.style.Set(linkedListComponentElement, "visibility", "visible"); // Immediately ensure the Linked List of the Searchbox is visible

				if (innerListItemsOfLinkedList.length > 0){ // If the Linked List of the Searchbox has List Items
					let numOfListItemsThatWillShow : number = 0; // Define numOfListItemsThatWillShow as, well the number of list items that will show, obviously.

					for (let listItemIndex = 0; listItemIndex < innerListItemsOfLinkedList.length; listItemIndex++){ // For each List Item in the Linked List
						let listItem = innerListItemsOfLinkedList[listItemIndex]; // Define listItem as this particular List Item in the index

						if (syiro.utilities.TypeOfThing(listItem, "Element")){ // If this is an Element
							if (listItem.textContent.indexOf(searchboxValue) !== -1){ // If the List Item content contains the current searchboxValue
								numOfListItemsThatWillShow++; // Increment the numOfListItemsThatWillShow by one
								syiro.style.Set(listItem, "display", "block"); // Show the List Item since it has a suggestion string, use display CSS attribute so List height changes
							} else {
								syiro.style.Set(listItem, "display", "none"); // Hide the List Item since it does not have content of the suggestion,  use display CSS attribute so List height changes
							}
						}
					}

					if (numOfListItemsThatWillShow == 0){ // If the numOfListItemsThatWillShow is zero
						syiro.style.Set(linkedListComponentElement, "visibility", "hidden"); // Hide the List since we have no suggestions that are valid
					}
				}
			} else { // If preseed is not enabled
				syiro.style.Set(linkedListComponentElement, "visibility", "hidden"); // Hide the List until we get suggestions and generate the new List Items

				let suggestions : Array<string> = syiro.data.Read(searchboxComponent.id + "->handlers->suggestions").call(this, searchboxValue); // Call the suggestions handler function

				if (suggestions.length !== 0){ // If we were provided suggestions
					if (innerListItemsOfLinkedList.length > 0){ // If the Linked List of the Searchbox has List Items
						syiro.component.Remove(innerListItemsOfLinkedList); // Remove all the List Items in the Linked List
					}

					for (let suggestionIndex in suggestions){ // For each suggestion in suggestions
						let suggestionListItem : ComponentObject = syiro.listitem.New({ "label" : suggestions[suggestionIndex] }); // Create a List Item with the label being the suggestion
						syiro.list.AddItem("append", linkedListComponent, suggestionListItem); // Append the List Item to the Linked List
						syiro.events.Add(syiro.events.Strings["up"], suggestionListItem, syiro.data.Read(searchboxComponent.id + "handlers->listItemHandler")); // Add the list-item-handler we have stored from syiro.data to the suggestionListItem
					}

					syiro.style.Set(linkedListComponentElement, "visibility", "visible"); // Show the List Item now that we have parsed the suggestions and generated List Items
				}
			}
		} else { // If the searchboxValue is empty
			syiro.style.Set(linkedListComponentElement, "visibility", "hidden"); // Hide the List
		}
	}

	// SetText
	// Set the Searchbox Text / placeholder
	export function SetText(component : ComponentObject, content : any) : void {
		let searchboxElement : Element = syiro.component.Fetch(component); // Get the Searchbox Syiro component element

		if (syiro.utilities.TypeOfThing(searchboxElement, "Element")){ // If the searchboxElement is an Element
			let searchboxInputElement = searchboxElement.querySelectorAll("input")[0]; // Get the inner input tag of the searchboxElement

			if (content !== ""){ // If we are updating the content
				searchboxInputElement.setAttribute("placeholder", content); // Set the placeholder string
			} else if (content == ""){ // If the content is set to false, meaning we are removing the placeholder
				searchboxInputElement.removeAttribute("placeholder"); // Remove the placeholder attribute
			}

			syiro.component.Update(component.id, searchboxElement); // Update the Searchbox Component HTMLElement if necessary
		}
	}

}