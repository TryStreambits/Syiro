/*
 This is the module for Rocket Header component.
 */

/// <reference path="core.ts" />

module rocket.header {

	// #region Function for setting the header's logo

	export function SetLogo(component : Object, image : string){ // Requires the component object and string of the image URL
		var headerElement : Element = rocket.core.Get(component); // Get the HTMLElement with Get()
		var imageElement : Element = headerElement.querySelector('img[data-rocket-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

		if (imageElement == null){ // If there is NOT already a logo in the header component
			imageElement = document.createElement("img"); // Create an imageElement
			imageElement.setAttribute("data-rocket-minor-component", "logo"); // Make sure it is a minor logo component
			headerElement.insertBefore(imageElement, headerElement.firstChild); // Prepend the logo component
		}

		imageElement.setAttribute("src", image); // Set the image source

		rocket.core.UpdateStoredComponent(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Function for removing the header's logo

	export function RemoveLogo(component : Object){ // Requires only the component object
		var headerElement : Element = rocket.core.Get(component); // Get the HTMLElement with Get()

		if (headerElement.querySelectorAll('img[data-rocket-minor-component="logo"]').length > 0){ // If the headerElement has a logo
			headerElement.removeChild(headerElement.firstChild); // Remove the image element (which has to be the first child in the Header component)
			rocket.core.UpdateStoredComponent(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

}