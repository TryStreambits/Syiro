/*
 This is the module for generating Syiro components.
 */

/// <reference path="syiro.ts" />
/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="utilities.ts" />

module syiro.generator {

    export var lastUniqueIds : Object = {}; // Default the lastUniqueIds to an empty Object

    // #region Component or Element ID Generator

    export function IdGen(type : string) : string { // Takes a Component type or Element tagName and returns the new component Id
        var lastUniqueIdOfType : number; // Define lastUniqueIdOfType as a Number

        if (syiro.generator.lastUniqueIds[type] == undefined){ // If the lastUniqueId of this type hasn't been defined yet.
            lastUniqueIdOfType = 0; // Set to zero
        }
        else{ // If the lastUniqueId of this type IS defined
            lastUniqueIdOfType = syiro.generator.lastUniqueIds[type]; // Set lastUniqueIdOfType to the one set in lastUniqueIds
        }

        var newUniqueIdOfType = lastUniqueIdOfType + 1; // Increment by one

        syiro.generator.lastUniqueIds[type] = newUniqueIdOfType; // Update the lastUniqueIds

        return (type + newUniqueIdOfType.toString()); // Append newUniqueIdOfType to the type to create a "unique" ID
    }

    // #endregion

    export var ElementCreator = syiro.utilities.ElementCreator; // Meta-function (API backwards compatibility)

}
