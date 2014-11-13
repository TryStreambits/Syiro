/*
	This is the module for core Rocket functionality.
*/

/// <reference path="rocket.ts" />
/// <reference path="interfaces/component-object.ts" />

module rocket.component {
	export var storedComponents : Object = {}; // An object that stores generated component(s) / component(s) information

	// #region Common Component Handlers

	export var dropdownToggler : Function = function(){ // Create a function that will handle the dropdown toggling
		var component : Object = arguments[0]; // Get the component that was passed to this function as a bound argument
		var dropdownElement : Element = rocket.component.Fetch(component); // Get the dropdownElement based on the component Object

		if (dropdownElement.hasAttribute("data-rocket-component-active")){ // If the Dropdown Component has an "data-rocket-component-active" attribute, that means the Dropdown's inner List is showing
			dropdownElement = rocket.component.Fetch(component); // Get the dropdown Element based on the Rocket Component Object that was passed
			dropdownElement.removeAttribute("data-rocket-component-active"); // Remove the active attribute from the Dropdown, making the inner List hidden
		}
		else{ // If the Dropdown Component does NOT have an "data-rocket-component-active" attribute
			dropdownElement = rocket.component.Fetch(component); // Get the dropdown Element based on the Rocket Component Object that was passed
			dropdownElement.setAttribute("data-rocket-component-active", ""); // Add the data-rocket-component-active attribute to the Dropdown component, setting the List to display
		}
	};

	// #endregion

	// #region Defining existing Rocket components

