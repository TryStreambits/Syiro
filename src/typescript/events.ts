/*
    This is the module for Syiro Component and Generic Element Event Handling
*/

/// <reference path="animation.ts" />
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="interfaces.ts" />

module syiro.events {

    export var eventStrings : Object = { // Set syiro.component.listenerStrings as an Object containing commonly used event lister combinations
        "down" : [], "up" : [],
        "fullscreenchange" : ["fullscreenchange", "mozfullscreenchange", "msfullscreenchange", "webkitfullscreenchange"],
        "orientationchange" : ["orientationchange", "mozorientationchange", "msorientationchange"]
    };

    // #region Syiro Component and Generic Element Event Handler

    export function Handler(){
        var component : any = arguments[0]; // Set component as first argument passed
        var eventData : Event = arguments[1]; // Set eventData as the second argument passed
        var componentId : string; // Define componentId as the Id of the Component
        var componentElement : any; // Define componentElement as any (potentially Element)
        var passableValue : any = null; // Set passableValue to any type, defaults to null

        // #region Immediate PreventDefault()

        if (eventData.type.indexOf("touch") !== -1){ // If we are using touch events
            eventData.preventDefault(); // Prevent the browser from doing default touch actions
        }

        // #region Component Data Determination - Determines the Component Id and Component Element

        if (syiro.component.IsComponentObject(component)) { // If the Component provided is a Syiro Component Object
            componentId = component["id"]; // Define componentId as the component Id we've already generated
        }
        else{ // If the Component is either an Element or another interface like screen
            if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)){ // If the Component passed is an Element
                if (component.hasAttribute("data-syiro-component-id")){ // If the component already has a unique Id defined
                    componentId = component.getAttribute("data-syiro-component-id"); // Get the Id and assign it to the componentId
                }
                else { // If the component does not have an ID
                    if (component.hasAttribute("id")){ // If the component has a non-Syiro Id
                        componentId = component.getAttribute("id"); // Get the Id and assign it to the componentId
                    }
                    else {
                        componentId = syiro.component.IdGen(component.tagName.toLowerCase()); // Base the unique component Id on the tagName of the Element
                    }

                    component.setAttribute("data-syiro-component-id", componentId); // Set the data-syiro-component-id to either the non-Syiro Id or the Id we generated
                }
            }
            else { // If the Component passed is an Object like window, document, screen
                var componentType : string = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase(); // Set the componentType equal to the string form, stripping out [], "object", etc.
                componentId = componentType; // Define componentId as the componentType since it is most likely unique
            }

