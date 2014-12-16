/*
    This is the module for animation in Syiro
*/

/// <reference path="interfaces.ts" />

// #region Syiro Animation System

module syiro.animation {

    // #region Component Animation Function
    export function Animate(component : Object, properties : Object){ // This function animates a particular Component and calls a post-animation function if applicable
        var componentElement : Element = syiro.component.Fetch(component); // Get the Syiro Component Element

        if ((componentElement !== null) && (typeof properties["animation"] == "string")){ // If the componentElement exists in the DOM and an animation is provided
            if (typeof properties["duration"] == "undefined"){ // If a duration is not defined
                properties["duration"] = 250; // Set to 250ms
            }

            var postAnimationFunction : Function = properties["function"]; // Define any function passed in properties as postAnimationFunction

            if (typeof properties["function"] !== "undefined"){ // If a function is defined
                var elementTimeoutId = window.setTimeout( // Create a timeout that calls our handler function after 250 (after the animation is "played")
                    function(){
                        var component : Object = arguments[0]; // Get the component that was passed to this function as a bound argument
                        var componentElement : Element = syiro.component.Fetch(component); // Get the Syiro Component Element based on the component Object we passed
                        var postAnimationFunction : Function = arguments[1]; // Get the postAnimationFunction (if applicable)

                        var timeoutId = componentElement.getAttribute("data-syiro-animationTimeout-id"); // Get the animationTimeout ID

                        componentElement.removeAttribute("data-syiro-animationTimeout-id"); // Remove the animationTimeout ID attribute
                        window.clearTimeout(Number(timeoutId)); // Convert the ID from string to Int and clear the timeout

                        postAnimationFunction(component); // Call the postAnimationFunction (which we pass the Syiro Component Object)
                    }.bind(syiro, component, postAnimationFunction) // Attach the Syiro Component Object and postAnimationFunction
                , properties["duration"]);

                componentElement.setAttribute("data-syiro-animationTimeout-id", elementTimeoutId.toString()); // Set the animationTimeout ID to the string form of the timeout ID
            }

            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
            }

            componentElement.setAttribute("class", properties["animation"]); // Add the animation
        }
    }

    // #endregion

    // #region Fade In Animation

    export function FadeIn(component : Object, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, // Call Animate with the Component and properties
            {
                "animation" : "fade-in-animation", // Define animation as fade-in-animation
                "duration" : 125, // Define duration as 125ms
                "function" : postAnimationFunction // Define function as any postAnimationFunction defined
            }
        );
    }

    // #endregion

    // #region Fade Out Animation

    export function FadeOut(component : Object, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, // Call Animate with the Component and properties
            {
                "animation" : "fade-out-animation", // Define animation as fade-out-animation
                "duration" : 125, // Define duration as 125ms
                "function" : postAnimationFunction // Define function as any postAnimationFunction defined
            }
        );
    }

    // #endregion

}
