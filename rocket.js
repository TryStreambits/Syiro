var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Rocket;
(function (Rocket) {
    function init() {
        do {
        } while($ == undefined);

        $(document).ready(function () {
            $('div[data-rocket-component="list"]').on("click touchend MSPointerUp keydown.VK_ENTER", function (e) {
                var $this = e.currentTarget;
                var currentDisplayValue = $($this).children('div[data-rocket-component="list-dropdown"]').css("display");

                if (currentDisplayValue !== "block") {
                    $('div[data-rocket-component="list-dropdown"]').hide();
                    $($this).children('div[data-rocket-component="list-dropdown"]').show();
                } else {
                    $($this).children('div[data-rocket-component="list-dropdown"]').hide();
                }
            });

            $(document).on("scroll", function () {
                $('div[data-rocket-component="list-dropdown"]').fadeOut(250, function (e) {
                    $('div[data-rocket-component="list-dropdown"]').hide();
                });
            });
        });
    }
    Rocket.init = init;

    var RocketComponentFunctions = (function () {
        function RocketComponentFunctions() {
        }
        RocketComponentFunctions.prototype.componentExistsCheck = function (parentElement, component) {
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

        RocketComponentFunctions.prototype.addComponent = function (prependOrAppend, parentElement, component) {
            if (prependOrAppend == "prepend") {
                parentElement.insertBefore(component, parentElement.firstChild);
            } else {
                parentElement.appendChild(component);
            }
        };

        RocketComponentFunctions.prototype.removeComponent = function (parentElement, component) {
            if (typeof component !== "string") {
                parentElement.removeChild(component);
            } else {
                parentElement.removeChild(parentElement.getElementsByTagName(component)[0]);
            }
        };
        return RocketComponentFunctions;
    })();
    Rocket.RocketComponentFunctions = RocketComponentFunctions;

    var Header = (function (_super) {
        __extends(Header, _super);
        function Header(rocketComponentSelector) {
            _super.call(this);
            this.removeLogo = this.removeComponent(this.rocketComponent, this.rocketComponent.querySelector('img [data-rocket-minor-component="logo"'));
            this.rocketComponent = $(rocketComponentSelector).get(0);
        }
        Header.prototype.setLogo = function (src) {
            var headerLogoElement;

            if (this.rocketComponent.querySelector('img [data-rocket-minor-component="logo"') == null) {
                headerLogoElement = document.createElement("img");
                this.addComponent("prepend", this.rocketComponent, headerLogoElement);
            }

            headerLogoElement.setAttribute("data-rocket-component", "logo");
            headerLogoElement.setAttribute("src", src);
        };

        Header.prototype.add = function (type, component) {
            if (type == ("list" || "searchbar")) {
                this.addComponent("append", this.rocketComponent, component);
            }
        };

        Header.prototype.remove = function (type, component) {
            if (type == ("list" || "searchbar")) {
                this.removeComponent(this.rocketComponent, component);
            }
        };
        return Header;
    })(RocketComponentFunctions);
    Rocket.Header = Header;

    var Footer = (function (_super) {
        __extends(Footer, _super);
        function Footer(rocketComponentSelector) {
            _super.call(this);
            this.rocketComponent = $(rocketComponentSelector).get(0);
        }
        Footer.prototype.add = function (type, text, link, target) {
            if (type == "text") {
                var textTag;

                if (this.rocketComponent.querySelector("pre") == null) {
                    textTag = document.createElement("pre");
                    this.addComponent("prepend", this.rocketComponent, textTag);
                } else {
                    textTag = this.rocketComponent.getElementsByTagName("pre")[0];
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

                this.addComponent("append", this.rocketComponent, newLink);
            }
        };

        Footer.prototype.remove = function (type, link) {
            var elementToRemove;

            if (type == "text") {
                elementToRemove = "pre";
            } else {
                var links = this.rocketComponent.getElementsByTagName("a");

                for (var linkElement in links) {
                    var hrefValue = linkElement.attributes.getNamedItem("href").value;

                    if (hrefValue == link) {
                        elementToRemove = linkElement;
                    }
                }
            }

            if (elementToRemove !== undefined) {
                this.removeComponent(this.rocketComponent, elementToRemove);
            }
        };
        return Footer;
    })(RocketComponentFunctions);
    Rocket.Footer = Footer;

    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(rocketComponentSelector) {
            _super.call(this);
            this.rocketComponent = $(rocketComponentSelector).get(0);
        }
        Button.prototype.listen = function (primaryCallback, secondaryCallback) {
            $(this.rocketComponent).on("click touchend MSPointerUp keydown.VK_ENTER", { primaryFunction: primaryCallback, secondaryFunction: secondaryCallback }, function (e) {
                var $rocketComponent = e.currentTarget;

                var primaryFunction = e.data["primaryFunction"];
                var secondaryFunction = e.data["secondaryFunction"];

                if ($($rocketComponent).attr("data-rocket-component-type") == "toggle") {
                    var toggleValue = $($rocketComponent).attr("data-rocket-component-status");
                    var newToggleValue;

                    if (toggleValue == "false") {
                        newToggleValue = "true";

                        if (secondaryFunction !== undefined) {
                            secondaryFunction(newToggleValue);
                        } else {
                            primaryFunction(newToggleValue);
                        }
                    } else {
                        newToggleValue = "false";
                        primaryFunction(newToggleValue);
                    }

                    $($rocketComponent).attr("data-rocket-component-status", newToggleValue);
                } else {
                    primaryFunction();
                }
            });
        };
        return Button;
    })(RocketComponentFunctions);
    Rocket.Button = Button;

    var List = (function (_super) {
        __extends(List, _super);
        function List(rocketComponentSelector) {
            _super.call(this);
            this.listLabelSelector = 'div[data-rocket-component="list-label"]';
            this.listDropdownSelector = 'div[data-rocket-component="list-dropdown"]';
            this.rocketComponent = $(rocketComponentSelector).get(0);
        }
        List.prototype.setLabelText = function (labelText) {
            var savedInternalLabelContent = "";

            if ($(this.rocketComponent).children(this.listLabelSelector).children("img").length > 0) {
                savedInternalLabelContent = $(this.rocketComponent).children(this.listLabelSelector).children("img").get(0).outerHTML;
            }

            $(this.rocketComponent).children(this.listLabelSelector).html(savedInternalLabelContent + labelText);
        };

        List.prototype.setLabelImage = function (imageSource) {
            if ($(this.rocketComponent).children(this.listLabelSelector).children("img").length > 0) {
                $(this.rocketComponent).children(this.listLabelSelector).children("img").first().attr("src", imageSource);
            } else {
                var currentLabelText = $(this.rocketComponent).children(this.listLabelSelector).text();
                $(this.rocketComponent).children(this.listLabelSelector).html('<img alt="" src="' + imageSource + '" />' + currentLabelText);
            }
        };

        List.prototype.addListItem = function (prependOrAppend, listItem) {
            var listDropdown = $(this.rocketComponent).children('div[data-rocket-component="list-dropdown"]').get(0);
            this.addComponent(prependOrAppend, listDropdown, listItem);
        };

        List.prototype.removeListItem = function (listItem) {
            var listDropdown = $(this.rocketComponent).children('div[data-rocket-component="list-dropdown"]').get(0);
            this.removeComponent(listDropdown, listItem);
        };

        List.prototype.listen = function (rocketComponent) {
            Rocket.init();
        };
        return List;
    })(RocketComponentFunctions);
    Rocket.List = List;
})(Rocket || (Rocket = {}));

var rocket = Rocket;
