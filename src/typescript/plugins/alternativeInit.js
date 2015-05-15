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
            function Init() {
                // Use an ol' fashion "timer"
                (function mutationTimer() {
                    window.setTimeout(function () {
                        for (var componentId in syiro.data.storage) {
                            if (potentiallyExistingComponent !== null) {
                                var componentObject = { "id": componentId, "type": (componentId.replace(/[0-9]/g, '')) };
                                if (componentObject["type"] == "buttongroup") {
                                    var potentiallyExistingComponent = document.querySelector('div[data-syiro-component-id="' + componentId + '"]');
                                    var innerButtons = potentiallyExistingComponent.querySelectorAll('div[data-syiro-component="button"]');
                                    for (var innerButtonIndex = 0; innerButtonIndex < innerButtons.length; innerButtonIndex++) {
                                        var buttonComponentObject = syiro.component.FetchComponentObject(innerButtons[innerButtonIndex]);
                                        syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle);
                                    }
                                }
                                else if (componentObject["type"] == "dropdown") {
                                    syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.dropdown.Toggle);
                                }
                                else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                    syiro.player.Init(componentObject);
                                    syiro.component.Scale(componentObject);
                                }
                                else if (componentObject["type"] == "searchbox") {
                                    if (syiro.data.Read(componentObject["id"] + "->suggestions") !== false) {
                                        syiro.events.Add("keyup", componentObject, syiro.searchbox.Suggestions);
                                        syiro.events.Add("blur", componentObject, function () {
                                            var searchboxObject = arguments[0];
                                            var searchboxLinkedList = syiro.component.FetchLinkedListComponentObject(searchboxObject);
                                            syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important");
                                        }.bind(this, componentObject));
                                    }
                                }
                                syiro.data.Delete(componentObject["id"] + "->HTMLElement");
                            }
                        }
                        mutationTimer();
                    }, 3000);
                })();
            }
            alternativeInit.Init = Init;
        })(alternativeInit = plugin.alternativeInit || (plugin.alternativeInit = {}));
    })(plugin = syiro.plugin || (syiro.plugin = {}));
})(syiro || (syiro = {}));
