/*
	This is the namespace for core Syiro functionality.
*/

/// <reference path="data.ts" />
/// <reference path="events.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="render.ts" />

namespace syiro.component {
	export var lastUniqueIds : Object = {}; // Default the lastUniqueIds to an empty Object

	// Fetch
	// Fetch the HTMLElement of a Component object
	export function Fetch(component : any) : any { // Take a Syiro component object and return an HTMLElement (it's like magic!)
		let componentElement : any = component; // Default componentElement to being the component
		
		if (syiro.utilities.TypeOfThing(component, "ComponentObject")){ // If component is a ComponentObject
			componentElement = document.querySelector('div[data-syiro-component-id="' + component.id + '"]'); // The (HTML)Element of the Syiro component we'll be returning (default to fetching Element via querySelector)

			if (componentElement == null){ // If an HTMLElement is defined, meaning this is a new component that has not been put in the DOM yet
				componentElement = syiro.data.Read(component.id + "->HTMLElement"); // Get the HTMLElement via syiro.data APIs
			}
		}

		return componentElement;
	}

	// FetchComponentObject
	// Fetch or Generate Component Object based on arguments provided
	export function FetchComponentObject(element : any) : ComponentObject {
		let component : ComponentObject = element; // Define component as the Object we'll return, default to it being the element
		let typeOfElement = syiro.utilities.TypeOfThing(element); // Define typeOfElement as the type of element
		
		if ((typeOfElement !== "ComponentObject") && (typeOfElement !== "undefined") && (typeOfElement !== "null")){ // If the element we are providing is NOT a ComponentElement, undefined, or null
			component = { "id" : "", "type" : "" }; // Change component to being a template ComponentObject
			let topLevelObject : boolean = ((typeOfElement == "Document") || (typeOfElement.indexOf("Screen") == 0) || (typeOfElement == "Window")); // Is this is a "top level" Object (Document, Screen, Window)

			if (!topLevelObject){ // If this is not a top level Object
				if (typeOfElement == "string"){ // If we were provided a querySelector string
					element = document.querySelector(element); // Change element to the Element returned from querySelector
				}
				
				if (element !== null){
					let existingId = element.getAttribute("data-syiro-component-id"); // Get any existing Id if it has one
					let existingType : string = element.getAttribute("data-syiro-component"); // Get any existing type if it has one
					let tagOfElement : string = element.tagName.toLowerCase(); // Set tagOfElement to the element's tagName lowercased

					if (existingId == null){ // If there was no defined Id
						component.id = syiro.component.IdGen(tagOfElement); // Base the Id on the tag
						element.setAttribute("data-syiro-component-id", component.id ); // Set this component's Id
					} else { // If an Id was already defined
						component.id = existingId; // Set the component.id to the existingId
					}
					
					if (existingType == null){ // If there is no existing type
						component.type = tagOfElement; // Set the type to the tagOfElement
						element.setAttribute("data-syiro-component", component.type); // Set the component's type
					} else { // If a Type was already defined
						component.type = existingType; // Set the component.type to the existingType
					}
					
					if ((existingId == null) || (existingType == null)){ // If this element hasn't had a generated ComponentObject yet
						if ((component.type == "button") && (element.getAttribute("data-syiro-component-type") == "dropdown")){ // If we are defining a Syiro Dropdown Button component
							syiro.events.Add(syiro.events.Strings["up"], component, syiro.button.Toggle); // Immediately listen to the Dropdown Button
						}						
					}				
				}
			} else { // If this is a top level Object
				let lowercasedType : string = typeOfElement.toLowerCase(); // Lowercase the type of the variable
				component.id = lowercasedType; // Set the Id of the Component Object to lowercasedType
				component.type = lowercasedType; // Set the type of the Component Object to lowercasedType				
			}
		}

		return component; // Return the Component
	}

	// FetchDimensionsAndPosition
	// Fetch the Element Dimensions and Position
	export function FetchDimensionsAndPosition(component : any) : ClientRect { // Get the height and width of the Element
		let componentElement : HTMLElement = component; // Define componentElement as an Element, default to it being the component

		if (syiro.component.IsComponentObject(component)){ // If the Component provided is a Syiro Component Object
			componentElement = syiro.component.Fetch(component); // Fetch the Component Element
		}

		return componentElement.getClientRects()[0]; // Get the list of ComponentRect of this Component
	}

	// FetchLinkedListComponentObject
	// Fetch the Linked List component of the Dropdown Button or a Searchbox.
	export function FetchLinkedListComponentObject(component : ComponentObject) : ComponentObject {
		return syiro.component.FetchComponentObject('div[data-syiro-component="list"][data-syiro-component-owner="' + component.id + '"]'); // Get the Linked Component Object
	}

	// IdGen
	// Generate a unique ID for a Component or Element
	export function IdGen(type : string) : string { // Takes a Component type or Element tagName and returns the new component Id
		let lastUniqueIdOfType : number = syiro.component.lastUniqueIds[type]; // Define lastUniqueIdOfType as a Number, default to value (if any) in lastUniqueIds for this type

		if (!syiro.utilities.TypeOfThing(lastUniqueIdOfType, "number")){ // If the lastUniqueIdOfType is not a number
			lastUniqueIdOfType = 1; // Change to 1
		} else { // If lastUniqueIdOfType is a number
			lastUniqueIdOfType += 1 // Increment by 1
		}

		syiro.component.lastUniqueIds[type] = lastUniqueIdOfType; // Update the lastUniqueIds
		return (type + lastUniqueIdOfType.toString()); // Append lastUniqueIdOfType to the type to create a "unique" ID
	}

