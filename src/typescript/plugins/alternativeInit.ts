/*
    This module is the Component Initialization functionality for IE10 and below, which aren't supported in stock Rocket.
    If you need to support IE10 or below, place the Javascript equivelant of this file BEFORE the main rocket script OR use
    the rocket.plugin.alternativeInit.Wait() function, which will automatically call rocket.Init() when the page is ready.
*/

/// <reference path="rocket-reference.ts" />

module rocket.plugin.alternativeInit {
    // #region Initialization Function

    export function Init(){
        // Use an ol' fashion "timer"

        (function mutationTimer(){
            window.setTimeout( // Set interval to 5000 (5 seconds) with a timeout, forcing the execution to happen within 5 seconds
                function(){ // Call this function
                    for (var componentId in Object.keys(rocket.component.storedComponents)){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
                    var potentiallyExistingComponent = document.querySelector('*[data-rocket-component-id="' + componentId + '"]');

                    if (potentiallyExistingComponent !== null){ // If the component exists in the DOM
                        var type = potentiallyExistingComponent.getAttribute("data-rocket-component"); // Get the Rocket Component Type

                        if (type == "dropdown"){ // If the component is a Dropdown
                            rocket.component.AddListeners({"id" : componentId, "type" : type}, rocket.component.dropdownToggler); // Immediately listen to the Dropdown
                        }
                        else if ((type == "audio-player") || (type == "video-player")){ // If the component is an Audio or Video Player Component
                            rocket.player.Init( { "id" : componentId, "type" : type } ); // Initialize the Audio or Video Palyer
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

    // #region Wait Function - Allows rocket.plugin.alternativeInit to ensure it is loaded and ready before the main Rocket framework.

    export function Wait(){
        window.addEventListener("load", // When the document is ready
            function(){
                rocket.Init(); // Initialize Rocket
            }
        );
    }

    // #endregion
}
