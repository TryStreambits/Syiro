/*
	This is the namespace for style-orienteded functionality like CSS styling.
*/

/// <reference path="component.ts" />
/// <reference path="utilities.ts" />

namespace syiro.style {

    // GetObject
    // This function will get an Object equivelant to the CSS styling of the object in question.
    export function GetObject(component : any) : Object {
        var cssObject : Object = {}; // Define cssObject as the Object containing CSS style properties / values
        var componentElement : Element = component; // Define componentElement as an Element, defaulting to component provided
        var typeOfComponent = syiro.utilities.TypeOfThing(component); // Get the type of the variable passed

        if (typeOfComponent == "ComponentObject"){ // If we were provided a Component Object
			componentElement = syiro.component.Fetch(component); // Fetch the Element and assign it to modifiableElement
		}

        var currentElementStyling : string = ""; // Define currentElementStyling as a string, defaulting to empty

        if (componentElement.hasAttribute("style")){ // If this componentElement has applied style already
            currentElementStyling = componentElement.getAttribute("style"); // Get to the value of style
        }

        if (syiro.utilities.TypeOfThing(currentElementStyling, "string")){ // If the modifiableElement has the style attribute
            var currentElementStylingArray = currentElementStyling.split(";"); // Split currentElementStyling into an array where the separator is the semi-colon

            for (var styleKey in currentElementStylingArray){ // For each CSS property / value in the styling
                var cssPropertyValue = currentElementStylingArray[styleKey].replace(" ", ""); // Define cssPropertyValue as this index in currentElementStylingArray, replacing whitespace
                if (cssPropertyValue !== ""){ // If the array item value is not empty
                    var propertyValueArray = cssPropertyValue.split(":"); // Split the propery / value based on the colon to an array
                    cssObject[propertyValueArray[0]] = propertyValueArray[1]; // Add it as a key/val in the elementStylingObject
                }
            }
        }

        return cssObject;
    }

    // Get
    // This function will get a CSS property value if it exists.
    export function Get(component : any, property : string) : string {
        var cssObjectOfComponent : Object = syiro.style.GetObject(component); // Get the CSS Object of the Component
        var propertyValue : string = cssObjectOfComponent[property]; // Get the value of the property and set it to propertyValue

        if (!syiro.utilities.TypeOfThing(propertyValue, "string")){ // If propertyValue is not a string
            propertyValue = ""; // Change to an empty string
        }

        return propertyValue;
    }

    // LoadColors
	// CSS Color to Typescript Variable

	export function LoadColors() {
		var syiroInternalColorContainer : Element = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "internalColorContainer"});
		document.body.appendChild(syiroInternalColorContainer);

		var syiroInternalColorStyle = window.getComputedStyle(syiroInternalColorContainer);
		syiro.backgroundColor = syiroInternalColorStyle.backgroundColor; // Get the backgroundColor defined in CSS and set it to syiro.backgroundColor
		syiro.primaryColor = syiroInternalColorStyle.color; // Get the primaryColor defined in CSS as color key/val and set it to syiro.primaryColor
		syiro.secondaryColor = syiroInternalColorStyle.borderColor; // Get the secondaryColor defined in CSS as border-color key/val and set it to syiro.secondaryColor
		document.body.removeChild(syiroInternalColorContainer); // Remove the no longer necessary Internal Color Container
	}

	// #endregion

    // Set
    // This function will set the CSS property of an object
    // Returns if set was successful or not
    export function Set(component : any, property : string, value : string) : boolean {
        var setProperty : boolean = true; // Define whether we should set the style property of the component
        var typeOfComponent : string = syiro.utilities.TypeOfThing(component); // Get the type of the Component
        var componentElement : Element = component; // Define componentElement as an Element, defaulting to component

        if (typeOfComponent == "ComponentObject"){ // If this is a ComponentObject
            componentElement = syiro.component.Fetch(component); // Fetch the Element for the Component
        } else if ((typeOfComponent !== "ComponentObject") && (typeOfComponent !== "Element")){ // If it is NOT a ComponentObject OR an Element
            setProperty = false; // Redefine setProperty as false
        }

        if (setProperty){ // if we should set the property
            var propertySetter : Function = function(setterComponentElement : Element, property : string, value : string){ // Define propertySetter as the main setter functionality
                var cssObjectOfComponent : Object = syiro.style.GetObject(setterComponentElement); // Get the CSS object of the Element
                cssObjectOfComponent[property] = value; // Set the property in cssObjectOfComponent to value

                var updatedCSSStyle : string = ""; // Define updatedCSSStyle as the new style we will apply

				for (var cssProperty in cssObjectOfComponent){ // For each CSS property / value in the elementStylingObject
					if (cssObjectOfComponent[cssProperty] !== ""){ // If the value is not an empty string
						updatedCSSStyle = updatedCSSStyle + cssProperty + ": " + cssObjectOfComponent[cssProperty] + ";"; // Append the property + value to the updatedCSSStyle and ensure we have closing semi-colon
					}
				}

				if (updatedCSSStyle.length !== 0){ // If the styling is not empty
					setterComponentElement.setAttribute("style", updatedCSSStyle); // Set the style attribute
				} else { // If the styling is empty
					setterComponentElement.removeAttribute("style"); // Remove the style attribute
				}
            }.bind(this, componentElement, property, value);

            syiro.utilities.Run(propertySetter); // Run optimized
        }

        return setProperty;
    }
}