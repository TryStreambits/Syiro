/*
	This is the namespace for animation in Syiro
*/

/// <reference path="interfaces/core.ts" />
/// <reference path="component.ts" />

namespace syiro.animation {

	// Animate
	// Animate a component with the provided AnimationOptions
	export function Animate(componentProvided : any, properties : AnimationOptions){ // This function animates a particular Component or Element and calls a post-animation function if applicable
		let component : ComponentObject = syiro.component.FetchComponentObject(componentProvided), element : any = syiro.component.Fetch(componentProvided); // Get the ComponentObject and Element

		if ((element !== null) && (typeof properties.animation == "string")){ // If the element exists in the DOM and an animation is provided
			if ((component.type == "button") && (element.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
				element = element.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
			}

			if (typeof properties.postAnimationFunc == "function"){ // If a postAnimationFunction is defined
				if ((typeof element.style["transition"] !== "undefined") || (typeof element.style["webkitTransition"] !== "undefined")){ // If transitionend Event is used
					let transitionEndFlag = "webkitTransitionEnd"; // Default to webkitTransitionEnd as the event listener

					if (typeof element.style["transition"] !== "undefined"){ // If the standard transition property is supported
						transitionEndFlag = "transitionend";
					}

					syiro.events.Add(transitionEndFlag, element,
						function(){
							let postAnimationFunction = arguments[0]; // Get the first arg as postAnimationFunction
							let transitionEndFlag = arguments[1]; // Get the second arg as the transitionEndFlag
							let element = arguments[2]; // Get the element as the third argument

							if (typeof postAnimationFunction == "function"){ // If postAnimationFunction was passed (as in, it existed in the first place)
								postAnimationFunction(element); // Call the postAnimation function
							}

							syiro.events.Remove(transitionEndFlag, element); // Remove all transitionend Events
						}.bind(this, properties.postAnimationFunc, transitionEndFlag)
					);
				} else {
					properties.postAnimationFunc.call(this, component); // Call with the component as the variable
				}
			}

			element.setAttribute("data-syiro-animation", properties.animation); // Add the animation to data-syiro-animation attribute
		}
	}

	// Reset
	// Remove Syiro Animation Properties from Components
	export function Reset(componentProvided : any){
		let component : ComponentObject = syiro.component.FetchComponentObject(componentProvided), componentElement : Element = syiro.component.Fetch(componentProvided); // Get the ComponentObject and Element

		if (syiro.utilities.TypeOfThing(componentElement, "Element")){ // If the componentElement exists in the DOM
			if ((component.type == "button") && (componentElement.getAttribute("data-syiro-component-type") == "toggle")){ // If we are animating a toggle button
				componentElement = componentElement.querySelector('div[data-syiro-minor-component="buttonToggle"]'); // Get the inner button toggle
			}

			componentElement.removeAttribute("data-syiro-animation"); // Remove the animation attribute
			componentElement.removeAttribute("data-syiro-animation-status"); // Remove the status attribute if it for some reason still exists
		}
	}

	// FadeIn
	// Fade in a Component
	export function FadeIn(component : any, postAnimationFunction ?: Function){
		syiro.animation.Animate(component, // Call Animate with the Component and properties
			{
				"animation" : "fade-in", // Define animation as fade-in-animation
				"postAnimationFunc" : postAnimationFunction // Define function as any postAnimationFunction defined
			}
		);
	}

	// FadeOut
	// Fade out a Component
	export function FadeOut(component : any, postAnimationFunction ?: Function){
		syiro.animation.Animate(component, // Call Animate with the Component and properties
			{
				"animation" : "fade-out", // Define animation as fade-out-animation
				"postAnimationFunc" : postAnimationFunction // Define function as any postAnimationFunction defined
			}
		);
	}


	// Slide
	// Slide a Component if it supports it
	export function Slide(component : any, postAnimationFunction ?: Function){
		syiro.animation.Animate(component, // Call Animate with the Component and properties
			{
				"animation" : "slide", // Define animation as slide
				"postAnimationFunc" : postAnimationFunction // Define function as any postAnimationFunction defined
			}
		);
	}
}