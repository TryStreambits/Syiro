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
                        for (var componentId in syiro.component.storedComponents) {
                            var potentiallyExistingComponent = document.querySelector('*[data-syiro-component-id="' + componentId + '"]');
                            if (potentiallyExistingComponent !== null) {
                                var type = potentiallyExistingComponent.getAttribute("data-syiro-component");
                                var componentObject = { "id": componentId, "type": type };
                                if (componentObject["type"] == "dropdown") {
                                    syiro.component.AddListeners(syiro.component.listenerStrings["up"], componentObject, syiro.dropdown.Toggle);
                                }
                                else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                    syiro.player.Init(componentObject);
                                }
                                delete syiro.component.storedComponents[componentId];
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
