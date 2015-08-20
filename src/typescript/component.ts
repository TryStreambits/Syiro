/*
	This is the namespace for core Syiro functionality.
*/

/// <reference path="data.ts" />
/// <reference path="events.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="render.ts" />

namespace syiro.component {
	export var lastUniqueIds : Object = {}; // Default the lastUniqueIds to an empty Object

	// #region Component CSS Fetcher / Modifier

	export function CSS(component : any, property : string, newValue ?: (string | boolean)){
		var typeOfComponent = syiro.utilities.TypeOfThing(component); // Get the type of the variable passed
		var modifiableElement : Element; // Define modifiableElement as the Element we are going to modify
		var returnedValue : any; // Define returnedValue as value we are returning
		var modifiedStyling : any = false; // Define modifiedStyling as a boolean value to indicate whether we modified the Element's styling or not. Defaults to false.

		if (typeOfComponent == "ComponentObject"){ // If we were provided a Component Object
			modifiableElement = syiro.component.Fetch(component); // Fetch the Element and assign it to modifiableElement
		}
		else if (typeOfComponent == "Element"){ // If the component is NOT a Syiro Component Object
			modifiableElement = component; // Treat the component as an Element
		}

		if ((typeof modifiableElement !== "undefined") && (modifiableElement !== null)){ // If the modifiableElement is not null (a potential result of syiro.component.Fetch if the Element of the Component does not exist)
			// #region Element Styling (Since it isn't an HTMLElement) To Element Styling "Object"

			var currentElementStyling = modifiableElement.getAttribute("style");
			var elementStylingObject = {}; // Define elementStylingObject as an empty Object

			if (currentElementStyling !== null){ // If the modifiableElement has the style attribute
				var currentElementStylingArray = currentElementStyling.split(";"); // Split currentElementStyling into an array where the separator is the semi-colon

				for (var styleKey in currentElementStylingArray){ // For each CSS property / value in the styling
					var cssPropertyValue = currentElementStylingArray[styleKey]; // Define cssPropertyValue as this index in currentElementStylingArray
					if (cssPropertyValue !== ""){ // If the array item value is not empty
						var propertyValueArray = cssPropertyValue.split(": "); // Split the propery / value based on the colon to an array
						elementStylingObject[propertyValueArray[0].trim()] = propertyValueArray[1].trim(); // Cleanup the whitespace in the property and value,add it as a key/val in the elementStylingObject
					}
				}
			}

			// #endregion

			var stylePropertyValue : any = elementStylingObject[property]; // Define stylePropertyValue as the value of the property (if any) in the elementStylingObject

			if (typeof newValue == "undefined"){ // If we are fetching the current value rather than modifying or removing it
				if (stylePropertyValue !== undefined){ // If the elementStylingObject has the property
					returnedValue = stylePropertyValue; // Define returnedValue as the value of the property
				}
				else{ // If the property we are looking for does not exist
					returnedValue = ""; // Define the returnedValue as an empty string
				}
			}
			else if ((newValue !== "") && (newValue !== false)){ // If we are updated the value (not an empty string)
				elementStylingObject[property] = newValue; // Assign the newValue to the property
				modifiedStyling = true; // Indicate that we've modified the Element's styling
				returnedValue = newValue; // Define returnedValue as the value we are setting
			}
			else{ // If we are removing the value
				if (typeof stylePropertyValue !== "undefined"){ // If the elementStylingObject has the property
					elementStylingObject[property] = null; // Define the property as null
					modifiedStyling = true; // Indicate that we've modified the Element's styling
				}
			}

			if (modifiedStyling){ // If we have modified the styling Object
				var updatedCSSStyle : string = ""; // Define updatedCSSStyle as the new style we will apply

				for (var cssProperty in elementStylingObject){ // For each CSS property / value in the elementStylingObject
					if (elementStylingObject[cssProperty] !== null){ // If the value is NOT null (not deletion)
						updatedCSSStyle = updatedCSSStyle + cssProperty + ": " + elementStylingObject[cssProperty] + ";"; // Append the property + value to the updatedCSSStyle and ensure we have closing semi-colon
					}
				}

				if (updatedCSSStyle.length !== 0){ // If the styling is not empty
					modifiableElement.setAttribute("style", updatedCSSStyle); // Set the style attribute
				}
				else{ // If the styling is empty
					modifiableElement.removeAttribute("style"); // Remove the style attribute
				}
			}
		}
		else{ // If the modifiableElement doesn't exist
			returnedValue = ""; // Set returnedValue to an empty string
		}

		return returnedValue;
	}

