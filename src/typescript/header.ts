/*
 This is the module for Syiro Header component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

module syiro.header {

	// #region Header Generation

	export function Generate(properties : Object) : Object { // Generate a Header Component and return a Component Object
		var componentId : string = syiro.generator.IdGen("header"); // Generate a component Id
		var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "header", { "role" : "navigation" }); // Generate a Header Element with the role of "navigation" (for ARIA) since the Header is typically used for navigational items

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "items"){ // If we are adding items to the Header
				for (var individualItemIndex in properties["items"]){ // For each individualItem in navigationItems Object array
					var individualItem : Object = properties["items"][individualItemIndex]; // Define individualItem as this particular item in the properties["items"]

					if (typeof individualItem["component"] !== "undefined"){ // If we are adding a Component (defining the Component object using the "component" key in individual items is a backwards-compatibility check)
						individualItem = individualItem["component"]; // Redefine individualItem as the individualItem component key/val
					}

					if (syiro.component.IsComponentObject(individualItem) == false){ // If we are adding a link
						var generatedElement : HTMLElement = syiro.generator.ElementCreator("a", // Generate a generic link element
							{
								"href" : individualItem["link"], // Set the href (link)
								"content" : individualItem["content"] // Also set the inner content of the <a> tag to title
							}
						);

						componentElement.appendChild(generatedElement); // Append the component to the parent component element
					}
					else{ // If we are not adding a link
						if (syiro.component.IsComponentObject(individualItem)){ // If we are adding a Syiro Component
							componentElement.appendChild(syiro.component.Fetch(individualItem)); // Append the HTMLElement fetched from syiro.component.Fetch(dropdownComponent)
						}
					}
				}
			}
			else if (propertyKey == "logo"){ // If we are adding a Logo to the Header
				var generatedElement : HTMLElement = syiro.generator.ElementCreator("img",
					{
						"data-syiro-minor-component" : "logo", // Set the minor component to logo
						"src" : properties["logo"] // Set the src to the one provided as the value of "logo"
					}
				);

				componentElement.appendChild(generatedElement); // Append the logo to the header
			}
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component

		return { "id" : componentId, "type" : "header" }; // Return a Component Object
	}

	// #endregion

	// #region Function for setting the header's logo

	export function SetLogo(component : Object, image : string){ // Requires the component object and string of the image URL
		var headerElement : Element = syiro.component.Fetch(component); // Get the HTMLElement with Get()
		var imageElement : Element = headerElement.querySelector('img[data-syiro-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

		if (imageElement == null){ // If there is NOT already a logo in the header component
			imageElement = syiro.generator.ElementCreator("img", { "data-syiro-minor-component" : "logo", "src" : image }); // Create an imageElement
			headerElement.insertBefore(imageElement, headerElement.firstChild); // Prepend the logo component
		}
		else{ // If the image element is already defined
			imageElement.setAttribute("src", image); // Set the image source
		}

		syiro.component.Update(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Function for removing the header's logo

	export function RemoveLogo(component : Object){ // Requires only the component object
		var headerElement : Element = syiro.component.Fetch(component); // Get the HTMLElement with Get()

		if (headerElement.querySelectorAll('img[data-syiro-minor-component="logo"]').length > 0){ // If the headerElement has a logo
			headerElement.removeChild(headerElement.firstChild); // Remove the image element (which has to be the first child in the Header component)
			syiro.component.Update(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

}
