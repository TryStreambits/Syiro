/*
	This is the aggregate of all the Syiro modules into a unified module
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
/// <reference path="utilities.ts" />

module syiro {

	// #region Syiro Initialization Function

	export function Init() : void {

		syiro.device.Detect(); // Detect Device information and functionality support by using our Detect() function.

		// #region Document Scroll Event Listening

		syiro.component.AddListeners("scroll", document, // Add an event listener to the document for when the document is scrolling
			function(){
				var dropdowns : any = document.querySelectorAll('div[data-syiro-component="dropdown"][active]'); // Get all of the Dropdowns that are active

				for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++){ // For each of those Dropdown Components that are active
					var thisDropdownObject : Object = syiro.component.FetchComponentObject(dropdowns[dropdownIndex]); // Get the Component Object of the Dropdown
					syiro.dropdown.Toggle(thisDropdownObject); // Toggle the Dropdown
				}
			}
		);

		// #endregion

		// #region Viewport Scaling Enabling - Automatically checks if there is a meta tag with viewport properties to help scale to mobile. If not, insert it.

		var documentHeadSection : Element = document.querySelector("head"); // Get the head tag from the document

		if (documentHeadSection == null){ // If the documentHeadSection doesn't actually exist
			documentHeadSection = document.createElement("head"); // Create the head section / tag
			document.querySelector("html").insertBefore(documentHeadSection, document.querySelector("head").querySelector("body")); // Insert the head tag before the body
		}

		if (documentHeadSection.querySelector('meta[name="viewport"]') == null){ // If the viewportMetaTag does NOT exist
			var viewportMetaTag : HTMLElement = syiro.generator.ElementCreator("meta", { "name" : "viewport", "content-attr" : "width=device-width, initial-scale=1,user-scalable=no"} ); // Create a meta tag, setting attributes to enable scaling and disable zooming
			documentHeadSection.appendChild(viewportMetaTag); // Append the meta tag
		}

		// #endregion

		// #region Watch DOM For Components

		if (typeof MutationObserver !== "undefined"){ // If MutationObserver is supported by the browser
			var mutationWatcher = new MutationObserver(
				function(mutations : Array<MutationRecord>){ // Define mutationHandler as a variable that consists of a function that handles mutationRecords
					mutations.forEach( // For each mutation that occured
						function(mutation : MutationRecord){
							if (mutation.type == "childList"){ // If something in the document changed (childList)
								for (var i = 0; i < mutation.addedNodes.length; i++){ // For each node in the mutation.addedNodes
									var addedNode : any = mutation.addedNodes[i]; // Get the Node

									function NodeParser(passedNode : any){ // Function that parses a Node (type any rather than Node since lib.ts doesn't seem to make not that attribute func are usable on Nodes)
										if (passedNode.localName !== null){ // If the addedNode has a localName, such as "header" instead of null
											var componentObject = syiro.component.FetchComponentObject(passedNode); // Fetch the (potential) Component Object of the passedNode

											if (componentObject !== false){ // If the element is a Syiro component
												if (componentObject["type"] == "dropdown"){ // If the component is a Dropdown
													syiro.component.AddListeners(syiro.component.listenerStrings["press"], componentObject, syiro.dropdown.Toggle); // Immediately listen to the Dropdown
												}
												else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")){ // If the component is an Audio or Video Player Component
													syiro.player.Init(componentObject); // Initialize the Audio or Video Palyer
												}

												if (passedNode.childNodes.length > 0){ // If the passedNode has childNodes
													for (var i = 0; i < passedNode.childNodes.length; i++){ // For each node in the mutation.childNodes
														var childNode : any = passedNode.childNodes[i]; // Get the Node
														NodeParser(childNode); // Also parse this childNode
													}
												}

												delete syiro.component.storedComponents[componentObject["id"]]; // Ensure the Component in the storedComponents is deleted
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
				attributeFilter : ['data-syiro-component'], //  Look for elements with this particular attribute
				subtree: true
			};

			mutationWatcher.observe(document.querySelector("body"), mutationWatcherOptions); // Watch the document body with the options provided.
		}
		else{ // If MutationObserver is NOT supported (IE10 and below), such as in Windows Phone
			if (syiro.plugin.alternativeInit !== undefined){ // If syiro.plugin.alternativeInit is added in the page as well
				syiro.plugin.alternativeInit.Init(); // Initialize the alternative init
			}
		}

		// #endregion
	}

	// #endregion

	export var Define = syiro.component.Define; // Meta-function for defining Syiro components

	export var Fetch = syiro.component.Fetch; // Meta-function for fetching Syiro component HTMLElements

	export var FetchComponentObject = syiro.component.FetchComponentObject; // Meta-function for fetching Syiro Component Objects from Component Elements.

	export var FetchDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition; // Meta-function for fetching the dimensions and position of a Component Object Element or any (HTML)Element.

	export var Add = syiro.component.Add; // Meta-function for adding Syiro components to each other

	export var Remove = syiro.component.Remove; // Meta-function for removing Syiro components

	export var Animate = syiro.component.Animate; // Meta-function for animating Syiro components (highly limited currently)

	export var CSS = syiro.component.CSS; // Meta-function for modifying Syiro Component CSS styling

	export var AddListeners = syiro.component.AddListeners; // Meta-function for adding event listeners to Syiro Components

	export var RemoveListeners = syiro.component.RemoveListeners; // Meta-function for removing event listeners to Syiro Components

}
