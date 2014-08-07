var rocket;
(function (rocket) {
    (function (core) {
        core.storedComponents = {};
        core.lastUniqueId = 0;

        function IdGen(type) {
            rocket.core.lastUniqueId += 1;
            return (type + (rocket.core.lastUniqueId).toString());
        }
        core.IdGen = IdGen;

        function Define(type, selector) {
            var component = {};
            component["type"] = type;

            var componentID = rocket.core.IdGen(type);

            var selectedElement = document.querySelector(selector);
            selectedElement.setAttribute("data-rocket-component-id", componentID);

            rocket.core.storedComponents[componentID] = component;

            component["id"] = componentID;

            return component;
        }
        core.Define = Define;

        function Generate(type, properties) {
            var generatedComponent = {};
            var componentElement;
            var inputElement;

            var componentId = rocket.core.IdGen(type);

            if (type == "header") {
                componentElement = document.createElement("header");
            } else if (type == "footer") {
                componentElement = document.createElement("footer");
            } else {
                componentElement = document.createElement("div");

                if (type == "searchbox") {
                    var inputElement = document.createElement("input");
                    inputElement.setAttribute("type", "text");
                }
            }

            if ((type == "button") && (properties["type"] == undefined)) {
                properties["type"] = "basic";
            }

            componentElement.setAttribute("data-rocket-component", type);
            componentElement.setAttribute("data-rocket-component-id", componentId);

            for (var propertyKey in properties) {
                switch (propertyKey) {
                    case "control":
                        if (type == "list-item") {
                            var controlComponentObject = properties[propertyKey];

                            if (controlComponentObject["type"].indexOf("button")) {
                                var controlComponentElement = rocket.core.Get(controlComponentObject);
                                componentElement.appendChild(controlComponentElement);

                                delete rocket.core.storedComponents[controlComponentObject["id"]]["HTMLElement"];
                            }
                        }
                        break;
                    case "icon":
                        if (((type == "button") && (properties["type"] == "basic")) || (type == "searchbar")) {
                            componentElement.style.backgroundImage = properties[propertyKey];
                        }
                        break;
                    case "items":
                        var navigationItems = properties["items"];

                        if (type == ("header" || "footer" || "list")) {
                            for (var navigationItem in navigationItems) {
                                if (type == ("header" || "footer")) {
                                    if (navigationItem["type"] == "dropdown") {
                                        var component = navigationItem["component"];
                                        componentElement.appendChild(rocket.core.Get(component));

                                        delete rocket.core.storedComponents[component["id"]]["HTMLElement"];
                                    } else if (navigationItem["type"] == "link") {
                                        var linkElement = document.createElement("a");
                                        linkElement.setAttribute("href", navigationItem["link"]);
                                        linkElement.title = navigationItem["title"];
                                        linkElement.innerText = navigationItem["title"];

                                        componentElement.appendChild(linkElement);
                                    }
                                } else if (type == "list") {
                                    if (navigationItem["type"] == "list-item") {
                                        var listItemComponent = rocket.core.Get(navigationItem);

                                        componentElement.appendChild(listItemComponent);

                                        delete rocket.core.storedComponents[navigationItem["id"]]["HTMLElement"];
                                    }
                                }
                            }
                        } else if (type == "dropdown") {
                            var newListComponent = rocket.core.Generate("list", { "items": navigationItems });
                            var newListElement = rocket.core.Get(newListComponent);

                            componentElement.appendChild(newListElement);

                            delete rocket.core.storedComponents[newListComponent["id"]]["HTMLElement"];
                        }
                        break;
                    case "label":
                        if (type == "dropdown") {
                            var labelProperties = properties[propertyKey];
                            var dropdownLabel = document.createElement("div");
                            dropdownLabel.setAttribute("data-rocket-minor-component", "dropdown-label");

                            if (labelProperties["text"] !== undefined) {
                                var dropdownLabelText = document.createElement("label");
                                dropdownLabelText.innerHTML = labelProperties["text"];
                                dropdownLabel.appendChild(dropdownLabelText);
                            }

                            if (labelProperties["image"] !== undefined) {
                                var dropdownLabelImage = document.createElement("img");
                                dropdownLabelImage.setAttribute("src", labelProperties["image"]);
                                dropdownLabel.insertBefore(dropdownLabelImage, dropdownLabel.firstChild);
                            }

                            if (labelProperties["icon"] !== undefined) {
                                dropdownLabel.style.backgroundImage = labelProperties["icon"];
                            }

                            componentElement.insertBefore(dropdownLabel, componentElement.firstChild);
                        } else if (type == "list-item") {
                            var labelComponent = componentElement.getElementsByTagName("label").item(0);

                            if (labelComponent == null) {
                                labelComponent = document.createElement("label");
                                componentElement.insertBefore(labelComponent, componentElement.firstChild);
                            }

                            labelComponent.innerText = properties[propertyKey];
                        }
                        break;
                    case "list":
                        if (type == "dropdown") {
                            var listComponent = rocket.core.Get(properties[propertyKey]);
                            componentElement.appendChild(listComponent);

                            delete rocket.core.storedComponents[properties[propertyKey]["id"]]["HTMLElement"];
                        }
                        break;
                    case "logo":
                        if (type == "header") {
                            var logoElement = document.createElement("img");
                            logoElement.setAttribute("data-rocket-minor-component", "logo");
                            logoElement.setAttribute("src", properties["logo"]);
                            componentElement.appendChild(logoElement);
                        }
                        break;
                    case "text":
                        if (type == "button") {
                            componentElement.innerText = properties[propertyKey];
                        } else if (type == "footer") {
                            var footerLabel = componentElement.getElementsByTagName("label").item(0);

                            if (footerLabel == null) {
                                footerLabel = document.createElement("label");
                                componentElement.insertBefore(footerLabel, componentElement.firstChild);
                            }

                            footerLabel.innerText = properties[propertyKey];
                        } else if (type == "searchbox") {
                            inputElement.setAttribute("placeholder", properties[propertyKey]);
                        }
                        break;
                    case "type":
                        if (type == "button") {
                            componentElement.setAttribute("data-rocket-component-type", properties[propertyKey]);

                            if (properties[propertyKey] == "toggle") {
                                var buttonToggle = document.createElement("div");
                                buttonToggle.setAttribute("data-rocket-minor-component", "buttonToggle");

                                if (properties["default"] == undefined) {
                                    properties["default"] = false;
                                }

                                buttonToggle.setAttribute("data-rocket-component-status", properties["default"].toString());

                                componentElement.appendChild(buttonToggle);
                            }
                        }
                }
            }

            rocket.core.storedComponents[componentId] = { "type": type, "HTMLElement": componentElement };

            generatedComponent["id"] = componentId;
            generatedComponent["type"] = type;

            return generatedComponent;
        }
        core.Generate = Generate;

        function Get(component) {
            var componentElement;
            var componentId = component["identifier"]["id"];

            if (typeof (rocket.core.storedComponents[componentId]["HTMLElement"]) !== undefined) {
                componentElement = rocket.core.storedComponents[componentId]["HTMLElement"];
            } else {
                componentElement = document.querySelector('*[data-rocket-component-id="' + componentId + '"');
            }

            return componentElement;
        }
        core.Get = Get;

        function UpdateStoredComponent(componentId, componentElement) {
            if (rocket.core.storedComponents[componentId]["HTMLElement"] !== undefined) {
                rocket.core.storedComponents[componentId]["HTMLElement"] = componentElement;
            }
        }
        core.UpdateStoredComponent = UpdateStoredComponent;

        function AddComponent(append, parentComponent, childComponent) {
            var parentElement = rocket.core.Get(parentComponent);

            var childComponentId;
            var childComponentType = (typeof childComponent).toString();
            var childElement;

            var allowAdding;

            if (childComponentType == "Object") {
                childComponentId = childComponent["id"];
            }

            if (parentComponent["type"] == "header") {
                if ((childComponentType == "Object") && (childComponent["type"] == ("dropdown" || "searchbar"))) {
                    allowAdding = true;
                    childElement = rocket.core.Get(childComponent);
                } else {
                    allowAdding = false;
                }
            } else if (parentComponent["type"] == "footer") {
                if (childComponentType.indexOf("Element") > -1) {
                    childElement = childComponent;
                } else if (childComponentType == "Object") {
                    childElement = document.createElement("a");
                    childElement.setAttribute("href", childComponent["link"]);
                    childElement.title = childComponent["title"];
                    childElement.innerText = childComponent["title"];

                    allowAdding = true;
                } else {
                    allowAdding = false;
                }
            } else {
                childElement = rocket.core.Get(childComponent);
                allowAdding = true;
            }

            if (allowAdding == true) {
                if (append == false) {
                    parentElement.insertBefore(childElement, parentElement.firstChild);
                } else {
                    parentElement.appendChild(childElement);
                }

                if (childComponentId !== undefined) {
                    if (typeof (rocket.core.storedComponents[childComponentId]["HTMLElement"]) !== undefined) {
                        delete rocket.core.storedComponents[childComponentId]["HTMLElement"];
                    }
                }
            }

            rocket.core.UpdateStoredComponent(parentComponent["id"], parentElement);

            return childComponent;
        }
        core.AddComponent = AddComponent;

        function RemoveComponent(parentComponent, childComponent) {
            var parentElement = rocket.core.Get(parentComponent);
            var removeComponentSuccessful;

            if ((typeof (childComponent)).indexOf("Element") !== -1) {
                parentElement.removeChild(childComponent);
                removeComponentSuccessful = true;
            } else if (typeof (childComponent) == "Object") {
                parentElement.removeChild(rocket.core.Get(childComponent));
                delete rocket.core.storedComponents[childComponent["id"]];
                removeComponentSuccessful = true;
            } else {
                removeComponentSuccessful = false;
            }

            if (removeComponentSuccessful == true) {
                rocket.core.UpdateStoredComponent(parentComponent["id"], parentElement);
            }

            return removeComponentSuccessful;
        }
        core.RemoveComponent = RemoveComponent;
    })(rocket.core || (rocket.core = {}));
    var core = rocket.core;
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    (function (header) {
        function SetLogo(component, image) {
            var headerElement = rocket.core.Get(component);
            var imageElement = headerElement.querySelector('img[data-rocket-minor-component="logo"]');

            if (imageElement == null) {
                imageElement = document.createElement("img");
                imageElement.setAttribute("data-rocket-minor-component", "logo");
                headerElement.insertBefore(imageElement, headerElement.firstChild);
            }

            imageElement.setAttribute("src", image);

            rocket.core.UpdateStoredComponent(component["id"], headerElement);
        }
        header.SetLogo = SetLogo;

        function RemoveLogo(component) {
            var headerElement = rocket.core.Get(component);

            if (headerElement.querySelectorAll('img[data-rocket-minor-component="logo"]').length > 0) {
                headerElement.removeChild(headerElement.firstChild);
                rocket.core.UpdateStoredComponent(component["id"], headerElement);
            }
        }
        header.RemoveLogo = RemoveLogo;
    })(rocket.header || (rocket.header = {}));
    var header = rocket.header;
})(rocket || (rocket = {}));

