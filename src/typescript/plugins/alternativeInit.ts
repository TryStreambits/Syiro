/*
    This module is the Component Initialization functionality for IE10 and below, which aren't supported in stock Rocket.
    If you need to support IE10 or below, place the Javascript equivelant of this file BEFORE the main rocket script OR use
    the rocket.plugin.alternativeInit.Wait() function, which will automatically call rocket.Init() when the page is ready.
*/

/// <reference path="rocket-reference.ts" />

module rocket.plugin.alternativeInit {
    // #region Initialization Function

    export function Init(){
        rocket.device.Detect(); // Detect / fetch device information

        // Use an ol' fashion "timer"

        (function mutationTimer(){
            window.setTimeout( // Set interval to 5000 (5 seconds) with a timeout, forcing the execution to happen within 3 seconds
                function(){ // Call this function
                    for (var componentId in rocket.component.storedComponents){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
                        var potentiallyExistingComponent = document.querySelector('*[data-rocket-component-id="' + componentId + '"]');

                        if (potentiallyExistingComponent !== null){ // If the component exists in the DOM
                            var type = potentiallyExistingComponent.getAttribute("data-rocket-component"); // Get the Rocket Component Type
                            var componentObject = { "id" : componentId, "type" : type };

                            if (componentObject["type"] == "dropdown"){ // If the component is a Dropdown
                                rocket.component.AddListeners(rocket.component.listenerStrings["up"], componentObject, rocket.dropdown.Toggle); // Immediately listen to the Dropdown
                            }
                            else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")){ // If the component is an Audio or Video Player Component
                                rocket.player.Init(componentObject); // Initialize the Audio or Video Palyer
                            }

                            delete rocket.component.storedComponents[componentId]; // Ensure the Component in the storedComponents is deleted
                        }
                    }

                    mutationTimer(); // Recursively call setTimeout
                },
                5000
            )
        })();
    }

    // #endregion

}