            componentElement = component; // Define componentElement as the Component
        }

        // #endregion

		var functionsForListener : Array<Function> = syiro.data.Read(componentId + "->handlers->" + eventData.type); // Fetch all functions for this particular listener

        // #region Passable Data Determination
        componentElement = syiro.component.Fetch(component); // Set the componentElement to the component Element we fetched

		if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If it is a Toggle Button
			if (componentElement.hasAttribute("active")){ // If the button is active
				passableValue = false; // Set the passable value to FALSE since that is the new status of the Toggle Button
			}
			else{ // If the button is inactive and we are setting it to active
				passableValue = true; // Set the passable value to TRUE since that is the new status of the toggleButton
			}

			functionsForListener.unshift(syiro.button.Toggle); // Add the Toggle function to the beginning of the functionListeners array
		}
        else if ((typeof component.nodeName !== "undefined") && (component.nodeName == "input")){ // If the Element is an input Element
            passableValue = componentElement.value; // Get the current value of the input
        }
        else{
            passableValue = eventData; // Simply set the passableValue to the event data passed
        }

        // #endregion

        for (var individualFunc of functionsForListener){ // For each function that is related to the Component for this particular listener
            individualFunc.call(this, component, passableValue); // Call the function, passing along the passableValue and the Component
        }
    }

    // #region

    // #region Syiro Component and Generic Element Add Listener Function

    export function Add(... args : any[]) : boolean { // Takes (optional) space-separated listeners, Component Object or a generic Element, and the handler function.
        var allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)
        var componentId : string; // Define componentId as the ID which we query for in syiro.data.storage
        var listeners : any; // Define listeners as any (array or string -> array)
        var component : any; // Define Component as a Syiro Component Object or an Element
        var listenerCallback : Function; // Default to having the listenerCallback be the handler we are passed.

        if (args.length == 3){ // If an appropriate amount of arguments are provided
            listeners = args[0]; // Set listeners to the first argument
            component = args[1]; // Set component to the second argument
            listenerCallback = args[2]; // Set the handler to the third argument

            if (typeof listeners == "string"){ // If the listeners is a string
                listeners = listeners.trim().split(" "); // Trim the spaces from the beginning and end then split each listener into an array item
            }

            var componentElement : any; // Define componentElement as an Element

            if (syiro.component.IsComponentObject(component)){ // If the Component provided is a Syiro Component Object
                componentId = component["id"]; // Define the component ID as the unique Id already have for the Syiro Component Object
                componentElement = syiro.component.Fetch(component); // Get the Component Element

                if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
                    if (componentElement.querySelector("div") !== null){ // If there is a div defined in the List Item, meaning there is a control within the list item
                        allowListening = false; // Set allowListening to false. We shouldn't allow the entire List Item to listen to the same events as the inner control.
                    }
                }
                else if (component["type"] == "searchbox"){ // If this Component is a Searchbox
                    componentElement = componentElement.firstElementChild.value ; // Redefine componentElement as the inner input (first inner child's value)
                }
            }
            else { // If the Component provided is not a Syiro Component Object
                if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)){ // If the Component passed is an Element
                    if (component.hasAttribute("data-syiro-component-id")){ // If the component already has a unique Id defined
                        componentId = component.getAttribute("data-syiro-component-id"); // Get the Id and assign it to the componentId
                    }
                    else { // If the component does not have an ID
                        if (component.hasAttribute("id")){ // If the component has a non-Syiro Id
                            componentId = component.getAttribute("id"); // Get the Id and assign it to the componentId
                        }
                        else {
                            componentId = syiro.component.IdGen(component.tagName.toLowerCase()); // Base the unique component Id on the tagName of the Element
                        }

                        component.setAttribute("data-syiro-component-id", componentId); // Set the data-syiro-component-id to either the non-Syiro Id or the Id we generated
                    }
                }
                else { // If the Component passed is an Object like window, document, screen
                    var componentType : string = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase(); // Set the componentType equal to the string form, stripping out [], "object", etc.
                    componentId = componentType; // Define componentId as the componentType since it is most likely unique
                }

                componentElement = component; // Define componentElement as the Component
            }

            if (allowListening == true){ // If allowListening is TRUE
                for (var individualListenerIndex in listeners){ // For each listener in the listeners array
                    var listener = listeners[individualListenerIndex]; // Define listener as the individual listener in the listeners array
                    var currentListenersArray : any = syiro.data.Read(componentId + "->handlers->" + listener); // Get all listeners of this handler (if any) of this Component

                    if (currentListenersArray == false){ // If the individual listener key is undefined in the handlers of the Component
                        currentListenersArray = []; // Define currentListenersArray as an empty array
                        componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component)); // Set the Listener / Handler as Syiro's Event Handler, binding to "this" and the Component
                    }

                    currentListenersArray.push(listenerCallback); // Push the listenerCallback to the currentListenersArray
                    syiro.data.Write(componentId + "->handlers->" + listener, currentListenersArray); // Write currentListenersArray (whether it is an empty array or a newly updated one) to the Component's handlers for this listener
                }
            }
        }
        else{ // If the arguments length is NOT 3, meaning either too few or too many arguments were provided
            allowListening = false;
        }

        return allowListening; // Return whether we allowed listening to the component
    }

    // #endregion

    // #region Component Remove Event Listener

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
			}
			else{ // If the first argument is neither a string or an array
				allowRemoval = false; // Disallow removal
			}

			component = args[1]; // Declare component as the second argument

			if (typeof args[2] == "function"){ // If a specific function for removal is defined
				specFunc = args[2]; // Define specFunc as args[2]
			}

			if (syiro.component.IsComponentObject(component)){ // If the Component provided is a Syiro Component Object
				componentElement = syiro.component.Fetch(component); // Get the Component Element

				if (componentElement !== null){ // If we successfully fetched the Component's Element
					if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
						if (componentElement.querySelector('div[data-syiro-component="button"]') !== null){ // If there is a div (secondary control) in the List Item
							allowRemoval = false; // Set allowRemoval to false, since there is a Button within the List Item that would be affected.
						}
					}
				}
			}
			else if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)){ // If the Component passed is an Element
				componentElement = component; // Define componentElement as the Component
				component = syiro.component.FetchComponentObject(componentElement);
			}
			else{ // If the component is NOT a Syiro Component Object or an Element
				componentElement = component; // Define componentElement as the component passed
				component = { "id" : String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase() }; // Set the componentId equal to the string form, stripping out [], "object", etc.
			}

			if (allowRemoval == true){ // If we are going to allow the removal of event listeners from the Element
				if ((typeof componentElement !== "undefined") && (componentElement !== null)){
					for (var individualListenerIndex in listeners){ // For each listener that was defined in listeners array
						var listener = listeners[individualListenerIndex]; // Define listener as the value from index of listeners
						var componentListeners : any = null; // Define componentListeners as an array of functions specific to that listener, only for specFunc, or null (default) if all functions should be removed

						if (typeof specFunc == "function") { // If a specific function is defined
							componentListeners = syiro.data.Read(component["id"] + "->handlers->" + listener); // Define componentListeners as the array of functions specific to that listener
							var componentListenersFunctionIndex : number = componentListeners.indexOf(specFunc); // Get the index of this function

							if (componentListenersFunctionIndex !== -1){ // If the function exists as a listener
								componentListeners.splice(componentListenersFunctionIndex, 1); // Remove the specific function from the componentListeners by splicing the array (removing an item based on index and number defined)
							}
						}

						if ((componentListeners == null) || (componentListeners.length == 0)){ // If the componentListeners is null or does NOT have a length (essentially null)
							syiro.data.Delete(component["id"] + "->handlers->" + listener); // Remove the specific listener from this handler from the particular Component
							componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component)); // Remove the event listener (specific to the listener and func)
						}
						else{ // If componentListeners.length is still not zero after removing the specFunc
							syiro.data.Write(component["id"] + "->handlers->" + listener, componentListeners); // Update the listener functions array for this handler
						}
					}

					successfulRemoval = true; // Return true since we successfully removed event listeners
				}
			}
		}

		return successfulRemoval; // Return whether the removal was successful
    }

    // #endregion

}
