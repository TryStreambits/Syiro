/*
These are interface extensions so Typescript doesn't freak out.
*/
/*
    This module is the Component Initialization functionality for IE10 and below, which aren't supported in stock Syiro.
    If you need to support IE10 or below, place the Javascript equivelant of this file BEFORE the main syiro script OR use
    the syiro.plugin.alternativeInit.Wait() function, which will automatically call syiro.Init() when the page is ready.
*/
/// <reference path="syiro-reference.ts" />
var syiro;
(function (syiro) {
    var plugin;
    (function (plugin) {
        var alternativeInit;
        (function (alternativeInit) {
            // #region Initialization Function
            function Init() {
                syiro.device.Detect(); // Detect / fetch device information
                // Use an ol' fashion "timer"
                (function mutationTimer() {
                    window.setTimeout(function () {
                        for (var componentId in syiro.component.componentData) {
                            var potentiallyExistingComponent = document.querySelector('*[data-syiro-component-id="' + componentId + '"]');
                            if (potentiallyExistingComponent !== null) {
                                var type = potentiallyExistingComponent.getAttribute("data-syiro-component"); // Get the Syiro Component Type
                                var componentObject = { "id": componentId, "type": type };
                                if (componentObject["type"] == "dropdown") {
                                    syiro.component.AddListeners(syiro.component.listenerStrings["up"], componentObject, syiro.dropdown.Toggle); // Immediately listen to the Dropdown
                                }
                                else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                    syiro.player.Init(componentObject); // Initialize the Audio or Video Player
                                    syiro.component.Scale(componentObject); // Scale the Audio Player or Video Player
                                }
                                else if (componentObject["type"] == "searchbox") {
                                    if (typeof syiro.component.componentData[componentObject["id"]]["suggestions"] !== "undefined") {
                                        syiro.events.Add("keyup", componentObject, syiro.searchbox.Suggestions); // Add  an event with the Suggestions function to the Searchbox to listen on keyup value
                                        syiro.events.Add("blur", componentObject, function () {
                                            var searchboxObject = arguments[0]; // Define searchboxObject as a Syiro Component Object of the Searchbox
                                            var searchboxLinkedList = syiro.component.FetchLinkedListComponentObject(searchboxObject); // Define searchboxLinkedList as the fetched Linked List Component
                                            syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important"); // Hide the Linked List
                                        });
                                    }
                                }
                                if (typeof syiro.component.componentData[componentObject["id"]] !== "undefined") {
                                    if (typeof syiro.component.componentData[componentObject["id"]]["HTMLElement"] !== "undefined") {
                                        delete syiro.component.componentData[componentObject["id"]]["HTMLElement"]; // Ensure the Component's Element in the componentData is deleted
                                    }
                                }
                            }
                        }
                        mutationTimer(); // Recursively call setTimeout
                    }, 5000);
                })();
            }
            alternativeInit.Init = Init;
        })(alternativeInit = plugin.alternativeInit || (plugin.alternativeInit = {}));
    })(plugin = syiro.plugin || (syiro.plugin = {}));
})(syiro || (syiro = {}));
