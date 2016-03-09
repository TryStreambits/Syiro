/*
	This is the aggregate of all the Syiro namespace into a unified namespace
*/
/// <reference path="init.ts" />
/// <reference path="animation.ts" />
/// <reference path="button.ts" />
/// <reference path="component.ts" />
/// <reference path="data.ts" />
/// <reference path="device.ts" />
/// <reference path="events.ts" />
/// <reference path="grid.ts" />
/// <reference path="navbar.ts" />
/// <reference path="list.ts" />
/// <reference path="players.ts" />
/// <reference path="render.ts" />
/// <reference path="searchbox.ts" />
/// <reference path="sidepane.ts" />
/// <reference path="toast.ts" />
/// <reference path="utilities.ts" />

namespace syiro {

	export var page : Element; // Define page as the Syiro page component
	export var backgroundColor : string; // Define backgroundColor as the rgba value we get from the CSS of the Syiro Background Color
	export var primaryColor : string; // Define primaryColor as the rgba value we get from the CSS of the Syiro Primary Color
	export var secondaryColor : string; // Define secondaryColor as the rgba value we get from the CSS of the Syiro Secondary Color
	export var legacyDimensionsDetection : boolean; // Define legacyDimensionsDetection as a boolean, used if we need to check dimensions for non-MutationObserver supported browsers

	// #region Syiro Initialization Function

