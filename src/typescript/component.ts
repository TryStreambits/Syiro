/*
	This is the module for core Rocket functionality.
*/

/// <reference path="rocket.ts" />
/// <reference path="interfaces.ts" />

module rocket.component {
	export var listenerStrings : Object = { // Set rocket.component.listenerStrings as an Object containing commonly used event lister combinations
		"down" : ["mousedown", "touchstart", "MSPointerDown"],
		"up" : ["mouseup", "touchend", "MSPointerUp"],
		"press" : ["click", "touchend", "MSPointerUp"]
	};

	export var storedComponents : Object = {}; // An object that stores generated component(s) / component(s) information

	// #region Defining existing Rocket components

	export function Define(type : string, selector : string) : Object {
		var component : Object = {}; // Create an object called component that stores the component information
		component["type"] = type; // Define the key "type" as the type we've defined

		var componentID : string = rocket.generator.IdGen(type); // Generate a unique ID for this component

		var selectedElement : Element = document.querySelector(selector); // Get the first recognized HTMLElement that has this selector.
		selectedElement.setAttribute("data-rocket-component-id", componentID); // Set this component's ID

		component["id"] = componentID; // Add the component ID to the object that we will be returning to the developer

		if (type == "dropdown"){ // If we are defining a Dropdown Rocket component
			rocket.component.AddListeners(rocket.component.listenerStrings["press"], component, rocket.dropdown.Toggle); // Immediately listen to the Dropdown
		}

		return component; // Return the component Object
	}

	// #endregion

	// #region Component Animation Function

	export function Animate(component : Object, animation : string, postAnimationFunction ?: Function){ // This function animates a particular Component and calls a post-animation function if applicable
		var componentElement : Element = rocket.component.Fetch(component); // Get the Rocket Component Element

		if (componentElement !== null){ // If the componentElement exists in the DOM
			var elementTimeoutId = window.setTimeout( // Create a timeout that calls our handler function after 250 (after the animation is "played")
				function(){
					var component : Object = arguments[0]; // Get the component that was passed to this function as a bound argument
					var componentElement : Element = rocket.component.Fetch(component); // Get the Rocket Component Element based on the component Object we passed
					var postAnimationFunction : Function = arguments[1]; // Get the postAnimationFunction (if applicable)

					var timeoutId = componentElement.getAttribute("data-rocket-animationTimeout-id"); // Get the animationTimeout ID
					componentElement.removeAttribute("data-rocket-animationTimeout-id"); // Remove the animationTimeout ID attribute
					window.clearTimeout(Number(timeoutId)); // Convert the ID from string to Int and clear the timeout

					postAnimationFunction(component); // Call the postAnimationFunction (which we pass the Rocket Component Object)
				}.bind(rocket, component, postAnimationFunction) // Attach the Rocket Component Object and postAnimationFunction
			,250);

			componentElement.setAttribute("data-rocket-animationTimeout-id", elementTimeoutId.toString()); // Set the animationTimeout ID to the string form of the timeout ID

			if (component["type"] == "dropdown"){ // If the component is a Dropdown
				var tempElement = componentElement; // Define tempElement as the componentElement
				componentElement = tempElement.querySelector('div[data-rocket-component="list"]'); // Change the Element from Dropdown to the Dropdown inner List for the animation
			}
			else if ((component["type"] == "button") && (componentElement.getAttribute("data-rocket-component-type") == "toggle")){ // If we are animating a toggle button
				var tempElement = componentElement; // Define tempElement as the componentElement
				componentElement = tempElement.querySelector('div[data-rocket-minor-component="buttonToggle"]'); // Get the inner button toggle
			}

			componentElement.setAttribute("class", animation); // Add the animation
		}
	}

	// #endregion

	// #region Component CSS Fetcher / Modifier

