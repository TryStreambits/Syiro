var syiro;
(function (syiro) {
    var animation;
    (function (_animation) {
        function Animate(component, animation, postAnimationFunction) {
            var componentElement = syiro.component.Fetch(component);
            if (componentElement !== null) {
                var elementTimeoutId = window.setTimeout(function () {
                    var component = arguments[0];
                    var componentElement = syiro.component.Fetch(component);
                    var postAnimationFunction = arguments[1];
                    var timeoutId = componentElement.getAttribute("data-syiro-animationTimeout-id");
                    componentElement.removeAttribute("data-syiro-animationTimeout-id");
                    window.clearTimeout(Number(timeoutId));
                    postAnimationFunction(component);
                }.bind(syiro, component, postAnimationFunction), 250);
                componentElement.setAttribute("data-syiro-animationTimeout-id", elementTimeoutId.toString());
                if (component["type"] == "dropdown") {
                    var tempElement = componentElement;
                    componentElement = tempElement.querySelector('div[data-syiro-component="list"]');
                }
                else if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                    var tempElement = componentElement;
                    componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]');
                }
                componentElement.setAttribute("class", animation);
            }
        }
        _animation.Animate = Animate;
        function FadeIn(component, postAnimationFunction) {
            syiro.animation.Animate(component, "fade-in-animation", postAnimationFunction);
        }
        _animation.FadeIn = FadeIn;
        function FadeOut(component, postAnimationFunction) {
            syiro.animation.Animate(component, "fade-out-animation", postAnimationFunction);
        }
        _animation.FadeOut = FadeOut;
    })(animation = syiro.animation || (syiro.animation = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var component;
    (function (_component) {
        _component.componentData = {};
        function Define(type, selector) {
            var component = {};
            var componentId;
            component["type"] = type;
            var selectedElement = document.querySelector(selector);
            if (selectedElement.hasAttribute("data-syiro-component-id") == false) {
                componentId = syiro.generator.IdGen(type);
                selectedElement.setAttribute("data-syiro-component-id", componentId);
            }
            else {
                componentId = selectedElement.getAttribute("data-syiro-component-id");
            }
            component["id"] = componentId;
            if (type == "dropdown") {
                syiro.events.Add(syiro.events.eventStrings["press"], component, syiro.dropdown.Toggle);
            }
            return component;
        }
        _component.Define = Define;
        function CSS(component, property, newValue) {
            var modifiableElement;
            var returnedValue;
            var modifiedStyling = false;
            if (typeof component.hasAttribute == "undefined") {
                modifiableElement = syiro.component.Fetch(component);
            }
            else {
                modifiableElement = component;
            }
            if (modifiableElement !== null) {
                var currentElementStyling = modifiableElement.getAttribute("style");
                var elementStylingObject = {};
                if (currentElementStyling !== null) {
                    var currentElementStylingArray = currentElementStyling.split(";");
                    for (var styleKey in currentElementStylingArray) {
                        var cssPropertyValue = currentElementStylingArray[styleKey];
                        if (cssPropertyValue !== "") {
                            var propertyValueArray = cssPropertyValue.split(":");
                            elementStylingObject[propertyValueArray[0].trim()] = propertyValueArray[1].trim();
                        }
                    }
                }
                var stylePropertyValue = elementStylingObject[property];
                if (newValue == undefined) {
                    if (stylePropertyValue !== undefined) {
                        returnedValue = stylePropertyValue;
                    }
                    else {
                        returnedValue = false;
                    }
                }
                else if (typeof newValue == "string") {
                    elementStylingObject[property] = newValue;
                    modifiedStyling = true;
                    returnedValue = newValue;
                }
                else {
                    if (stylePropertyValue !== undefined) {
                        elementStylingObject[property] = null;
                        modifiedStyling = true;
                    }
                }
                if (modifiedStyling == true) {
                    var updatedCSSStyle = "";
                    for (var cssProperty in elementStylingObject) {
                        if (elementStylingObject[cssProperty] !== null) {
                            updatedCSSStyle = updatedCSSStyle + cssProperty + ": " + elementStylingObject[cssProperty] + ";";
                        }
                    }
                    if (updatedCSSStyle.length !== 0) {
                        modifiableElement.setAttribute("style", updatedCSSStyle);
                    }
                    else {
                        modifiableElement.removeAttribute("style");
                    }
                }
            }
            else {
                returnedValue = false;
            }
            return returnedValue;
        }
        _component.CSS = CSS;
        function Fetch(component) {
            var componentElement;
            if (syiro.component.componentData[component["id"]]["HTMLElement"] !== undefined) {
                componentElement = syiro.component.componentData[component["id"]]["HTMLElement"];
            }
            else {
                componentElement = document.querySelector('*[data-syiro-component-id="' + component["id"] + '"]');
            }
            return componentElement;
        }
        _component.Fetch = Fetch;
        function FetchComponentObject(componentElement) {
            if (componentElement.hasAttribute("data-syiro-component")) {
                return { "id": componentElement.getAttribute("data-syiro-component-id"), "type": componentElement.getAttribute("data-syiro-component") };
            }
            else {
                return false;
            }
        }
        _component.FetchComponentObject = FetchComponentObject;
        function FetchDimensionsAndPosition(component) {
            var dimensionsAndPosition = {};
            var componentElement;
            if (component["type"] !== undefined) {
                componentElement = syiro.component.Fetch(component);
            }
            else {
                componentElement = component;
            }
            dimensionsAndPosition["x"] = componentElement.offsetLeft;
            dimensionsAndPosition["y"] = componentElement.offsetTop;
            dimensionsAndPosition["height"] = componentElement.offsetHeight;
            dimensionsAndPosition["width"] = componentElement.offsetWidth;
            return dimensionsAndPosition;
        }
        _component.FetchDimensionsAndPosition = FetchDimensionsAndPosition;
        function Update(componentId, componentElement) {
            if (syiro.component.componentData[componentId]["HTMLElement"] !== undefined) {
                syiro.component.componentData[componentId]["HTMLElement"] = componentElement;
            }
        }
        _component.Update = Update;
        function Add(append, parentComponent, childComponent) {
            var parentElement = syiro.component.Fetch(parentComponent);
            var childComponentId;
            var childComponentType = (typeof childComponent).toLowerCase();
            var childElement = syiro.component.Fetch(childComponent);
            var allowAdding = false;
            if (childComponentType == "object") {
                childComponentId = childComponent["id"];
                if (parentComponent["type"] == "header" && ((childComponent["type"] == "dropdown") || (childComponent["type"] == "searchbox"))) {
                    childElement = syiro.component.Fetch(childComponent);
                    allowAdding = true;
                }
                else if (childComponent["type"] == "list-item") {
                    if (parentComponent["type"] == "dropdown") {
                        parentComponent = syiro.dropdown.FetchLinkedListComponentObject(parentComponent);
                        parentElement = syiro.component.Fetch(parentComponent);
                    }
                    if (parentComponent["type"] == "list") {
                        allowAdding = true;
                    }
                }
                else if (childComponent["link"] !== undefined) {
                    childElement = syiro.generator.ElementCreator("a", {
                        "title": childComponent["title"],
                        "href": childComponent["link"],
                        "content": childComponent["title"]
                    });
                    allowAdding = true;
                }
                else {
                    childElement = syiro.component.Fetch(childComponent);
                    allowAdding = true;
                }
            }
            else if (childComponentType.indexOf("element") > -1) {
                childElement = childComponent;
                allowAdding = true;
            }
            if ((allowAdding == true) && (parentElement !== null) && (childElement !== null)) {
                if (append == false) {
                    parentElement.insertBefore(childElement, parentElement.firstChild);
                }
                else {
                    parentElement.appendChild(childElement);
                }
            }
            else {
                allowAdding = false;
            }
            syiro.component.Update(parentComponent["id"], parentElement);
            return allowAdding;
        }
        _component.Add = Add;
        function Remove(componentsToRemove) {
            var allowRemoval = false;
            var componentList;
            if (componentsToRemove["id"] !== undefined) {
                allowRemoval = true;
                componentList = [componentsToRemove];
            }
            else if ((typeof componentsToRemove == "object") && (componentsToRemove.length > 0)) {
                allowRemoval = true;
                componentList = componentsToRemove;
            }
            if (allowRemoval == true) {
                for (var individualComponentIndex in componentList) {
                    var individualComponent = componentList[individualComponentIndex];
                    var individualComponentElement = syiro.component.Fetch(individualComponent);
                    if (individualComponentElement !== null) {
                        if (syiro.component.componentData[individualComponent["id"]]["HTMLElement"] == undefined) {
                            var parentElement = individualComponentElement.parentElement;
                            parentElement.removeChild(individualComponentElement);
                        }
                        else {
                            delete syiro.component.componentData[individualComponent["id"]]["HTMLElement"];
                        }
                    }
                }
            }
            return allowRemoval;
        }
        _component.Remove = Remove;
    })(component = syiro.component || (syiro.component = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var device;
    (function (device) {
        device.DoNotTrack;
        device.HasCryptography = true;
        device.HasGeolocation = true;
        device.HasIndexedDB = true;
        device.HasLocalStorage = true;
        device.IsOnline = true;
        device.IsSubHD;
        device.IsHD;
        device.IsFullHDOrAbove;
        function Detect() {
            if (navigator.doNotTrack !== undefined) {
                syiro.device.DoNotTrack = Boolean(navigator.doNotTrack);
            }
            else {
                syiro.device.DoNotTrack = true;
            }
            if (window.crypto == undefined) {
                syiro.device.HasCryptography = false;
            }
            if (navigator.geolocation == undefined) {
                syiro.device.HasGeolocation = false;
            }
            if (window.indexedDB == undefined) {
                syiro.device.HasIndexedDB = false;
            }
            if (window.localStorage == undefined) {
                syiro.device.HasLocalStorage = false;
            }
            if (navigator.onLine !== undefined) {
                syiro.device.IsOnline = navigator.onLine;
                syiro.events.Add("online", document, function () {
                    syiro.device.IsOnline = true;
                });
                syiro.events.Add("offline", document, function () {
                    syiro.device.IsOnline = false;
                });
            }
            syiro.device.FetchScreenDetails();
            syiro.events.Add("resize", window, syiro.device.FetchScreenDetails);
        }
        device.Detect = Detect;
        function FetchScreenDetails() {
            if (window.screen.height < 720) {
                syiro.device.IsSubHD = true;
                syiro.device.IsHD = false;
                syiro.device.IsFullHDOrAbove = false;
            }
            else {
                if (((window.screen.height >= 720) && (window.screen.height < 1080)) && (window.screen.width >= 1280)) {
                    syiro.device.IsSubHD = false;
                    syiro.device.IsHD = true;
                    syiro.device.IsFullHDOrAbove = false;
                }
                else if ((window.screen.height >= 1080) && (window.screen.width >= 1920)) {
                    syiro.device.IsSubHD = false;
                    syiro.device.IsHD = true;
                    syiro.device.IsFullHDOrAbove = true;
                }
            }
        }
        device.FetchScreenDetails = FetchScreenDetails;
    })(device = syiro.device || (syiro.device = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var events;
    (function (events) {
        events.eventStrings = {
            "down": ["mousedown", "touchstart", "MSPointerDown"],
            "up": ["mouseup", "touchend", "MSPointerUp"],
            "press": ["click"]
        };
        function Handler() {
            var component = arguments[0];
            var eventData = arguments[1];
            var componentId;
            var passableValue = null;
            if ((typeof component.nodeType == "undefined") && (component !== window)) {
                componentId = component["id"];
                var componentElement = syiro.component.Fetch(component);
                if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                    var animationString;
                    if (componentElement.hasAttribute("data-syiro-component-status") == false) {
                        animationString = "toggle-forward-animation";
                        passableValue = true;
                    }
                    else {
                        animationString = "toggle-backward-animation";
                        passableValue = false;
                    }
                    syiro.animation.Animate(component, animationString, function (component) {
                        var buttonElement = syiro.component.Fetch(component);
                        if (buttonElement.hasAttribute("data-syiro-component-status") == false) {
                            buttonElement.setAttribute("data-syiro-component-status", "true");
                        }
                        else {
                            buttonElement.removeAttribute("data-syiro-component-status");
                        }
                    });
                }
                else if (component["type"] == "searchbox") {
                    passableValue = componentElement.value;
                }
            }
            else if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1) || (component == document) || (component == window)) {
                if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)) {
                    if (component.hasAttribute("data-syiro-component-id")) {
                        componentId = component.getAttribute("data-syiro-component-id");
                    }
                    else {
                        if (component.hasAttribute("id")) {
                            componentId = component.getAttribute("id");
                        }
                        else {
                            componentId = syiro.generator.IdGen(component.tagName.toLowerCase());
                        }
                        component.setAttribute("data-syiro-component-id", componentId);
                    }
                }
                else if (component == document) {
                    componentId = "document";
                }
                else if (component == window) {
                    componentId = "window";
                }
                componentElement = component;
            }
            if (passableValue == null) {
                passableValue = eventData;
            }
            var listener = (eventData.type).toLowerCase().replace("on", "");
            for (var individualFunctionId in syiro.component.componentData[componentId]["handlers"][listener]) {
                syiro.component.componentData[componentId]["handlers"][listener][individualFunctionId].call(syiro, component, passableValue);
            }
        }
        events.Handler = Handler;
        function Add() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var allowListening = true;
            var componentId;
            var listeners;
            var component;
            var listenerCallback;
            if ((args.length == 2) || (args.length == 3)) {
                if (args.length == 2) {
                    component = args[0];
                    listenerCallback = args[1];
                    if (component["type"] !== "searchbox") {
                        listeners = syiro.events.eventStrings["press"];
                    }
                    else {
                        listeners = ["keyup"];
                    }
                }
                else {
                    listeners = args[0];
                    component = args[1];
                    listenerCallback = args[2];
                }
                var componentElement;
                if ((typeof component.nodeType == "undefined") && (component !== window)) {
                    componentId = component["id"];
                    componentElement = syiro.component.Fetch(component);
                    if (component["type"] == "list-item") {
                        if (componentElement.querySelector("div") !== null) {
                            allowListening = false;
                        }
                    }
                }
                else if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1) || (component == document) || (component == window)) {
                    if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)) {
                        if (component.hasAttribute("data-syiro-component-id")) {
                            componentId = component.getAttribute("data-syiro-component-id");
                        }
                        else {
                            if (component.hasAttribute("id")) {
                                componentId = component.getAttribute("id");
                            }
                            else {
                                componentId = syiro.generator.IdGen(component.tagName.toLowerCase());
                            }
                            component.setAttribute("data-syiro-component-id", componentId);
                        }
                    }
                    else if (component == document) {
                        componentId = "document";
                    }
                    else if (component == window) {
                        componentId = "window";
                    }
                    componentElement = component;
                }
                else {
                    allowListening = false;
                }
                if (allowListening == true) {
                    if ((typeof listeners).toLowerCase() == "string") {
                        listeners = listeners.trim().split(" ");
                    }
                    if (typeof syiro.component.componentData[componentId] == "undefined") {
                        syiro.component.componentData[componentId] = {};
                    }
                    if (typeof syiro.component.componentData[componentId]["handlers"] == "undefined") {
                        syiro.component.componentData[componentId]["handlers"] = {};
                    }
                    for (var individualListenerIndex in listeners) {
                        var listener = listeners[individualListenerIndex];
                        if (typeof syiro.component.componentData[componentId]["handlers"][listener] == "undefined") {
                            syiro.component.componentData[componentId]["handlers"][listener] = [];
                            componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component));
                        }
                        syiro.component.componentData[componentId]["handlers"][listener].push(listenerCallback);
                    }
                }
            }
            else {
                allowListening = false;
            }
            return allowListening;
        }
        events.Add = Add;
        function Remove() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var allowRemoval = true;
            var successfulRemoval = false;
            var listeners;
            var component;
            var componentId;
            var componentElement;
            var specFunc;
            if (args.length < 4) {
                if ((typeof args[0] == "string") || ((typeof args[0] == "object") && (typeof args[0]["id"] == "undefined"))) {
                    listeners = args[0];
                    if (typeof listeners == "string") {
                        listeners = listeners.trim().split(" ");
                    }
                    component = args[1];
                }
                else if (typeof args[0]["id"] !== "undefined") {
                    component = args[0];
                }
                if (((args.length == 2) && (typeof args[1] == "function")) || ((args.length == 3) && (typeof args[2] == "function"))) {
                    specFunc = args[(args.length - 1)];
                }
                if ((typeof component.nodeType == "undefined") && (component !== window)) {
                    componentId = component["id"];
                    componentElement = syiro.component.Fetch(component);
                    if (componentElement !== null) {
                        if (component["type"] == "list-item") {
                            if (componentElement.querySelector('div[data-syiro-component="button"]') !== null) {
                                allowRemoval = false;
                            }
                        }
                    }
                }
                else if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)) {
                    componentId = component.getAttribute("data-syiro-component-id");
                    componentElement = component;
                }
                else if (component == document) {
                    componentId = "document";
                    componentElement = component;
                }
                else if (component == window) {
                    componentId = "window";
                    componentElement = component;
                }
                else {
                    allowRemoval = false;
                }
                if (allowRemoval == true) {
                    if (typeof listeners == "undefined") {
                        listeners = Object.keys(syiro.component.componentData[componentId]["handlers"]);
                    }
                    if ((componentElement !== undefined) && (componentElement !== null)) {
                        for (var individualListenerIndex in listeners) {
                            var listener = listeners[individualListenerIndex];
                            var componentListeners = null;
                            if (typeof specFunc == "function") {
                                componentListeners = syiro.component.componentData[componentId]["handlers"][listener];
                                for (var individualFuncIndex in componentListeners) {
                                    if (componentListeners[individualFuncIndex].toString() == specFunc.toString()) {
                                        componentListeners.splice(individualFuncIndex, 1);
                                    }
                                }
                            }
                            if ((componentListeners == null) || (componentListeners.length == 0)) {
                                delete syiro.component.componentData[componentId]["handlers"][listener];
                                componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component));
                            }
                        }
                        successfulRemoval = true;
                    }
                }
            }
            return successfulRemoval;
        }
        events.Remove = Remove;
    })(events = syiro.events || (syiro.events = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var generator;
    (function (generator) {
        generator.lastUniqueIds = {};
        function IdGen(type) {
            var lastUniqueIdOfType;
            if (syiro.generator.lastUniqueIds[type] == undefined) {
                lastUniqueIdOfType = 0;
            }
            else {
                lastUniqueIdOfType = syiro.generator.lastUniqueIds[type];
            }
            var newUniqueIdOfType = lastUniqueIdOfType + 1;
            syiro.generator.lastUniqueIds[type] = newUniqueIdOfType;
            return (type + newUniqueIdOfType.toString());
        }
        generator.IdGen = IdGen;
        function ElementCreator() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var attributes;
            var generatedElement;
            if (((args.length == 2) && (typeof args[1] == "string")) || (args.length == 3)) {
                var componentId = args[0];
                var componentType = args[1];
                attributes = args[2];
                if ((componentType == "header") || (componentType == "footer")) {
                    generatedElement = document.createElement(componentType);
                }
                else if (componentType == "searchbox") {
                    generatedElement = document.createElement("input");
                    generatedElement.setAttribute("type", "text");
                }
                else {
                    generatedElement = document.createElement("div");
                }
                generatedElement.setAttribute("data-syiro-component-id", componentId);
                generatedElement.setAttribute("data-syiro-component", componentType);
            }
            else {
                attributes = args[1];
                generatedElement = document.createElement(args[0]);
            }
            if (attributes !== undefined) {
                for (var attributeKey in attributes) {
                    var attributeValue = attributes[attributeKey];
                    if (attributeKey !== "content") {
                        if (attributeKey == "content-attr") {
                            attributeKey = "content";
                        }
                        generatedElement.setAttribute(attributeKey, attributeValue);
                    }
                    else {
                        var innerComponentContent = attributeValue;
                        innerComponentContent = innerComponentContent.replace("<", "");
                        innerComponentContent = innerComponentContent.replace(">", "");
                        innerComponentContent = innerComponentContent.replace("&lt;", "");
                        innerComponentContent = innerComponentContent.replace("&gt;", "");
                        generatedElement.textContent = innerComponentContent;
                    }
                }
            }
            return generatedElement;
        }
        generator.ElementCreator = ElementCreator;
    })(generator = syiro.generator || (syiro.generator = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var header;
    (function (header) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("header");
            var componentElement = syiro.generator.ElementCreator(componentId, "header");
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var individualItem in properties["items"]) {
                        if (properties["items"][individualItem]["type"] == "dropdown") {
                            var dropdownComponent = properties["items"][individualItem]["component"];
                            componentElement.appendChild(syiro.component.Fetch(dropdownComponent));
                        }
                        else if (properties["items"][individualItem]["type"] == "link") {
                            var generatedElement = syiro.generator.ElementCreator("a", {
                                "href": properties["items"][individualItem]["link"],
                                "content": properties["items"][individualItem]["content"]
                            });
                            componentElement.appendChild(generatedElement);
                        }
                    }
                }
                else if (propertyKey == "logo") {
                    var generatedElement = syiro.generator.ElementCreator("img", {
                        "data-syiro-minor-component": "logo",
                        "src": properties["logo"]
                    });
                    componentElement.appendChild(generatedElement);
                }
            }
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "header" };
        }
        header.Generate = Generate;
        function SetLogo(component, image) {
            var headerElement = syiro.component.Fetch(component);
            var imageElement = headerElement.querySelector('img[data-syiro-minor-component="logo"]');
            if (imageElement == null) {
                imageElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component": "logo", "src": image });
                headerElement.insertBefore(imageElement, headerElement.firstChild);
            }
            else {
                imageElement.setAttribute("src", image);
            }
            syiro.component.Update(component["id"], headerElement);
        }
        header.SetLogo = SetLogo;
        function RemoveLogo(component) {
            var headerElement = syiro.component.Fetch(component);
            if (headerElement.querySelectorAll('img[data-syiro-minor-component="logo"]').length > 0) {
                headerElement.removeChild(headerElement.firstChild);
                syiro.component.Update(component["id"], headerElement);
            }
        }
        header.RemoveLogo = RemoveLogo;
    })(header = syiro.header || (syiro.header = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var footer;
    (function (footer) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("footer");
            var componentElement = syiro.generator.ElementCreator(componentId, "footer");
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var individualItem in properties["items"]) {
                        if (properties["items"][individualItem]["type"] == "link") {
                            var generatedElement = syiro.generator.ElementCreator("a", {
                                "href": properties["items"][individualItem]["link"],
                                "content": properties["items"][individualItem]["content"]
                            });
                            componentElement.appendChild(generatedElement);
                        }
                    }
                }
                else if (propertyKey == "content") {
                    var generatedElement = syiro.generator.ElementCreator("label", { "content": properties["content"] });
                    componentElement.insertBefore(generatedElement, componentElement.firstChild);
                }
            }
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "footer" };
        }
        footer.Generate = Generate;
        function SetLabel(component, labelText) {
            if (component !== undefined) {
                if (labelText !== undefined) {
                    var parentElement = syiro.component.Fetch(component);
                    var labelComponent = document.querySelector("pre");
                    if (labelComponent == null) {
                        labelComponent = syiro.generator.ElementCreator("pre", { "content": labelText });
                        parentElement.insertBefore(labelComponent, parentElement.firstChild);
                    }
                    else {
                        labelComponent.textContent = labelText;
                    }
                    syiro.component.Update(component["id"], parentElement);
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        footer.SetLabel = SetLabel;
        function AddLink(prepend, component, linkProperties) {
            var componentAddingSucceeded;
            if (typeof linkProperties == "Object") {
                if ((linkProperties["title"] !== undefined) && (linkProperties["link"] !== undefined)) {
                    componentAddingSucceeded = syiro.component.Add(prepend, component, linkProperties);
                }
                else {
                    componentAddingSucceeded = false;
                }
            }
            else {
                componentAddingSucceeded = false;
            }
            return componentAddingSucceeded;
        }
        footer.AddLink = AddLink;
        function RemoveLink(component, linkProperties) {
            var componentRemovingSucceed;
            var footerElement = syiro.component.Fetch(component);
            var potentialLinkElement = footerElement.querySelector('a[href="' + linkProperties["link"] + '"][title="' + linkProperties["title"] + '"]');
            if (potentialLinkElement !== null) {
                footerElement.removeChild(potentialLinkElement);
                syiro.component.Update(component["id"], footerElement);
                componentRemovingSucceed = true;
            }
            else {
                componentRemovingSucceed = false;
            }
            return componentRemovingSucceed;
        }
        footer.RemoveLink = RemoveLink;
    })(footer = syiro.footer || (syiro.footer = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var button;
    (function (button) {
        function Generate(properties) {
            if (properties["type"] == undefined) {
                properties["type"] = "basic";
            }
            var componentId = syiro.generator.IdGen("button");
            var componentElement = syiro.generator.ElementCreator(componentId, "button", {
                "data-syiro-component-type": properties["type"]
            });
            for (var propertyKey in properties) {
                if ((propertyKey == "icon") && (properties["type"] == "basic")) {
                    syiro.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")");
                }
                else if (propertyKey == "content") {
                    componentElement.textContent = properties["content"];
                }
                else if ((propertyKey == "type") && (properties["type"] == "toggle")) {
                    var buttonToggleAttributes = { "data-syiro-minor-component": "buttonToggle" };
                    if (properties["default"] == true) {
                        buttonToggleAttributes["data-syiro-component-status"] = "true";
                    }
                    var buttonToggle = syiro.generator.ElementCreator("div", buttonToggleAttributes);
                    componentElement.appendChild(buttonToggle);
                }
                else {
                    componentElement.setAttribute(propertyKey, properties[propertyKey]);
                }
            }
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "button" };
        }
        button.Generate = Generate;
        function SetLabel(component, content) {
            var setSucceeded;
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") == "basic")) {
                componentElement.textContent = content;
                syiro.component.Update(component["id"], componentElement);
                setSucceeded = true;
            }
            else {
                setSucceeded = false;
            }
            return setSucceeded;
        }
        button.SetLabel = SetLabel;
    })(button = syiro.button || (syiro.button = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var list;
    (function (list) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("list");
            var componentElement = syiro.generator.ElementCreator(componentId, "list");
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var individualItemIndex in properties["items"]) {
                        var individualItem = properties["items"][individualItemIndex];
                        if (individualItem["type"] !== "list-item") {
                            individualItem = syiro.listitem.Generate(individualItem);
                        }
                        componentElement.appendChild(syiro.component.Fetch(individualItem));
                    }
                }
            }
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "list" };
        }
        list.Generate = Generate;
        list.AddItem = syiro.component.Add;
        list.RemoveItem = syiro.component.Remove;
    })(list = syiro.list || (syiro.list = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var listitem;
    (function (listitem) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("list-item");
            var componentElement = syiro.generator.ElementCreator(componentId, "list-item");
            for (var propertyKey in properties) {
                if (propertyKey == "control") {
                    if (properties["image"] == undefined) {
                        var controlComponentObject = properties[propertyKey];
                        if (controlComponentObject["type"] == "button") {
                            var controlComponentElement = syiro.component.Fetch(controlComponentObject);
                            componentElement.appendChild(controlComponentElement);
                        }
                    }
                }
                else if (propertyKey == "image") {
                    if (properties["control"] == undefined) {
                        var imageComponent = syiro.generator.ElementCreator("img", { "src": properties["image"] });
                        componentElement.insertBefore(imageComponent, componentElement.firstChild);
                    }
                }
                else if (propertyKey == "label") {
                    var labelComponent = syiro.generator.ElementCreator("label", { "content": properties["label"] });
                    if (componentElement.querySelector("img") == null) {
                        componentElement.insertBefore(labelComponent, componentElement.firstChild);
                    }
                    else {
                        componentElement.appendChild(labelComponent);
                    }
                }
            }
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "list-item" };
        }
        listitem.Generate = Generate;
        function SetControl(component, control) {
            var setControlSucceeded = false;
            if (component["type"] == "list-item") {
                var listItemElement = syiro.component.Fetch(component);
                if (typeof control == "object") {
                    if (listItemElement.querySelector("div") !== null) {
                        listItemElement.removeChild(listItemElement.querySelector("div"));
                    }
                    if (control["type"] == "button") {
                        var innerControlElement = syiro.component.Fetch(control);
                        if (innerControlElement !== null) {
                            listItemElement.appendChild(innerControlElement);
                            syiro.events.Remove(component);
                            syiro.component.Update(component["id"], listItemElement);
                            setControlSucceeded = true;
                        }
                    }
                }
            }
            return setControlSucceeded;
        }
        listitem.SetControl = SetControl;
        function SetImage(component, content) {
            var setImageSucceeded = false;
            if (component["type"] == "list-item") {
                var listItemElement = syiro.component.Fetch(component);
                if (typeof content == "string") {
                    var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]');
                    if (listItemControl !== null) {
                        var generatedImage = syiro.generator.ElementCreator("img", { "src": content });
                        listItemElement.removeChild(listItemControl);
                        listItemElement.insertBefore(generatedImage, listItemElement.firstChild);
                        setImageSucceeded = true;
                    }
                }
            }
            return setImageSucceeded;
        }
        listitem.SetImage = SetImage;
        function SetLabel(component, content) {
            var setLabelSucceeded = false;
            if (component["type"] == "list-item") {
                var listItemElement = syiro.component.Fetch(component);
                if (typeof content == "string") {
                    var listItemLabelElement;
                    if (listItemElement.querySelector("label") !== null) {
                        listItemLabelElement = listItemElement.querySelector("label");
                    }
                    else {
                        listItemLabelElement = syiro.generator.ElementCreator("label");
                        listItemElement.insertBefore(listItemLabelElement, listItemElement.firstChild);
                    }
                    listItemLabelElement.textContent = content;
                    setLabelSucceeded = true;
                }
            }
            return setLabelSucceeded;
        }
        listitem.SetLabel = SetLabel;
    })(listitem = syiro.listitem || (syiro.listitem = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var dropdown;
    (function (dropdown) {
        function Generate(properties) {
            if ((properties["items"] !== undefined) || (properties["list"] !== undefined)) {
                var componentId = syiro.generator.IdGen("dropdown");
                var componentElement = syiro.generator.ElementCreator(componentId, "dropdown");
                if (properties["image"] !== undefined) {
                    var primaryImage = syiro.generator.ElementCreator("img", { "src": properties["image"] });
                    componentElement.appendChild(primaryImage);
                }
                if (properties["label"] !== undefined) {
                    var dropdownLabelText = syiro.generator.ElementCreator("label", { "content": properties["label"] });
                    componentElement.appendChild(dropdownLabelText);
                }
                if (properties["icon"] !== undefined) {
                    syiro.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")");
                }
                var listComponent;
                if (properties["items"] !== undefined) {
                    listComponent = syiro.list.Generate({ "items": properties["items"] });
                }
                else {
                    listComponent = properties["list"];
                }
                var listComponentElement = syiro.component.Fetch(listComponent);
                document.querySelector("body").appendChild(listComponentElement);
                listComponentElement.setAttribute("data-syiro-component-owner", componentId);
                if (properties["position"] == undefined) {
                    properties["position"] = { "vertical": "below", "horizontal": "center" };
                }
                listComponentElement.setAttribute("data-syiro-component-render", properties["position"]["vertical"] + "-" + properties["position"]["horizontal"]);
                syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
                return { "id": componentId, "type": "dropdown" };
            }
            else {
                return false;
            }
        }
        dropdown.Generate = Generate;
        function Toggle(component) {
            var component = arguments[0];
            var componentElement = syiro.component.Fetch(component);
            var linkedListComponentObject = syiro.dropdown.FetchLinkedListComponentObject(component);
            var linkedListComponentElement = syiro.component.Fetch(linkedListComponentObject);
            var currentIcon = syiro.component.CSS(component, "background-image");
            if (syiro.component.CSS(linkedListComponentElement, "visibility") !== false) {
                if (currentIcon !== false) {
                    syiro.component.CSS(component, "background-image", currentIcon.replace("-inverted", ""));
                }
                componentElement.removeAttribute("active");
                syiro.component.CSS(linkedListComponentElement, "visibility", false);
            }
            else {
                var positionInformation = linkedListComponentElement.getAttribute("data-syiro-component-render").split("-");
                var listToDropdownVerticalRelation = positionInformation[0];
                var listToDropdownHorizontalRelation = positionInformation[1];
                var dropdownDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition(componentElement);
                var listDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition(linkedListComponentElement);
                var dropdownHeight = dropdownDimensionsAndPosition["height"];
                var dropdownWidth = dropdownDimensionsAndPosition["width"];
                var dropdownVerticalPosition = dropdownDimensionsAndPosition["y"];
                var dropdownHorizontalPosition = dropdownDimensionsAndPosition["x"];
                var listHeight = listDimensionsAndPosition["height"];
                var listWidth = listDimensionsAndPosition["width"];
                var listVerticalPosition;
                var listHorizontalPosition;
                if (listToDropdownVerticalRelation == "above") {
                    if ((dropdownVerticalPosition == 0) || (dropdownVerticalPosition - listHeight < 0)) {
                        listVerticalPosition = dropdownHeight;
                    }
                    else {
                        listVerticalPosition = (dropdownVerticalPosition - listHeight);
                    }
                }
                else {
                    if ((dropdownVerticalPosition == (window.screen.height - dropdownHeight)) || ((dropdownVerticalPosition + listHeight) > window.screen.height)) {
                        listVerticalPosition = (dropdownVerticalPosition - listHeight);
                    }
                    else {
                        listVerticalPosition = (dropdownVerticalPosition + dropdownHeight);
                    }
                }
                var listWidthInRelationToDropdown = (listWidth - dropdownWidth);
                if (listToDropdownHorizontalRelation == "left") {
                    if ((dropdownHorizontalPosition + listWidth) <= window.screen.width) {
                        listHorizontalPosition = dropdownHorizontalPosition;
                    }
                    else {
                        listHorizontalPosition = (dropdownHorizontalPosition - listWidthInRelationToDropdown);
                    }
                }
                else if (listToDropdownHorizontalRelation == "center") {
                    var listSideLength = (listWidthInRelationToDropdown / 2);
                    if ((dropdownHorizontalPosition - listSideLength) < 0) {
                        listHorizontalPosition = dropdownHorizontalPosition;
                    }
                    else if ((dropdownHorizontalPosition + listSideLength) > window.screen.width) {
                        listHorizontalPosition = (dropdownHorizontalPosition - listWidthInRelationToDropdown);
                    }
                    else {
                        listHorizontalPosition = (dropdownHorizontalPosition - listSideLength);
                    }
                }
                else if (listToDropdownHorizontalRelation == "right") {
                    if ((dropdownHorizontalPosition - (listWidth - dropdownWidth)) < 0) {
                        listHorizontalPosition = dropdownHorizontalPosition;
                    }
                    else {
                        listHorizontalPosition = (dropdownHorizontalPosition - listWidthInRelationToDropdown);
                    }
                }
                if (currentIcon !== false) {
                    var currentIconWithoutExtension = currentIcon.substr(0, currentIcon.indexOf("."));
                    syiro.CSS(component, "background-image", currentIcon.replace(currentIconWithoutExtension, currentIconWithoutExtension + "-inverted"));
                }
                componentElement.setAttribute("active", "");
                syiro.component.CSS(linkedListComponentElement, "top", listVerticalPosition.toString() + "px");
                syiro.component.CSS(linkedListComponentElement, "left", listHorizontalPosition.toString() + "px");
                syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important");
            }
        }
        dropdown.Toggle = Toggle;
        ;
        function FetchLinkedListComponentObject(component) {
            var listSelector = 'div[data-syiro-component="list"][data-syiro-component-owner="' + component["id"] + '"]';
            return syiro.component.FetchComponentObject(document.querySelector(listSelector));
        }
        dropdown.FetchLinkedListComponentObject = FetchLinkedListComponentObject;
        function SetText(component, content) {
            var dropdownElement = syiro.component.Fetch(component);
            var dropdownLabel = dropdownElement.querySelector("label");
            if (content !== false) {
                dropdownLabel.textContent = content;
            }
            else if (content == false) {
                dropdownElement.removeChild(dropdownLabel);
            }
            syiro.component.Update(component["id"], dropdownElement);
        }
        dropdown.SetText = SetText;
        function SetImage(component, content) {
            var dropdownElement = syiro.component.Fetch(component);
            var dropdownLabelImage = dropdownElement.querySelector("img");
            if (content !== false) {
                if (dropdownLabelImage == null) {
                    dropdownLabelImage = syiro.generator.ElementCreator("img");
                    dropdownElement.insertBefore(dropdownLabelImage, dropdownElement.firstChild);
                }
                dropdownLabelImage.setAttribute("src", content);
            }
            else {
                dropdownElement.removeChild(dropdownLabelImage);
            }
            syiro.component.Update(component["id"], dropdownElement);
        }
        dropdown.SetImage = SetImage;
        function SetIcon(component, content) {
            var dropdownElement = syiro.component.Fetch(component);
            syiro.component.CSS(component, "background-image", content);
        }
        dropdown.SetIcon = SetIcon;
        function AddItem(component, listItemComponent) {
            var listComponentObject = syiro.dropdown.FetchLinkedListComponentObject(component);
            syiro.component.Add(true, listComponentObject, listItemComponent);
        }
        dropdown.AddItem = AddItem;
        function RemoveItem(component, listItemComponent) {
            syiro.component.Remove(listItemComponent);
        }
        dropdown.RemoveItem = RemoveItem;
    })(dropdown = syiro.dropdown || (syiro.dropdown = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var utilities;
    (function (utilities) {
        function SecondsToTimeFormat(seconds) {
            var timeObject = {};
            if (seconds >= 3600) {
                timeObject["hours"] = Math.floor(seconds / 3600);
                timeObject["minutes"] = Math.floor((seconds - (3600 * timeObject["hours"])) / 60);
                timeObject["seconds"] = Math.floor((seconds - (3600 * timeObject["hours"])) - (60 * timeObject["minutes"]));
            }
            else if ((seconds >= 60) && (seconds < 3600)) {
                timeObject["minutes"] = Math.floor(seconds / 60);
                timeObject["seconds"] = Math.floor(seconds - (timeObject["minutes"] * 60));
            }
            else {
                timeObject["minutes"] = 0;
                timeObject["seconds"] = seconds;
            }
            timeObject["seconds"] = Math.floor(timeObject["seconds"]);
            for (var timeObjectKey in timeObject) {
                var timeObjectValue = timeObject[timeObjectKey];
                var timeObjectValueString = timeObjectValue.toString();
                if (timeObjectValue < 10) {
                    timeObjectValueString = "0" + timeObjectValueString;
                }
                timeObject[timeObjectKey] = timeObjectValueString;
            }
            return timeObject;
        }
        utilities.SecondsToTimeFormat = SecondsToTimeFormat;
    })(utilities = syiro.utilities || (syiro.utilities = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var player;
    (function (player) {
        function Init(component) {
            var componentElement = syiro.component.Fetch(component);
            var innerContentElement = syiro.player.FetchInnerContentElement(component);
            var playerControlArea = componentElement.querySelector('div[data-syiro-component="player-control"]');
            var playerControlComponent = syiro.component.FetchComponentObject(playerControlArea);
            syiro.events.Add("timeupdate", innerContentElement, function () {
                var playerComponentElement = arguments[0].parentElement;
                var playerComponent = syiro.component.FetchComponentObject(playerComponentElement);
                var playerControlElement = playerComponentElement.querySelector('div[data-syiro-component="player-control"]');
                var playerControlComponent = syiro.component.FetchComponentObject(playerControlElement);
                var playerElement = syiro.player.FetchInnerContentElement(playerComponent);
                var currentTime = playerElement.currentTime;
                syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime);
                if (playerComponentElement.hasAttribute("data-syiro-component-status") == false) {
                    playerComponentElement.querySelector('div[data-syiro-component="player-control"]').querySelector("input").value = Math.floor(currentTime);
                }
                if (playerElement.ended == true) {
                    syiro.player.Reset(playerComponent);
                }
            });
            if (component["type"] == "video-player") {
                var posterImageElement = componentElement.querySelector('img[data-syiro-minor-component="video-poster"]');
                if (posterImageElement !== null) {
                    syiro.component.CSS(playerControlComponent, "opacity", "0.8");
                    syiro.events.Add(syiro.events.eventStrings["press"], posterImageElement, function () {
                        var posterImageElement = arguments[0];
                        syiro.component.CSS(posterImageElement, "visibility", "hidden");
                        syiro.player.PlayOrPause(syiro.component.FetchComponentObject(posterImageElement.parentElement));
                    });
                }
                syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, function () {
                    var innerContentElement = arguments[0];
                    var e = arguments[1];
                    if (e.button == 0) {
                        syiro.player.PlayOrPause(syiro.component.FetchComponentObject(innerContentElement.parentElement));
                    }
                });
                syiro.events.Add("contextmenu", componentElement, function () {
                    var e = arguments[1];
                    e.preventDefault();
                });
            }
            var playButtonComponent = syiro.component.FetchComponentObject(playerControlArea.querySelector('div[data-syiro-minor-component="player-button-play"]'));
            syiro.events.Add(playButtonComponent, function () {
                var playButtonComponent = arguments[0];
                var playButton = syiro.component.Fetch(playButtonComponent);
                var playerElement = playButton.parentElement.parentElement;
                var playerElementComponent = syiro.component.FetchComponentObject(playerElement);
                syiro.player.PlayOrPause(playerElementComponent, playButtonComponent);
            });
            var playerRange = playerControlArea.querySelector('input[type="range"]');
            syiro.events.Add(syiro.events.eventStrings["down"], playerRange, function () {
                var playerRangeElement = arguments[0];
                playerRange.parentElement.parentElement.setAttribute("data-syiro-component-status", "true");
            });
            syiro.events.Add(syiro.events.eventStrings["up"], playerRange, syiro.player.TimeOrVolumeChanger);
            var volumeButtonComponent = syiro.component.FetchComponentObject(playerControlArea.querySelector('div[data-syiro-minor-component="player-button-volume"]'));
            syiro.events.Add(volumeButtonComponent, function () {
                var volumeButtonComponent = arguments[0];
                var volumeButton = syiro.component.Fetch(volumeButtonComponent);
                var playerElement = volumeButton.parentElement.parentElement;
                var playerElementComponent = syiro.component.FetchComponentObject(playerElement);
                var playerRange = playerElement.querySelector("input");
                var playerRangeAttributes = {};
                var playerTimeElement = playerElement.querySelector("time");
                if (playerElement.hasAttribute("data-syiro-component-changevolume") !== true) {
                    playerElement.setAttribute("data-syiro-component-status", "true");
                    playerElement.setAttribute("data-syiro-component-changevolume", "");
                    volumeButton.parentElement.querySelector('div[data-syiro-minor-component="player-button-play"]').setAttribute("data-syiro-component-disabled", "");
                    volumeButton.setAttribute("data-syiro-component-status", "true");
                    playerTimeElement.setAttribute("data-syiro-component-disabled", "");
                    playerRangeAttributes["max"] = "100";
                    playerRangeAttributes["step"] = "1";
                    playerRange.value = (syiro.player.FetchInnerContentElement(playerElementComponent).volume * 100).toString();
                }
                else {
                    volumeButton.parentElement.querySelector('div[data-syiro-minor-component="player-button-play"]').removeAttribute("data-syiro-component-disabled");
                    volumeButton.removeAttribute("data-syiro-component-status");
                    playerTimeElement.removeAttribute("data-syiro-component-disabled");
                    playerRangeAttributes = syiro.player.GetPlayerLengthInfo(playerElementComponent);
                    playerElement.removeAttribute("data-syiro-component-status");
                    playerElement.removeAttribute("data-syiro-component-changevolume");
                }
                for (var playerRangeAttribute in playerRangeAttributes) {
                    playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]);
                }
            });
            var shareButton = componentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]');
            if (shareButton !== null) {
                syiro.events.Add(syiro.events.eventStrings["press"], syiro.component.FetchComponentObject(shareButton), syiro.player.ToggleShareDialog.bind(this, component));
            }
        }
        player.Init = Init;
        function FetchInnerContentElement(component) {
            var componentElement = syiro.component.Fetch(component);
            return componentElement.querySelector(component["type"].replace("-player", ""));
        }
        player.FetchInnerContentElement = FetchInnerContentElement;
        function GetPlayerLengthInfo(component) {
            var playerLengthInfo = {};
            var contentDuration = syiro.player.FetchInnerContentElement(component).duration;
            if ((isNaN(contentDuration) == false) && (String(contentDuration) !== "Infinity")) {
                contentDuration = Math.floor(Number(contentDuration));
                playerLengthInfo["max"] = contentDuration;
                if (contentDuration < 60) {
                    playerLengthInfo["step"] = 1;
                }
                else if ((contentDuration > 60) && (contentDuration <= 300)) {
                    playerLengthInfo["step"] = 5;
                }
                else if ((contentDuration > 300) && (contentDuration < 900)) {
                    playerLengthInfo["step"] = 10;
                }
                else {
                    playerLengthInfo["step"] = 15;
                }
            }
            else if (isNaN(contentDuration)) {
                playerLengthInfo["max"] = "Unknown";
                playerLengthInfo["step"] = 1;
            }
            else if (String(contentDuration) == "Infinity") {
                playerLengthInfo["max"] = "Streaming";
                playerLengthInfo["step"] = 1;
            }
            return playerLengthInfo;
        }
        player.GetPlayerLengthInfo = GetPlayerLengthInfo;
        function TimeOrVolumeChanger() {
            var playerRange = arguments[0];
            var playerControlElement = playerRange.parentElement;
            var playerElement = playerControlElement.parentElement;
            var playerComponentObject = syiro.component.FetchComponentObject(playerElement);
            var contentElement = syiro.player.FetchInnerContentElement(playerComponentObject);
            var valueNum = Number(playerRange.value);
            if (playerElement.hasAttribute("data-syiro-component-changevolume") == false) {
                syiro.player.SetTime(playerComponentObject, valueNum.toFixed());
            }
            else {
                syiro.player.SetVolume(playerComponentObject, (valueNum / 100));
            }
            if (playerElement.hasAttribute("data-syiro-component-changevolume") !== true) {
                playerElement.removeAttribute("data-syiro-component-status");
            }
        }
        player.TimeOrVolumeChanger = TimeOrVolumeChanger;
        function IsPlaying(component) {
            var componentElement = syiro.component.Fetch(component);
            var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused;
            return !isPaused;
        }
        player.IsPlaying = IsPlaying;
        function PlayOrPause(component, playButtonComponentObject) {
            var allowPlaying = false;
            var playerComponentElement = syiro.component.Fetch(component);
            var innerContentElement = syiro.player.FetchInnerContentElement(component);
            var playerSources = syiro.player.FetchSources(component);
            for (var playerSourceIndex in playerSources) {
                if (innerContentElement.canPlayType(playerSources[playerSourceIndex]["type"]) !== "") {
                    allowPlaying = true;
                }
            }
            if (allowPlaying == true) {
                if (playButtonComponentObject == undefined) {
                    playButtonComponentObject = syiro.component.FetchComponentObject(playerComponentElement.querySelector('div[data-syiro-minor-component="player-button-play"]'));
                }
                var playButton = syiro.component.Fetch(playButtonComponentObject);
                if (playButton.hasAttribute("data-syiro-component-disabled") == false) {
                    if (innerContentElement.currentTime == 0) {
                        var playerControlComponent = syiro.component.FetchComponentObject(playButton.parentElement);
                        var playerRange = playerComponentElement.querySelector('input[type="range"]');
                        var playerMediaLengthInformation = syiro.player.GetPlayerLengthInfo(component);
                        var posterImageElement = playerComponentElement.querySelector('img[data-syiro-minor-component="video-poster"]');
                        if (posterImageElement !== null) {
                            syiro.component.CSS(posterImageElement, "visibility", "hidden");
                            syiro.component.CSS(playerControlComponent, "opacity", false);
                        }
                        for (var playerRangeAttribute in playerMediaLengthInformation) {
                            playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]);
                            if (playerRangeAttribute == "max") {
                                syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);
                                var newTimeWidth = playButton.parentElement.querySelector("time").clientWidth + 25;
                                var inputRangeWidth = (playButton.parentElement.clientWidth - ((36 * 2) + (14 * 2) + newTimeWidth));
                                if (playButton.parentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]') !== null) {
                                    inputRangeWidth = inputRangeWidth - (36 + 14);
                                }
                                syiro.component.CSS(playerRange, "width", inputRangeWidth.toString() + "px !important");
                            }
                        }
                    }
                    if (innerContentElement.paused !== true) {
                        innerContentElement.pause();
                        syiro.component.CSS(playButtonComponentObject, "background-image", false);
                    }
                    else {
                        innerContentElement.play();
                        syiro.component.CSS(playButtonComponentObject, "background-image", "url(css/img/pause.png)");
                    }
                }
            }
            else {
                var codecErrorElement = syiro.generator.ElementCreator("div", {
                    "data-syiro-minor-component": "player-error",
                    "content": "This " + component["type"].replace("-player", "") + " is not capable of being played on this browser or device. Please try a different device or browser."
                });
                var playerHalfHeight = ((playerComponentElement.clientHeight - 40) / 2);
                syiro.component.CSS(codecErrorElement, "width", playerComponentElement.clientWidth.toString() + "px");
                syiro.component.CSS(codecErrorElement, "padding-top", playerHalfHeight.toString() + "px");
                syiro.component.CSS(codecErrorElement, "padding-bottom", playerHalfHeight.toString() + "px");
                playerComponentElement.insertBefore(codecErrorElement, playerComponentElement.firstChild);
                syiro.component.CSS(codecErrorElement, "visibility", "visible");
            }
        }
        player.PlayOrPause = PlayOrPause;
        function FetchSources(component) {
            var innerContentElement = syiro.player.FetchInnerContentElement(component);
            var sourceTags = innerContentElement.getElementsByTagName("SOURCE");
            var sourcesArray = [];
            for (var sourceElementIndex = 0; sourceElementIndex < sourceTags.length; sourceElementIndex++) {
                var sourceElement = sourceTags.item(sourceElementIndex);
                if (sourceElement !== undefined) {
                    sourcesArray.push({
                        "src": sourceElement.getAttribute("src"),
                        "type": sourceElement.getAttribute("type")
                    });
                }
            }
            return sourcesArray;
        }
        player.FetchSources = FetchSources;
        function GenerateSources(type, sources) {
            var arrayOfSourceElements = [];
            var sourcesList;
            if (typeof sources == "string") {
                sourcesList = [sources];
            }
            else {
                sourcesList = sources;
            }
            for (var sourceKey in sourcesList) {
                var source = sourcesList[sourceKey];
                var sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", "");
                var sourceTagAttributes = { "src": source };
                if (source.substr(-1) !== ";") {
                    if ((sourceExtension !== "mov") && (sourceExtension !== "m3u8")) {
                        sourceTagAttributes["type"] = sourceExtension;
                    }
                    else if (sourceExtension == "m3u8") {
                        if (type == "audio") {
                            sourceTagAttributes["type"] = "mp3";
                        }
                        else {
                            sourceTagAttributes["type"] = "mp4";
                        }
                    }
                    else if (sourceExtension == "mov") {
                        sourceTagAttributes["type"] = "quicktime";
                    }
                    if (sourceTagAttributes["type"] !== undefined) {
                        sourceTagAttributes["type"] = type + "/" + sourceTagAttributes["type"];
                    }
                }
                var sourceTag = syiro.generator.ElementCreator("source", sourceTagAttributes);
                arrayOfSourceElements.push(sourceTag);
            }
            return arrayOfSourceElements;
        }
        player.GenerateSources = GenerateSources;
        function Reset(component) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            var playerControl = playerElement.querySelector('div[data-syiro-component="player-control"]');
            var playButton = playerControl.querySelector('div[data-syiro-minor-component="player-button-play"]');
            var timeLabel = playerControl.querySelector('time');
            var volumeControl = playerControl.querySelector('div[data-syiro-minor-component="player-button-volume"]');
            playButton.removeAttribute("data-syiro-component-disabled");
            syiro.component.CSS(playButton, "background-image", false);
            timeLabel.removeAttribute("data-syiro-component-disabled");
            volumeControl.removeAttribute("data-syiro-component-status");
            playerElement.removeAttribute("data-syiro-component-status");
            playerElement.removeAttribute("data-syiro-component-changevolume");
            playerInnerContentElement.pause();
            syiro.player.SetTime(component, 0);
        }
        player.Reset = Reset;
        function SetSources(component, sources) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            if (typeof sources == "string") {
                sources = [sources];
            }
            var arrayofSourceElements = syiro.player.GenerateSources(component["type"].replace("-player", ""), sources);
            syiro.player.Reset(component);
            if (component["type"] == "video-player") {
                syiro.component.CSS(playerElement.querySelector('img[data-syiro-minor-component="video-poster"]'), "visibility", "hidden");
            }
            playerInnerContentElement.innerHTML = "";
            for (var sourceElementKey in arrayofSourceElements) {
                playerInnerContentElement.appendChild(arrayofSourceElements[sourceElementKey]);
            }
            playerInnerContentElement.src = sources[0];
        }
        player.SetSources = SetSources;
        function SetTime(component, time) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            playerInnerContentElement.currentTime = time;
            playerElement.querySelector('div[data-syiro-component="player-control"]').querySelector("input").value = Math.floor(time);
            syiro.playercontrol.TimeLabelUpdater(syiro.component.FetchComponentObject(playerElement.querySelector('div[data-syiro-component="player-control"]')), 0, time);
        }
        player.SetTime = SetTime;
        function SetVolume(component, volume) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            playerInnerContentElement.volume = volume;
        }
        player.SetVolume = SetVolume;
        function ToggleShareDialog(component) {
            var component = arguments[0];
            var componentElement = syiro.component.Fetch(component);
            var shareDialog = componentElement.querySelector('div[data-syiro-minor-component="player-share"]');
            var shareButton = componentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]');
            if (syiro.component.CSS(shareDialog, "visibility") !== "visible") {
                shareButton.setAttribute("data-syiro-component-status", "true");
                syiro.component.CSS(shareDialog, "visibility", "visible");
            }
            else {
                shareButton.removeAttribute("data-syiro-component-status");
                syiro.component.CSS(shareDialog, "visibility", false);
            }
        }
        player.ToggleShareDialog = ToggleShareDialog;
    })(player = syiro.player || (syiro.player = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var playercontrol;
    (function (playercontrol) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("player-control");
            var componentElement = syiro.generator.ElementCreator(componentId, "player-control");
            var playButton = syiro.button.Generate({ "data-syiro-minor-component": "player-button-play" });
            var inputRange = syiro.generator.ElementCreator("input", { "type": "range", "value": "0" });
            var timeStamp = syiro.generator.ElementCreator("time", { "content": "00:00 / 00:00" });
            var volumeButton = syiro.button.Generate({ "data-syiro-minor-component": "player-button-volume" });
            componentElement.appendChild(syiro.component.Fetch(playButton));
            componentElement.appendChild(inputRange);
            componentElement.appendChild(timeStamp);
            var inputRangeWidth = (properties["width"] - ((36 * 2) + (14 * 2) + 110));
            if (properties["share"] !== undefined) {
                if (properties["share"]["type"] == "list") {
                    inputRangeWidth = inputRangeWidth - (36 + 14);
                    var shareMenuButton = syiro.button.Generate({ "data-syiro-minor-component": "player-button-menu" });
                    componentElement.appendChild(syiro.component.Fetch(shareMenuButton));
                }
            }
            syiro.component.CSS(inputRange, "width", inputRangeWidth.toString() + "px !important");
            componentElement.appendChild(syiro.component.Fetch(volumeButton));
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "player-control" };
        }
        playercontrol.Generate = Generate;
        function TimeLabelUpdater(component, timePart, value) {
            var playerControlElement = syiro.component.Fetch(component);
            var playerTimeElement = playerControlElement.querySelector("time");
            var parsedSecondsToString = "";
            if (typeof value == "number") {
                var timeFormatObject = syiro.utilities.SecondsToTimeFormat(value);
                for (var timeObjectKey in timeFormatObject) {
                    var timeObjectValue = timeFormatObject[timeObjectKey];
                    if (parsedSecondsToString.length !== 0) {
                        parsedSecondsToString = parsedSecondsToString + ":" + timeObjectValue;
                    }
                    else {
                        parsedSecondsToString = timeObjectValue;
                    }
                }
            }
            else {
                parsedSecondsToString = value;
            }
            var playerTimeElementParts = playerTimeElement.textContent.split(" / ");
            playerTimeElementParts[timePart] = parsedSecondsToString;
            playerTimeElement.textContent = playerTimeElementParts[0] + " / " + playerTimeElementParts[1];
        }
        playercontrol.TimeLabelUpdater = TimeLabelUpdater;
    })(playercontrol = syiro.playercontrol || (syiro.playercontrol = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var audioplayer;
    (function (audioplayer) {
        function Generate(properties) {
            if (properties["sources"] !== undefined) {
                var componentId = syiro.generator.IdGen("audio-player");
                var componentElement = syiro.generator.ElementCreator(componentId, "audio-player", {
                    "id": componentId,
                    "name": componentId,
                });
                var audioPlayer = syiro.generator.ElementCreator("audio", { "preload": "metadata", "volume": "0.5" });
                audioPlayer.autoplay = false;
                var arrayofSourceElements = syiro.player.GenerateSources("audio", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(audioPlayer);
                if ((properties["art"] !== undefined) && (properties["title"] !== undefined)) {
                    var playerInformation = syiro.generator.ElementCreator("div", {
                        "data-syiro-minor-component": "player-information"
                    });
                    var playerTextualInformation = syiro.generator.ElementCreator("section");
                    playerInformation.appendChild(syiro.generator.ElementCreator("img", { "src": properties["art"] }));
                    var audioTitle = syiro.generator.ElementCreator("b", { "content": properties["title"] });
                    playerTextualInformation.appendChild(audioTitle);
                    if (properties["artist"] !== undefined) {
                        var artistInfo = syiro.generator.ElementCreator("label", { "content": properties["artist"] });
                        playerTextualInformation.appendChild(artistInfo);
                    }
                    if (properties["album"] !== undefined) {
                        var albumInfo = syiro.generator.ElementCreator("label", { "content": properties["album"] });
                        playerTextualInformation.appendChild(albumInfo);
                    }
                    playerInformation.appendChild(playerTextualInformation);
                    componentElement.appendChild(playerInformation);
                }
                if (properties["width"] == undefined) {
                    properties["width"] = 400;
                }
                if (window.screen.width < properties["width"]) {
                    properties["width"] = window.screen.width - 10;
                }
                syiro.component.CSS(componentElement, "width", properties["width"].toString() + "px");
                var playerControlComponent = syiro.playercontrol.Generate(properties);
                var playerControlElement = syiro.component.Fetch(playerControlComponent);
                if (properties["share"] !== undefined) {
                    if (properties["share"]["type"] == "list") {
                        var playerShareDialog = syiro.generator.ElementCreator("div", { "data-syiro-minor-component": "player-share" });
                        var playerShareLabel = syiro.generator.ElementCreator("label", { "content": "Share" });
                        playerShareDialog.appendChild(playerShareLabel);
                        playerShareDialog.appendChild(syiro.component.Fetch(properties["share"]));
                        syiro.CSS(playerShareDialog, "height", "100px");
                        syiro.CSS(playerShareDialog, "width", properties["width"].toString() + "px");
                        componentElement.insertBefore(playerShareDialog, componentElement.firstChild);
                    }
                }
                componentElement.appendChild(playerControlElement);
                syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
                return { "id": componentId, "type": "audio-player" };
            }
            else {
                return { "error": "no sources defined" };
            }
        }
        audioplayer.Generate = Generate;
    })(audioplayer = syiro.audioplayer || (syiro.audioplayer = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var videoplayer;
    (function (videoplayer) {
        function Generate(properties) {
            if (properties["sources"] !== undefined) {
                var componentId = syiro.generator.IdGen("video-player");
                var componentElement = syiro.generator.ElementCreator(componentId, "video-player", {
                    "id": componentId,
                    "name": componentId
                });
                var videoHeight = properties["height"];
                var videoWidth = properties["width"];
                if (videoHeight == undefined) {
                    videoHeight = 300;
                }
                if (videoWidth == undefined) {
                    videoWidth = Number((videoHeight * 1.77).toFixed());
                }
                if (videoWidth > window.screen.width) {
                    videoWidth = window.screen.width - 10;
                }
                var properVideoHeight = Number((videoWidth / 1.77).toFixed());
                if (videoHeight !== properVideoHeight) {
                    videoHeight = properVideoHeight;
                }
                properties["width"] = videoWidth;
                if (properties["art"] !== undefined) {
                    var posterImageElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component": "video-poster", "src": properties["art"] });
                    syiro.component.CSS(posterImageElement, "height", (videoHeight + 50).toString() + "px");
                    syiro.component.CSS(posterImageElement, "width", videoWidth.toString() + "px");
                    componentElement.appendChild(posterImageElement);
                }
                var videoPlayer = syiro.generator.ElementCreator("video", { "preload": "metadata", "volume": "0.5" });
                syiro.component.CSS(videoPlayer, "height", videoHeight.toString() + "px");
                syiro.component.CSS(videoPlayer, "width", videoWidth.toString() + "px");
                videoPlayer.autoplay = false;
                var arrayofSourceElements = syiro.player.GenerateSources("video", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(videoPlayer);
                var playerControlComponent = syiro.playercontrol.Generate(properties);
                var playerControlElement = syiro.component.Fetch(playerControlComponent);
                if (properties["share"] !== undefined) {
                    if (properties["share"]["type"] == "list") {
                        var playerShareDialog = syiro.generator.ElementCreator("div", { "data-syiro-minor-component": "player-share" });
                        var playerShareLabel = syiro.generator.ElementCreator("label", { "content": "Share" });
                        playerShareDialog.appendChild(playerShareLabel);
                        playerShareDialog.appendChild(syiro.component.Fetch(properties["share"]));
                        syiro.CSS(playerShareDialog, "height", videoHeight.toString() + "px");
                        syiro.CSS(playerShareDialog, "width", videoWidth.toString() + "px");
                        componentElement.insertBefore(playerShareDialog, componentElement.firstChild);
                    }
                }
                componentElement.appendChild(playerControlElement);
                syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
                return { "id": componentId, "type": "video-player" };
            }
            else {
                return { "error": "no video defined" };
            }
        }
        videoplayer.Generate = Generate;
    })(videoplayer = syiro.videoplayer || (syiro.videoplayer = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var searchbox;
    (function (searchbox) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("searchbox");
            var componentElement = syiro.generator.ElementCreator(componentId, "searchbox");
            if (properties == undefined) {
                properties = {};
            }
            if (properties["content"] == undefined) {
                properties["content"] = "Search here...";
            }
            for (var propertyKey in properties) {
                if (propertyKey == "icon") {
                    syiro.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")");
                }
                else if (propertyKey == "content") {
                    componentElement.setAttribute("placeholder", properties["content"]);
                }
            }
            syiro.component.componentData[componentId] = { "HTMLElement": componentElement };
            return { "id": componentId, "type": "searchbox" };
        }
        searchbox.Generate = Generate;
        function SetText(component, placeholderText) {
            var searchboxElement = syiro.component.Fetch(component);
            if (searchboxElement !== null) {
                var searchboxInputElement = searchboxElement.getElementsByTagName("input")[0];
                if (placeholderText !== false) {
                    searchboxInputElement.setAttribute("placeholder", placeholderText);
                }
                else if (placeholderText == false) {
                    searchboxInputElement.removeAttribute("placeholder");
                }
                syiro.component.Update(component["id"], searchboxElement);
            }
        }
        searchbox.SetText = SetText;
    })(searchbox = syiro.searchbox || (syiro.searchbox = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    function Init() {
        syiro.device.Detect();
        syiro.events.Add("scroll", document, function () {
            var dropdowns = document.querySelectorAll('div[data-syiro-component="dropdown"][active]');
            for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++) {
                var thisDropdownObject = syiro.component.FetchComponentObject(dropdowns[dropdownIndex]);
                syiro.dropdown.Toggle(thisDropdownObject);
            }
        });
        var documentHeadSection = document.querySelector("head");
        if (documentHeadSection == null) {
            documentHeadSection = document.createElement("head");
            document.querySelector("html").insertBefore(documentHeadSection, document.querySelector("head").querySelector("body"));
        }
        if (documentHeadSection.querySelector('meta[name="viewport"]') == null) {
            var viewportMetaTag = syiro.generator.ElementCreator("meta", { "name": "viewport", "content-attr": "width=device-width, initial-scale=1,user-scalable=no" });
            documentHeadSection.appendChild(viewportMetaTag);
        }
        if (typeof MutationObserver !== "undefined") {
            var mutationWatcher = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type == "childList") {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var addedNode = mutation.addedNodes[i];
                            function NodeParser(passedNode) {
                                if (passedNode.localName !== null) {
                                    var componentObject = syiro.component.FetchComponentObject(passedNode);
                                    if (componentObject !== false) {
                                        if (componentObject["type"] == "dropdown") {
                                            syiro.events.Add(syiro.events.eventStrings["press"], componentObject, syiro.dropdown.Toggle);
                                        }
                                        else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                            syiro.player.Init(componentObject);
                                        }
                                        if (passedNode.childNodes.length > 0) {
                                            for (var i = 0; i < passedNode.childNodes.length; i++) {
                                                var childNode = passedNode.childNodes[i];
                                                NodeParser(childNode);
                                            }
                                        }
                                        delete syiro.component.componentData[componentObject["id"]]["HTMLElement"];
                                    }
                                }
                            }
                            NodeParser(addedNode);
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
            mutationWatcher.observe(document.querySelector("body"), mutationWatcherOptions);
        }
        else {
            if (syiro.plugin.alternativeInit !== undefined) {
                syiro.plugin.alternativeInit.Init();
            }
        }
    }
    syiro.Init = Init;
    syiro.Define = syiro.component.Define;
    syiro.Fetch = syiro.component.Fetch;
    syiro.FetchComponentObject = syiro.component.FetchComponentObject;
    syiro.FetchDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition;
    syiro.Add = syiro.component.Add;
    syiro.Remove = syiro.component.Remove;
    syiro.Animate = syiro.animation.Animate;
    syiro.CSS = syiro.component.CSS;
    syiro.AddListeners = syiro.events.Add;
    syiro.RemoveListeners = syiro.events.Remove;
})(syiro || (syiro = {}));
