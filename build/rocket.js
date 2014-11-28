var rocket;
(function (rocket) {
    var component;
    (function (_component) {
        _component.listenerStrings = {
            "down": ["mousedown", "touchstart", "MSPointerDown"],
            "up": ["mouseup", "touchend", "MSPointerUp"],
            "press": ["click", "touchend", "MSPointerUp"]
        };
        _component.storedComponents = {};
        function Define(type, selector) {
            var component = {};
            component["type"] = type;
            var componentID = rocket.generator.IdGen(type);
            var selectedElement = document.querySelector(selector);
            selectedElement.setAttribute("data-rocket-component-id", componentID);
            component["id"] = componentID;
            if (type == "dropdown") {
                rocket.component.AddListeners(rocket.component.listenerStrings["press"], component, rocket.dropdown.Toggle);
            }
            return component;
        }
        _component.Define = Define;
        function Animate(component, animation, postAnimationFunction) {
            var componentElement = rocket.component.Fetch(component);
            if (componentElement !== null) {
                var elementTimeoutId = window.setTimeout(function () {
                    var component = arguments[0];
                    var componentElement = rocket.component.Fetch(component);
                    var postAnimationFunction = arguments[1];
                    var timeoutId = componentElement.getAttribute("data-rocket-animationTimeout-id");
                    componentElement.removeAttribute("data-rocket-animationTimeout-id");
                    window.clearTimeout(Number(timeoutId));
                    postAnimationFunction(component);
                }.bind(rocket, component, postAnimationFunction), 250);
                componentElement.setAttribute("data-rocket-animationTimeout-id", elementTimeoutId.toString());
                if (component["type"] == "dropdown") {
                    var tempElement = componentElement;
                    componentElement = tempElement.querySelector('div[data-rocket-component="list"]');
                }
                else if ((component["type"] == "button") && (componentElement.getAttribute("data-rocket-component-type") == "toggle")) {
                    var tempElement = componentElement;
                    componentElement = tempElement.querySelector('div[data-rocket-minor-component="buttonToggle"]');
                }
                componentElement.setAttribute("class", animation);
            }
        }
        _component.Animate = Animate;
        function CSS(component, property, newValue) {
            var modifiableElement;
            var returnedValue;
            var modifiedStyling = false;
            if (component["type"] !== undefined) {
                modifiableElement = rocket.component.Fetch(component);
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
            if (rocket.component.storedComponents[component["id"]] !== undefined) {
                componentElement = rocket.component.storedComponents[component["id"]];
            }
            else {
                componentElement = document.querySelector('*[data-rocket-component-id="' + component["id"] + '"]');
            }
            return componentElement;
        }
        _component.Fetch = Fetch;
        function FetchComponentObject(componentElement) {
            if (componentElement.hasAttribute("data-rocket-component")) {
                return { "id": componentElement.getAttribute("data-rocket-component-id"), "type": componentElement.getAttribute("data-rocket-component") };
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
                componentElement = rocket.component.Fetch(component);
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
            if (rocket.component.storedComponents[componentId] !== undefined) {
                rocket.component.storedComponents[componentId] = componentElement;
            }
        }
        _component.Update = Update;
        function AddListeners() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var allowListening = true;
            var listeners;
            var component;
            var listenerCallback;
            if ((args.length == 2) || (args.length == 3)) {
                if (args.length == 2) {
                    component = args[0];
                    listenerCallback = args[1];
                    if (component["type"] !== "searchbox") {
                        listeners = rocket.component.listenerStrings["press"];
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
                var componentElement = rocket.component.Fetch(component);
                if (componentElement !== null) {
                    if (component["type"] == "list-item") {
                        if (componentElement.querySelector("div") !== null) {
                            allowListening = false;
                        }
                    }
                    if (allowListening == true) {
                        if ((typeof listeners).toLowerCase() == "string") {
                            listeners = listeners.trim().split(" ");
                        }
                        listeners.forEach(function (individualListener) {
                            componentElement.addEventListener(individualListener, function () {
                                var component = arguments[0];
                                var listenerCallback = arguments[1];
                                var componentElement = rocket.component.Fetch(component);
                                var passableValue = null;
                                if ((component["type"] == "button") && (componentElement.getAttribute("data-rocket-component-type") == "toggle")) {
                                    var animationString;
                                    if (componentElement.hasAttribute("data-rocket-component-status") == false) {
                                        animationString = "toggle-forward-animation";
                                        passableValue = true;
                                    }
                                    else {
                                        animationString = "toggle-backward-animation";
                                        passableValue = false;
                                    }
                                    rocket.component.Animate(component, animationString, function (component) {
                                        var buttonElement = rocket.component.Fetch(component);
                                        if (buttonElement.hasAttribute("data-rocket-component-status") == false) {
                                            buttonElement.setAttribute("data-rocket-component-status", "true");
                                        }
                                        else {
                                            buttonElement.removeAttribute("data-rocket-component-status");
                                        }
                                    });
                                }
                                else if (component["type"] == "searchbox") {
                                    passableValue = componentElement.value;
                                }
                                listenerCallback.call(rocket, component, passableValue);
                            }.bind(rocket, component, listenerCallback));
                        });
                    }
                }
                else {
                    allowListening = false;
                }
            }
            else {
                allowListening = false;
            }
            return allowListening;
        }
        _component.AddListeners = AddListeners;
        function RemoveListeners(component) {
            var successfulRemoval = false;
            var componentElement = rocket.component.Fetch(component);
            if (componentElement !== null) {
                if (component["type"] == "dropdown") {
                    componentElement = componentElement.querySelector('div[data-rocket-minor-component="dropdown-label"]');
                }
                var newElement = componentElement.cloneNode(true);
                componentElement.outerHTML = newElement.outerHTML;
                successfulRemoval = true;
            }
            return successfulRemoval;
        }
        _component.RemoveListeners = RemoveListeners;
        function Add(append, parentComponent, childComponent) {
            var parentElement = rocket.component.Fetch(parentComponent);
            var childComponentId;
            var childComponentType = (typeof childComponent).toLowerCase();
            var childElement = rocket.component.Fetch(childComponent);
            var allowAdding = false;
            if (childComponentType == "object") {
                childComponentId = childComponent["id"];
                if (parentComponent["type"] == "header" && ((childComponent["type"] == "dropdown") || (childComponent["type"] == "searchbox"))) {
                    childElement = rocket.component.Fetch(childComponent);
                    allowAdding = true;
                }
                else if (childComponent["type"] == "list-item") {
                    if (parentComponent["type"] == "dropdown") {
                        parentComponent = rocket.dropdown.FetchLinkedListComponentObject(parentComponent);
                        parentElement = rocket.component.Fetch(parentComponent);
                    }
                    if (parentComponent["type"] == "list") {
                        allowAdding = true;
                    }
                }
                else if (childComponent["link"] !== undefined) {
                    childElement = rocket.generator.ElementCreator("a", {
                        "title": childComponent["title"],
                        "href": childComponent["link"],
                        "content": childComponent["title"]
                    });
                    allowAdding = true;
                }
                else {
                    childElement = rocket.component.Fetch(childComponent);
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
                if (childComponentId !== undefined) {
                    if (rocket.component.storedComponents[childComponentId] !== undefined) {
                        delete rocket.component.storedComponents[childComponentId];
                    }
                }
            }
            else {
                allowAdding = false;
            }
            rocket.component.Update(parentComponent["id"], parentElement);
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
                    var individualComponentElement = rocket.component.Fetch(individualComponent);
                    if (individualComponentElement !== null) {
                        if (rocket.component.storedComponents[individualComponent["id"]] == undefined) {
                            var parentElement = individualComponentElement.parentElement;
                            parentElement.removeChild(individualComponentElement);
                        }
                        else {
                            delete rocket.component.storedComponents[individualComponent["id"]];
                        }
                    }
                }
            }
            return allowRemoval;
        }
        _component.Remove = Remove;
    })(component = rocket.component || (rocket.component = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
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
                rocket.device.DoNotTrack = Boolean(navigator.doNotTrack);
            }
            else {
                rocket.device.DoNotTrack = true;
            }
            if (window.crypto == undefined) {
                rocket.device.HasCryptography = false;
            }
            if (navigator.geolocation == undefined) {
                rocket.device.HasGeolocation = false;
            }
            if (window.indexedDB == undefined) {
                rocket.device.HasIndexedDB = false;
            }
            if (window.localStorage == undefined) {
                rocket.device.HasLocalStorage = false;
            }
            if (navigator.onLine !== undefined) {
                rocket.device.IsOnline = navigator.onLine;
                document.addEventListener("online", function () {
                    rocket.device.IsOnline = true;
                }, false);
                document.addEventListener("offline", function () {
                    rocket.device.IsOnline = false;
                }, false);
            }
            rocket.device.FetchScreenDetails();
            window.addEventListener("resize", rocket.device.FetchScreenDetails);
        }
        device.Detect = Detect;
        function FetchScreenDetails() {
            if (window.screen.height < 720) {
                rocket.device.IsSubHD = true;
                rocket.device.IsHD = false;
                rocket.device.IsFullHDOrAbove = false;
            }
            else {
                if (((window.screen.height >= 720) && (window.screen.height < 1080)) && (window.screen.width >= 1280)) {
                    rocket.device.IsSubHD = false;
                    rocket.device.IsHD = true;
                    rocket.device.IsFullHDOrAbove = false;
                }
                else if ((window.screen.height >= 1080) && (window.screen.width >= 1920)) {
                    rocket.device.IsSubHD = false;
                    rocket.device.IsHD = true;
                    rocket.device.IsFullHDOrAbove = true;
                }
            }
        }
        device.FetchScreenDetails = FetchScreenDetails;
    })(device = rocket.device || (rocket.device = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var generator;
    (function (generator) {
        generator.lastUniqueIds = {};
        function IdGen(type) {
            var lastUniqueIdOfType;
            if (rocket.generator.lastUniqueIds[type] == undefined) {
                lastUniqueIdOfType = 0;
            }
            else {
                lastUniqueIdOfType = rocket.generator.lastUniqueIds[type];
            }
            var newUniqueIdOfType = lastUniqueIdOfType + 1;
            rocket.generator.lastUniqueIds[type] = newUniqueIdOfType;
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
                generatedElement.setAttribute("data-rocket-component-id", componentId);
                generatedElement.setAttribute("data-rocket-component", componentType);
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
    })(generator = rocket.generator || (rocket.generator = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var header;
    (function (header) {
        function Generate(properties) {
            var componentId = rocket.generator.IdGen("header");
            var componentElement = rocket.generator.ElementCreator(componentId, "header");
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var individualItem in properties["items"]) {
                        if (properties["items"][individualItem]["type"] == "dropdown") {
                            var dropdownComponent = properties["items"][individualItem]["component"];
                            componentElement.appendChild(rocket.component.Fetch(dropdownComponent));
                            delete rocket.component.storedComponents[dropdownComponent["id"]];
                        }
                        else if (properties["items"][individualItem]["type"] == "link") {
                            var generatedElement = rocket.generator.ElementCreator("a", {
                                "href": properties["items"][individualItem]["link"],
                                "content": properties["items"][individualItem]["content"]
                            });
                            componentElement.appendChild(generatedElement);
                        }
                    }
                }
                else if (propertyKey == "logo") {
                    var generatedElement = rocket.generator.ElementCreator("img", {
                        "data-rocket-minor-component": "logo",
                        "src": properties["logo"]
                    });
                    componentElement.appendChild(generatedElement);
                }
            }
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "header" };
        }
        header.Generate = Generate;
        function SetLogo(component, image) {
            var headerElement = rocket.component.Fetch(component);
            var imageElement = headerElement.querySelector('img[data-rocket-minor-component="logo"]');
            if (imageElement == null) {
                imageElement = rocket.generator.ElementCreator("img", { "data-rocket-minor-component": "logo", "src": image });
                headerElement.insertBefore(imageElement, headerElement.firstChild);
            }
            else {
                imageElement.setAttribute("src", image);
            }
            rocket.component.Update(component["id"], headerElement);
        }
        header.SetLogo = SetLogo;
        function RemoveLogo(component) {
            var headerElement = rocket.component.Fetch(component);
            if (headerElement.querySelectorAll('img[data-rocket-minor-component="logo"]').length > 0) {
                headerElement.removeChild(headerElement.firstChild);
                rocket.component.Update(component["id"], headerElement);
            }
        }
        header.RemoveLogo = RemoveLogo;
    })(header = rocket.header || (rocket.header = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var footer;
    (function (footer) {
        function Generate(properties) {
            var componentId = rocket.generator.IdGen("footer");
            var componentElement = rocket.generator.ElementCreator(componentId, "footer");
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var individualItem in properties["items"]) {
                        if (properties["items"][individualItem]["type"] == "link") {
                            var generatedElement = rocket.generator.ElementCreator("a", {
                                "href": properties["items"][individualItem]["link"],
                                "content": properties["items"][individualItem]["content"]
                            });
                            componentElement.appendChild(generatedElement);
                        }
                    }
                }
                else if (propertyKey == "content") {
                    var generatedElement = rocket.generator.ElementCreator("label", { "content": properties["content"] });
                    componentElement.insertBefore(generatedElement, componentElement.firstChild);
                }
            }
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "footer" };
        }
        footer.Generate = Generate;
        function SetLabel(component, labelText) {
            if (component !== undefined) {
                if (labelText !== undefined) {
                    var parentElement = rocket.component.Fetch(component);
                    var labelComponent = document.querySelector("pre");
                    if (labelComponent == null) {
                        labelComponent = rocket.generator.ElementCreator("pre", { "content": labelText });
                        parentElement.insertBefore(labelComponent, parentElement.firstChild);
                    }
                    else {
                        labelComponent.textContent = labelText;
                    }
                    rocket.component.Update(component["id"], parentElement);
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
                    componentAddingSucceeded = rocket.component.Add(prepend, component, linkProperties);
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
            var footerElement = rocket.component.Fetch(component);
            var potentialLinkElement = footerElement.querySelector('a[href="' + linkProperties["link"] + '"][title="' + linkProperties["title"] + '"]');
            if (potentialLinkElement !== null) {
                footerElement.removeChild(potentialLinkElement);
                rocket.component.Update(component["id"], footerElement);
                componentRemovingSucceed = true;
            }
            else {
                componentRemovingSucceed = false;
            }
            return componentRemovingSucceed;
        }
        footer.RemoveLink = RemoveLink;
    })(footer = rocket.footer || (rocket.footer = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var button;
    (function (button) {
        function Generate(properties) {
            if (properties["type"] == undefined) {
                properties["type"] = "basic";
            }
            var componentId = rocket.generator.IdGen("button");
            var componentElement = rocket.generator.ElementCreator(componentId, "button", {
                "data-rocket-component-type": properties["type"]
            });
            for (var propertyKey in properties) {
                if ((propertyKey == "icon") && (properties["type"] == "basic")) {
                    rocket.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")");
                }
                else if (propertyKey == "content") {
                    componentElement.textContent = properties["content"];
                }
                else if ((propertyKey == "type") && (properties["type"] == "toggle")) {
                    var buttonToggleAttributes = { "data-rocket-minor-component": "buttonToggle" };
                    if (properties["default"] == true) {
                        buttonToggleAttributes["data-rocket-component-status"] = "true";
                    }
                    var buttonToggle = rocket.generator.ElementCreator("div", buttonToggleAttributes);
                    componentElement.appendChild(buttonToggle);
                }
                else {
                    componentElement.setAttribute(propertyKey, properties[propertyKey]);
                }
            }
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "button" };
        }
        button.Generate = Generate;
        function SetLabel(component, content) {
            var setSucceeded;
            var componentElement = rocket.component.Fetch(component);
            if ((componentElement !== null) && (componentElement.getAttribute("data-rocket-component-type") == "basic")) {
                componentElement.textContent = content;
                rocket.component.Update(component["id"], componentElement);
                setSucceeded = true;
            }
            else {
                setSucceeded = false;
            }
            return setSucceeded;
        }
        button.SetLabel = SetLabel;
    })(button = rocket.button || (rocket.button = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var list;
    (function (list) {
        function Generate(properties) {
            var componentId = rocket.generator.IdGen("list");
            var componentElement = rocket.generator.ElementCreator(componentId, "list");
            for (var propertyKey in properties) {
                if (propertyKey == "items") {
                    for (var individualItemIndex in properties["items"]) {
                        var individualItem = properties["items"][individualItemIndex];
                        if (individualItem["type"] !== "list-item") {
                            individualItem = rocket.listitem.Generate(individualItem);
                        }
                        componentElement.appendChild(rocket.component.Fetch(individualItem));
                        delete rocket.component.storedComponents[individualItem["id"]];
                    }
                }
            }
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "list" };
        }
        list.Generate = Generate;
        list.AddItem = rocket.component.Add;
        list.RemoveItem = rocket.component.Remove;
    })(list = rocket.list || (rocket.list = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var listitem;
    (function (listitem) {
        function Generate(properties) {
            var componentId = rocket.generator.IdGen("list-item");
            var componentElement = rocket.generator.ElementCreator(componentId, "list-item");
            for (var propertyKey in properties) {
                if (propertyKey == "control") {
                    var controlComponentObject = properties[propertyKey];
                    if (controlComponentObject["type"] == "button") {
                        var controlComponentElement = rocket.component.Fetch(controlComponentObject);
                        componentElement.appendChild(controlComponentElement);
                        delete rocket.component.storedComponents[controlComponentObject["id"]];
                    }
                }
                else if (propertyKey == "label") {
                    var labelComponent = rocket.generator.ElementCreator("label", { "content": properties["label"] });
                    componentElement.insertBefore(labelComponent, componentElement.firstChild);
                }
            }
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "list-item" };
        }
        listitem.Generate = Generate;
        function SetLabel(component, content) {
            var setLabelSucceeded = false;
            if (component["type"] == "list-item") {
                var listItemElement = rocket.component.Fetch(component);
                if (typeof content == "string") {
                    var listItemLabelElement;
                    if (listItemElement.querySelector("label") !== null) {
                        listItemLabelElement = listItemElement.querySelector("label");
                    }
                    else {
                        listItemLabelElement = rocket.generator.ElementCreator("label");
                        listItemElement.insertBefore(listItemLabelElement, listItemElement.firstChild);
                    }
                    listItemLabelElement.textContent = content;
                    setLabelSucceeded = true;
                }
            }
            return setLabelSucceeded;
        }
        listitem.SetLabel = SetLabel;
        function SetControl(component, control) {
            var setControlSucceeded = false;
            if (component["type"] == "list-item") {
                var listItemElement = rocket.component.Fetch(component);
                if (typeof control == "object") {
                    if (listItemElement.querySelector("div") !== null) {
                        listItemElement.removeChild(listItemElement.querySelector("div"));
                    }
                    if (control["type"] == "button") {
                        var innerControlElement = rocket.component.Fetch(control);
                        if (innerControlElement !== null) {
                            delete rocket.component.storedComponents[control["id"]];
                            listItemElement.appendChild(innerControlElement);
                            rocket.component.RemoveListeners(component);
                            rocket.component.Update(component["id"], listItemElement);
                            setControlSucceeded = true;
                        }
                    }
                }
            }
            return setControlSucceeded;
        }
        listitem.SetControl = SetControl;
    })(listitem = rocket.listitem || (rocket.listitem = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var dropdown;
    (function (dropdown) {
        function Generate(properties) {
            if ((properties["items"] !== undefined) || (properties["list"] !== undefined)) {
                var componentId = rocket.generator.IdGen("dropdown");
                var componentElement = rocket.generator.ElementCreator(componentId, "dropdown");
                if (properties["image"] !== undefined) {
                    var primaryImage = rocket.generator.ElementCreator("img", { "src": properties["image"] });
                    componentElement.appendChild(primaryImage);
                }
                if (properties["label"] !== undefined) {
                    var dropdownLabelText = rocket.generator.ElementCreator("label", { "content": properties["label"] });
                    componentElement.appendChild(dropdownLabelText);
                }
                if (properties["icon"] !== undefined) {
                    rocket.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")");
                }
                var listComponent;
                if (properties["items"] !== undefined) {
                    listComponent = rocket.list.Generate({ "items": properties["items"] });
                }
                else {
                    listComponent = properties["list"];
                }
                var listComponentElement = rocket.component.Fetch(listComponent);
                document.querySelector("body").appendChild(listComponentElement);
                listComponentElement.setAttribute("data-rocket-component-owner", componentId);
                if (properties["position"] == undefined) {
                    properties["position"] = { "vertical": "below", "horizontal": "center" };
                }
                listComponentElement.setAttribute("data-rocket-component-render", properties["position"]["vertical"] + "-" + properties["position"]["horizontal"]);
                rocket.component.storedComponents[componentId] = componentElement;
                return { "id": componentId, "type": "dropdown" };
            }
            else {
                return false;
            }
        }
        dropdown.Generate = Generate;
        function Toggle(component) {
            var component = arguments[0];
            var componentElement = rocket.component.Fetch(component);
            var linkedListComponentObject = rocket.dropdown.FetchLinkedListComponentObject(component);
            var linkedListComponentElement = rocket.component.Fetch(linkedListComponentObject);
            var currentIcon = rocket.component.CSS(component, "background-image");
            if (rocket.component.CSS(linkedListComponentElement, "visibility") !== false) {
                if (currentIcon !== false) {
                    rocket.component.CSS(component, "background-image", currentIcon.replace("-inverted", ""));
                }
                componentElement.removeAttribute("active");
                rocket.component.CSS(linkedListComponentElement, "visibility", false);
            }
            else {
                var positionInformation = linkedListComponentElement.getAttribute("data-rocket-component-render").split("-");
                var listToDropdownVerticalRelation = positionInformation[0];
                var listToDropdownHorizontalRelation = positionInformation[1];
                var dropdownDimensionsAndPosition = rocket.component.FetchDimensionsAndPosition(componentElement);
                var listDimensionsAndPosition = rocket.component.FetchDimensionsAndPosition(linkedListComponentElement);
                var dropdownHeight = dropdownDimensionsAndPosition["height"];
                var dropdownWidth = dropdownDimensionsAndPosition["width"];
                var dropdownVerticalPosition = dropdownDimensionsAndPosition["y"];
                var dropdownHorizontalPosition = dropdownDimensionsAndPosition["x"];
                var listHeight = listDimensionsAndPosition["height"];
                var listWidth = listDimensionsAndPosition["width"];
                var listVerticalPosition;
                var listHorizontalPosition;
                if (listToDropdownVerticalRelation == "above") {
                    listVerticalPosition = (dropdownVerticalPosition - listHeight);
                }
                else {
                    listVerticalPosition = (dropdownVerticalPosition + dropdownHeight);
                }
                if (listVerticalPosition < 0) {
                    listVerticalPosition = 0;
                }
                else if ((listVerticalPosition > window.screen.height) || (listVerticalPosition + listHeight > window.screen.height)) {
                    listVerticalPosition = window.screen.height - listHeight;
                }
                var listWidthInRelationToDropdown = (listWidth - dropdownWidth);
                if (listToDropdownHorizontalRelation == "left") {
                    listHorizontalPosition = (dropdownHorizontalPosition - listWidthInRelationToDropdown);
                }
                else if (listToDropdownHorizontalRelation == "center") {
                    listHorizontalPosition = (dropdownHorizontalPosition + (listWidthInRelationToDropdown / 2));
                }
                else if (listToDropdownHorizontalRelation == "right") {
                    listHorizontalPosition = dropdownHorizontalPosition;
                }
                if (listHorizontalPosition < 0) {
                    listHorizontalPosition = 0;
                }
                else if ((listHorizontalPosition > window.screen.width) || (listHorizontalPosition + listWidth > window.screen.width)) {
                    listHorizontalPosition = window.screen.width - listWidth;
                }
                if (currentIcon !== false) {
                    var currentIconWithoutExtension = currentIcon.substr(0, currentIcon.indexOf("."));
                    rocket.CSS(component, "background-image", currentIcon.replace(currentIconWithoutExtension, currentIconWithoutExtension + "-inverted"));
                }
                componentElement.setAttribute("active", "");
                rocket.component.CSS(linkedListComponentElement, "top", listVerticalPosition.toString() + "px");
                rocket.component.CSS(linkedListComponentElement, "left", listHorizontalPosition.toString() + "px");
                rocket.component.CSS(linkedListComponentElement, "visibility", "visible !important");
            }
        }
        dropdown.Toggle = Toggle;
        ;
        function FetchLinkedListComponentObject(component) {
            var listSelector = 'div[data-rocket-component="list"][data-rocket-component-owner="' + component["id"] + '"]';
            return rocket.component.FetchComponentObject(document.querySelector(listSelector));
        }
        dropdown.FetchLinkedListComponentObject = FetchLinkedListComponentObject;
        function SetText(component, content) {
            var dropdownElement = rocket.component.Fetch(component);
            var dropdownLabel = dropdownElement.querySelector("label");
            if (content !== false) {
                dropdownLabel.textContent = content;
            }
            else if (content == false) {
                dropdownElement.removeChild(dropdownLabel);
            }
            rocket.component.Update(component["id"], dropdownElement);
        }
        dropdown.SetText = SetText;
        function SetImage(component, content) {
            var dropdownElement = rocket.component.Fetch(component);
            var dropdownLabelImage = dropdownElement.querySelector("img");
            if (content !== false) {
                if (dropdownLabelImage == null) {
                    dropdownLabelImage = rocket.generator.ElementCreator("img");
                    dropdownElement.insertBefore(dropdownLabelImage, dropdownElement.firstChild);
                }
                dropdownLabelImage.setAttribute("src", content);
            }
            else {
                dropdownElement.removeChild(dropdownLabelImage);
            }
            rocket.component.Update(component["id"], dropdownElement);
        }
        dropdown.SetImage = SetImage;
        function SetIcon(component, content) {
            var dropdownElement = rocket.component.Fetch(component);
            rocket.component.CSS(component, "background-image", content);
        }
        dropdown.SetIcon = SetIcon;
        function AddItem(component, listItemComponent) {
            var listComponentObject = rocket.dropdown.FetchLinkedListComponentObject(component);
            rocket.component.Add(true, listComponentObject, listItemComponent);
        }
        dropdown.AddItem = AddItem;
        function RemoveItem(component, listItemComponent) {
            rocket.component.Remove(listItemComponent);
        }
        dropdown.RemoveItem = RemoveItem;
    })(dropdown = rocket.dropdown || (rocket.dropdown = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var player;
    (function (player) {
        function Init(component) {
            var componentElement = rocket.component.Fetch(component);
            var innerContentElement = rocket.player.GetInnerContentElement(component);
            var playerControlArea = componentElement.querySelector('div[data-rocket-component="player-control"]');
            var playerControlComponent = rocket.component.FetchComponentObject(playerControlArea);
            var playerRange = playerControlArea.querySelector('input[type="range"]');
            innerContentElement.addEventListener("timeupdate", function () {
                var playerComponent = arguments[0];
                var playerComponentElement = rocket.component.Fetch(playerComponent);
                var playerControlElement = playerComponentElement.querySelector('div[data-rocket-component="player-control"]');
                var playerControlComponent = rocket.component.FetchComponentObject(playerControlElement);
                var playerElement = rocket.player.GetInnerContentElement(playerComponent);
                var currentTime = playerElement.currentTime;
                if (playerComponentElement.hasAttribute("data-rocket-component-status") == false) {
                    playerComponentElement.querySelector('div[data-rocket-component="player-control"]').querySelector("input").value = currentTime;
                }
                rocket.playercontrol.TimeLabelUpdater(playerControlComponent, 0, currentTime);
                if (playerElement.ended == true) {
                    var playButtonElement = playerControlElement.querySelector('div[data-rocket-minor-component="player-button-play"]');
                    rocket.component.CSS(rocket.component.FetchComponentObject(playButtonElement), "background-image", false);
                    var playerRange = playerControlElement.querySelector('input[type="range"]');
                    playerRange.value = 0;
                }
            }.bind(this, component));
            if (component["type"] == "video-player") {
                var posterImageElement = componentElement.querySelector('img[data-rocket-minor-component="video-poster"]');
                if (posterImageElement !== null) {
                    rocket.component.CSS(playerControlComponent, "opacity", "0.8");
                    for (var listenerKey in rocket.component.listenerStrings["up"]) {
                        posterImageElement.addEventListener(rocket.component.listenerStrings["up"][listenerKey], function () {
                            var playerElementComponent = arguments[0];
                            var posterImageElement = arguments[1];
                            var e = arguments[2];
                            if (e.button == 0) {
                                rocket.component.CSS(posterImageElement, "display", "none");
                                rocket.player.PlayOrPause(playerElementComponent);
                            }
                        }.bind(this, component, posterImageElement));
                    }
                }
                for (var listenerKey in rocket.component.listenerStrings["up"]) {
                    innerContentElement.addEventListener(rocket.component.listenerStrings["up"][listenerKey], function () {
                        var e = arguments[1];
                        if (e.button == 0) {
                            var playerElementComponent = arguments[0];
                            rocket.player.PlayOrPause(playerElementComponent);
                        }
                    }.bind(this, component));
                }
                componentElement.addEventListener("contextmenu", function (e) {
                    e.preventDefault();
                });
            }
            var playButtonComponent = rocket.component.FetchComponentObject(playerControlArea.querySelector('div[data-rocket-minor-component="player-button-play"]'));
            rocket.component.AddListeners(playButtonComponent, function () {
                var playButtonComponent = arguments[0];
                var playButton = rocket.component.Fetch(playButtonComponent);
                var playerElement = playButton.parentElement.parentElement;
                var playerElementComponent = rocket.component.FetchComponentObject(playerElement);
                rocket.player.PlayOrPause(playerElementComponent, playButtonComponent);
            });
            for (var listenerKey in rocket.component.listenerStrings["down"]) {
                playerRange.addEventListener(rocket.component.listenerStrings["down"][listenerKey], function () {
                    var playerControlComponent = arguments[0];
                    var playerControl = rocket.component.Fetch(playerControlComponent);
                    var playerRange = playerControl.querySelector("input");
                    playerRange.parentElement.parentElement.setAttribute("data-rocket-component-status", "true");
                }.bind(this, component));
            }
            for (var listenerKey in rocket.component.listenerStrings["up"]) {
                playerRange.addEventListener(rocket.component.listenerStrings["up"][listenerKey], rocket.player.TimeOrVolumeChanger.bind(this, playerControlComponent));
            }
            var volumeButtonComponent = rocket.component.FetchComponentObject(playerControlArea.querySelector('div[data-rocket-minor-component="player-button-volume"]'));
            rocket.component.AddListeners(volumeButtonComponent, function () {
                var volumeButtonComponent = arguments[0];
                var volumeButton = rocket.component.Fetch(volumeButtonComponent);
                var playerElement = volumeButton.parentElement.parentElement;
                var playerElementComponent = rocket.component.FetchComponentObject(playerElement);
                var playerRange = playerElement.querySelector("input");
                var playerRangeAttributes = {};
                var playerTimeElement = playerElement.querySelector("time");
                if (playerElement.hasAttribute("data-rocket-component-changevolume") !== true) {
                    playerElement.setAttribute("data-rocket-component-status", "true");
                    playerElement.setAttribute("data-rocket-component-changevolume", "");
                    volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').setAttribute("data-rocket-component-disabled", "");
                    volumeButton.setAttribute("data-rocket-component-status", "true");
                    playerTimeElement.setAttribute("data-rocket-component-disabled", "");
                    playerRangeAttributes["max"] = "100";
                    playerRangeAttributes["step"] = "1";
                    playerRange.value = (rocket.player.GetInnerContentElement(playerElementComponent).volume * 100).toString();
                }
                else {
                    volumeButton.parentElement.querySelector('div[data-rocket-minor-component="player-button-play"]').removeAttribute("data-rocket-component-disabled");
                    volumeButton.removeAttribute("data-rocket-component-status");
                    playerTimeElement.removeAttribute("data-rocket-component-disabled");
                    playerRangeAttributes = rocket.player.GetPlayerLengthInfo(playerElementComponent);
                    playerElement.removeAttribute("data-rocket-component-status");
                    playerElement.removeAttribute("data-rocket-component-changevolume");
                }
                for (var playerRangeAttribute in playerRangeAttributes) {
                    playerRange.setAttribute(playerRangeAttribute, playerRangeAttributes[playerRangeAttribute]);
                }
            });
        }
        player.Init = Init;
        function GetInnerContentElement(component) {
            var componentElement = rocket.component.Fetch(component);
            return componentElement.querySelector(component["type"].replace("-player", ""));
        }
        player.GetInnerContentElement = GetInnerContentElement;
        function GetPlayerLengthInfo(component) {
            var playerLengthInfo = {};
            var contentDuration = Math.floor(Number(rocket.player.GetInnerContentElement(component).duration));
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
            return playerLengthInfo;
        }
        player.GetPlayerLengthInfo = GetPlayerLengthInfo;
        function TimeOrVolumeChanger() {
            var playerControlComponent = arguments[0];
            var playerControlElement = rocket.component.Fetch(playerControlComponent);
            var playerRange = playerControlElement.querySelector("input");
            var playerElement = playerControlElement.parentElement;
            var playerComponentObject = rocket.component.FetchComponentObject(playerElement);
            var contentElement = rocket.player.GetInnerContentElement(playerComponentObject);
            var valueNum = Number(playerRange.value);
            if (playerElement.hasAttribute("data-rocket-component-changevolume") == false) {
                valueNum = valueNum.toFixed();
                contentElement.currentTime = valueNum;
            }
            else {
                valueNum = (valueNum / 100);
                contentElement.volume = valueNum;
            }
            if (playerElement.hasAttribute("data-rocket-component-changevolume") !== true) {
                playerElement.removeAttribute("data-rocket-component-status");
            }
        }
        player.TimeOrVolumeChanger = TimeOrVolumeChanger;
        function IsPlaying(component) {
            var componentElement = rocket.component.Fetch(component);
            var isPaused = componentElement.querySelector(component["type"].replace("-player", "")).paused;
            if (isPaused == true) {
                return false;
            }
            else {
                return true;
            }
        }
        player.IsPlaying = IsPlaying;
        function PlayOrPause(component, playButtonComponentObject) {
            var playerComponentElement = rocket.component.Fetch(component);
            var innerContentElement = rocket.player.GetInnerContentElement(component);
            if (playButtonComponentObject == undefined) {
                playButtonComponentObject = rocket.component.FetchComponentObject(playerComponentElement.querySelector('div[data-rocket-minor-component="player-button-play"]'));
            }
            var playButton = rocket.component.Fetch(playButtonComponentObject);
            if (playButton.hasAttribute("data-rocket-component-disabled") == false) {
                if (innerContentElement.played.length == 0) {
                    var playerControlComponent = rocket.component.FetchComponentObject(playButton.parentElement);
                    var playerRange = playerComponentElement.querySelector('input[type="range"]');
                    var playerMediaLengthInformation = rocket.player.GetPlayerLengthInfo(component);
                    var posterImageElement = playerComponentElement.querySelector('img[data-rocket-minor-component="video-poster"]');
                    if (posterImageElement !== null) {
                        rocket.component.CSS(posterImageElement, "display", "none");
                        rocket.component.CSS(playerControlComponent, "opacity", false);
                    }
                    for (var playerRangeAttribute in playerMediaLengthInformation) {
                        playerRange.setAttribute(playerRangeAttribute, playerMediaLengthInformation[playerRangeAttribute]);
                        if (playerRangeAttribute == "max") {
                            rocket.playercontrol.TimeLabelUpdater(playerControlComponent, 1, playerMediaLengthInformation[playerRangeAttribute]);
                        }
                    }
                }
                if (innerContentElement.paused !== true) {
                    innerContentElement.pause();
                    rocket.component.CSS(playButtonComponentObject, "background-image", false);
                }
                else {
                    innerContentElement.play();
                    rocket.component.CSS(playButtonComponentObject, "background-image", "url(css/img/pause.png)");
                }
            }
        }
        player.PlayOrPause = PlayOrPause;
        function FetchSources(type, sources) {
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
                var sourceType;
                if (sourceExtension !== "mov") {
                    sourceType = sourceExtension;
                    if (sourceExtension == "m3u8") {
                        sourceType = null;
                    }
                }
                else {
                    sourceType = "quicktime";
                }
                var sourceTag = rocket.generator.ElementCreator("source", {
                    "src": source,
                });
                if (sourceType !== null) {
                    sourceType["type"] = (type + "/" + sourceType);
                }
                arrayOfSourceElements.push(sourceTag);
            }
            return arrayOfSourceElements;
        }
        player.FetchSources = FetchSources;
    })(player = rocket.player || (rocket.player = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var playercontrol;
    (function (playercontrol) {
        function Generate() {
            var componentId = rocket.generator.IdGen("player-control");
            var componentElement = rocket.generator.ElementCreator(componentId, "player-control");
            var playButton = rocket.button.Generate({
                "data-rocket-minor-component": "player-button-play"
            });
            var inputRange = rocket.generator.ElementCreator("input", { "type": "range", "value": "0" });
            var timeStamp = rocket.generator.ElementCreator("time", { "content": "00:00 / 00:00" });
            var volumeButton = rocket.button.Generate({
                "data-rocket-minor-component": "player-button-volume"
            });
            componentElement.appendChild(rocket.component.Fetch(playButton));
            componentElement.appendChild(inputRange);
            componentElement.appendChild(timeStamp);
            componentElement.appendChild(rocket.component.Fetch(volumeButton));
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "player-control" };
        }
        playercontrol.Generate = Generate;
        function SecondsToTimeFormat(seconds) {
            var timeObject = {};
            if (seconds >= 3600) {
                timeObject["hours"] = Number((seconds / 3600).toPrecision(1));
                timeObject["minutes"] = Number(((seconds - (3600 * timeObject["hours"])) / 60).toPrecision(1));
                timeObject["seconds"] = Number((seconds - (3600 * timeObject["hours"])) - (60 * timeObject["minutes"]));
            }
            else if ((seconds >= 60) && (seconds < 3600)) {
                timeObject["minutes"] = Number((seconds / 60).toPrecision(1));
                timeObject["seconds"] = Number((seconds - (timeObject["minutes"] * 60)));
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
        playercontrol.SecondsToTimeFormat = SecondsToTimeFormat;
        function TimeLabelUpdater(component, timePart, value) {
            var playerControlElement = rocket.component.Fetch(component);
            var playerTimeElement = playerControlElement.querySelector("time");
            var parsedSecondsToString = "";
            var timeFormatObject = rocket.playercontrol.SecondsToTimeFormat(value);
            for (var timeObjectKey in timeFormatObject) {
                var timeObjectValue = timeFormatObject[timeObjectKey];
                if (parsedSecondsToString.length !== 0) {
                    parsedSecondsToString = parsedSecondsToString + ":" + timeObjectValue;
                }
                else {
                    parsedSecondsToString = timeObjectValue;
                }
            }
            var playerTimeElementParts = playerTimeElement.textContent.split(" / ");
            playerTimeElementParts[timePart] = parsedSecondsToString;
            playerTimeElement.textContent = playerTimeElementParts[0] + " / " + playerTimeElementParts[1];
        }
        playercontrol.TimeLabelUpdater = TimeLabelUpdater;
    })(playercontrol = rocket.playercontrol || (rocket.playercontrol = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var audioplayer;
    (function (audioplayer) {
        function Generate(properties) {
            if (properties["sources"] !== undefined) {
                var componentId = rocket.generator.IdGen("audio-player");
                var componentElement = rocket.generator.ElementCreator(componentId, "audio-player");
                var audioPlayer = rocket.generator.ElementCreator("audio", {
                    "preload": "metadata",
                    "volume": "0.5"
                });
                audioPlayer.autoplay = false;
                var arrayofSourceElements = rocket.player.FetchSources("audio", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    audioPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(audioPlayer);
                if ((properties["art"] !== undefined) && (properties["title"] !== undefined)) {
                    var playerInformation = rocket.generator.ElementCreator("div", {
                        "data-rocket-minor-component": "player-information"
                    });
                    var playerTextualInformation = rocket.generator.ElementCreator("section");
                    playerInformation.appendChild(rocket.generator.ElementCreator("img", { "src": properties["art"] }));
                    var audioTitle = rocket.generator.ElementCreator("b", { "content": properties["title"] });
                    playerTextualInformation.appendChild(audioTitle);
                    if (properties["artist"] !== undefined) {
                        var artistInfo = rocket.generator.ElementCreator("label", { "content": properties["artist"] });
                        playerTextualInformation.appendChild(artistInfo);
                    }
                    if (properties["album"] !== undefined) {
                        var albumInfo = rocket.generator.ElementCreator("label", { "content": properties["album"] });
                        playerTextualInformation.appendChild(albumInfo);
                    }
                    playerInformation.appendChild(playerTextualInformation);
                    componentElement.appendChild(playerInformation);
                }
                var playerControlComponent = rocket.playercontrol.Generate();
                var playerControlElement = rocket.component.Fetch(playerControlComponent);
                componentElement.appendChild(playerControlElement);
                rocket.component.storedComponents[componentId] = componentElement;
                return { "id": componentId, "type": "audio-player" };
            }
            else {
                return { "error": "no sources defined" };
            }
        }
        audioplayer.Generate = Generate;
    })(audioplayer = rocket.audioplayer || (rocket.audioplayer = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var videoplayer;
    (function (videoplayer) {
        function Generate(properties) {
            if (properties["sources"] !== undefined) {
                var componentId = rocket.generator.IdGen("video-player");
                var componentElement = rocket.generator.ElementCreator(componentId, "video-player");
                if (properties["art"] !== undefined) {
                    var posterImageElement = rocket.generator.ElementCreator("img", { "data-rocket-minor-component": "video-poster", "src": properties["art"] });
                    componentElement.appendChild(posterImageElement);
                }
                var videoPlayer = rocket.generator.ElementCreator("video", { "preload": "metadata", "volume": "0.5" });
                videoPlayer.autoplay = false;
                var arrayofSourceElements = rocket.player.FetchSources("video", properties["sources"]);
                for (var sourceElementKey in arrayofSourceElements) {
                    videoPlayer.appendChild(arrayofSourceElements[sourceElementKey]);
                }
                componentElement.appendChild(videoPlayer);
                var playerControlComponent = rocket.playercontrol.Generate();
                var playerControlElement = rocket.component.Fetch(playerControlComponent);
                componentElement.appendChild(playerControlElement);
                rocket.component.storedComponents[componentId] = componentElement;
                return { "id": componentId, "type": "video-player" };
            }
            else {
                return { "error": "no video defined" };
            }
        }
        videoplayer.Generate = Generate;
    })(videoplayer = rocket.videoplayer || (rocket.videoplayer = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    var searchbox;
    (function (searchbox) {
        function Generate(properties) {
            var componentId = rocket.generator.IdGen("searchbox");
            var componentElement = rocket.generator.ElementCreator(componentId, "searchbox");
            for (var propertyKey in properties) {
                if (propertyKey == "icon") {
                    rocket.component.CSS(componentElement, "background-image", "url(" + properties["icon"] + ")");
                }
                else if (propertyKey == "content") {
                    componentElement.setAttribute("placeholder", properties["content"]);
                }
            }
            rocket.component.storedComponents[componentId] = componentElement;
            return { "id": componentId, "type": "searchbox" };
        }
        searchbox.Generate = Generate;
        function SetText(component, placeholderText) {
            var searchboxElement = rocket.component.Fetch(component);
            if (searchboxElement !== null) {
                var searchboxInputElement = searchboxElement.getElementsByTagName("input")[0];
                if (placeholderText !== false) {
                    searchboxInputElement.setAttribute("placeholder", placeholderText);
                }
                else if (placeholderText == false) {
                    searchboxInputElement.removeAttribute("placeholder");
                }
                rocket.component.Update(component["id"], searchboxElement);
            }
        }
        searchbox.SetText = SetText;
    })(searchbox = rocket.searchbox || (rocket.searchbox = {}));
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    function Init() {
        rocket.device.Detect();
        document.addEventListener("scroll", function () {
            var dropdowns = document.querySelectorAll('div[data-rocket-component="dropdown"][active]');
            for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++) {
                var thisDropdownObject = rocket.component.FetchComponentObject(dropdowns[dropdownIndex]);
                rocket.dropdown.Toggle(thisDropdownObject);
            }
        });
        var documentHeadSection = document.querySelector("head");
        if (documentHeadSection == null) {
            documentHeadSection = document.createElement("head");
            document.querySelector("html").insertBefore(documentHeadSection, document.querySelector("head").querySelector("body"));
        }
        if (documentHeadSection.querySelector('meta[name="viewport"]') == null) {
            var viewportMetaTag = rocket.generator.ElementCreator("meta", { "name": "viewport", "content-attr": "width=device-width, initial-scale=1,user-scalable=no" });
            documentHeadSection.appendChild(viewportMetaTag);
        }
        if (MutationObserver !== undefined) {
            var mutationWatcher = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type == "childList") {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var addedNode = mutation.addedNodes[i];
                            function NodeParser(passedNode) {
                                if (passedNode.localName !== null) {
                                    var componentObject = rocket.component.FetchComponentObject(passedNode);
                                    if (componentObject !== false) {
                                        if (componentObject["type"] == "dropdown") {
                                            rocket.component.AddListeners(rocket.component.listenerStrings["press"], componentObject, rocket.dropdown.Toggle);
                                        }
                                        else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")) {
                                            rocket.player.Init(componentObject);
                                        }
                                        if (passedNode.childNodes.length > 0) {
                                            for (var i = 0; i < passedNode.childNodes.length; i++) {
                                                var childNode = passedNode.childNodes[i];
                                                NodeParser(childNode);
                                            }
                                        }
                                        delete rocket.component.storedComponents[componentObject["id"]];
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
                attributeFilter: ['data-rocket-component'],
                subtree: true
            };
            mutationWatcher.observe(document.querySelector("body"), mutationWatcherOptions);
        }
        else {
            if (rocket.plugin.alternativeInit !== undefined) {
                rocket.plugin.alternativeInit.Init();
            }
        }
    }
    rocket.Init = Init;
    rocket.Define = rocket.component.Define;
    rocket.Fetch = rocket.component.Fetch;
    rocket.FetchComponentObject = rocket.component.FetchComponentObject;
    rocket.FetchDimensionsAndPosition = rocket.component.FetchDimensionsAndPosition;
    rocket.Add = rocket.component.Add;
    rocket.Remove = rocket.component.Remove;
    rocket.Animate = rocket.component.Animate;
    rocket.CSS = rocket.component.CSS;
    rocket.AddListeners = rocket.component.AddListeners;
    rocket.RemoveListeners = rocket.component.RemoveListeners;
})(rocket || (rocket = {}));
