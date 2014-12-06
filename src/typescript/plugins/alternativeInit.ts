/*
    This module is the Component Initialization functionality for IE10 and below, which aren't supported in stock Syiro.
    If you need to support IE10 or below, place the Javascript equivelant of this file BEFORE the main syiro script OR use
    the syiro.plugin.alternativeInit.Wait() function, which will automatically call syiro.Init() when the page is ready.
*/

/// <reference path="syiro-reference.ts" />

module syiro.plugin.alternativeInit {
    // #region Initialization Function

    export function Init(){
        syiro.device.Detect(); // Detect / fetch device information

        // Use an ol' fashion "timer"

        (function mutationTimer(){
            window.setTimeout( // Set interval to 5000 (5 seconds) with a timeout, forcing the execution to happen within 3 seconds
                function(){ // Call this function
                    for (var componentId in syiro.component.componentData){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
                        var potentiallyExistingComponent = document.querySelector('*[data-syiro-component-id="' + componentId + '"]');

                        if (potentiallyExistingComponent !== null){ // If the component exists in the DOM
                            var type = potentiallyExistingComponent.getAttribute("data-syiro-component"); // Get the Syiro Component Type
                            var componentObject = { "id" : componentId, "type" : type };

                            if (componentObject["type"] == "dropdown"){ // If the component is a Dropdown
                                syiro.component.AddListeners(syiro.component.listenerStrings["up"], componentObject, syiro.dropdown.Toggle); // Immediately listen to the Dropdown
                            }
                            else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")){ // If the component is an Audio or Video Player Component
                                syiro.player.Init(componentObject); // Initialize the Audio or Video Palyer
                            }

                            delete syiro.component.componentData[componentId]["HTMLElement"]; // Ensure the Component in the componentData is deleted
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
