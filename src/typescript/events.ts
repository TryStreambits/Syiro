/*
	This is the namespace for Syiro Component and Generic Element Event Handling
*/

/// <reference path="interfaces/core.ts" />
/// <reference path="animation.ts" />
/// <reference path="component.ts" />

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
		let eventData : Event = arguments[1]; // Set eventData as the second argument passed

		if (eventData.type.indexOf("touch") !== -1){ // If we are using touch events
			eventData.preventDefault(); // Prevent the browser from doing default touch actions
		}

		syiro.events.Trigger(eventData.type, arguments[0], eventData); // Call Trigger automatically with the type, Component, and possible eventData
	}

	// Trigger
	// Used to determine what data to provide and trigger the functions necessary.
	export function Trigger(eventType : string, componentProvided : any, eventData ?:Event){
		let component : ComponentObject = syiro.component.FetchComponentObject(componentProvided), componentElement : any = syiro.component.Fetch(componentProvided); // Get the ComponentObject and Element

		// #region Component Data Determination - Determines the Component Id and Component Element

		if (component.type == "searchbox"){ // If this is a Searchbox Component
			componentElement = componentElement.querySelector("input"); // Change componentElement to be the inner input
		}

		// #endregion

		// #region Passable Data Determination

		let passableValue : any = eventData; // Set passableValue to any, default to eventData

		if (componentElement.localName == "input"){ // If the Element is an input Element
			passableValue = componentElement.value; // Get the current value of the input
		}
		
		// #endregion

		let functionsForListener : Array<Function> = syiro.data.Read(component.id + "->handlers->" + eventType); // Fetch all functions for this particular listener
		for (let individualFunc of functionsForListener){ // For each function that is related to the Component for this particular listener
			individualFunc.call(this, component, passableValue); // Call the function, passing along the passableValue and the component
		}
	}

	// Add
	// Add a listener function to a Syiro Component and Generic Element
	export function Add(listeners : any, componentProvided : any, listenerCallback : Function) : boolean { // Takes (optional) space-separated listeners, Component Object or a generic Element, and the handler function.
		let allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)

		if (arguments.length == 3){ // If an appropriate amount of arguments are provided
			if (typeof listeners == "string"){ // If the listeners is a string
				listeners = listeners.replace(" ", "").split(","); // Eliminate whitespacing and comma-separate listeners
			}
			
			let component : ComponentObject = syiro.component.FetchComponentObject(componentProvided), componentElement : Element = syiro.component.Fetch(componentProvided); // Get the ComponentObject and Element

			if (component.type == "list-item"){ // Make sure the component is in fact a List Item
				allowListening = (componentElement.querySelector("div") == null); // If there is a div defined in the List Item, meaning there is a control within the list item (the query would return a non-null value), set allowListening to false
			} else if (component.type == "searchbox"){ // If this Component is a Searchbox
				componentElement = componentElement.querySelector("input"); // Redefine componentElement as the inner input
			}

			if (allowListening){ // If allowListening is TRUE
				for (let listener of listeners){ // For each listener in the listeners array
					let currentListenersArray : any = syiro.data.Read(component.id + "->handlers->" + listener); // Get all listeners of this handler (if any) of this Component

					if (typeof currentListenersArray == "boolean"){ // If there are no functions in the Array
						currentListenersArray = [listenerCallback]; // Define as a new Array

						if (syiro.data.Read(component.id + "->DisableInputTrigger") == false){ // If this isn't a Searchbox or is but doesn't have DisableInputTrigger set to true
							componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component)); // Set the Listener / Handler as Syiro's Event Handler, binding to "this" and the Component
						}
					} else { // If there is already functions in currentListenersArray
						if (currentListenersArray.indexOf(listenerCallback) == -1){ // If this function isn't already in currentListenersArray
							currentListenersArray.push(listenerCallback); // Push the listener to the currentListenersArray
						}
					}

					syiro.data.Write(component.id + "->handlers->" + listener, currentListenersArray); // Write currentListenersArray (whether it is an empty array or a newly updated one) to the Component's handlers for this listener
				}
			}
		} else { // If the arguments length is NOT 3, meaning either too few or too many arguments were provided
			allowListening = false;
		}

		return allowListening; // Return whether we allowed listening to the component
	}

	// Remove
	// Remove event listening from a Component or Generic Element
	export function Remove(listeners : any, componentProvided : any, specFunc ?: Function) : boolean {
		let allowRemoval : boolean = true; // Set allowRemoval as a boolean, defaulting to true and allowing Listener removal unless specified otherwise.
	
		switch (syiro.utilities.TypeOfThing(listeners)){
			case "string": // If listeners is a string
				listeners = listeners.replace(" ", "").split(","); // Remove whitespace then split comma-separated listeners
				break;
			case "undefined": // If listeners is undefined
				allowRemoval = false; // Do not allow removal
				break;
		}
		
		let component : ComponentObject = syiro.component.FetchComponentObject(componentProvided), componentElement : Element = syiro.component.Fetch(componentProvided); // Get the ComponentObject and Element

		if (allowRemoval){ // If we are going to allow the removal of event listeners from the Element
			for (let listener of listeners){ // For each listener that was defined in listeners array
				let componentListeners = [];

				if (typeof specFunc == "function") { // If a specific function is defined
					componentListeners = syiro.data.Read(component.id + "->handlers->" + listener); // Define componentListeners as all the listeners for that handler->listener
					let componentListenersFunctionIndex : number = componentListeners.indexOf(specFunc); // Get the index of this function

					if (componentListenersFunctionIndex !== -1){ // If the function exists as a listener
						componentListeners.splice(componentListenersFunctionIndex, 1); // Remove the specific function from the componentListeners by splicing the array (removing an item based on index and number defined)
					}
				}
				
				if (componentListeners.length == 0){ // If we are deleting all the component listeners (including if specFunc is the only listener)
					syiro.data.Delete(component.id + "->handlers->" + listener); // Remove the specific listener from this handler from the particular Component
					componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component)); // Remove the event listener (specific to the listener and func)						
				} else { // If we are removing a specific function and there are still other listeners
					syiro.data.Write(component.id + "->handlers->" + listener, componentListeners); // Update the listener functions array for this handler
				}
			}
		}

		return allowRemoval; // Return whether we allowed removal
	}
}