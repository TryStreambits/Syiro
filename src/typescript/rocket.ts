/*
	This is the aggregate of all the Rocket modules into a unified interface
*/

/// <reference path="component.ts" />
/// <reference path="device.ts" />
/// <reference path="generator.ts" />
/// <reference path="header.ts" />
/// <reference path="footer.ts" />
/// <reference path="button.ts" />
/// <reference path="dropdown.ts" />
/// <reference path="list.ts" />
/// <reference path="players.ts" />
/// <reference path="searchbox.ts" />

module rocket {

	// #region Rocket Initialization Function

	export function Init() : void {

		rocket.device.Detect(); // Detect Device information and functionality support by using our Detect() function.

		// #region Document Scroll Event Listening

		document.addEventListener("scroll", function(){ // Add an event listener to the document for when the document is scrolling
			var dropdowns : any = document.querySelectorAll('div[data-rocket-component="dropdown"][active]'); // Get all of the Dropdowns that are active

			for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++){ // For each of those Dropdown Components that are active
				var thisDropdown : Element = dropdowns[dropdownIndex]; // Get the dropdown from the array of Dropdowns
				thisDropdown.removeAttribute("active"); // Remove the "active" attribute
			}
		});

		// #endregion

		// #region Viewport Scaling Enabling - Automatically checks if there is a meta tag with viewport properties to help scale to mobile. If not, insert it.

		var documentHeadSection : Element = document.querySelector("head"); // Get the head tag from the document

		if (documentHeadSection == null){ // If the documentHeadSection doesn't actually exist
			documentHeadSection = document.createElement("head"); // Create the head section / tag
			document.querySelector("html").insertBefore(documentHeadSection, document.querySelector("head").querySelector("body")); // Insert the head tag before the body
		}

		var viewportMetaTag : Element = documentHeadSection.querySelector('meta[name="viewport"]');

		if (viewportMetaTag == null){ // If the viewportMetaTag does NOT exist
			viewportMetaTag = document.createElement("meta"); // Create the meta tag
			viewportMetaTag.setAttribute("name", "viewport"); // Set the name to viewport
			viewportMetaTag.setAttribute("content", 'width=device-width, initial-scale=1,user-scalable=no'); // Set the viewportMetaTag content to the appropriate values that enables scaling and disables zooming

			documentHeadSection.appendChild(viewportMetaTag); // Append the meta tag
		}

		// #endregion

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
													rocket.component.AddListeners("click MSPointerUp", {"id" : potentialElementId, "type" : type}, rocket.component.dropdownToggler); // Immediately listen to the Dropdown
												}
												else if (type.indexOf("player") > -1){ // If the component is an Audio or Video Player Component
													rocket.player.Init( { "id" : potentialElementId, "type" : type} ); // Initialize the Audio or Video Palyer
												}

												if (passedNode.childNodes.length > 0){ // If the passedNode has childNodes
													for (var i = 0; i < passedNode.childNodes.length; i++){ // For each node in the mutation.childNodes
														var childNode : any = passedNode.childNodes[i]; // Get the Node
														NodeParser(childNode); // Also parse this childNode
													}
												}

												delete rocket.component.storedComponents[potentialElementId]; // Ensure the Component in the storedComponents is deleted
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
				window.setTimeout( // Set interval to 5000 (5 seconds) with a timeout, forcing the execution to happen within 5 seconds
					function(){ // Call this function
						for (var componentId in Object.keys(rocket.component.storedComponents)){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
							var potentiallyExistingComponent = document.querySelector('*[data-rocket-component-id="' + componentId + '"]');

							if (potentiallyExistingComponent !== null){ // If the component exists in the DOM
								var type = potentiallyExistingComponent.getAttribute("data-rocket-component"); // Get the Rocket Component Type

								if (type == "dropdown"){ // If the component is a Dropdown
									rocket.component.AddListeners({"id" : componentId, "type" : type}, rocket.component.dropdownToggler); // Immediately listen to the Dropdown
								}
								else if (type.indexOf("player") > -1){ // If the component is an Audio or Video Player Component
									rocket.player.Init( { "id" : componentId, "type" : type} ); // Initialize the Audio or Video Palyer
								}

								delete rocket.component.storedComponents[componentId]; // Ensure the Component in the storedComponents is deleted
							}
						}

						mutationTimer(); // Recursively call setTimeout
					},
					5000
				)
			})();
		}

		// #endregion
	}

	// #endregion

	export var Define = rocket.component.Define; // Meta-function for defining Rocket components

	export var Fetch = rocket.component.Fetch; // Meta-function for fetching Rocket component HTMLElements

	export var Add = rocket.component.Add; // Meta-function for adding Rocket components to each other

	export var Remove = rocket.component.Remove; // Meta-function for removing Rocket components

	export var Animate = rocket.component.Animate; // Meta-function for animating Rocket components (highly limited currently)

	export var CSS = rocket.component.CSS; // Meta-function for modifying Rocket Component CSS styling

	export var AddListeners = rocket.component.AddListeners; // Meta-function for adding event listeners to Rocket Components

	export var RemoveListeners = rocket.component.RemoveListeners; // Meta-function for removing event listeners to Rocket Components

}
