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
                                if (componentObject["type"] == "dropdown") {
                                    syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.dropdown.Toggle);
                                }
                                else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                    syiro.player.Init(componentObject);
                                }
                                else if (componentObject["type"] == "searchbox") {
                                    if (syiro.data.Read(componentObject["id"] + "->suggestions") !== false) {
                                        syiro.events.Add("keyup", componentObject, syiro.searchbox.Suggestions);
                                        syiro.events.Add("blur", componentObject, function () {
                                            var searchboxObject = arguments[0];
                                            var searchboxLinkedList = syiro.component.FetchLinkedListComponentObject(searchboxObject);
                                            syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important");
                                        });
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
