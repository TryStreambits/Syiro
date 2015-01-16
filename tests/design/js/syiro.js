var syiro;
(function (syiro) {
    var animation;
    (function (animation) {
        function Animate(component, properties) {
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (typeof properties["animation"] == "string")) {
                if (typeof properties["duration"] == "undefined") {
                    properties["duration"] = 250;
                }
                var postAnimationFunction = properties["function"];
                if (typeof properties["function"] !== "undefined") {
                    var elementTimeoutId = window.setTimeout(function () {
                        var component = arguments[0];
                        var componentElement = syiro.component.Fetch(component);
                        var postAnimationFunction = arguments[1];
                        var timeoutId = componentElement.getAttribute("data-syiro-animationTimeout-id");
                        componentElement.removeAttribute("data-syiro-animationTimeout-id");
                        window.clearTimeout(Number(timeoutId));
                        postAnimationFunction(component);
                    }.bind(syiro, component, postAnimationFunction), properties["duration"]);
                    componentElement.setAttribute("data-syiro-animationTimeout-id", elementTimeoutId.toString());
                }
                if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                    var tempElement = componentElement;
                    componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]');
                }
                componentElement.setAttribute("class", properties["animation"]);
            }
        }
        animation.Animate = Animate;
        function FadeIn(component, postAnimationFunction) {
            syiro.animation.Animate(component, {
                "animation": "fade-in-animation",
                "duration": 125,
                "function": postAnimationFunction
            });
        }
        animation.FadeIn = FadeIn;
        function FadeOut(component, postAnimationFunction) {
            syiro.animation.Animate(component, {
                "animation": "fade-out-animation",
                "duration": 125,
                "function": postAnimationFunction
            });
        }
        animation.FadeOut = FadeOut;
    })(animation = syiro.animation || (syiro.animation = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var component;
    (function (_component) {
        _component.componentData = {};
        _component.Define = syiro.component.FetchComponentObject;
        function CSS(component, property, newValue) {
            var modifiableElement;
            var returnedValue;
            var modifiedStyling = false;
            if (syiro.component.IsComponentObject(component)) {
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
            if (typeof syiro.component.componentData[component["id"]]["HTMLElement"] !== "undefined") {
                componentElement = syiro.component.componentData[component["id"]]["HTMLElement"];
            }
            else {
                componentElement = document.querySelector('*[data-syiro-component-id="' + component["id"] + '"]');
            }
            return componentElement;
        }
        _component.Fetch = Fetch;
        function FetchComponentObject() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var componentElement;
            var previouslyDefined = false;
            if (arguments.length == 1) {
                if (typeof arguments[0] == "string") {
                    componentElement = document.querySelector(arguments[1]);
                }
                else {
                    componentElement = arguments[0];
                }
            }
            else if (arguments.length == 2) {
                if (typeof arguments[1] == "string") {
                    componentElement = document.querySelector(arguments[1]);
                }
            }
            if (componentElement !== null) {
                if (componentElement.hasAttribute("data-syiro-component-id") == false) {
                    var componentId;
                    if ((arguments.length == 2) && (typeof arguments[0] == "string")) {
                        componentId = syiro.generator.IdGen(arguments[0]);
                        componentElement.setAttribute("data-syiro-component", arguments[0]);
                    }
                    else if (arguments.length == 1) {
                        componentId = syiro.generator.IdGen(componentElement.tagName.toLowerCase());
                        componentElement.setAttribute("data-syiro-component", componentElement.tagName.toLowerCase());
                    }
                    componentElement.setAttribute("data-syiro-component-id", componentId);
                }
                else {
                    previouslyDefined = true;
                }
                if ((componentElement.getAttribute("data-syiro-component") == "dropdown") && (previouslyDefined == false)) {
                    syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.dropdown.Toggle);
                }
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
            if (syiro.component.IsComponentObject(component)) {
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
        function FetchLinkedListComponentObject(component) {
            var listSelector = 'div[data-syiro-component="list"][data-syiro-component-owner="' + component["id"] + '"]';
            return syiro.component.FetchComponentObject(document.querySelector(listSelector));
        }
        _component.FetchLinkedListComponentObject = FetchLinkedListComponentObject;
        function IsComponentObject(variable) {
            var isComponentObject = false;
            if ((typeof variable["id"] !== "undefined") && (typeof variable["type"] !== "undefined") && (typeof variable.nodeType == "undefined")) {
                isComponentObject = true;
            }
            return isComponentObject;
        }
        _component.IsComponentObject = IsComponentObject;
        function Scale(component, data) {
            var componentId = component["id"];
            var componentElement = syiro.component.Fetch(component);
            var data = arguments[1];
            var userHorizontalSpace = window.screen.width;
            var parentHeight = componentElement.parentElement.clientHeight;
            var parentWidth = componentElement.parentElement.clientWidth;
            var scalingData;
            if (typeof data !== "undefined") {
                scalingData = data;
            }
            var storedScalingState;
            if (typeof scalingData !== "undefined") {
                syiro.component.componentData[componentId]["scaling"] = scalingData;
            }
            if (typeof syiro.component.componentData[componentId]["scaling"]["state"] == "undefined") {
                storedScalingState = "initial";
            }
            else {
                storedScalingState = syiro.component.componentData[componentId]["scaling"]["state"];
            }
            var initialDimensions = [];
            if (typeof syiro.component.componentData[componentId]["scaling"]["initialDimensions"] !== "undefined") {
                initialDimensions = syiro.component.componentData[componentId]["scaling"]["initialDimensions"];
            }
            if (initialDimensions.length !== 2) {
                initialDimensions.push(componentElement.clientHeight);
                if (initialDimensions.length == 1) {
                    initialDimensions.push(componentElement.clientWidth);
                }
                else {
                    initialDimensions.reverse();
                }
                syiro.component.componentData[componentId]["scaling"]["initialDimensions"] = initialDimensions;
            }
            var updatedComponentHeight = initialDimensions[0];
            var updatedComponentWidth = initialDimensions[1];
            var ratios = null;
            var fill = null;
            if (typeof syiro.component.componentData[componentId]["scaling"]["ratios"] !== "undefined") {
                ratios = syiro.component.componentData[componentId]["scaling"]["ratios"];
                if (ratios.length == 1) {
                    ratios.push(1.0);
                    ratios.reverse();
                }
            }
            if (typeof syiro.component.componentData[componentId]["scaling"]["fill"] !== "undefined") {
                fill = syiro.component.componentData[componentId]["scaling"]["fill"];
                if (fill.length == 1) {
                    fill.push(1.0);
                    fill.reverse();
                }
            }
            if ((storedScalingState !== "scaled") && ((ratios !== null) || (fill !== null))) {
                if (ratios !== null) {
                    if (ratios[0] !== 0) {
                        updatedComponentHeight = (initialDimensions[0] * ratios[0]);
                    }
                    else {
                        updatedComponentHeight = initialDimensions[0];
                    }
                    if (ratios[1] !== 0) {
                        updatedComponentWidth = (initialDimensions[0] * (ratios[1] / ratios[0]));
                    }
                    else {
                        updatedComponentWidth = initialDimensions[1];
                    }
                }
                else if (fill !== null) {
                    if (fill[0] !== 0) {
                        updatedComponentHeight = (parentHeight * fill[0]);
                    }
                    else {
                        updatedComponentHeight = initialDimensions[0];
                    }
                    if (fill[1] !== 0) {
                        updatedComponentWidth = (parentWidth * fill[1]);
                    }
                    else {
                        updatedComponentWidth = initialDimensions[1];
                    }
                }
            }
            if (updatedComponentWidth > userHorizontalSpace) {
                updatedComponentWidth = userHorizontalSpace;
                if ((ratios !== null) && (ratios[0] !== 0)) {
                    updatedComponentHeight = (updatedComponentWidth * (initialDimensions[0] / initialDimensions[1]));
                }
            }
            syiro.component.CSS(componentElement, "height", updatedComponentHeight.toString() + "px");
            syiro.component.CSS(componentElement, "width", updatedComponentWidth.toString() + "px");
            if (storedScalingState == "initial") {
                syiro.component.componentData[componentId]["scaling"]["initialDimensions"] = [updatedComponentHeight, updatedComponentWidth];
            }
            if (typeof syiro.component.componentData[component["id"]]["scaling"]["children"] !== "undefined") {
                if (typeof syiro.component.componentData[component["id"]]["scaling"]["children"].pop == "undefined") {
                    var childComponentsArray = [];
                    for (var childSelector in syiro.component.componentData[component["id"]]["scaling"]["children"]) {
                        var childElement = componentElement.querySelector(childSelector);
                        var childComponent = syiro.component.FetchComponentObject(childElement);
                        if (typeof syiro.component.componentData[childComponent["id"]] == "undefined") {
                            syiro.component.componentData[childComponent["id"]] = {};
                        }
                        syiro.component.componentData[childComponent["id"]]["scaling"] = syiro.component.componentData[component["id"]]["scaling"]["children"][childSelector]["scaling"];
                        childComponentsArray.push(childComponent);
                        delete syiro.component.componentData[component["id"]]["scaling"]["children"][childSelector];
                    }
                    syiro.component.componentData[component["id"]]["scaling"]["children"] = childComponentsArray;
                }
                for (var childComponentIndex = 0; childComponentIndex < syiro.component.componentData[component["id"]]["scaling"]["children"].length; childComponentIndex++) {
                    var childComponentObject = syiro.component.componentData[component["id"]]["scaling"]["children"][childComponentIndex];
                    syiro.component.Scale(childComponentObject);
                }
            }
            var updatedScalingState;
            if (storedScalingState !== "original") {
                updatedScalingState = "original";
            }
            else {
                updatedScalingState = "scaled";
            }
            syiro.component.componentData[componentId]["scaling"]["state"] = updatedScalingState;
        }
        _component.Scale = Scale;
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
            if (syiro.component.IsComponentObject(childComponent)) {
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
                    var individualComponentObject;
                    var individualComponentElement;
                    if (syiro.component.IsComponentObject(componentList[individualComponentIndex])) {
                        individualComponentObject = componentList[individualComponentIndex];
                        individualComponentElement = syiro.component.Fetch(individualComponentObject);
                    }
                    else {
                        individualComponentObject = syiro.component.Fetch(componentList[individualComponentIndex]);
                        individualComponentElement = componentList[individualComponentIndex];
                    }
                    if (syiro.component.componentData[individualComponentObject["id"]]["HTMLElement"] == undefined) {
                        var parentElement = individualComponentElement.parentElement;
                        parentElement.removeChild(individualComponentElement);
                    }
                    delete syiro.component.componentData[individualComponentObject["id"]];
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
        device.SupportsTouch = false;
        device.IsSubHD;
        device.IsHD;
        device.IsFullHDOrAbove;
        device.orientation;
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
            if ((typeof window.ontouchend !== "undefined") || ((typeof navigator.maxTouchPoints !== "undefined") && (navigator.maxTouchPoints > 0))) {
                syiro.device.SupportsTouch = true;
            }
            syiro.device.FetchScreenDetails();
            syiro.device.orientation = syiro.device.FetchScreenOrientation();
            syiro.events.Add("resize", window, syiro.device.FetchScreenDetails);
            window.setInterval(function () {
                var currentOrientation = syiro.device.FetchScreenOrientation();
                if (currentOrientation !== syiro.device.orientation) {
                    syiro.device.orientation = currentOrientation;
                    var allPlayers = document.querySelectorAll('div[data-syiro-component$="player"]');
                    for (var allPlayersIndex = 0; allPlayersIndex < allPlayers.length; allPlayersIndex++) {
                        var thisPlayer = allPlayers[allPlayersIndex];
                        syiro.component.Scale(syiro.component.FetchComponentObject(thisPlayer));
                    }
                }
            }, 2000);
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
        function FetchScreenOrientation() {
            var deviceOrientation = "portrait";
            if (screen.height < screen.width) {
                deviceOrientation = "landscape";
            }
            return deviceOrientation;
        }
        device.FetchScreenOrientation = FetchScreenOrientation;
    })(device = syiro.device || (syiro.device = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var events;
    (function (events) {
        events.eventStrings = {
            "down": ["mousedown", "touchstart"],
            "up": ["mouseup", "touchend"],
            "fullscreenchange": ["fullscreenchange", "mozfullscreenchange", "msfullscreenchange", "webkitfullscreenchange"]
        };
        function Handler() {
            var component = arguments[0];
            var eventData = arguments[1];
            var componentId;
            var componentElement;
            var passableValue = null;
            var listener = (eventData.type).toLowerCase().slice(0, 2).replace("on", "") + (eventData.type).toLowerCase().slice(2);
            if (syiro.component.IsComponentObject(component)) {
                componentId = component["id"];
                componentElement = syiro.component.Fetch(component);
            }
            else {
                var componentType = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase();
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
                else {
                    componentId = componentType;
                }
                componentElement = component;
            }
            var animationString = null;
            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                if (componentElement.hasAttribute("data-syiro-component-status") == false) {
                    animationString = "toggle-forward-animation";
                    passableValue = true;
                }
                else {
                    animationString = "toggle-backward-animation";
                    passableValue = false;
                }
            }
            else if (component["type"] == "searchbox") {
                passableValue = componentElement.value;
            }
            else {
                passableValue = eventData;
            }
            if (typeof syiro.component.componentData[componentId]["ignoreClick"] == "undefined") {
                if (animationString !== null) {
                    syiro.animation.Animate(component, {
                        "animation": animationString,
                        "function": function (component) {
                            var buttonElement = syiro.component.Fetch(component);
                            if (buttonElement.hasAttribute("data-syiro-component-status") == false) {
                                buttonElement.setAttribute("data-syiro-component-status", "true");
                            }
                            else {
                                buttonElement.removeAttribute("data-syiro-component-status");
                            }
                        }
                    });
                }
                for (var individualFunctionId in syiro.component.componentData[componentId]["handlers"][listener]) {
                    syiro.component.componentData[componentId]["handlers"][listener][individualFunctionId].call(syiro, component, passableValue);
                }
                if (listener.indexOf("touch") == 0) {
                    syiro.component.componentData[componentId]["ignoreClick"] = true;
                    var timeoutId = window.setTimeout(function () {
                        var componentId = arguments[0];
                        delete syiro.component.componentData[componentId]["ignoreClick"];
                        window.clearTimeout(syiro.component.componentData[componentId]["ignoreClick-TimeoutId"]);
                    }.bind(this, componentId), 350);
                    syiro.component.componentData[componentId]["ignoreClick-TimeoutId"] = timeoutId;
                }
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
                        listeners = syiro.events.eventStrings["up"];
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
                if (typeof listeners == "string") {
                    listeners = listeners.trim().split(" ");
                }
                var componentElement;
                if (syiro.component.IsComponentObject(component)) {
                    componentId = component["id"];
                    componentElement = syiro.component.Fetch(component);
                    if (component["type"] == "list-item") {
                        if (componentElement.querySelector("div") !== null) {
                            allowListening = false;
                        }
                    }
                }
                else {
                    var componentType = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase();
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
                    else {
                        componentId = componentType;
                    }
                    componentElement = component;
                }
                if (allowListening == true) {
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
                if (syiro.component.IsComponentObject(component)) {
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
            if ((typeof properties["items"] !== "undefined") && (properties["items"].length > 0)) {
                for (var individualItemIndex in properties["items"]) {
                    var individualItem = properties["items"][individualItemIndex];
                    if (individualItem["type"] !== "list-item") {
                        individualItem = syiro.listitem.Generate(individualItem);
                    }
                    componentElement.appendChild(syiro.component.Fetch(individualItem));
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
        dropdown.FetchLinkedListComponentObject = syiro.component.FetchLinkedListComponentObject;
        function Generate(properties) {
            if ((typeof properties["items"] !== "undefined") || (typeof properties["list"] !== "undefined")) {
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
                syiro.component.componentData[listComponent["id"]] = { "render": properties["position"]["vertical"] + "-" + properties["position"]["horizontal"] };
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
            var linkedListComponentObject = syiro.component.FetchLinkedListComponentObject(component);
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
                var positionInformation = syiro.component.componentData[linkedListComponentObject["id"]]["render"].split("-");
                syiro.render.Position(positionInformation, linkedListComponentObject, component);
                if (currentIcon !== false) {
                    var currentIconWithoutExtension = currentIcon.substr(0, currentIcon.indexOf("."));
                    syiro.CSS(component, "background-image", currentIcon.replace(currentIconWithoutExtension, currentIconWithoutExtension + "-inverted"));
                }
                componentElement.setAttribute("active", "");
                syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important");
            }
        }
        dropdown.Toggle = Toggle;
        ;
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
            var listComponentObject = syiro.component.FetchLinkedListComponentObject(component);
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
                    syiro.component.CSS(playerControlArea, "opacity", "0.8");
                    syiro.events.Add(syiro.events.eventStrings["up"], posterImageElement, function () {
                        var posterImageElement = arguments[0];
                        var e = arguments[1];
                        var playerComponentObject = syiro.component.FetchComponentObject(posterImageElement.parentElement);
                        syiro.component.CSS(posterImageElement, "visibility", "hidden");
                        syiro.player.PlayOrPause(playerComponentObject);
                        if (syiro.device.SupportsTouch == true) {
                            var playerControlComponent = syiro.component.FetchComponentObject(posterImageElement.parentElement.querySelector('div[data-syiro-component="player-control"]'));
                            syiro.playercontrol.Toggle(playerControlComponent, false);
                        }
                    });
                }
                syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, function () {
                    var innerContentElement = arguments[0];
                    var e = arguments[1];
                    if (syiro.device.SupportsTouch !== true) {
                        var playerComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement);
                        syiro.player.PlayOrPause(playerComponent);
                    }
                    else {
                        var playerControlComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement.querySelector('div[data-syiro-component="player-control"]'));
                        syiro.playercontrol.Toggle(playerControlComponent);
                    }
                });
                syiro.events.Add("contextmenu", componentElement, function () {
                    var e = arguments[1];
                    e.preventDefault();
                });
                var fullscreenButtonElement = componentElement.querySelector('div[data-syiro-minor-component="player-button-fullscreen"]');
                syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(fullscreenButtonElement), syiro.player.ToggleFullscreen);
                if (syiro.device.SupportsTouch == false) {
                    syiro.events.Add("mouseenter", componentElement, function () {
                        var componentElement = arguments[0];
                        var playerControlComponent = syiro.component.FetchComponentObject(componentElement.querySelector('div[data-syiro-component="player-control"]'));
                        syiro.playercontrol.Toggle(playerControlComponent, true);
                    });
                    syiro.events.Add("mouseleave", componentElement, function () {
                        var componentElement = arguments[0];
                        var playerControlComponent = syiro.component.FetchComponentObject(componentElement.querySelector('div[data-syiro-component="player-control"]'));
                        syiro.playercontrol.Toggle(playerControlComponent, false);
                    });
                }
            }
            var playButtonComponent = syiro.component.FetchComponentObject(playerControlArea.querySelector('div[data-syiro-minor-component="player-button-play"]'));
            syiro.events.Add(playButtonComponent, function () {
                var playButtonComponent = arguments[0];
                var e = arguments[1];
                var playButton = syiro.component.Fetch(playButtonComponent);
                var playerElement = playButton.parentElement.parentElement;
                var playerComponent = syiro.component.FetchComponentObject(playerElement);
                syiro.player.PlayOrPause(playerComponent, playButtonComponent);
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
            var menuButton = componentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]');
            if (menuButton !== null) {
                syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(menuButton), syiro.player.ToggleMenuDialog.bind(this, component));
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
                        }
                        syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);
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
            playButton.removeAttribute("data-syiro-component-disabled");
            syiro.component.CSS(playButton, "background-image", false);
            var timeLabel = playerControl.querySelector("time");
            timeLabel.removeAttribute("data-syiro-component-disabled");
            var volumeControl = playerControl.querySelector('div[data-syiro-minor-component="player-button-volume"]');
            volumeControl.removeAttribute("data-syiro-component-status");
            if (playerElement.querySelector('div[data-syiro-minor-component="player-error"]') !== null) {
                playerElement.removeChild(playerElement.querySelector('div[data-syiro-minor-component="player-error"]'));
            }
            playerElement.removeAttribute("data-syiro-component-status");
            playerElement.removeAttribute("data-syiro-component-changevolume");
            if (syiro.player.IsPlaying(component)) {
                playerInnerContentElement.pause();
            }
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
            if (playerInnerContentElement.currentTime !== time) {
                playerInnerContentElement.currentTime = time;
                playerElement.querySelector('div[data-syiro-component="player-control"]').querySelector("input").value = Math.floor(time);
                syiro.playercontrol.TimeLabelUpdater(syiro.component.FetchComponentObject(playerElement.querySelector('div[data-syiro-component="player-control"]')), 0, time);
            }
        }
        player.SetTime = SetTime;
        function SetVolume(component, volume) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            playerInnerContentElement.volume = volume;
        }
        player.SetVolume = SetVolume;
        function ToggleFullscreen() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var videoPlayerComponent;
            var videoPlayerElement;
            if (arguments[0]["type"] == "video-player") {
                videoPlayerComponent = arguments[0];
                videoPlayerElement = syiro.component.Fetch(videoPlayerComponent);
            }
            else {
                var fullscreenButtonComponent = arguments[0];
                var fullscreenButtonElement = syiro.component.Fetch(fullscreenButtonComponent);
                videoPlayerElement = fullscreenButtonElement.parentElement.parentElement;
                videoPlayerComponent = syiro.component.FetchComponentObject(videoPlayerElement);
            }
            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (typeof videoPlayerElement.requestFullscreen !== "undefined") {
                    videoPlayerElement.requestFullscreen();
                }
                else if (typeof videoPlayerElement.msRequestFullscreen !== "undefined") {
                    videoPlayerElement.msRequestFullscreen();
                }
                else if (typeof videoPlayerElement.mozRequestFullScreen !== "undefined") {
                    videoPlayerElement.mozRequestFullScreen();
                }
                else if (typeof videoPlayerElement.webkitRequestFullscreen !== "undefined") {
                    videoPlayerElement.webkitRequestFullscreen();
                }
            }
            else {
                if (typeof document.exitFullscreen !== "undefined") {
                    document.exitFullscreen();
                }
                else if (typeof document.msExitFullscreen !== "undefined") {
                    document.msExitFullscreen();
                }
                else if (typeof document.mozCancelFullScreen !== "undefined") {
                    document.mozCancelFullScreen();
                }
                else if (typeof document.webkitExitFullscreen !== "undefined") {
                    document.webkitExitFullscreen();
                }
            }
        }
        player.ToggleFullscreen = ToggleFullscreen;
        function ToggleMenuDialog(component) {
            var component = arguments[0];
            var componentElement = syiro.component.Fetch(component);
            var menuDialog = componentElement.querySelector('div[data-syiro-minor-component="player-menu"]');
            var menuButton = componentElement.querySelector('div[data-syiro-minor-component="player-button-menu"]');
            if (syiro.component.CSS(menuDialog, "visibility") !== "visible") {
                var playerMenuHeight;
                if (component["type"] == "audio-player") {
                    playerMenuHeight = 100;
                }
                else {
                    playerMenuHeight = syiro.player.FetchInnerContentElement(component).clientHeight;
                }
                syiro.component.CSS(menuDialog, "height", playerMenuHeight.toString() + "px");
                syiro.component.CSS(menuDialog, "width", componentElement.clientWidth.toString() + "px");
                menuButton.setAttribute("data-syiro-component-status", "true");
                syiro.component.CSS(menuDialog, "visibility", "visible");
            }
            else {
                menuButton.removeAttribute("data-syiro-component-status");
                syiro.component.CSS(menuDialog, "visibility", false);
                syiro.component.CSS(menuDialog, "height", false);
                syiro.component.CSS(menuDialog, "width", false);
            }
        }
        player.ToggleMenuDialog = ToggleMenuDialog;
        player.ToggleShareDialog = ToggleMenuDialog;
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
            componentElement.appendChild(inputRange);
            componentElement.appendChild(syiro.component.Fetch(playButton));
            componentElement.appendChild(timeStamp);
            if (properties["menu"] !== undefined) {
                if (properties["menu"]["type"] == "list") {
                    var menuButton = syiro.button.Generate({ "data-syiro-minor-component": "player-button-menu" });
                    componentElement.appendChild(syiro.component.Fetch(menuButton));
                }
            }
            if (typeof properties["is-video-player"] !== "undefined") {
                var fullscreenButton = syiro.button.Generate({ "data-syiro-minor-component": "player-button-fullscreen" });
                componentElement.appendChild(syiro.component.Fetch(fullscreenButton));
            }
            componentElement.appendChild(syiro.component.Fetch(volumeButton));
            syiro.component.componentData[componentId] = {
                "HTMLElement": componentElement,
                "scaling": {}
            };
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
        function Toggle(component, forceShow) {
            var playerControlElement = syiro.component.Fetch(component);
            var currentAnimationStored = null;
            syiro.component.CSS(playerControlElement, "opacity", false);
            if (playerControlElement.hasAttribute("class")) {
                currentAnimationStored = playerControlElement.getAttribute("class");
            }
            if (forceShow == true) {
                syiro.animation.FadeIn(component);
            }
            else if (forceShow == false) {
                syiro.animation.FadeOut(component);
            }
            else if (typeof forceShow == "undefined") {
                if ((currentAnimationStored == "fade-out-animation") || (playerControlElement.hasAttribute("class") == false)) {
                    syiro.animation.FadeIn(component);
                }
                else {
                    syiro.animation.FadeOut(component);
                }
            }
        }
        playercontrol.Toggle = Toggle;
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
                if (typeof properties["share"] !== "undefined") {
                    properties["menu"] = properties["share"];
                }
                var audioPlayer = syiro.generator.ElementCreator("audio", { "preload": "metadata", "volume": "0.5" });
                audioPlayer.autoplay = false;
                var arrayofSourceElements = syiro.player.GenerateSources("audio", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(audioPlayer);
                if ((properties["art"] !== undefined) && (properties["title"] !== undefined)) {
                    var playerInformation = syiro.generator.ElementCreator("div", { "data-syiro-minor-component": "player-information" });
                    playerInformation.appendChild(syiro.generator.ElementCreator("img", { "src": properties["art"] }));
                    var playerTextualInformation = syiro.generator.ElementCreator("section");
                    playerTextualInformation.appendChild(syiro.generator.ElementCreator("b", { "content": properties["title"] }));
                    if (properties["artist"] !== undefined) {
                        playerTextualInformation.appendChild(syiro.generator.ElementCreator("label", { "content": properties["artist"] }));
                    }
                    if (properties["album"] !== undefined) {
                        playerTextualInformation.appendChild(syiro.generator.ElementCreator("label", { "content": properties["album"] }));
                    }
                    playerInformation.appendChild(playerTextualInformation);
                    componentElement.appendChild(playerInformation);
                }
                if (properties["width"] == undefined) {
                    properties["width"] = 400;
                }
                syiro.component.CSS(componentElement, "width", properties["width"].toString() + "px");
                var playerControlComponent = syiro.playercontrol.Generate(properties);
                var playerControlElement = syiro.component.Fetch(playerControlComponent);
                if (properties["menu"] !== undefined) {
                    if (properties["menu"]["type"] == "list") {
                        var playerMenuDialog = syiro.generator.ElementCreator("div", { "data-syiro-minor-component": "player-menu" });
                        playerMenuDialog.appendChild(syiro.generator.ElementCreator("label", { "content": "Menu" }));
                        playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"]));
                        componentElement.insertBefore(playerMenuDialog, componentElement.firstChild);
                    }
                }
                componentElement.appendChild(playerControlElement);
                syiro.component.componentData[componentId] = {
                    "HTMLElement": componentElement,
                    "scaling": {
                        "initialDimensions": [160, properties["width"]],
                        "ratio": [0, 0],
                        "children": {
                            'div[data-syiro-component="player-control"]': {
                                "scaling": {
                                    "fill": [0, 1]
                                }
                            }
                        }
                    }
                };
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
                if (typeof properties["share"] !== "undefined") {
                    properties["menu"] = properties["share"];
                }
                if (properties["height"] == undefined) {
                    properties["height"] = 300;
                }
                if (properties["width"] == undefined) {
                    properties["width"] = 531;
                }
                if (properties["art"] !== undefined) {
                    var posterImageElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component": "video-poster", "src": properties["art"] });
                    componentElement.appendChild(posterImageElement);
                }
                var videoPlayer = syiro.generator.ElementCreator("video", { "preload": "metadata", "volume": "0.5" });
                videoPlayer.autoplay = false;
                var arrayofSourceElements = syiro.player.GenerateSources("video", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(videoPlayer);
                properties["is-video-player"] = true;
                var playerControlComponent = syiro.playercontrol.Generate(properties);
                componentElement.appendChild(syiro.component.Fetch(playerControlComponent));
                if (properties["menu"] !== undefined) {
                    if (properties["menu"]["type"] == "list") {
                        var playerMenuDialog = syiro.generator.ElementCreator("div", { "data-syiro-minor-component": "player-menu" });
                        playerMenuDialog.appendChild(syiro.generator.ElementCreator("label", { "content": "Menu" }));
                        playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"]));
                        componentElement.insertBefore(playerMenuDialog, componentElement.firstChild);
                    }
                }
                syiro.component.componentData[componentId] = {
                    "HTMLElement": componentElement,
                    "scaling": {
                        "initialDimensions": [properties["height"], properties["width"]],
                        "ratios": [1, 1.77],
                        "children": {
                            'img[data-syiro-minor-component="video-poster"]': {
                                "scaling": {
                                    "fill": [1, 1]
                                }
                            },
                            'div[data-syiro-component="player-control"]': {
                                "scaling": {
                                    "fill": [0, 1]
                                }
                            }
                        }
                    }
                };
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
    var render;
    (function (render) {
        function Position() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var positioningAllowed = false;
            if (arguments.length == 3) {
                var positioningList;
                var componentObject;
                var componentElement;
                var relativeComponentObject;
                var relativeComponentElement;
                if (typeof arguments[0] == "string") {
                    positioningList = [arguments[0]];
                }
                else if ((typeof arguments[0] == "object") && (arguments[0].length > 0)) {
                    positioningList = arguments[0];
                }
                if (syiro.component.IsComponentObject(arguments[1])) {
                    componentObject = arguments[1];
                    componentElement = syiro.component.Fetch(componentObject);
                }
                else if ((typeof arguments[1]).toLowerCase().indexOf("element") !== -1) {
                    componentElement = arguments[1];
                }
                if (syiro.component.IsComponentObject(arguments[2])) {
                    relativeComponentObject = arguments[2];
                    relativeComponentElement = syiro.component.Fetch(relativeComponentObject);
                }
                else if ((typeof arguments[2]).toLowerCase().indexOf("element") !== -1) {
                    relativeComponentElement = arguments[2];
                }
                if ((typeof positioningList !== "undefined") && (typeof componentElement !== "undefined") && (typeof relativeComponentElement !== "undefined")) {
                    positioningAllowed = true;
                    var primaryComponentDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition(componentElement);
                    var relativeComponentDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition(relativeComponentElement);
                    var primaryComponentHeight = primaryComponentDimensionsAndPosition["height"];
                    var primaryComponentWidth = primaryComponentDimensionsAndPosition["width"];
                    var relativeComponentHeight = relativeComponentDimensionsAndPosition["height"];
                    var relativeComponentWidth = relativeComponentDimensionsAndPosition["width"];
                    var relativeComponentVerticalPosition = relativeComponentDimensionsAndPosition["y"];
                    var relativeComponentHorizontalPosition = relativeComponentDimensionsAndPosition["x"];
                    var primaryComponentWidthInRelationToRelativeComponent = (primaryComponentWidth - relativeComponentWidth);
                    for (var positioningListIndex in positioningList) {
                        var position = positioningList[positioningListIndex];
                        var positionValue;
                        switch (position) {
                            case "above":
                                if ((relativeComponentVerticalPosition == 0) || (relativeComponentVerticalPosition - primaryComponentHeight < 0)) {
                                    positionValue = relativeComponentHeight;
                                }
                                else {
                                    positionValue = (relativeComponentVerticalPosition - primaryComponentHeight);
                                }
                                break;
                            case "below":
                                if ((relativeComponentVerticalPosition == (window.screen.height - relativeComponentHeight)) || ((relativeComponentVerticalPosition + primaryComponentHeight) > window.screen.height)) {
                                    positionValue = (relativeComponentVerticalPosition - primaryComponentHeight);
                                }
                                else {
                                    positionValue = (relativeComponentVerticalPosition + relativeComponentHeight);
                                }
                                break;
                            case "left":
                                if ((relativeComponentHorizontalPosition + primaryComponentWidth) <= window.screen.width) {
                                    positionValue = relativeComponentHorizontalPosition;
                                }
                                else {
                                    positionValue = (relativeComponentHorizontalPosition - primaryComponentWidthInRelationToRelativeComponent);
                                }
                                break;
                            case "center":
                                var primaryComponentSideLength = (primaryComponentWidthInRelationToRelativeComponent / 2);
                                if ((relativeComponentHorizontalPosition - primaryComponentSideLength) < 0) {
                                    positionValue = relativeComponentHorizontalPosition;
                                }
                                else if ((relativeComponentHorizontalPosition + primaryComponentSideLength) > window.screen.width) {
                                    positionValue = (relativeComponentHorizontalPosition - primaryComponentWidthInRelationToRelativeComponent);
                                }
                                else {
                                    positionValue = (relativeComponentHorizontalPosition - primaryComponentSideLength);
                                }
                                break;
                            case "right":
                                if ((relativeComponentHorizontalPosition - (primaryComponentWidth - relativeComponentWidth)) < 0) {
                                    positionValue = relativeComponentHorizontalPosition;
                                }
                                else {
                                    positionValue = (relativeComponentHorizontalPosition - primaryComponentWidthInRelationToRelativeComponent);
                                }
                                break;
                        }
                        if ((position == "above") || (position == "below")) {
                            syiro.component.CSS(componentElement, "top", positionValue.toString() + "px");
                        }
                        else {
                            syiro.component.CSS(componentElement, "left", positionValue.toString() + "px");
                        }
                    }
                }
            }
            return positioningAllowed;
        }
        render.Position = Position;
    })(render = syiro.render || (syiro.render = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var searchbox;
    (function (searchbox) {
        function Generate(properties) {
            var componentId = syiro.generator.IdGen("searchbox");
            var componentElement = syiro.generator.ElementCreator(componentId, "searchbox");
            var searchboxComponentData = {};
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
            if ((typeof properties["suggestions"] !== undefined) && (properties["suggestions"] == true)) {
                searchboxComponentData["handlers"] = { "suggestions": properties["handler"] };
                var listItems = [];
                if (typeof properties["preseed"] == "object") {
                    searchboxComponentData["preseed"] = true;
                    for (var preseedItemIndex in properties["preseed"]) {
                        listItems.push(syiro.listitem.Generate({ "label": properties["preseed"][preseedItemIndex] }));
                    }
                }
                else {
                    searchboxComponentData["preseed"] = false;
                }
                var searchSuggestionsList = syiro.list.Generate({ "items": listItems });
                var searchSuggestionsListElement = syiro.component.Fetch(searchSuggestionsList);
                syiro.component.componentData[searchSuggestionsList["id"]] = { "render": "bottom-center" };
                searchSuggestionsListElement.setAttribute("data-syiro-component-owner", componentId);
                document.querySelector("body").appendChild(searchSuggestionsListElement);
                if (typeof properties["preseed"] == "object") {
                    for (var listItemIndex in listItems) {
                        syiro.events.Add(syiro.events.eventStrings["up"], listItems[listItemIndex], properties["list-item-handler"]);
                    }
                }
            }
            searchboxComponentData["HTMLElement"] = componentElement;
            syiro.component.componentData[componentId] = searchboxComponentData;
            return { "id": componentId, "type": "searchbox" };
        }
        searchbox.Generate = Generate;
        function Suggestions() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var searchboxComponent = arguments[0];
            var searchboxValue = arguments[1];
            var linkedListComponent = syiro.component.FetchLinkedListComponentObject(searchboxComponent);
            var linkedListComponentElement = syiro.component.Fetch(linkedListComponent);
            var innerListItemsOfLinkedList = linkedListComponentElement.querySelectorAll('div[data-syiro-component="list-item"]');
            var suggestions = syiro.component.componentData[searchboxComponent["id"]]["handlers"]["suggestions"]();
            if (syiro.component.componentData[searchboxComponent["id"]]["preseed"] == true) {
                if (innerListItemsOfLinkedList.length > 0) {
                    for (var listItemIndex in innerListItemsOfLinkedList) {
                        var listItem = innerListItemsOfLinkedList[listItemIndex];
                        if (suggestions.indexOf(listItem.textContent) !== -1) {
                            syiro.component.CSS(listItem, "visibility", "visible !important");
                        }
                        else {
                            syiro.component.CSS(listItem, "visibility", "hidden !important");
                        }
                    }
                }
            }
            else {
                if (innerListItemsOfLinkedList.length > 0) {
                    var listItemsToRemove = [];
                    for (var listItemIndex in innerListItemsOfLinkedList) {
                        var listItem = innerListItemsOfLinkedList[listItemIndex];
                        listItemsToRemove.push(listItem);
                    }
                    syiro.component.Remove(listItemsToRemove);
                }
                for (var suggestionIndex in suggestions) {
                    var suggestionListItem = syiro.listitem.Generate({ "label": suggestions[suggestionIndex] });
                    syiro.list.AddItem(true, linkedListComponent, suggestionListItem);
                }
            }
        }
        searchbox.Suggestions = Suggestions;
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
        var eventsToRemove;
        if (syiro.device.SupportsTouch == true) {
            eventsToRemove = ["mousedown", "mouseup"];
        }
        else {
            eventsToRemove = ["touchstart", "touchend"];
        }
        syiro.events.eventStrings["down"].splice(syiro.events.eventStrings["down"].indexOf(eventsToRemove[0]), 1);
        syiro.events.eventStrings["up"].splice(syiro.events.eventStrings["up"].indexOf(eventsToRemove[1]), 1);
        syiro.events.Add("scroll", document, function () {
            var dropdowns = document.querySelectorAll('div[data-syiro-component="dropdown"][active]');
            for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++) {
                var thisDropdownObject = syiro.component.FetchComponentObject(dropdowns[dropdownIndex]);
                syiro.dropdown.Toggle(thisDropdownObject);
            }
        });
        syiro.events.Add(syiro.events.eventStrings["fullscreenchange"], document, function () {
            var fullscreenVideoPlayerElement;
            if ((typeof document.fullscreenElement !== "undefined") && (typeof document.fullscreenElement !== "null")) {
                fullscreenVideoPlayerElement = document.fullscreenElement;
            }
            else if ((typeof document.mozFullScreenElement !== "undefined") && (typeof document.mozFullScreenElement !== "null")) {
                fullscreenVideoPlayerElement = document.mozFullScreenElement;
            }
            else if ((typeof document.msFullscreenElement !== "undefined") && (typeof document.msFullscreenElement !== "null")) {
                fullscreenVideoPlayerElement = document.msFullscreenElement;
            }
            else if ((typeof document.webkitFullscreenElement !== "undefined") && (typeof document.webkitFullscreenElement !== "null")) {
                fullscreenVideoPlayerElement = document.webkitFullscreenElement;
            }
            if ((typeof fullscreenVideoPlayerElement !== "undefined") && (fullscreenVideoPlayerElement !== null)) {
                document.SyiroFullscreenElement = fullscreenVideoPlayerElement;
            }
            else {
                fullscreenVideoPlayerElement = document.SyiroFullscreenElement;
            }
            syiro.component.Scale(syiro.component.FetchComponentObject(fullscreenVideoPlayerElement));
        });
        var documentHeadSection = document.querySelector("head");
        if (documentHeadSection == null) {
            documentHeadSection = document.createElement("head");
            document.querySelector("html").insertBefore(documentHeadSection, document.querySelector("head").querySelector("body"));
        }
        if (documentHeadSection.querySelector('meta[http-equiv="X-UA-Compatible"]') == null) {
            var compatMetaTag = syiro.generator.ElementCreator("meta", { "http-equiv": "X-UA-Compatible", "content-attr": "IE=edge" });
            documentHeadSection.appendChild(compatMetaTag);
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
                                    if (passedNode.hasAttribute("data-syiro-component")) {
                                        var componentObject = syiro.component.FetchComponentObject(passedNode);
                                        if (componentObject["type"] == "dropdown") {
                                            syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.dropdown.Toggle);
                                        }
                                        else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                            syiro.player.Init(componentObject);
                                            syiro.component.Scale(componentObject);
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
    function Animate() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var animationProperties;
        if ((arguments.length == 2) && (typeof arguments[1] == "object")) {
            animationProperties = arguments[1];
        }
        else {
            animationProperties["animation"] = arguments[1];
            if (arguments.length == 3) {
                animationProperties["function"] = arguments[2];
            }
        }
        syiro.animation.Animate(syiro.component, animationProperties);
    }
    syiro.Animate = Animate;
    syiro.CSS = syiro.component.CSS;
    syiro.AddListeners = syiro.events.Add;
    syiro.RemoveListeners = syiro.events.Remove;
})(syiro || (syiro = {}));
