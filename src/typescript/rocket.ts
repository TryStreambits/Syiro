/*
	This is the aggregate of all the Rocket modules into a unified interface
*/

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="header.ts" />
/// <reference path="footer.ts" />
/// <reference path="button.ts" />
/// <reference path="dropdown.ts" />
/// <reference path="list.ts" />
/// <reference path="searchbox.ts" />

module rocket {

	// #region Rocket Initialization Function

	export function Init() : void {

		// #region Watch DOM For Components

		if (MutationObserver !== undefined){ // If MutationObserver is supported by the browser
			var mutationWatcher = new MutationObserver(
				function(mutations : Array<MutationRecord>){ // Define mutationHandler as a variable that consists of a function that handles mutationRecords
					mutations.forEach( // For each mutation that occured
						function(mutation : MutationRecord){
							if (mutation.type == "childList"){ // If something in the document changed (childList)
								for (var i = 0; i < mutation.addedNodes.length; i++){ // For each node in the mutation.addedNodes
									var addedNode : any = mutation.addedNodes[i]; // Get the Node

									function NodeParser(passedNode : any){ // Function that parses a Node (type any rather than Node since lib.ts doesn't seem to make not that attribute func are usable on Nodes)
										if (passedNode.localName !== null){ // If the addedNode has a localName, such as "header" instead of null
											var potentialElementId = passedNode.getAttribute("data-rocket-component-id");

											if (potentialElementId !== null){ // If the element is a Rocket component
												var type = passedNode.getAttribute("data-rocket-component"); // Get the Rocket Component Type

												if (type == "dropdown"){ // If the component is a Dropdown
													rocket.component.AddListeners("pointerup MSPointerUp", {"id" : potentialElementId, "type" : type}, rocket.component.dropdownToggler); // Immediately listen to the Dropdown
												}

												if (passedNode.childNodes.length > 0){ // If the passedNode has childNodes
													for (var i = 0; i < passedNode.childNodes.length; i++){ // For each node in the mutation.childNodes
														var childNode : any = passedNode.childNodes[i]; // Get the Node
														NodeParser(childNode); // Also parse this childNode
													}
												}

												delete rocket.component.storedComponents[potentialElementId]["HTMLElement"]; // Ensure the HTMLElement in the storedComponents is deleted
											}
										}
									}

									NodeParser(addedNode); // Parse this Node
								}
							}
						}
					);
				}
			);

			var mutationWatcherOptions = { // Define mutationWatcherOptions as the options we'll pass to mutationWatcher.observe()
				childList : true, // Watch child nodes of the element we are watching
				attributes : true, // Watch for attribute changes
				characterData : false, // Don't bother to watch character data changes
				attributeFilter : ['data-rocket-component'], //  Look for elements with this particular attribute
				subtree: true
			};

			mutationWatcher.observe(document.querySelector("body"), mutationWatcherOptions); // Watch the document body with the options provided.
		}
		else{ // If MutationObserver is NOT supported
			// Use an ol' fashion "timer"

			(function mutationTimer(){
				window.setTimeout( // Set interval to 5000 (5 seconds) with a timeout, forcing the execution to happen within 10 seconds
					function(){ // Call this function
						for (var componentId in Object.keys(rocket.component.storedComponents)){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
							var potentiallyExistingComponent = document.querySelector('*[data-rocket-component-id="' + componentId + '"]');

							if (potentiallyExistingComponent !== null){ // If the component exists in the DOM
								var type = potentiallyExistingComponent.getAttribute("data-rocket-component"); // Get the Rocket Component Type

								if (type == "dropdown"){ // If the component is a Dropdown
									rocket.component.AddListeners("pointerup MSPointerUp", {"id" : componentId, "type" : type}, rocket.component.dropdownToggler); // Immediately listen to the Dropdown
								}

								delete rocket.component.storedComponents[componentId]["HTMLElement"]; // Ensure the HTMLElement in the storedComponents is deleted
							}
						}

						mutationTimer(); // Recursively call setTimeout
					},
					5000
				)
			})();
		}

		// #endregion

		// #region Document Scroll Event Listening

		document.addEventListener("scroll", function(){ // Add an event listener to the document for when the document is scrolling
			var dropdowns : any = document.querySelectorAll('div[data-rocket-component="dropdown"][active]'); // Get all of the Dropdowns that are active

			for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++){ // For each of those Dropdown Components that are active
				var thisDropdown : Element = dropdowns[dropdownIndex]; // Get the dropdown from the array of Dropdowns
				thisDropdown.removeAttribute("active"); // Remove the "active" attribute
			}
		});

		// #endregion

	}

	// #endregion

	export var Define = rocket.component.Define; // Meta-function for defining Rocket components

	export var generate = { // Object with Meta-functions for generating Rocket components. Ex: rocket.generate.Header => rocket.generator.Header
		Header : rocket.generator.Header,
		Footer : rocket.generator.Footer,
		Button : rocket.generator.Button,
		Dropdown : rocket.generator.Dropdown,
		List : rocket.generator.List,
		ListItem : rocket.generator.ListItem,
		Searchbox : rocket.generator.Searchbox
	};

	export var Fetch = rocket.component.Fetch; // Meta-function for fetching Rocket component HTMLElements

	export var Get = rocket.component.Fetch; // Alternate venacular for fetching Rocket component HTMLElements

	export var Add = rocket.component.Add; // Meta-function for adding Rocket components to each other

	export var Remove = rocket.component.Remove; // Meta-function for removing Rocket components

	export var Animate = rocket.component.Animate; // Meta-function for animating Rocket components (highly limited currently)

	export var CSS = rocket.component.CSS; // Meta-function for modifying Rocket Component CSS styling

	export var AddListeners = rocket.component.AddListeners; // Meta-function for adding event listeners to Rocket Components

	export var RemoveListeners = rocket.component.RemoveListeners; // Meta-function for removing event listeners to Rocket Components

}