	export function Define(type : string, selector : string) : Object {
		var component : Object = {}; // Create an object called component that stores the component information
		component["type"] = type; // Define the key "type" as the type we've defined

		var componentID : string = rocket.generator.IdGen(type); // Generate a unique ID for this component

		var selectedElement : Element = document.querySelector(selector); // Get the first recognized HTMLElement that has this selector.
		selectedElement.setAttribute("data-rocket-component-id", componentID); // Set this component's ID

		component["id"] = componentID; // Add the component ID to the object that we will be returning to the developer

		var componentHandler : Function; // Set componentHandler as a variable that will be a function

		if (type == "dropdown"){ // If we are defining a Dropdown Rocket component
			rocket.component.AddListeners("click touchend MSPointerUp", component, rocket.component.dropdownToggler); // Immediately listen to the Dropdown
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
					var timeoutIdInt = parseInt(timeoutId); // Convert the ID from string to an Integer

					window.clearTimeout(timeoutIdInt); // Clear the timeout

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

	export function CSS(componentObject : Object, property : string, newValue ?: any){
		var componentElement = rocket.component.Fetch(componentObject); // Get the componentElement

		if (componentElement !== null){ // If the componentElement exists in storedComponents or DOM
			var currentValue : string; // Define currentValue as the value of the property we are potentially looking for (not applicable for prop setting)
			var currentComponentCSS = componentElement.getAttribute("style"); // Get the current CSS of the Component

			if (currentComponentCSS == null){ // If there is no style attribute in the component
				currentComponentCSS = ""; // Set to a blank string
			}

			var indexOfProperty = currentComponentCSS.indexOf(property); // Get the index of the property within the CSS

			if (indexOfProperty !== -1){ // If the property exists in the CSS style
				var endOfProperty = currentComponentCSS.indexOf(";", indexOfProperty); // Get the end of the property based on the location of ; relative to the indexOfProperty

				/* Get the current property value as a substring of currentComponentCSS based on indexOfProperty + the length of the property (ex. background-image) + 2 ( SPACE ; )
					and the index of the first semi-colon after the indexOfProperty (endOfProperty)
				*/
				currentValue = currentComponentCSS.substring((indexOfProperty + (property.length + 2)), endOfProperty);
			}
			else{ // If the property does NOT exist in the CSS style
				currentValue = "";
			}


			if (newValue == undefined){ // If a new value is NOT defined for the component, meaning we are getting the current value
				return currentValue; // Return the current value
			}
			else{ // If a new value IS defined for the component, we are going to update the component's style
				var updatedStyleValue : string;

				if (currentValue !== ""){ // If the property exists (since it'd have a value)
					updatedStyleValue = currentComponentCSS.replace(property + ": " + currentValue + ";", ""); // Remove the current prop / val
				}

				if (typeof newValue == "string"){ // If the newValue is not FALSE, meaning we are either replacing the current property value with a new one OR adding it if it didn't exist in the first place
					updatedStyleValue = currentComponentCSS + property + ": " + newValue + ";" // Set the updatedStyleValue with an appended property: value; string and currentComponentCSS
				}

				componentElement.setAttribute("style", updatedStyleValue); // Update the componentElement style

				rocket.component.Update(componentObject["id"], componentElement); // Update the stored component (if applicable)

				return newValue; // Return the new value we defined
			}
		}
		else{ // If the componentElement does NOT exist in storedComponents or DOM
			return false; // Return a false that we could NOT properly set or remove a CSS styling
		}
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

	// #region Update Stored Component's HTMLElement, but only if it exists in the first place.

	export function Update(componentId : string, componentElement : Element){
		if (rocket.component.storedComponents[componentId] !== undefined){ // If the HTMLElement is defined in the storedComponents (by the id of the component being in the storedComponents)
			rocket.component.storedComponents[componentId] = componentElement; // Update with the componentElement we defined
		}
	}

	// #endregion

	// #region Component Add Listener Function

	export function AddListeners(... args : any[]) : boolean { // Takes (optional) space-separated listeners, component Object, and the handler function.
		var allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)
		var listeners : string; // Define listeners as a string
		var component : Object; // Define Component as a Component Object
		var listenerCallback : Function;; // Default to having the listenerCallback be the handler we are passed.

		if ((args.length == 2) || (args.length == 3)){ // If an appropriate amount of arguments are provided
			if (args.length == 2){ // If two arguments are passed to the AddListeners function
				component = args[0]; // Component is the first argument
				listenerCallback = args[1]; // Handler is the second argument

				if (component["type"] !== "searchbox"){ // If we are adding listeners to a Component that is NOT a Searchbox (which uses a unique listener)
					listeners = "click MSPointerUp"; // Use click / touch related events
				}
				else{ // If the Component IS a Searchbox
					listeners = "keyup"; // Use the keyup listener
				}
			}
			else{ // If the arguments list is 3, meaning listeners, a Component Object, and a Handler are provided
				listeners = args[0]; // Set listeners to the first argument
				component = args[1]; // Set component to the second argument
				listenerCallback = args[2]; // Set the handler to the third argument
			}

			var componentElement : any = rocket.component.Fetch(component); // Get the Component Element

			if (componentElement !== null){ // If the componentElement exists in storedComponents or DOM
				if (component["type"] == "dropdown"){ // If we are adding an event listener to a dropdown
					componentElement = componentElement.querySelector('div[data-rocket-minor-component="dropdown-label"]'); // Get the Dropdown's inner Label
				}
				else if ((component["type"] == "button") && (componentElement.getAttribute("data-rocket-component-type") == "toggle")){ // If the component is a Toggle Button
					componentElement = componentElement.querySelector('div[data-rocket-minor-component="buttonToggle"]'); // Get the Toggle Buttons's inner toggle button
				}
				else if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
					if (componentElement.querySelector("div") !== null){ // If there is a div defined in the List Item, meaning there is a control within the list item
						allowListening = false; // Set allowListening to false. We shouldn't allow the entire List Item to listen to the same events as the inner control.
					}
				}

				if (allowListening == true){ // If allowListening is TRUE
					var listenerArray : Array<string>  = listeners.trim().split(" "); // Trim the spaces from the beginning and end then split each listener into an array item

					listenerArray.forEach( // For each listener
						function(individualListener : string){
							componentElement.addEventListener(individualListener, // Attach an event listener to the component
								function(){
									var component : Object = arguments[0]; // Set the Rocket Component Object to the first argument passed
									var listenerCallback : Function = arguments[1]; // Set the Callback to the second argument passed
									var componentElement : any = rocket.component.Fetch(component); // Set the componentElement to the component Element we fetched

									if (componentElement !== null){ // If the listener wasn't magically called while the Element did not exist
										var passableValue : any = null; // Set passableValue to any type, defaults to null

										if ((component["type"] == "button") && (componentElement.getAttribute("data-rocket-component-type") == "toggle")){ // If it is a toggle button
											var animationString : string;

											if (componentElement.getAttribute("data-rocket-component-status") !== "true"){ // If the button is NOT active (has no status or one that is false)
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

													if (buttonElement.getAttribute("data-rocket-component-status") !== "true"){ // If the status is not "true" / active
														buttonElement.setAttribute("data-rocket-component-status", "true"); // Set to true
													}
													else{ // If the status IS true
														buttonElement.setAttribute("data-rocket-component-status", "false"); // Set to false
													}
												}
											);
										}
										else if (component["type"] == "searchbox"){ // If the component is a Rocket Searchbox
											passableValue = componentElement.value; // Get the current value of the input
										}
										else{ // If it is NOT a Toggle Button or Searchbox
											passableValue = null; // Just set to null
										}

										listenerCallback.call(rocket, component, passableValue); // Call the listenerCallback and pass along the passableValue and the component Object
									}
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
					parentElement = rocket.component.Fetch(rocket.dropdown.InnerListComponentFetcher(parentComponent)); // Reset parentElement to be the Dropdown's inner List
				}

				if ((parentComponent["type"] == "dropdown") || (parentComponent["type"] == "list")){ // If the parentComponent is a Dropdown or a List
					allowAdding = true; // Allow adding the childComponent
				}
			}
			else if (childComponent["link"] !== undefined){ // If a component "link" key is defined, meaning it is a link
				childElement = rocket.generator.ElementCreator(null, "a", // Create a link element
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
			componentList = Array(componentsToRemove); // Set componentList to an Array consisting of the single Component Object
		}
		else if (((typeof componentsToRemove).toLowerCase() == "object") && (componentsToRemove.length > 0)){ // If the componentsToRemove is an object (a.k.a array) and has a length (which an array does)
			allowRemoval = true; // Set allowRemoval to true
			componentList = componentsToRemove; // Set componentList to the componentsToRemove
		}

		if (allowRemoval == true){ // If we are allowing the removal of Components
			for (var individualComponentIndex in componentList){ // For each Component and Sub-Component in componentList
				var individualComponent : Object = componentList[individualComponentIndex]; // Get this specific Object
				var individualComponentElement : Element = rocket.component.Fetch(individualComponent); // Fetch the Rocket Component Element

				if (individualComponentElement !== null){ // If the Component Element returned via Fetch actually exists in the DOM or storedComponents
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
