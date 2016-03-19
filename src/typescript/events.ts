/*
	This is the namespace for Syiro Component and Generic Element Event Handling
*/

/// <reference path="animation.ts" />
/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

namespace syiro.events {

	export var Strings : Object = { // Commonly used event lister combinations
		"down" : "mousedown", // Default down to mousedown
		"up" : "mouseup", // Default up to mouseup
		"move" : "mousemove", // Default move to mousemove
		"fullscreenchange" : ["fullscreenchange", "mozfullscreenchange", "msfullscreenchange", "webkitfullscreenchange"],
		"orientationchange" : ["orientationchange", "mozorientationchange", "msorientationchange"]
	};

	// Handler
	// Syiro Component and Generic Element Event Handler
	export function Handler(){
		var eventData : Event = arguments[1]; // Set eventData as the second argument passed

		if (eventData.type.indexOf("touch") !== -1){ // If we are using touch events
			eventData.preventDefault(); // Prevent the browser from doing default touch actions
		}

		syiro.events.Trigger(eventData.type, arguments[0], eventData); // Call Trigger automatically with the type, Component, and possible eventData
	}

	// Trigger
	// Used to determine what data to provide and trigger the functions necessary.
	export function Trigger(eventType : string, component : any, eventData ?:Event){
		var componentObject : ComponentObject = component; // Default componentObject as component
		var componentElement : any; // Define componentElement as any (potentially Element)
		var passableValue : any = null; // Set passableValue to any type, defaults to null

		// #region Component Data Determination - Determines the Component Id and Component Element

		if (syiro.utilities.TypeOfThing(component, "ComponentObject")){ // If this is a Component Object
			componentElement = syiro.component.Fetch(component); // Set the componentElement to the component Element we fetched
		} else { // If the Component is either an Element or another interface like screen
			componentObject = syiro.component.FetchComponentObject(component); // Fetch the Component Object of the component
			componentElement = component; // Define componentElement as the Component
		}

		if (componentObject.type == "searchbox"){ // If this is a Searchbox Component
			componentElement = componentElement.querySelector("input"); // Change componentElement to be the inner input
		}

		// #endregion

		var functionsForListener : Array<Function> = syiro.data.Read(componentObject.id + "->handlers->" + eventType); // Fetch all functions for this particular listener

		// #region Passable Data Determination

		if (componentElement.nodeName =="INPUT"){ // If the Element is an input Element
			passableValue = componentElement.value; // Get the current value of the input
		} else {
			passableValue = eventData; // Simply set the passableValue to the event data passed
		}

		// #endregion

		for (var individualFunc of functionsForListener){ // For each function that is related to the Component for this particular listener
			individualFunc.call(this, component, passableValue); // Call the function, passing along the passableValue and the component
		}
	}

	// Add
	// Add a listener function to a Syiro Component and Generic Element
	export function Add(listeners : any, component : any, listenerCallback : Function) : boolean { // Takes (optional) space-separated listeners, Component Object or a generic Element, and the handler function.
		var allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)

