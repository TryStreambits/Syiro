/*
    This is the module for animation in Syiro
*/

/// <reference path="component.ts" />
/// <reference path="interfaces.ts" />

// #region Syiro Animation System

module syiro.animation {

    // #region Component Animation Function
    export function Animate(component : any, properties : Object){ // This function animates a particular Component or Element and calls a post-animation function if applicable
        var componentElement : Element; // Define componentElement as any

        if (syiro.component.IsComponentObject(component)){ // If we passed a Component
            componentElement = syiro.component.Fetch(component); //  Define componentElement as the fetched Syiro Component
        }
        else{ // If we passed an Element
            componentElement = component; // Define componentElement as the component provided
            component = syiro.component.FetchComponentObject(componentElement); // Redefine component as the newly fetched Component Object of the componentElement
        }

        if ((componentElement !== null) && (typeof properties["animation"] == "string")){ // If the componentElement exists in the DOM and an animation is provided
            var transitionEndUsed = false; // Default transitionEndUsed to false to indicate whether or not we should immediately trigger function or wait until transition end

            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
                tempElement = null; // Free tempElement
            }

            if ((typeof ontransitionend !== "undefined") || (typeof webkitTransitionEnd !== "undefined")){ // If the transitionend function is supported
                transitionEndUsed = true; // transitionend Event is utilized
                var transitionEndFlag = "webkitTransitionEnd"; // Default to webkitTransitionEnd as the event listener

                if (typeof ontransitionend !== "undefined"){ // If the standard ontransitionend Event is supported
                    transitionEndFlag = "transitionend";
                }

                syiro.events.Add(componentElement, transitionEndFlag,
                    function(){
                        var postAnimationFunction = arguments[0]; // Get the first arg as postAnimationFunction
                        var element = arguments[1]; // Get the element as the second argument
                        element.removeAttribute("data-syiro-animation-status"); // Remove the animation status

                        if (typeof postAnimationFunction !== "undefined"){ // If postAnimationFunction was passed (as in, it existed in the first place)
                            postAnimationFunction(element); // Call the postAnimation function
                        }
                    }.bind(this, postAnimationFunction)
                );
            }

            componentElement.setAttribute("data-syiro-animation-status", "active"); // Declare that we have an active animation
            componentElement.setAttribute("data-syiro-animation", properties["animation"]); // Add the animation to data-syiro-animation attribute

            var postAnimationFunction : Function = properties["function"]; // Define any function passed in properties as postAnimationFunction

            if (transitionEndUsed == false){ // If transitionend Event is not used
                if (typeof properties["function"] !== "undefined"){ // If a function was provided
                    properties["function"].call(this, component); // Call with the component as the variable
                }

                componentElement.removeAttribute("data-syiro-animation-status"); // Remove the animation status
            }
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

    // #region Pulse Animation

    //export function Pulse

}
