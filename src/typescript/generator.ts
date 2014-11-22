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

        if (componentId !== null){ // If we have defined a Component Id
            if ((componentType == "header") || (componentType == "footer")){ // If the componentType is a header or a footer
                componentElement = document.createElement(componentType); // Create an Element of the tag of "header" or "footer", since they are valid HTML5 tags
            }
            else if (componentType == "searchbox"){ // If we are creating a searchbox
                componentElement = document.createElement("input"); // Use the HTML input tag
                componentElement.setAttribute("type", "text"); // Set the searchbox input type to text
            }
            else{ // If we are creating a Component that uses a generic div tag as a container
                componentElement = document.createElement("div"); // Create a div tag
            }

            componentElement.setAttribute("data-rocket-component-id", componentId); // Set the Rocket Component ID to the componentID passed
            componentElement.setAttribute("data-rocket-component", componentType); // Set the Rocket Component to the type specified (ex. header)
        }
        else{ // If we're not creating a Rocket Component
            componentElement = document.createElement(componentType); // Create an element based on the componentType (in this case, it is really just a element tag name)
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

}
