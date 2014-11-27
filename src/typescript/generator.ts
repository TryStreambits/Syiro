/*
 This is the module for generating Rocket components.
 */

/// <reference path="rocket.ts" />
/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

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

    export function ElementCreator(... args : any[]) : HTMLElement { // Takes an optional componentId, componentType or the desired element tag name and attributes
        var attributes : Object; // Define attributes as an Object
        var generatedElement : HTMLElement; // Define componentElement as the generated HTMLElement

        if (((args.length == 2) && (typeof args[1] == "string")) || (args.length == 3)){ // If we have either defined three arguments: ID, type, and attributes OR two arguments where the second one is a string
            var componentId : string = args[0]; // Set componentId as the first argument passed
            var componentType : string = args[1]; // Set componentType as the second argument passed
            attributes = args[2]; // Set attributes equal to the third argument passed

            if ((componentType == "header") || (componentType == "footer")){ // If the componentType is a header or a footer
                generatedElement = document.createElement(componentType); // Create an Element of the tag of "header" or "footer", since they are valid HTML5 tags
            }
            else if (componentType == "searchbox"){ // If we are creating a searchbox
                generatedElement = document.createElement("input"); // Use the HTML input tag
                generatedElement.setAttribute("type", "text"); // Set the searchbox input type to text
            }
            else{ // If we are creating a Component that uses a generic div tag as a container
                generatedElement = document.createElement("div"); // Create a div tag
            }

            generatedElement.setAttribute("data-rocket-component-id", componentId); // Set the Rocket Component ID to the componentID passed
            generatedElement.setAttribute("data-rocket-component", componentType); // Set the Rocket Component to the type specified (ex. header)
        }
        else{ // If we're not creating a Rocket Component
            attributes = args[1]; // Set attributes equal to the second argument passed
            generatedElement = document.createElement(args[0]); // Create an element based on the componentType (in this case, it is really just a element tag name)
        }

        if (attributes !== undefined){ // If an attributes Object is defined
            for (var attributeKey in attributes){ // For each attributeKey in attributes
                var attributeValue = attributes[attributeKey]; // Get the attribute value based on key

                if (attributeKey !== "content"){ // If the attributeKey is not content
                    if (attributeKey == "content-attr"){ // If the attributeKey is "content-attr" (used in meta tag creation)
                        attributeKey = "content"; // Set to content instead.
                    }

                    generatedElement.setAttribute(attributeKey, attributeValue); // Set the attribute
                }
                else{ // If the attributeKey IS "content"
                    var innerComponentContent = attributeValue; // Set innerComponentContent to the attributes content
                    innerComponentContent = innerComponentContent.replace("<", ""); // Remove < symbol
                    innerComponentContent = innerComponentContent.replace(">", ""); // Remove > symbol
                    innerComponentContent = innerComponentContent.replace("&lt;", ""); // Remove < (entity) symbol
                    innerComponentContent = innerComponentContent.replace("&gt;", ""); // Remove > (entity) symbol

                    generatedElement.textContent = innerComponentContent; // Set the innerText of the componentElement
                }
            }
        }

        return generatedElement; // Return the componentElement
    }

    // #endregion

}
