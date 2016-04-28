/*
    This is the namespace for the Syiro Picture component.
*/
/// <reference path="../interfaces/picture.ts" />
/// <reference path="../component.ts" />
/// <reference path="../utilities.ts" />

namespace syiro.picture {

    // New
    // Create a Picture
    export function New(properties : PicturePropertiesObject) : ComponentObject {
        let component : ComponentObject = { "id" : "", "type" : "picture" }; // Define component as an empty-id Component Object

        if (syiro.utilities.TypeOfThing(properties.default, "string")){ // If a default string is provided
            component.id = syiro.component.IdGen("picture"); // Generate an Id and set it to the componentId
            let componentElement : Element = syiro.utilities.ElementCreator("div", { // Generate the Picture Component container
                "data-syiro-component-id" : component.id,
                "data-syiro-component" : component.type
            });

            let innerComponentImage : HTMLImageElement = document.createElement("img"); // Create the inner img Element
            componentElement.appendChild(innerComponentImage); // Add the image to the componentElement container

            for (let dimension of ["height", "width"]) { // For height and width in array
    			let dimensionValue : any = properties[dimension];
    			let typeOfDimensionValue : string = syiro.utilities.TypeOfThing(dimensionValue); // Get the type of this dimension

    			if (typeOfDimensionValue !== "undefined"){ // If the value of the dimension is defined
    				if (typeOfDimensionValue == "number"){ // If the dimension value is a number
    					dimensionValue = dimensionValue.toString() + "px"; // Change to string and append px
    				}

    				syiro.style.Set(componentElement, dimension, dimensionValue); // Set the height or width of the componentElement
                    delete properties[dimension]; // Remove this dimension from properties
    			}
    		}

            syiro.data.Write(component.id, properties); // Write our properties to component.id
            syiro.data.Write(component.id + "->HTMLElement", componentElement); // Write the HTMLElement to the componentElement
        }

        return component;
    }

    // Detect
    // This function is responsible for checking if source changing is necessary and doing the appropriate action.
    export function Detect(component : ComponentObject){
        let componentElement : HTMLElement = syiro.component.Fetch(component); // Get the Component Element
        let pictureInnerImage : Element = componentElement.querySelector("img"); // Get the inner image Element

        let existingSource : string = pictureInnerImage.getAttribute("src"); // Get the src
        let newSource : string = syiro.data.Read(component.id + "->default"); // Default newSource (the source we'll apply) as default value
        let sources : QuerySource[] = syiro.data.Read(component.id + "->sources"); // Get any defined sources

        if (syiro.utilities.TypeOfThing(sources, "Array")){ // If sources is an Array
            for (let querySource of sources){ // For each querySource of sources
                if (window.matchMedia(querySource.mediaQuery).matches){ // If the querySelector
                    newSource = querySource.source; // Set the newSource to the querySource source
                    break;
                }
            }
        }

        if (newSource !== existingSource){ // If we are changing sources
            pictureInnerImage.setAttribute("src", newSource); // Define src as newSource
            syiro.component.Update(component.id, componentElement); // Update the stored HTMLElement if necessary
        }
    }

    // AddQuerySource
    // Add a QuerySource
    export function AddQuerySource(component : ComponentObject, querySource : QuerySource) : void {
        let existingSources : QuerySource[] = syiro.data.Read(component.id + "->sources"); // Define existingSources as the read sources of this Component

        if (!syiro.utilities.TypeOfThing(existingSources, "Array")){ // If existingSources is not an Array
            existingSources = []; // Set existingSources to an empty array
        }

        existingSources.push(querySource); // Push this querySource
        syiro.data.Write(component.id + "->sources", existingSources); // Update the sources of this Component
    }

    // RemoveQuerySource
    // Remove a QuerySource
    export function RemoveQuerySource(component : ComponentObject, querySource : QuerySource) : void {
        let existingSources : QuerySource[] = syiro.data.Read(component.id + "->sources"); // Define existingSources as the read sources of this Component

        if (syiro.utilities.TypeOfThing(existingSources, "Array")){ // If existingSources is an Array
            let indexOfQuerySource : number = existingSources.indexOf(querySource); // Get the index of the querySource

            if (indexOfQuerySource == 0){ // If the querySource is the first item in the Array
                existingSources.shift(); // Remove the first item
            } else if (indexOfQuerySource > 0){ // If it isn't the first item
                existingSources = existingSources.slice(0, indexOfQuerySource).concat(existingSources.slice(indexOfQuerySource + 1)); // Get the beginning Array and concat the slice after the querySource
            }

            syiro.data.Write(component.id + "->sources", existingSources); // Update the sources of this Component
        }
    }
}