	// IsComponentObject
	// Verifies if the variable passed is a Component Object
	export function IsComponentObject(component : any) : boolean {
		return syiro.utilities.TypeOfThing(component, "ComponentObject");
	}

	// Update
	// Updates stored Component's HTMLElement, but only if it exists in the first place.
	export function Update(componentId : string, componentElement : Element){
		if (syiro.data.Read(componentId + "->HTMLElement") !== false){ // If the HTMLElement is defined in for this Component
			syiro.data.Write(componentId + "->HTMLElement", componentElement); // Update the componentElement with what we defined
		}
	}

	// Add
	// Adds components to other components or elements
	export function Add(appendOrPrepend : string, parentProvided : any, childProvided : any) : boolean { // Returns boolean if the component adding was successful or not
		if (syiro.utilities.TypeOfThing(childProvided["link"], "object")){ // If a childProvided is a LinkPropertiesObject
			childProvided = syiro.utilities.ElementCreator("a", // Change childProvided to the new Element created
				{
					"title" : childProvided["title"], // Set the title as the one specified in the component object
					"href" : childProvided["link"], // Add the link as href
					"content" :  childProvided["title"] // Set the inner tag content as the component title key
				}
			);
		}

		let parentComponent = syiro.component.FetchComponentObject(parentProvided), parentElement = syiro.component.Fetch(parentProvided); // Define parentComponent as fetched ComponentObject, parentElement as fetched Element
		let childComponent = syiro.component.FetchComponentObject(childProvided), childElement = syiro.component.Fetch(childProvided); // Define childComponent as fetched ComponentObject, childElement as fetched Element

		let allowAdding : boolean = true; // Allow adding by default

		if (parentComponent.type == "navbar"){ // If the parentComponent is a Navbar
			allowAdding = ((syiro.data.Read(parentComponent["id"] + "->Position") == "top") && ((childComponent["type"] == "button") || (childComponent["type"] == "searchbox"))); // If parent is top Navbar and child is Button or Searchbox
		} else if (parentComponent.type == "list"){ // If the parentComponent is a List
			allowAdding = (childComponent["type"].indexOf("list") !== -1); // If the Child component is a List or List Item

			if (allowAdding){ // If we are allowing the adding of the Child Component
				parentElement = parentElement.querySelector('div[data-syiro-minor-component="list-content"]'); // Change parentElement to listContent container for append
			}
		} else { // If we aren't doing any particular restrictions on the parentComponent adding of Elements
			allowAdding = true; // Change to true
		}

		if ((allowAdding) && (parentElement !== null) && (childElement !== null)){ // If we are allowing the adding of the childComponent and both the parentElement and childElement exist in syiro.data.storage or DOM
			if (appendOrPrepend == "prepend"){ // If we are prepending the childElement
				parentElement.insertBefore(childElement, parentElement.firstChild); // Insert before the first component
			} else { // If we are appending the childComponent
				parentElement.appendChild(childElement); // Append the Element
			}
			
			if (parentComponent["type"] == "list"){ // If the parentComponent is a List
				parentElement = parentElement.parentElement; // Change parentElement back to the List Element
			}

			syiro.component.Update(parentComponent["id"], parentElement); // Update the HTMLElement of parentComponent if necessary
		}

		return allowAdding; // Return the updated component object
	}

	// Remove
	// Remove a Components or Elements from their parent
	export function Remove(componentsToRemove : any) {
		let componentList : Array<any> = componentsToRemove; // Define componentList as an array to remove, default to componentsToRemove

		if (!syiro.utilities.TypeOfThing(componentsToRemove, "array")){ // If the componentsToRemove is NOT an Array
			componentList = [componentsToRemove]; // Set componentList to an Array consisting of the single Component Object
		}

		for (let componentProvided of componentList){ // For each Component and Sub-Component in componentList
			let componentObject = syiro.component.FetchComponentObject(componentProvided), componentElement = syiro.component.Fetch(componentProvided); // Get the ComponentObject and componentElement of the Component

			if (syiro.utilities.TypeOfThing(componentElement, "Element")){ // If componentElement is an Element
				let parentElement : Element = componentElement.parentElement; // Get the componentElement's parentElement

				if (syiro.data.Read(componentObject.id) !== false){ // It there is data regarding individualComponentObject in syiro.data.storage
					syiro.data.Delete(componentObject.id); // Delete the Component's data
				}

				if (parentElement !== null){ // If a parent of this Element exists
					parentElement.removeChild(componentElement); // Remove this Component from the DOM, if it exists
				
					if (parentElement.hasAttribute("data-syiro-component-id")){ // If the parentElement has a Component Id
						syiro.component.Update(parentElement.getAttribute("data-syiro-component-id") + "->HTMLElement", parentElement); // Update this "parentElement" Component if necessary
					}
				}
			}
		}
	}
}