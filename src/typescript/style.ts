/*
	This is the namespace for style-orienteded functionality like CSS styling.
*/

/// <reference path="component.ts" />
/// <reference path="utilities.ts" />

namespace syiro.style {

    // GetObject
    // This function will get an Object equivelant to the CSS styling of the object in question.
    export function GetObject(component : any) : Object {
        var componentElement : HTMLElement = component; // Define componentElement as an Element, defaulting to component provided
        var typeOfComponent = syiro.utilities.TypeOfThing(component); // Get the type of the variable passed

        if (typeOfComponent == "ComponentObject"){ // If we were provided a Component Object
			componentElement = syiro.component.Fetch(component); // Fetch the Element and assign it to modifiableElement
		}

        return componentElement.style;
    }

    // Get
    // This function will get a CSS property value if it exists.
    export function Get(component : any, property : string) : string {
        var cssObjectOfComponent : Object = syiro.style.GetObject(component); // Get the CSS Object of the Component
        var camelCasedProperty : string = syiro.style.GetPropertyCamelCased(property); // Get the camelCased version of this property
        var propertyValue : string = cssObjectOfComponent[camelCasedProperty]; // Get the value of the property and set it to propertyValue

        if (!syiro.utilities.TypeOfThing(propertyValue, "string")){ // If propertyValue is not a string
            propertyValue = ""; // Change to an empty string
        }

        return propertyValue;
    }

    // GetPropertyCamelCased
    // This function will return a camel-cased version of the CSS property
    export function GetPropertyCamelCased(property : string) : string {
        var newPropertyString : string = property; // Set newPropertyString default to our property string
        var propertySections : Array<string> = property.split("-"); // Split based on -

        if (property !== "float"){ // Float is an exception to the rule
            if (propertySections.length > 1){ // If there are multiple sections
                newPropertyString = propertySections[0]; // Keep the first section normal

                for (var section of propertySections.slice(1)){ // For each section in propertySections after the first one
                    newPropertyString += (section.substr(0,1).toUpperCase() + section.substr(1)); // Append a string where the first char is capitalized
                }
            }
        } else { // If the property is float
            newPropertyString = "cssFloat"; // Change to cssFloat
        }

        return newPropertyString;
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

    // Set
    // This function will set the CSS property of an object
    // Returns if set was successful or not
    export function Set(component : any, property : string, value : string) : boolean {
        var setProperty : boolean = true; // Define whether we should set the style property of the component
        var typeOfComponent : string = syiro.utilities.TypeOfThing(component); // Get the type of the Component
        var componentElement : HTMLElement = component; // Define componentElement as an Element, defaulting to component

        if (typeOfComponent == "ComponentObject"){ // If this is a ComponentObject
            componentElement = syiro.component.Fetch(component); // Fetch the Element for the Component
        } else if ((typeOfComponent !== "ComponentObject") && (typeOfComponent !== "Element")){ // If it is NOT a ComponentObject OR an Element
            setProperty = false; // Redefine setProperty as false
        }

        if (setProperty && (syiro.utilities.TypeOfThing(value, "string"))){ // if we should set the property and value is string
            var propertySetter : Function = function(setterComponentElement : HTMLElement, property : string, value : string){ // Define propertySetter as the main setter functionality
                var cssObjectOfComponent : Object = syiro.style.GetObject(setterComponentElement); // Get the CSS object of the Element
                var camelCasedProperty : string = syiro.style.GetPropertyCamelCased(property); // Get the camelCased version of this property

                setterComponentElement.style[camelCasedProperty] = value.replace("!important", "").trim(); // Set property to a sane value
            }.bind(this, componentElement, property, value);

            syiro.utilities.Run(propertySetter); // Run optimized
        }

        return setProperty;
    }
}