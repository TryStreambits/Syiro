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
                                syiro.player.Init(componentObject); // Initialize the Audio or Video Player
                                syiro.component.Scale(componentObject); // Scale the Audio Player or Video Player
                            }
                            else if (componentObject["type"] == "searchbox"){ // If the Component is a Searchbox
                                if (typeof syiro.component.componentData[componentObject["id"]]["suggestions"] !== "undefined"){ // If suggestions is enabled on this Searchbox
                                    syiro.events.Add("keyup", componentObject, syiro.searchbox.Suggestions); // Add  an event with the Suggestions function to the Searchbox to listen on keyup value
                                    syiro.events.Add("blur", componentObject, // Add an event to the Searchbox to listen to when it loses focus
                                        function(){
                                            var searchboxObject : Object = arguments[0]; // Define searchboxObject as a Syiro Component Object of the Searchbox
                                            var searchboxLinkedList : Object = syiro.component.FetchLinkedListComponentObject(searchboxObject); // Define searchboxLinkedList as the fetched Linked List Component
                                            syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important"); // Hide the Linked List
                                        }
                                    );
                                }
                            }

                            if (typeof syiro.component.componentData[componentObject["id"]] !== "undefined"){
                                if (typeof syiro.component.componentData[componentObject["id"]]["HTMLElement"] !== "undefined"){
                                    delete syiro.component.componentData[componentObject["id"]]["HTMLElement"]; // Ensure the Component's Element in the componentData is deleted
                                }
                            }
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
