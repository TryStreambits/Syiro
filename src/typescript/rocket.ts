/*
	This is the aggregate of all the Rocket modules into a unified interface
*/

/// <reference path="core.ts" />
/// <reference path="header.ts" />
/// <reference path="footer.ts" />
/// <reference path="button.ts" />

module rocket {

	// #region Meta-function for defining Rocket components

	export function Define(type : string, properties : any) : Object{
		return rocket.core.Define(type, properties); // Call and return the Rocket component Object
	}

	// #endregion

	// #region Meta-function (with sanity checking) for generating Rocket components

	export function Generate(componentType : string, componentProperties : Object) {
		var validComponents : Array<string> = ["header", "footer", "button", "dropdown", "list", "list-item", "searchbox"]; // Create an array that consists of the valid Rocket components

		if (validComponents.indexOf(componentType) > -1){ // If the type defined is a valid Component type
			if (typeof componentProperties == ("Object" || "object")){ // If the component properties is an Object
				return rocket.core.Generate(componentType, componentProperties); // Return a valid Rocket Component object
			}
			else{ // If the component properties is NOT an Object
				return false; // Return a false for failure
			}
		}
		else{ // If the component type is NOT valid
			return false; // Return a false for failure
		}
	}

	// #endregion

	// #region Meta-function for adding Rocket components to each other

	export function AddComponent(prepend : boolean, parentComponent : Object, component : Object) : Object {
		return rocket.core.AddComponent(prepend, parentComponent, component);
	}

	// #endregion

	// #region Meta-function for removing Rocket components

	export function RemoveComponent(parentComponent : Object, childComponent : any) : boolean {
		return rocket.core.RemoveComponent(parentComponent, childComponent); // Remove a component from the parentComponent
	}

	// #endregion
}