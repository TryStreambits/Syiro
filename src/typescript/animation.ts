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

                        var timeoutId = syiro.data.Read(component["id"] + "->AnimationTimeoutId"); // Get the animationTimeout ID
                        syiro.data.Delete(component["id"] + "->AnimationTimeoutId"); // Delete the Animation TImeout ID
                        window.clearTimeout(timeoutId); // Convert the ID from string to Int and clear the timeout

                        postAnimationFunction(component); // Call the postAnimationFunction (which we pass the Syiro Component Object)
                    }.bind(syiro, component, postAnimationFunction) // Attach the Syiro Component Object and postAnimationFunction
                , properties["duration"]);

                syiro.data.Write(component["id"] + "->AnimationTimeoutId", elementTimeoutId); // WRite the Animation Timeout Id to syiro.data for the Component
            }

            if ((component["type"] == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
                var tempElement = componentElement; // Define tempElement as the componentElement
                componentElement = tempElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
                tempElement = null; // Free tempElement
            }

            componentElement.setAttribute("class", properties["animation"]); // Add the animation
        }
    }

    // #endregion

    // #region Fade In Animation

    export function FadeIn(component : any, postAnimationFunction ?: Function){
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

    export function FadeOut(component : any, postAnimationFunction ?: Function){
        syiro.animation.Animate(component, // Call Animate with the Component and properties
            {
                "animation" : "fade-out-animation", // Define animation as fade-out-animation
                "duration" : 125, // Define duration as 125ms
                "function" : postAnimationFunction // Define function as any postAnimationFunction defined
            }
        );
    }

    // #endregion

    // #region Pulse Animation

    //export function Pulse

}
