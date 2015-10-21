/*
    These are interface extensions so Typescript doesn't freak out.
*/
var WebKitMutationObserver;
/*
This is the namespace for managing Syiro Data.
*/
/// <reference path="interfaces.ts" />
var syiro;
(function (syiro) {
    var data;
    (function (data_1) {
        data_1.storage = {};
        function Manage(modificationType, keyList, data) {
            var componentId;
            var returnableValue;
            var keyToApply;
            if (keyList.indexOf("->") !== -1) {
                componentId = keyList.slice(0, keyList.indexOf("->"));
                keyToApply = keyList.replace(componentId + "->", "");
            }
            else {
                componentId = keyList;
            }
            if (typeof syiro.data.storage[componentId] == "undefined") {
                if (modificationType == "write") {
                    if (typeof keyToApply == "string") {
                        syiro.data.storage[componentId] = {};
                    }
                    else {
                        syiro.data.storage[componentId] = data;
                        returnableValue = true;
                    }
                }
                else {
                    returnableValue = false;
                }
            }
            if ((returnableValue !== false) && (typeof keyToApply == "string")) {
                returnableValue = true;
                if (modificationType == "read") {
                    if (typeof syiro.data.storage[componentId][keyToApply] !== "undefined") {
                        returnableValue = syiro.data.storage[componentId][keyToApply];
                    }
                    else {
                        returnableValue = false;
                    }
                }
                else if (modificationType == "write") {
                    if (typeof data !== "undefined") {
                        syiro.data.storage[componentId][keyToApply] = data;
                    }
                }
                else if (modificationType == "delete") {
                    if (typeof syiro.data.storage[componentId][keyToApply] !== "undefined") {
                        delete syiro.data.storage[componentId][keyToApply];
                    }
                }
            }
            if ((returnableValue) && (modificationType == "delete") && (Object.keys(syiro.data.storage[componentId]).length == 0)) {
                delete syiro.data.storage[componentId];
            }
            return returnableValue;
        }
        data_1.Manage = Manage;
        function Read(keyList) {
            return syiro.data.Manage("read", keyList);
        }
        data_1.Read = Read;
        function Write(keyList, data) {
            return syiro.data.Manage("write", keyList, data);
        }
        data_1.Write = Write;
        function Delete(keyList) {
            return syiro.data.Manage("delete", keyList);
        }
        data_1.Delete = Delete;
    })(data = syiro.data || (syiro.data = {}));
})(syiro || (syiro = {}));
/*
    This is the namespace for animation in Syiro
*/
/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />
var syiro;
(function (syiro) {
    var animation;
    (function (animation) {
        function Animate(component, properties) {
            var element;
            var typeOfComponent = syiro.utilities.TypeOfThing(component);
            if (typeOfComponent == "ComponentObject") {
                element = syiro.component.Fetch(component);
            }
            else if (typeOfComponent == "Element") {
                element = component;
                component = syiro.component.FetchComponentObject(element);
            }
            if ((element !== null) && (typeof properties["animation"] == "string")) {
                if ((component.type == "button") && (element.getAttribute("data-syiro-component-type") == "toggle")) {
                    element = element.querySelector('div[data-syiro-minor-component="buttonToggle"]');
                }
                var postAnimationFunction = properties["function"];
                if (typeof postAnimationFunction == "function") {
                    var transitionEndUsed = false;
                    if ((typeof element.style["transition"] !== "undefined") || (typeof element.style["webkitTransition"] !== "undefined")) {
                        transitionEndUsed = true;
                        var transitionEndFlag = "webkitTransitionEnd";
                        if (typeof element.style["transition"] !== "undefined") {
                            transitionEndFlag = "transitionend";
                        }
                    }
                    if (transitionEndUsed) {
                        syiro.events.Add(transitionEndFlag, element, function () {
                            var postAnimationFunction = arguments[0];
                            var transitionEndFlag = arguments[1];
                            var element = arguments[2];
                            if (typeof postAnimationFunction == "function") {
                                postAnimationFunction(element);
                            }
                            syiro.events.Remove(transitionEndFlag, element);
                        }.bind(this, postAnimationFunction, transitionEndFlag));
                    }
                    else {
                        properties["function"].call(this, component);
                    }
                }
                element.setAttribute("data-syiro-animation", properties["animation"]);
            }
        }
        animation.Animate = Animate;
        function Reset(component) {
            var componentElement;
            if (syiro.utilities.TypeOfThing(component) == "ComponentObject") {
                componentElement = syiro.component.Fetch(component);
            }
            else {
                componentElement = component;
                component = syiro.component.FetchComponentObject(componentElement);
            }
            if (componentElement !== null) {
                if ((component.type == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                    componentElement = componentElement.querySelector('div[data-syiro-minor-component="buttonToggle"]');
                }
                componentElement.removeAttribute("data-syiro-animation");
                componentElement.removeAttribute("data-syiro-animation-status");
            }
        }
        animation.Reset = Reset;
        function FadeIn(component, postAnimationFunction) {
            syiro.animation.Animate(component, {
                "animation": "fade-in",
                "function": postAnimationFunction
            });
        }
        animation.FadeIn = FadeIn;
        function FadeOut(component, postAnimationFunction) {
            syiro.animation.Animate(component, {
                "animation": "fade-out",
                "function": postAnimationFunction
            });
        }
        animation.FadeOut = FadeOut;
        function Slide(component, postAnimationFunction) {
            syiro.animation.Animate(component, {
                "animation": "slide",
                "function": postAnimationFunction
            });
        }
        animation.Slide = Slide;
    })(animation = syiro.animation || (syiro.animation = {}));
})(syiro || (syiro = {}));
/*
    This is a namespace for Syiro utilities that are commonly used throughout Syiro's core code and may be useful to others.
*/
var syiro;
(function (syiro) {
    var utilities;
    (function (utilities) {
        function ElementCreator(type, attributes) {
            if ((typeof type == "string") && (typeof attributes == "object")) {
                var generatedElement = document.createElement(type);
                for (var attributeKey in attributes) {
                    var attributeValue = attributes[attributeKey];
                    if (attributeKey !== "content") {
                        if (attributeKey == "content-attr") {
                            attributeKey = "content";
                        }
                        generatedElement.setAttribute(attributeKey, syiro.utilities.SanitizeHTML(attributeValue));
                    }
                    else {
                        if ((typeof attributeValue == "string") || (syiro.utilities.TypeOfThing(attributeValue, "Element"))) {
                            var sanitizedContent = syiro.utilities.SanitizeHTML(attributeValue);
                            if (typeof attributeValue == "string") {
                                generatedElement.innerHTML = sanitizedContent;
                            }
                            else {
                                generatedElement.appendChild(sanitizedContent);
                            }
                        }
                    }
                }
                return generatedElement;
            }
        }
        utilities.ElementCreator = ElementCreator;
        function SanitizeHTML(content) {
            var updatedContent = false;
            if (typeof content == "string") {
                updatedContent = content.replace(/<*[^]script*>/g, "");
            }
            else if (syiro.utilities.TypeOfThing(content, "Element")) {
                if (content.tagName.toLowerCase() !== "script") {
                    var innerScriptElements = content.querySelectorAll("script");
                    if (innerScriptElements.length !== 0) {
                        for (var innerScriptElementIndex in innerScriptElements) {
                            var innerScriptElement = innerScriptElements[innerScriptElementIndex];
                            if (syiro.utilities.TypeOfThing(innerScriptElement, "Element")) {
                                innerScriptElement.parentElement.removeChild(innerScriptElement);
                            }
                        }
                    }
                }
                updatedContent = content;
            }
            return updatedContent;
        }
        utilities.SanitizeHTML = SanitizeHTML;
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
        function TypeOfThing(thing, checkAgainstType) {
            var thingType = (typeof thing);
            if (thingType !== "undefined") {
                if ((thingType == "object") && (typeof thing.nodeType == "undefined")) {
                    if ((typeof thing["id"] !== "undefined") && (typeof thing["type"] !== "undefined")) {
                        thingType = "ComponentObject";
                    }
                    else if ((typeof thing["link"] !== "undefined") && (typeof thing["title"] !== "undefined")) {
                        thingType = "LinkPropertiesObject";
                    }
                    else if (Array.isArray(thing) == true) {
                        thingType = "Array";
                    }
                    else {
                        thingType = thing.toString().replace("[object ", "").replace("]", "");
                    }
                }
                else if (typeof thing.nodeType !== "undefined") {
                    if (thing.nodeType !== 9) {
                        thingType = "Element";
                    }
                    else if (thing.nodeType == 9) {
                        thingType = "Document";
                    }
                }
            }
            if (typeof checkAgainstType == "string") {
                thingType = (checkAgainstType == thingType);
            }
            return thingType;
        }
        utilities.TypeOfThing = TypeOfThing;
    })(utilities = syiro.utilities || (syiro.utilities = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for generating Syiro components.
 */
/// <reference path="syiro.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var generator;
    (function (generator) {
        generator.ElementCreator = syiro.utilities.ElementCreator;
    })(generator = syiro.generator || (syiro.generator = {}));
})(syiro || (syiro = {}));
/*
    This is the namespace for Syiro Component and Generic Element Event Handling
*/
/// <reference path="animation.ts" />
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="interfaces.ts" />
var syiro;
(function (syiro) {
    var events;
    (function (events) {
        events.eventStrings = {
            "down": [], "up": [],
            "fullscreenchange": ["fullscreenchange", "mozfullscreenchange", "msfullscreenchange", "webkitfullscreenchange"],
            "orientationchange": ["orientationchange", "mozorientationchange", "msorientationchange"]
        };
        function Handler() {
            var component = arguments[0];
            var eventData = arguments[1];
            if (eventData.type.indexOf("touch") !== -1) {
                eventData.preventDefault();
            }
            syiro.events.Trigger(eventData.type, component, eventData);
        }
        events.Handler = Handler;
        function Trigger(eventType, component, eventData) {
            var componentId;
            var componentElement;
            var passableValue = null;
            var typeOfComponent = syiro.utilities.TypeOfThing(component);
            if (syiro.utilities.TypeOfThing(component, "ComponentObject")) {
                componentId = component.id;
                componentElement = syiro.component.Fetch(component);
            }
            else {
                componentId = syiro.component.FetchComponentObject(component)["id"];
                componentElement = component;
            }
            if (component.type == "searchbox") {
                componentElement = componentElement.firstElementChild;
            }
            var functionsForListener = syiro.data.Read(componentId + "->handlers->" + eventType);
            if ((component.type == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                passableValue = (!componentElement.hasAttribute("active"));
            }
            else if (componentElement.nodeName == "INPUT") {
                passableValue = componentElement.value;
            }
            else {
                passableValue = eventData;
            }
            for (var _i = 0; _i < functionsForListener.length; _i++) {
                var individualFunc = functionsForListener[_i];
                individualFunc.call(this, component, passableValue);
            }
        }
        events.Trigger = Trigger;
        function Add(listeners, component, listenerCallback) {
            var componentId;
            var allowListening = true;
            if (arguments.length == 3) {
                if (typeof listeners == "string") {
                    listeners = listeners.trim().split(" ");
                }
                var componentElement;
                if (syiro.utilities.TypeOfThing(component, "ComponentObject")) {
                    componentId = component.id;
                    componentElement = syiro.component.Fetch(component);
                    if (component.type == "list-item") {
                        allowListening = !(componentElement.querySelector("div") !== null);
                    }
                    else if (component.type == "searchbox") {
                        componentElement = componentElement.firstElementChild;
                    }
                }
                else {
                    componentId = syiro.component.FetchComponentObject(component)["id"];
                    componentElement = component;
                }
                if (allowListening) {
                    for (var _i = 0; _i < listeners.length; _i++) {
                        var listener = listeners[_i];
                        var currentListenersArray = syiro.data.Read(componentId + "->handlers->" + listener);
                        if (typeof currentListenersArray == "boolean") {
                            currentListenersArray = [listenerCallback];
                            if (syiro.data.Read(componentId + "->DisableInputTrigger") == false) {
                                componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component));
                            }
                        }
                        else {
                            if (currentListenersArray.indexOf(listenerCallback) == -1) {
                                currentListenersArray.push(listenerCallback);
                            }
                        }
                        syiro.data.Write(componentId + "->handlers->" + listener, currentListenersArray);
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
            var componentElement;
            var specFunc;
            if ((args.length >= 2) && (args.length < 4)) {
                if ((typeof args[0] == "string") || (typeof args[0].length !== "undefined")) {
                    listeners = args[0];
                    if (typeof listeners == "string") {
                        listeners = listeners.trim().split(" ");
                    }
                }
                else {
                    allowRemoval = false;
                }
                component = args[1];
                if (typeof args[2] == "function") {
                    specFunc = args[2];
                }
                if (syiro.utilities.TypeOfThing(component, "ComponentObject")) {
                    componentElement = syiro.component.Fetch(component);
                }
                else {
                    componentElement = component;
                    component = syiro.component.FetchComponentObject(component);
                }
                if (allowRemoval) {
                    if ((typeof componentElement !== "undefined") && (componentElement !== null)) {
                        for (var _a = 0; _a < listeners.length; _a++) {
                            var listener = listeners[_a];
                            var componentListeners = null;
                            if (typeof specFunc == "function") {
                                componentListeners = syiro.data.Read(component.id + "->handlers->" + listener);
                                var componentListenersFunctionIndex = componentListeners.indexOf(specFunc);
                                if (componentListenersFunctionIndex !== -1) {
                                    componentListeners.splice(componentListenersFunctionIndex, 1);
                                }
                            }
                            if ((componentListeners == null) || (componentListeners.length == 0)) {
                                syiro.data.Delete(component.id + "->handlers->" + listener);
                                componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component));
                            }
                            else {
                                syiro.data.Write(component.id + "->handlers->" + listener, componentListeners);
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
/*
This is the namespace for render-oriented functionality for Components, such as positioning.
*/
/// <reference path="component.ts" />
/// <reference path="data.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var render;
    (function (render) {
        function Position(positioningList, componentObject, relativeComponentObject) {
            var positioningAllowed = false;
            if (arguments.length == 3) {
                var componentElement;
                var relativeComponentElement;
                var typeOfPositioningList = syiro.utilities.TypeOfThing(positioningList);
                if (typeOfPositioningList == "string") {
                    positioningList = [arguments[0]];
                }
                else if ((typeOfPositioningList == "Array") && (positioningList.length !== 0)) {
                    positioningList = positioningList;
                }
                if (syiro.utilities.TypeOfThing(componentObject) == "ComponentObject") {
                    componentElement = syiro.component.Fetch(componentObject);
                }
                if (syiro.utilities.TypeOfThing(relativeComponentObject) == "ComponentObject") {
                    relativeComponentElement = syiro.component.Fetch(relativeComponentObject);
                }
                if ((typeof positioningList == "object") && (componentElement !== null) && (relativeComponentElement !== null)) {
                    positioningAllowed = true;
                    var componentDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition(componentElement);
                    var relativeComponentDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition(relativeComponentElement);
                    var componentHeight = componentDimensionsAndPosition["height"];
                    var componentWidth = componentDimensionsAndPosition["width"];
                    var relativeComponentHeight = relativeComponentDimensionsAndPosition["height"];
                    var relativeComponentWidth = relativeComponentDimensionsAndPosition["width"];
                    var relativeComponentYPosition = relativeComponentDimensionsAndPosition["y"];
                    var relativeComponentXPosition = relativeComponentDimensionsAndPosition["x"];
                    var componentWidthDifference = (componentWidth - relativeComponentWidth);
                    var componentAbovePosition = (relativeComponentYPosition - componentHeight);
                    var componentBelowPosition = (relativeComponentYPosition + relativeComponentHeight);
                    var componentLeftPosition = relativeComponentXPosition;
                    var componentRightPosition = relativeComponentXPosition;
                    if (componentWidthDifference > 0) {
                        componentRightPosition = (relativeComponentXPosition - componentWidthDifference);
                    }
                    else if (componentWidthDifference < 0) {
                        componentRightPosition = (relativeComponentXPosition + Math.abs(componentWidthDifference));
                    }
                    for (var _i = 0; _i < positioningList.length; _i++) {
                        var position = positioningList[_i];
                        var positionValue;
                        switch (position) {
                            case "above":
                                if (componentAbovePosition >= 0) {
                                    positionValue = componentAbovePosition;
                                }
                                else {
                                    positionValue = componentBelowPosition;
                                }
                                break;
                            case "below":
                                if (componentBelowPosition <= (syiro.device.height - componentHeight)) {
                                    positionValue = componentBelowPosition;
                                }
                                else {
                                    positionValue = componentAbovePosition;
                                }
                                break;
                            case "left":
                                if ((componentLeftPosition >= 0) && ((componentLeftPosition + componentWidth) < (syiro.device.width - componentWidth))) {
                                    positionValue = componentLeftPosition;
                                }
                                else {
                                    positionValue = componentRightPosition;
                                }
                                break;
                            case "right":
                                if (componentRightPosition > 0) {
                                    positionValue = componentRightPosition;
                                }
                                else {
                                    positionValue = componentLeftPosition;
                                }
                                break;
                            case "center":
                                if (componentWidthDifference > 0) {
                                    var primaryComponentSideLength = (componentWidthDifference / 2);
                                    if (((relativeComponentXPosition - primaryComponentSideLength) + componentWidth) > syiro.device.width) {
                                        positionValue = componentRightPosition;
                                    }
                                    else if ((relativeComponentXPosition - primaryComponentSideLength) < 0) {
                                        positionValue = componentLeftPosition;
                                    }
                                    else {
                                        positionValue = (relativeComponentXPosition - primaryComponentSideLength);
                                    }
                                }
                                else if (componentWidthDifference < 0) {
                                    positionValue = (relativeComponentXPosition + (Math.abs(componentWidthDifference) / 2));
                                }
                                else {
                                    positionValue = relativeComponentXPosition;
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
        function Scale(component, data) {
            // #region Variable Setup
            var componentId = component.id;
            var componentElement = syiro.component.Fetch(component);
            var parentHeight = componentElement.parentElement.clientHeight;
            var parentWidth = componentElement.parentElement.clientWidth;
            var initialDimensions = syiro.data.Read(componentId + "->scaling->initialDimensions");
            if ((initialDimensions.length !== 2) || (initialDimensions == false)) {
                if (initialDimensions == false) {
                    initialDimensions = [];
                }
                initialDimensions.push(componentElement.clientHeight);
                if (initialDimensions.length == 1) {
                    initialDimensions.push(componentElement.clientWidth);
                }
                else {
                    initialDimensions.reverse();
                }
                syiro.data.Write(componentId + "->scaling->initialDimensions", initialDimensions);
            }
            var componentHeight = initialDimensions[0];
            var componentWidth = initialDimensions[1];
            var ratios = syiro.data.Read(componentId + "->scaling->ratios");
            var fill = syiro.data.Read(componentId + "->scaling->fill");
            if (ratios !== false) {
                var scalingState = syiro.data.Read(componentId + "->scaling->state");
                if ((typeof scalingState == "undefined") || (scalingState == false)) {
                    syiro.data.Write(componentId + "->scaling->state", "no-scaling");
                    scalingState = "no-scaling";
                }
                if (ratios.length == 1) {
                    ratios.push(1.0);
                    ratios.reverse();
                }
                if (scalingState == "no-scaling") {
                    if (ratios[0] !== 0) {
                        componentHeight = (initialDimensions[0] * ratios[0]);
                    }
                    else {
                        componentHeight = initialDimensions[0];
                    }
                    if (ratios[1] !== 0) {
                        componentWidth = (initialDimensions[0] * (ratios[1] / ratios[0]));
                    }
                    else {
                        componentWidth = initialDimensions[1];
                    }
                    scalingState = "scaled";
                }
                else {
                    componentHeight = initialDimensions[0];
                    componentWidth = initialDimensions[1];
                    scalingState = "no-scaling";
                }
                if (componentWidth > syiro.device.width) {
                    componentWidth = syiro.device.width;
                    if ((ratios !== false) && (ratios[0] !== 0)) {
                        componentHeight = (componentWidth * (initialDimensions[0] / initialDimensions[1]));
                    }
                }
                syiro.data.Write(componentId + "->scaling->state", scalingState);
            }
            else if (fill !== false) {
                if (fill.length == 1) {
                    fill.push(1.0);
                    fill.reverse();
                }
                if (fill[0] !== 0) {
                    componentHeight = (parentHeight * fill[0]);
                }
                else {
                    componentHeight = initialDimensions[0];
                }
                if (fill[1] !== 0) {
                    componentWidth = (parentWidth * fill[1]);
                }
                else {
                    componentWidth = initialDimensions[1];
                }
            }
            syiro.component.CSS(componentElement, "height", componentHeight.toString() + "px");
            syiro.component.CSS(componentElement, "width", componentWidth.toString() + "px");
            var potentialComponentScalableChildren = syiro.data.Read(component.id + "->scaling->children");
            if (potentialComponentScalableChildren !== false) {
                if (syiro.utilities.TypeOfThing(potentialComponentScalableChildren, "Object")) {
                    var childComponentsArray = [];
                    for (var childSelector in potentialComponentScalableChildren) {
                        var childElement = componentElement.querySelector(childSelector);
                        var childComponent = syiro.component.FetchComponentObject(childElement);
                        var childScalingData = syiro.data.Read(component.id + "->scaling->children->" + childSelector + "->scaling");
                        syiro.data.Write(childComponent.id + "->scaling->initialDimensions", childScalingData["iniitalDimensions"]);
                        syiro.data.Write(childComponent.id + "->scaling->ratios", childScalingData["ratios"]);
                        syiro.data.Write(childComponent.id + "->scaling->fill", childScalingData["fill"]);
                        childComponentsArray.push(childComponent);
                        syiro.data.Delete(component.id + "->scaling->children->" + childSelector);
                    }
                    syiro.data.Write(component.id + "->scaling->children", childComponentsArray);
                }
                var componentChildren = syiro.data.Read(component.id + "->scaling->children");
                for (var _i = 0; _i < componentChildren.length; _i++) {
                    var childComponentObject = componentChildren[_i];
                    syiro.render.Scale(childComponentObject);
                }
            }
        }
        render.Scale = Scale;
    })(render = syiro.render || (syiro.render = {}));
})(syiro || (syiro = {}));
/*
    This is the namespace for core Syiro functionality.
*/
/// <reference path="data.ts" />
/// <reference path="events.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="render.ts" />
var syiro;
(function (syiro) {
    var component;
    (function (component_1) {
        component_1.lastUniqueIds = {};
        function CSS(component, property, newValue) {
            var typeOfComponent = syiro.utilities.TypeOfThing(component);
            var modifiableElement;
            var returnedValue;
            var modifiedStyling = false;
            if (typeOfComponent == "ComponentObject") {
                modifiableElement = syiro.component.Fetch(component);
            }
            else if (typeOfComponent == "Element") {
                modifiableElement = component;
            }
            if ((typeof modifiableElement !== "undefined") && (modifiableElement !== null)) {
                var currentElementStyling = modifiableElement.getAttribute("style");
                var elementStylingObject = {};
                if (currentElementStyling !== null) {
                    var currentElementStylingArray = currentElementStyling.split(";");
                    for (var styleKey in currentElementStylingArray) {
                        var cssPropertyValue = currentElementStylingArray[styleKey];
                        if (cssPropertyValue !== "") {
                            var propertyValueArray = cssPropertyValue.split(": ");
                            elementStylingObject[propertyValueArray[0].trim()] = propertyValueArray[1].trim();
                        }
                    }
                }
                var stylePropertyValue = elementStylingObject[property];
                if (typeof newValue == "undefined") {
                    if (stylePropertyValue !== undefined) {
                        returnedValue = stylePropertyValue;
                    }
                    else {
                        returnedValue = "";
                    }
                }
                else if ((newValue !== "") && (newValue !== false)) {
                    elementStylingObject[property] = newValue;
                    modifiedStyling = true;
                    returnedValue = newValue;
                }
                else {
                    if (typeof stylePropertyValue !== "undefined") {
                        elementStylingObject[property] = null;
                        modifiedStyling = true;
                    }
                }
                if (modifiedStyling) {
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
                returnedValue = "";
            }
            return returnedValue;
        }
        component_1.CSS = CSS;
        function Fetch(component) {
            var componentElement = document.querySelector('div[data-syiro-component-id="' + component.id + '"]');
            if (componentElement == null) {
                componentElement = syiro.data.Read(component.id + "->HTMLElement");
            }
            return componentElement;
        }
        component_1.Fetch = Fetch;
        function FetchComponentObject() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var component = { "id": "", "type": "" };
            var variableProvided;
            var previouslyDefined = false;
            if (arguments.length == 1) {
                if (typeof arguments[0] == "string") {
                    variableProvided = document.querySelector(arguments[0]);
                }
                else {
                    variableProvided = arguments[0];
                }
            }
            else if (arguments.length == 2) {
                if (typeof arguments[1] == "string") {
                    variableProvided = document.querySelector(arguments[1]);
                }
            }
            var typeOfVariableProvided = syiro.utilities.TypeOfThing(variableProvided);
            if (typeOfVariableProvided == "Element") {
                var possibleExistingId = variableProvided.getAttribute("data-syiro-component-id");
                if (possibleExistingId !== null) {
                    previouslyDefined = true;
                    component.id = possibleExistingId;
                    component.type = variableProvided.getAttribute("data-syiro-component");
                }
                else {
                    if ((arguments.length == 2) && (typeof arguments[0] == "string")) {
                        component.id = syiro.component.IdGen(arguments[0]);
                        component.type = arguments[0];
                    }
                    else if (arguments.length == 1) {
                        var idBase = "";
                        var potentialExistingType = variableProvided.getAttribute("data-syiro-component");
                        if (potentialExistingType !== null) {
                            idBase = potentialExistingType;
                            component.type = potentialExistingType;
                        }
                        else {
                            idBase = variableProvided.tagName.toLowerCase();
                            component.type = idBase;
                        }
                        component.id = syiro.component.IdGen(idBase);
                    }
                    variableProvided.setAttribute("data-syiro-component-id", component.id);
                    variableProvided.setAttribute("data-syiro-component", component.type);
                    if ((component.type == "button") && (variableProvided.getAttribute("data-syiro-component-type") == "dropdown") && (previouslyDefined == false)) {
                        syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.button.Toggle);
                    }
                }
            }
            else if ((typeOfVariableProvided == "Document") || (typeOfVariableProvided.indexOf("Screen") == 0) || typeOfVariableProvided == "Window") {
                var lowercasedType = typeOfVariableProvided.toLowerCase();
                component.id = lowercasedType;
                component.type = lowercasedType;
            }
            return component;
        }
        component_1.FetchComponentObject = FetchComponentObject;
        function FetchDimensionsAndPosition(component) {
            var dimensionsAndPosition = {};
            var componentElement;
            if (syiro.utilities.TypeOfThing(component) == "ComponentObject") {
                componentElement = syiro.component.Fetch(component);
            }
            else {
                componentElement = component;
            }
            var componentClientRectList = componentElement.getClientRects();
            dimensionsAndPosition["x"] = componentClientRectList[0].left;
            dimensionsAndPosition["y"] = componentClientRectList[0].top;
            dimensionsAndPosition["height"] = componentClientRectList[0].height;
            dimensionsAndPosition["width"] = componentClientRectList[0].width;
            return dimensionsAndPosition;
        }
        component_1.FetchDimensionsAndPosition = FetchDimensionsAndPosition;
        function FetchLinkedListComponentObject(component) {
            var listSelector = 'div[data-syiro-component="list"][data-syiro-component-owner="' + component.id + '"]';
            return syiro.component.FetchComponentObject(document.querySelector(listSelector));
        }
        component_1.FetchLinkedListComponentObject = FetchLinkedListComponentObject;
        function IdGen(type) {
            var lastUniqueIdOfType;
            if (syiro.component.lastUniqueIds[type] == undefined) {
                lastUniqueIdOfType = 0;
            }
            else {
                lastUniqueIdOfType = syiro.component.lastUniqueIds[type];
            }
            var newUniqueIdOfType = lastUniqueIdOfType + 1;
            syiro.component.lastUniqueIds[type] = newUniqueIdOfType;
            return (type + newUniqueIdOfType.toString());
        }
        component_1.IdGen = IdGen;
        function IsComponentObject(component) {
            return (syiro.utilities.TypeOfThing(component) == "ComponentObject");
        }
        component_1.IsComponentObject = IsComponentObject;
        function Update(componentId, componentElement) {
            if (syiro.data.Read(componentId + "->HTMLElement") !== false) {
                syiro.data.Write(componentId + "->HTMLElement", componentElement);
            }
        }
        component_1.Update = Update;
        function Add(appendOrPrepend, parentComponent, childComponent) {
            if (typeof appendOrPrepend == "boolean") {
                if (appendOrPrepend) {
                    appendOrPrepend = "append";
                }
                else {
                    appendOrPrepend = "prepend";
                }
            }
            var parentElement;
            if (syiro.utilities.TypeOfThing(parentComponent) == "ComponentObject") {
                parentElement = syiro.component.Fetch(parentComponent);
            }
            else {
                parentElement = parentComponent;
                parentComponent = syiro.component.FetchComponentObject(parentElement);
            }
            var childElement;
            var allowAdding = false;
            if (syiro.utilities.TypeOfThing(childComponent) == "ComponentObject") {
                if ((parentComponent["type"] == "navbar") && (syiro.data.Read(parentComponent["id"] + "->Position") == "top") && ((childComponent["type"] == "button") || (childComponent["type"] == "searchbox"))) {
                    allowAdding = true;
                }
                else if ((parentComponent["type"] == "list") && (childComponent["type"].indexOf("list") !== -1)) {
                    parentElement = parentElement.querySelector('div[data-syiro-minor-component="list-content"]');
                    allowAdding = true;
                }
                else if (typeof childComponent["link"] !== "undefined") {
                    childElement = syiro.utilities.ElementCreator("a", {
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
            else if (syiro.utilities.TypeOfThing(childComponent, "Element")) {
                childElement = childComponent;
                allowAdding = true;
            }
            if ((allowAdding) && (parentElement !== null) && (childElement !== null)) {
                if (appendOrPrepend == "prepend") {
                    parentElement.insertBefore(childElement, parentElement.firstChild);
                }
                else {
                    parentElement.appendChild(childElement);
                }
            }
            if (parentComponent["type"] == "list") {
                parentElement = parentElement.parentElement;
            }
            syiro.component.Update(parentComponent["id"], parentElement);
            return allowAdding;
        }
        component_1.Add = Add;
        function Remove(componentsToRemove) {
            var typeOfThing = syiro.utilities.TypeOfThing(componentsToRemove);
            var componentList;
            if ((typeOfThing == "ComponentObject") || (typeOfThing == "Element")) {
                componentList = [componentsToRemove];
            }
            else if (typeOfThing == "Array") {
                componentList = componentsToRemove;
            }
            for (var _i = 0; _i < componentList.length; _i++) {
                var component = componentList[_i];
                var typeOfComponent = syiro.utilities.TypeOfThing(component);
                var componentObject;
                var componentElement;
                if (typeOfComponent == "ComponentObject") {
                    componentObject = component;
                    componentElement = syiro.component.Fetch(component);
                }
                else if (typeOfComponent == "Element") {
                    componentObject = syiro.component.FetchComponentObject(component);
                    componentElement = component;
                }
                if (typeof componentElement !== "undefined") {
                    var parentElement = componentElement.parentElement;
                    parentElement.removeChild(componentElement);
                    if (syiro.data.Read(componentObject.id) !== false) {
                        syiro.data.Delete(componentObject.id);
                    }
                    if (parentElement.hasAttribute("data-syiro-component-id")) {
                        syiro.component.Update(parentElement.getAttribute("data-syiro-component-id"), parentElement);
                    }
                }
            }
        }
        component_1.Remove = Remove;
    })(component = syiro.component || (syiro.component = {}));
})(syiro || (syiro = {}));
/*
    This is the namespace for Syiro's init system
*/
/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />
var syiro;
(function (syiro) {
    var init;
    (function (init) {
        function Parser(componentElement) {
            if ((componentElement.localName !== null) && (syiro.utilities.TypeOfThing(componentElement.hasAttribute, "function")) && (componentElement.hasAttribute("data-syiro-component"))) {
                var component = syiro.component.FetchComponentObject(componentElement);
                switch (component.type) {
                    case "button":
                        if (componentElement.getAttribute("data-syiro-component-type") !== "basic") {
                            syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.button.Toggle);
                        }
                        break;
                    case "buttongroup":
                        syiro.init.Buttongroup(component);
                        break;
                    case "grid":
                        syiro.init.Grid(component);
                        break;
                    case "list":
                        syiro.init.List(component);
                        break;
                    case "media-player":
                        syiro.init.MediaPlayer(component);
                        syiro.render.Scale(component);
                        break;
                    case "searchbox":
                        syiro.init.Searchbox(component);
                        break;
                    case "sidepane":
                        syiro.init.Sidepane(component);
                        break;
                    case "toast":
                        syiro.init.Toast(component);
                        break;
                }
                var innerComponentElements = componentElement.querySelectorAll('div[data-syiro-component]');
                for (var _i = 0; _i < innerComponentElements.length; _i++) {
                    var childComponentElement = innerComponentElements[_i];
                    syiro.init.Parser(childComponentElement);
                }
                syiro.data.Delete(component.id + "->HTMLElement");
            }
        }
        init.Parser = Parser;
        function createContentOverlay(purpose) {
            var contentOverlay = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "overlay", "data-syiro-overlay-purpose": purpose });
            document.body.appendChild(contentOverlay);
            return contentOverlay;
        }
        init.createContentOverlay = createContentOverlay;
        function Buttongroup(component) {
            var componentElement = syiro.component.Fetch(component);
            var innerButtons = componentElement.querySelectorAll('div[data-syiro-component="button"]');
            for (var _i = 0; _i < innerButtons.length; _i++) {
                var innerButton = innerButtons[_i];
                var buttonComponentObject = syiro.component.FetchComponentObject(innerButton);
                syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle);
            }
        }
        init.Buttongroup = Buttongroup;
        function Grid(component) {
            syiro.events.Add(syiro.events.eventStrings["orientationchange"], syiro.device.OrientationObject, syiro.grid.Scale.bind(this, component));
            syiro.events.Add("resize", window, syiro.grid.Scale.bind(this, component));
            syiro.grid.Scale(component);
        }
        init.Grid = Grid;
        function List(component) {
            var componentElement = syiro.component.Fetch(component);
            if (componentElement.parentElement.getAttribute("data-syiro-minor-component") == "list-content") {
                var listHeader = componentElement.querySelector('div[data-syiro-minor-component="list-header"]');
                syiro.events.Add(syiro.events.eventStrings["up"], listHeader, syiro.list.Toggle);
            }
        }
        init.List = List;
        function MediaPlayer(component) {
            if (syiro.data.Read(component.id + "->NoUX") == false) {
                var componentElement = syiro.component.Fetch(component);
                var innerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
                var mediaPlayerType = componentElement.getAttribute("data-syiro-component-type");
                var mediaControlArea = componentElement.querySelector('div[data-syiro-component="media-control"]');
                var mediaControlComponent = syiro.component.FetchComponentObject(mediaControlArea);
                syiro.events.Add("contextmenu", innerContentElement, function () {
                    var e = arguments[1];
                    e.preventDefault();
                });
                syiro.events.Add("durationchange", innerContentElement, syiro.mediaplayer.DurationChange.bind(this, component));
                syiro.events.Add("timeupdate", innerContentElement, function () {
                    syiro.mediaplayer.SetTime(arguments[0], "tick");
                }.bind(this, component, "tick"));
                syiro.events.Add("ended", innerContentElement, syiro.mediaplayer.Reset.bind(this, component));
                var contentElementObserver = new MutationObserver(function () {
                    syiro.mediaplayer.Reset(arguments[0]);
                }.bind(this, component));
                var contentElementObserverOptions = {
                    childList: false,
                    attributes: true,
                    characterData: false,
                    subtree: false
                };
                contentElementObserver.observe(innerContentElement, contentElementObserverOptions);
                syiro.init.MediaControl(component, mediaControlComponent);
                if (mediaPlayerType == "audio") {
                    syiro.audioplayer.CenterInformation(component);
                }
                else if (mediaPlayerType == "video") {
                    if (syiro.device.SupportsTouch) {
                        syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.mediacontrol.Toggle.bind(this, mediaControlComponent));
                    }
                    else {
                        syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, syiro.mediaplayer.PlayOrPause.bind(this, component));
                        syiro.events.Add(["mouseenter", "mouseleave"], componentElement, syiro.mediacontrol.Toggle.bind(this, mediaControlComponent));
                    }
                }
                syiro.mediaplayer.Configure(component);
            }
        }
        init.MediaPlayer = MediaPlayer;
        function MediaControl(componentObject, mediaControlComponentObject) {
            var componentElement = syiro.component.Fetch(componentObject);
            var mediaControlElement = syiro.component.Fetch(mediaControlComponentObject);
            var playerRange = mediaControlElement.querySelector('input[type="range"]');
            syiro.events.Add(syiro.events.eventStrings["down"], playerRange, function () {
                var playerComponentObject = arguments[0];
                syiro.data.Write(playerComponentObject["id"] + "->IsChangingInputValue", true);
                if ((syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false) && (syiro.mediaplayer.IsPlaying(playerComponentObject))) {
                    syiro.mediaplayer.PlayOrPause(playerComponentObject);
                }
            }.bind(this, componentObject));
            syiro.events.Add(syiro.events.eventStrings["up"], playerRange, function () {
                var playerComponentObject = arguments[0];
                var playerRange = arguments[1];
                if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false) {
                    syiro.data.Delete(playerComponentObject["id"] + "->IsChangingInputValue");
                    syiro.mediaplayer.PlayOrPause(playerComponentObject);
                }
            }.bind(this, componentObject));
            syiro.events.Add("input", playerRange, function () {
                var playerComponentObject = arguments[0];
                var playerRange = arguments[1];
                var valueNum = Number(playerRange.value);
                if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false) {
                    syiro.mediaplayer.SetTime(playerComponentObject, valueNum);
                }
                else {
                    syiro.mediaplayer.SetVolume(playerComponentObject, valueNum, "input");
                }
            }.bind(this, componentObject));
            var playButton = mediaControlElement.querySelector('div[data-syiro-render-icon="play"]');
            syiro.events.Add(syiro.events.eventStrings["up"], playButton, syiro.mediaplayer.PlayOrPause.bind(this, componentObject));
            var volumeButton = mediaControlElement.querySelector('div[data-syiro-render-icon="volume"]');
            var volumeButtonComponent = syiro.component.FetchComponentObject(volumeButton);
            syiro.events.Add(syiro.events.eventStrings["up"], volumeButtonComponent, syiro.mediacontrol.ShowVolumeSlider.bind(this, mediaControlComponentObject));
            var menuButton = mediaControlElement.querySelector('div[data-syiro-render-icon="menu"]');
            if (menuButton !== null) {
                var menuButtonObject = syiro.component.FetchComponentObject(menuButton);
                syiro.events.Add(syiro.events.eventStrings["up"], menuButtonObject, syiro.mediaplayer.ToggleMenuDialog.bind(this, componentObject));
            }
            if (componentElement.getAttribute("data-syiro-component-type") == "video") {
                var fullscreenButtonElement = mediaControlElement.querySelector('div[data-syiro-render-icon="fullscreen"]');
                if (fullscreenButtonElement !== null) {
                    syiro.events.Add(syiro.events.eventStrings["up"], fullscreenButtonElement, syiro.mediaplayer.ToggleFullscreen.bind(this, componentObject));
                }
            }
        }
        init.MediaControl = MediaControl;
        function Searchbox(component) {
            var componentElement = syiro.component.Fetch(component);
            if (syiro.data.Read(component.id + "->suggestions") !== false) {
                syiro.events.Add("keyup", componentElement.querySelector("input"), syiro.searchbox.Suggestions);
                syiro.events.Add("blur", componentElement.querySelector("input"), function () {
                    var searchboxObject = arguments[0];
                    var searchboxLinkedList = syiro.component.FetchLinkedListComponentObject(searchboxObject);
                    syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important");
                }.bind(this, component));
            }
            var innerSearchboxButton = componentElement.querySelector('div[data-syiro-component="button"]');
            syiro.events.Add(syiro.events.eventStrings["up"], innerSearchboxButton, function () {
                var searchboxComponent = arguments[0];
                var searchboxElement = syiro.component.Fetch(searchboxComponent);
                var searchboxInput = searchboxElement.querySelector("input");
                syiro.events.Trigger("input", arguments[0]);
            }.bind(this, component));
        }
        init.Searchbox = Searchbox;
        function Sidepane(component) {
            var componentElement = syiro.component.Fetch(component);
            var sidepaneContentOverlayElement = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="sidepane"]');
            var innerSidepaneEdge = componentElement.querySelector('div[data-syiro-minor-component="sidepane-edge"]');
            syiro.events.Add(syiro.events.eventStrings["down"], innerSidepaneEdge, syiro.sidepane.GestureInit);
            if (sidepaneContentOverlayElement == null) {
                sidepaneContentOverlayElement = syiro.init.createContentOverlay("sidepane");
                syiro.events.Add(syiro.events.eventStrings["down"], sidepaneContentOverlayElement, function () {
                    syiro.events.Add(syiro.events.eventStrings["up"], arguments[1], function () {
                        syiro.sidepane.Toggle(arguments[0]);
                        syiro.events.Remove(syiro.events.eventStrings["up"], arguments[1]);
                    }.bind(this, arguments[0]));
                }.bind(this, component));
            }
        }
        init.Sidepane = Sidepane;
        function Toast(component) {
            var componentElement = syiro.component.Fetch(component);
            var actionHandlers = syiro.data.Read(component.id + "->ActionHandlers");
            var toastButtons = componentElement.querySelectorAll('div[data-syiro-component="button"]');
            if (componentElement.getAttribute("data-syiro-component-type") == "dialog") {
                var toastContentOverlayElement = document.querySelector('div[data-syiro-component="overlay"][data-syiro-overlay-purpose="toast"]');
                if (toastContentOverlayElement == null) {
                    toastContentOverlayElement = syiro.init.createContentOverlay("toast");
                }
            }
            for (var _i = 0; _i < toastButtons.length; _i++) {
                var toastButton = toastButtons[_i];
                var toastButtonObject = syiro.component.FetchComponentObject(toastButton);
                var dialogAction = toastButton.getAttribute("data-syiro-dialog-action");
                syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, syiro.toast.Toggle.bind(this, component));
                if (actionHandlers !== false) {
                    if (typeof actionHandlers[dialogAction] !== "undefined") {
                        syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, actionHandlers[dialogAction]);
                    }
                }
            }
            if (actionHandlers !== false) {
                syiro.data.Delete(component.id + "->ActionHandlers");
            }
        }
        init.Toast = Toast;
    })(init = syiro.init || (syiro.init = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for the Syiro Button, Buttongroup, and Toggle Button components.
 */
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var button;
    (function (button) {
        function New(properties) {
            if (typeof properties["type"] == "undefined") {
                if ((typeof properties["list"] == "undefined") && (typeof properties["items"] == "undefined")) {
                    properties["type"] = "basic";
                }
                else {
                    properties["type"] = "dropdown";
                }
            }
            var componentId = syiro.component.IdGen("button");
            var componentElement;
            var componentData = {
                "data-syiro-component": "button",
                "data-syiro-component-id": componentId,
                "data-syiro-component-type": properties["type"]
            };
            if (properties["type"] !== "toggle") {
                componentData["content"] = "";
                if (properties["type"] == "dropdown") {
                    componentData["data-syiro-render-icon"] = "menu";
                }
                if (typeof properties["icon"] == "string") {
                    componentData["style"] = 'background-image: url("' + properties["icon"] + '")';
                    componentData["data-syiro-render-icon"] = "custom";
                    delete properties["icon"];
                }
                if (typeof properties["image"] == "string") {
                    var primaryImage = syiro.utilities.ElementCreator("img", { "src": properties["image"] });
                    componentData["content"] = primaryImage.outerHTML + componentData["content"];
                    delete properties["image"];
                }
                if (typeof properties["content"] == "string") {
                    componentData["content"] = properties["content"];
                    delete properties["content"];
                }
            }
            if (properties["type"] == "dropdown") {
                var listComponent;
                if (typeof properties["items"] !== "undefined") {
                    listComponent = syiro.list.New({ "items": properties["items"] });
                }
                else {
                    listComponent = properties["list"];
                }
                var listComponentElement = syiro.component.Fetch(listComponent);
                document.body.appendChild(listComponentElement);
                listComponentElement.setAttribute("data-syiro-component-owner", componentId);
                componentData["aria-owns"] = listComponent["id"];
                delete properties["items"];
                delete properties["list"];
                if (typeof properties["position"] == "undefined") {
                    properties["position"] = ["below", "center"];
                }
                syiro.data.Write(listComponent["id"] + "->render", properties["position"]);
                delete properties["position"];
            }
            else if (properties["type"] == "toggle") {
                var buttonToggleAttributes = { "data-syiro-minor-component": "buttonToggle" };
                if ((typeof properties["default"] == "boolean") && (properties["default"])) {
                    buttonToggleAttributes["data-syiro-component-status"] = "true";
                    delete properties["default"];
                }
                componentData["content"] = syiro.utilities.ElementCreator("div", buttonToggleAttributes);
            }
            delete properties["type"];
            componentElement = syiro.utilities.ElementCreator("div", componentData);
            for (var propertyKey in properties) {
                componentElement.setAttribute(propertyKey, properties[propertyKey]);
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "button" };
        }
        button.New = New;
        button.Generate = New;
        function SetIcon(component, content) {
            var setSucceeded = false;
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")) {
                if (content !== "") {
                    syiro.component.CSS(componentElement, "background-image", 'url("' + content + '")');
                    componentElement.setAttribute("data-syiro-render-icon", "custom");
                }
                else {
                    syiro.component.CSS(componentElement, "background-image", "");
                    componentElement.removeAttribute("data-syiro-render-icon");
                }
                syiro.component.Update(component.id + "->HTMLElement", componentElement);
                setSucceeded = true;
            }
            return setSucceeded;
        }
        button.SetIcon = SetIcon;
        function SetImage(component, content) {
            var setSucceeded = false;
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")) {
                var innerImage = componentElement.querySelector("img");
                if (content !== "") {
                    if (innerImage == null) {
                        innerImage = document.createElement("img");
                        componentElement.insertBefore(innerImage, componentElement.firstChild);
                    }
                    innerImage.setAttribute("src", content);
                    syiro.component.Update(component.id, componentElement);
                }
                else if ((content == "") && (innerImage !== null)) {
                    syiro.component.Remove(innerImage);
                }
                setSucceeded = true;
            }
            return setSucceeded;
        }
        button.SetImage = SetImage;
        function SetText(component, content) {
            var setSucceeded = false;
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")) {
                componentElement.textContent = content;
                syiro.component.Update(component.id, componentElement);
                setSucceeded = true;
            }
            return setSucceeded;
        }
        button.SetText = SetText;
        button.SetLabel = syiro.button.SetText;
        function Toggle(component, active) {
            var component = arguments[0];
            var componentElement = syiro.component.Fetch(component);
            if (componentElement.getAttribute("data-syiro-component-type") == "dropdown") {
                var linkedListComponentObject = syiro.component.FetchLinkedListComponentObject(component);
                var linkedListComponentElement = syiro.component.Fetch(linkedListComponentObject);
                if (syiro.component.CSS(linkedListComponentElement, "visibility") !== "") {
                    componentElement.removeAttribute("active");
                    syiro.component.CSS(linkedListComponentElement, "visibility", "");
                }
                else {
                    var linkedListComponentElementWidth = componentElement.clientWidth;
                    if (linkedListComponentElementWidth < 200) {
                        linkedListComponentElementWidth = 200;
                    }
                    syiro.component.CSS(linkedListComponentElement, "width", linkedListComponentElementWidth + "px");
                    var positionInformation = syiro.data.Read(linkedListComponentObject["id"] + "->render");
                    syiro.render.Position(positionInformation, linkedListComponentObject, component);
                    componentElement.setAttribute("active", "");
                    syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important");
                }
            }
            else if (componentElement.getAttribute("data-syiro-component-type") == "toggle") {
                if (typeof active == "undefined") {
                    active = componentElement.hasAttribute("active");
                }
                else {
                    active = !active;
                }
                if (active) {
                    syiro.animation.Reset(component);
                    componentElement.removeAttribute("active");
                }
                else {
                    syiro.animation.Slide(component);
                    componentElement.setAttribute("active", "true");
                }
            }
        }
        button.Toggle = Toggle;
        ;
    })(button = syiro.button || (syiro.button = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var buttongroup;
    (function (buttongroup) {
        function New(properties) {
            if (typeof properties["items"] !== "undefined") {
                if (properties["items"].length >= 2) {
                    var componentId = syiro.component.IdGen("buttongroup");
                    var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "buttongroup", "data-syiro-component-id": componentId });
                    for (var _i = 0, _a = properties["items"]; _i < _a.length; _i++) {
                        var buttonItem = _a[_i];
                        var typeOfButton = syiro.utilities.TypeOfThing(buttonItem);
                        if (typeOfButton == "Object") {
                            buttonItem = syiro.button.New(buttonItem);
                        }
                        var buttonElement = syiro.component.Fetch(buttonItem);
                        if (buttonElement.getAttribute("data-syiro-component-type") == "basic") {
                            componentElement.appendChild(buttonElement);
                        }
                    }
                    componentElement = syiro.buttongroup.CalculateInnerButtonWidth(componentElement);
                    if ((typeof properties["active"] == "number") && (properties["active"] <= properties["items"].length)) {
                        var defaultActiveButton = componentElement.querySelector('div[data-syiro-component="button"]:nth-of-type(' + properties["active"] + ')');
                        var activeButtonComponent = syiro.component.FetchComponentObject(defaultActiveButton);
                        defaultActiveButton.setAttribute("active", "");
                        syiro.component.Update(activeButtonComponent["id"], defaultActiveButton);
                    }
                    syiro.data.Write(componentId + "->HTMLElement", componentElement);
                    return { "id": componentId, "type": "buttongroup" };
                }
            }
        }
        buttongroup.New = New;
        buttongroup.Generate = New;
        function CalculateInnerButtonWidth(component) {
            var typeOfComponent = syiro.utilities.TypeOfThing(component);
            var componentElement;
            if (typeOfComponent == "ComponentObject") {
                if (component.type == "buttongroup") {
                    componentElement = syiro.component.Fetch(component);
                }
            }
            else if (typeOfComponent == "Element") {
                componentElement = component;
            }
            if (componentElement !== null) {
                var innerButtonElements = componentElement.querySelectorAll('div[data-syiro-component="button"]');
                var hasOddNumberOfButtons = false;
                var middleButtonNumber = 0;
                if (Number((innerButtonElements.length / 2).toFixed()) !== (innerButtonElements.length / 2)) {
                    hasOddNumberOfButtons = true;
                    middleButtonNumber = Math.round(innerButtonElements.length / 2);
                }
                for (var innerButtonElementsIndex in innerButtonElements) {
                    var buttonElement = innerButtonElements[innerButtonElementsIndex];
                    var widthValue = "calc(100% / " + innerButtonElements.length + ") !important";
                    if (hasOddNumberOfButtons && (innerButtonElementsIndex == middleButtonNumber)) {
                        widthValue = "calc(100% / " + innerButtonElements.length + " - 2px) !important";
                    }
                    else if (innerButtonElementsIndex == (innerButtonElements.length - 1)) {
                        widthValue = "calc(100% / " + innerButtonElements.length + " - " + (innerButtonElements.length - 1) + "px) !important";
                    }
                    syiro.component.CSS(buttonElement, "width", widthValue);
                }
                return componentElement;
            }
        }
        buttongroup.CalculateInnerButtonWidth = CalculateInnerButtonWidth;
        function Toggle(buttonComponent) {
            var buttonElement = syiro.component.Fetch(buttonComponent);
            var parentButtongroup = buttonElement.parentElement;
            var parentButtongroupComponentObject = syiro.component.FetchComponentObject(parentButtongroup);
            var potentialActiveButton = parentButtongroup.querySelector('div[data-syiro-component="button"][active]');
            if (potentialActiveButton !== null) {
                potentialActiveButton.removeAttribute("active");
            }
            buttonElement.setAttribute("active", "");
            syiro.component.Update(parentButtongroupComponentObject["id"], parentButtongroup);
        }
        buttongroup.Toggle = Toggle;
    })(buttongroup = syiro.buttongroup || (syiro.buttongroup = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for information and functionality Syiro provides regarding the device using Syiro.
*/
/// <reference path="events.ts" />
/// <reference path="interfaces.ts" />
var syiro;
(function (syiro) {
    var device;
    (function (device) {
        device.HasCryptography = true;
        device.HasGeolocation = true;
        device.HasIndexedDB = true;
        device.HasLocalStorage = true;
        device.IsOnline = true;
        device.SupportsMutationObserver = false;
        device.SupportsTouch = false;
        device.OrientationObject = screen;
        function Detect() {
            // #region Do Not Track
            if (typeof navigator.doNotTrack !== "undefined") {
                syiro.device.DoNotTrack = Boolean(navigator.doNotTrack);
            }
            else {
                syiro.device.DoNotTrack = true;
            }
            syiro.device.HasCryptography = (typeof window.crypto !== "undefined");
            syiro.device.HasGeolocation = (typeof navigator.geolocation !== "undefined");
            syiro.device.HasIndexedDB == (typeof window.indexedDB !== "undefined");
            syiro.device.HasLocalStorage = (typeof window.localStorage !== "undefined");
            if ((typeof MutationObserver !== "undefined") || (typeof WebKitMutationObserver !== "undefined")) {
                if (typeof WebKitMutationObserver !== "undefined") {
                    MutationObserver = WebKitMutationObserver;
                }
                syiro.device.SupportsMutationObserver = true;
            }
            if (typeof navigator.onLine !== "undefined") {
                syiro.device.IsOnline = navigator.onLine;
                syiro.events.Add("online", document, function () {
                    syiro.device.IsOnline = true;
                });
                syiro.events.Add("offline", document, function () {
                    syiro.device.IsOnline = false;
                });
            }
            syiro.device.FetchOperatingSystem();
            var eventsToRemove;
            if ((navigator.userAgent.indexOf("Firefox/") == -1) && (syiro.device.OperatingSystem !== "Linux") && (syiro.device.OperatingSystem !== "OS X") && (syiro.device.OperatingSystem !== "Sailfish") && (syiro.device.OperatingSystem !== "Windows")) {
                syiro.device.SupportsTouch = true;
                syiro.events.eventStrings["down"] = ["touchstart"];
                syiro.events.eventStrings["up"] = ["touchend"];
                syiro.events.eventStrings["move"] = ["touchmove"];
            }
            else {
                syiro.events.eventStrings["down"] = ["mousedown"];
                syiro.events.eventStrings["up"] = ["mouseup"];
                syiro.events.eventStrings["move"] = ["mousemove"];
            }
            Object.freeze(syiro.events.eventStrings["down"]);
            Object.freeze(syiro.events.eventStrings["up"]);
            Object.freeze(syiro.events.eventStrings["move"]);
            syiro.device.FetchScreenDetails();
            syiro.device.Orientation = syiro.device.FetchScreenOrientation();
            syiro.events.Add("resize", window, syiro.device.FetchScreenDetails);
            var orientationChangeHandler = function () {
                var currentOrientation = syiro.device.FetchScreenOrientation();
                if (currentOrientation !== syiro.device.Orientation) {
                    syiro.device.Orientation = currentOrientation;
                    var allPlayers = document.querySelectorAll('div[data-syiro-component$="player"]');
                    for (var playerIndex in allPlayers) {
                        var thisPlayer = allPlayers[playerIndex];
                        if (syiro.utilities.TypeOfThing(thisPlayer, "Element")) {
                            syiro.render.Scale(syiro.component.FetchComponentObject(thisPlayer));
                            if (thisPlayer.getAttribute("data-syiro-component-type") == "audio") {
                                var mediaPlayerComponent = syiro.component.FetchComponentObject(thisPlayer);
                                syiro.mediaplayer.CenterInformation(mediaPlayerComponent);
                            }
                        }
                    }
                    if (arguments[0] == "interval") {
                        var orientationChangeViaIntervalHanders = syiro.data.Read("screen->handlers->orientationchange-viainterval");
                        for (var orientationChangeIndex in orientationChangeViaIntervalHanders) {
                            orientationChangeViaIntervalHanders[orientationChangeIndex]();
                        }
                    }
                }
            };
            if ((typeof screen.orientation !== "undefined") && (typeof screen.orientation.onchange !== "undefined")) {
                syiro.device.OrientationObject = screen.orientation;
                syiro.events.eventStrings["orientationchange"] = ["change"];
            }
            else if (typeof screen.onmsorientationchange !== "undefined") {
                syiro.device.OrientationObject = screen;
                syiro.events.eventStrings["orientationchange"] = ["msorientationchange"];
            }
            else if (typeof screen.onmozorientationchange !== "undefined") {
                syiro.device.OrientationObject = screen;
                syiro.events.eventStrings["orientationchange"] = ["mozorientationchange"];
            }
            else {
                syiro.events.eventStrings["orientationchange"] = ["orientationchange-viainterval"];
            }
            if (syiro.events.eventStrings["orientationchange"][0] !== "orientationchange-viainterval") {
                syiro.events.Add(syiro.events.eventStrings["orientationchange"], syiro.device.OrientationObject, orientationChangeHandler);
            }
            else {
                window.setInterval(orientationChangeHandler.bind(this, "interval"), 2000);
            }
            Object.freeze(syiro.events.eventStrings["orientationchange"]);
            Object.freeze(syiro.events.eventStrings);
        }
        device.Detect = Detect;
        function FetchOperatingSystem() {
            var userAgent = navigator.userAgent;
            if (userAgent.indexOf("Android") !== -1) {
                syiro.device.OperatingSystem = "Android";
            }
            else if ((userAgent.indexOf("iPhone") !== -1) || (userAgent.indexOf("iPad") !== -1)) {
                syiro.device.OperatingSystem = "iOS";
            }
            else if ((userAgent.indexOf("Linux") !== -1) && (userAgent.indexOf("Android") == -1)) {
                syiro.device.OperatingSystem = "Linux";
                if (userAgent.indexOf("Sailfish") !== -1) {
                    syiro.device.OperatingSystem = "Sailfish";
                }
                else if ((userAgent.indexOf("Ubuntu") !== -1) && ((userAgent.indexOf("Mobile") !== -1) || (userAgent.indexOf("Tablet") !== -1))) {
                    syiro.device.OperatingSystem = "Ubuntu Touch";
                }
            }
            else if (userAgent.indexOf("Macintosh") !== -1) {
                syiro.device.OperatingSystem = "OS X";
            }
            else if (userAgent.indexOf("Windows Phone") !== -1) {
                syiro.device.OperatingSystem = "Windows Phone";
            }
            else if (userAgent.indexOf("Windows NT") !== -1) {
                syiro.device.OperatingSystem = "Windows";
            }
            else {
                syiro.device.OperatingSystem = "Other";
            }
            return syiro.device.OperatingSystem;
        }
        device.FetchOperatingSystem = FetchOperatingSystem;
        function FetchScreenDetails() {
            syiro.device.height = screen.height;
            syiro.device.width = screen.width;
            if (syiro.device.height < 720) {
                syiro.device.IsSubHD = true;
                syiro.device.IsHD = false;
                syiro.device.IsFullHDOrAbove = false;
            }
            else {
                if (((syiro.device.height >= 720) && (syiro.device.height < 1080)) && (syiro.device.width >= 1280)) {
                    syiro.device.IsSubHD = false;
                    syiro.device.IsHD = true;
                    syiro.device.IsFullHDOrAbove = false;
                }
                else if ((syiro.device.height >= 1080) && (syiro.device.width >= 1920)) {
                    syiro.device.IsSubHD = false;
                    syiro.device.IsHD = true;
                    syiro.device.IsFullHDOrAbove = true;
                }
            }
        }
        device.FetchScreenDetails = FetchScreenDetails;
        function FetchScreenOrientation() {
            var deviceOrientation = "portrait";
            if ((typeof screen.orientation !== "undefined") && (typeof screen.orientation.onchange !== "undefined")) {
                deviceOrientation = screen.orientation;
            }
            else if (typeof screen.onmsorientationchange !== "undefined") {
                deviceOrientation = screen.msOrientation;
            }
            else if (typeof screen.onmozorientationchange !== "undefined") {
                deviceOrientation = screen.mozOrientation;
            }
            if (deviceOrientation == "landscape-primary") {
                deviceOrientation = "landscape";
            }
            else if (screen.height < screen.width) {
                deviceOrientation = "landscape";
            }
            return deviceOrientation;
        }
        device.FetchScreenOrientation = FetchScreenOrientation;
    })(device = syiro.device || (syiro.device = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for Syiro Grid component and it's sub-component, Grid Item
 */
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var grid;
    (function (grid) {
        function New(properties) {
            var component = { "id": syiro.component.IdGen("grid"), "type": "grid" };
            var renderItems;
            if (syiro.utilities.TypeOfThing(properties["columns"], "number")) {
                renderItems = properties["columns"].toString();
            }
            else {
                renderItems = "dynamic";
            }
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component-id": component.id, "data-syiro-component": "grid", "data-syiro-render-columns": renderItems });
            if (syiro.utilities.TypeOfThing(properties["items"], "Array")) {
                for (var _i = 0, _a = properties["items"]; _i < _a.length; _i++) {
                    var gridItemProperties = _a[_i];
                    var gridItem = syiro.griditem.New(gridItemProperties);
                    var gridItemElement = syiro.component.Fetch(gridItem);
                    componentElement.appendChild(gridItemElement);
                }
            }
            syiro.data.Write(component.id + "->HTMLElement", componentElement);
            return component;
        }
        grid.New = New;
        function Scale(component) {
            if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "grid")) {
                var componentElement = syiro.component.Fetch(component);
                var componentDimensions = syiro.component.FetchDimensionsAndPosition(componentElement);
                var componentWidth = componentDimensions["width"];
                var gridItemWidth;
                var renderColumns = componentElement.getAttribute("data-syiro-render-columns");
                var firstGridItem = componentElement.querySelector('div[data-syiro-component="grid-item"]:first-of-type');
                var hasInnerGridItems = (firstGridItem !== null);
                if (hasInnerGridItems) {
                    if (renderColumns !== "dynamic") {
                        renderColumns = Number(renderColumns);
                        var innerGridItems = componentElement.querySelectorAll('div[data-syiro-component="grid-item"]');
                        var gridItemPaddingCalculation = (componentWidth * 0.03);
                        gridItemWidth = ((componentWidth / renderColumns) - gridItemPaddingCalculation);
                        for (var innerGridItemIndex = 0; innerGridItemIndex < innerGridItems.length; innerGridItemIndex++) {
                            var gridItem = innerGridItems[innerGridItemIndex];
                            syiro.component.CSS(gridItem, "width", gridItemWidth.toString() + "px");
                        }
                    }
                }
            }
        }
        grid.Scale = Scale;
    })(grid = syiro.grid || (syiro.grid = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var griditem;
    (function (griditem) {
        function New(properties) {
            if ((syiro.utilities.TypeOfThing(properties["html"], "Element")) || (syiro.utilities.TypeOfThing(properties["html"], "string"))) {
                var component = { "id": syiro.component.IdGen("grid-item"), "type": "grid-item" };
                var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component-id": component.id, "data-syiro-component": "grid-item" });
                properties["html"] = syiro.utilities.SanitizeHTML(properties["html"]);
                if (syiro.utilities.TypeOfThing(properties["html"], "Element")) {
                    componentElement.appendChild(properties["html"]);
                }
                else {
                    componentElement.innerHTML = properties["html"];
                }
                syiro.data.Write(component.id + "->HTMLElement", componentElement);
                return component;
            }
        }
        griditem.New = New;
    })(griditem = syiro.griditem || (syiro.griditem = {}));
})(syiro || (syiro = {}));
/*
    This is the namespace for Syiro Navbar component (previously referred to as Header and Footer Components).
*/
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var navbar;
    (function (navbar) {
        function New(properties) {
            var navbarType;
            if ((typeof properties["position"] !== "string") || ((properties["position"] !== "top") && (properties["position"] !== "bottom"))) {
                navbarType = "top";
            }
            else {
                navbarType = properties["position"];
            }
            var componentId = syiro.component.IdGen("navbar");
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "navbar", "data-syiro-component-id": componentId, "role": "navigation", "data-syiro-component-type": navbarType });
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var _i = 0, _a = properties["items"]; _i < _a.length; _i++) {
                        var individualItem = _a[_i];
                        var typeOfItem = syiro.utilities.TypeOfThing(individualItem);
                        if (typeOfItem == "LinkPropertiesObject") {
                            var generatedElement = syiro.utilities.ElementCreator("a", { "href": individualItem["link"], "content": individualItem["title"] });
                            componentElement.appendChild(generatedElement);
                        }
                        else if ((typeOfItem == "ComponentObject") && (navbarType == "top")) {
                            componentElement.appendChild(syiro.component.Fetch(individualItem));
                        }
                    }
                }
                else if ((propertyKey == "logo") && (navbarType == "top")) {
                    var generatedElement = syiro.utilities.ElementCreator("img", { "data-syiro-minor-component": "logo", "src": properties["logo"] });
                    componentElement.appendChild(generatedElement);
                }
                else if ((propertyKey == "content") && (navbarType == "bottom")) {
                    var labelContent = "";
                    if (typeof properties["content"] !== "undefined") {
                        labelContent = properties["content"];
                    }
                    else {
                        labelContent = properties["label"];
                    }
                    var generatedElement = syiro.utilities.ElementCreator("label", { "content": labelContent });
                    componentElement.insertBefore(generatedElement, componentElement.firstChild);
                }
            }
            if ((typeof properties["fixed"] == "boolean") && (properties["fixed"])) {
                componentElement.setAttribute("data-syiro-position", "fixed");
            }
            syiro.data.Write(componentId + "->Position", navbarType);
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "navbar" };
        }
        navbar.New = New;
        navbar.Generate = New;
        function AddLink(append, component, elementOrProperties) {
            if (typeof append == "boolean") {
                if (append) {
                    append = "append";
                }
                else {
                    append = "prepend";
                }
            }
            var componentAddingSucceeded = false;
            if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component.type == "navbar")) {
                var typeOfElementOrProperties = syiro.utilities.TypeOfThing(elementOrProperties);
                var generatedElement;
                if (typeOfElementOrProperties == "LinkPropertiesObject") {
                    generatedElement = syiro.utilities.ElementCreator("a", { "href": elementOrProperties["link"], "content": elementOrProperties["title"] });
                }
                else if ((typeOfElementOrProperties == "Element") && (elementOrProperties.nodeName == "A")) {
                    generatedElement = elementOrProperties;
                }
                if (typeof generatedElement !== "undefined") {
                    componentAddingSucceeded = true;
                    syiro.component.Add(append, component, generatedElement);
                }
            }
            return componentAddingSucceeded;
        }
        navbar.AddLink = AddLink;
        function RemoveLink(component, elementOrProperties) {
            var componentRemovingSucceed = false;
            if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component.type == "navbar")) {
                var navbarElement = syiro.component.Fetch(component);
                var typeOfElementOrProperties = syiro.utilities.TypeOfThing(elementOrProperties);
                var potentialLinkElement;
                if (typeOfElementOrProperties == "LinkPropertiesObject") {
                    potentialLinkElement = navbarElement.querySelector('a[href="' + elementOrProperties["link"] + '"]');
                }
                else if ((typeOfElementOrProperties == "Element") && (elementOrProperties.nodeName == "A")) {
                    potentialLinkElement = elementOrProperties;
                }
                if (typeof potentialLinkElement !== "undefined") {
                    componentRemovingSucceed = true;
                    syiro.component.Remove(potentialLinkElement);
                }
            }
            return componentRemovingSucceed;
        }
        navbar.RemoveLink = RemoveLink;
        function SetLogo(component, content) {
            if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component.type == "navbar") && (syiro.data.Read(component.id + "->Position") == "top")) {
                var navbarElement = syiro.component.Fetch(component);
                var imageElement = navbarElement.querySelector('img[data-syiro-minor-component="logo"]');
                if (content !== "") {
                    if (imageElement == null) {
                        imageElement = document.createElement("img");
                        navbarElement.insertBefore(imageElement, navbarElement.firstChild);
                    }
                    imageElement.setAttribute("src", syiro.utilities.SanitizeHTML(content));
                    syiro.component.Update(component.id, navbarElement);
                }
                else if ((content == "") && (imageElement !== null)) {
                    syiro.component.Remove(imageElement);
                }
                return true;
            }
            else {
                return false;
            }
        }
        navbar.SetLogo = SetLogo;
        function SetLabel(component, content) {
            if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component.type == "navbar") && (syiro.data.Read(component.id + "->Position") == "bottom")) {
                var navbarElement = syiro.component.Fetch(component);
                var labelComponent = navbarElement.querySelector("label");
                if (content !== "") {
                    if (labelComponent == null) {
                        labelComponent = document.createElement("label");
                        navbarElement.insertBefore(labelComponent, navbarElement.firstChild);
                    }
                    labelComponent.textContent = syiro.utilities.SanitizeHTML(content);
                    syiro.component.Update(component.id, navbarElement);
                }
                else if ((content == "") && (labelComponent !== null)) {
                    syiro.component.Remove(labelComponent);
                }
                return true;
            }
            else {
                return false;
            }
        }
        navbar.SetLabel = SetLabel;
    })(navbar = syiro.navbar || (syiro.navbar = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for Syiro List component and it's sub-component, List Item
 */
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var list;
    (function (list) {
        function New(properties) {
            var componentId = syiro.component.IdGen("list");
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "list", "data-syiro-component-id": componentId, "aria-live": "polite", "id": componentId, "role": "listbox" });
            if ((syiro.utilities.TypeOfThing(properties["items"], "Array")) && (properties["items"].length > 0)) {
                if (syiro.utilities.TypeOfThing(properties["header"], "string")) {
                    var listHeaderElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "list-header", "content": properties["header"] });
                    componentElement.appendChild(listHeaderElement);
                }
                var listContentContainer = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "list-content" });
                for (var _i = 0, _a = properties["items"]; _i < _a.length; _i++) {
                    var individualItem = _a[_i];
                    var individualItemComponentObject;
                    var typeOfIndividualItem = syiro.utilities.TypeOfThing(individualItem);
                    if (typeOfIndividualItem == "ComponentObject") {
                        individualItemComponentObject = individualItem;
                    }
                    else if (typeOfIndividualItem == "Object") {
                        var typeOfHeader = syiro.utilities.TypeOfThing(individualItem["header"]);
                        var typeOfItems = syiro.utilities.TypeOfThing(individualItem["item"]);
                        if ((typeOfHeader == "string") && (typeOfItems == "Array")) {
                            individualItemComponentObject = syiro.list.New(individualItem);
                        }
                        else if ((typeOfHeader == "undefined") && (typeOfItems == "undefined")) {
                            individualItemComponentObject = syiro.listitem.New(individualItem);
                        }
                    }
                    if (syiro.utilities.TypeOfThing(individualItemComponentObject, "ComponentObject")) {
                        listContentContainer.appendChild(syiro.component.Fetch(individualItemComponentObject));
                    }
                }
                componentElement.appendChild(listContentContainer);
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "list" };
        }
        list.New = New;
        list.Generate = New;
        function SetHeader(component, content) {
            var componentElement = syiro.component.Fetch(component);
            var listHeader = componentElement.querySelector('div[data-syiro-minor-component="list-header"]');
            var typeOfContent = syiro.utilities.TypeOfThing(content);
            if ((typeOfContent == "string") || (typeOfContent == "Element")) {
                if (listHeader == null) {
                    listHeader = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "list-header" });
                    componentElement.insertBefore(listHeader, componentElement.firstChild);
                }
                content = syiro.utilities.SanitizeHTML(content);
                if (typeOfContent == "string") {
                    if (content !== "") {
                        listHeader.innerHTML = content;
                    }
                    else {
                        componentElement.removeChild(listHeader);
                    }
                }
                else {
                    listHeader.innerHTML = "";
                    listHeader.appendChild(content);
                }
            }
            syiro.component.Update(component.id, componentElement);
        }
        list.SetHeader = SetHeader;
        function Toggle(component) {
            var componentElement;
            if (syiro.utilities.TypeOfThing(component, "ComponentObject")) {
                componentElement = syiro.component.Fetch(component);
            }
            else if (syiro.utilities.TypeOfThing(component, "Element")) {
                componentElement = component.parentElement;
            }
            if ((typeof componentElement !== "undefined") && (componentElement !== null) && (componentElement !== false)) {
                if (componentElement.parentElement.getAttribute("data-syiro-minor-component") == "list-content") {
                    var listHeader = componentElement.querySelector('div[data-syiro-minor-component="list-header"]');
                    var listContent = componentElement.querySelector('div[data-syiro-minor-component="list-content"]');
                    if (syiro.component.CSS(listContent, "display") !== "block") {
                        listHeader.setAttribute("active", "");
                        syiro.component.CSS(listContent, "display", "block");
                    }
                    else {
                        listHeader.removeAttribute("active");
                        syiro.component.CSS(listContent, "display", "");
                    }
                }
            }
        }
        list.Toggle = Toggle;
        list.AddItem = syiro.component.Add;
        list.RemoveItem = syiro.component.Remove;
    })(list = syiro.list || (syiro.list = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var listitem;
    (function (listitem) {
        function New(properties) {
            var componentId = syiro.component.IdGen("list-item");
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "list-item", "data-syiro-component-id": componentId, "role": "option" });
            var generatedElement;
            if (syiro.utilities.TypeOfThing(properties["html"], "Element") == false) {
                for (var propertyKey in properties) {
                    var append = false;
                    var thing = properties[propertyKey];
                    if ((propertyKey == "control") && (typeof properties["image"] == "undefined")) {
                        if (thing["type"] == "button") {
                            generatedElement = syiro.component.Fetch(thing);
                            append = true;
                        }
                    }
                    else if ((propertyKey == "image") && (typeof properties["control"] == "undefined")) {
                        generatedElement = syiro.utilities.ElementCreator("img", { "src": thing });
                    }
                    else if ((propertyKey == "label") && (typeof properties["link"] == "undefined")) {
                        generatedElement = syiro.utilities.ElementCreator("label", { "content": thing });
                        if (componentElement.querySelector("img") !== null) {
                            append = true;
                        }
                    }
                    else if ((propertyKey == "link") && (typeof properties["control"] == "undefined") && (typeof properties["label"] == "undefined")) {
                        append = true;
                        generatedElement = syiro.utilities.ElementCreator("a", { "href": thing["link"], "content": thing["title"] });
                    }
                    if (append) {
                        componentElement.appendChild(generatedElement);
                    }
                    else {
                        componentElement.insertBefore(generatedElement, componentElement.firstChild);
                    }
                }
            }
            else {
                componentElement.setAttribute("data-syiro-nonstrict-formatting", "");
                generatedElement = properties["html"];
                componentElement.innerHTML = syiro.utilities.SanitizeHTML(generatedElement).outerHTML;
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "list-item" };
        }
        listitem.New = New;
        listitem.Generate = New;
        function SetControl(component, control) {
            var setControlSucceeded = false;
            if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")) {
                if ((syiro.utilities.TypeOfThing(control) == "ComponentObject") && (control["type"] == "button")) {
                    var listItemElement = syiro.component.Fetch(component);
                    if (listItemElement.querySelector("div") !== null) {
                        listItemElement.removeChild(listItemElement.querySelector("div"));
                    }
                    var innerListImage = listItemElement.querySelector("img");
                    if (innerListImage !== null) {
                        syiro.component.Remove(innerListImage);
                    }
                    var innerLink = listItemElement.querySelector("a");
                    if (listItemElement.querySelector("a") !== null) {
                        syiro.component.Remove(innerLink);
                    }
                    syiro.events.Remove(syiro.events.eventStrings["up"], component);
                    syiro.component.Add("append", component, control);
                    setControlSucceeded = true;
                }
            }
            return setControlSucceeded;
        }
        listitem.SetControl = SetControl;
        function SetImage(component, content) {
            var setImageSucceeded = false;
            if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")) {
                if (typeof content == "string") {
                    var listItemElement = syiro.component.Fetch(component);
                    var listItemLabel = listItemElement.querySelector("label");
                    var listItemImage = listItemElement.querySelector('img');
                    if (content !== "") {
                        var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]');
                        if (listItemControl !== null) {
                            syiro.component.Remove(listItemControl);
                        }
                        if (listItemImage == null) {
                            listItemImage = document.createElement("img");
                            syiro.component.Add("prepend", component, listItemImage);
                        }
                        listItemImage.setAttribute("src", syiro.utilities.SanitizeHTML(content));
                        syiro.component.Update(component.id, listItemElement);
                    }
                    else if ((content == "") && (listItemImage !== null)) {
                        syiro.component.Remove(listItemImage);
                    }
                    setImageSucceeded = true;
                }
            }
            return setImageSucceeded;
        }
        listitem.SetImage = SetImage;
        function SetLabel(component, content) {
            var setLabelSucceeded = false;
            if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")) {
                if (typeof content == "string") {
                    var listItemElement = syiro.component.Fetch(component);
                    var listItemLabelElement = listItemElement.querySelector("label");
                    if (content !== "") {
                        var listItemImage = listItemElement.querySelector("img");
                        var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]');
                        if ((listItemImage !== null) && (listItemControl !== null)) {
                            syiro.component.Remove(listItemControl);
                        }
                        var innerLink = listItemElement.querySelector("a");
                        if (innerLink !== null) {
                            syiro.component.Remove(innerLink);
                        }
                        if (listItemLabelElement == null) {
                            listItemLabelElement = document.createElement("label");
                            if (listItemImage !== null) {
                                syiro.component.Add("append", component, listItemLabelElement);
                            }
                            else {
                                syiro.component.Add("prepend", component, listItemLabelElement);
                            }
                        }
                        listItemLabelElement.textContent = syiro.utilities.SanitizeHTML(content);
                    }
                    else if ((content == "") && (listItemLabelElement !== null)) {
                        syiro.component.Remove(listItemLabelElement);
                    }
                    syiro.component.Update(component.id, listItemElement);
                    setLabelSucceeded = true;
                }
            }
            return setLabelSucceeded;
        }
        listitem.SetLabel = SetLabel;
        function SetLink(component, properties) {
            var setSucceeded = false;
            if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "list-item")) {
                var componentElement = syiro.component.Fetch(component);
                var innerLink = componentElement.querySelector("a");
                if (syiro.utilities.TypeOfThing(properties, "LinkPropertiesObject")) {
                    setSucceeded = true;
                    if (innerLink !== null) {
                        innerLink.setAttribute("href", properties["link"]);
                        innerLink.setAttribute("title", properties["title"]);
                    }
                    else {
                        var innerControl = componentElement.querySelector('div[data-syiro-component]');
                        if (innerControl !== null) {
                            syiro.component.Remove(innerControl);
                        }
                        var innerLabel = componentElement.querySelector("label");
                        if (innerLabel !== null) {
                            syiro.component.Remove(innerLabel);
                        }
                        innerLink = syiro.utilities.ElementCreator("a", { "href": properties["link"], "content": properties["title"] });
                        syiro.component.Add("append", component, innerLink);
                    }
                }
                else if (properties == "") {
                    setSucceeded = true;
                    syiro.component.Remove(innerLink);
                }
            }
            return setSucceeded;
        }
        listitem.SetLink = SetLink;
    })(listitem = syiro.listitem || (syiro.listitem = {}));
})(syiro || (syiro = {}));
/*
    This is a file containing the Media Player Component
*/
/// <reference path="component.ts" />
/// <reference path="events.ts" />
/// <reference path="generator.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="players.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var mediaplayer;
    (function (mediaplayer) {
        function New(properties) {
            var syiroComponentData = { "scaling": {} };
            var componentObject = {
                "id": syiro.component.IdGen("media-player"),
                "type": "media-player"
            };
            var componentElement = syiro.utilities.ElementCreator("div", {
                "data-syiro-component-id": componentObject.id, "data-syiro-component": "media-player",
                "data-syiro-component-type": properties["type"], "name": componentObject.id
            });
            var mediaPlayerElement;
            var mediaPlayerProperties = { "preload": "metadata", "UIWebView": "allowsInlineMediaPlayback", "volume": "0.5" };
            if (typeof properties["type"] == "undefined") {
                properties["type"] = "video";
            }
            if (navigator.userAgent.indexOf("iPhone") == -1) {
                if ((typeof properties["ForceLiveUX"] == "boolean") && (properties["ForceLiveUX"])) {
                    syiroComponentData["ForceLiveUX"] = true;
                }
                if (syiro.utilities.TypeOfThing(properties["menu"], "ComponentObject")) {
                    if (properties["menu"]["type"] == "list") {
                        var playerMenuDialog = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "player-menu" });
                        playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content": "Menu" }));
                        playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"]));
                        componentElement.insertBefore(playerMenuDialog, componentElement.firstChild);
                    }
                }
                if (properties["type"] == "audio") {
                    if ((typeof properties["title"] !== "undefined") || (typeof properties["artist"] !== "undefined")) {
                        properties["generate-content-info"] = true;
                    }
                    if (typeof properties["width"] !== "number") {
                        properties["width"] = 400;
                    }
                    syiro.component.CSS(componentElement, "width", properties["width"].toString() + "px");
                    syiroComponentData["scaling->initialDimensions"] = [150, properties["width"]],
                        syiroComponentData["scaling->ratio"] = [0, 0];
                }
                else {
                    if (typeof properties["ratio"] !== "undefined") {
                        syiroComponentData["scaling->ratio"] = properties["ratio"];
                        syiroComponentData["scaling->initialDimensions"] = [properties["height"], properties["width"]];
                    }
                    else if (typeof properties["fill"] !== "undefined") {
                        syiroComponentData["scaling->fill"] = properties["fill"];
                    }
                    else {
                        syiroComponentData["scaling->initialDimensions"] = [properties["height"], properties["width"]];
                    }
                }
                var mediaControlComponent = syiro.mediacontrol.New(properties);
                var mediaControlElement = syiro.component.Fetch(mediaControlComponent);
                componentElement.appendChild(mediaControlElement);
            }
            else {
                mediaPlayerProperties["NoUX"] = true;
                mediaPlayerProperties["controls"] = "controls";
            }
            if (typeof properties["art"] !== "undefined") {
                if (navigator.userAgent.indexOf("iPhone") == -1) {
                    syiro.component.CSS(componentElement, "background-image", 'url("' + properties["art"] + '")');
                }
                else {
                    mediaPlayerProperties["poster"] = properties["art"];
                }
            }
            else {
                if (properties["type"] == "audio") {
                    componentElement.setAttribute("data-syiro-audio-player", "mini");
                    delete properties["menu"];
                }
            }
            mediaPlayerElement = syiro.utilities.ElementCreator(properties["type"], mediaPlayerProperties);
            mediaPlayerElement.autoplay = false;
            var sourceElements = syiro.mediaplayer.GenerateSources(properties["type"], properties["sources"]);
            for (var _i = 0; _i < sourceElements.length; _i++) {
                var sourceElement = sourceElements[_i];
                mediaPlayerElement.appendChild(sourceElement);
            }
            if ((typeof properties["UsingExternalLibrary"] == "boolean") && (properties["UsingExternalLibrary"])) {
                syiroComponentData["UsingExternalLibrary"] = true;
            }
            componentElement.insertBefore(mediaPlayerElement, componentElement.firstChild);
            syiroComponentData["HTMLElement"] = componentElement;
            syiro.data.Write(componentObject.id, syiroComponentData);
            return componentObject;
        }
        mediaplayer.New = New;
        function CenterInformation(component) {
            var componentElement = syiro.component.Fetch(component);
            if (componentElement.getAttribute("data-syiro-component-type") == "audio") {
                var mediaControlElement = componentElement.querySelector('div[data-syiro-component="media-control"]');
                var audioInformation = mediaControlElement.querySelector("section");
                if (audioInformation !== null) {
                    var audioInformationWidth = ((componentElement.clientWidth / 2) - (audioInformation.clientWidth / 2) - 40);
                    syiro.component.CSS(audioInformation, "margin-left", audioInformationWidth.toString() + "px");
                }
            }
        }
        mediaplayer.CenterInformation = CenterInformation;
        function Configure(component) {
            var componentElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var mediaControl = componentElement.querySelector('div[data-syiro-component="media-control"]');
            if (syiro.data.Read(component.id + "->NoUX") == false) {
                if (componentElement.getAttribute("data-syiro-component-type") == "video") {
                    componentElement.removeAttribute("data-syiro-show-video");
                }
                var playButton = mediaControl.querySelector('div[data-syiro-render-icon="play"]');
                syiro.component.CSS(playButton, "background-image", "");
                playButton.removeAttribute("active");
                var volumeControl = mediaControl.querySelector('div[data-syiro-render-icon="volume"]');
                if (volumeControl !== null) {
                    volumeControl.removeAttribute("active");
                }
                var isPlayableOrStreamable = syiro.mediaplayer.IsPlayable(component, true);
                var playerErrorNotice = componentElement.querySelector('div[data-syiro-minor-component="player-error"]');
                if (playerErrorNotice == null) {
                    playerErrorNotice = syiro.utilities.ElementCreator("div", {
                        "data-syiro-minor-component": "player-error", "content": "This content is not capable of being played on this browser or device."
                    });
                    var playerHalfHeight = ((componentElement.clientHeight - 40) / 2);
                    syiro.component.CSS(playerErrorNotice, "width", componentElement.clientWidth.toString() + "px");
                    syiro.component.CSS(playerErrorNotice, "padding-top", playerHalfHeight.toString() + "px");
                    syiro.component.CSS(playerErrorNotice, "padding-bottom", playerHalfHeight.toString() + "px");
                    componentElement.insertBefore(playerErrorNotice, componentElement.firstChild);
                }
                var innerTimeLabel = mediaControl.querySelector("time");
                if ((isPlayableOrStreamable == true) || (isPlayableOrStreamable == "streamable")) {
                    if (isPlayableOrStreamable == "streamable") {
                        syiro.data.Write(component.id + "->IsStreaming", true);
                        mediaControl.setAttribute("data-syiro-component-streamstyling", "");
                        if (innerTimeLabel !== null) {
                            innerTimeLabel.setAttribute("data-syiro-component-live", "");
                            innerTimeLabel.textContent = "Live";
                        }
                    }
                    else if (isPlayableOrStreamable == true) {
                        syiro.data.Delete(component.id + "->IsStreaming");
                        mediaControl.removeAttribute("data-syiro-component-streamstyling");
                        if (innerTimeLabel !== null) {
                            innerTimeLabel.removeAttribute("data-syiro-component-live");
                            innerTimeLabel.textContent = "00:00";
                            var playerMediaLengthInformation = syiro.mediaplayer.GetPlayerLengthInfo(component);
                            var mediaControlComponent = syiro.component.FetchComponentObject(mediaControl);
                            syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 1, playerMediaLengthInformation["max"]);
                        }
                    }
                    syiro.component.CSS(playerErrorNotice, "visibility", "");
                }
                else {
                    syiro.component.CSS(playerErrorNotice, "visibility", "visible");
                }
            }
            syiro.data.Delete(component.id + "->IsChangingInputValue");
            syiro.data.Delete(component.id + "->IsChangingVolume");
        }
        mediaplayer.Configure = Configure;
        function DurationChange(component) {
            if (syiro.data.Read(component.id + "->IsStreaming") == false) {
                var componentElement = syiro.component.Fetch(component);
                var mediaControlElement = componentElement.querySelector('div[data-syiro-component="media-control"]');
                var mediaControlComponent = syiro.component.FetchComponentObject(mediaControlElement);
                var playerRange = mediaControlElement.querySelector('input[type="range"]');
                var playerMediaLengthInformation = syiro.mediaplayer.GetPlayerLengthInfo(component);
                playerRange.setAttribute("max", playerMediaLengthInformation["max"]);
                playerRange.setAttribute("step", playerMediaLengthInformation["step"]);
                syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 1, playerMediaLengthInformation["max"]);
            }
        }
        mediaplayer.DurationChange = DurationChange;
        function FetchInnerContentElement(component) {
            var componentElement = syiro.component.Fetch(component);
            return componentElement.querySelector(componentElement.getAttribute("data-syiro-component-type"));
        }
        mediaplayer.FetchInnerContentElement = FetchInnerContentElement;
        function FetchSources(component) {
            var innerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var sourceTags = innerContentElement.querySelectorAll("source");
            var sourcesArray = [];
            for (var sourceElementIndex in sourceTags) {
                var sourceElement = sourceTags[sourceElementIndex];
                if (syiro.utilities.TypeOfThing(sourceElement, "Element")) {
                    sourcesArray.push({
                        "src": sourceElement.getAttribute("src"),
                        "streamable": sourceElement.getAttribute("data-syiro-streamable-source"),
                        "type": sourceElement.getAttribute("type")
                    });
                }
            }
            return sourcesArray;
        }
        mediaplayer.FetchSources = FetchSources;
        function GenerateSources(type, sources) {
            var sourceElements = [];
            for (var _i = 0; _i < sources.length; _i++) {
                var source = sources[_i];
                var streamingProtocol = source.substr(0, source.indexOf(":"));
                var sourceExtension = source.substr(source.lastIndexOf(".")).replace(".", "");
                var sourceTagAttributes = { "src": source, "data-syiro-streamable-source": "false" };
                if (source.substr(-1) !== ";") {
                    if ((streamingProtocol == "rtsp") || (streamingProtocol == "rtmp")) {
                        sourceTagAttributes["data-syiro-streamable-source"] = "true";
                        sourceTagAttributes["type"] = streamingProtocol + "/" + sourceExtension;
                    }
                    else {
                        if (sourceExtension == "m3u8") {
                            sourceTagAttributes["data-syiro-streamable-source"] = "true";
                            sourceTagAttributes["type"] = "application/x-mpegurl";
                        }
                        else {
                            if (sourceExtension == "mov") {
                                sourceExtension = "quicktime";
                            }
                            sourceTagAttributes["type"] = type + "/" + sourceExtension;
                        }
                    }
                    sourceElements.push(syiro.utilities.ElementCreator("source", sourceTagAttributes));
                }
            }
            return sourceElements;
        }
        mediaplayer.GenerateSources = GenerateSources;
        function GetPlayerLengthInfo(component) {
            var playerLengthInfo = {};
            var contentDuration = syiro.mediaplayer.FetchInnerContentElement(component).duration;
            if ((isNaN(contentDuration) == false) && (isFinite(contentDuration))) {
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
            else if (isFinite(contentDuration) == false) {
                playerLengthInfo["max"] = "Streaming";
                playerLengthInfo["step"] = 1;
            }
            return playerLengthInfo;
        }
        mediaplayer.GetPlayerLengthInfo = GetPlayerLengthInfo;
        function IsPlayable(component, returnIsStreamble) {
            var componentElement = syiro.component.Fetch(component);
            var innerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var isPlayable = false;
            var isStreamable = false;
            if (syiro.data.Read(component.id + "->UsingExternalLibrary")) {
                isPlayable = true;
                isStreamable = true;
            }
            else {
                var sourceElementsInfo = syiro.mediaplayer.FetchSources(component);
                for (var _i = 0; _i < sourceElementsInfo.length; _i++) {
                    var sourceElementInfo = sourceElementsInfo[_i];
                    if (innerContentElement.canPlayType(sourceElementInfo["type"]) !== "") {
                        isPlayable = true;
                    }
                    if (!isStreamable) {
                        if ((syiro.utilities.TypeOfThing(sourceElementInfo["streamable"], "string")) && (sourceElementInfo["streamable"] == "true")) {
                            isStreamable = true;
                        }
                    }
                }
            }
            if (returnIsStreamble && isStreamable) {
                return "streamable";
            }
            else if (isPlayable) {
                return true;
            }
            else {
                return false;
            }
        }
        mediaplayer.IsPlayable = IsPlayable;
        function IsPlaying(component) {
            var componentElement = syiro.component.Fetch(component);
            var isPaused = syiro.mediaplayer.FetchInnerContentElement(component).paused;
            return !isPaused;
        }
        mediaplayer.IsPlaying = IsPlaying;
        function IsStreamable(component) {
            return (syiro.mediaplayer.IsPlayable(component, true) == "streamable");
        }
        mediaplayer.IsStreamable = IsStreamable;
        function PlayOrPause(component, playButtonObjectOrElement) {
            var componentElement = syiro.component.Fetch(component);
            var innerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var typeOfPlayButtonObject = syiro.utilities.TypeOfThing(playButtonObjectOrElement);
            var playButton;
            if (componentElement.getAttribute("data-syiro-component-type") == "video") {
                componentElement.setAttribute("data-syiro-show-video", "true");
            }
            if (typeOfPlayButtonObject == "ComponentObject") {
                playButton = syiro.component.Fetch(playButtonObjectOrElement);
            }
            else {
                if ((typeOfPlayButtonObject !== "Element") || (playButtonObjectOrElement.getAttribute("data-syiro-render-icon") !== "play")) {
                    playButton = componentElement.querySelector('div[data-syiro-render-icon="play"]');
                }
                else {
                    playButton = playButtonObjectOrElement;
                }
            }
            if (syiro.mediaplayer.IsPlaying(component)) {
                innerContentElement.pause();
                playButton.removeAttribute("active");
            }
            else {
                innerContentElement.play();
                playButton.setAttribute("active", "pause");
            }
        }
        mediaplayer.PlayOrPause = PlayOrPause;
        function Reset(component) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            if (syiro.mediaplayer.IsPlaying(component)) {
                playerInnerContentElement.pause();
            }
            syiro.mediaplayer.SetTime(component, 0);
            syiro.mediaplayer.Configure(component);
        }
        mediaplayer.Reset = Reset;
        function SetSources(component, sources) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var contentType = playerInnerContentElement.nodeName.toLowerCase();
            if (typeof sources == "string") {
                sources = [sources];
            }
            var sourceElements = syiro.mediaplayer.GenerateSources(contentType, sources);
            playerInnerContentElement.innerHTML = "";
            for (var _i = 0; _i < sourceElements.length; _i++) {
                var sourceElement = sourceElements[_i];
                playerInnerContentElement.appendChild(sourceElement);
            }
            playerInnerContentElement.setAttribute("src", sources[0]);
            playerInnerContentElement.src = sources[0];
        }
        mediaplayer.SetSources = SetSources;
        function SetTime(component, setting) {
            var component = arguments[0];
            var componentElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var currentTime = playerInnerContentElement.currentTime;
            var time = currentTime;
            var fromEvent = true;
            if (typeof setting == "number") {
                time = setting;
                fromEvent = false;
                if ((currentTime !== time) && (time <= playerInnerContentElement.duration)) {
                    playerInnerContentElement.currentTime = time;
                }
            }
            var mediaControlElement = componentElement.querySelector('div[data-syiro-component="media-control"]');
            var mediaControlComponent = syiro.component.FetchComponentObject(mediaControlElement);
            var playerRange = mediaControlElement.querySelector("input");
            syiro.mediacontrol.TimeLabelUpdater(mediaControlComponent, 0, time);
            if (syiro.data.Read(component.id + "->IsStreaming") == false) {
                var allowInputChange = false;
                var isChangingInputValue = syiro.data.Read(component.id + "->IsChangingInputValue");
                if ((!fromEvent) && (isChangingInputValue)) {
                    allowInputChange = true;
                }
                else if (fromEvent && (!isChangingInputValue)) {
                    allowInputChange = true;
                }
                if (allowInputChange) {
                    var roundedDownTime = Math.floor(time);
                    playerRange.value = roundedDownTime;
                    var priorInputSpaceWidth = (roundedDownTime / Number(playerRange.max)) * playerRange.clientWidth;
                    var updatedGradient = "linear-gradient(to right, " + syiro.primaryColor + " " + (priorInputSpaceWidth + 2) + "px, transparent 0px)";
                    syiro.component.CSS(playerRange, "background", updatedGradient);
                }
            }
        }
        mediaplayer.SetTime = SetTime;
        function SetVolume(component, volume, fromEvent) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.mediaplayer.FetchInnerContentElement(component);
            var playerRange = playerElement.querySelector('input[type="range"]');
            var inputVolumeValue = volume;
            if ((typeof fromEvent == "string") && (fromEvent == "input")) {
                inputVolumeValue *= 10;
                volume /= 10;
            }
            else {
                if ((inputVolumeValue > 10) && (inputVolumeValue <= 100)) {
                    inputVolumeValue = Math.round(volume / 10) * 10;
                    volume /= 100;
                }
                else if ((inputVolumeValue > 1) && (inputVolumeValue <= 10)) {
                    inputVolumeValue *= 10;
                    volume /= 10;
                }
                else if (inputVolumeValue <= 1) {
                    inputVolumeValue *= 100;
                }
            }
            syiro.component.CSS(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + " " + inputVolumeValue + "%, transparent 0px)");
            playerInnerContentElement.volume = volume;
        }
        mediaplayer.SetVolume = SetVolume;
        function ToggleFullscreen(component) {
            var componentElement = syiro.component.Fetch(component);
            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (typeof componentElement.requestFullscreen !== "undefined") {
                    componentElement.requestFullscreen();
                }
                else if (typeof componentElement.msRequestFullscreen !== "undefined") {
                    componentElement.msRequestFullscreen();
                }
                else if (typeof componentElement.mozRequestFullScreen !== "undefined") {
                    componentElement.mozRequestFullScreen();
                }
                else if (typeof componentElement.webkitRequestFullscreen !== "undefined") {
                    componentElement.webkitRequestFullscreen();
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
        mediaplayer.ToggleFullscreen = ToggleFullscreen;
        function ToggleMenuDialog(component) {
            var componentElement = syiro.component.Fetch(component);
            var menuDialog = componentElement.querySelector('div[data-syiro-minor-component="player-menu"]');
            var menuButton = componentElement.querySelector('div[data-syiro-render-icon="menu"]');
            if (syiro.component.CSS(menuDialog, "visibility") !== "visible") {
                var playerMenuHeight;
                if (component.type == "audio-player") {
                    playerMenuHeight = 100;
                }
                else {
                    playerMenuHeight = syiro.mediaplayer.FetchInnerContentElement(component).clientHeight;
                }
                syiro.component.CSS(menuDialog, "height", playerMenuHeight.toString() + "px");
                syiro.component.CSS(menuDialog, "width", componentElement.clientWidth.toString() + "px");
                menuButton.setAttribute("active", "true");
                syiro.component.CSS(menuDialog, "visibility", "visible");
            }
            else {
                menuButton.removeAttribute("active");
                syiro.component.CSS(menuDialog, "visibility", "");
                syiro.component.CSS(menuDialog, "height", "");
                syiro.component.CSS(menuDialog, "width", "");
            }
        }
        mediaplayer.ToggleMenuDialog = ToggleMenuDialog;
    })(mediaplayer = syiro.mediaplayer || (syiro.mediaplayer = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var mediacontrol;
    (function (mediacontrol) {
        function New(properties) {
            var component = { "id": syiro.component.IdGen("media-control"), "type": "media-control" };
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": component.type, "data-syiro-component-id": component.id });
            var playButton = syiro.button.New({ "data-syiro-render-icon": "play" });
            var inputRange = syiro.utilities.ElementCreator("input", { "type": "range", "value": "0" });
            componentElement.appendChild(inputRange);
            componentElement.appendChild(syiro.component.Fetch(playButton));
            if (typeof properties["generate-content-info"] !== "undefined") {
                var infoSection = document.createElement("section");
                if (typeof properties["title"] !== "undefined") {
                    infoSection.appendChild(syiro.utilities.ElementCreator("b", { "content": properties["title"] }));
                }
                if (typeof properties["artist"] !== "undefined") {
                    infoSection.appendChild(syiro.utilities.ElementCreator("label", { "content": properties["artist"] }));
                }
                componentElement.appendChild(infoSection);
            }
            else {
                if (properties["type"] == "video") {
                    var timeStamp = syiro.utilities.ElementCreator("time", { "content": "00:00 / 00:00" });
                    componentElement.appendChild(timeStamp);
                }
            }
            if (syiro.utilities.TypeOfThing(properties["menu"], "ComponentObject")) {
                if (properties["menu"]["type"] == "list") {
                    var menuButton = syiro.button.New({ "data-syiro-render-icon": "menu" });
                    componentElement.appendChild(syiro.component.Fetch(menuButton));
                }
            }
            if (properties["type"] == "video") {
                var fullscreenButton = syiro.button.New({ "data-syiro-render-icon": "fullscreen" });
                componentElement.appendChild(syiro.component.Fetch(fullscreenButton));
            }
            if (syiro.device.OperatingSystem !== "iOS") {
                var volumeButton = syiro.button.New({ "data-syiro-render-icon": "volume" });
                componentElement.appendChild(syiro.component.Fetch(volumeButton));
            }
            syiro.data.Write(component.id + "->HTMLElement", componentElement);
            return component;
        }
        mediacontrol.New = New;
        function ShowVolumeSlider(mediaControlComponent, volumeButtonComponent) {
            var mediaControl = syiro.component.Fetch(mediaControlComponent);
            var volumeButton = syiro.component.Fetch(volumeButtonComponent);
            var playerComponentObject = syiro.component.FetchComponentObject(mediaControl.parentElement);
            var playerContentElement = syiro.player.FetchInnerContentElement(playerComponentObject);
            var playerRange = mediaControl.querySelector('input[type="range"]');
            if (syiro.data.Read(playerComponentObject["id"] + "->IsChangingVolume") == false) {
                syiro.data.Write(playerComponentObject["id"] + "->IsChangingInputValue", true);
                syiro.data.Write(playerComponentObject["id"] + "->IsChangingVolume", true);
                volumeButton.setAttribute("active", "true");
                if (syiro.data.Read(playerComponentObject["id"] + "->IsStreaming")) {
                    mediaControl.removeAttribute("data-syiro-component-streamstyling");
                }
                playerRange.setAttribute("max", "10");
                playerRange.setAttribute("step", "1");
                syiro.player.SetVolume(playerComponentObject, playerContentElement.volume);
            }
            else {
                volumeButton.removeAttribute("active");
                if (syiro.data.Read(playerComponentObject["id"] + "->IsStreaming")) {
                    mediaControl.setAttribute("data-syiro-component-streamstyling", "");
                }
                var playerMediaLengthInformation = syiro.player.GetPlayerLengthInfo(playerComponentObject);
                playerRange.setAttribute("max", playerMediaLengthInformation["max"]);
                playerRange.setAttribute("step", playerMediaLengthInformation["step"]);
                syiro.data.Delete(playerComponentObject["id"] + "->IsChangingInputValue");
                syiro.data.Delete(playerComponentObject["id"] + "->IsChangingVolume");
                syiro.player.SetTime(playerComponentObject, playerContentElement.currentTime);
            }
        }
        mediacontrol.ShowVolumeSlider = ShowVolumeSlider;
        function TimeLabelUpdater(component, timePart, value) {
            var mediaControlElement = syiro.component.Fetch(component);
            var playerTimeElement = mediaControlElement.querySelector("time");
            if (playerTimeElement !== null) {
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
        }
        mediacontrol.TimeLabelUpdater = TimeLabelUpdater;
        function Toggle(component, forceShow) {
            var mediaControlElement = syiro.component.Fetch(component);
            var currentAnimationStored;
            if (mediaControlElement.hasAttribute("data-syiro-animation")) {
                currentAnimationStored = mediaControlElement.getAttribute("data-syiro-animation");
            }
            if (typeof forceShow !== "boolean") {
                forceShow = null;
            }
            if (forceShow) {
                syiro.animation.FadeIn(component);
            }
            else if (forceShow == false) {
                syiro.animation.FadeOut(component);
            }
            else if ((typeof forceShow == "undefined") || (forceShow == null)) {
                if ((currentAnimationStored == "fade-out") || (mediaControlElement.hasAttribute("data-syiro-animation") == false)) {
                    syiro.animation.FadeIn(component);
                }
                else {
                    syiro.animation.FadeOut(component);
                }
            }
        }
        mediacontrol.Toggle = Toggle;
    })(mediacontrol = syiro.mediacontrol || (syiro.mediacontrol = {}));
})(syiro || (syiro = {}));
/*
    This is a file containing the namespace for the Syiro Audio Player and Video Player, as well as shared player functionality.
    The Audio Player is exposed via syiro.audioplayer.
    The Video Player is exposed via syiro.videoplayer.
    The shared Player functionality is exposed via syiro.player.
*/
/// <reference path="component.ts" />
/// <reference path="events.ts" />
/// <reference path="generator.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="mediaplayer.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var player;
    (function (player) {
        player.New = syiro.mediaplayer.New;
        player.Generate = syiro.mediaplayer.New;
        player.DurationChange = syiro.mediaplayer.DurationChange;
        player.FetchInnerContentElement = syiro.mediaplayer.FetchInnerContentElement;
        player.FetchSources = syiro.mediaplayer.FetchSources;
        player.GenerateSources = syiro.mediaplayer.GenerateSources;
        player.GetPlayerLengthInfo = syiro.mediaplayer.GetPlayerLengthInfo;
        player.IsPlaying = syiro.mediaplayer.IsPlaying;
        player.IsPlayable = syiro.mediaplayer.IsPlayable;
        player.IsStreamable = syiro.mediaplayer.IsStreamable;
        player.PlayOrPause = syiro.mediaplayer.PlayOrPause;
        player.Reset = syiro.mediaplayer.Reset;
        player.SetSources = syiro.mediaplayer.SetSources;
        player.SetTime = syiro.mediaplayer.SetTime;
        player.SetVolume = syiro.mediaplayer.SetVolume;
        player.ToggleFullscreen = syiro.mediaplayer.ToggleFullscreen;
        player.ToggleMenuDialog = syiro.mediaplayer.ToggleMenuDialog;
    })(player = syiro.player || (syiro.player = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var playercontrol;
    (function (playercontrol) {
        playercontrol.New = syiro.mediacontrol.New;
        playercontrol.Generate = syiro.mediacontrol.New;
        playercontrol.ShowVolumeSlider = syiro.mediacontrol.ShowVolumeSlider;
        playercontrol.TimeLabelUpdater = syiro.mediacontrol.TimeLabelUpdater;
        playercontrol.Toggle = syiro.mediacontrol.Toggle;
    })(playercontrol = syiro.playercontrol || (syiro.playercontrol = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var audioplayer;
    (function (audioplayer) {
        function New(properties) {
            properties["type"] = "audio";
            return syiro.mediaplayer.New(properties);
        }
        audioplayer.New = New;
        audioplayer.CenterInformation = syiro.mediaplayer.CenterInformation;
    })(audioplayer = syiro.audioplayer || (syiro.audioplayer = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var videoplayer;
    (function (videoplayer) {
        function New(properties) {
            properties["type"] = "video";
            return syiro.mediaplayer.New(properties);
        }
        videoplayer.New = New;
    })(videoplayer = syiro.videoplayer || (syiro.videoplayer = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for Syiro Searchbox component.
*/
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var searchbox;
    (function (searchbox) {
        function New(properties) {
            var componentId = syiro.component.IdGen("searchbox");
            var componentElement;
            var componentData = {};
            var searchboxContainerData = { "data-syiro-component": "searchbox", "data-syiro-component-id": componentId };
            if (typeof properties == "undefined") {
                properties = {};
            }
            if (typeof properties["content"] == "undefined") {
                properties["content"] = "Search here...";
            }
            if ((typeof properties["DisableInputTrigger"] == "boolean") && (properties["DisableInputTrigger"] == true)) {
                componentData["DisableInputTrigger"] = true;
            }
            var inputElement = syiro.utilities.ElementCreator("input", { "aria-autocomplete": "list", "role": "textbox", "placeholder": properties["content"] });
            var searchButton = syiro.button.New({ "data-syiro-render-icon": "search" });
            if ((typeof properties["suggestions"] !== "undefined") && (properties["suggestions"])) {
                componentData["suggestions"] = "enabled";
                componentData["handlers"] = {
                    "list-item-handler": properties["list-item-handler"]
                };
                var listItems = [];
                if (typeof properties["preseed"] == "object") {
                    componentData["preseed"] = true;
                    for (var preseedItemIndex in properties["preseed"]) {
                        listItems.push(syiro.listitem.New({ "label": properties["preseed"][preseedItemIndex] }));
                    }
                }
                else {
                    componentData["handlers"]["suggestions"] = properties["handler"];
                    componentData["preseed"] = false;
                }
                var searchSuggestionsList = syiro.list.New({ "items": listItems });
                var searchSuggestionsListElement = syiro.component.Fetch(searchSuggestionsList);
                searchboxContainerData["aria-owns"] = searchSuggestionsList["id"];
                searchSuggestionsListElement.setAttribute("data-syiro-component-owner", componentId);
                document.body.appendChild(searchSuggestionsListElement);
                if (typeof properties["preseed"] !== "undefined") {
                    for (var listItemIndex in listItems) {
                        syiro.events.Add(syiro.events.eventStrings["up"], listItems[listItemIndex], properties["list-item-handler"]);
                    }
                }
            }
            componentElement = syiro.utilities.ElementCreator("div", searchboxContainerData);
            componentElement.appendChild(inputElement);
            componentElement.appendChild(syiro.component.Fetch(searchButton));
            componentData["HTMLElement"] = componentElement;
            syiro.data.Write(componentId, componentData);
            return { "id": componentId, "type": "searchbox" };
        }
        searchbox.New = New;
        searchbox.Generate = New;
        function Suggestions() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var searchboxElement;
            var searchboxValue;
            if (arguments.length == 2) {
                searchboxElement = arguments[0].parentElement;
                searchboxValue = arguments[1];
            }
            else if (arguments.length > 2) {
                searchboxElement = arguments[0];
                searchboxValue = searchboxElement.querySelector("input").value;
            }
            var searchboxComponent = syiro.component.FetchComponentObject(searchboxElement);
            var linkedListComponent = syiro.component.FetchLinkedListComponentObject(searchboxComponent);
            var linkedListComponentElement = syiro.component.Fetch(linkedListComponent);
            var innerListItemsOfLinkedList = linkedListComponentElement.querySelectorAll('div[data-syiro-component="list-item"]');
            syiro.component.CSS(linkedListComponentElement, "width", searchboxElement.clientWidth + "px");
            syiro.render.Position(["below", "center"], linkedListComponent, searchboxComponent);
            if (searchboxValue !== "") {
                if (syiro.data.Read(searchboxComponent["id"] + "->preseed")) {
                    syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important");
                    if (innerListItemsOfLinkedList.length > 0) {
                        var numOfListItemsThatWillShow = 0;
                        for (var listItemIndex in innerListItemsOfLinkedList) {
                            var listItem = innerListItemsOfLinkedList[listItemIndex];
                            if (syiro.utilities.TypeOfThing(listItem, "Element")) {
                                if (listItem.textContent.indexOf(searchboxValue) !== -1) {
                                    numOfListItemsThatWillShow++;
                                    syiro.component.CSS(listItem, "display", "block !important");
                                }
                                else {
                                    syiro.component.CSS(listItem, "display", "none !important");
                                }
                            }
                        }
                        if (numOfListItemsThatWillShow == 0) {
                            syiro.component.CSS(linkedListComponentElement, "visibility", "hidden !important");
                        }
                    }
                }
                else {
                    syiro.component.CSS(linkedListComponentElement, "visibility", "hidden !important");
                    var suggestions = syiro.data.Read(searchboxComponent["id"] + "->handlers->suggestions").call(this, searchboxValue);
                    if (suggestions.length !== 0) {
                        if (innerListItemsOfLinkedList.length > 0) {
                            syiro.component.Remove(innerListItemsOfLinkedList);
                        }
                        for (var suggestionIndex in suggestions) {
                            var suggestionListItem = syiro.listitem.New({ "label": suggestions[suggestionIndex] });
                            syiro.list.AddItem(true, linkedListComponent, suggestionListItem);
                            syiro.events.Add(syiro.events.eventStrings["up"], suggestionListItem, syiro.data.Read(searchboxComponent["id"] + "handlers->list-item-handler"));
                        }
                        syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important");
                    }
                }
            }
            else {
                syiro.component.CSS(linkedListComponentElement, "visibility", "hidden !important");
            }
        }
        searchbox.Suggestions = Suggestions;
        function SetText(component, content) {
            var searchboxElement = syiro.component.Fetch(component);
            if (searchboxElement !== null) {
                var searchboxInputElement = searchboxElement.querySelectorAll("input")[0];
                if (content !== "") {
                    searchboxInputElement.setAttribute("placeholder", content);
                }
                else if (content == "") {
                    searchboxInputElement.removeAttribute("placeholder");
                }
                syiro.component.Update(component.id, searchboxElement);
            }
        }
        searchbox.SetText = SetText;
    })(searchbox = syiro.searchbox || (syiro.searchbox = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for the Syiro Sidepane Component.
 */
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var sidepane;
    (function (sidepane) {
        function New(properties) {
            var componentId = syiro.component.IdGen("sidepane");
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component-id": componentId, "data-syiro-component": "sidepane" });
            var sidepaneContentElement = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "sidepane-content" });
            var sidepaneInnerListContent = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "sidepane-lists" });
            var sidepaneEdge = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "sidepane-edge" });
            componentElement.appendChild(sidepaneContentElement);
            sidepaneContentElement.appendChild(sidepaneInnerListContent);
            componentElement.appendChild(sidepaneEdge);
            if (syiro.utilities.TypeOfThing(properties["logo"], "Element") || (typeof properties["logo"] == "string")) {
                var logoElement = properties["logo"];
                if (typeof properties["logo"] == "string") {
                    logoElement = syiro.utilities.ElementCreator("img", { "src": properties["logo"] });
                }
                sidepaneContentElement.insertBefore(logoElement, sidepaneInnerListContent);
            }
            if (syiro.utilities.TypeOfThing(properties["searchbox"], "ComponentObject")) {
                var searchboxElement = syiro.component.Fetch(properties["searchbox"]);
                sidepaneContentElement.insertBefore(searchboxElement, sidepaneInnerListContent);
            }
            for (var _i = 0, _a = properties["items"]; _i < _a.length; _i++) {
                var item = _a[_i];
                var typeOfItem = syiro.utilities.TypeOfThing(item);
                var appendableElement;
                if (typeOfItem == "ComponentObject") {
                    appendableElement = syiro.component.Fetch(item);
                }
                else if (typeOfItem == "Element") {
                    appendableElement = syiro.utilities.SanitizeHTML(item);
                }
                sidepaneInnerListContent.appendChild(appendableElement);
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "sidepane" };
        }
        sidepane.New = New;
        sidepane.Generate = New;
        function GestureInit() {
            var componentElement = arguments[0].parentElement;
            var moveElement;
            if (typeof arguments[1].touches !== "undefined") {
                moveElement = arguments[0];
            }
            else {
                moveElement = document;
            }
            syiro.events.Add(syiro.events.eventStrings["move"], moveElement, syiro.sidepane.Drag.bind(this, arguments[0]));
            syiro.events.Add(syiro.events.eventStrings["up"], moveElement, syiro.sidepane.Release.bind(this, arguments[0]));
            componentElement.removeAttribute("data-syiro-animation");
            componentElement.setAttribute("data-syiro-render-animation", "false");
            var sidepaneContentOverlay = document.body.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="sidepane"]');
            syiro.component.CSS(sidepaneContentOverlay, "display", "block");
        }
        sidepane.GestureInit = GestureInit;
        function Drag() {
            var componentElement = arguments[0].parentElement;
            var eventData = arguments[2];
            var mousePosition;
            var updatedSidepanePosition;
            if (typeof eventData.touches !== "undefined") {
                mousePosition = eventData.touches[0].screenX;
            }
            else {
                mousePosition = eventData.clientX;
            }
            updatedSidepanePosition = mousePosition - componentElement.offsetWidth;
            if (updatedSidepanePosition > 0) {
                updatedSidepanePosition = 0;
            }
            syiro.component.CSS(componentElement, "transform", "translateX(" + updatedSidepanePosition.toString() + "px)");
            syiro.component.CSS(componentElement, "-webkit-transform", "translateX(" + updatedSidepanePosition.toString() + "px)");
        }
        sidepane.Drag = Drag;
        function Release() {
            var componentElement = arguments[0].parentElement;
            var component = syiro.component.FetchComponentObject(arguments[0].parentElement);
            var moveElement = arguments[1];
            var eventData = arguments[2];
            syiro.sidepane.Toggle(component, eventData);
            syiro.events.Remove(syiro.events.eventStrings["move"], moveElement);
            syiro.events.Remove(syiro.events.eventStrings["up"], moveElement);
        }
        sidepane.Release = Release;
        function Toggle(component, eventData) {
            if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component.type == "sidepane")) {
                var componentElement = syiro.component.Fetch(component);
                var sidepaneContentOverlay = document.body.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="sidepane"]');
                var showSidepane = false;
                if (componentElement.hasAttribute("data-syiro-animation") == false) {
                    var currentTransformProperty = syiro.component.CSS(component, "transform");
                    if ((typeof eventData !== "undefined") && ((typeof eventData.changedTouches !== "undefined") || (typeof eventData.screenX !== "undefined"))) {
                        var mousePosition;
                        if (typeof eventData.changedTouches !== "undefined") {
                            mousePosition = eventData.changedTouches[0].screenX;
                        }
                        else {
                            mousePosition = eventData.clientX;
                        }
                        showSidepane = (mousePosition > (componentElement.clientWidth / 2));
                    }
                    else if (currentTransformProperty !== false) {
                        var transformPosition = Number(currentTransformProperty.replace("translateX(-", "").replace("px)", ""));
                        showSidepane = (transformPosition < (componentElement.clientWidth / 2));
                    }
                    else if (typeof eventData == "undefined") {
                        showSidepane = true;
                    }
                }
                componentElement.removeAttribute("data-syiro-render-animation");
                syiro.component.CSS(componentElement, "transform", false);
                syiro.component.CSS(componentElement, "-webkit-transform", false);
                if (showSidepane) {
                    syiro.animation.Slide(component);
                    syiro.component.CSS(sidepaneContentOverlay, "display", "block");
                }
                else {
                    syiro.animation.Reset(component);
                    syiro.component.CSS(sidepaneContentOverlay, "display", false);
                }
            }
        }
        sidepane.Toggle = Toggle;
    })(sidepane = syiro.sidepane || (syiro.sidepane = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for Syiro Toast component.
 Contrary to common belief, this does not actually have anything to do with toast.
*/
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var toast;
    (function (toast) {
        function New(properties) {
            if ((typeof properties["type"] == "undefined") || ((properties["type"] !== "normal") && (properties["type"] !== "dialog"))) {
                properties["type"] = "normal";
            }
            if ((typeof properties["title"] == "undefined") && (properties["type"] == "dialog")) {
                properties["type"] = "normal";
            }
            var componentId = syiro.component.IdGen("toast");
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component-id": componentId, "data-syiro-component": "toast", "data-syiro-component-type": properties["type"] });
            if (typeof properties["title"] !== "undefined") {
                if (typeof properties["message"] !== "undefined") {
                    var titleLabel = syiro.utilities.ElementCreator("label", { "content": properties["title"] });
                    componentElement.appendChild(titleLabel);
                }
                else {
                    properties["message"] = properties["title"];
                    delete properties["title"];
                }
            }
            var message = syiro.utilities.ElementCreator("span", { "content": properties["message"] });
            componentElement.appendChild(message);
            if (typeof properties["title"] !== "undefined") {
                var toastButtonsContainer = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "toast-buttons" });
                var futureButtonHandlers = {};
                if (typeof properties["buttons"] == "undefined") {
                    properties["buttons"] = [{ "action": "deny", "content": "Ok" }];
                }
                if (properties["buttons"][0]["action"] == "affirm") {
                    properties["buttons"].reverse();
                }
                for (var _i = 0, _a = properties["buttons"]; _i < _a.length; _i++) {
                    var toastButtonProperties = _a[_i];
                    if (typeof toastButtonProperties["content"] == "undefined") {
                        if (toastButtonProperties["action"] == "deny") {
                            toastButtonProperties["content"] = "No";
                        }
                        else {
                            toastButtonProperties["content"] = "Yes";
                        }
                    }
                    if (typeof toastButtonProperties["function"] !== "undefined") {
                        futureButtonHandlers[toastButtonProperties["action"]] = toastButtonProperties["function"];
                    }
                    var toastButtonObject = syiro.button.New({ "type": "basic", "content": toastButtonProperties["content"] });
                    var toastButtonElement = syiro.component.Fetch(toastButtonObject);
                    toastButtonElement.setAttribute("data-syiro-dialog-action", toastButtonProperties["action"]);
                    toastButtonsContainer.appendChild(toastButtonElement);
                }
                componentElement.appendChild(toastButtonsContainer);
                if (Object.keys(futureButtonHandlers).length !== 0) {
                    syiro.data.Write(componentId + "->ActionHandlers", futureButtonHandlers);
                }
            }
            else {
                var closeIconButtonObject = syiro.button.New({ "type": "basic", "content": "x" });
                componentElement.appendChild(syiro.component.Fetch(closeIconButtonObject));
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "toast" };
        }
        toast.New = New;
        toast.Generate = New;
        function Clear(component) {
            var componentElement = syiro.component.Fetch(component);
            if (componentElement !== null) {
                syiro.toast.Toggle(component, "hide");
                syiro.component.Remove(component);
            }
        }
        toast.Clear = Clear;
        function ClearAll() {
            var toasts = document.body.querySelectorAll('div[data-syiro-component="toast"]');
            if (toasts.length !== 0) {
                for (var toastIndex in toasts) {
                    if (syiro.utilities.TypeOfThing(toasts[toastIndex], "Element")) {
                        var toastComponentObject = syiro.component.FetchComponentObject(toasts[toastIndex]);
                        syiro.toast.Clear(toastComponentObject);
                    }
                }
            }
        }
        toast.ClearAll = ClearAll;
        function Toggle(component, action) {
            var componentElement = syiro.component.Fetch(component);
            if (componentElement !== null) {
                var currentAnimation = componentElement.getAttribute("data-syiro-animation");
                var showAnimation = true;
                var toastType = componentElement.getAttribute("data-syiro-component-type");
                var toastContentOverlayElement = document.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="toast"]');
                if (typeof action !== "string") {
                    if (toastType == "normal") {
                        if ((syiro.device.width > 1024) && (currentAnimation == "slide")) {
                            showAnimation = false;
                        }
                        else if ((syiro.device.width <= 1024) && ((currentAnimation == "fade-in") || (currentAnimation == "slide"))) {
                            showAnimation = false;
                        }
                    }
                    else if (toastType == "dialog") {
                        showAnimation = !(currentAnimation == "fade-in");
                    }
                }
                else {
                    showAnimation = !(action == "hide");
                }
                if ((showAnimation) && ((syiro.device.width > 1024) && (toastType == "normal"))) {
                    syiro.animation.Slide(component);
                }
                else if ((showAnimation) && (((syiro.device.width <= 1024) && (toastType == "normal")) || (toastType == "dialog"))) {
                    syiro.animation.FadeIn(component, function () {
                        var toastElement = syiro.component.Fetch(component);
                        if (toastElement.getAttribute("data-syiro-component-type") == "dialog") {
                            var toastContentOverlayElement = document.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="toast"]');
                            syiro.component.CSS(toastContentOverlayElement, "display", "block");
                        }
                    });
                }
                else if ((showAnimation == false) && ((syiro.device.width > 1024) && (toastType == "normal"))) {
                    syiro.animation.Reset(component);
                }
                else if ((showAnimation == false) && (((syiro.device.width <= 1024) && (toastType == "normal")) || (toastType == "dialog"))) {
                    syiro.animation.FadeOut(component, function () {
                        var toastElement = syiro.component.Fetch(component);
                        if (toastElement.getAttribute("data-syiro-component-type") == "dialog") {
                            var toastContentOverlayElement = document.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="toast"]');
                            syiro.component.CSS(toastContentOverlayElement, "display", "");
                        }
                    });
                }
            }
        }
        toast.Toggle = Toggle;
    })(toast = syiro.toast || (syiro.toast = {}));
})(syiro || (syiro = {}));
/*
    This is the aggregate of all the Syiro namespace into a unified namespace
*/
/// <reference path="init.ts" />
/// <reference path="animation.ts" />
/// <reference path="button.ts" />
/// <reference path="component.ts" />
/// <reference path="data.ts" />
/// <reference path="device.ts" />
/// <reference path="events.ts" />
/// <reference path="generator.ts" />
/// <reference path="grid.ts" />
/// <reference path="navbar.ts" />
/// <reference path="list.ts" />
/// <reference path="players.ts" />
/// <reference path="render.ts" />
/// <reference path="searchbox.ts" />
/// <reference path="sidepane.ts" />
/// <reference path="toast.ts" />
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    function Init() {
        syiro.device.Detect();
        syiro.events.Add("scroll", document, function () {
            var dropdownButtons = document.querySelectorAll('div[data-syiro-component="button"][data-syiro-component-type="dropdown"][active]');
            for (var dropdownButtonIndex in dropdownButtons) {
                if (syiro.utilities.TypeOfThing(dropdownButtons[dropdownButtonIndex], "Element")) {
                    var thisDropdownButtonObject = syiro.component.FetchComponentObject(dropdownButtons[dropdownButtonIndex]);
                    syiro.button.Toggle(thisDropdownButtonObject);
                }
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
        var metaTagsToCheck = {
            "ie-compat": { "http-equiv": "X-UA-Compatible", "content-attr": "IE=edge" },
            "utf8": { "charset": "utf-8" },
            "viewport": { "name": "viewport", "content-attr": "width=device-width, maximum-scale=1.0, initial-scale=1,user-scalable=no" }
        };
        for (var metaAttributeKey in metaTagsToCheck) {
            var metaAttributeObject = metaTagsToCheck[metaAttributeKey];
            var firstKey = Object.keys(metaAttributeObject)[0];
            if (documentHeadSection.querySelector('meta[' + firstKey + '="' + metaAttributeObject[firstKey] + '"]') == null) {
                var metaElement = syiro.utilities.ElementCreator("meta", metaAttributeObject);
                syiro.component.Add("append", documentHeadSection, metaElement);
            }
        }
        if (document.body.querySelector('div[data-syiro-component="page"]') == null) {
            var pageElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "page", "role": "main" });
            syiro.component.Add("prepend", document.body, pageElement);
        }
        syiro.page = document.body.querySelector('div[data-syiro-component="page"]');
        var syiroInternalColorContainer = syiro.utilities.ElementCreator("div", { "data-syiro-component": "internalColorContainer" });
        document.body.appendChild(syiroInternalColorContainer);
        syiro.backgroundColor = window.getComputedStyle(syiroInternalColorContainer).backgroundColor;
        syiro.primaryColor = window.getComputedStyle(syiroInternalColorContainer).color;
        syiro.secondaryColor = window.getComputedStyle(syiroInternalColorContainer).borderColor;
        document.body.removeChild(syiroInternalColorContainer);
        if (syiro.device.SupportsMutationObserver) {
            var mutationWatcher = new MutationObserver(function (mutations) {
                for (var _i = 0; _i < mutations.length; _i++) {
                    var mutation = mutations[_i];
                    if (mutation.type == "childList") {
                        for (var mutationIndex in mutation.addedNodes) {
                            var componentElement = mutation.addedNodes[mutationIndex];
                            syiro.init.Parser(componentElement);
                        }
                    }
                }
            });
            var triggerAccurateInitialDimensions = new MutationObserver(function () {
                syiro.device.FetchScreenDetails();
                arguments[2].disconnect();
            }.bind(this, triggerAccurateInitialDimensions));
            var mutationWatcherOptions = {
                childList: true,
                attributes: true,
                characterData: false,
                attributeFilter: ['data-syiro-component'],
                subtree: true
            };
            var tempWatcherOptions = mutationWatcherOptions;
            delete tempWatcherOptions.attributeFilter;
            mutationWatcher.observe(document.body, mutationWatcherOptions);
            triggerAccurateInitialDimensions.observe(document.body, tempWatcherOptions);
        }
        else {
            syiro.legacyDimensionsDetection = false;
            (function mutationTimer() {
                window.setTimeout(function () {
                    for (var componentId in syiro.data.storage) {
                        var componentElement = document.querySelector('div[data-syiro-component-id="' + componentId + '"]');
                        if (componentElement !== null) {
                            syiro.init.Parser(componentElement);
                            if (syiro.legacyDimensionsDetection == false) {
                                syiro.device.FetchScreenDetails();
                                syiro.legacyDimensionsDetection = true;
                            }
                        }
                    }
                    mutationTimer();
                }, 3000);
            })();
        }
    }
    syiro.Init = Init;
    syiro.CSS = syiro.component.CSS;
    syiro.Fetch = syiro.component.Fetch;
    syiro.FetchComponentObject = syiro.component.FetchComponentObject;
    syiro.FetchDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition;
    syiro.FetchLinkedListComponentObject = syiro.component.FetchLinkedListComponentObject;
    syiro.IsComponentObject = syiro.component.IsComponentObject;
    syiro.Add = syiro.component.Add;
    syiro.Remove = syiro.component.Remove;
    syiro.Position = syiro.render.Position;
    syiro.Scale = syiro.render.Scale;
})(syiro || (syiro = {}));