	export function Init() : void {
		syiro.device.Detect(); // Detect Device information and functionality support by using our Detect() function.

		// #region Document Scroll Event Listening

		syiro.events.Add("scroll", document, // Add an event listener to the document for when the document is scrolling
			function(){
				var dropdownButtons : NodeList = document.querySelectorAll('div[data-syiro-component="button"][data-syiro-component-type="dropdown"][active]'); // Get all of the Dropdown Buttons that are active

				for (var dropdownButtonIndex in dropdownButtons){ // For each of those Dropdown Button Components that are active
					if (syiro.utilities.TypeOfThing(dropdownButtons[dropdownButtonIndex], "Element")){ // If this is an Element
						var thisDropdownButtonObject : ComponentObject = syiro.component.FetchComponentObject(dropdownButtons[dropdownButtonIndex]); // Get the Component Object of the Dropdown Button
						syiro.button.Toggle(thisDropdownButtonObject); // Toggle the Dropdown Button
					}
				}
			}
		);

		// #endregion

		// #region Video Player Fullscreen Scaling

		syiro.events.Add(syiro.events.eventStrings["fullscreenchange"], document,  // Call the eventAction, either syiro.events.Add or syiro.events.Remove
			function(){
				var fullscreenVideoPlayerElement : Element; // Define fullscreenVideoPlayerElement as an Element

				if ((typeof document.fullscreenElement !== "undefined") && (document.fullscreenElement !== null)){ // If the standard fullscreenElement is implemented
					fullscreenVideoPlayerElement = document.fullscreenElement;
				} else if ((typeof document.mozFullScreenElement !== "undefined") && (document.mozFullScreenElement !== null)){ // If the mozilla fullscreenElement is implemented
					fullscreenVideoPlayerElement = document.mozFullScreenElement;
				} else if ((typeof document.msFullscreenElement !== "undefined") && (document.msFullscreenElement !== null)){ // If the MS fullscreenElement is implemented
					fullscreenVideoPlayerElement = document.msFullscreenElement;
				} else if ((typeof document.webkitFullscreenElement !== "undefined") && (document.webkitFullscreenElement !== null)){ // If the WebKit fullscreenElement is implemented
					fullscreenVideoPlayerElement = document.webkitFullscreenElement;
				}

				if ((typeof fullscreenVideoPlayerElement !== "undefined") && (fullscreenVideoPlayerElement !== null)){ // If there is currently a fullscreen Element
					document.SyiroFullscreenElement = fullscreenVideoPlayerElement; // Define SyiroFullscreenElement on the document as the current fullscreenVideoPlayerElement
				} else { // If there is no current fullscreen Element, like when exiting fullscreen
					fullscreenVideoPlayerElement = document.SyiroFullscreenElement; // Fetch the SyiroFullscreenElement that we assigned during the initial fullscreenchange and set that as fullscreenVideoPlayerElement
				}

				syiro.render.Scale(syiro.component.FetchComponentObject(fullscreenVideoPlayerElement));
			}
		);

		// #endregion

		// #region Page Heading

		var documentHeadSection : Element = document.querySelector("head"); // Get the head tag from the document

		if (documentHeadSection == null){ // If the documentHeadSection doesn't actually exist
			documentHeadSection = document.createElement("head"); // Create the head section / tag
			document.querySelector("html").insertBefore(documentHeadSection, document.body); // Insert the head tag before the body
		}

		var metaTagsToCheck : Object = { // Create an Object we'll recurse over that contains the meta tags + attributes we want to check
			"ie-compat" : { "http-equiv" : "X-UA-Compatible", "content-attr" : "IE=edge" }, // IE Compat Enforcement
			"utf8" : { "charset" : "utf-8" }, // Enforce UTF-8 Charset if page doesn't have charset defined already
			"viewport" : { "name" : "viewport", "content-attr" : "width=device-width, maximum-scale=1.0, initial-scale=1,user-scalable=no" } // VIewporting: Enable scaling and disable zooming
		};

		for (var metaAttributeKey in metaTagsToCheck){ // For headAttributeObject in headAttributesToCheck
			var metaAttributeObject = metaTagsToCheck[metaAttributeKey]; // Get the Object related to the key
			var firstKey : string = Object.keys(metaAttributeObject)[0]; // Get the first key in headAttributeObject

			if (documentHeadSection.querySelector('meta[' + firstKey + '="' + metaAttributeObject[firstKey] + '"]') == null){ // If this particular meta tag (constructed using the first key/val as the selector)
				var metaElement : HTMLElement = syiro.utilities.ElementCreator("meta", metaAttributeObject); // Create this meta  Element
				syiro.component.Add("append", documentHeadSection, metaElement); // Append this meta Element
			}
		}

		// #endregion

		// #region Main Page Creation

		if (document.body.querySelector('div[data-syiro-component="page"]') == null){ // If the page Component doesn't exist
			var pageElement = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "page", "role" : "main" }); // Create the page Element
			syiro.component.Add("prepend", document.body, pageElement); // Prepend the pageElement
		}

		syiro.page = document.body.querySelector('div[data-syiro-component="page"]'); // Set syiro.page to the page Component

		// #endregion

		// #region Syiro CSS-To-TypeScript Color Variable Setup

		var syiroInternalColorContainer : Element = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "internalColorContainer"});
		document.body.appendChild(syiroInternalColorContainer);
		syiro.backgroundColor = window.getComputedStyle(syiroInternalColorContainer).backgroundColor; // Get the backgroundColor defined in CSS and set it to syiro.backgroundColor
		syiro.primaryColor = window.getComputedStyle(syiroInternalColorContainer).color; // Get the primaryColor defined in CSS as color key/val and set it to syiro.primaryColor
		syiro.secondaryColor = window.getComputedStyle(syiroInternalColorContainer).borderColor; // Get the secondaryColor defined in CSS as border-color key/val and set it to syiro.secondaryColor
		document.body.removeChild(syiroInternalColorContainer); // Remove the no longer necessary Internal Color Container

		// #endregion

		// #region Watch DOM For Components

		if (syiro.device.SupportsMutationObserver){ // If MutationObserver is supported by the browser
			var mutationWatcher = new MutationObserver(
				function(mutations : Array<MutationRecord>){ // Define mutationHandler as a variable that consists of a function that handles mutationRecords
					for (var mutation of mutations){ // For each mutation of mutations
						if (mutation.type == "childList"){ // If something in the document changed (childList)
							for (var mutationIndex in mutation.addedNodes){ // For each node in the mutation.addedNodes
								var componentElement : any = mutation.addedNodes[mutationIndex]; // Get the Node
								syiro.init.Parser(componentElement); // Send to Syiro's Component Parser
							}
						}
					}
				}
			);

			var triggerAccurateInitialDimensions = new MutationObserver( // Create a MutationObserver
				function(){
					syiro.device.FetchScreenDetails(); // Do a fetch of the screen details now that we have elements in the DOM
					arguments[2].disconnect(); // Disconnect from the MutationObserver that we passed (which is provided as second argument since an array of changes are passed first)
				}.bind(this, triggerAccurateInitialDimensions)
			);

			var mutationWatcherOptions : MutationObserverInit = { // Define mutationWatcherOptions as the options we'll pass to mutationWatcher.observe()
				childList : true, // Watch child nodes of the element we are watching
				attributes : true, // Watch for attribute changes
				characterData : false, // Don't bother to watch character data changes
				attributeFilter : ['data-syiro-component'], //  Look for elements with this particular attribute
				subtree: true
			};

			var tempWatcherOptions = mutationWatcherOptions; // Define tempWatcherOptions as a copy of the mutationWatcherOptions
			delete tempWatcherOptions.attributeFilter; // Remove the attributeFilter from the tempWatcherOptions

			mutationWatcher.observe(document.body, mutationWatcherOptions); // Watch the document body with the options provided.
			triggerAccurateInitialDimensions.observe(document.body, tempWatcherOptions); // Watch the document body temporarily
		} else { // If MutationObserver is NOT supported (IE10 and below), such as in Windows Phone
			syiro.legacyDimensionsDetection = false; // Define legacyDimensionsDetection as false, implying we have not already had a Component enter DOM and need to re-check screen dimensions

			(function mutationTimer(){
				window.setTimeout( // Set interval to 3000 (3 seconds) with a timeout
					function(){ // Call this function
						for (var componentId in syiro.data.storage){ // Quickly cycle through each storedComponent key (we don't need the sub-objects)
							var componentElement = document.querySelector('div[data-syiro-component-id="' + componentId + '"]'); // Get the potential component Element
							if (componentElement !== null){ // If the component exists in the DOM
								syiro.init.Parser(componentElement); // Send to Syiro's Component Parser

								if (syiro.legacyDimensionsDetection == false){ // If we should update screen dimensions now
									syiro.device.FetchScreenDetails(); // Update screen details
									syiro.legacyDimensionsDetection = true; // Set legacyDimensionsDetection to true
								}
							}
						}

						mutationTimer();
					},
					3000
				)
			})();
		}

		// #endregion

	}

	// #endregion

	// #region Meta Functions

	export var CSS = syiro.component.CSS; // Meta-function for modifying Syiro Component CSS styling

	export var Fetch = syiro.component.Fetch; // Meta-function for fetching Syiro component HTMLElements
	export var FetchComponentObject = syiro.component.FetchComponentObject; // Meta-function for fetching Syiro Component Objects from Component Elements.
	export var FetchDimensionsAndPosition = syiro.component.FetchDimensionsAndPosition; // Meta-function for fetching the dimensions and position of a Component Object Element or any (HTML)Element.
	export var FetchLinkedListComponentObject = syiro.component.FetchLinkedListComponentObject; // Meta-function for fetching the linked List of a Component such as a Dropdown Button or Searchbox

	export var IsComponentObject = syiro.component.IsComponentObject; // Meta-function for checking if the variable passed is a Component Object

	export var Add = syiro.component.Add; // Meta-function for adding Syiro components to each other
	export var Remove = syiro.component.Remove; // Meta-function for removing Syiro components

	export var Position = syiro.render.Position; // Meta function for setting the position of a Syiro Component
	export var Scale = syiro.render.Scale; // Meta function for scaling a Syiro Component

	// #endregion

}
