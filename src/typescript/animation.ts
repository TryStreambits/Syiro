/*
    This is the module for animation in Syiro
*/

/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

// #region Syiro Animation System

module syiro.animation {

    // #region Component Animation Function
    export function Animate(component : any, properties : Object){ // This function animates a particular Component or Element and calls a post-animation function if applicable
        var componentElement : any; // Define componentElement as any

        if (syiro.component.IsComponentObject(component)){ // If we passed a Component
            componentElement = syiro.component.Fetch(component); //  Define componentElement as the fetched Syiro Component
        }
        else{ // If we passed an Element
            componentElement = component; // Define componentElement as the component provided
            component = syiro.component.FetchComponentObject(componentElement); // Redefine component as the newly fetched Component Object of the componentElement
        }

        if ((componentElement !== null) && (typeof properties["animation"] == "string")){ // If the componentElement exists in the DOM and an animation is provided
            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
                tempElement = null; // Free tempElement
            }

            componentElement.setAttribute("data-syiro-animation", properties["animation"]); // Add the animation to data-syiro-animation attribute

            var postAnimationFunction : Function = properties["function"]; // Define any function passed in properties as postAnimationFunction

            if (typeof postAnimationFunction !== "undefined"){ // If a postAnimationFunction is defined
                var transitionEndUsed = false; // Default transitionEndUsed to false to indicate whether or not we should immediately trigger function or wait until transition end

                if ((typeof componentElement.style["transition"] !== "undefined") || (typeof componentElement.style["webkitTransition"] !== "undefined")){ // If CSS3 Transitions are supported
                    transitionEndUsed = true; // transitionend Event is utilized
                    var transitionEndFlag = "webkitTransitionEnd"; // Default to webkitTransitionEnd as the event listener

                    if (typeof componentElement.style["transition"] !== "undefined"){ // If the standard transition property is supported
                        transitionEndFlag = "transitionend";
                    }
                }

                if (transitionEndUsed == true){ // If transitionend Event is used
                    syiro.events.Add(componentElement, transitionEndFlag,
                        function(){
                            var postAnimationFunction = arguments[0]; // Get the first arg as postAnimationFunction
                            var element = arguments[1]; // Get the element as the second argument

                            if (typeof postAnimationFunction !== "undefined"){ // If postAnimationFunction was passed (as in, it existed in the first place)
                                postAnimationFunction(element); // Call the postAnimation function
                            }
                        }.bind(this, postAnimationFunction)
                    );
                }
                else {
                    properties["function"].call(this, component); // Call with the component as the variable
                }
            }
        }
    }

    // #endregion

    // #region Reset - Remove Syiro Animation Properties from Components

    export function Reset(component : any){
        var componentElement : Element; // Define componentElement as any

        if (syiro.component.IsComponentObject(component)){ // If we passed a Component
            componentElement = syiro.component.Fetch(component); //  Define componentElement as the fetched Syiro Component
        }
        else{ // If we passed an Element
            componentElement = component; // Define componentElement as the component provided
            component = syiro.component.FetchComponentObject(componentElement); // Redefine component as the newly fetched Component Object of the componentElement
        }

        if (componentElement !== null){ // If the componentElement exists in the DOM
            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
                tempElement = null; // Free tempElement
            }

            componentElement.removeAttribute("data-syiro-animation"); // Remove the animation attribute
            componentElement.removeAttribute("data-syiro-animation-status"); // Remove the status attribute if it for some reason still exists
        }
    }

    // #endregion

    // #region Fade In Animation

    export function FadeIn(component : any, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, // Call Animate with the Component and properties
            {
                "animation" : "fade-in", // Define animation as fade-in-animation
                "function" : postAnimationFunction // Define function as any postAnimationFunction defined
            }
        );
    }

    // #endregion

    // #region Fade Out Animation

    export function FadeOut(component : any, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, // Call Animate with the Component and properties
            {
                "animation" : "fade-out", // Define animation as fade-out-animation
                "function" : postAnimationFunction // Define function as any postAnimationFunction defined
            }
        );
    }

    // #endregion

    // #region Slide Animation

    export function Slide(component : any, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, // Call Animate with the Component and properties
            {
                "animation" : "slide", // Define animation as slide
                "function" : postAnimationFunction // Define function as any postAnimationFunction defined
            }
        );
    }

    // #endregion

}
