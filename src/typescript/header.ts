/*
 This is the module for Rocket Header component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

module rocket.header {

	// #region Function for setting the header's logo

	export function SetLogo(component : Object, image : string){ // Requires the component object and string of the image URL
		var headerElement : Element = rocket.component.Fetch(component); // Get the HTMLElement with Get()
		var imageElement : Element = headerElement.querySelector('img[data-rocket-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

		if (imageElement == null){ // If there is NOT already a logo in the header component
			imageElement = rocket.generator.ElementCreator(null, "img", // Create an imageElement
				{
					"data-rocket-minor-component" : "logo", // Make sure it is a minor logo component
					"src" : image // Set the image source
				}
			);

			headerElement.insertBefore(imageElement, headerElement.firstChild); // Prepend the logo component
		}
		else{ // If the image element is already defined
			imageElement.setAttribute("src", image); // Set the image source
		}

		rocket.component.Update(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Function for removing the header's logo

	export function RemoveLogo(component : Object){ // Requires only the component object
		var headerElement : Element = rocket.component.Fetch(component); // Get the HTMLElement with Get()

		if (headerElement.querySelectorAll('img[data-rocket-minor-component="logo"]').length > 0){ // If the headerElement has a logo
			headerElement.removeChild(headerElement.firstChild); // Remove the image element (which has to be the first child in the Header component)
			rocket.component.Update(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

}
