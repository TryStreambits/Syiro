/*
	This is the module for core Syiro functionality.
*/

/// <reference path="syiro.ts" />
/// <reference path="interfaces.ts" />

module syiro.component {
	export var componentData : Object = {}; // An object that stores generated component(s) / component(s) information

	// #region Defining existing Syiro components

	export function Define(type : string, selector : string) : Object {
		var component : Object = {}; // Create an object called component that stores the component information
		var componentId : string; // Define componentId as the string to hold the Id info
		component["type"] = type; // Define the key "type" as the type we've defined

		var selectedElement : Element = document.querySelector(selector); // Get the first recognized HTMLElement that has this selector.

		if (selectedElement.hasAttribute("data-syiro-component-id") == false){ // If we aren't already trying to define a Component on an Element that is already a Component
			componentId = syiro.generator.IdGen(type); // Generate a unique ID for this component
			selectedElement.setAttribute("data-syiro-component-id", componentId); // Set this component's ID
		}
		else{ // If we are already defining a Component on an Element that is already a Component
			componentId = selectedElement.getAttribute("data-syiro-component-id"); // Get the component Id
		}

		component["id"] = componentId; // Add the component Id to the object that we will be returning to the developer

		if (type == "dropdown"){ // If we are defining a Dropdown Syiro component
			syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.dropdown.Toggle); // Immediately listen to the Dropdown
		}

