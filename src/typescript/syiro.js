/*
    This is the aggregate of all the Syiro modules into a unified module
*/
/// <reference path="animation.ts" />
/// <reference path="component.ts" />
/// <reference path="data.ts" />
/// <reference path="device.ts" />
/// <reference path="events.ts" />
/// <reference path="generator.ts" />
/// <reference path="navbar.ts" />
/// <reference path="button.ts" />
/// <reference path="dropdown.ts" />
/// <reference path="list.ts" />
/// <reference path="players.ts" />
/// <reference path="render.ts" />
/// <reference path="searchbox.ts" />
/// <reference path="sidepane.ts" />
/// <reference path="toast.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    syiro.backgroundColor;
    syiro.primaryColor;
    syiro.secondaryColor;
    function Init() {
        syiro.device.Detect();
        syiro.events.Add("scroll", document, function () {
            var dropdownButtons = document.querySelectorAll('div[data-syiro-component="button"][data-syiro-component-type="dropdown"][active]');
            for (var dropdownButtonIndex = 0; dropdownButtonIndex < dropdownButtons.length; dropdownButtonIndex++) {
                var thisDropdownButtonObject = syiro.component.FetchComponentObject(dropdownButtons[dropdownButtonIndex]);
                syiro.dropdown.Toggle(thisDropdownButtonObject);
            }
        });
        syiro.events.Add(syiro.events.eventStrings["fullscreenchange"], document, function () {
            var fullscreenVideoPlayerElement;
            if ((typeof document.fullscreenElement !== "undefined") && (document.fullscreenElement !== null)) {
                fullscreenVideoPlayerElement = document.fullscreenElement;
            }
            else if ((typeof document.mozFullScreenElement !== "undefined") && (document.mozFullScreenElement !== null)) {
                fullscreenVideoPlayerElement = document.mozFullScreenElement;
            }
            else if ((typeof document.msFullscreenElement !== "undefined") && (document.msFullscreenElement !== null)) {
                fullscreenVideoPlayerElement = document.msFullscreenElement;
            }
            else if ((typeof document.webkitFullscreenElement !== "undefined") && (document.webkitFullscreenElement !== null)) {
                fullscreenVideoPlayerElement = document.webkitFullscreenElement;
            }
            if ((typeof fullscreenVideoPlayerElement !== "undefined") && (fullscreenVideoPlayerElement !== null)) {
                document.SyiroFullscreenElement = fullscreenVideoPlayerElement;
            }
            else {
                fullscreenVideoPlayerElement = document.SyiroFullscreenElement;
            }
            syiro.render.Scale(syiro.component.FetchComponentObject(fullscreenVideoPlayerElement));
        });
        var documentHeadSection = document.querySelector("head");
        if (documentHeadSection == null) {
            documentHeadSection = document.createElement("head");
            document.querySelector("html").insertBefore(documentHeadSection, document.body);
        }
        if (documentHeadSection.querySelector('meta[http-equiv="X-UA-Compatible"]') == null) {
            var compatMetaTag = syiro.utilities.ElementCreator("meta", { "http-equiv": "X-UA-Compatible", "content-attr": "IE=edge" });
            documentHeadSection.appendChild(compatMetaTag);
        }
        if (documentHeadSection.querySelector('meta[name="viewport"]') == null) {
            var viewportMetaTag = syiro.utilities.ElementCreator("meta", { "name": "viewport", "content-attr": "width=device-width, maximum-scale=1.0, initial-scale=1,user-scalable=no" });
            documentHeadSection.appendChild(viewportMetaTag);
        }
        var syiroInternalColorContainer = syiro.utilities.ElementCreator("div", { "data-syiro-component": "internalColorContainer" });
        document.body.appendChild(syiroInternalColorContainer);
        syiro.backgroundColor = window.getComputedStyle(syiroInternalColorContainer).backgroundColor;
        syiro.primaryColor = window.getComputedStyle(syiroInternalColorContainer).color;
        syiro.secondaryColor = window.getComputedStyle(syiroInternalColorContainer).borderColor;
        document.body.removeChild(syiroInternalColorContainer);
        function ComponentParser(componentElement) {
            // #region Content Overlay Creation Function
            function createContentOverlay(purpose) {
                var contentOverlay = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "overlay", "data-syiro-overlay-purpose": purpose });
                document.body.appendChild(contentOverlay);
                return contentOverlay;
            }
            if ((componentElement.localName !== null) && (componentElement.hasAttribute("data-syiro-component"))) {
                var componentObject = syiro.component.FetchComponentObject(componentElement);
                if (componentObject["type"] == "buttongroup") {
                    var innerButtons = componentElement.querySelectorAll('div[data-syiro-component="button"]');
                    for (var innerButtonIndex = 0; innerButtonIndex < innerButtons.length; innerButtonIndex++) {
                        var buttonComponentObject = syiro.component.FetchComponentObject(innerButtons[innerButtonIndex]);
                        syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle);
                    }
                }
                else if ((componentObject["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "dropdown")) {
                    syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.button.Toggle);
                }
                else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                    syiro.player.Init(componentObject);
                    syiro.render.Scale(componentObject);
                }
                else if (componentObject["type"] == "searchbox") {
                    if (syiro.data.Read(componentObject["id"] + "->suggestions") !== false) {
                        syiro.events.Add("keyup", componentElement.querySelector("input"), syiro.searchbox.Suggestions);
                        syiro.events.Add("blur", componentElement.querySelector("input"), function () {
                            var searchboxObject = arguments[0];
                            var searchboxLinkedList = syiro.component.FetchLinkedListComponentObject(searchboxObject);
                            syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important");
                        }.bind(this, componentObject));
                    }
                }
                else if (componentObject["type"] == "sidepane") {
                    var sidepaneContentOverlayElement = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="sidepane"]');
                    var innerSidepaneEdge = componentElement.querySelector('div[data-syiro-minor-component="sidepane-edge"]');
                    syiro.events.Add(syiro.events.eventStrings["down"], innerSidepaneEdge, syiro.sidepane.GestureInit);
                    if (sidepaneContentOverlayElement == null) {
                        sidepaneContentOverlayElement = createContentOverlay("sidepane");
                        syiro.events.Add(syiro.events.eventStrings["down"], sidepaneContentOverlayElement, function () {
                            syiro.events.Add(syiro.events.eventStrings["up"], arguments[1], function () {
                                syiro.sidepane.Toggle(arguments[0]);
                                syiro.events.Remove(syiro.events.eventStrings["up"], arguments[1]);
                            }.bind(this, arguments[0]));
                        }.bind(this, componentObject));
                    }
                }
                else if (componentObject["type"] == "toast") {
                    var toastContentOverlayElement = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="toast"]');
                    if (toastContentOverlayElement == null)
                        (toastContentOverlayElement = createContentOverlay("toast"));
                }
            }
            if (componentElement.childNodes.length > 0) {
                for (var i = 0; i < componentElement.childNodes.length; i++) {
                    var childNode = componentElement.childNodes[i];
                    ComponentParser(childNode);
                }
            }
            syiro.data.Delete(componentObject["id"] + "->HTMLElement");
        }
    }
    syiro.Init = Init;
    if ((typeof MutationObserver !== "undefined") || (typeof WebKitMutationObserver !== "undefined")) {
        if (typeof WebKitMutationObserver !== "undefined") {
            MutationObserver = WebKitMutationObserver;
        }
        var mutationWatcher = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type == "childList") {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var componentElement = mutation.addedNodes[i];
                        ComponentParser(componentElement);
                    }
                }
            });
        });
        var mutationWatcherOptions = {
            childList: true,
            attributes: true,
            characterData: false,
            attributeFilter: ['data-syiro-component'],
            subtree: true
        };
        mutationWatcher.observe(document.body, mutationWatcherOptions);
    }
    else {
        (function mutationTimer() {
            window.setTimeout(function () {
                for (var componentId in syiro.data.storage) {
                    var componentElement = document.querySelector('div[data-syiro-component-id="' + componentId + '"]');
                    if (componentElement !== null) {
                        ComponentParser(componentElement);
                    }
                }
                mutationTimer();
            }, 3000);
        })();
    }
})(syiro || (syiro = {}));
exports.CSS = syiro.component.CSS;
exports.Fetch = syiro.component.Fetch;
exports.FetchComponentObject = syiro.component.FetchComponentObject;
exports.FetchDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition;
exports.FetchLinkedListComponentObject = syiro.component.FetchLinkedListComponentObject;
exports.IsComponentObject = syiro.component.IsComponentObject;
exports.Add = syiro.component.Add;
exports.Remove = syiro.component.Remove;
exports.Position = syiro.render.Position;