	// #endregion

	// #region Fetch - Function for fetching the HTMLElement of a Component object

	export function Fetch(component : Object) : any { // Take a Syiro component object and return an HTMLElement (it's like magic!)
		var componentElement : Element = document.querySelector('div[data-syiro-component-id="' + component["id"] + '"]'); // The (HTML)Element of the Syiro component we'll be returning (default to fetching Element via querySelector)

		if (componentElement == null){ // If an HTMLElement is defined, meaning this is a new component that has not been put in the DOM yet
			componentElement = syiro.data.Read(component["id"] + "->" + "HTMLElement"); // Get the HTMLElement via syiro.data APIs
		}

		return componentElement;
	}

	// #endregion

	// #region Fetch or Generate Component Object based on arguments provided

	export function FetchComponentObject( ...args : any[]) : Object {
		var component : Object = {}; // Define component as the Object we'll return
		var variableProvided : any; // Define variableProvided as either what was provided as the first argument or what we fetch from the selector
		var previouslyDefined : boolean = false; // Define previouslyDefined as a boolean that defaults to true. We use this to determine whether to immediately add event listeners to a Dropdown Button

		if (arguments.length == 1){ // If only one argument is defined
			if (typeof arguments[0] == "string"){ // If the first argument defined is a string (selector)
				variableProvided = document.querySelector(arguments[0]); // Define variableProvided as the returned Element from querySelector
			}
			else{ // If the first argument is not a string
				variableProvided = arguments[0]; // Define variableProvided as the first argument
			}
		}
		else if (arguments.length == 2){ // If two arguments are defined
			if (typeof arguments[1] == "string"){ // If the second argument defined in a string (selector)
				variableProvided = document.querySelector(arguments[1]); // Define variableProvided as the returned Element from querySelector
			}
		}

		var typeOfVariableProvided = syiro.utilities.TypeOfThing(variableProvided); // Define typeOfVariableProvided as the type of variableProvided

		if (typeOfVariableProvided == "Element"){ // If this is an Element
			var possibleExistingId = variableProvided.getAttribute("data-syiro-component-id"); // Get the possible existing Component Id of the Element

			if (possibleExistingId !== null){ // If this variable has already been defined
				previouslyDefined = true; // Set previouslyDefined as true
				component["id"] = possibleExistingId;
				component["type"] = variableProvided.getAttribute("data-syiro-component"); // Get the Component type
			}
			else{ // If an id has not been previously defined
				if ((arguments.length == 2) && (typeof arguments[0] == "string")){ // If the first argument is a string and the args length is two
					component["id"] = syiro.component.IdGen(arguments[0]); // Define componentId as Id generated based on the type provided
					component["type"] = arguments[0]; // Define the type of the component as the type passed as the first arg
				}
				else if (arguments.length == 1){
					component["id"] = syiro.component.IdGen(variableProvided.tagName.toLowerCase()); // Generate a unique id for this component based on the component Element's tagName
					component["type"] = variableProvided.tagName.toLowerCase(); // Set the component "type" simple as the lowercased tagName
				}

				variableProvided.setAttribute("data-syiro-component-id", component["id"] ); // Set this component's Id
				variableProvided.setAttribute("data-syiro-component", component["type"]); // Set the component's type

				if ((component["type"] == "button") && (variableProvided.getAttribute("data-syiro-component-type") == "dropdown") && (previouslyDefined == false)){ // If we are defining a Syiro Dropdown Button component for the first time
					syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.button.Toggle); // Immediately listen to the Dropdown Button
				}
			}
		}
		else if ((typeOfVariableProvided == "Document") || (typeOfVariableProvided == "Screen") || typeOfVariableProvided == "Window"){ // If this is a valid alternative variable to do event handling on
			var lowercasedType : string = typeOfVariableProvided.toLowerCase(); // Lowercase the type of the varaible
			component["id"] = lowercasedType; // Set the Id of the Component Object to lowercasedType
			component["type"] = lowercasedType; // Set the type of the Component Object to lowercasedType
		}

