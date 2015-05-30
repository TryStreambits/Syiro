/*
 This is the module for the Syiro Sidepane Component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />
/// <reference path="utilities.ts" />

// #region Syiro Sidepane Functionality

module syiro.sidepane {

    // #region Generation

    export function Generate(properties : Object) : Object {
        var componentId : string = syiro.generator.IdGen("sidepane"); // Generate a Sidepane Component Id
        var componentElement : Element = syiro.utilities.ElementCreator("div", { "data-syiro-component-id" : componentId, "data-syiro-component" : "sidepane"}); // Generate an empty Sidepane
        var sidepaneContentElement : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "sidepane-content"}); // Generate an empty Sidepane Content div
        var sidepaneEdge : Element = syiro.utilities.ElementCreator("div", { "data-syiro-minor-component" : "sidepane-edge"}); // Generate an empty Sidepane Edge div

        componentElement.appendChild(sidepaneContentElement); // Append the content Element
        componentElement.appendChild(sidepaneEdge); // Append the edge Element

        for (var item of properties["items"]){ // For each item in items
            var appendableElement : Element; // Define appendableElement as the Element we'll be appending
            var isSyiroComponent = false; // Define isSyiroComponent as false

            if (syiro.component.IsComponentObject(item)){ // If this item is a Syiro Component
                appendableElement = syiro.component.Fetch(item); // Define appendableItem as the fetched Syiro Component Element
                isSyiroComponent = true; // Set isSyiroComponent to true
            }
            else if ((typeof item.nodeType !== "undefined") && (item.nodeType == 1)){ // If it is an appendableItem
                appendableElement = syiro.utilities.SanitizeHTML(item); // Set appendableElement as the sanitized Element provided
            }

            if (typeof appendableElement !== "undefined"){ // If the appendableElement is in fact an Element rather than undefined
                if (isSyiroComponent && (item["type"] == "searchbox")){ // If this is a Searchbox
                    if (sidepaneContentElement.querySelector('img:first-child') !== null){ // If there is a logo at the "top" of the Sidepane
                        sidepaneContentElement.insertBefore(appendableElement, sidepaneContentElement.childNodes[1]); // Append before the second child
                    }
                    else{
                        sidepaneContentElement.insertBefore(appendableElement, sidepaneContentElement.firstChild); // Prepend the Searchbox
                    }
                }
                else { // If appendableElement is not the Element of a Searchbox
                    if ((appendableElement.nodeName == "IMG") || (appendableElement.nodeName == "PICTURE") && (sidepaneContentElement.childNodes.length !== 0)){ // If this is an img or picture Element and the Sidepane is not currently empty
                        sidepaneContentElement.insertBefore(appendableElement, sidepaneContentElement.firstChild); // Prepend the img / logo Element
                    }
                    else{ // If it is not an img or picture Element
                        sidepaneContentElement.appendChild(appendableElement);
                    }
                }
            }
        }

        syiro.data.Write(componentId + "->HTMLElement", componentElement);
        return { "id" : componentId, "type" : "sidepane"}; // Return a Sidepane Component Object
    }

    // #endregion

    // #region Drag - This function will handle the dragging, positioning, and releases of touch

    export function Drag(){
        var componentElement = arguments[0]; // Define componentElement as the argument passed
        var eventData = arguments[2]; // Define eventData as the event data passed
        var touchXPosition = eventData.touches[0].screenX; // Define touchXPosition as the screenX position of the first Touch Object from touches
        var updatedSidepanePosition = (touchXPosition - componentElement.clientWidth); // Set updatedSidepanePosition to touchXPosition minus the width of the Sidepane

        if (updatedSidepanePosition > 0){ // If the touch position is further on the right side that the Sidepane would usually "break" from the edge
            updatedSidepanePosition = 0; // Set left position to 0
        }
        else if (touchXPosition <= 0){ // If the touch position is 0 or somehow less than that.
            updatedSidepanePosition = -200; // Set left position to -200
        }

        componentElement.style.left = updatedSidepanePosition.toString() + "px"; // Set the left position of the Sidepane
    }

    // #endregion

    // #region Gesture-Initialize Specific Function

    export function GestureInit(){
            var contentOverlay = document.body.querySelector('div[data-syiro-minor-component="overlay"]'); // Fetch the contentOverlay Element
            syiro.component.CSS(contentOverlay, "display", "block"); // Show the contentOverlay under the Sidepane
    }

    // #endregion

    // #region Toggle - This function will toggle the Sidepane and the content overlay

    export function Toggle(component : Object){
        if ((syiro.component.IsComponentObject(component)) && (component["type"] == "sidepane")){ // If this is a Component Object and indeed a Sidepane
            var componentElement = syiro.component.Fetch(component); // Fetch the Sidepane Element
            var contentOverlay = document.body.querySelector('div[data-syiro-minor-component="overlay"]'); // Fetch the contentOverlay Element
            var showSidepane : boolean = false; // Define showSidepane as a defaulted "false"

            if (componentElement.hasAttribute("data-syiro-animation") == false){ // If we are going to show Sidepane
                componentElement.setAttribute("data-syiro-animation", "slide"); // Set the slide animation
                syiro.component.CSS(componentElement, "left", "0px"); // Ensure left is set to 0px
                syiro.component.CSS(contentOverlay, "display", "block"); // Show the contentOverlay under the Sidepane
            }
            else{ // If it is already visible
                componentElement.removeAttribute("data-syiro-animation"); // Remove the slide animation, sliding the Sidepane back into the edge.
                syiro.component.CSS(componentElement, "left", false); // Ensure there is no left property
                syiro.component.CSS(contentOverlay, "display", false); // Hide the contentOverlay
            }
        }
    }

    // #endregion
}

// #endregion