		if (arguments.length == 3){ // If an appropriate amount of arguments are provided
			if (typeof listeners == "string"){ // If the listeners is a string
				listeners = listeners.replace(" ", "").split(","); // Eliminate whitespacing and comma-separate listeners
			}

			var componentObject : ComponentObject = component; // Define componentObject as a Component Object, default to component
			var componentElement : any; // Define componentElement as an Element

			if (syiro.utilities.TypeOfThing(component, "ComponentObject")){ // If the Component provided is a Syiro Component Object
				componentElement = syiro.component.Fetch(component); // Get the Component Element
			} else { // If the Component provided is not a Syiro Component Object
				componentObject = syiro.component.FetchComponentObject(component); // Define component as the fetched component Object of the provided variable
				componentElement = component; // Define componentElement as the Component
			}

			if (component.type == "list-item"){ // Make sure the component is in fact a List Item
				allowListening = (componentElement.querySelector("div") == null); // If there is a div defined in the List Item, meaning there is a control within the list item (the query would return a non-null value), set allowListening to false
			} else if (component.type == "searchbox"){ // If this Component is a Searchbox
				componentElement = componentElement.querySelector("input"); // Redefine componentElement as the inner input
			}

			if (allowListening){ // If allowListening is TRUE
				for (var listener of listeners){ // For each listener in the listeners array
					var currentListenersArray : any = syiro.data.Read(componentObject.id + "->handlers->" + listener); // Get all listeners of this handler (if any) of this Component

					if (typeof currentListenersArray == "boolean"){ // If there are no functions in the Array
						currentListenersArray = [listenerCallback]; // Define as a new Array

						if (syiro.data.Read(componentObject.id + "->DisableInputTrigger") == false){ // If this isn't a Searchbox or is but doesn't have DisableInputTrigger set to true
							componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component)); // Set the Listener / Handler as Syiro's Event Handler, binding to "this" and the Component
						}
					} else { // If there is already functions in currentListenersArray
						if (currentListenersArray.indexOf(listenerCallback) == -1){ // If this function isn't already in currentListenersArray
							currentListenersArray.push(listenerCallback); // Push the listener to the currentListenersArray
						}
					}

					syiro.data.Write(componentObject.id + "->handlers->" + listener, currentListenersArray); // Write currentListenersArray (whether it is an empty array or a newly updated one) to the Component's handlers for this listener
				}
			}
		} else { // If the arguments length is NOT 3, meaning either too few or too many arguments were provided
			allowListening = false;
		}

		return allowListening; // Return whether we allowed listening to the component
	}

	// Remove
	// Remove event listening from a Component or Generic Element
	export function Remove(... args : any[]) : boolean {
		var allowRemoval : boolean = true; // Set allowRemoval as a boolean, defaulting to true and allowing Listener removal unless specified otherwise.
		var successfulRemoval : boolean = false; // Set successfulRemove as a boolean, defaulting to false unless it was successful
		var listeners : any; // Define listeners as any (array or string -> array)
		var component : any; // Define component as any (Object, Element, document, or window)
		var componentElement : any; // Define componentElement as any. It is either an Element, document, or window.
		var specFunc : Function; // Define specFunc as a Function

		if ((args.length >= 2) && (args.length < 4)){ // If an appropriate amount of arguments are provided
			if ((typeof args[0] == "string") || (typeof args[0].length !== "undefined")){ // If this is a string or args[0].length is not undefined (so it is an array)
				listeners = args[0]; // Define listeners as the first argument

				if (typeof listeners == "string"){ // If the listeners was defined a string
					listeners = listeners.trim().split(" "); // Trim the whitespace around the string then convert it to an array
				}
			} else { // If the first argument is neither a string or an array
				allowRemoval = false; // Disallow removal
			}

			component = args[1]; // Declare component as the second argument

			if (typeof args[2] == "function"){ // If a specific function for removal is defined
				specFunc = args[2]; // Define specFunc as args[2]
			}

			if (syiro.utilities.TypeOfThing(component, "ComponentObject")){ // If the Component provided is a Syiro Component Object
				componentElement = syiro.component.Fetch(component); // Get the Component Element
			} else { // If we were not provided a Component Object
				componentElement = component; // Define componentElement as the Component
				component = syiro.component.FetchComponentObject(component);
			}

			if (allowRemoval){ // If we are going to allow the removal of event listeners from the Element
				if ((typeof componentElement !== "undefined") && (componentElement !== null)){
					for (var listener of listeners){ // For each listener that was defined in listeners array
						var componentListeners : any = null; // Define componentListeners as an array of functions specific to that listener, only for specFunc, or null (default) if all functions should be removed

						if (typeof specFunc == "function") { // If a specific function is defined
							componentListeners = syiro.data.Read(component.id + "->handlers->" + listener); // Define componentListeners as the array of functions specific to that listener
							var componentListenersFunctionIndex : number = componentListeners.indexOf(specFunc); // Get the index of this function

							if (componentListenersFunctionIndex !== -1){ // If the function exists as a listener
								componentListeners.splice(componentListenersFunctionIndex, 1); // Remove the specific function from the componentListeners by splicing the array (removing an item based on index and number defined)
							}
						}

						if ((componentListeners == null) || (componentListeners.length == 0)){ // If the componentListeners is null or does NOT have a length (essentially null)
							syiro.data.Delete(component.id + "->handlers->" + listener); // Remove the specific listener from this handler from the particular Component
							componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component)); // Remove the event listener (specific to the listener and func)
						} else { // If componentListeners.length is still not zero after removing the specFunc
							syiro.data.Write(component.id + "->handlers->" + listener, componentListeners); // Update the listener functions array for this handler
						}
					}

					successfulRemoval = true; // Return true since we successfully removed event listeners
				}
			}
		}

		return successfulRemoval; // Return whether the removal was successful
	}
}