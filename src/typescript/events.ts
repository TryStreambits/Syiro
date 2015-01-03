/*
    This is the module for Syiro Component and Generic Element Event Handling
*/

/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

module syiro.events {

    export var eventStrings : Object = { // Set syiro.component.listenerStrings as an Object containing commonly used event lister combinations
        "down" : ["mousedown", "touchstart"],
        "up" : ["mouseup", "touchend"],
        "fullscreenchange" : ["fullscreenchange", "mozfullscreenchange", "msfullscreenchange", "webkitfullscreenchange"]
    };

    // #region Syiro Component and Generic Element Event Handler

    export function Handler(){
        var component : any = arguments[0]; // Set component as first argument passed
        var eventData : Event = arguments[1]; // Set eventData as the second argument passed
        var componentId : string; // Define componentId as the Id of the Component
        var componentElement : any; // Define componentElement as any (potentially Element)
        var passableValue : any = null; // Set passableValue to any type, defaults to null

        var listener : string = (eventData.type).toLowerCase().slice(0,2).replace("on", "") + (eventData.type).toLowerCase().slice(2); // Ensure the event type passed is simplified and lowercased (strip out any beginning mention of "on")
        var componentType : string = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase(); // Set the componentType equal to the string form, stripping out [], "object", etc.

        // #region Component Data Determination - Determines the Component Id and Component Element

        if (componentType == "object") { // If the Component provided is a Syiro Component Object
            componentId = component["id"]; // Define componentId as the component Id we've already generated
            componentElement = syiro.component.Fetch(component); // Set the componentElement to the component Element we fetched
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
                        componentId = syiro.generator.IdGen(component.tagName.toLowerCase()); // Base the unique component Id on the tagName of the Element
                    }

                    component.setAttribute("data-syiro-component-id", componentId); // Set the data-syiro-component-id to either the non-Syiro Id or the Id we generated
                }
            }
            else if (component == document){ // If the Component passed is the document Object
                componentId = "document"; // Define componentId as "document
            }
            else { // If the Component passed is an Object like window, document, screen
                componentId = componentType; // Define componentId as the componentType since it is most likely unique
            }

            componentElement = component; // Define componentElement as the Component
        }

        // #endregion

        // #region Passable Data Determination

        var animationString : any = null; // Define animationString as the potential animation we should play in the event the Component is a Syiro Toggle Button (default: null)

        if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If it is a toggle button
            if (componentElement.hasAttribute("data-syiro-component-status") == false){ // If the button is NOT active (has no status)
                animationString = "toggle-forward-animation"; // Animate forward the toggle
                passableValue = true; // Set the passable value to TRUE since that is the new status of the toggleButton
            }
            else{ // If the button is active and we are setting it as inactive
                animationString = "toggle-backward-animation"; // Animate backward the toggle
                passableValue = false; // Set the passable value to FALSE since that is the new status of the toggleButton
            }
        }
        else if (component["type"] == "searchbox"){ // If the component is a Syiro Searchbox
            passableValue = componentElement.value; // Get the current value of the input
        }
        else{
            passableValue = eventData; // Simply set the passableValue to the event data passed
        }

        // #endregion

        if (typeof syiro.component.componentData[componentId]["ignoreClick"] == "undefined"){ // If this Handler isn't being triggered by touchstart or touchend bubbling to mouse events
            if (animationString !== null){ // If we are in fact working with a Syiro Toggle Button
                syiro.animation.Animate(component, // Animate the Toggle Button
                    {
                        "animation" : animationString, // Define animation as either toggle-forward-animation or toggle-backward-animation
                        "function" : function(component : Object){ // Post-Animation Function
                            var buttonElement : Element = syiro.component.Fetch(component); // Get the buttonElement based on the component Object

                            if (buttonElement.hasAttribute("data-syiro-component-status") == false){ // If the status is not "true" / active
                                buttonElement.setAttribute("data-syiro-component-status", "true"); // Set to true
                            }
                            else{ // If the status IS true
                                buttonElement.removeAttribute("data-syiro-component-status"); // Remove the buttonElement component status
                            }
                        }
                    }
                );
            }

            for (var individualFunctionId in syiro.component.componentData[componentId]["handlers"][listener]){ // For each function that is related to the Component for this particular listener
                syiro.component.componentData[componentId]["handlers"][listener][individualFunctionId].call(syiro, component, passableValue); // Call the function, passing along the passableValue and the Component
            }

            // #region Phantom Click Prevention

            if (listener.indexOf("touch") == 0){ // If this is a touch event
                syiro.component.componentData[componentId]["ignoreClick"] = true; // Set "ignoreClick" key to true in the componentData for this Component

                var timeoutId = window.setTimeout( // Create a setTimeout timer
                    function(){
                        var componentId = arguments[0]; // Define componentId as the first argument passed
                        delete syiro.component.componentData[componentId]["ignoreClick"]; // Remove the ignoreClick event
                        window.clearTimeout(syiro.component.componentData[componentId]["ignoreClick-TimeoutId"]); // Clear the window timeout by getting ignoreClick-TimeoutId int and clearing based on that
                    }.bind(this, componentId) // Attach the Component Id to the function
                    ,350 // Prevent click action for 350ms as most
                );

                syiro.component.componentData[componentId]["ignoreClick-TimeoutId"] = timeoutId; // Define ignoreClick-TimeoutId of this Component as the timeoutId we get from setTimeout
            }

            // #endregion
        }
    }

    // #region

    // #region Syiro Component and Generic Element Add Listener Function

    export function Add(... args : any[]) : boolean { // Takes (optional) space-separated listeners, Component Object or a generic Element, and the handler function.
        var allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)
        var componentId : string; // Define componentId as the ID which we query for in syiro.component.componentData
        var listeners : any; // Define listeners as any (array or string -> array)
        var component : any; // Define Component as a Syiro Component Object or an Element
        var listenerCallback : Function; // Default to having the listenerCallback be the handler we are passed.

        if ((args.length == 2) || (args.length == 3)){ // If an appropriate amount of arguments are provided
            if (args.length == 2){ // If two arguments are passed
                component = args[0]; // Component is the first argument
                listenerCallback = args[1]; // Handler is the second argument

                if (component["type"] !== "searchbox"){ // If we are adding listeners to a Component that is NOT a Searchbox (which uses a unique listener)
                    listeners = syiro.events.eventStrings["up"]; // Use click / touch related events
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

            if (typeof listeners == "string"){ // If the listeners is a string
                listeners = listeners.trim().split(" "); // Trim the spaces from the beginning and end then split each listener into an array item
            }

            var componentElement : any; // Define componentElement as an Element
            var componentType : string = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase(); // Set the componentType equal to the string form, stripping out [], "object", etc.

            if (componentType == "object"){ // If the Component provided is a Syiro Component Object (the componentType is "object" rather than something like "window"
                componentId = component["id"]; // Define the component ID as the unique Id already have for the Syiro Component Object
                componentElement = syiro.component.Fetch(component); // Get the Component Element

                if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
                    if (componentElement.querySelector("div") !== null){ // If there is a div defined in the List Item, meaning there is a control within the list item
                        allowListening = false; // Set allowListening to false. We shouldn't allow the entire List Item to listen to the same events as the inner control.
                    }
                }
            }
            else{ // If the Component provided is not a Syiro Component Object
                if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)){ // If the Component passed is an Element
                    if (component.hasAttribute("data-syiro-component-id")){ // If the component already has a unique Id defined
                        componentId = component.getAttribute("data-syiro-component-id"); // Get the Id and assign it to the componentId
                    }
                    else { // If the component does not have an ID
                        if (component.hasAttribute("id")){ // If the component has a non-Syiro Id
                            componentId = component.getAttribute("id"); // Get the Id and assign it to the componentId
                        }
                        else {
                            componentId = syiro.generator.IdGen(component.tagName.toLowerCase()); // Base the unique component Id on the tagName of the Element
                        }

                        component.setAttribute("data-syiro-component-id", componentId); // Set the data-syiro-component-id to either the non-Syiro Id or the Id we generated
                    }
                }
                else { // If the Component passed is an Object like window, document, screen
                    componentId = componentType; // Define componentId as the componentType since it is most likely unique
                }

                componentElement = component; // Define componentElement as the Component
            }

            if (allowListening == true){ // If allowListening is TRUE
                if (typeof syiro.component.componentData[componentId] == "undefined"){ // If the Component is not defined in componentData yet (for instance, normal Elements, document, or window)
                    syiro.component.componentData[componentId] = {}; // Define componentId in componentData as an empty Object
                }

                if (typeof syiro.component.componentData[componentId]["handlers"] == "undefined"){ // If the Component's listeners are already defined
                    syiro.component.componentData[componentId]["handlers"] = {}; // Define handlers as a blank Object
                }

                for (var individualListenerIndex in listeners){ // For each listener in the listeners array
                    var listener = listeners[individualListenerIndex]; // Define listener as the individual listener in the listeners array

                    if (typeof syiro.component.componentData[componentId]["handlers"][listener] == "undefined"){ // If the individual listener key is undefined in the handlers of the Component
                        syiro.component.componentData[componentId]["handlers"][listener] = []; // Define the listener value as an empty array that will hold functions we'll be calling.
                        componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component)); // Set the Listener / Handler as Syiro's Event Handler, binding to "this" and the Component
                    }

                    syiro.component.componentData[componentId]["handlers"][listener].push(listenerCallback); // Simply add the function to the listener Array of Functions
                }
            }
        }
        else{ // If the arguments length is NOT 2 or 3, meaning either too few or too many arguments were provided
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
        var componentId : string; // Define componentId as the Id of the Component
        var componentElement : any; // Define componentElement as any. It is either an Element, document, or window.
        var specFunc : any; // Define specFunc as any with the possibility of it being a function

        if (args.length < 4){ // If an appropriate amount of arguments are provided (less than 4)
            if ((typeof args[0] == "string") || ((typeof args[0] == "object") && (typeof args[0]["id"] == "undefined"))){ // If the first argument is a string or an array (typeof Object with no Id)
                listeners = args[0]; // Define listeners as the first argument

                if (typeof listeners == "string"){ // If the listeners was defined a string
                    listeners = listeners.trim().split(" "); // Trim the whitespace around the string then convert it to an array
                }

                component = args[1]; // Define component as the second argument provided
            }
            else if (typeof args[0]["id"] !== "undefined"){ // If the first argument passed was not an string or an array, meaning it is a Component
                component = args[0]; // Define component as the first argument passed
            }

            if (((args.length == 2) && (typeof args[1] == "function")) || ((args.length == 3) && (typeof args[2] == "function"))){ // If either a second argument is defined and it is a function, or a third argument is defined and it is a function
                specFunc = args[(args.length -1)]; // Define specFunc as the function provided in either the second or third argument (length minus one)
            }

            if ((typeof component.nodeType == "undefined") && (component !== window)){ // If the Component provided is a Syiro Component Object (doesn't have a nodeType nor is the window Object)
                componentId = component["id"]; // Define componentId as the component Id we've already generated
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
                componentId = component.getAttribute("data-syiro-component-id"); // Get the Id and assign it to the componentId
                componentElement = component; // Define componentElement as the Component
            }
            else if (component == document){ // If the Component passed is the document Object
                componentId = "document"; // Define componentId as "document
                componentElement = component; // Define componentElement as the document
            }
            else if (component == window){ // If the componentElement is the window
                componentId = "window"; // Define componentId as "window"
                componentElement = component; // Define componentElement as the window
            }
            else{ // If the component is neither a Syiro Component Object, an Element, the document, or the window
                allowRemoval = false; // Disallow removal of the Component Listeners
            }

            if (allowRemoval == true){ // If we are going to allow the removal of event listeners from the Element
                if (typeof listeners == "undefined"){ // If listeners weren't defined
                    listeners = Object.keys(syiro.component.componentData[componentId]["handlers"]); // Get each key defined in handlers (ex: keyup,keydown) and set that to the listeners
                }

                if ((componentElement !== undefined) && (componentElement !== null)){
                    for (var individualListenerIndex in listeners){ // For each listener that was defined in listeners array
                        var listener = listeners[individualListenerIndex]; // Define listener as the value from index of listeners
                        var componentListeners : any = null; // Define componentListeners as an array of functions specific to that listener, only for specFunc, or null (default) if all functions should be removed

                        if (typeof specFunc == "function") { // If a specific function is defined
                            componentListeners = syiro.component.componentData[componentId]["handlers"][listener]; // Define componentListeners as the array of functions specific to that listener

                            for (var individualFuncIndex in componentListeners){ // For each individual function in the componentListeners
                                if (componentListeners[individualFuncIndex].toString() == specFunc.toString()){ // If the stringified forms of both functions match
                                    componentListeners.splice(individualFuncIndex, 1); // Remove the specific function from the componentListeners by splicing the array (removing an item based on index and number defined)
                                }
                            }
                        }

                        if ((componentListeners == null) || (componentListeners.length == 0)){ // If the componentListeners is null or does NOT have a length (essentially null)
                            delete syiro.component.componentData[componentId]["handlers"][listener]; // Remove the specific listener from this handler from the particular Component
                            componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component)); // Remove the event listener (specific to the listener and func)
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