		return component; // Return the component Object
	}

	// #endregion

	// #region Component CSS Fetcher / Modifier

	export function CSS(component : any, property : string, newValue ?: any){
		var modifiableElement : Element; // Define modifiableElement as the Element we are going to modify
		var returnedValue : any; // Define returnedValue as value we are returning
		var modifiedStyling : any = false; // Define modifiedStyling as a boolean value to indicate whether we modified the Element's styling or not. Defaults to false.

		if (typeof component.hasAttribute == "undefined"){ // If we were provided a Component Object (since an Object doesn't have the hasAttribute function, but an Element does)
			modifiableElement = syiro.component.Fetch(component); // Fetch the Element and assign it to modifiableElement
		}
		else{ // If the component is NOT a Syiro Component Object
			modifiableElement = component; // Treat the component as an Element
		}

		if (modifiableElement !== null){ // If the modifiableElement is not null (a potential result of syiro.component.Fetch if the Element of the Component does not exist)
			// #region Element Styling (Since it isn't an HTMLElement) To Element Styling "Object"

			var currentElementStyling = modifiableElement.getAttribute("style");
			var elementStylingObject = {}; // Define elementStylingObject as an empty Object

			if (currentElementStyling !== null){ // If the modifiableElement has the style attribute
				var currentElementStylingArray = currentElementStyling.split(";"); // Split currentElementStyling into an array where the separator is the semi-colon

				for (var styleKey in currentElementStylingArray){ // For each CSS property / value in the styling
					var cssPropertyValue = currentElementStylingArray[styleKey]; // Define cssPropertyValue as this index in currentElementStylingArray
					if (cssPropertyValue !== ""){ // If the array item value is not empty
						var propertyValueArray = cssPropertyValue.split(":"); // Split the propery / value based on the colon to an array
						elementStylingObject[propertyValueArray[0].trim()] = propertyValueArray[1].trim(); // Cleanup the whitespace in the property and value,add it as a key/val in the elementStylingObject
					}
				}
			}

			// #endregion

			var stylePropertyValue : any = elementStylingObject[property]; // Define stylePropertyValue as the value of the property (if any) in the elementStylingObject

			if (newValue == undefined){ // If we are fetching the current value rather than modifying or removing it
				if (stylePropertyValue !== undefined){ // If the elementStylingObject has the property
					returnedValue = stylePropertyValue; // Define returnedValue as the value of the property
				}
				else{ // If the property we are looking for does not exist
					returnedValue = false; // Define the returnedValue as false
				}
			}
			else if (typeof newValue == "string"){ // If we are updated the value
				elementStylingObject[property] = newValue; // Assign the newValue to the property
				modifiedStyling = true; // Indicate that we've modified the Element's styling
				returnedValue = newValue; // Define returnedValue as the value we are setting
			}
			else{ // If we are removing the value
				if (stylePropertyValue !== undefined){ // If the elementStylingObject has the property
					elementStylingObject[property] = null; // Define the property as null
					modifiedStyling = true; // Indicate that we've modified the Element's styling
				}
			}

			if (modifiedStyling == true){ // If we have modified the styling Object
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
			returnedValue = false; // Set returnedValue to false
		}

		return returnedValue;
	}

	// #endregion

	// #region Fetch - Function for fetching the HTMLElement of a Component object

	export function Fetch(component : Object) : any { // Take a Syiro component object and return an HTMLElement (it's like magic!)
		var componentElement : Element; // The (HTML)Element of the Syiro component we'll be returning

		if (typeof syiro.component.componentData[component["id"]]["HTMLElement"] !== "undefined"){ // If an HTMLElement  is defined, meaning this is a new component that has not been put in the DOM yet
			componentElement = syiro.component.componentData[component["id"]]["HTMLElement"]; // Get the HTMLElement stored in the componentData
		}
		else{ // If the HTMLElement  is NOT defined (meaning the element is could be in the DOM)
			componentElement = document.querySelector('*[data-syiro-component-id="' + component["id"] + '"]'); // Look for the component in the DOM, may return null
		}

		return componentElement;
	}

	// #endregion

	// #region Fetch Component Object based on Element

	export function FetchComponentObject(componentElement : any) : Object {
		if (componentElement.hasAttribute("data-syiro-component")){ // If the componentElement is actually a Component
			return { "id" : componentElement.getAttribute("data-syiro-component-id"), "type" : componentElement.getAttribute("data-syiro-component")};
		}
		else{ // If the componentElement is not actually a Component
			return false; // Return false
		}
	}

	// #endregion

	// #region Element Dimensions and Position Fetching

	export function FetchDimensionsAndPosition(component : any) : Object { // Get the height and width of the Element
		var dimensionsAndPosition : Object = {}; // Define dimensionsAndPosition as an empty Object
		var componentElement : Element; // Define componentElement as an Element

		if (component["type"] !== undefined){ // If the Component provided is a Syiro Component Object
			componentElement = syiro.component.Fetch(component); // Fetch the Component Element
		}
		else{ // If the Component provided is NOT a Syiro Component Object
			componentElement = component; // Set the componentElement to the component (Element) provided
		}

		dimensionsAndPosition["x"] = componentElement.offsetLeft; // Set the dimensionsAndPosition X to the Element's left offset
		dimensionsAndPosition["y"] = componentElement.offsetTop; // Set the dimensionsAndPosition Y to the Element's top offset
		dimensionsAndPosition["height"] = componentElement.offsetHeight; // Set the dimensionsAndPosition height to the Element's height offset
		dimensionsAndPosition["width"] = componentElement.offsetWidth; // Set the dimensionsAndPosition width to the Element's width offset

		return dimensionsAndPosition;
	}

	// #endregion

	// #region Scale Components
	// This function is responsible for scaling particular Components based on screen information

	export function Scale(){
		var userHorizontalSpace : number = window.screen.width; // Define userHorizontalSpace as the space the user has, in pixels, horizontally.
		var userVerticalSpace : number = window.screen.height; // Define userVerticalSpace as the space the user has, in pixels, vertically.

		// #region Scaling Video Players

		var videoPlayers = document.querySelectorAll('div[data-syiro-component="video-player"]'); // Get all Video Player Components on the page

		if (videoPlayers.length !== 0){ // If there are Video Player Components on the page
			for (var videoPlayerIndex in videoPlayers){ // For each Video Player Component in videoPlayers
				var videoPlayerComponentElement : any = videoPlayers.item(videoPlayerIndex); // Fetch the Video Player Component Element
				var videoPlayerComponentObject = syiro.component.FetchComponentObject(videoPlayerComponentElement); // Fetch the Component Object of this Video Player Component Element

				var videoComponentId = videoPlayerComponentObject["id"]; // Get the Component Id of the Video Player
				var componentInitialHeight : string = syiro.component.componentData[videoComponentId]["initialDimensions"][0]; // Get the initial height (of the first / original state) of the Video Player Component
				var componentInitialWidth : string = syiro.component.componentData[videoComponentId]["initialDimensions"][1]; // Get the initial width (of the first / original state) of the Video Player Component
				var componentScalingState : any = syiro.component.componentData[videoComponentId]["initialDimensions"][2]; // Get the current scaling state (original or not), if any, of the Video Player Component

				if (componentScalingState !== "original"){ // If the current state is not defined or has been scaled before (and we are resetting the scaling)
					syiro.component.componentData[videoComponentId]["initialDimensions"][2] = "original"; // Set to "original" state
					videoPlayerComponentElement.setAttribute("height", componentInitialHeight.toString() + "px"); // Set the height to the initial height defined
					videoPlayerComponentElement.setAttribute("width", componentInitialWidth.toString() + "px"); // Set the width to the initial width defined
				}
				else{ // If the componentScalingState is "original" and we need to now scale the component
					syiro.component.componentData[videoComponentId]["initialDimensions"][2] = "scaled"; // Set to "original" state
					var videoWidth : number = videoPlayerComponentElement.parentElement.clientWidth; // Set to width of parent Element

					if (videoWidth > window.screen.width){ // If the video's width is greater than the screen width
						videoWidth = window.screen.width; // Set the videoWidth to screen width
					}

					var videoHeight : number = Number((videoWidth / 1.77).toFixed()); // Proper Component Height to ensure 16:9 aspect ratio
					videoPlayerComponentElement.setAttribute("height", videoHeight.toString() + "px"); // Set the height to the initial height defined
					videoPlayerComponentElement.setAttribute("width", videoWidth.toString() + "px"); // Set the width to the initial width defined
				}
			}
		}

		// #endregion
	}

	// #endregion

	// #region Update Stored Component's HTMLElement, but only if it exists in the first place.

	export function Update(componentId : string, componentElement : Element){
		if (syiro.component.componentData[componentId]["HTMLElement"] !== undefined){ // If the HTMLElement is defined in the componentData (by the id of the component being in the componentData)
			syiro.component.componentData[componentId]["HTMLElement"] = componentElement; // Update with the componentElement we defined
		}
	}

	// #endregion

	// #region Add Component function - Responsible for adding components to other components or elements

	export function Add(append : boolean, parentComponent : Object, childComponent : any) : boolean { // Returns boolean if the component adding was successful or not
		var parentElement : any = syiro.component.Fetch(parentComponent); // Get the HTMLElement of the parentComponent

		// #region Child Component Details

		var childComponentId : string; // Define childComponentId as the childComponents potential ID (may not exist IF childComponentType is (HTML)Element)
		var childComponentType : string = (typeof childComponent).toLowerCase(); // Set childComponentType to the typeof childComponent and lower-case it to ensure it is consistent across browsers
		var childElement : any = syiro.component.Fetch(childComponent); // Define childElement as any. In reality it is either an HTMLElement HTMLInputElement, an Element, or null

		// #endregion

		var allowAdding : boolean = false; // Define variable to determine if we should allow adding the childComponent to the parentComponent or not. Defaults as false

		if (childComponentType == "object"){ // If the childComponent is an Object
			childComponentId = childComponent["id"]; // Get the component's ID

			if (parentComponent["type"] == "header" && ((childComponent["type"] == "dropdown") || (childComponent["type"] == "searchbox"))){ // If the parentComponent is a header and childComponent is either a dropdown or a searchbar
				childElement = syiro.component.Fetch(childComponent); // Get the HTMLElement of the childComponent
				allowAdding = true; // Allow adding the childComponent
			}
			else if (childComponent["type"] == "list-item"){ // If the childComponent is a ListItem
				if (parentComponent["type"] == "dropdown"){ // If the parentComponent is a Dropdown
					parentComponent = syiro.dropdown.FetchLinkedListComponentObject(parentComponent); // Change parentComponent type to the one we get from FetchLinkedListComponentObject
					parentElement = syiro.component.Fetch(parentComponent); // Change parentElement to be the Dropdown's linked List Component Element
				}

				if (parentComponent["type"] == "list"){ // If the parentComponent is a List
					allowAdding = true; // Allow adding the childComponent
				}
			}
			else if (childComponent["link"] !== undefined){ // If a component "link" key is defined, meaning it is a link
				childElement = syiro.generator.ElementCreator("a", // Create a link element
					{
						"title" : childComponent["title"], // Set the title as the one specified in the component object
						"href" : childComponent["link"], // Add the link as href
						"content" :  childComponent["title"] // Set the inner tag content as the component title key
					}
				);

				allowAdding = true; // Allow adding the childComponent
			}
			else{ // If it is NOT a Dropdown, Searchbox, or Link
				childElement = syiro.component.Fetch(childComponent); // Get the HTMLElement of the childComponent
				allowAdding = true; // Allow adding the childComponent
			}
		}
		else if (childComponentType.indexOf("element") > -1){ // If the childComponentType is an (HTML)Element
			childElement = childComponent; // Set the childElement to the childComponent
			allowAdding = true;
		}

		if ((allowAdding == true) && (parentElement !== null) && (childElement !== null)){ // If we are allowing the adding of the childComponent and both the parentElement and childElement exist in componentData or DOM
			if (append == false){ // If we are prepending the childElement
				parentElement.insertBefore(childElement, parentElement.firstChild); // Insert before the first component
			}
			else{ // If we are appending the childComponent
				parentElement.appendChild(childElement); // Append the Element
			}
		}
		else{ // If allowAdding is either set to false, parentElement == null OR childElement == null
			allowAdding = false; // Reset allowAdding to false in the event it was set to true
		}

		syiro.component.Update(parentComponent["id"], parentElement); // Update the storedComponent HTMLElement if necessary

		return allowAdding; // Return the updated component object
	}

	// #endregion

	// #region Remove Component function - Responsible for removing components or Elements from their parents

	export function Remove(componentsToRemove : any) : boolean {
		var allowRemoval : boolean = false; // Define allowRemoval as a boolean value of whether or not we will allow Component remove. Defaults to false.
		var componentList : Array<Object>; // Define componentList as an array of Component Objects to remove

		if (componentsToRemove["id"] !== undefined){ // If the componentsToRemove actually has an "id" key / value, meaning it is a single Component Object
			allowRemoval = true; // Set allowRemoval to true
			componentList = [componentsToRemove]; // Set componentList to an Array consisting of the single Component Object
		}
		else if ((typeof componentsToRemove == "object") && (componentsToRemove.length > 0)){ // If the componentsToRemove is an object (a.k.a array) and has a length (which an array does)
			allowRemoval = true; // Set allowRemoval to true
			componentList = componentsToRemove; // Set componentList to the componentsToRemove
		}

		if (allowRemoval == true){ // If we are allowing the removal of Components
			for (var individualComponentIndex in componentList){ // For each Component and Sub-Component in componentList
				var individualComponent : Object = componentList[individualComponentIndex]; // Get this specific Object
				var individualComponentElement : Element = syiro.component.Fetch(individualComponent); // Fetch the Syiro Component Element

				if (individualComponentElement !== null){ // If the Component Element returned via Fetch exists in the DOM or componentData
					if (syiro.component.componentData[individualComponent["id"]]["HTMLElement"] == undefined){ // If the Element does exist in DOM, rather in the componentData
						var parentElement : Element = individualComponentElement.parentElement; // Get the individualComponentElement's parentElement
						parentElement.removeChild(individualComponentElement); // Remove this Component from the DOM
					}
					else{ // If the Component is actually stored in syiro.component.componentData
						delete syiro.component.componentData[individualComponent["id"]]["HTMLElement"]; // Remove the component from the componentData
					}
				}
			}
		}

		return allowRemoval; // Return the boolean value of IF we allowed Component removal or not
	}

	// #endregion
}