	export function CSS(component : any, property : string, newValue ?: any){
		var modifiableElement : Element; // Define modifiableElement as the Element we are going to modify
		var returnedValue : any; // Define returnedValue as value we are returning
		var modifiedStyling : any = false; // Define modifiedStyling as a boolean value to indicate whether we modified the Element's styling or not. Defaults to false.

		if (component["type"] !== undefined){ // If we were provided a Component Object
			modifiableElement = rocket.component.Fetch(component); // Fetch the Element and assign it to modifiableElement
		}
		else{ // If the component is NOT a Rocket Component Object
			modifiableElement = component; // Treat the component as an Element
		}

		if (modifiableElement !== null){ // If the modifiableElement is not null (a potential result of rocket.component.Fetch if the Element of the Component does not exist)
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

	export function Fetch(component : Object) : any { // Take a Rocket component object and return an HTMLElement (it's like magic!)
		var componentElement : Element; // The (HTML)Element of the Rocket component we'll be returning

		if (rocket.component.storedComponents[component["id"]] !== undefined){ // If an HTMLElement  is defined, meaning this is a new component that has not been put in the DOM yet
			componentElement = rocket.component.storedComponents[component["id"]]; // Get the HTMLElement stored in the storedComponents
		}
		else{ // If the HTMLElement  is NOT defined (meaning the element is could be in the DOM)
			componentElement = document.querySelector('*[data-rocket-component-id="' + component["id"] + '"]'); // Look for the component in the DOM, may return null
		}

		return componentElement;
	}

	// #endregion

	// #region Fetch Component Object based on Element

	export function FetchComponentObject(componentElement : any) : Object {
		if (componentElement.hasAttribute("data-rocket-component")){ // If the componentElement is actually a Component
			return { "id" : componentElement.getAttribute("data-rocket-component-id"), "type" : componentElement.getAttribute("data-rocket-component")};
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

		if (component["type"] !== undefined){ // If the Component provided is a Rocket Component Object
			componentElement = rocket.component.Fetch(component); // Fetch the Component Element
		}
		else{ // If the Component provided is NOT a Rocket Component Object
			componentElement = component; // Set the componentElement to the component (Element) provided
		}

		dimensionsAndPosition["x"] = componentElement.offsetLeft; // Set the dimensionsAndPosition X to the Element's left offset
		dimensionsAndPosition["y"] = componentElement.offsetTop; // Set the dimensionsAndPosition Y to the Element's top offset
		dimensionsAndPosition["height"] = componentElement.offsetHeight; // Set the dimensionsAndPosition height to the Element's height offset
		dimensionsAndPosition["width"] = componentElement.offsetWidth; // Set the dimensionsAndPosition width to the Element's width offset

		return dimensionsAndPosition;
	}

	// #endregion

	// #region Update Stored Component's HTMLElement, but only if it exists in the first place.

	export function Update(componentId : string, componentElement : Element){
		if (rocket.component.storedComponents[componentId] !== undefined){ // If the HTMLElement is defined in the storedComponents (by the id of the component being in the storedComponents)
			rocket.component.storedComponents[componentId] = componentElement; // Update with the componentElement we defined
		}
	}

	// #endregion

	// #region Component Add Listener Function

	export function AddListeners(... args : any[]) : boolean { // Takes (optional) space-separated listeners, Component Object or a generic Element, and the handler function.
		var allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)
		var listeners : any; // Define listeners as a string
		var component : Object; // Define Component as a Component Object
		var listenerCallback : Function; // Default to having the listenerCallback be the handler we are passed.

		if ((args.length == 2) || (args.length == 3)){ // If an appropriate amount of arguments are provided
			if (args.length == 2){ // If two arguments are passed to the AddListeners function
				component = args[0]; // Component is the first argument
				listenerCallback = args[1]; // Handler is the second argument

				if (component["type"] !== "searchbox"){ // If we are adding listeners to a Component that is NOT a Searchbox (which uses a unique listener)
					listeners = rocket.component.listenerStrings["press"]; // Use click / touch related events
				}
				else{ // If the Component IS a Searchbox
					listeners = ["keyup"]; // Use the keyup listener
				}
			}
			else{ // If the arguments list is 3, meaning listeners, a Component Object, and a Handler are provided
				listeners = args[0]; // Set listeners to the first argument
				component = args[1]; // Set component to the second argument
				listenerCallback = args[2]; // Set the handler to the third argument
			}

			var componentElement : any = rocket.component.Fetch(component); // Get the Component Element

			if (componentElement !== null){ // If the componentElement exists in storedComponents or DOM
				if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
					if (componentElement.querySelector("div") !== null){ // If there is a div defined in the List Item, meaning there is a control within the list item
						allowListening = false; // Set allowListening to false. We shouldn't allow the entire List Item to listen to the same events as the inner control.
					}
				}

				if (allowListening == true){ // If allowListening is TRUE
					if ((typeof listeners).toLowerCase() == "string"){ // If the listeners is an array / object
						listeners = listeners.trim().split(" "); // Trim the spaces from the beginning and end then split each listener into an array item
					}

					listeners.forEach( // For each listener
						function(individualListener : string){
							componentElement.addEventListener(individualListener, // Attach an event listener to the component
								function(){
									var component : Object = arguments[0]; // Set the Rocket Component Object to the first argument passed
									var listenerCallback : Function = arguments[1]; // Set the Callback to the second argument passed
									var componentElement : any = rocket.component.Fetch(component); // Set the componentElement to the component Element we fetched
									var passableValue : any = null; // Set passableValue to any type, defaults to null

									if ((component["type"] == "button") && (componentElement.getAttribute("data-rocket-component-type") == "toggle")){ // If it is a toggle button
										var animationString : string;

										if (componentElement.hasAttribute("data-rocket-component-status") == false){ // If the button is NOT active (has no status)
											animationString = "toggle-forward-animation"; // Animate forward the toggle
											passableValue = true; // Set the passable value to TRUE since that is the new status of the toggleButton
										}
										else{ // If the button is active and we are setting it as inactive
											animationString = "toggle-backward-animation"; // Animate backward the toggle
											passableValue = false; // Set the passable value to FALSE since that is the new status of the toggleButton
										}

										rocket.component.Animate(component, animationString,
											function(component : Object){ // Post-Animation Function
												var buttonElement : Element = rocket.component.Fetch(component); // Get the buttonElement based on the component Object

												if (buttonElement.hasAttribute("data-rocket-component-status") == false){ // If the status is not "true" / active
													buttonElement.setAttribute("data-rocket-component-status", "true"); // Set to true
												}
												else{ // If the status IS true
													buttonElement.removeAttribute("data-rocket-component-status"); // Remove the buttonElement component status
												}
											}
										);
									}
									else if (component["type"] == "searchbox"){ // If the component is a Rocket Searchbox
										passableValue = componentElement.value; // Get the current value of the input
									}

									listenerCallback.call(rocket, component, passableValue); // Call the listenerCallback and pass along the passableValue and the component Object
								}.bind(rocket, component, listenerCallback) // Bind to Rocket, pass the component and listenerCallback
							);
						}
					);
				}
			}
			else{ // If the componentElement does NOT exist
				allowListening = false; // Since componentElement does not exist in storedComponents or in the DOM, set to false
			}
		}
		else{ // If the arguments length is NOT 2 or 3, meaning either too few or too many arguments were provided
			allowListening = false;
		}

		return allowListening; // Return whether we allowed listening to the component
	}

	// #endregion

	// #region Component Remove Event Listener

	export function RemoveListeners(component : Object) : boolean {
		var successfulRemoval : boolean = false; // Set successfulRemove as a boolean, defaulting to false unless it was successful
		var componentElement : any = rocket.component.Fetch(component); // Get the component Element

		if (componentElement !== null){ // If the component exists in storedComponents or DOM
			if (component["type"] == "dropdown"){ // If we are adding an event listener to a dropdown
				componentElement = componentElement.querySelector('div[data-rocket-minor-component="dropdown-label"]'); // Get the Dropdown's inner Label
			}

			var newElement : any = componentElement.cloneNode(true); // Make a clone of the Node, which doesn't copy event listeners
			componentElement.outerHTML = newElement.outerHTML; // Replace the component's Element outer HTML with the new Element outerHTML, so it does not copy listeners (therefore they are "removed")

			successfulRemoval = true; // Return true since we successfully removed event listeners
		}

		return successfulRemoval; // Return whether the removal was successful
	}

	// #endregion

	// #region Add Component function - Responsible for adding components to other components or elements

	export function Add(append : boolean, parentComponent : Object, childComponent : any) : boolean { // Returns boolean if the component adding was successful or not
		var parentElement : any = rocket.component.Fetch(parentComponent); // Get the HTMLElement of the parentComponent

		// #region Child Component Details

		var childComponentId : string; // Define childComponentId as the childComponents potential ID (may not exist IF childComponentType is (HTML)Element)
		var childComponentType : string = (typeof childComponent).toLowerCase(); // Set childComponentType to the typeof childComponent and lower-case it to ensure it is consistent across browsers
		var childElement : any = rocket.component.Fetch(childComponent); // Define childElement as any. In reality it is either an HTMLElement HTMLInputElement, an Element, or null

		// #endregion

		var allowAdding : boolean = false; // Define variable to determine if we should allow adding the childComponent to the parentComponent or not. Defaults as false

		if (childComponentType == "object"){ // If the childComponent is an Object
			childComponentId = childComponent["id"]; // Get the component's ID

			if (parentComponent["type"] == "header" && ((childComponent["type"] == "dropdown") || (childComponent["type"] == "searchbox"))){ // If the parentComponent is a header and childComponent is either a dropdown or a searchbar
				childElement = rocket.component.Fetch(childComponent); // Get the HTMLElement of the childComponent
				allowAdding = true; // Allow adding the childComponent
			}
			else if (childComponent["type"] == "list-item"){ // If the childComponent is a ListItem
				if (parentComponent["type"] == "dropdown"){ // If the parentComponent is a Dropdown
					parentComponent = rocket.dropdown.FetchLinkedListComponentObject(parentComponent); // Change parentComponent type to the one we get from FetchLinkedListComponentObject
					parentElement = rocket.component.Fetch(parentComponent); // Change parentElement to be the Dropdown's linked List Component Element
				}

				if (parentComponent["type"] == "list"){ // If the parentComponent is a List
					allowAdding = true; // Allow adding the childComponent
				}
			}
			else if (childComponent["link"] !== undefined){ // If a component "link" key is defined, meaning it is a link
				childElement = rocket.generator.ElementCreator("a", // Create a link element
					{
						"title" : childComponent["title"], // Set the title as the one specified in the component object
						"href" : childComponent["link"], // Add the link as href
						"content" :  childComponent["title"] // Set the inner tag content as the component title key
					}
				);

				allowAdding = true; // Allow adding the childComponent
			}
			else{ // If it is NOT a Dropdown, Searchbox, or Link
				childElement = rocket.component.Fetch(childComponent); // Get the HTMLElement of the childComponent
				allowAdding = true; // Allow adding the childComponent
			}
		}
		else if (childComponentType.indexOf("element") > -1){ // If the childComponentType is an (HTML)Element
			childElement = childComponent; // Set the childElement to the childComponent
			allowAdding = true;
		}

		if ((allowAdding == true) && (parentElement !== null) && (childElement !== null)){ // If we are allowing the adding of the childComponent and both the parentElement and childElement exist in storedComponents or DOM
			if (append == false){ // If we are prepending the childElement
				parentElement.insertBefore(childElement, parentElement.firstChild); // Insert before the first component
			}
			else{ // If we are appending the childComponent
				parentElement.appendChild(childElement); // Append the Element
			}

			if (childComponentId !== undefined){ // If we have defined the childComponentId, meaning it is an object and we should do cleanup
				if (rocket.component.storedComponents[childComponentId] !== undefined){ // If the childComponent has not been placed anywhere prior to the AddComponent
					delete rocket.component.storedComponents[childComponentId]; // Delete the storedComponent
				}
			}
		}
		else{ // If allowAdding is either set to false, parentElement == null OR childElement == null
			allowAdding = false; // Reset allowAdding to false in the event it was set to true
		}

		rocket.component.Update(parentComponent["id"], parentElement); // Update the storedComponent HTMLElement if necessary

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
				var individualComponentElement : Element = rocket.component.Fetch(individualComponent); // Fetch the Rocket Component Element

				if (individualComponentElement !== null){ // If the Component Element returned via Fetch exists in the DOM or storedComponents
					if (rocket.component.storedComponents[individualComponent["id"]] == undefined){ // If the Element does exist in DOM, rather in the storedComponents
						var parentElement : Element = individualComponentElement.parentElement; // Get the individualComponentElement's parentElement
						parentElement.removeChild(individualComponentElement); // Remove this Component from the DOM
					}
					else{ // If the Component is actually stored in rocket.component.storedComponents
						delete rocket.component.storedComponents[individualComponent["id"]]; // Remove the component from the storedComponents
					}
				}
			}
		}

		return allowRemoval; // Return the boolean value of IF we allowed Component removal or not
	}

	// #endregion
}