var rocket;
(function (rocket) {
    (function (footer) {
        function SetLabel(component, labelText) {
            if (component !== undefined) {
                if (labelText !== undefined) {
                    var parentElement = rocket.core.Get(component);
                    var labelComponent = document.querySelector("pre");

                    if (labelComponent == null) {
                        labelComponent = document.createElement("pre");
                        parentElement.insertBefore(labelComponent, parentElement.firstChild);
                    }

                    labelComponent.textContent = labelText;

                    rocket.core.UpdateStoredComponent(component["id"], parentElement);

                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        footer.SetLabel = SetLabel;

        function AddLink(prepend, component, linkProperties) {
            var componentAddingSucceeded;

            if (typeof linkProperties == "Object") {
                if ((linkProperties["title"] !== undefined) && (linkProperties["link"] !== undefined)) {
                    componentAddingSucceeded = rocket.core.AddComponent(prepend, component, linkProperties);
                } else {
                    componentAddingSucceeded = false;
                }
            } else {
                componentAddingSucceeded = false;
            }

            return componentAddingSucceeded;
        }
        footer.AddLink = AddLink;

        function RemoveLink(component, linkProperties) {
            var componentRemovingSucceed;
            var footerElement = rocket.core.Get(component);
            var potentialLinkElement = footerElement.querySelector('a[href="' + linkProperties["link"] + '"][title="' + linkProperties["title"] + '"]');

            if (potentialLinkElement !== null) {
                footerElement.removeChild(potentialLinkElement);

                rocket.core.UpdateStoredComponent(component["id"], footerElement);
                componentRemovingSucceed = true;
            } else {
                componentRemovingSucceed = false;
            }

            return componentRemovingSucceed;
        }
        footer.RemoveLink = RemoveLink;
    })(rocket.footer || (rocket.footer = {}));
    var footer = rocket.footer;
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    (function (button) {
        function Listen(component, primaryCallback, secondaryCallback) {
            var buttonElement = rocket.core.Get(component);
            var handlersArray = [];

            handlersArray.push(primaryCallback);

            if (secondaryCallback !== undefined) {
                handlersArray.push(secondaryCallback);
            }

            rocket.core.storedComponents[component["id"]]["handlers"] = handlersArray;

            var buttonEventListener = function () {
                var componentObject = arguments[0];
                var componentElement = rocket.core.Get(componentObject);

                var handlersArray = rocket.core.storedComponents[componentObject["id"]]["handlers"];

                var primaryFunction = handlersArray[0];
                var secondaryFunction = handlersArray[1];

                if (componentElement.getAttribute("data-rocket-component-type") == "toggle") {
                    var toggleValue = componentElement.getAttribute("data-rocket-component-status");
                    var newToggleValue;

                    if (toggleValue == "false") {
                        newToggleValue = "true";
                    } else {
                        newToggleValue = "false";
                    }

                    componentElement.setAttribute("data-rocket-component-status", newToggleValue);

                    newToggleValue = Boolean(newToggleValue);

                    if (secondaryFunction !== undefined) {
                        secondaryFunction();
                    } else {
                        primaryFunction(newToggleValue);
                    }
                } else {
                    primaryFunction();
                }
            }.bind(this, component);

            buttonElement.addEventListener("click touchend MSPointerUp", buttonEventListener);
        }
        button.Listen = Listen;
    })(rocket.button || (rocket.button = {}));
    var button = rocket.button;
})(rocket || (rocket = {}));
var rocket;
(function (rocket) {
    function Init() {
        if (MutationObserver !== undefined) {
            var mutationWatcher = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type == "childList") {
                        if (mutation.target.toString().indexOf("Body") == -1) {
                            for (var i = 0; i < mutation.addedNodes.length; i++) {
                                var addedNode = mutation.addedNodes[i];
                                var potentialElementId = addedNode.getAttribute("data-rocket-component-id");

                                if (potentialElementId !== null) {
                                    delete rocket.core.storedComponents[potentialElementId]["HTMLElement"];
                                }
                            }
                        }
                    }
                });
            });

            var mutationWatcherOptions = {
                childList: true,
                attributes: true,
                characterData: false,
                attributeFilter: ['data-rocket-component-id'],
                subtree: true
            };

            mutationWatcher.observe(document.body, mutationWatcherOptions);
        } else {
            (function mutationTimer() {
                window.setTimeout(function () {
                    for (var componentId in Object.keys(rocket.core.storedComponents)) {
                        if (document.querySelector('*[data-rocket-component="' + componentId + '"]') !== null) {
                            delete rocket.core.storedComponents[componentId]["HTMLElement"];
                        }
                    }

                    mutationTimer();
                }, 10000);
            })();
        }
    }
    rocket.Init = Init;

    function Define(type, properties) {
        return rocket.core.Define(type, properties);
    }
    rocket.Define = Define;

    function Generate(componentType, componentProperties) {
        var validComponents = ["header", "footer", "button", "dropdown", "list", "list-item", "searchbox"];

        if (validComponents.indexOf(componentType) > -1) {
            if (typeof componentProperties == ("Object" || "object")) {
                return rocket.core.Generate(componentType, componentProperties);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    rocket.Generate = Generate;

    function AddComponent(prepend, parentComponent, component) {
        return rocket.core.AddComponent(prepend, parentComponent, component);
    }
    rocket.AddComponent = AddComponent;

    function RemoveComponent(parentComponent, childComponent) {
        return rocket.core.RemoveComponent(parentComponent, childComponent);
    }
    rocket.RemoveComponent = RemoveComponent;
})(rocket || (rocket = {}));
