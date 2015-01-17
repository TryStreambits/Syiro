/*
	This is the module for core Syiro functionality.
*/

/// <reference path="syiro.ts" />
/// <reference path="interfaces.ts" />

module syiro.component {
	export var componentData : Object = {}; // An object that stores generated component(s) / component(s) information

	// #region Meta function for defining existing Syiro components or Elements as Components

	export var Define : Function = syiro.component.FetchComponentObject;

	// #endregion

	// #region Component CSS Fetcher / Modifier

	export function CSS(component : any, property : string, newValue ?: any){
		var modifiableElement : Element; // Define modifiableElement as the Element we are going to modify
		var returnedValue : any; // Define returnedValue as value we are returning
		var modifiedStyling : any = false; // Define modifiedStyling as a boolean value to indicate whether we modified the Element's styling or not. Defaults to false.

		if (syiro.component.IsComponentObject(component)){ // If we were provided a Component Object
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

	// #region Fetch or Generate Component Object based on arguments provided

	export function FetchComponentObject( ...args : any[]) : Object {
		var componentElement : Element; // Define componentElement as either the Element provided (one arg) or based on the selector provided (two args)
		var previouslyDefined : boolean = false; // Define previouslyDefined as a boolean that defaults to true. We use this to determine whether to immediately add event listeners to a Dropdown

		if (arguments.length == 1){ // If only one argument is defined
			if (typeof arguments[0] == "string"){ // If the first argument defined is a string (selector)
				componentElement = document.querySelector(arguments[1]); // Define componentElement as the returned Element from querySelector
			}
			else{ // If the first argument is not a string
				componentElement = arguments[0]; // Define componentElement as the first argument
			}
		}
		else if (arguments.length == 2){ // If two arguments are defined
			if (typeof arguments[1] == "string"){ // If the second argument defined in a string (selector)
				componentElement = document.querySelector(arguments[1]); // Define componentElement as the returned Element from querySelector
			}
		}

		if (componentElement !== null){ // If the componentElement is not null (returned from querySelector)
			if (componentElement.hasAttribute("data-syiro-component-id") == false){ // If the componentElement is not actually a Component, generate a Component Object and assign Component data to the Element
				var componentId : string; // Define componentId as the Id of the Component
				var componentType : string; // Define componentType as the type of the Component

				if ((arguments.length == 2) && (typeof arguments[0] == "string")){ // If the first argument is a string and the args length is two
					componentId = syiro.generator.IdGen(arguments[0]); // Define componentId as Id generated based on the type provided
					componentType = arguments[0]; // Define the type of the component as the type passed as the first arg
				}
				else if (arguments.length == 1){
					componentId = syiro.generator.IdGen(componentElement.tagName.toLowerCase()); // Generate a unique id for this component based on the component Element's tagName
					componentType = componentElement.tagName.toLowerCase(); // Set the component "type" simple as the lowercased tagName
				}

				componentElement.setAttribute("data-syiro-component-id", componentId); // Set this component's Id
				componentElement.setAttribute("data-syiro-component", componentType); // Set the component's type

				syiro.component.componentData[componentId] = {}; // Add an empty object for the Component in the componentData
			}
			else{ // If the componentElement has attributes, meaning it has already been defined before
				previouslyDefined = true; // Set previouslyDefined to true
			}

			if ((componentElement.getAttribute("data-syiro-component") == "dropdown") && (previouslyDefined == false)){ // If we are defining a Syiro Dropdown component for the first time
				syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.dropdown.Toggle); // Immediately listen to the Dropdown
			}

			return { "id" : componentElement.getAttribute("data-syiro-component-id"), "type" : componentElement.getAttribute("data-syiro-component")}; // Define component as the Object with id and type based on information from componentElement
		}
		else{ // If the componentElement is null
			return false;
		}
	}

	// #endregion

	// #region Element Dimensions and Position Fetching

	export function FetchDimensionsAndPosition(component : any) : Object { // Get the height and width of the Element
		var dimensionsAndPosition : Object = {}; // Define dimensionsAndPosition as an empty Object
		var componentElement : Element; // Define componentElement as an Element

		if (syiro.component.IsComponentObject(component)){ // If the Component provided is a Syiro Component Object
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

	// #region Function for fetching the Linked List component of the Dropdown.

	export function FetchLinkedListComponentObject(component) : Object {
		var listSelector : string = 'div[data-syiro-component="list"][data-syiro-component-owner="' + component["id"] + '"]'; // Generate a List CSS selector with the owner set to the Dropdown Component's Id
		return syiro.component.FetchComponentObject(document.querySelector(listSelector)); // Get the Dropdown's Linked Component Object
	}

	// #endregion

	// #region s Component Object
	// This function verifies using multiple tests if the variable passed is actualy a Component Object

	export function IsComponentObject(variable : any) : boolean {
		var isComponentObject : boolean = false; // Define isComponentObject as a boolean defaulting to false

		if ((typeof variable["id"] !== "undefined") && (typeof variable["type"] !== "undefined") && (typeof variable.nodeType == "undefined")){ // If the variable provided has both an id value and a type value both does not have a nodeType (is not an Element)
			isComponentObject = true; // This variable is a Component Object
		}

		return isComponentObject;
	}

	// #endregion

	// #region Scale Components
	// This function is responsible for scaling Components based on screen information, their initialDimensions data (if any) and scaling of any inner Components or Elements

	export function Scale(component : Object, data ?: any){
		// #region Variable Setup
		var componentId = component["id"]; // Get the Component Id of the Component
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the componentElement
		var data : any = arguments[1]; // Define data as any second argument passed to us

		var userHorizontalSpace : number = window.screen.width; // Define userHorizontalSpace as the space the user has, in pixels, horizontally.
		var parentHeight : number = componentElement.parentElement.clientHeight; // Set the parentHeight to the parent Element's clientHeight of the Component Element
		var parentWidth : number = componentElement.parentElement.clientWidth; // Set the parentWidth to the parent Element's clientWidth of the Component Element

		// #endregion

		var scalingData : Object; // Define scalingData as an Object passed with Scaling Data

		if (typeof data !== "undefined"){ // If the optional data passed is data for scaling
			scalingData = data; // Set the scalingData equal to the data passed
		}

		// #region Scaling Data Definition

		var storedScalingState : string; // Define scalingState as the stored scaling state

		if (typeof scalingData !== "undefined"){ // If scalingData has been defined (passed as second arg)
			syiro.component.componentData[componentId]["scaling"] = scalingData; // Define the scaling data in the componentData for this particular Component as the scalingData passed along
		}

		if (typeof syiro.component.componentData[componentId]["scaling"]["state"] == "undefined"){ // If the scaling state of this Component is not defined (like an Element that has never been scaled before) or we are forcing scaling
			storedScalingState = "initial"; // Default to initial so we'll properly scale
		}
		else{ // If scaling state of this Component is defined
			storedScalingState = syiro.component.componentData[componentId]["scaling"]["state"]; // Define scalingState as the current scaling state stored in the componentData
		}

		// #endregion

		// #region Initial Dimension Checking

		var initialDimensions : Array<number> = []; // Define initialDimensions as an array of numbers

		if (typeof syiro.component.componentData[componentId]["scaling"]["initialDimensions"] !== "undefined"){ // If the initialDimensions in the scaling section of componentData for this Component is NOT undefined
			initialDimensions = syiro.component.componentData[componentId]["scaling"]["initialDimensions"]; // Define initialDimensions as the dimensions in the scaling section of the componentData for this Component
		}

		if (initialDimensions.length !== 2){ // If initialDimensions is not a length of two <height, width>
			initialDimensions.push(componentElement.clientHeight); // Append the clientHeight as the second item (or first, depending on if there was any length to begin with)

			if (initialDimensions.length == 1){ // If, after pushing the clientHeight, the initialDimensions is 1 (only height)
				initialDimensions.push(componentElement.clientWidth); // Append the clientWidth as the second item
			}
			else{ // If the initialDimensions.length is now two
				initialDimensions.reverse(); // Reverse the initialDimensions to <height, width>
			}

			syiro.component.componentData[componentId]["scaling"]["initialDimensions"] = initialDimensions; // Update the componentData initialDimensions for this Component
		}

		var updatedComponentHeight : number = initialDimensions[0]; // Define the updatedComponentHeight as the initial height defined
		var updatedComponentWidth : number =  initialDimensions[1]; // Define the updatedComponentWidth as the initial width defined

		// #endregion

		// #region Ratio and Fill Data Parsing

		var ratios : any = null; // Define ratios an array of numbers <height, width> or NULL
		var fill : any = null; // Define ratios as an array of numbers <height, width> or NULL

		if (typeof syiro.component.componentData[componentId]["scaling"]["ratios"] !== "undefined"){ // If ratios are defined in the scaling data
			ratios = syiro.component.componentData[componentId]["scaling"]["ratios"]; // Define ratios as data already defined

			if (ratios.length == 1){ // If only one dimension is defined
				ratios.push(1.0); // Push 1.0 as the height ratio. Currently it is the second argument instead of first.
				ratios.reverse(); // Reverse the items so it is once again <height, width>
			}
		}

		if (typeof syiro.component.componentData[componentId]["scaling"]["fill"] !== "undefined"){ // If fill data is defined in scaling data
			fill = syiro.component.componentData[componentId]["scaling"]["fill"]; // Define fill as data already defined

			if (fill.length == 1){ // If only one dimension is defined
				fill.push(1.0) // Push 1.0 as the height fill. Currently it is the second argument instead of first.
				fill.reverse(); // Reverse the items so it is once again <height, width>
			}
		}

		// #endregion

		// #region Component Scaling

		if ((storedScalingState !== "scaled") && ((ratios !== null) || (fill !== null))){ // If we have not "disabled" scaling by not providing ratio or fill data and we need to scale the Component
			if (ratios !== null){ // If ratios is defined (not of type null)
				if (ratios[0] !== 0){ // If the height is supposed to scale
					updatedComponentHeight = (initialDimensions[0] * ratios[0]); // Updated componentHeight is the initialDimensions height * height ratio
				}
				else{ // If the height is not supposed to scale
					updatedComponentHeight = initialDimensions[0]; // Set the updatedComponentHeight to the initialDimensions height
				}

				if (ratios[1] !== 0){ // If the width is supposed to scale
					updatedComponentWidth = (initialDimensions[0] * (ratios[1] / ratios[0])); // Updated componentWidth is the initialDimensions height * heightToWidthRatio (ratios[1] / ratios[0])
				}
				else{ // If the width is not supposed to scale
					updatedComponentWidth = initialDimensions[1]; // Set the width to the initialDimensions width
				}
			}
			else if (fill !== null){ // If fill is defined (not of type null)
				if (fill[0] !== 0){ // If the height is supposed to scale with the parent
					updatedComponentHeight = (parentHeight * fill[0]); // Define updatedComponentHeight as the height of the parent our fill percentage
				}
				else{ // If the height of the Component is supposed to remain the same
					updatedComponentHeight = initialDimensions[0]; // Define updatedComponentHeight as the initialDimensions height
				}

				if (fill[1] !== 0){ // If the width is supposed to scale with the parent
					updatedComponentWidth = (parentWidth * fill[1]); // Define updatedComponentWidth as the width of the parent times our fill percentage
				}
				else{ // If the height of the Component is supposed to remain the same
					updatedComponentWidth = initialDimensions[1]; // Define updatedComponentWidth as the initialDimensions width
				}
			}

			// #endregion
		}

		// #region Component Overflow Prevention

		if (updatedComponentWidth > userHorizontalSpace){ // If the width of the updatedComponentWidth is greater than the horizontal space available to the user
			updatedComponentWidth = userHorizontalSpace; // Initially the updatedComponentWidth to horizontal space available to the user

			if ((ratios !== null) && (ratios[0] !== 0)){ // If we can scale the height of the Component as necessary
				updatedComponentHeight = (updatedComponentWidth * (initialDimensions[0] / initialDimensions[1])); // Define the updatedComponentHeight as the width times the height-to-width pixel ratio
			}
		}

		// #endregion

		syiro.component.CSS(componentElement, "height", updatedComponentHeight.toString() + "px"); // Set the height to the updated height data
		syiro.component.CSS(componentElement, "width", updatedComponentWidth.toString() + "px"); // Set the width to the updated width data

		// #region Initial Ratio / Fill Dimension Setting
		// This section is responsible for ensuring that Components that are being initialized, that have fill or ratio properties, remember the changed updatedComponent dimensions

		if (storedScalingState == "initial"){ // If this Component is in an initial state and fill
			syiro.component.componentData[componentId]["scaling"]["initialDimensions"] = [updatedComponentHeight, updatedComponentWidth];
		}

		// #region Component Child Scaling

		if (typeof syiro.component.componentData[component["id"]]["scaling"]["children"] !== "undefined"){ // If we are scaling child Components or Elements

			// #region Children Component Data Parsing
			// Parses any component data like scaling information passed regarding Children of the Component, sets to own componentData and changes "children" key / val to point to an array instead

			if (typeof syiro.component.componentData[component["id"]]["scaling"]["children"].pop == "undefined"){ // If children key / val is an Object rather than an Array (Array would have .pop)
				var childComponentsArray : Array<Object> = []; // Define childComponents as an array of Objects

				for (var childSelector in syiro.component.componentData[component["id"]]["scaling"]["children"]){ // For each childSelector in the children section of scaling
					var childElement : Element = componentElement.querySelector(childSelector); // Get the childElement from componentElement based on the querySelector of the componentElement
					var childComponent : Object = syiro.component.FetchComponentObject(childElement); // Fetch the Component Object (or generate one if it doesn't exist already)

					if (typeof syiro.component.componentData[childComponent["id"]] == "undefined"){ // If the childComponent has no componentData
						syiro.component.componentData[childComponent["id"]] = {}; // Create an empty Object for the childComponent in componentData
					}

					syiro.component.componentData[childComponent["id"]]["scaling"] = syiro.component.componentData[component["id"]]["scaling"]["children"][childSelector]["scaling"]; // Define the scaling data of the childComponent to be equal to the scaling data passed for the parent Component
					childComponentsArray.push(childComponent); // Push the childComponent to the childComponentsArray Array of Objects
					delete syiro.component.componentData[component["id"]]["scaling"]["children"][childSelector]; // Delete the childSelector from the "children"
				}
				syiro.component.componentData[component["id"]]["scaling"]["children"] = childComponentsArray; // Set the children to now be an Array<Object>
			}

			// #endregion

			for (var childComponentIndex = 0; childComponentIndex < syiro.component.componentData[component["id"]]["scaling"]["children"].length; childComponentIndex++){ // For each childComponent in the Children scaling Object
				var childComponentObject : Object = syiro.component.componentData[component["id"]]["scaling"]["children"][childComponentIndex]; // Define childComponentObject as the index of the Object from key / val children
				syiro.component.Scale(childComponentObject); // Scale the child Component
			}
		}

		// #endregion

		// #region Update Scaling State

		var updatedScalingState : string;

		if (storedScalingState !== "original"){ // If the current scaling state implies we needed to scale
			updatedScalingState = "original"; // Set to "original" state
		}
		else{ // If the currently stored state implies that the Component was in an "original" state and we needed to scale it
			updatedScalingState = "scaled"; // Set to "scaled" state
		}

		syiro.component.componentData[componentId]["scaling"]["state"] = updatedScalingState; // Set to the updated scaling state

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

		if (syiro.component.IsComponentObject(childComponent)){ // If the childComponent is an Syiro Component Object
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
		var componentList : Array<any>; // Define componentList as an array of Component Objects to remove

		if (componentsToRemove["id"] !== undefined){ // If the componentsToRemove actually has an "id" key / value, meaning it is a single Component Object
			allowRemoval = true; // Set allowRemoval to true
			componentList = [componentsToRemove]; // Set componentList to an Array consisting of the single Component Object
		}
		else if ((typeof componentsToRemove == "object") && (componentsToRemove.length > 0)){ // If the componentsToRemove is an object (a.k.a array) and has a length (which an array does)
			allowRemoval = true; // Set allowRemoval to true
			componentList = componentsToRemove; // Set componentList to the componentsToRemove
		}

		if (allowRemoval == true){ // If we are allowing the removal of Components
			for (var individualComponentIndex = 0; individualComponentIndex < componentList.length; individualComponentIndex++){ // For each Component and Sub-Component in componentList
				var individualComponentObject : Object; // Define individualComponentObject as an Object, which will be the Component Object if it is needed
				var individualComponentElement : Element; // Define individualComponentElement as an Element

				if (syiro.component.IsComponentObject(componentList[individualComponentIndex])){ // If the individual Component is a Syiro Component Object
					individualComponentObject = componentList[individualComponentIndex]; //  Define individualComponentObject as the Object provided
					individualComponentElement = syiro.component.Fetch(individualComponentObject); // Define individualComponentElement as the fetched Element of the Component
				}
				else{ // If the individual Component is NOT an Object (theoretically an Element)
					individualComponentObject = syiro.component.FetchComponentObject(componentList[individualComponentIndex]); // Define individualComponentObject as the Component Object we'll fetch for the Element
					individualComponentElement = componentList[individualComponentIndex]; // Define individualComponentElement as the Element provided
				}

				var parentElement : Element = individualComponentElement.parentElement; // Get the individualComponentElement's parentElement
				parentElement.removeChild(individualComponentElement); // Remove this Component from the DOM, if it exists

				if (typeof syiro.component.componentData[individualComponentObject["id"]] !== "undefined"){ // It there is componentData regarding individualComponentObject
					delete syiro.component.componentData[individualComponentObject["id"]]; // Delete the Component's data
				}
			}
		}

		return allowRemoval; // Return the boolean value of IF we allowed Component removal or not
	}

	// #endregion
}