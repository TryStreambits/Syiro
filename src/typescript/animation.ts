/*
    This is the module for animation in Syiro
*/

/// <reference path="interfaces.ts" />

// #region Syiro Animation System

module syiro.animation {

    // #region Component Animation Function

    export function Animate(component : Object, animation : string, postAnimationFunction ?: Function){ // This function animates a particular Component and calls a post-animation function if applicable
        var componentElement : Element = syiro.component.Fetch(component); // Get the Syiro Component Element

        if (componentElement !== null){ // If the componentElement exists in the DOM
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
            ,250);

            componentElement.setAttribute("data-syiro-animationTimeout-id", elementTimeoutId.toString()); // Set the animationTimeout ID to the string form of the timeout ID

            if (component["type"] == "dropdown"){ // If the component is a Dropdown
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-component="list"]'); // Change the Element from Dropdown to the Dropdown inner List for the animation
            }
            else if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
            }

            componentElement.setAttribute("class", animation); // Add the animation
        }
    }

    // #endregion

    // #region Fade In Animation

    export function FadeIn(component : Object, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, "fade-in-animation", postAnimationFunction); // Simply call Animate, which is where the animation logic is.
    }

    // #endregion

    // #region Fade Out Animation

    export function FadeOut(component : Object, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, "fade-out-animation", postAnimationFunction); // Simply call Animate, which is where the animation logic is.
    }

    // #endregion

}
