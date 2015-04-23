/*
    This is the module for Syiro Navbar component (previously referred to as Header and Footer Components).
*/

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Navbar Component

module syiro.navbar {

    // #region Shared Functionality

    // #region Generator
    // Used for generating both "top" navbars (previously referred to as Header) and "bottom" navbars (previously referred to as Footer)

    export function Generate(properties : Object) : Object {
        var navbarType : string; // Define navbarType as either "top" or "bottom"

        if ((typeof properties["position"] !== "string") || ((properties["position"] !== "top") && (properties["position"] !== "bottom"))){ // If position is not defined as a string or is defined as neither top or bottom
            navbarType = "top"; // Default to be a top-positioned navbar / Header
        }
        else { // If it is defined as either top or bottom
            navbarType = properties["position"]; // Define navbarType as top or bottom
        }

        var componentId : string = syiro.generator.IdGen("navbar"); // Generate a component Id using "navbar"
		var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "navbar", { "role" : "navigation", "data-syiro-component-type" : navbarType }); // Generate a div Element with the role of "navigation" (for ARIA) and data-syiro-component-type to navbarType

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "items"){ // If we are adding items to the Header
                for (var individualItemIndex in properties["items"]){ // For each individualItem in navigationItems Object array
                    var individualItem : Object = properties["items"][individualItemIndex]; // Define individualItem as this particular item in the properties["items"]

                    if (typeof individualItem["component"] !== "undefined"){ // If we are adding a Component (defining the Component object using the "component" key in individual items is a backwards-compatibility check)
                        individualItem = individualItem["component"]; // Redefine individualItem as the individualItem component key/val
                    }

                    if (syiro.component.IsComponentObject(individualItem) == false){ // If we are adding a link
                        var generatedElement : HTMLElement = syiro.generator.ElementCreator("a", // Generate a generic link element
                            {
                                "href" : individualItem["link"], // Set the href (link)
                                "title" : individualItem["title"], // Set the title of the link to the one passed
                                "content" : individualItem["title"] // Also set the inner content of the <a> tag to title
                            }
                        );

                        componentElement.appendChild(generatedElement); // Append the component to the parent component element
                    }
                    else if ((syiro.component.IsComponentObject(individualItem)) && (navbarType == "top")){ // If we are adding a Syiro Component (whether it be a Dropdown or a Searchbox) and the navbarType is top
                        componentElement.appendChild(syiro.component.Fetch(individualItem)); // Append the HTMLElement fetched from syiro.component.Fetch(dropdownComponent)
                    }
                }
            }
            else if ((propertyKey == "logo") && (navbarType == "top")){ // If we are adding a Logo to the top-positioned navbar (Header)
				var generatedElement : HTMLElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component" : "logo", "src" : properties["logo"] }); // Generate an image with data-syiro-minor-component set to logo and src set to logo defined
				componentElement.appendChild(generatedElement); // Append the logo to the generatedElement
			}
            else if ((propertyKey == "content") && (navbarType == "bottom")){ // If content or label prop are not undefined and the navbarType is botto (Footer)
                var labelContent : string = ""; // Define labelContent initially as an empty string

                if (typeof properties["content"] !== "undefined"){ // If the content property is defined
                    labelContent = properties["content"]; // Assign content key/val to labelContent
                }
                else{ // If the label property is defined
                    labelContent = properties["label"]; // Assign label key/val to labelContent
                }

    			var generatedElement : HTMLElement = syiro.generator.ElementCreator("label", { "content" : labelContent }); // Generate a generic label element
    			componentElement.insertBefore(generatedElement, componentElement.firstChild); // Prepend the label to the navbar
    		}
        }

        // #region Fixed Positioning Check

        if ((typeof properties["fixed"] == "boolean") && (properties["fixed"] == true)){ // If the "fixed" property is defined and is set to true
            componentElement.setAttribute("data-syiro-position", "fixed"); // Set position attribute to fixed so we can more dynamically set CSS values without needing to use JavaScript
        }

        // #endregion

        syiro.data.Write(componentId + "->Position", navbarType); // In addition to data-syiro-component-type on the componentElement to indicate where you position
        syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
        return { "id" : componentId, "type" : "navbar" }; // Return a Component Object

    }

    // #endregion

    // #region Function to add a link to the Navbar based on properties of that link

    export function AddLink(append : boolean, component : Object, elementOrProperties : any) : boolean { // Returns boolean if it was successful or not
        var componentAddingSucceeded : boolean = false; // Variable to store the determination of success (default to false)

        if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (typeof elementOrProperties !== "undefined")){ // If this is a Navbar Component and elementOrProperties is defined
            var generatedElement : HTMLElement; // Define generatedElement as the element we will be appending

            if (typeof elementOrProperties.nodeType == "undefined"){ // If a nodeType is not defined, meaning it is not an element
                generatedElement = syiro.generator.ElementCreator("a", // Generate a generic link element
                    {
                        "href" : elementOrProperties["href"], // Set the href (link)
                        "title" : elementOrProperties["title"], // Also set title of the <a> tag to title provided
                        "content" : elementOrProperties["title"] // Also set the inner content of the <a> tag to title
                    }
                );
            }
            else if ((typeof elementOrProperties.nodeType !== "undefined") && (elementOrProperties.nodeName.toLowerCase() == "a")){ // If a nodeType is defined meaning it is a link Element
                generatedElement = elementOrProperties; // Define generatedElement as elementOrProperties
            }

            if (typeof generatedElement !== "undefined"){ // If the generatedElement is not undefined
                componentAddingSucceeded = true; // Set to true
                syiro.component.Add(append, component, generatedElement); // Prepend or append the component to the parent component element
            }
        }

        return componentAddingSucceeded;
    }

    // #endregion

    // #region Function to remove a link from the Navbar based on the properties of that link

    export function RemoveLink(component : Object, elementOrProperties : any) : boolean { // Return boolean if it was successful or not
        var componentRemovingSucceed : boolean = false; // Variable to store the determination of success

        if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (typeof elementOrProperties !== "undefined")){ // If this is a Navbar Component and elementOrProperties is defined
            var navbarElement : Element = syiro.component.Fetch(component); // Get the Element of the Navbar component
            var potentialLinkElement : Element; // Get the potential link element.

            if (typeof elementOrProperties.nodeType == "undefined"){ // If a nodeType is not defined, meaning it is not an element
                potentialLinkElement =  navbarElement.querySelector('a[href="' + elementOrProperties["link"] + '"][title="' + elementOrProperties["title"] + '"]'); // Get the potential link element.
            }
            else if ((typeof elementOrProperties.nodeType !== "undefined") && (elementOrProperties.nodeName.toLowerCase() == "a")){ // If a nodeType is defined meaning it is a link Element
                potentialLinkElement = elementOrProperties; // Define potentialLinkElement as elementOrProperties
            }

            if (typeof potentialLinkElement !== "undefined"){ // If the potentialLinkElement is not undefined
                componentRemovingSucceed = true; // Set to true
                syiro.component.Remove(potentialLinkElement); // Remove the element
            }
        }

        return componentRemovingSucceed;
    }

    // #endregion

    // #endregion

    // #region Top Navbar Specific Functions

    // #region Function for setting the top Navbar's logo

    export function SetLogo(component : Object, image : string) : boolean{ // Requires the component object and string of the image URL
        if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (syiro.data.Read(component["id"] + "->Position") == "top")){ // If this is a "top" Navbar Component
            var navbarElement : Element = syiro.component.Fetch(component); // Get the HTMLElement
            var imageElement : Element = navbarElement.querySelector('img[data-syiro-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

            if (image.trim().length !== 0){ // If image is defined
                if (imageElement == null){ // If there is NOT already a logo in the top Navbar component
                    imageElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component" : "logo", "src" : image }); // Create an imageElement
                    navbarElement.insertBefore(imageElement, navbarElement.firstChild); // Prepend the logo component
                }
                else{ // If the image element is already defined
                    imageElement.setAttribute("src", image); // Set the image source
                }

                syiro.component.Update(component["id"], navbarElement); // Update the storedComponent HTMLElement if necessary
            }
            else{ // If image is not defined / defined as empty string
                syiro.component.Remove(imageElement); // Remove the imageElement and update the navbarElement
            }

            return true;
        }
        else{ // If this is not a top Navbar Component
            return false;
        }
    }

    // #endregion

    // #region Meta-function for removing the top navbar's logo

    export function RemoveLogo(component : Object) : boolean{
        return syiro.navbar.SetLogo(component, ""); // Call SetLogo with an empty string
    }

    // #endregion

    // #endregion

    // #region Bottom Navbar Specific Functions

    // #region Function to set the bottom navbar label (typically something like a Copyright notice)

    export function SetLabel(component : Object, labelText : string) : boolean{ // Set the label text of the footer component to the labelText defined
        if ((syiro.component.IsComponentObject(component)) && (component["type"] == "navbar") && (syiro.data.Read(component["id"] + "->Position") == "bottom")){ // If this is a "bottom" Navbar Component
            var navbarElement = syiro.component.Fetch(component); // Get the Element of the Navbar component
            var labelComponent : Element = navbarElement.querySelector("label"); // Fetch the labelComponent if it exists

            if (labelText.trim().length !== 0){ // If the labelText is not an empty string
                if (labelComponent == null){ // If the labelComponent does not exist
                    labelComponent = syiro.generator.ElementCreator("label", { "content" : labelText }); // Create a label Element with the content set to labelText
                    navbarElement.insertBefore(labelComponent, navbarElement.firstChild); // Pre-emptively insert the empty label
                }
                else{ // If the labelComponent does exist
                    labelComponent.textContent = labelText; // Set the labelComponent textContent to the labelText defined
                }

                syiro.component.Update(component["id"], navbarElement); // Update the navbarElement's Component if necessary
            }
            else{ // If labelText is an empty string
                if (labelComponent !== null){ // If labelComponent exists
                    syiro.component.Remove(labelComponent); // Remove the labelComponent, updating the navbarElement
                }
            }

            return true; // Return a success boolean
        }
        else{ // If this is not a bottom Navbar Component
            return false;
        }
    }

    // #endregion

    // #region Meta-function for removing the bottom navbar label

    export function RemoveLabel(component : Object){
        return syiro.navbar.SetLabel(component, "");
    }

    // #endreigon

}

// #endregion

// #region Faux "Header" Component

module syiro.header {

    export function Generate(properties : Object) : Object{
        properties["position"] = "top"; // Add "position" key/val to indicate this is meant to be a top Navbar Component
        return syiro.navbar.Generate(properties);
    }

    export var SetLogo = syiro.navbar.SetLogo;
    export var RemoveLogo = syiro.navbar.RemoveLogo;

}

// #endregion

// #region Faux "Footer" Component

module syiro.footer {

    export function Generate(properties : Object) : Object{
        properties["position"] = "bottom"; // Add "position" key/val to indicate this is meant to be a bottom Navbar Component
        return syiro.navbar.Generate(properties);
    }

    export var SetLabel = syiro.navbar.SetLabel;
    export var AddLink = syiro.navbar.AddLink;
    export var RemoveLink = syiro.navbar.RemoveLink;
}

// #endregion
