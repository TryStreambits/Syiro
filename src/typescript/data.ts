/*
    This is the namespace for managing Syiro Data.
*/

/// <reference path="interfaces.ts" />

namespace syiro.data {
    export var storage : Object = { }; // Define syiro.data.storage as the storage Object for all Syiro Data

    // Manage
    // Read or modify data stored in syiro.data.storage
    // Returns a boolean success value or the value (if read)
    export function Manage(modificationType : string, keyList : string, data ?: any) : any {
        var componentId : string; // Define componentId as a string
        var returnableValue : any; // Default to returnableValue as any value
		var keyToApply : string; // Define keyToApply as a string that'll be equivelant to undefined or a proper key/val after -> parsing

		if (keyList.indexOf("->") !== -1){ // If we are applying data to a key/val in the Component's data
			componentId= keyList.slice(0, keyList.indexOf("->")); // Define componentId as the first string before the first ->
			keyToApply = keyList.replace(componentId + "->", ""); // Set keyToApply to be keyList but without the Component Id
		} else { // If we are applying the data itself to the key/val of syiro.data.storage, such as create the initial Object during creation of the Component
			componentId = keyList; // Define componentId as the actual keyList
		}

		if (typeof syiro.data.storage[componentId] == "undefined"){ // If the Component does not have a specific section yet
			if (modificationType == "write"){ // If we are doing a write
				if (typeof keyToApply =="string"){ // If there are sub-keys to apply on this write operation
					syiro.data.storage[componentId] = {}; // Define as a new Object
				} else { // If no keyToApply exists, meaning whatever is in data is the entire Object for initial write
					syiro.data.storage[componentId] = data; // Apply the data
					returnableValue = true; // Immediately set returnableValue to true
				}
			} else { // If we are not doing a write operation
				returnableValue = false; // Define as false (the value doesn't exist)
			}
		}

		if ((returnableValue !== false) && (typeof keyToApply == "string")){ // If the returnableValue isn't already false
			returnableValue = true; // Change to true, change to a different value only if the operation would succeed (or delete)

			if (modificationType == "read"){ // If the modificationType is read
				if (typeof syiro.data.storage[componentId][keyToApply] !== "undefined"){ // If the keyToApply is defined
					returnableValue = syiro.data.storage[componentId][keyToApply]; // Define returnableValue as the keyToApply/val stored
				} else { // If the value does not exist
					returnableValue = false; // Set returnableValue to false
				}
			} else if (modificationType == "write"){ // If we are writing data
				if (typeof data !== "undefined"){ // If data is defined
					syiro.data.storage[componentId][keyToApply] = data; // Define the keyToApply/val as key + data passed
				}
			} else if (modificationType == "delete"){ // If we are deleting data in syiro.data.storage
				if (typeof syiro.data.storage[componentId][keyToApply] !== "undefined"){ // If the keyToApply exists (or for that matter, the Component-specific storage exists)
					delete syiro.data.storage[componentId][keyToApply]; // Delete the key from this componentId
				}
			}
		}

		if ((returnableValue) && (modificationType == "delete") && (Object.keys(syiro.data.storage[componentId]).length == 0)){ // If the Component no longer has any key/vals after a delete operation (and it was a successful operation)
			delete syiro.data.storage[componentId]; // Delete the empty Object from storage
		}

		return returnableValue; // Return the values
	}

    // Read
    // Meta-function for reading data from syiro.data.storage
    export function Read(keyList : string) : any {
        return syiro.data.Manage("read", keyList);
    }

    // Write
    // Meta-function for writing data to syiro.data.storage
    export function Write(keyList : string, data : any) : any{
        return syiro.data.Manage("write", keyList, data);
    }

    // Delete
    // Meta-function for deleting data in syiro.data.storage
    export function Delete(keyList : string) : any {
        return syiro.data.Manage("delete", keyList);
    }
}