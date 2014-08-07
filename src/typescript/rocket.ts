/*
	This is the aggregate of all the Rocket modules into a unified interface
*/

/// <reference path="core.ts" />
/// <reference path="header.ts" />
/// <reference path="footer.ts" />
/// <reference path="button.ts" />

module rocket {

	// #region Rocket Initialization Function

	export function Init() : void {
		// #region Watch DOM For Components

		if (MutationObserver !== undefined){ // If MutationObserver is supported by the browser
			var mutationWatcher = new MutationObserver(
				function(mutations : Array<MutationRecord>){ // Define mutationHandler as a variable that consists of a function that handles mutationRecords
					mutations.forEach( // For each mutation that occured
						function(mutation : MutationRecord){
							var mutationAddedNodesNum : Number = mutation.addedNodes.length;
							if (mutationAddedNodesNum > 0){ // If the addedNodes are NOT empty
								for (var i = 0; i < mutationAddedNodesNum; i++){ // For each node in the mutation.addedNodes
									var addedNode : Node = mutation[i]; // Get the Node
									var nodeAsElement : Element = addedNode.childNodes[0].parentElement; // "Convert" the Node to an Element for proper attribute fetching by fetching the childNode[0] parentElement

									var potentialElementId = nodeAsElement.getAttribute("data-rocket-component-id"); // Get the potential Rocket component ID

									if (potentialElementId !== null){ // If the element is a Rocket component
										delete rocket.core.storedComponents[potentialElementId]["HTMLElement"]; // Ensure the HTMLElement in the storedComponents is deleted
									}
								}
							}
						}
					)
				}
			);

			var mutationWatcherOptions = { // Define mutationWatcherOptions as the options we'll pass to mutationWatcher.observe()
				childList : true, // Watch child nodes of the element we are watching
				attributes : false, // Don't bother to watch for attribute changes
				characterData : false, // Don't bother to watch character data changes
			};

			mutationWatcher.observe(document.body, mutationWatcherOptions); // Watch the document body with the options provided.
		}
		else{ // If MutationObserver is NOT supported
			// Use an ol' fashion "timer"

			(function mutationTimer(){
				window.setTimeout( // Set interval to 10000 (10 seconds) with a timeout, forcing the execution to happen within 10 seconds
					function(){ // Call this function
						for (var componentId in Object.keys(rocket.core.storedComponents)){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
							if (document.querySelector('*[data-rocket-component="' + componentId + '"]') !== null){ // If the component exists in the DOM
								delete rocket.core.storedComponents[componentId]["HTMLElement"]; // Ensure the HTMLElement in the storedComponents is deleted
							}
						}

						mutationTimer(); // Recursively call setTimeout
					},
					10000
				)
			})();
		}

		// #endregion
	}

	// #endregion

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