		if (typeof component["id"] == "string"){ // If the Id is defined
			return component; // Return the Component
		}
		else{ // If the componentElement is null
			return false;
		}
	}

	// #endregion

	// #region Element Dimensions and Position Fetching

	export function FetchDimensionsAndPosition(component : any) : Object { // Get the height and width of the Element
		var dimensionsAndPosition : Object = {}; // Define dimensionsAndPosition as an empty Object
		var componentElement : HTMLElement; // Define componentElement as an Element

		if (syiro.utilities.TypeOfThing(component) == "ComponentObject"){ // If the Component provided is a Syiro Component Object
			componentElement = syiro.component.Fetch(component); // Fetch the Component Element
		}
		else { // If the Component provided is NOT a Syiro Component Object
			componentElement = component; // Set the componentElement to the component (Element) provided
		}

		var componentClientRectList : ClientRectList = componentElement.getClientRects(); // Get the list of ComponentRect of this Component

		dimensionsAndPosition["x"] = componentClientRectList[0].left; // Set x to the horizontal "left" position
		dimensionsAndPosition["y"] = componentClientRectList[0].top; // Set y to the vertical "top" position
		dimensionsAndPosition["height"] = componentClientRectList[0].height; // Set height to the ClientRect height
		dimensionsAndPosition["width"] = componentClientRectList[0].width; // Set width to the ClientRect width

		return dimensionsAndPosition;
	}

	// #endregion

	// #region Function for fetching the Linked List component of the Dropdown Button or a Searchbox.

	export function FetchLinkedListComponentObject(component) : Object {
		var listSelector : string = 'div[data-syiro-component="list"][data-syiro-component-owner="' + component["id"] + '"]'; // Generate a List CSS selector with the owner set to the Component's Id
		return syiro.component.FetchComponentObject(document.querySelector(listSelector)); // Get the Linked Component Object
	}

	// #endregion

	// #region Component or Element ID Generator

	export function IdGen(type : string) : string { // Takes a Component type or Element tagName and returns the new component Id
		var lastUniqueIdOfType : number; // Define lastUniqueIdOfType as a Number

		if (syiro.component.lastUniqueIds[type] == undefined){ // If the lastUniqueId of this type hasn't been defined yet.
			lastUniqueIdOfType = 0; // Set to zero
		}
		else{ // If the lastUniqueId of this type IS defined
			lastUniqueIdOfType = syiro.component.lastUniqueIds[type]; // Set lastUniqueIdOfType to the one set in lastUniqueIds
		}

		var newUniqueIdOfType = lastUniqueIdOfType + 1; // Increment by one
		syiro.component.lastUniqueIds[type] = newUniqueIdOfType; // Update the lastUniqueIds
		return (type + newUniqueIdOfType.toString()); // Append newUniqueIdOfType to the type to create a "unique" ID
	}

	// #endregion

	// #region Is Component Object
	// This function verifies using multiple tests if the variable passed is actualy a Component Object

	export function IsComponentObject(component : any) : boolean {
		return (syiro.utilities.TypeOfThing(component) == "ComponentObject");
	}

	// #endregion

	// #region Update Stored Component's HTMLElement, but only if it exists in the first place.

	export function Update(componentId : string, componentElement : Element){
		if (syiro.data.Read(componentId + "->HTMLElement") !== false){ // If the HTMLElement is defined in for this Component
			syiro.data.Write(componentId + "->HTMLElement", componentElement); // Update the componentElement with what we defined
		}
	}

	// #endregion

	// #region Add Component function - Responsible for adding components to other components or elements

	export function Add(appendOrPrepend : any, parentComponent : any, childComponent : any) : boolean { // Returns boolean if the component adding was successful or not
		if (typeof appendOrPrepend == "boolean"){ // If appendOrPrepend is a boolean
			if (appendOrPrepend){ // If we are appending
				appendOrPrepend = "append"; // Set as "append"
			}
			else{
				appendOrPrepend = "prepend"; // Set as "prepend"
			}
		}

		var parentElement : Element; // Define parentElement as an Element

		if (syiro.utilities.TypeOfThing(parentComponent) == "ComponentObject"){ // If the parentComponent is a Component Object
			parentElement = syiro.component.Fetch(parentComponent); // Get the HTMLElement of the parentComponent
		}
		else{ // If it is an Element
			parentElement = parentComponent; // Define parentElement as actually the parentComponent
			parentComponent = syiro.component.FetchComponentObject(parentElement); // Redefine parentComponent as the fetched Component Object
		}

		// #region Child Component Details

		var childElement : Element = syiro.component.Fetch(childComponent); // Define childElement as any. In reality it is either an HTMLElement HTMLInputElement, an Element, or null

		// #endregion

		var allowAdding : boolean = false; // Define variable to determine if we should allow adding the childComponent to the parentComponent or not. Defaults as false

		if (syiro.utilities.TypeOfThing(childComponent) == "ComponentObject"){ // If the childComponent is an Syiro Component Object
			if ((parentComponent["type"] == "navbar") && (syiro.data.Read(parentComponent["id"] + "->Position") == "top") && ((childComponent["type"] == "button") || (childComponent["type"] == "searchbox"))){ // If the parentComponent is a top Navbar and childComponent is either a button or a searchbar
				allowAdding = true; // Allow adding the childComponent
			}
			else if ((parentComponent["type"] == "list") && (childComponent["type"].indexOf("list") !== -1)){ // If the parentComponent is a List and childComponent is a List or List Item
				parentElement = parentElement.querySelector('div[data-syiro-minor-component="list-content"]'); // Change parentElement to listContent container for append
				allowAdding = true; // Allow adding the childComponent
			}
			else if (typeof childComponent["link"] !== "undefined"){ // If a component "link" key is defined, meaning it is a link
				childElement = syiro.utilities.ElementCreator("a", // Create a link element
					{
						"title" : childComponent["title"], // Set the title as the one specified in the component object
						"href" : childComponent["link"], // Add the link as href
						"content" :  childComponent["title"] // Set the inner tag content as the component title key
					}
				);

				allowAdding = true; // Allow adding the childComponent
			}
			else{ // If it is NOT a Dropdown Button, List, Searchbox, or Link
				childElement = syiro.component.Fetch(childComponent); // Get the HTMLElement of the childComponent
				allowAdding = true; // Allow adding the childComponent
			}
		}
		else if (typeof childComponent.nodeType !== "undefined"){ // If the childComponentType is an (HTML)Element
			childElement = childComponent; // Set the childElement to the childComponent
			allowAdding = true;
		}

		if ((allowAdding) && (parentElement !== null) && (childElement !== null)){ // If we are allowing the adding of the childComponent and both the parentElement and childElement exist in syiro.data.storage or DOM
			if (appendOrPrepend == "prepend"){ // If we are prepending the childElement
				parentElement.insertBefore(childElement, parentElement.firstChild); // Insert before the first component
			}
			else{ // If we are appending the childComponent
				parentElement.appendChild(childElement); // Append the Element
			}
		}

		if (parentComponent["type"] == "list"){ // If the parentComponent is a List
			parentElement = parentElement.parentElement; // Change parentElement to the listContent container parent (the List Element)
		}

		syiro.component.Update(parentComponent["id"], parentElement); // Update the HTMLElement of parentComponent if necessary
		return allowAdding; // Return the updated component object
	}

	// #endregion

	// #region Remove Component function - Responsible for removing components or Elements from their parents

	export function Remove(componentsToRemove : any) {
		var typeOfThing = syiro.utilities.TypeOfThing(componentsToRemove); // Define typeOfThing as the type of componentsToRemove
		var componentList : Array<any>; // Define componentList as an array of Component Objects to remove

		if ((typeOfThing == "ComponentObject") || (typeOfThing == "Element")){ // If the componentsToRemove is a Component Object or Element
			componentList = [componentsToRemove]; // Set componentList to an Array consisting of the single Component Object
		}
		else if (typeOfThing == "Array"){ // If the componentsToRemove is an Array
			componentList = componentsToRemove; // Set componentList to the componentsToRemove
		}

		for (var component of componentList){ // For each Component and Sub-Component in componentList
			var typeOfComponent : string = syiro.utilities.TypeOfThing(component); // Define typeOfComponent
			var componentObject : Object; // Define componentObject as an Object
			var componentElement : Element; // Define componentElement as an Element

			if (typeOfComponent == "ComponentObject"){ // If the individual Component is a Syiro Component Object
				componentObject = component; //  Define componentObject as the Object provided
				componentElement = syiro.component.Fetch(component); // Define componentElement as the fetched Element of the Component
			}
			else if (typeOfComponent == "Element"){ // If the individual Component is an Element
				componentObject = syiro.component.FetchComponentObject(component); // Define componentObject as the Component Object we'll fetch based on the Element
				componentElement = component; // Define componentElement as the Element provided
			}

			if (typeof componentElement !== "undefined"){ // If the Element is defined
				var parentElement : Element = componentElement.parentElement; // Get the componentElement's parentElement
				parentElement.removeChild(componentElement); // Remove this Component from the DOM, if it exists

				if (syiro.data.Read(componentObject["id"]) !== false){ // It there is data regarding individualComponentObject in syiro.data.storage
					syiro.data.Delete(componentObject["id"]); // Delete the Component's data
				}

				if (parentElement.hasAttribute("data-syiro-component-id")){ // If the parentElement has a Component Id
					syiro.component.Update(parentElement.getAttribute("data-syiro-component-id"), parentElement); // Update this "parentElement" Component if necessary
				}
			}
		}
	}

	// #endregion
}
