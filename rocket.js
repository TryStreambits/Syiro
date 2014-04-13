var Rocket = (function () {
    function Rocket() {
        this.thisPage = document.getElementsByTagName("body")[0];
        this.rocketCallbacks = {};
    }
    Rocket.prototype.init = function () {
        do {
        } while($ == undefined);

        $(document).ready(function () {
            $('div[data-rocket-component="list"]').on("click touchend MSPointerUp keydown.VK_ENTER", function () {
                var currentDisplayValue = $(this).children('div[data-rocket-component="list-dropdown"]').css("display");

                if (currentDisplayValue !== "block") {
                    $('div[data-rocket-component="list-dropdown"]').hide();
                    $(this).children('div[data-rocket-component="list-dropdown"]').show();
                } else {
                    $(this).children('div[data-rocket-component="list-dropdown"]').hide();
                }
            });

            $(document).on("scroll", function () {
                $('div[data-rocket-component="list-dropdown"]').fadeOut(250, function () {
                    $(this).hide();
                });
            });
        });
    };

    Rocket.prototype.addCallback = function (componentRegister, componentElement, componentFunction, secondaryFunction) {
        var thisComponentRegisterObject = {
            "element": componentElement,
            "primary function": componentFunction
        };

        if (secondaryFunction !== undefined) {
            thisComponentRegisterObject["secondary function"] = secondaryFunction;
        }

        this.rocketCallbacks[componentRegister] = thisComponentRegisterObject;
    };

    Rocket.prototype.removeCallback = function (componentRegister) {
        this.rocketCallbacks[componentRegister] == undefined;
    };

    Rocket.prototype.componentExistsCheck = function (parentElement, component) {
        if (typeof component !== "string") {
            if (parentElement.innerHTML.indexOf(component.outerHTML) !== 1) {
                return true;
            } else {
                return false;
            }
        } else {
            if ((typeof parentElement.getElementsByTagName(component)) !== "object") {
                return true;
            } else {
                return false;
            }
        }
    };

    Rocket.prototype.addComponent = function (prependOrAppend, parentElement, component) {
        if (prependOrAppend == "prepend") {
            parentElement.insertBefore(component, parentElement.firstChild);
        } else {
            parentElement.appendChild(component);
        }
    };

    Rocket.prototype.removeComponent = function (parentElement, component) {
        if (typeof component !== "string") {
            parentElement.removeChild(component);
        } else {
            parentElement.removeChild(parentElement.getElementsByTagName(component)[0]);
        }
    };

    Rocket.prototype.Header = function (rocketComponent) {
        function setLogo(src) {
            var headerLogoElement;

            if (rocketComponent.querySelector('img [data-rocket-minor-component="logo"') == null) {
                headerLogoElement = document.createElement("img");
                this.addComponent("prepend", rocketComponent, headerLogoElement);
            }

            headerLogoElement.setAttribute("data-rocket-component", "logo");
            headerLogoElement.setAttribute("src", src);
        }

        var removeLogo = this.removeComponent.bind(this.thisClass, rocketComponent, rocketComponent.querySelector('img [data-rocket-minor-component="logo"'));

        function add(type, component) {
            if (type == ("list" || "searchbar")) {
                this.addComponent("append", rocketComponent, component);
            }
        }

        function remove(type, component) {
            if (type == ("list" || "searchbar")) {
                this.removeComponent(rocketComponent, component);
            }
        }
    };

    Rocket.prototype.Footer = function (rocketComponent) {
        function add(type, text, link, target) {
            if (type == "text") {
                var textTag;

                if (rocketComponent.querySelector("pre") == null) {
                    textTag = document.createElement("pre");
                    this.addComponent("prepend", rocketComponent, textTag);
                } else {
                    textTag = rocketComponent.getElementsByTagName("pre")[0];
                }

                textTag.innerText = text;
            } else if (type == "link") {
                if (target == undefined) {
                    target = "_blank";
                }

                var newLink = document.createElement("a");
                newLink.setAttribute("href", link);
                newLink.setAttribute("target", target);
                newLink.innerText = text;

                this.addComponent("append", rocketComponent, newLink);
            }
        }

        function remove(type, link) {
            var elementToRemove;

            if (type == "text") {
                elementToRemove = "pre";
            } else {
                var links = rocketComponent.getElementsByTagName("a");

                for (var linkElement in links) {
                    var hrefValue = linkElement.attributes.getNamedItem("href").value;

                    if (hrefValue == link) {
                        elementToRemove = linkElement;
                    }
                }
            }

            if (elementToRemove !== undefined) {
                this.removeComponent(rocketComponent, elementToRemove);
            }
        }
    };

    Rocket.prototype.Button = function (rocketComponent) {
        var predictableComponentRegister = rocketComponent.outerHTML.substr(0, 40);
        function listen(primaryCallback, secondaryCallback) {
            this.addCallback(predictableComponentRegister, rocketComponent, primaryCallback, secondaryCallback);

            $(rocketComponent).on("click touchend MSPointerUp keydown.VK_ENTER", { "componentRegister": predictableComponentRegister }, $.proxy(function () {
                var componentRegister = event.data["componentRegister"];

                var component = this.rocketCallbacks[componentRegister]["element"];
                var primaryFunction = this.rocketCallbacks[componentRegister]["primary function"];

                if (component.getAttribute("data-rocket-component-type") == "toggle") {
                    var toggleValue = component.getAttribute("data-rocket-component-status");
                    var newToggleValue;

                    if (toggleValue == "false") {
                        newToggleValue = "true";

                        if (this.rocketCallbacks[componentRegister].hasOwnProperty("secondary function")) {
                            var secondaryFunction = this.rocketCallbacks[componentRegister]["secondary function"];
                            secondaryFunction(newToggleValue);
                        } else {
                            primaryFunction(newToggleValue);
                        }
                    } else {
                        newToggleValue = "false";
                        primaryFunction(newToggleValue);
                    }

                    component.setAttribute("data-rocket-component-status", newToggleValue);
                } else {
                    primaryFunction();
                }
            }, this.thisClass));
        }
    };

    Rocket.prototype.List = function (rocketComponent) {
        function listen(rocketComponent) {
            this.init();
        }
    };
    return Rocket;
})();
