/*
	This is the aggregate of all the Syiro modules into a unified module
*/
/// <reference path="animation.ts" />
/// <reference path="component.ts" />
/// <reference path="data.ts" />
/// <reference path="device.ts" />
/// <reference path="events.ts" />
/// <reference path="generator.ts" />
/// <reference path="header.ts" />
/// <reference path="footer.ts" />
/// <reference path="button.ts" />
/// <reference path="dropdown.ts" />
/// <reference path="list.ts" />
/// <reference path="players.ts" />
/// <reference path="render.ts" />
/// <reference path="searchbox.ts" />
/// <reference path="utilities.ts" />

module syiro {

	export var backgroundColor : string; // Define backgroundColor as the rgba value we get from the CSS of the Syiro Background Color
	export var primaryColor : string; // Define primaryColor as the rgba value we get from the CSS of the Syiro Primary Color
	export var secondaryColor : string; // Define secondaryColor as the rgba value we get from the CSS of the Syiro Secondary Color

	// #region Syiro Initialization Function

	export function Init() : void {

		syiro.device.Detect(); // Detect Device information and functionality support by using our Detect() function.

		// #region Document Scroll Event Listening

		syiro.events.Add("scroll", document, // Add an event listener to the document for when the document is scrolling
			function(){
				var dropdowns : any = document.querySelectorAll('div[data-syiro-component="dropdown"][active]'); // Get all of the Dropdowns that are active

				for (var dropdownIndex = 0; dropdownIndex < dropdowns.length; dropdownIndex++){ // For each of those Dropdown Components that are active
					var thisDropdownObject : Object = syiro.component.FetchComponentObject(dropdowns[dropdownIndex]); // Get the Component Object of the Dropdown
					syiro.dropdown.Toggle(thisDropdownObject); // Toggle the Dropdown
				}
			}
		);

		// #endregion

		// #region Video Player Fullscreen Scaling

		syiro.events.Add(syiro.events.eventStrings["fullscreenchange"], document,  // Call the eventAction, either syiro.events.Add or syiro.events.Remove
			function(){
				var fullscreenVideoPlayerElement : Element; // Define fullscreenVideoPlayerElement as an Element

				if ((typeof document.fullscreenElement !== "undefined") && (typeof document.fullscreenElement !== "null")){
					fullscreenVideoPlayerElement = document.fullscreenElement;
				}
				else if ((typeof document.mozFullScreenElement !== "undefined") && (typeof document.mozFullScreenElement !== "null")){
					fullscreenVideoPlayerElement = document.mozFullScreenElement;
				}
				else if ((typeof document.msFullscreenElement !== "undefined") && (typeof document.msFullscreenElement !== "null")){
					fullscreenVideoPlayerElement = document.msFullscreenElement;
				}
				else if ((typeof document.webkitFullscreenElement !== "undefined") && (typeof document.webkitFullscreenElement !== "null")){
					fullscreenVideoPlayerElement = document.webkitFullscreenElement;
				}

				if ((typeof fullscreenVideoPlayerElement !== "undefined") && (fullscreenVideoPlayerElement !== null)){ // If there is currently a fullscreen Element
					document.SyiroFullscreenElement = fullscreenVideoPlayerElement; // Define SyiroFullscreenElement on the document as the current fullscreenVideoPlayerElement
				}
				else { // If there is no current fullscreen Element, like when exiting fullscreen
					fullscreenVideoPlayerElement = document.SyiroFullscreenElement; // Fetch the SyiroFullscreenElement that we assigned during the initial fullscreenchange and set that as fullscreenVideoPlayerElement
				}

				syiro.component.Scale(syiro.component.FetchComponentObject(fullscreenVideoPlayerElement));
			}
		);

		// #endregion

		// #region Head IE Compatibility && Viewport Scaling

		var documentHeadSection : Element = document.querySelector("head"); // Get the head tag from the document

		if (documentHeadSection == null){ // If the documentHeadSection doesn't actually exist
			documentHeadSection = document.createElement("head"); // Create the head section / tag
			document.querySelector("html").insertBefore(documentHeadSection, document.querySelector("head").querySelector("body")); // Insert the head tag before the body
		}

		if (documentHeadSection.querySelector('meta[http-equiv="X-UA-Compatible"]') == null){ // If the IE compat meta doesn't exist
			var compatMetaTag : HTMLElement = syiro.generator.ElementCreator("meta", { "http-equiv" : "X-UA-Compatible", "content-attr" : "IE=edge"} ); // Create a meta tag, setting X-UA-Compatible to be IE edge
			documentHeadSection.appendChild(compatMetaTag); // Append the meta tag
		}

		if (documentHeadSection.querySelector('meta[name="viewport"]') == null){ // If the viewportMetaTag does NOT exist
			var viewportMetaTag : HTMLElement = syiro.generator.ElementCreator("meta", { "name" : "viewport", "content-attr" : "width=device-width, initial-scale=1,user-scalable=no"} ); // Create a meta tag, setting attributes to enable scaling and disable zooming
			documentHeadSection.appendChild(viewportMetaTag); // Append the meta tag
		}

		// #endregion

		// #region Syiro CSS-To-TypeScript Color Variable Setup

		var syiroInternalColorContainer : Element = syiro.generator.ElementCreator("div", { "data-syiro-component" : "internalColorContainer"});
		document.querySelector("body").appendChild(syiroInternalColorContainer);
		syiro.backgroundColor = window.getComputedStyle(syiroInternalColorContainer).backgroundColor; // Get the backgroundColor defined in CSS and set it to syiro.backgroundColor
		syiro.primaryColor = window.getComputedStyle(syiroInternalColorContainer).color; // Get the primaryColor defined in CSS as color key/val and set it to syiro.primaryColor
		syiro.secondaryColor = window.getComputedStyle(syiroInternalColorContainer).borderColor; // Get the secondaryColor defined in CSS as border-color key/val and set it to syiro.secondaryColor
		syiroInternalColorContainer.parentElement.removeChild(syiroInternalColorContainer); // Remove the no longer necessary Internal Color Container

		// #region Watch DOM For Components

		if ((typeof MutationObserver !== "undefined") || (typeof WebKitMutationObserver !== "undefined")){ // If MutationObserver is supported by the browser
			if (typeof WebKitMutationObserver !== "undefined"){ // If WebKitMutationObserver is used instead (like on iOS)
				MutationObserver = WebKitMutationObserver; // Set MutationObserver to WebKitMutationObserver
			}

			var mutationWatcher = new MutationObserver(
				function(mutations : Array<MutationRecord>){ // Define mutationHandler as a variable that consists of a function that handles mutationRecords
					mutations.forEach( // For each mutation that occured
						function(mutation : MutationRecord){
							if (mutation.type == "childList"){ // If something in the document changed (childList)
								for (var i = 0; i < mutation.addedNodes.length; i++){ // For each node in the mutation.addedNodes
									var addedNode : any = mutation.addedNodes[i]; // Get the Node

									function NodeParser(passedNode : any){ // Function that parses a Node (type any rather than Node since lib.ts doesn't seem to make not that attribute func are usable on Nodes)
										if (passedNode.localName !== null){ // If the addedNode has a localName, such as "header" instead of null
											if (passedNode.hasAttribute("data-syiro-component")){ // If the element is a Syiro component
												var componentObject = syiro.component.FetchComponentObject(passedNode); // Fetch the (potential) Component Object of the passedNode

												if (componentObject["type"] == "buttongroup"){ // If the component is a Buttongroup
													var innerButtons = passedNode.querySelectorAll('div[data-syiro-component="button"]'); // Get all the Button Components inside this Buttongroup

													for (var innerButtonIndex = 0; innerButtonIndex < innerButtons.length; innerButtonIndex++){ // For each Button
														var buttonComponentObject = syiro.component.FetchComponentObject(innerButtons[innerButtonIndex]); // Get the buttonComponentObject
														syiro.events.Add(syiro.events.eventStrings["up"], buttonComponentObject, syiro.buttongroup.Toggle); // Immediately enable parent toggling for this Button
													}
												}
												else if (componentObject["type"] == "dropdown"){ // If the component is a Dropdown
													syiro.events.Add(syiro.events.eventStrings["up"], componentObject, syiro.dropdown.Toggle); // Immediately listen to the Dropdown
												}
												else if ((componentObject["type"] == "audio-player") || (componentObject["type"] == "video-player")){ // If the component is an Audio or Video Player Component
													syiro.player.Init(componentObject); // Initialize the Audio or Video Player
													syiro.component.Scale(componentObject); // Scale the Audio Player or Video Player
												}
												else if (componentObject["type"] == "searchbox"){ // If the Component is a Searchbox
													if (syiro.data.Read(componentObject["id"] + "->suggestions") !== false){ // If suggestions is enabled on this Searchbox
														syiro.events.Add("keyup", componentObject, syiro.searchbox.Suggestions);// Add  an event with the Suggestions function to the Searchbox to listen on keyup value
														syiro.events.Add("blur", componentObject,// Add an event to the Searchbox to listen to when it loses focus
															function(){
																var searchboxObject : Object = arguments[0]; // Define searchboxObject as a Syiro Component Object of the Searchbox
																var searchboxLinkedList : Object = syiro.component.FetchLinkedListComponentObject(searchboxObject); // Define searchboxLinkedList as the fetched Linked List Component
																syiro.component.CSS(searchboxLinkedList, "visibility", "hidden !important"); // Hide the Linked List
															}
														);
													}
												}

												if (passedNode.childNodes.length > 0){ // If the passedNode has childNodes
													for (var i = 0; i < passedNode.childNodes.length; i++){ // For each node in the mutation.childNodes
														var childNode : any = passedNode.childNodes[i]; // Get the Node
														NodeParser(childNode); // Also parse this childNode
													}
												}

												syiro.data.Delete(componentObject["id"] + "->HTMLElement"); // Ensure the Component's Element stored via syiro.data is deleted
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

	export var Define = syiro.component.FetchComponentObject; // Meta-function for defining Syiro components (which is actually a meta-function of FetchComponentObject)

	export var Fetch = syiro.component.Fetch; // Meta-function for fetching Syiro component HTMLElements

	export var FetchComponentObject = syiro.component.FetchComponentObject; // Meta-function for fetching Syiro Component Objects from Component Elements.

	export var FetchDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition; // Meta-function for fetching the dimensions and position of a Component Object Element or any (HTML)Element.

	export var Add = syiro.component.Add; // Meta-function for adding Syiro components to each other

	export var Remove = syiro.component.Remove; // Meta-function for removing Syiro components

	// #region Meta-function / API Compatibility for syiro.Animate()

		export function Animate( ...args : any[]) {
			var animationProperties : Object; // Define animationProperties as the properties that are provided or are created from backwards compatibility

			if ((arguments.length == 2) && (typeof arguments[1] == "object")){ // If two arguments were defined and the second one is an Object (so current allowed Animate variables)
				animationProperties = arguments[1]; // Define animationProperties as the second argument provided
			}
			else{ // If there are two arguments defined and the second is NOT the animation properties OR there are three arguments defined
				animationProperties["animation"] = arguments[1]; // Define animationProperties "animation" as the second argument passed

				if (arguments.length == 3){ // If three arguments were defined
					animationProperties["function"] = arguments[2]; // Define animationProperties "function" as the third argument passed
				}
			}

			syiro.animation.Animate(component, animationProperties); // Call Animate() with the animationProperties defined or "created"
		}

	// #endregion

	export var CSS = syiro.component.CSS; // Meta-function for modifying Syiro Component CSS styling

	export var AddListeners = syiro.events.Add; // Meta-function for adding event listeners to Syiro Components

	export var RemoveListeners = syiro.events.Remove; // Meta-function for removing event listeners to Syiro Components

}
