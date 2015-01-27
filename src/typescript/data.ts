/*
This is the module for managing Syiro Data.
*/

/// <reference path="interfaces.ts" />

module syiro.data {
    export var storage : Object = {}; // Define syiro.data.storage as the storage Object for all Syiro Data

    // #region Function for reading or manipulating data stored in syiro.data.storage
    // Returns a boolean success value or the value (if read)

    export function Manage(modificationType : string, keyList : string, data ?: any) : any {
        var dataLocation : Object = syiro.data.storage; // Define dataLocation as the location within syiro.data.storage to storage the data
        var keyHeirarchy : Array<string> = keyList.split("->"); // Define the keyHeirarchy as the keyList split by the -> delimiter
        var returnableValue = true; // Default to returnableValue as a boolean true

        modificationType = modificationType.replace("change", "update").replace("modify", "update"); // If modificationType contains "change" or "modify", change it to "update"

        for (var keyHeirarchyIndex = 0; keyHeirarchyIndex < keyHeirarchy.length; keyHeirarchyIndex++){ // For each key defined in the keyHeirarchy
            var key : string = keyHeirarchy[keyHeirarchyIndex]; // Define the key as the index in keyHeirarchy

            if (keyHeirarchyIndex !== (keyHeirarchy.length - 1)){ // If we are not finished with building or traversing the keyHeirarchy (we determine that by checking if the length and current index match, reducing keyHeirarchy.length by one to match the index which starts at 0)
                if (typeof dataLocation[key] == "undefined"){ // If this key in the keyHeirarchy is not defined in syiro.data.storage.any_applicable_keys
                    if (modificationType == "write"){ // If we are writing a key/val from syiro.data.storage
                        dataLocation[key] = {}; // Create an empty Object in this dataLocation key/val
                    }
                    else{ // If we are reading or deleting a key/val from syiro.data.storage, but a key along the way is not defined
                        returnableValue = false; // Define modificationSuccessful as false
                        break; // Break the loop
                    }
                }

                dataLocation = dataLocation[key]; // Redefine the dataLocation as dataLocation[key] so we can continue building the tree (only is reached if dataLocation undefined is handled properly or the key is defined)
            }
            else{ // If we are finished with traversing or building the heirarchy
                if (modificationType == "read"){ // If the modificationType is read
                    if (typeof dataLocation[key] !== "undefined"){ // If the key is defined
                        returnableValue = dataLocation[key]; // Define returnableValue as the key/val stored
                    }
                    else{ // If the key is not defined
                        returnableValue = false; // Define returnableValue as false (failed to read)
                    }
                }
                else if (modificationType == "write"){ // If we are writing data
                    if (typeof data !== "undefined"){ // If data is defined
                        dataLocation[key] = data; // Define the key/val as key = data passed
                    }
                    else{ // If data is not defined
                        returnableValue = false; // Define returnableValue as false (failed to apply any content since none was passed)
                    }
                }
                else if (modificationType == "delete"){ // If we are deleting data in syiro.data.storage
                    delete dataLocation[key]; // Delete the key from this dataLocation
                }
                else{ // If the modificationType provided is not a valid type
                    returnableValue = false; // Define returnableValue as false (failed action)
                }
            }
        }

        return returnableValue; // Return the value (if read -> any, etlse -> boolean)
    }

    // #region Meta-function for reading data from syiro.data.storage

    export function Read(keyList : string) : any {
        return syiro.data.Manage("read", keyList);
    }

    // #endregion

    // #region Meta-function for writing data to syiro.data.storage

    export function Write(keyList : string, data : any) : any{
        return syiro.data.Manage("write", keyList, data);
    }

    // #endregion

    // #region Meta-function for deleting data in syiro.data.storage

    export function Delete(keyList : string) : any {
        return syiro.data.Manage("delete", keyList);
    }

    // #endregion
}
