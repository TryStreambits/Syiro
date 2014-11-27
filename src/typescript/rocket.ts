/*
	This is the aggregate of all the Rocket modules into a unified module
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

		if (documentHeadSection.querySelector('meta[name="viewport"]') == null){ // If the viewportMetaTag does NOT exist
			var viewportMetaTag : HTMLElement = rocket.generator.ElementCreator("meta", { "name" : "viewport", "content-attr" : "width=device-width, initial-scale=1,user-scalable=no"} ); // Create a meta tag, setting attributes to enable scaling and disable zooming
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
											var componentObject = rocket.component.FetchComponentObject(passedNode); // Fetch the (potential) Component Object of the passedNode

											if (componentObject !== false){ // If the element is a Rocket component
												if (componentObject["type"] == "dropdown"){ // If the component is a Dropdown
													rocket.component.AddListeners(rocket.component.listenerStrings["up"], componentObject, rocket.dropdown.Toggle); // Immediately listen to the Dropdown
												}
												else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")){ // If the component is an Audio or Video Player Component
													rocket.player.Init(componentObject); // Initialize the Audio or Video Palyer
												}

												if (passedNode.childNodes.length > 0){ // If the passedNode has childNodes
													for (var i = 0; i < passedNode.childNodes.length; i++){ // For each node in the mutation.childNodes
														var childNode : any = passedNode.childNodes[i]; // Get the Node
														NodeParser(childNode); // Also parse this childNode
													}
												}

												delete rocket.component.storedComponents[componentObject["id"]]; // Ensure the Component in the storedComponents is deleted
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
		else{ // If MutationObserver is NOT supported (IE10 and below), such as in Windows Phone
			if (rocket.plugin.alternativeInit !== undefined){ // If rocket.plugin.alternativeInit is added in the page as well
				rocket.plugin.alternativeInit.Init(); // Initialize the alternative init
			}
		}

		// #endregion
	}

	// #endregion

	export var Define = rocket.component.Define; // Meta-function for defining Rocket components

	export var Fetch = rocket.component.Fetch; // Meta-function for fetching Rocket component HTMLElements

	export var FetchComponentObject = rocket.component.FetchComponentObject; // Meta-function for fetching Rocket Component Objects from Component Elements.

	export var Add = rocket.component.Add; // Meta-function for adding Rocket components to each other

	export var Remove = rocket.component.Remove; // Meta-function for removing Rocket components

	export var Animate = rocket.component.Animate; // Meta-function for animating Rocket components (highly limited currently)

	export var CSS = rocket.component.CSS; // Meta-function for modifying Rocket Component CSS styling

	export var AddListeners = rocket.component.AddListeners; // Meta-function for adding event listeners to Rocket Components

	export var RemoveListeners = rocket.component.RemoveListeners; // Meta-function for removing event listeners to Rocket Components

}
