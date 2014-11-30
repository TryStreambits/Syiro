/*
These are interface extensions so Typescript doesn't freak out.
*/
/*
    This module is the Component Initialization functionality for IE10 and below, which aren't supported in stock Rocket.
    If you need to support IE10 or below, place the Javascript equivelant of this file BEFORE the main rocket script OR use
    the rocket.plugin.alternativeInit.Wait() function, which will automatically call rocket.Init() when the page is ready.
*/
/// <reference path="rocket-reference.ts" />
var rocket;
(function (rocket) {
    var plugin;
    (function (plugin) {
        var alternativeInit;
        (function (alternativeInit) {
            // #region Initialization Function
            function Init() {
                rocket.device.Detect(); // Detect / fetch device information
                // Use an ol' fashion "timer"
                (function mutationTimer() {
                    window.setTimeout(function () {
                        for (var componentId in rocket.component.storedComponents) {
                            var potentiallyExistingComponent = document.querySelector('*[data-rocket-component-id="' + componentId + '"]');
                            if (potentiallyExistingComponent !== null) {
                                var type = potentiallyExistingComponent.getAttribute("data-rocket-component"); // Get the Rocket Component Type
                                var componentObject = { "id": componentId, "type": type };
                                if (componentObject["type"] == "dropdown") {
                                    rocket.component.AddListeners(rocket.component.listenerStrings["up"], componentObject, rocket.dropdown.Toggle); // Immediately listen to the Dropdown
                                }
                                else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                    rocket.player.Init(componentObject); // Initialize the Audio or Video Palyer
                                }
                                delete rocket.component.storedComponents[componentId]; // Ensure the Component in the storedComponents is deleted
                            }
                        }
                        mutationTimer(); // Recursively call setTimeout
                    }, 5000);
                })();
            }
            alternativeInit.Init = Init;
        })(alternativeInit = plugin.alternativeInit || (plugin.alternativeInit = {}));
    })(plugin = rocket.plugin || (rocket.plugin = {}));
})(rocket || (rocket = {}));
