/*
 This is the module for generating Rocket components.
 */

/// <reference path="rocket.ts" />
/// <reference path="component.ts" />
/// <reference path="interfaces/component-object.ts" />

module rocket.generator {

    export var lastUniqueIds : Object = {}; // Default the lastUniqueIds to an empty Object

    // #region Component ID Generator

    export function IdGen(type : string) : string { // Takes a component type and returns the new component Id
        var lastUniqueIdOfType : number; // Define lastUniqueIdOfType as a Number
        if (rocket.generator.lastUniqueIds[type] == undefined){ // If the lastUniqueId of this type hasn't been defined yet.
            lastUniqueIdOfType = 0; // Set to zero
        }
        else{ // If the lastUniqueId of this type IS defined
            lastUniqueIdOfType = rocket.generator.lastUniqueIds[type]; // Set lastUniqueIdOfType to the one set in lastUniqueIds
        }

        var newUniqueIdOfType = lastUniqueIdOfType + 1; // Increment by one

        rocket.generator.lastUniqueIds[type] = newUniqueIdOfType; // Update the lastUniqueIds

        return (type + newUniqueIdOfType.toString()); // Append newUniqueIdOfType to the type to create a "unique" ID
    }

    // #endregion

    // #region Element Creator Function

    export function ElementCreator(componentId : any, componentType : string, attributes ?: Object) : HTMLElement { // Make an element based on the componentType that is passed and any key/val Object of attributes to set
        var componentElement : HTMLElement; // Define componentElement as the generated HTMLElement
        var creatingGenericElement : boolean = false; // Define creatingGenericElement as a boolean false that gets changed if we are creating an element like a Link

        if (componentType == "searchbox"){ // If we are creating a searchbox
            componentElement = document.createElement("input"); // Use the HTML input tag
            componentElement.setAttribute("type", "text"); // Set the searchbox input type to text
        }
        else if ((componentType == "dropdown") || (componentType.indexOf("list") > -1) || (componentType == "button")){ // If we are creating a Dropdown, a List or List Item, or a Button
            componentElement = document.createElement("div"); // Create a div tag
        }
        else{ // If we're not creating a Rocket Component OR we're creating one that uses a valid HTML5 tag
            if ((componentType !== "header") && (componentType !== "footer")){ // If the componentType is NOT a header or a footer
                creatingGenericElement = true; // Set creatingGenericElement to TRUE since that is what we're doing
            }
            componentElement = document.createElement(componentType); // Create an element based on the componentType (in this case, it is really just a element tag name)
        }

        if (creatingGenericElement == false){ // If we are not creating a generic Element
            componentElement.setAttribute("data-rocket-component-id", componentId); // Set the Rocket Component ID to the componentID passed
            componentElement.setAttribute("data-rocket-component", componentType); // Set the Rocket Component to the type specified (ex. header)
        }

        if (attributes !== undefined){ // If an attributes Object is defined
            for (var attributeKey in attributes){ // For each attributeKey in attributes
                if (attributeKey !== "content"){ // If the attributeKey is not content
                    componentElement.setAttribute(attributeKey, attributes[attributeKey]); // Set the attribute
                }
                else{ // If the attributeKey IS "content"
                    var innerComponentContent = attributes["content"]; // Set innerComponentContent to the attributes content
                    innerComponentContent = innerComponentContent.replace("<", ""); // Remove < symbol
                    innerComponentContent = innerComponentContent.replace(">", ""); // Remove > symbol
                    innerComponentContent = innerComponentContent.replace("&lt;", ""); // Remove < (entity) symbol
                    innerComponentContent = innerComponentContent.replace("&gt;", ""); // Remove > (entity) symbol

                    componentElement.textContent = attributes[attributeKey]; // Set the innerText of the componentElement
                }
            }
        }

        return componentElement; // Return the componentElement
    }

    // #endregion

    // #region Header Generation

