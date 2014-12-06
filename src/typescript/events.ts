/*
    This is the module for Syiro Component and Generic Element Event Handling
*/

/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

module syiro.events {

    export var eventStrings : Object = { // Set syiro.component.listenerStrings as an Object containing commonly used event lister combinations
        "down" : ["mousedown", "touchstart", "MSPointerDown"],
        "up" : ["mouseup", "touchend", "MSPointerUp"],
        "press" : ["click"]
    };

    // #region Syiro Component and Generic Element Event Handler

    export function Handler(){
        var component : any = arguments[0]; // Set component as first argument passed
        var componentId : string; // Define componentId as the Id of the Component
        var passableValue : any = null; // Set passableValue to any type, defaults to null

        if ((typeof component.nodeType == "undefined") && (component !== window)){ // If the Component provided is a Syiro Component Object (doesn't have a nodeType nor is the window Object)
            componentId = component["id"]; // Define componentId as the component Id we've already generated
            var componentElement : any = syiro.component.Fetch(component); // Set the componentElement to the component Element we fetched

            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If it is a toggle button
                var animationString : string;

                if (componentElement.hasAttribute("data-syiro-component-status") == false){ // If the button is NOT active (has no status)
                    animationString = "toggle-forward-animation"; // Animate forward the toggle
                    passableValue = true; // Set the passable value to TRUE since that is the new status of the toggleButton
                }
                else{ // If the button is active and we are setting it as inactive
                    animationString = "toggle-backward-animation"; // Animate backward the toggle
                    passableValue = false; // Set the passable value to FALSE since that is the new status of the toggleButton
                }

                syiro.animation.Animate(component, animationString,
                    function(component : Object){ // Post-Animation Function
                        var buttonElement : Element = syiro.component.Fetch(component); // Get the buttonElement based on the component Object

                        if (buttonElement.hasAttribute("data-syiro-component-status") == false){ // If the status is not "true" / active
                            buttonElement.setAttribute("data-syiro-component-status", "true"); // Set to true
                        }
                        else{ // If the status IS true
                            buttonElement.removeAttribute("data-syiro-component-status"); // Remove the buttonElement component status
                        }
                    }
                );
            }
            else if (component["type"] == "searchbox"){ // If the component is a Syiro Searchbox
                passableValue = componentElement.value; // Get the current value of the input
            }
        }
        else if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)){ // If the Component passed is an Element
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

        if (passableValue == null){ // If the passableValue is null
            passableValue = arguments[2]; // Simply set the passableValue to the event data passed
        }

        for (var individualFunctionId in syiro.component.componentData[componentId]["handlers"]){ // For each function that is related to the Component
            syiro.component.componentData[componentId]["handlers"][individualFunctionId].call(syiro, component, passableValue); // Call the function, passing along the passableValue and the Component
        }
    }

    // #region

    // #region Syiro Component and Generic Element Add Listener Function

    export function Add(... args : any[]) : boolean { // Takes (optional) space-separated listeners, Component Object or a generic Element, and the handler function.
        var allowListening : boolean = true; // Define allowListening as a boolean to which we determine if we should allow event listening on componentElement (DEFAULT : true)
        var componentId : string; // Define componentId as the ID which we query for in syiro.component.componentData
        var listeners : any; // Define listeners as a string
        var component : any; // Define Component as a Syiro Component Object or an Element
        var listenerCallback : Function; // Default to having the listenerCallback be the handler we are passed.

        if ((args.length == 2) || (args.length == 3)){ // If an appropriate amount of arguments are provided
            if (args.length == 2){ // If two arguments are passed to the syiro.events.Add function
                component = args[0]; // Component is the first argument
                listenerCallback = args[1]; // Handler is the second argument

                if (component["type"] !== "searchbox"){ // If we are adding listeners to a Component that is NOT a Searchbox (which uses a unique listener)
                    listeners = syiro.events.eventStrings["press"]; // Use click / touch related events
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

            var componentElement : any; // Define componentElement as an Element

            if ((typeof component.nodeType == "undefined") && (component !== window)){ // If the Component provided is a Syiro Component Object (doesn't have a nodeType nor is the window Object)
                componentId = component["id"]; // Define the component ID as the unique Id already have for the Syiro Component Object
                componentElement = syiro.component.Fetch(component); // Get the Component Element

                if (component["type"] == "list-item"){ // Make sure the component is in fact a List Item
                    if (componentElement.querySelector("div") !== null){ // If there is a div defined in the List Item, meaning there is a control within the list item
                        allowListening = false; // Set allowListening to false. We shouldn't allow the entire List Item to listen to the same events as the inner control.
                    }
                }
            }
            else if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)){ // If the Component passed is an Element
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
                allowListening = false; // Disallow listening to the Component
            }

            if (allowListening == true){ // If allowListening is TRUE
                if ((typeof listeners).toLowerCase() == "string"){ // If the listeners is an array / object
                    listeners = listeners.trim().split(" "); // Trim the spaces from the beginning and end then split each listener into an array item
                }

                if (typeof syiro.component.componentData[componentId] == "undefined"){ // If the Component is not defined in componentData yet (for instance, normal Elements, document, or window)
                    syiro.component.componentData[componentId] = {}; // Define componentId in componentData as an empty Object
                }

                if (typeof syiro.component.componentData[componentId]["handlers"] !== "undefined"){ // If the Component's listeners are already defined
                    syiro.component.componentData[componentId]["handlers"] = syiro.component.componentData[componentId]["handlers"].push(listenerCallback); // Simply add the function to the listeners Array of Functions
                }
                else { //  If the Component's listeners do not exist
                    syiro.component.componentData[componentId]["handlers"] = [listenerCallback]; // Define the handlers key to be the listenerCallback as an array

                    for (var individualListenerIndex in listeners){ // For each listener in the listeners array
                        componentElement.addEventListener(listeners[individualListenerIndex], syiro.events.Handler.bind(this, component)); // Set the Listener / Handler as Syiro's Event Handler, binding to "this" and the Component
                    }
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

    export function Remove(component : any, specificFunc ?: Function) : boolean {
        var allowRemoval : boolean = true; // Set allowRemoval as a boolean, defaulting to true and allowing Listener removal unless specified otherwise.
        var successfulRemoval : boolean = false; // Set successfulRemove as a boolean, defaulting to false unless it was successful
        var componentId : string; // Define componentId as the Id of the Component
        var componentElement : any; // Define componentElement as an Element

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
            if ((componentElement !== undefined) && (componentElement !== null)){
                var componentListeners : any; // Define componentListeners as any (really it is Array<Function> or null)

                if (specificFunc == undefined){ // If we haven't defined a specific function to remove, remove them all
                    componentListeners = null; // Define componentListeners as null, which is what the listeners array will be updated to
                }
                else { // If a specific function is defined
                    componentListeners = syiro.component.componentData[componentId]["handlers"]; // Define componentListeners as the array of functions

                    for (var individualFuncIndex in componentListeners){ // For each individual function in the componentListeners
                        if (componentListeners[individualFuncIndex].toString() == specificFunc.toString()){ // If the stringified forms of both functions match
                            componentListeners = componentListeners.splice(individualFuncIndex, 1); // Remove the specific function from the componentListeners by splicing the array (removing an item based on index and number defined)
                        }
                    }
                }

                if ((componentListeners !== null) && (componentListeners.length !== 0)){ // If the componentListeners has a length (is not null and has a length greater than zero)
                    syiro.component.componentData[componentId]["handlers"] = componentListeners; // Apply the new componentListeners array
                }
                else{ // If the componentListeners is null or does NOT have a length (essentially null)
                    delete syiro.component.componentData[componentId]["handlers"]; // Remove the "listeners" key / val from the componentData for this specific component

                    for (var individualEventListener in syiro.component.componentData[componentId]["listeners"]){ // For each listener the Component / Generic Element is listening to
                        componentElement.removeEventListener(syiro.component.componentData[componentId]["listeners"][individualEventListener], syiro.events.Handler.bind(this, component)); // Remove the event listener
                    }
                }

                successfulRemoval = true; // Return true since we successfully removed event listeners
            }
        }

        return successfulRemoval; // Return whether the removal was successful
    }

    // #endregion

}
