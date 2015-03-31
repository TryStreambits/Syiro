var syiro;
(function (syiro) {
    var plugin;
    (function (plugin) {
        var alternativeInit;
        (function (alternativeInit) {
            function Init() {
                syiro.device.Detect();
                (function mutationTimer() {
                    window.setTimeout(function () {
                        for (var componentId in syiro.data.storage) {
                            var potentiallyExistingComponent = document.querySelector('*[data-syiro-component-id="' + componentId + '"]');
                            if (potentiallyExistingComponent !== null) {
                                var componentObject = syiro.component.FetchComponentObject(potentiallyExistingComponent);
                                if (componentObject["type"] == "buttongroup") {
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
                                        syiro.events.Add("keyup", potentiallyExistingComponent.querySelector("input"), syiro.searchbox.Suggestions);
                                        syiro.events.Add("blur", potentiallyExistingComponent.querySelector("input"), function () {
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
                    }, 5000);
                })();
            }
            alternativeInit.Init = Init;
        })(alternativeInit = plugin.alternativeInit || (plugin.alternativeInit = {}));
    })(plugin = syiro.plugin || (syiro.plugin = {}));
})(syiro || (syiro = {}));