    export function Header(properties : Object) : Object { // Generate a Header Component and return a Component Object
        var componentId : string = rocket.generator.IdGen("header"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "header"); // Generate a Header Element

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "items"){ // If we are adding items to the Header
                for (var individualItem in properties["items"]){ // For each individualItem in navigationItems Object array
                    if (properties["items"][individualItem]["type"] == "dropdown"){ // If the individualItem type is a Dropdown
                        var dropdownComponent : Object = properties["items"][individualItem]["component"]; // Get the embedded component object
                        componentElement.appendChild(rocket.component.Fetch(dropdownComponent)); // Append the HTMLElement fetched from rocket.component.Fetch(dropdownComponent)

                        delete rocket.component.storedComponents[dropdownComponent["id"]]; // Delete the Component from the storedComponents
                    }
                    else if (properties["items"][individualItem]["type"] == "link"){ // If we are adding a link
                        var generatedElement : HTMLElement = rocket.generator.ElementCreator(null, "a", // Generate a generic link element
                            {
                                "href" : properties["items"][individualItem]["link"], // Set the href (link)
                                "content" : properties["items"][individualItem]["content"] // Also set the inner content of the <a> tag to title
                            }
                        );

                        componentElement.appendChild(generatedElement); // Append the component to the parent component element
                    }
                }
            }
            else if (propertyKey == "logo"){ // If we are adding a Logo to the Header
                var generatedElement : HTMLElement = rocket.generator.ElementCreator(null, "img",
                    {
                        "data-rocket-minor-component" : "logo", // Set the minor component to logo
                        "src" : properties["logo"] // Set the src to the one provided as the value of "logo"
                    }
                );

                componentElement.appendChild(generatedElement); // Append the logo to the header
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "header" // Type of Component
        };
    }

    // #endregion

    // #region Footer Generation

    export function Footer(properties : Object) : Object { // Generate a Footer Component and return a Component Object
        var componentId : string = rocket.generator.IdGen("footer"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "footer"); // Generate a Footer Element

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "items"){ // If we are adding items to the Footer
                for (var individualItem in properties["items"]){ // For each individualItem in navigationItems Object array
                    if (properties["items"][individualItem]["type"] == "link"){ // If we are adding a link
                        var generatedElement : HTMLElement = rocket.generator.ElementCreator(null, "a", // Generate a generic link element
                            {
                                "href" : properties["items"][individualItem]["link"], // Set the href (link)
                                "content" : properties["items"][individualItem]["content"] // Also set the inner content of the <a> tag to title
                            }
                        );

                        componentElement.appendChild(generatedElement); // Append the component to the parent component element
                    }
                }
            }
            else if (propertyKey == "content"){ // If we are adding a Footer label
                var generatedElement : HTMLElement = rocket.generator.ElementCreator(null, "label", // Generate a generic label element
                    {
                        "content" : properties["content"] // Also set the inner content of the <label> tag
                    }
                );

                componentElement.insertBefore(generatedElement, componentElement.firstChild); // Prepend the label to the footer
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "footer" // Type of Component
        };
    }

    // #endregion

    // #region Basic and Toggle Button Generator

    export function Button(properties : Object) : Object { // Generate a Button Component and return a Component Object
        if (properties["type"] == undefined){ // If the type is undefined
            properties["type"] = "basic"; // Default to a basic button
        }

        var componentId : string = rocket.generator.IdGen("button"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "button", // Generate a Button Element
            {
                "data-rocket-component-type" : properties["type"] // Be more granular with exactly what type of Button this is
            }
        );

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if ((propertyKey == "icon") && (properties["type"] == "basic")){ // If we are adding an icon and the button type is basic
                componentElement.style.backgroundImage = properties["icon"]; // Set the backgroundImage to the icon URL specified
            }
            else if (propertyKey == "content"){ // If we are adding a label
                componentElement.textContent = properties["content"]; // Set the textContent of the button
            }
            else if ((propertyKey == "type") && (properties["type"] == "toggle")) { // If the Button type is toggle
                if (properties["default"] == undefined){ // If a default state for the button is NOT defined
                    properties["default"] = false; // Set the default state to false
                }

                var buttonToggle = rocket.generator.ElementCreator(null, "div", // Create a button toggle (differs from the toggle button itself in that it is the button that gets pressed to toggle the toggle button)
                    {
                        "data-rocket-minor-component" : "buttonToggle", // Set the buttonToggle data-rocket-minor-component attribute to buttonToggle
                        "data-rocket-component-status" : properties["default"].toString() // Set the buttonToggle default state to either the one defined or false
                    }
                );

                componentElement.appendChild(buttonToggle); // Append the buttonToggle to the toggle button
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "button" // Type of Component
        };
    }

    // #endregion

    // #region Dropdown Generator

    export function Dropdown(properties : Object) : Object { // Generate a Dropdown Component and return a Component Object
        var componentId : string = rocket.generator.IdGen("dropdown"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "dropdown"); // Generate a Dropdown Element

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "items"){ // If we are adding List Items to the Dropdown Inner List
                var newListComponent = rocket.generator.List({ "items" : properties["items"]}); // Simply generate a new List component from the provided list items
                var newListElement = rocket.component.Fetch(newListComponent); // Fetch the new List component element

                componentElement.appendChild(newListElement);

                delete rocket.component.storedComponents[newListComponent["id"]]; // Delete the Component from the storedComponents
            }
            else if (propertyKey == "label"){ // If we are adding a Label to the Dropdown
                var labelProperties : string = properties["label"]; // Get the label properties
                var dropdownLabel : HTMLElement = rocket.generator.ElementCreator(null, "div", // Create a documentLabel
                    {
                        "data-rocket-minor-component": "dropdown-label" // Set the Dropdown label to a minor-component.
                    }
                );

                if (labelProperties["icon"] !== undefined){ // If an icon is defined for the dropdown label
                    dropdownLabel.style.backgroundImage = labelProperties["icon"]; // Set the background image to the icon src provided
                }

                if (labelProperties["image"] !== undefined){ // If an image is defined for the dropdown label
                    var dropdownLabelImage : Element = rocket.generator.ElementCreator(null, "img", // Create an img element
                        {
                            "src" : labelProperties["image"] // Set the src property
                        }
                    );
                    dropdownLabel.appendChild(dropdownLabelImage); // Append the dropdown image
                }

                if (labelProperties["content"] !== undefined){ // If text is defined for the dropdown
                    var dropdownLabelText : HTMLElement = rocket.generator.ElementCreator(null, "label", // Create a label within the "label" (labelception) to hold the defined text.
                        {
                            "content" : labelProperties["content"] // Set the text content of the Dropdown's label label (yes, two intentional labels) to the text defined
                        }
                    );
                    dropdownLabel.appendChild(dropdownLabelText); // Append the label to the label.
                }

                componentElement.insertBefore(dropdownLabel, componentElement.firstChild); // Prepend the dropdown label to the dropdown
            }
            else if (propertyKey == "list") { // If we are adding a List component
                var listComponent : Element = rocket.component.Fetch(properties[propertyKey]); // Get the list component from the embedded List component Object
                componentElement.appendChild(listComponent); // Append the List component to the Dropdown

                delete rocket.component.storedComponents[properties[propertyKey]["id"]]; // Delete the Component from the storedComponents
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "dropdown" // Type of Component
        };
    }

    // #endregion

    // #region List Generator

    export function List(properties : Object) : Object { // Generate a List Component and return a Component Object
        var componentId : string = rocket.generator.IdGen("list"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "list"); // Generate a List Element

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "items"){ // If we are adding navigation elements
                for (var individualItemIndex in properties["items"]){ // For each list item in navigationItems Object array
                    var individualItem : Object = properties["items"][individualItemIndex]; // Define individualItem as an Object

                    if (individualItem["type"] !== "list-item"){ // If the individualItem is NOT a List Item Object
                        individualItem = rocket.generate.ListItem(individualItem); // Generate a List Item based on the individualItem properties
                    }

                    componentElement.appendChild(rocket.Fetch(individualItem)); // Append the List Item component to the List
                    delete rocket.component.storedComponents[individualItem["id"]]; // Delete the HTMLElement from the component in the storedComponents
                }
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "list" // Type of Component
        };
    }

    // #endregion

    // #region List Item Generator

    export function ListItem(properties : Object) : Object { // Generate a ListItem Component and return a Component Object
        var componentId : string = rocket.generator.IdGen("list-item"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "list-item"); // Generate a List Item Element

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "control"){ // If we are adding a control
                var controlComponentObject = properties[propertyKey]; // Get the Rocket component's Object

                if (controlComponentObject["type"] == "button"){ // If the component is either a basic or toggle button
                    var controlComponentElement : Element= rocket.component.Fetch(controlComponentObject); // Get the component's (HTML)Element
                    componentElement.appendChild(controlComponentElement); // Append the component to the List Item

                    delete rocket.component.storedComponents[controlComponentObject["id"]]; // Delete the Component from the storedComponents
                }
            }
            else if (propertyKey == "label"){ // If we are adding a label
                var labelComponent : HTMLElement = rocket.generator.ElementCreator(null, "label", // Create a label within the "label" (labelception) to hold the defined text.
                    {
                        "content" : properties["label"] // Set the text content of the Dropdown's label label (yes, two intentional labels) to the text defined
                    }
                );
                componentElement.insertBefore(labelComponent, componentElement.firstChild); // Prepend the label to the List Item component
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "list-item" // Type of Component
        };
    }

    // #endregion

    // #region Searchbox Generator

    export function Searchbox(properties : Object) : Object { // Generate a Searchbox Component and return a Component Object
        var componentId : string = rocket.generator.IdGen("searchbox"); // Generate a component Id
        var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "searchbox"); // Generate a Searchbox Element

        for (var propertyKey in properties){ // Recursive go through each propertyKey
            if (propertyKey == "icon"){ // If we are adding an icon
                componentElement.style.backgroundImage = properties["icon"]; // Set the backgroundImage to the icon URL specified
            }
            else if (propertyKey == "content"){ // If we are adding a placeholder / content
                componentElement.setAttribute("placeholder", properties["content"]); // Set the searchbox input placeholder to the one defined
            }
        }

        rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

        return { // Return a Component Object
            "id" : componentId, // Component ID
            "type" : "searchbox" // Type of Component
        };
    }

    // #endregion

}
