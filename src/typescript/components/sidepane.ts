/*
 This is the namespace for the Syiro Sidepane Component.
 */

/// <reference path="../component.ts" />
/// <reference path="../utilities.ts" />

// #region Syiro Sidepane Functionality

namespace syiro.sidepane {

	// #region Generation

	export function New(properties : Object) : ComponentObject {
		var componentId : string = syiro.component.IdGen("sidepane"); // Generate a Sidepane Component Id
		var componentElement : Element = syiro.utilities.ElementCreator("div", { "data-syiro-component-id" : componentId, "data-syiro-component" : "sidepane"}); // Generate an empty Sidepane
		var sidepaneContentElement : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "sidepane-content"}); // Generate an empty Sidepane Content div
		var sidepaneInnerListContent : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "sidepane-lists" }); // Generate an empty Sidepane Lists Container div
		var sidepaneEdge : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "sidepane-edge"}); // Generate an empty Sidepane Edge div

		componentElement.appendChild(sidepaneContentElement); // Append the content Element
		sidepaneContentElement.appendChild(sidepaneInnerListContent); // Append the Lists container to the Sidepane Content container

		componentElement.appendChild(sidepaneEdge); // Append the edge Element

		// #region Sidepane Logo

		if (syiro.utilities.TypeOfThing(properties["logo"], "Element") || (typeof properties["logo"] == "string")){ // If the logo is an Element or string
			var logoElement : Element = properties["logo"]; // Define logoElement as the Element. Default to the logo (assuming it is an Element)

			if (typeof properties["logo"] == "string"){ // If the logo is a string
				logoElement = syiro.utilities.ElementCreator("img", { "src" : properties["logo"] }); // Change logoElement to a newly generated img Element
			}

			sidepaneContentElement.insertBefore(logoElement, sidepaneInnerListContent); // Insert the logo image before the Sidepane Inner Lists Content container
		}

		// #endregion

		// #region SIdepane Searchbox

		if (syiro.utilities.TypeOfThing(properties["searchbox"], "ComponentObject")){ // If there is a Searchbox Component Object
			var searchboxElement : Element = syiro.component.Fetch(properties["searchbox"]); // Fetch the Searchbox
			sidepaneContentElement.insertBefore(searchboxElement, sidepaneInnerListContent); // Insert the Searchbox before the Sidepane Inner Lists Content container
		}

		// #endregion

		// #region Items for Lists Container

		for (var item of properties["items"]){ // For each item in items
			var typeOfItem : string = syiro.utilities.TypeOfThing(item); // Get the type of this item
			var appendableElement : Element; // Define appendableElement as the Element we'll be appending

			if (typeOfItem == "ComponentObject"){ // If this item is a Syiro Component Object
				appendableElement = syiro.component.Fetch(item); // Define appendableItem as the fetched Syiro Component Element
			} else if (typeOfItem == "Element"){ // If it is an Element
				appendableElement = syiro.utilities.SanitizeHTML(item); // Set appendableElement as the sanitized Element provided
			}

			sidepaneInnerListContent.appendChild(appendableElement);
		}

		// #endregion

		syiro.data.Write(componentId + "->HTMLElement", componentElement);
		return { "id" : componentId, "type" : "sidepane"}; // Return a Sidepane Component Object
	}

	// #endregion

	// #region Gesture Functions

	export function GestureInit(){
		var componentElement = arguments[0].parentElement; // Define componentElement as the Sidepane Container of the Sidepane Edge
		var moveElement : any; // Define moveElement as the element we will be tracking movement for

		// #region Event Setting

		if (typeof arguments[1].touches !== "undefined"){ // If we are using touch events
			moveElement = arguments[0]; // Set the Sidepane Edge to the moveElement
		} else { // If we are using mouse events
			moveElement = document; // Track mousemove across the entire document
		}

		syiro.events.Add(syiro.events.eventStrings["move"], moveElement, syiro.sidepane.Drag.bind(this, arguments[0])); // Bind the Sidepane Edge and moveElement to the Drag function for "move"
		syiro.events.Add(syiro.events.eventStrings["up"], moveElement, syiro.sidepane.Release.bind(this, arguments[0])); // Bind the Sidepane Edge to Release function for "up"

		// #endregion

		componentElement.removeAttribute("data-syiro-animation"); // Remove the slide animation, sliding the Sidepane back into the edge.
		componentElement.setAttribute("data-syiro-render-animation", "false"); // Set render-animation to false so transition properties are not applied

		var sidepaneContentOverlay = document.body.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="sidepane"]'); // Fetch the contentOverlay Element
		syiro.component.CSS(sidepaneContentOverlay, "display", "block"); // Show the contentOverlay under the Sidepane
	}

	export function Drag(){
		var componentElement = arguments[0].parentElement; // Define componentElement as the Sidepane Container of the Sidepane Edge
		var eventData = arguments[2]; // Define eventData as the event data passed
		var mousePosition : number;
		var updatedSidepanePosition : number;

		if (typeof eventData.touches !== "undefined"){ // If Drag is being triggered by touchmove
			mousePosition = eventData.touches[0].screenX;
		} else { // If Drag is being triggered by mousemove
			 mousePosition = eventData.clientX; // Get from clientX since we may be using multiple monitors
		}

		updatedSidepanePosition = mousePosition- componentElement.offsetWidth; // Set updatedSidepanePosition to mousePosition minus the width of the Sidepane (including borders, padding, etc.)

		if (updatedSidepanePosition > 0){ // If the touch position is further on the right side that the Sidepane would usually "break" from the edge
			updatedSidepanePosition = 0; // Set left position to 0
		}

		syiro.component.CSS(componentElement, "transform", "translateX(" + updatedSidepanePosition.toString() + "px)");  // Use GPU accelerated translateX to set position of Sidepane
		syiro.component.CSS(componentElement, "-webkit-transform", "translateX(" + updatedSidepanePosition.toString() + "px)");  // Use GPU accelerated translateX to set position of Sidepane
	}

	export function Release(){
		var componentElement = arguments[0].parentElement; // Define componentElement as the Sidepane Container of the Sidepane Edge
		var component : ComponentObject = syiro.component.FetchComponentObject(arguments[0].parentElement); // Define component as the fetched Component Object
		var moveElement = arguments[1]; // Define moveElement as the third argument passed, the actual Element we are listening to
		var eventData : any = arguments[2]; // Define eventData as the event data passed

		syiro.sidepane.Toggle(component, eventData); // Call Sidepane Toggle w/ event data

		// #region Remove Events for Mouse / Touch Move + Up

		syiro.events.Remove(syiro.events.eventStrings["move"], moveElement); // Remove the "move" function
		syiro.events.Remove(syiro.events.eventStrings["up"], moveElement); // Remove the "up" function

		// #endregion
	}

	// #endregion

	// #region Toggle - This function will toggle the Sidepane and the content overlay

	export function Toggle(component : ComponentObject, eventData ?: any){
		if ((syiro.utilities.TypeOfThing(component) == "ComponentObject") && (component.type == "sidepane")){ // If this is a Component Object and indeed a Sidepane
			var componentElement = syiro.component.Fetch(component); // Fetch the Sidepane Element
			var sidepaneContentOverlay = document.body.querySelector('div[data-syiro-minor-component="overlay"][data-syiro-overlay-purpose="sidepane"]'); // Fetch the sidepaneContentOverlay Element
			var showSidepane : boolean = false; // Define showSidepane as a defaulted "false"

			if (componentElement.hasAttribute("data-syiro-animation") == false){ // If it does not have the animation attribute
				var currentTransformProperty : any = syiro.component.CSS(component, "transform"); // Get the current transform property

				if ((typeof eventData !== "undefined") && ((typeof eventData.changedTouches !== "undefined") || (typeof eventData.screenX !== "undefined"))){ // If eventData is defined and is either touch or mouse event
					var mousePosition : number;

					if (typeof eventData.changedTouches !== "undefined"){ // If we are getting data from a touch event
						mousePosition = eventData.changedTouches[0].screenX
					} else { // If we are getting it from a mouse event
						mousePosition = eventData.clientX; // Get from clientX instead, since we may be using multiple monitors
					}

					showSidepane = (mousePosition > (componentElement.clientWidth / 2)); // If we are going to show Sidepane or touchData was passed that has last pos at greater than 50% of Component Width, set showSidepane to true
				} else if (currentTransformProperty !== false){ // IF currentTransformProperty is not false, meaning transform is a valid existing CSS attribute
					var transformPosition : number = Number(currentTransformProperty.replace("translateX(-", "").replace("px)", "")); // Define transformPosition as the number after cleaning up the translateX string of the transform property

					showSidepane = (transformPosition < (componentElement.clientWidth / 2));// If the transformPosition is less than the client width (because moving left with decrease the transform, since the first transform is clientWidth and 100% showing Sidepane is 0, showSidepane is true
				} else if (typeof eventData == "undefined"){ // If touchdata is not defined (triggered programmatically)
					showSidepane = true;
				}
			}

			componentElement.removeAttribute("data-syiro-render-animation"); // Remove the property declaring to not render animation
			syiro.component.CSS(componentElement, "transform", ""); // Ensure there is no transform property
			syiro.component.CSS(componentElement, "-webkit-transform", ""); // Ensure there is no transform property

			if (showSidepane){ // If we are going to show the Sidepane
				syiro.animation.Slide(component); // Slide out the Sidepane
				syiro.component.CSS(sidepaneContentOverlay, "display", "block"); // Show the sidepaneContentOverlay under the Sidepane
			} else { // If we are going to hide the Sidepane
				syiro.animation.Reset(component); // Reset Animation properties in the Sidepane
				syiro.component.CSS(sidepaneContentOverlay, "display", ""); // Hide the sidepaneContentOverlay
			}
		}
	}

	// #endregion
}

// #endregion
