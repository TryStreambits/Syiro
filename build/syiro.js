/*
    These are interface extensions so Typescript doesn't freak out.
*/
var WebKitMutationObserver;
var ontransitionend;
var webkitTransitionEnd;
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
            var dataLocation = syiro.data.storage;
            var keyHeirarchy = keyList.split("->");
            var returnableValue = true;
            for (var keyHeirarchyIndex = 0; keyHeirarchyIndex < keyHeirarchy.length; keyHeirarchyIndex++) {
                var key = keyHeirarchy[keyHeirarchyIndex];
                if (keyHeirarchyIndex !== (keyHeirarchy.length - 1)) {
                    if (typeof dataLocation[key] == "undefined") {
                        if (modificationType == "write") {
                            dataLocation[key] = {};
                        }
                        else {
                            returnableValue = false;
                            break;
                        }
                    }
                    dataLocation = dataLocation[key];
                }
                else {
                    if (modificationType == "read") {
                        if (typeof dataLocation[key] !== "undefined") {
                            returnableValue = dataLocation[key];
                        }
                        else {
                            returnableValue = false;
                        }
                    }
                    else if (modificationType == "write") {
                        if (typeof data !== "undefined") {
                            dataLocation[key] = data;
                        }
                        else {
                            returnableValue = false;
                        }
                    }
                    else if (modificationType == "delete") {
                        delete dataLocation[key];
                    }
                    else {
                        returnableValue = false;
                    }
                }
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
            if (syiro.component.IsComponentObject(component)) {
                element = syiro.component.Fetch(component);
            }
            else {
                element = component;
                component = syiro.component.FetchComponentObject(element);
            }
            if ((element !== null) && (typeof properties["animation"] == "string")) {
                if ((component["type"] == "button") && (element.getAttribute("data-syiro-component-type") == "toggle")) {
                    var tempElement = element;
                    element = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]');
                    tempElement = null;
                }
                var postAnimationFunction = properties["function"];
                if (typeof postAnimationFunction !== "undefined") {
                    var transitionEndUsed = false;
                    if ((typeof element.style["transition"] !== "undefined") || (typeof element.style["webkitTransition"] !== "undefined")) {
                        transitionEndUsed = true;
                        var transitionEndFlag = "webkitTransitionEnd";
                        if (typeof element.style["transition"] !== "undefined") {
                            transitionEndFlag = "transitionend";
                        }
                    }
                    if (transitionEndUsed == true) {
                        syiro.events.Add(transitionEndFlag, element, function () {
                            var postAnimationFunction = arguments[0];
                            var transitionEndFlag = arguments[1];
                            var element = arguments[2];
                            if (typeof postAnimationFunction !== "undefined") {
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
            if (syiro.component.IsComponentObject(component)) {
                componentElement = syiro.component.Fetch(component);
            }
            else {
                componentElement = component;
                component = syiro.component.FetchComponentObject(componentElement);
            }
            if (componentElement !== null) {
                if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                    var tempElement = componentElement;
                    componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]');
                    tempElement = null;
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
                        if ((typeof attributeValue == "string") || ((typeof attributeValue.nodeType !== "undefined") && (attributeValue.nodeType == 1))) {
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
            else if (typeof content.nodeType !== "undefined") {
                if (content.tagName.toLowerCase() !== "script") {
                    var innerScriptElements = content.getElementsByTagName("script");
                    if (innerScriptElements.length !== 0) {
                        for (var innerScriptElementIndex = 0; innerScriptElementIndex < innerScriptElements.length; innerScriptElementIndex++) {
                            var innerScriptElement = innerScriptElements[innerScriptElementIndex];
                            innerScriptElement.parentElement.removeChild(innerScriptElement);
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
            var componentId;
            var componentElement;
            var passableValue = null;
            if (eventData.type.indexOf("touch") !== -1) {
                eventData.preventDefault();
            }
            if (syiro.component.IsComponentObject(component)) {
                componentId = component["id"];
            }
            else {
                if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)) {
                    if (component.hasAttribute("data-syiro-component-id")) {
                        componentId = component.getAttribute("data-syiro-component-id");
                    }
                    else {
                        if (component.hasAttribute("id")) {
                            componentId = component.getAttribute("id");
                        }
                        else {
                            componentId = syiro.component.IdGen(component.tagName.toLowerCase());
                        }
                        component.setAttribute("data-syiro-component-id", componentId);
                    }
                }
                else {
                    var componentType = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase();
                    componentId = componentType;
                }
                componentElement = component;
            }
            var functionsForListener = syiro.data.Read(componentId + "->handlers->" + eventData.type);
            componentElement = syiro.component.Fetch(component);
            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")) {
                if (componentElement.hasAttribute("active")) {
                    passableValue = false;
                }
                else {
                    passableValue = true;
                }
            }
            else if ((typeof component.nodeName !== "undefined") && (component.nodeName == "input")) {
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
            if (args.length == 3) {
                listeners = args[0];
                component = args[1];
                listenerCallback = args[2];
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
                    else if (component["type"] == "searchbox") {
                        componentElement = componentElement.firstElementChild.value;
                    }
                }
                else {
                    if ((typeof component.nodeType !== "undefined") && (component.nodeType == 1)) {
                        if (component.hasAttribute("data-syiro-component-id")) {
                            componentId = component.getAttribute("data-syiro-component-id");
                        }
                        else {
                            if (component.hasAttribute("id")) {
                                componentId = component.getAttribute("id");
                            }
                            else {
                                componentId = syiro.component.IdGen(component.tagName.toLowerCase());
                            }
                            component.setAttribute("data-syiro-component-id", componentId);
                        }
                    }
                    else {
                        var componentType = String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase();
                        componentId = componentType;
                    }
                    componentElement = component;
                }
                if (allowListening == true) {
                    for (var _a = 0; _a < listeners.length; _a++) {
                        var listener = listeners[_a];
                        var currentListenersArray = syiro.data.Read(componentId + "->handlers->" + listener);
                        if (currentListenersArray == false) {
                            currentListenersArray = [];
                        }
                        if (currentListenersArray.length == 0) {
                            currentListenersArray = [listenerCallback];
                            componentElement.addEventListener(listener, syiro.events.Handler.bind(this, component));
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
                if (syiro.component.IsComponentObject(component)) {
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
                    componentElement = component;
                    component = syiro.component.FetchComponentObject(componentElement);
                }
                else {
                    componentElement = component;
                    component = { "id": String(component).replace("[", "").replace("]", "").replace("object", "").replace("HTML", "").trim().toLowerCase() };
                }
                if (allowRemoval == true) {
                    if ((typeof componentElement !== "undefined") && (componentElement !== null)) {
                        for (var individualListenerIndex in listeners) {
                            var listener = listeners[individualListenerIndex];
                            var componentListeners = null;
                            if (typeof specFunc == "function") {
                                componentListeners = syiro.data.Read(component["id"] + "->handlers->" + listener);
                                var componentListenersFunctionIndex = componentListeners.indexOf(specFunc);
                                if (componentListenersFunctionIndex !== -1) {
                                    componentListeners.splice(componentListenersFunctionIndex, 1);
                                }
                            }
                            if ((componentListeners == null) || (componentListeners.length == 0)) {
                                syiro.data.Delete(component["id"] + "->handlers->" + listener);
                                componentElement.removeEventListener(listener, syiro.events.Handler.bind(this, component));
                            }
                            else {
                                syiro.data.Write(component["id"] + "->handlers->" + listener, componentListeners);
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
var syiro;
(function (syiro) {
    var render;
    (function (render) {
        function Position(positioningList, componentObject, relativeComponentObject) {
            var positioningAllowed = false;
            if (arguments.length == 3) {
                var componentElement;
                var relativeComponentElement;
                if (typeof arguments[0] == "string") {
                    positioningList = [arguments[0]];
                }
                else if ((typeof arguments[0] == "object") && (arguments[0].length !== 0)) {
                    positioningList = arguments[0];
                }
                if (syiro.component.IsComponentObject(arguments[1])) {
                    componentObject = arguments[1];
                    componentElement = syiro.component.Fetch(componentObject);
                }
                if (syiro.component.IsComponentObject(arguments[2])) {
                    relativeComponentObject = arguments[2];
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
            var componentId = component["id"];
            var componentElement = syiro.component.Fetch(component);
            var parentHeight = componentElement.parentElement.clientHeight;
            var parentWidth = componentElement.parentElement.clientWidth;
            var storedScalingData = syiro.data.Read(componentId + "->scaling");
            if ((typeof data !== "undefined") && (storedScalingData == false)) {
                syiro.data.Write(componentId + "->scaling", data);
                storedScalingData = data;
            }
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
                var scalingState = storedScalingData["state"];
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
            var potentialComponentScalableChildren = syiro.data.Read(component["id"] + "->scaling->children");
            if (potentialComponentScalableChildren !== false) {
                if (typeof potentialComponentScalableChildren.pop == "undefined") {
                    var childComponentsArray = [];
                    for (var childSelector in potentialComponentScalableChildren) {
                        var childElement = componentElement.querySelector(childSelector);
                        var childComponent = syiro.component.FetchComponentObject(childElement);
                        syiro.data.Write(childComponent["id"] + "->scaling", syiro.data.Read(component["id"] + "->scaling->children->" + childSelector + "->scaling"));
                        childComponentsArray.push(childComponent);
                        syiro.data.Delete(component["id"] + "->scaling->children->" + childSelector);
                    }
                    syiro.data.Write(component["id"] + "->scaling->children", childComponentsArray);
                }
                var componentChildren = syiro.data.Read(component["id"] + "->scaling->children");
                for (var childComponentIndex = 0; childComponentIndex < componentChildren.length; childComponentIndex++) {
                    var childComponentObject = componentChildren[childComponentIndex];
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
                            var propertyValueArray = cssPropertyValue.split(": ");
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
                        returnedValue = "";
                    }
                }
                else if ((newValue !== "") && (newValue !== false)) {
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
                returnedValue = "";
            }
            return returnedValue;
        }
        component_1.CSS = CSS;
        function Fetch(component) {
            var componentElement = document.querySelector('div[data-syiro-component-id="' + component["id"] + '"]');
            if (componentElement == null) {
                componentElement = syiro.data.Read(component["id"] + "->" + "HTMLElement");
            }
            return componentElement;
        }
        component_1.Fetch = Fetch;
        function FetchComponentObject() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var componentElement;
            var previouslyDefined = false;
            if (arguments.length == 1) {
                if (typeof arguments[0] == "string") {
                    componentElement = document.querySelector(arguments[0]);
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
                    var componentType;
                    if ((arguments.length == 2) && (typeof arguments[0] == "string")) {
                        componentId = syiro.component.IdGen(arguments[0]);
                        componentType = arguments[0];
                    }
                    else if (arguments.length == 1) {
                        componentId = syiro.component.IdGen(componentElement.tagName.toLowerCase());
                        componentType = componentElement.tagName.toLowerCase();
                    }
                    componentElement.setAttribute("data-syiro-component-id", componentId);
                    componentElement.setAttribute("data-syiro-component", componentType);
                }
                else {
                    previouslyDefined = true;
                }
                if ((componentElement.getAttribute("data-syiro-component") == "button") && (componentElement.getAttribute("data-syiro-component-type") == "dropdown") && (previouslyDefined == false)) {
                    syiro.events.Add(syiro.events.eventStrings["up"], component, syiro.button.Toggle);
                }
                return { "id": componentElement.getAttribute("data-syiro-component-id"), "type": componentElement.getAttribute("data-syiro-component") };
            }
            else {
                return false;
            }
        }
        component_1.FetchComponentObject = FetchComponentObject;
        function FetchDimensionsAndPosition(component) {
            var dimensionsAndPosition = {};
            var componentElement;
            if (syiro.component.IsComponentObject(component)) {
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
            var listSelector = 'div[data-syiro-component="list"][data-syiro-component-owner="' + component["id"] + '"]';
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
        function IsComponentObject(variable) {
            var isComponentObject = false;
            if ((typeof variable["id"] !== "undefined") && (typeof variable["type"] !== "undefined") && (typeof variable.nodeType == "undefined")) {
                isComponentObject = true;
            }
            return isComponentObject;
        }
        component_1.IsComponentObject = IsComponentObject;
        function Update(componentId, componentElement) {
            if (syiro.data.Read(componentId + "->HTMLElement") !== false) {
                syiro.data.Write(componentId + "->HTMLElement", componentElement);
            }
        }
        component_1.Update = Update;
        function Add(appendOrPrepend, parentComponent, childComponent) {
            if (appendOrPrepend == true) {
                appendOrPrepend = "append";
            }
            else {
                appendOrPrepend = "prepend";
            }
            var parentElement = syiro.component.Fetch(parentComponent);
            var childComponentId;
            var childComponentType = (typeof childComponent).toLowerCase();
            var childElement = syiro.component.Fetch(childComponent);
            var allowAdding = false;
            if (syiro.component.IsComponentObject(childComponent)) {
                childComponentId = childComponent["id"];
                if ((parentComponent["type"] == "navbar") && (syiro.data.Read(parentComponent["id"] + "->Position") == "top") && ((childComponent["type"] == "button") || (childComponent["type"] == "searchbox"))) {
                    childElement = syiro.component.Fetch(childComponent);
                    allowAdding = true;
                }
                else if ((parentComponent["type"] == "list") && (childComponent["type"] == "list-item")) {
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
            else if (typeof childComponent.nodeType !== "undefined") {
                childElement = childComponent;
                allowAdding = true;
            }
            if ((allowAdding == true) && (parentElement !== null) && (childElement !== null)) {
                if (appendOrPrepend == "prepend") {
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
        component_1.Add = Add;
        function Remove(componentsToRemove) {
            var componentList;
            if ((syiro.component.IsComponentObject(componentsToRemove)) || ((typeof componentsToRemove == "object") && (typeof componentsToRemove.length == "undefined"))) {
                componentList = [componentsToRemove];
            }
            else if ((typeof componentsToRemove == "object") && (componentsToRemove.length > 0)) {
                componentList = componentsToRemove;
            }
            for (var individualComponentIndex = 0; individualComponentIndex < componentList.length; individualComponentIndex++) {
                var individualComponentObject;
                var individualComponentElement;
                if (syiro.component.IsComponentObject(componentList[individualComponentIndex])) {
                    individualComponentObject = componentList[individualComponentIndex];
                    individualComponentElement = syiro.component.Fetch(individualComponentObject);
                }
                else {
                    individualComponentObject = syiro.component.FetchComponentObject(componentList[individualComponentIndex]);
                    individualComponentElement = componentList[individualComponentIndex];
                }
                var parentElement = individualComponentElement.parentElement;
                parentElement.removeChild(individualComponentElement);
                if (syiro.data.Read(individualComponentObject["id"]) !== false) {
                    syiro.data.Delete(individualComponentObject["id"]);
                }
                if (parentElement.hasAttribute("data-syiro-component-id")) {
                    syiro.component.Update(parentElement.getAttribute("data-syiro-component-id"), parentElement);
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
            if ((componentElement.localName !== null) && (componentElement.hasAttribute("data-syiro-component"))) {
                var componentObject = syiro.component.FetchComponentObject(componentElement);
                switch (componentObject["type"]) {
                    case "button":
                        if (componentElement.getAttribute("data-syiro-component-type") !== "basic") {
                            syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.button.Toggle);
                        }
                        break;
                    case "buttongroup":
                        syiro.init.Buttongroup(componentObject);
                        break;
                    case "audio-player":
                        syiro.player.Init(componentObject);
                        syiro.render.Scale(componentObject);
                        break;
                    case "video-player":
                        syiro.player.Init(componentObject);
                        syiro.render.Scale(componentObject);
                        break;
                    case "searchbox":
                        syiro.init.Searchbox(componentObject);
                        break;
                    case "sidepane":
                        syiro.init.Sidepane(componentObject);
                        break;
                    case "toast":
                        syiro.init.Toast(componentObject);
                        break;
                }
                var innerComponentElements = componentElement.querySelectorAll('div[data-syiro-component]');
                for (var _i = 0; _i < innerComponentElements.length; _i++) {
                    var childComponentElement = innerComponentElements[_i];
                    syiro.init.Parser(childComponentElement);
                }
                syiro.data.Delete(componentObject["id"] + "->HTMLElement");
            }
        }
        init.Parser = Parser;
        function createContentOverlay(purpose) {
            var contentOverlay = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "overlay", "data-syiro-overlay-purpose": purpose });
            document.body.appendChild(contentOverlay);
            return contentOverlay;
        }
        init.createContentOverlay = createContentOverlay;
        function Buttongroup(componentObject) {
            var componentElement = syiro.component.Fetch(componentObject);
            var innerButtons = componentElement.querySelectorAll('div[data-syiro-component="button"]');
            for (var _i = 0; _i < innerButtons.length; _i++) {
                var innerButton = innerButtons[_i];
                var buttonComponentObject = syiro.component.FetchComponentObject(innerButton);
                syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle);
            }
        }
        init.Buttongroup = Buttongroup;
        function Searchbox(componentObject) {
            if (syiro.data.Read(componentObject["id"] + "->suggestions") !== false) {
                var componentElement = syiro.component.Fetch(componentObject);
                syiro.events.Add("keyup", componentElement.querySelector("input"), syiro.searchbox.Suggestions);
                syiro.events.Add("blur", componentElement.querySelector("input"), function () {
                    var searchboxObject = arguments[0];
                    var searchboxLinkedList = syiro.component.FetchLinkedListComponentObject(searchboxObject);
                    syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important");
                }.bind(this, componentObject));
            }
        }
        init.Searchbox = Searchbox;
        function Sidepane(componentObject) {
            var componentElement = syiro.component.Fetch(componentObject);
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
                }.bind(this, componentObject));
            }
        }
        init.Sidepane = Sidepane;
        function Toast(componentObject) {
            var componentElement = syiro.component.Fetch(componentObject);
            var actionHandlers = syiro.data.Read(componentObject["id"] + "->ActionHandlers");
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
                syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, syiro.toast.Toggle.bind(this, componentObject));
                if (actionHandlers !== false) {
                    if (typeof actionHandlers[dialogAction] !== "undefined") {
                        syiro.events.Add(syiro.events.eventStrings["up"], toastButtonObject, actionHandlers[dialogAction]);
                    }
                }
            }
            if (actionHandlers !== false) {
                syiro.data.Delete(componentObject["id"] + "->ActionHandlers");
            }
        }
        init.Toast = Toast;
    })(init = syiro.init || (syiro.init = {}));
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
        device.DoNotTrack;
        device.HasCryptography = true;
        device.HasGeolocation = true;
        device.HasIndexedDB = true;
        device.HasLocalStorage = true;
        device.IsOnline = true;
        device.OperatingSystem;
        device.SupportsMutationObserver = false;
        device.SupportsTouch = false;
        device.IsSubHD;
        device.IsHD;
        device.IsFullHDOrAbove;
        device.Orientation;
        device.OrientationObject = screen;
        device.height;
        device.width;
        function Detect() {
            // #region Do Not Track
            if (typeof navigator.doNotTrack !== "undefined") {
                syiro.device.DoNotTrack = Boolean(navigator.doNotTrack);
            }
            else {
                syiro.device.DoNotTrack = true;
            }
            if (typeof window.crypto == "undefined") {
                syiro.device.HasCryptography = false;
            }
            if (typeof navigator.geolocation == "undefined") {
                syiro.device.HasGeolocation = false;
            }
            if (typeof window.indexedDB == "undefined") {
                syiro.device.HasIndexedDB = false;
            }
            if (typeof window.localStorage == "undefined") {
                syiro.device.HasLocalStorage = false;
            }
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
                    for (var allPlayersIndex = 0; allPlayersIndex < allPlayers.length; allPlayersIndex++) {
                        var thisPlayer = allPlayers[allPlayersIndex];
                        syiro.render.Scale(syiro.component.FetchComponentObject(thisPlayer));
                        if (thisPlayer.getAttribute("data-syiro-component") == "audioplayer") {
                            var audioPlayerComponent = syiro.component.FetchComponentObject(thisPlayer);
                            syiro.audioplayer.CenterInformation(audioPlayerComponent);
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
                syiro.events.eventStrings["orientationchange"] = ["msorientationchange"];
            }
            else if (typeof screen.onmozorientationchange !== "undefined") {
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
            if (navigator.userAgent.indexOf("Android") !== -1) {
                syiro.device.OperatingSystem = "Android";
            }
            else if ((navigator.userAgent.indexOf("iPhone") !== -1) || (navigator.userAgent.indexOf("iPad") !== -1)) {
                syiro.device.OperatingSystem = "iOS";
            }
            else if ((navigator.userAgent.indexOf("Linux") !== -1) && (navigator.userAgent.indexOf("Android") == -1)) {
                syiro.device.OperatingSystem = "Linux";
                if (navigator.userAgent.indexOf("Sailfish") !== -1) {
                    syiro.device.OperatingSystem = "Sailfish";
                }
                else if ((navigator.userAgent.indexOf("Ubuntu") !== -1) && ((navigator.userAgent.indexOf("Mobile") !== -1) || (navigator.userAgent.indexOf("Tablet") !== -1))) {
                    syiro.device.OperatingSystem = "Ubuntu Touch";
                }
            }
            else if (navigator.userAgent.indexOf("Macintosh") !== -1) {
                syiro.device.OperatingSystem = "OS X";
            }
            else if (navigator.userAgent.indexOf("Windows Phone") !== -1) {
                syiro.device.OperatingSystem = "Windows Phone";
            }
            else if (navigator.userAgent.indexOf("Windows NT") !== -1) {
                syiro.device.OperatingSystem = "Windows";
            }
            else {
                syiro.device.OperatingSystem = "Other";
            }
            return syiro.device.OperatingSystem;
        }
        device.FetchOperatingSystem = FetchOperatingSystem;
        function FetchScreenDetails() {
            var documentElementClientRect = document.documentElement.getClientRects()[0];
            syiro.device.height = documentElementClientRect.height;
            syiro.device.width = documentElementClientRect.width;
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
            if ((typeof screen.orientation !== "undefined") && (screen.orientation == "landscape-primary")) {
                deviceOrientation = "landscape";
            }
            else if ((typeof screen.msOrientation !== "undefined") && (screen.msOrientation == "landscape-primary")) {
                deviceOrientation = "landscape";
            }
            else if ((typeof screen.mozOrientation !== "undefined") && (screen.mozOrientation == "landscape-primary")) {
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
                    for (var individualItemIndex in properties["items"]) {
                        var individualItem = properties["items"][individualItemIndex];
                        if (syiro.component.IsComponentObject(individualItem) == false) {
                            var generatedElement = syiro.utilities.ElementCreator("a", {
                                "href": individualItem["link"],
                                "title": individualItem["title"],
                                "content": individualItem["title"]
                            });
                            componentElement.appendChild(generatedElement);
                        }
                        else if ((syiro.component.IsComponentObject(individualItem)) && (navbarType == "top")) {
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
            if ((typeof properties["fixed"] == "boolean") && (properties["fixed"] == true)) {
                componentElement.setAttribute("data-syiro-position", "fixed");
            }
            syiro.data.Write(componentId + "->Position", navbarType);
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "navbar" };
        }
        navbar.New = New;
        navbar.Generate = New;
        function AddLink(append, component, elementOrProperties) {
            var componentAddingSucceeded = false;
            if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (typeof elementOrProperties !== "undefined")) {
                var generatedElement;
                if (typeof elementOrProperties.nodeType == "undefined") {
                    generatedElement = syiro.utilities.ElementCreator("a", {
                        "href": elementOrProperties["href"],
                        "title": elementOrProperties["title"],
                        "content": elementOrProperties["title"]
                    });
                }
                else if ((typeof elementOrProperties.nodeType !== "undefined") && (elementOrProperties.nodeName.toLowerCase() == "a")) {
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
            if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (typeof elementOrProperties !== "undefined")) {
                var navbarElement = syiro.component.Fetch(component);
                var potentialLinkElement;
                if (typeof elementOrProperties.nodeType == "undefined") {
                    potentialLinkElement = navbarElement.querySelector('a[href="' + elementOrProperties["link"] + '"][title="' + elementOrProperties["title"] + '"]');
                }
                else if ((typeof elementOrProperties.nodeType !== "undefined") && (elementOrProperties.nodeName.toLowerCase() == "a")) {
                    potentialLinkElement = elementOrProperties;
                }
                if (typeof potentialLinkElement !== "undefined") {
                    syiro.component.Remove(potentialLinkElement);
                    componentRemovingSucceed = true;
                }
            }
            return componentRemovingSucceed;
        }
        navbar.RemoveLink = RemoveLink;
        function SetLogo(component, content) {
            if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (syiro.data.Read(component["id"] + "->Position") == "top")) {
                var navbarElement = syiro.component.Fetch(component);
                var imageElement = navbarElement.querySelector('img[data-syiro-minor-component="logo"]');
                if (content !== "") {
                    if (imageElement == null) {
                        imageElement = document.createElement("img");
                        navbarElement.insertBefore(imageElement, navbarElement.firstChild);
                    }
                    imageElement.setAttribute("src", syiro.utilities.SanitizeHTML(content));
                    syiro.component.Update(component["id"], navbarElement);
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
        function RemoveLogo(component) {
            return syiro.navbar.SetLogo(component, "");
        }
        navbar.RemoveLogo = RemoveLogo;
        function SetLabel(component, content) {
            if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (syiro.data.Read(component["id"] + "->Position") == "bottom")) {
                var navbarElement = syiro.component.Fetch(component);
                var labelComponent = navbarElement.querySelector("label");
                if (content !== "") {
                    if (labelComponent == null) {
                        labelComponent = document.createElement("label");
                        navbarElement.insertBefore(labelComponent, navbarElement.firstChild);
                    }
                    labelComponent.textContent = syiro.utilities.SanitizeHTML(content);
                    syiro.component.Update(component["id"], navbarElement);
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
        function RemoveLabel(component) {
            return syiro.navbar.SetLabel(component, "");
        }
        navbar.RemoveLabel = RemoveLabel;
    })(navbar = syiro.navbar || (syiro.navbar = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var header;
    (function (header) {
        function Generate(properties) {
            properties["position"] = "top";
            return syiro.navbar.New(properties);
        }
        header.Generate = Generate;
        header.SetLogo = syiro.navbar.SetLogo;
        header.RemoveLogo = syiro.navbar.RemoveLogo;
    })(header = syiro.header || (syiro.header = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var footer;
    (function (footer) {
        function Generate(properties) {
            properties["position"] = "bottom";
            return syiro.navbar.New(properties);
        }
        footer.Generate = Generate;
        footer.SetLabel = syiro.navbar.SetLabel;
        footer.AddLink = syiro.navbar.AddLink;
        footer.RemoveLink = syiro.navbar.RemoveLink;
    })(footer = syiro.footer || (syiro.footer = {}));
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
                if (properties["position"] == undefined) {
                    properties["position"] = ["below", "center"];
                }
                syiro.data.Write(listComponent["id"] + "->render", properties["position"]);
                delete properties["position"];
            }
            else if (properties["type"] == "toggle") {
                var buttonToggleAttributes = { "data-syiro-minor-component": "buttonToggle" };
                if ((typeof properties["default"] == "boolean") && (properties["default"] == true)) {
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
            var setSucceeded;
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
                syiro.component.Update(component["id"] + "->HTMLElement", componentElement);
                setSucceeded = true;
            }
            else {
                setSucceeded = false;
            }
            return setSucceeded;
        }
        button.SetIcon = SetIcon;
        function SetImage(component, content) {
            var setSucceeded;
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")) {
                var innerImage = componentElement.querySelector("img");
                if (content !== "") {
                    if (innerImage == null) {
                        innerImage = document.createElement("img");
                        componentElement.insertBefore(innerImage, componentElement.firstChild);
                    }
                    innerImage.setAttribute("src", content);
                    syiro.component.Update(component["id"], componentElement);
                }
                else if ((content == "") && (innerImage !== null)) {
                    syiro.component.Remove(innerImage);
                }
                setSucceeded = true;
            }
            else {
                setSucceeded = false;
            }
            return setSucceeded;
        }
        button.SetImage = SetImage;
        function SetText(component, content) {
            var setSucceeded;
            var componentElement = syiro.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")) {
                componentElement.textContent = content;
                syiro.component.Update(component["id"], componentElement);
                setSucceeded = true;
            }
            else {
                setSucceeded = false;
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
                    if (componentElement.hasAttribute("active")) {
                        active = true;
                    }
                    else {
                        active = false;
                    }
                }
                else {
                    if (active) {
                        active = false;
                    }
                    else {
                        active = true;
                    }
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
                    for (var buttonItemIndex in properties["items"]) {
                        var buttonItem = properties["items"][buttonItemIndex];
                        if (syiro.component.IsComponentObject(buttonItem) == false) {
                            buttonItem = syiro.button.New(buttonItem);
                        }
                        var buttonElement = syiro.component.Fetch(buttonItem);
                        if (buttonElement.getAttribute("data-syiro-component-type") == "basic") {
                            componentElement.appendChild(buttonElement);
                            syiro.data.Delete(buttonItem["id"] + "->HTMLElement");
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
            var componentElement;
            if (syiro.component.IsComponentObject(component)) {
                if (component["type"] == "buttongroup") {
                    componentElement = syiro.component.Fetch(component);
                }
            }
            else if (typeof component.nodeType !== "undefined") {
                componentElement = component;
            }
            if ((typeof componentElement !== "undefined") && (typeof componentElement.nodeType !== "undefined")) {
                var innerButtonElements = componentElement.querySelectorAll('div[data-syiro-component="button"]');
                var hasOddNumberOfButtons = false;
                var middleButtonNumber = 0;
                if (Number((innerButtonElements.length / 2).toFixed()) !== (innerButtonElements.length / 2)) {
                    hasOddNumberOfButtons = true;
                    middleButtonNumber = Math.round(innerButtonElements.length / 2);
                }
                for (var innerButtonElementsIndex = 0; innerButtonElementsIndex < innerButtonElements.length; innerButtonElementsIndex++) {
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
            var buttonComponent = arguments[0];
            var buttonElement = syiro.component.Fetch(buttonComponent);
            var parentButtongroup = buttonElement.parentElement;
            var potentialActiveButton = parentButtongroup.querySelector('div[data-syiro-component="button"][active]');
            if (potentialActiveButton !== null) {
                potentialActiveButton.removeAttribute("active");
            }
            buttonElement.setAttribute("active", "");
        }
        buttongroup.Toggle = Toggle;
    })(buttongroup = syiro.buttongroup || (syiro.buttongroup = {}));
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
            if ((typeof properties["items"] !== "undefined") && (properties["items"].length > 0)) {
                for (var individualItemIndex in properties["items"]) {
                    var individualItem = properties["items"][individualItemIndex];
                    if (syiro.component.IsComponentObject(individualItem) == false) {
                        individualItem = syiro.listitem.New(individualItem);
                    }
                    componentElement.appendChild(syiro.component.Fetch(individualItem));
                }
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "list" };
        }
        list.New = New;
        list.Generate = New;
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
            if (typeof properties["html"] == "undefined") {
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
                            var imageComponent = syiro.utilities.ElementCreator("img", { "src": properties["image"] });
                            componentElement.insertBefore(imageComponent, componentElement.firstChild);
                        }
                    }
                    else if (propertyKey == "label") {
                        var labelComponent = syiro.utilities.ElementCreator("label", { "content": properties["label"] });
                        if (componentElement.querySelector("img") == null) {
                            componentElement.insertBefore(labelComponent, componentElement.firstChild);
                        }
                        else {
                            componentElement.appendChild(labelComponent);
                        }
                    }
                }
            }
            else {
                componentElement.setAttribute("data-syiro-nonstrict-formatting", "");
                componentElement.appendChild(properties["html"]);
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "list-item" };
        }
        listitem.New = New;
        listitem.Generate = New;
        function SetControl(component, control) {
            var setControlSucceeded = false;
            if (component["type"] == "list-item") {
                var listItemElement = syiro.component.Fetch(component);
                if ((syiro.component.IsComponentObject(control)) && (control["type"] == "button")) {
                    if (listItemElement.querySelector("div") !== null) {
                        listItemElement.removeChild(listItemElement.querySelector("div"));
                    }
                    if ((listItemElement.querySelector("label") !== null) && (listItemElement.querySelector("img") !== null)) {
                        var innerListImage = listItemElement.querySelector("img");
                        syiro.component.Remove(innerListImage);
                    }
                    var innerControlElement = syiro.component.Fetch(control);
                    listItemElement.appendChild(innerControlElement);
                    syiro.events.Remove(syiro.events.eventStrings["up"], component);
                    syiro.component.Update(component["id"], listItemElement);
                    setControlSucceeded = true;
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
                    var listItemLabel = listItemElement.querySelector("label");
                    var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]');
                    var listItemImage = listItemElement.querySelector('img');
                    if ((listItemLabel !== null) && (listItemControl !== null)) {
                        syiro.component.Remove(listItemControl);
                    }
                    if (content !== "") {
                        if (listItemImage == null) {
                            listItemImage = document.createElement("img");
                            syiro.component.Add("prepend", component, listItemImage);
                        }
                        listItemImage.setAttribute("src", syiro.utilities.SanitizeHTML(content));
                        syiro.component.Update(component["id"], listItemElement);
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
            if (component["type"] == "list-item") {
                var listItemElement = syiro.component.Fetch(component);
                if (typeof content == "string") {
                    var listItemLabelElement = listItemElement.querySelector("label");
                    var listItemImage = listItemElement.querySelector("img");
                    var listItemControl = listItemElement.querySelector('div[data-syiro-component="button"]');
                    if ((listItemImage !== null) && (listItemControl !== null)) {
                        syiro.component.Remove(listItemControl);
                    }
                    if (content !== "") {
                        if (listItemLabelElement == null) {
                            listItemLabelElement = document.createElement("label");
                            if (listItemImage !== null) {
                                syiro.component.Add("prepend", component, listItemLabelElement);
                            }
                            else {
                                syiro.component.Add("prepend", component, listItemLabelElement);
                            }
                        }
                        listItemLabelElement.textContent = syiro.utilities.SanitizeHTML(content);
                        syiro.component.Update(component["id"], listItemElement);
                    }
                    else if ((content == "") && (listItemLabelElement !== null)) {
                        syiro.component.Remove(listItemLabelElement);
                    }
                    setLabelSucceeded = true;
                }
            }
            return setLabelSucceeded;
        }
        listitem.SetLabel = SetLabel;
    })(listitem = syiro.listitem || (syiro.listitem = {}));
})(syiro || (syiro = {}));
/*
 This is the namespace for Syiro Dropdown component.
 */
/// <reference path="button.ts" />
/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="list.ts" />
var syiro;
(function (syiro) {
    var dropdown;
    (function (dropdown) {
        dropdown.FetchLinkedListComponentObject = syiro.component.FetchLinkedListComponentObject;
        function Generate(properties) {
            if ((typeof properties["items"] !== "undefined") || (typeof properties["list"] !== "undefined")) {
                properties["type"] = "dropdown";
                if (properties["label"] !== undefined) {
                    properties["content"] = properties["label"];
                    delete properties["label"];
                }
                return syiro.button.New(properties);
            }
            else {
                return false;
            }
        }
        dropdown.Generate = Generate;
        dropdown.Toggle = syiro.button.Toggle;
        function SetText(component, content) {
            if (content == false) {
                content = "";
            }
            return syiro.button.SetText(component, content);
        }
        dropdown.SetText = SetText;
        dropdown.SetIcon = syiro.button.SetIcon;
        function SetImage(component, content) {
            if (content == false) {
                content = "";
            }
            return syiro.button.SetImage(component, content);
        }
        dropdown.SetImage = SetImage;
        function AddItem(component, listItemComponent) {
            var listComponentObject = syiro.component.FetchLinkedListComponentObject(component);
            syiro.component.Add("append", listComponentObject, listItemComponent);
        }
        dropdown.AddItem = AddItem;
        function RemoveItem(component, listItemComponent) {
            syiro.component.Remove(listItemComponent);
        }
        dropdown.RemoveItem = RemoveItem;
    })(dropdown = syiro.dropdown || (syiro.dropdown = {}));
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
/// <reference path="utilities.ts" />
var syiro;
(function (syiro) {
    var player;
    (function (player) {
        function Init(component) {
            if (syiro.data.Read(component["id"] + "->NoUX") == false) {
                var componentElement = syiro.component.Fetch(component);
                var innerContentElement = syiro.player.FetchInnerContentElement(component);
                var playerControlArea = componentElement.querySelector('div[data-syiro-component="player-control"]');
                var playerControlComponent = syiro.component.FetchComponentObject(playerControlArea);
                syiro.events.Add("durationchange", innerContentElement, function () {
                    // #region Player Component & Element Defining
                    var playerElement = arguments[0];
                    var playerComponentElement = playerElement.parentElement;
                    var playerComponent = syiro.component.FetchComponentObject(playerComponentElement);
                    if (syiro.data.Read(playerComponent["id"] + "->IsStreaming") == false) {
                        var playerControlElement = playerComponentElement.querySelector('div[data-syiro-component="player-control"]');
                        var playerControlComponent = syiro.component.FetchComponentObject(playerControlElement);
                        var playerRange = playerComponentElement.querySelector('input[type="range"]');
                        var playerMediaLengthInformation = syiro.player.GetPlayerLengthInfo(playerComponent);
                        playerMediaLengthInformation["value"] = "0";
                        for (var playerRangeAttribute in playerMediaLengthInformation) {
                            playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]);
                        }
                        syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation["max"]);
                    }
                });
                syiro.events.Add("timeupdate", innerContentElement, function () {
                    // #region Player Component & Element Defining
                    var playerElement = arguments[0];
                    var playerComponentElement = playerElement.parentElement;
                    var playerComponent = syiro.component.FetchComponentObject(playerComponentElement);
                    if (syiro.data.Read(playerComponent["id"] + "->IsStreaming") == false) {
                        var playerControlElement = playerComponentElement.querySelector('div[data-syiro-component="player-control"]');
                        var playerControlComponent = syiro.component.FetchComponentObject(playerControlElement);
                        var playerRange = playerControlElement.querySelector("input");
                        var currentTime = playerElement.currentTime;
                        syiro.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime);
                        if (syiro.data.Read(playerComponent["id"] + "->IsChangingInputValue") == false) {
                            var roundedDownTime = Math.floor(currentTime);
                            playerRange.value = roundedDownTime;
                            var priorInputSpaceWidth = Math.round((roundedDownTime / Number(playerRange.max)) * playerRange.clientWidth);
                            var updatedGradient = "linear-gradient(to right, " + syiro.primaryColor + " " + (priorInputSpaceWidth + 2) + "px, ";
                            if (playerComponent["type"] == "audio-player") {
                                updatedGradient += "transparent";
                            }
                            else {
                                updatedGradient += "white";
                            }
                            updatedGradient += " 0px)";
                            syiro.component.CSS(playerRange, "background", updatedGradient);
                        }
                    }
                });
                syiro.events.Add("ended", innerContentElement, syiro.player.Reset.bind(this, component));
                if (component["type"] == "video-player") {
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
                    syiro.events.Add(syiro.events.eventStrings["up"], innerContentElement, function () {
                        var innerContentElement = arguments[0];
                        if (syiro.device.SupportsTouch !== true) {
                            var playerComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement);
                            syiro.player.PlayOrPause(playerComponent);
                        }
                        else {
                            var playerControlComponent = syiro.component.FetchComponentObject(innerContentElement.parentElement.querySelector('div[data-syiro-component="player-control"]'));
                            syiro.playercontrol.Toggle(playerControlComponent);
                        }
                    });
                    syiro.events.Add("contextmenu", innerContentElement, function () {
                        var e = arguments[1];
                        e.preventDefault();
                    });
                    var fullscreenButtonElement = componentElement.querySelector('div[data-syiro-render-icon="fullscreen"]');
                    syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(fullscreenButtonElement), syiro.player.ToggleFullscreen.bind(this, component));
                }
                var playButton = playerControlArea.querySelector('div[data-syiro-render-icon="play"]');
                syiro.events.Add(syiro.events.eventStrings["up"], playButton, syiro.player.PlayOrPause.bind(this, component));
                var playerRange = playerControlArea.querySelector('input[type="range"]');
                syiro.events.Add(syiro.events.eventStrings["down"], playerRange, function () {
                    var playerRangeElement = arguments[0];
                    var playerComponent = syiro.component.FetchComponentObject(playerRangeElement.parentElement.parentElement);
                    syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", true);
                });
                syiro.events.Add(syiro.events.eventStrings["up"], playerRange, function () {
                    var playerRange = arguments[0];
                    var playerComponent = syiro.component.FetchComponentObject(playerRange.parentElement.parentElement);
                    if (syiro.data.Read(playerComponent["id"] + "->IsChangingVolume") !== true) {
                        syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", false);
                    }
                });
                syiro.events.Add("input", playerRange, function () {
                    var playerRange = arguments[0];
                    var playerComponent = syiro.component.FetchComponentObject(playerRange.parentElement.parentElement);
                    var valueNum = Number(playerRange.value);
                    if (syiro.data.Read(playerComponent["id"] + "->IsChangingVolume") !== true) {
                        syiro.player.SetTime(playerComponent, valueNum);
                    }
                    else {
                        syiro.player.SetVolume(playerComponent, (valueNum / 100));
                    }
                    var priorInputSpaceWidth = (valueNum / Number(playerRange.max)) * playerRange.clientWidth;
                    syiro.component.CSS(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + " " + priorInputSpaceWidth + "px, white 0px)");
                });
                var volumeButtonElement = playerControlArea.querySelector('div[data-syiro-render-icon="volume"]');
                if (volumeButtonElement !== null) {
                    var volumeButtonComponent = syiro.component.FetchComponentObject(volumeButtonElement);
                    syiro.events.Add(syiro.events.eventStrings["up"], volumeButtonElement, function () {
                        var volumeButton = arguments[0];
                        var playerElement = volumeButton.parentElement.parentElement;
                        var playerComponent = syiro.component.FetchComponentObject(playerElement);
                        var playerContentElement = syiro.player.FetchInnerContentElement(playerComponent);
                        var playerRange = playerElement.querySelector("input");
                        var playerRangeAttributes = {};
                        if (syiro.data.Read(playerComponent["id"] + "->IsChangingVolume") !== true) {
                            syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", true);
                            syiro.data.Write(playerComponent["id"] + "->IsChangingVolume", true);
                            volumeButton.setAttribute("active", "true");
                            var playerRangeValueFromVolume = (playerContentElement.volume * 100).toString();
                            playerRangeAttributes["max"] = "100";
                            playerRangeAttributes["step"] = "1";
                            playerRange.value = playerRangeValueFromVolume;
                            if (syiro.data.Read(playerComponent["id"] + "->IsStreaming")) {
                                playerElement.querySelector('div[data-syiro-component="player-control"]').removeAttribute("data-syiro-component-streamstyling");
                            }
                        }
                        else {
                            volumeButton.removeAttribute("active");
                            playerRangeAttributes = syiro.player.GetPlayerLengthInfo(playerComponent);
                            playerRange.value = playerContentElement.currentTime;
                            if (syiro.data.Read(playerComponent["id"] + "->IsStreaming")) {
                                playerElement.querySelector('div[data-syiro-component="player-control"]').setAttribute("data-syiro-component-streamstyling", "");
                            }
                            syiro.data.Write(playerComponent["id"] + "->IsChangingInputValue", false);
                            syiro.data.Write(playerComponent["id"] + "->IsChangingVolume", false);
                        }
                        for (var playerRangeAttribute in playerRangeAttributes) {
                            playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]);
                        }
                        var priorInputSpaceWidth = Math.round((Number(playerRange.value) / Number(playerRange.max)) * playerRange.clientWidth);
                        syiro.component.CSS(playerRange, "background", "linear-gradient(to right, " + syiro.primaryColor + "  " + priorInputSpaceWidth + "px, white 0px)");
                    });
                }
                var menuButton = componentElement.querySelector('div[data-syiro-render-icon="menu"]');
                if (menuButton !== null) {
                    syiro.events.Add(syiro.events.eventStrings["up"], syiro.component.FetchComponentObject(menuButton), syiro.player.ToggleMenuDialog.bind(this, component));
                }
                syiro.player.CheckIfStreamable(component);
                if (component["type"] == "audio-player") {
                    syiro.audioplayer.CenterInformation(component);
                }
            }
        }
        player.Init = Init;
        function CheckIfStreamable(component) {
            var componentElement = syiro.component.Fetch(component);
            var playerControlElement = componentElement.querySelector('div[data-syiro-component="player-control"]');
            var playerControlComponent = syiro.component.FetchComponentObject(playerControlElement);
            var playerRange = playerControlElement.querySelector('input[type="range"]');
            var isStreamable = false;
            if (syiro.data.Read(component["id"] + "->ForceLiveUX") !== true) {
                var contentSources = syiro.player.FetchSources(component);
                for (var contentSourceIndex in contentSources) {
                    var contentSource = contentSources[contentSourceIndex]["src"];
                    var sourceExtension = contentSource.substr(contentSource.lastIndexOf(".")).replace(".", "");
                    if ((sourceExtension == "m3u8") || (sourceExtension == "mpd")) {
                        isStreamable = true;
                        break;
                    }
                }
            }
            else {
                isStreamable = true;
            }
            if (isStreamable == true) {
                syiro.data.Write(component["id"] + "->IsStreaming", true);
                playerControlElement.setAttribute("data-syiro-component-streamstyling", "");
                if (playerControlElement.querySelector("time") !== null) {
                    playerControlElement.querySelector("time").setAttribute("data-syiro-component-live", "");
                    playerControlElement.querySelector("time").textContent = "Live";
                }
            }
            else {
                syiro.data.Write(component["id"] + "->IsStreaming", false);
                playerControlElement.removeAttribute("data-syiro-component-streamstyling");
                if (playerControlElement.querySelector("time") !== null) {
                    playerControlElement.querySelector("time").removeAttribute("data-syiro-component-live");
                    playerControlElement.querySelector("time").textContent = "00:00";
                }
            }
        }
        player.CheckIfStreamable = CheckIfStreamable;
        function FetchInnerContentElement(component) {
            var componentElement = syiro.component.Fetch(component);
            return componentElement.querySelector(component["type"].replace("-player", ""));
        }
        player.FetchInnerContentElement = FetchInnerContentElement;
        function GetPlayerLengthInfo(component) {
            var playerLengthInfo = {};
            var contentDuration = syiro.player.FetchInnerContentElement(component).duration;
            if ((isNaN(contentDuration) == false) && (isFinite(contentDuration))) {
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
            else if (isFinite(contentDuration) == false) {
                playerLengthInfo["max"] = "Streaming";
                playerLengthInfo["step"] = 1;
            }
            return playerLengthInfo;
        }
        player.GetPlayerLengthInfo = GetPlayerLengthInfo;
        function IsPlaying(component) {
            var componentElement = syiro.component.Fetch(component);
            var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused;
            return !isPaused;
        }
        player.IsPlaying = IsPlaying;
        function PlayOrPause(component, playButtonObjectOrElement) {
            var allowPlaying = false;
            var playerComponentElement = syiro.component.Fetch(component);
            var innerContentElement = syiro.player.FetchInnerContentElement(component);
            if (syiro.data.Read(component["id"] + "->ExternalLibrary") !== true) {
                var playerSources = syiro.player.FetchSources(component);
                for (var playerSourceIndex in playerSources) {
                    if (innerContentElement.canPlayType(playerSources[playerSourceIndex]["type"]) !== "") {
                        allowPlaying = true;
                    }
                }
            }
            else {
                allowPlaying = true;
            }
            if (allowPlaying == true) {
                var playButton;
                if (component["type"] == "video-player") {
                    playerComponentElement.setAttribute("data-syiro-show-video", "true");
                }
                if (typeof playButtonObjectOrElement == "undefined") {
                    playButton = playerComponentElement.querySelector('div[data-syiro-render-icon="play"]');
                }
                else if (syiro.component.IsComponentObject(playButtonObjectOrElement) == false) {
                    playButton = playButtonObjectOrElement;
                }
                else {
                    playButton = syiro.component.Fetch(playButtonObjectOrElement);
                }
                if (innerContentElement.paused !== true) {
                    innerContentElement.pause();
                    playButton.removeAttribute("active");
                }
                else {
                    innerContentElement.play();
                    playButton.setAttribute("active", "pause");
                }
            }
            else {
                var codecErrorElement = syiro.utilities.ElementCreator("div", {
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
            var sourceTags = innerContentElement.getElementsByTagName("source");
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
                if (type == "video") {
                    if (source.substr(-1) !== ";") {
                        var streamingProtocol = source.substr(0, source.indexOf(":"));
                        if ((streamingProtocol == "rtsp") || (streamingProtocol == "rtmp")) {
                            sourceTagAttributes["type"] = streamingProtocol + "/" + sourceExtension;
                        }
                        else {
                            if (sourceExtension == "m3u8") {
                                sourceTagAttributes["type"] = "application/x-mpegurl";
                            }
                            else {
                                if (sourceExtension == "mov") {
                                    sourceExtension = "quicktime";
                                }
                                sourceTagAttributes["type"] = type + "/" + sourceExtension;
                            }
                        }
                    }
                }
                var sourceTag = syiro.utilities.ElementCreator("source", sourceTagAttributes);
                arrayOfSourceElements.push(sourceTag);
            }
            return arrayOfSourceElements;
        }
        player.GenerateSources = GenerateSources;
        function Reset(component) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            var playerControl = playerElement.querySelector('div[data-syiro-component="player-control"]');
            if (syiro.data.Read(component["id"] + "->NoUX") == false) {
                if (component["type"] == "video-player") {
                    playerElement.removeAttribute("data-syiro-show-video");
                }
                var playButton = playerControl.querySelector('div[data-syiro-render-icon="play"]');
                syiro.component.CSS(playButton, "background-image", "");
                playButton.removeAttribute("active");
                var volumeControl = playerControl.querySelector('div[data-syiro-render-icon="volume"]');
                if (volumeControl !== null) {
                    volumeControl.removeAttribute("active");
                }
                var playerErrorNotice = playerElement.querySelector('div[data-syiro-minor-component="player-error"]');
                if (playerErrorNotice !== null) {
                    playerElement.removeChild(playerErrorNotice);
                }
            }
            syiro.data.Write(component["id"] + "->IsChangingInputValue", false);
            syiro.data.Write(component["id"] + "->IsChangingVolume", false);
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
            playerInnerContentElement.innerHTML = "";
            for (var sourceElementKey in arrayofSourceElements) {
                playerInnerContentElement.appendChild(arrayofSourceElements[sourceElementKey]);
            }
            playerInnerContentElement.src = sources[0];
            syiro.player.CheckIfStreamable(component);
        }
        player.SetSources = SetSources;
        function SetTime(component, time) {
            var playerElement = syiro.component.Fetch(component);
            var playerInnerContentElement = syiro.player.FetchInnerContentElement(component);
            if (playerInnerContentElement.currentTime !== time) {
                playerInnerContentElement.currentTime = time;
                if (syiro.data.Read(component["id"] + "->NoUX") == false) {
                    playerElement.querySelector('input[type="range"]').value = Math.floor(time);
                    syiro.playercontrol.TimeLabelUpdater(syiro.component.FetchComponentObject(playerElement.querySelector('div[data-syiro-component="player-control"]')), 0, time);
                }
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
            var menuButton = componentElement.querySelector('div[data-syiro-render-icon="menu"]');
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
        player.ToggleMenuDialog = ToggleMenuDialog;
    })(player = syiro.player || (syiro.player = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var playercontrol;
    (function (playercontrol) {
        function New(properties) {
            var componentId = syiro.component.IdGen("player-control");
            var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "player-control", "data-syiro-component-id": componentId });
            var playButton = syiro.button.New({ "data-syiro-render-icon": "play" });
            var inputRange = syiro.utilities.ElementCreator("input", { "type": "range", "value": "0" });
            componentElement.appendChild(inputRange);
            componentElement.appendChild(syiro.component.Fetch(playButton));
            if (typeof properties["generate-content-info"] !== "undefined") {
                var infoSection = document.createElement("section");
                infoSection.appendChild(syiro.utilities.ElementCreator("b", { "content": properties["title"] }));
                infoSection.appendChild(syiro.utilities.ElementCreator("label", { "content": properties["artist"] }));
                componentElement.appendChild(infoSection);
            }
            else {
                if (properties["is-video-player"]) {
                    var timeStamp = syiro.utilities.ElementCreator("time", { "content": "00:00 / 00:00" });
                    componentElement.appendChild(timeStamp);
                }
            }
            if (properties["menu"] !== undefined) {
                if (properties["menu"]["type"] == "list") {
                    var menuButton = syiro.button.New({ "data-syiro-render-icon": "menu" });
                    componentElement.appendChild(syiro.component.Fetch(menuButton));
                }
            }
            if (typeof properties["is-video-player"] !== "undefined") {
                var fullscreenButton = syiro.button.New({ "data-syiro-render-icon": "fullscreen" });
                componentElement.appendChild(syiro.component.Fetch(fullscreenButton));
            }
            if (syiro.device.OperatingSystem !== "iOS") {
                var volumeButton = syiro.button.New({ "data-syiro-render-icon": "volume" });
                componentElement.appendChild(syiro.component.Fetch(volumeButton));
            }
            syiro.data.Write(componentId + "->HTMLElement", componentElement);
            return { "id": componentId, "type": "player-control" };
        }
        playercontrol.New = New;
        playercontrol.Generate = New;
        function TimeLabelUpdater(component, timePart, value) {
            var playerControlElement = syiro.component.Fetch(component);
            var playerTimeElement = playerControlElement.querySelector("time");
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
        playercontrol.TimeLabelUpdater = TimeLabelUpdater;
        function Toggle(component, forceShow) {
            var playerControlElement = syiro.component.Fetch(component);
            var currentAnimationStored = null;
            if (playerControlElement.hasAttribute("data-syiro-animation")) {
                currentAnimationStored = playerControlElement.getAttribute("data-syiro-animation");
            }
            if (forceShow == true) {
                syiro.animation.FadeIn(component);
            }
            else if (forceShow == false) {
                syiro.animation.FadeOut(component);
            }
            else if (typeof forceShow == "undefined") {
                if ((currentAnimationStored == "fade-out") || (playerControlElement.hasAttribute("data-syiro-animation") == false)) {
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
        function New(properties) {
            if (properties["sources"] !== undefined) {
                var componentId = syiro.component.IdGen("audio-player");
                var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "audio-player", "data-syiro-component-id": componentId, "id": componentId, "name": componentId });
                if (typeof properties["share"] !== "undefined") {
                    properties["menu"] = properties["share"];
                }
                var audioPlayer = syiro.utilities.ElementCreator("audio", { "preload": "metadata", "volume": "0.5" });
                audioPlayer.autoplay = false;
                var arrayofSourceElements = syiro.player.GenerateSources("audio", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(audioPlayer);
                if (typeof properties["art"] !== "undefined") {
                    syiro.component.CSS(componentElement, "background-image", 'url("' + properties["art"] + '")');
                }
                else {
                    componentElement.setAttribute("data-syiro-audio-player", "mini");
                    delete properties["menu"];
                }
                if ((typeof properties["title"] !== "undefined") && (typeof properties["artist"] !== "undefined")) {
                    properties["generate-content-info"] = true;
                }
                else {
                    delete properties["title"];
                    delete properties["artist"];
                }
                if (properties["width"] == undefined) {
                    properties["width"] = 400;
                }
                syiro.component.CSS(componentElement, "width", properties["width"].toString() + "px");
                var playerControlComponent = syiro.playercontrol.New(properties);
                var playerControlElement = syiro.component.Fetch(playerControlComponent);
                if (properties["menu"] !== undefined) {
                    if (properties["menu"]["type"] == "list") {
                        var playerMenuDialog = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "player-menu" });
                        playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content": "Menu" }));
                        playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"]));
                        componentElement.insertBefore(playerMenuDialog, componentElement.firstChild);
                    }
                }
                componentElement.appendChild(playerControlElement);
                var usingExternalLibrary = false;
                if ((typeof properties["UsingExternalLibrary"] !== "undefined") && (properties["UsingExternalLibrary"] == true)) {
                    usingExternalLibrary = true;
                }
                syiro.data.Write(componentId, {
                    "ExternalLibrary": usingExternalLibrary,
                    "HTMLElement": componentElement,
                    "scaling": {
                        "initialDimensions": [150, properties["width"]],
                        "ratio": [0, 0]
                    }
                });
                return { "id": componentId, "type": "audio-player" };
            }
            else {
                return { "error": "no sources defined" };
            }
        }
        audioplayer.New = New;
        audioplayer.Generate = New;
        function CenterInformation(component) {
            var componentElement = syiro.component.Fetch(component);
            var playerControlElement = componentElement.querySelector('div[data-syiro-component="player-control"]');
            var audioInformation = playerControlElement.querySelector("section");
            if (audioInformation !== null) {
                var audioInformationWidth = ((componentElement.clientWidth / 2) - (audioInformation.clientWidth / 2) - 40);
                syiro.component.CSS(audioInformation, "margin-left", audioInformationWidth.toString() + "px");
            }
        }
        audioplayer.CenterInformation = CenterInformation;
    })(audioplayer = syiro.audioplayer || (syiro.audioplayer = {}));
})(syiro || (syiro = {}));
var syiro;
(function (syiro) {
    var videoplayer;
    (function (videoplayer) {
        function New(properties) {
            if (properties["sources"] !== undefined) {
                var componentId = syiro.component.IdGen("video-player");
                var syiroComponentData = { "scaling": {} };
                var syiroVideoElementProperties = { "preload": "metadata", "UIWebView": "allowsInlineMediaPlayback" };
                var componentElement = syiro.utilities.ElementCreator("div", { "data-syiro-component": "video-player", "data-syiro-component-id": componentId, "id": componentId, "name": componentId });
                if (navigator.userAgent.indexOf("iPhone") == -1) {
                    syiroVideoElementProperties["volume"] = "0.5";
                    if (typeof properties["art"] !== "undefined") {
                        syiro.component.CSS(componentElement, "background-image", 'url("' + properties["art"] + '")');
                    }
                    if (properties["menu"] !== undefined) {
                        if (properties["menu"]["type"] == "list") {
                            var playerMenuDialog = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "player-menu" });
                            playerMenuDialog.appendChild(syiro.utilities.ElementCreator("label", { "content": "Menu" }));
                            playerMenuDialog.appendChild(syiro.component.Fetch(properties["menu"]));
                            componentElement.insertBefore(playerMenuDialog, componentElement.firstChild);
                        }
                    }
                    properties["is-video-player"] = true;
                    var playerControlComponent = syiro.playercontrol.New(properties);
                    componentElement.appendChild(syiro.component.Fetch(playerControlComponent));
                    if ((typeof properties["ForceLiveUX"] !== "undefined") && (properties["ForceLiveUX"] == true)) {
                        syiroComponentData["ForceLiveUX"] = true;
                    }
                }
                else {
                    syiroComponentData["NoUX"] = true;
                    if (typeof properties["art"] !== "undefined") {
                        syiroVideoElementProperties["poster"] = properties["art"];
                    }
                    syiroVideoElementProperties["controls"] = "controls";
                }
                var videoPlayer = syiro.utilities.ElementCreator("video", syiroVideoElementProperties);
                videoPlayer.autoplay = false;
                var arrayofSourceElements = syiro.player.GenerateSources("video", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.insertBefore(videoPlayer, componentElement.lastChild);
                syiroComponentData["HTMLElement"] = componentElement;
                if (typeof properties["ratio"] !== "undefined") {
                    syiroComponentData["scaling"]["ratio"] = properties["ratio"];
                    syiroComponentData["scaling"]["initialDimensions"] = [properties["height"], properties["width"]];
                }
                else if (typeof properties["fill"] !== "undefined") {
                    syiroComponentData["scaling"]["fill"] = properties["fill"];
                }
                else {
                    syiroComponentData["scaling"]["initialDimensions"] = [properties["height"], properties["width"]];
                }
                var usingExternalLibrary = false;
                if ((typeof properties["UsingExternalLibrary"] !== "undefined") && (properties["UsingExternalLibrary"] == true)) {
                    usingExternalLibrary = true;
                }
                syiro.data.Write(componentId, syiroComponentData);
                return { "id": componentId, "type": "video-player" };
            }
            else {
                return { "error": "no video defined" };
            }
        }
        videoplayer.New = New;
        videoplayer.Generate = New;
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
            var searchboxContainerData = { "data-syiro-component": "searchbox", "data-syiro-component-id": componentId, "data-syiro-render-icon": "search" };
            if (properties == undefined) {
                properties = {};
            }
            if (properties["content"] == undefined) {
                properties["content"] = "Search here...";
            }
            var inputElement = syiro.utilities.ElementCreator("input", { "aria-autocomplete": "list", "role": "textbox", "placeholder": properties["content"] });
            searchboxContainerData["content"] = inputElement;
            if ((typeof properties["suggestions"] !== "undefined") && (properties["suggestions"] == true)) {
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
            var searchboxComponent = syiro.component.FetchComponentObject(arguments[0].parentElement);
            var searchboxElement = arguments[0].parentElement;
            var searchboxValue = arguments[1];
            var linkedListComponent = syiro.component.FetchLinkedListComponentObject(searchboxComponent);
            var linkedListComponentElement = syiro.component.Fetch(linkedListComponent);
            var innerListItemsOfLinkedList = linkedListComponentElement.querySelectorAll('div[data-syiro-component="list-item"]');
            syiro.component.CSS(linkedListComponentElement, "width", searchboxElement.clientWidth + "px");
            syiro.render.Position(["below", "center"], linkedListComponent, searchboxComponent);
            if (searchboxValue !== "") {
                if (syiro.data.Read(searchboxComponent["id"] + "->preseed") == true) {
                    syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important");
                    if (innerListItemsOfLinkedList.length > 0) {
                        var numOfListItemsThatWillShow = 0;
                        for (var listItemIndex = 0; listItemIndex < innerListItemsOfLinkedList.length; listItemIndex++) {
                            var listItem = innerListItemsOfLinkedList[listItemIndex];
                            if (listItem.textContent.indexOf(searchboxValue) !== -1) {
                                numOfListItemsThatWillShow++;
                                syiro.component.CSS(listItem, "display", "block !important");
                            }
                            else {
                                syiro.component.CSS(listItem, "display", "none !important");
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
                var searchboxInputElement = searchboxElement.getElementsByTagName("input")[0];
                if (content !== "") {
                    searchboxInputElement.setAttribute("placeholder", content);
                }
                else if (content == "") {
                    searchboxInputElement.removeAttribute("placeholder");
                }
                syiro.component.Update(component["id"], searchboxElement);
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
            var sidepaneEdge = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component": "sidepane-edge" });
            componentElement.appendChild(sidepaneContentElement);
            componentElement.appendChild(sidepaneEdge);
            for (var _i = 0, _a = properties["items"]; _i < _a.length; _i++) {
                var item = _a[_i];
                var appendableElement;
                var isSyiroComponent = false;
                if (syiro.component.IsComponentObject(item)) {
                    appendableElement = syiro.component.Fetch(item);
                    isSyiroComponent = true;
                }
                else if ((typeof item.nodeType !== "undefined") && (item.nodeType == 1)) {
                    appendableElement = syiro.utilities.SanitizeHTML(item);
                }
                if (typeof appendableElement !== "undefined") {
                    if (isSyiroComponent && (item["type"] == "searchbox")) {
                        if (sidepaneContentElement.querySelector('img:first-child') !== null) {
                            sidepaneContentElement.insertBefore(appendableElement, sidepaneContentElement.childNodes[1]);
                        }
                        else {
                            sidepaneContentElement.insertBefore(appendableElement, sidepaneContentElement.firstChild);
                        }
                    }
                    else {
                        if ((appendableElement.nodeName == "IMG") || (appendableElement.nodeName == "PICTURE") && (sidepaneContentElement.childNodes.length !== 0)) {
                            sidepaneContentElement.insertBefore(appendableElement, sidepaneContentElement.firstChild);
                        }
                        else {
                            sidepaneContentElement.appendChild(appendableElement);
                        }
                    }
                }
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
            if ((syiro.component.IsComponentObject(component)) && (component["type"] == "sidepane")) {
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
                        if (mousePosition > (componentElement.clientWidth / 2)) {
                            showSidepane = true;
                        }
                    }
                    else if (currentTransformProperty !== false) {
                        var transformPosition = Number(currentTransformProperty.replace("translateX(-", "").replace("px)", ""));
                        if (transformPosition < (componentElement.clientWidth / 2)) {
                            showSidepane = true;
                        }
                    }
                    else if (typeof eventData == "undefined") {
                        showSidepane = true;
                    }
                }
                componentElement.removeAttribute("data-syiro-render-animation");
                syiro.component.CSS(componentElement, "transform", false);
                syiro.component.CSS(componentElement, "-webkit-transform", false);
                if (showSidepane == true) {
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
                for (var i = 0; i < toasts.length; i++) {
                    var toastComponentObject = syiro.component.FetchComponentObject(toasts[i]);
                    syiro.toast.Clear(toastComponentObject);
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
                        if (currentAnimation == "fade-in") {
                            showAnimation = false;
                        }
                    }
                }
                else {
                    if (action == "hide") {
                        showAnimation = false;
                    }
                }
                if ((showAnimation == true) && ((syiro.device.width > 1024) && (toastType == "normal"))) {
                    syiro.animation.Slide(component);
                }
                else if ((showAnimation == true) && (((syiro.device.width <= 1024) && (toastType == "normal")) || (toastType == "dialog"))) {
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
    syiro.legacyDimensionsDetection;
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
        if (syiro.device.SupportsMutationObserver) {
            var mutationWatcher = new MutationObserver(function (mutations) {
                for (var _i = 0; _i < mutations.length; _i++) {
                    var mutation = mutations[_i];
                    if (mutation.type == "childList") {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var componentElement = mutation.addedNodes[i];
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
