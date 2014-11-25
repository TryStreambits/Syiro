var rocket;
(function (rocket) {
    var plugin;
    (function (plugin) {
        var alternativeInit;
        (function (alternativeInit) {
            function Init() {
                (function mutationTimer() {
                    window.setTimeout(function () {
                        for (var componentId in Object.keys(rocket.component.storedComponents)) {
                            var potentiallyExistingComponent = document.querySelector('*[data-rocket-component-id="' + componentId + '"]');
                            if (potentiallyExistingComponent !== null) {
                                var type = potentiallyExistingComponent.getAttribute("data-rocket-component");
                                if (type == "dropdown") {
                                    rocket.component.AddListeners({ "id": componentId, "type": type }, rocket.component.dropdownToggler);
                                }
                                else if ((type == "audio-player") || (type == "video-player")) {
                                    rocket.player.Init({ "id": componentId, "type": type });
                                }
                                delete rocket.component.storedComponents[componentId];
                            }
                        }
                        mutationTimer();
                    }, 5000);
                })();
            }
            alternativeInit.Init = Init;
            function Wait() {
                window.addEventListener("load", function () {
                    rocket.Init();
                });
            }
            alternativeInit.Wait = Wait;
        })(alternativeInit = plugin.alternativeInit || (plugin.alternativeInit = {}));
    })(plugin = rocket.plugin || (rocket.plugin = {}));
})(rocket || (rocket = {}));
