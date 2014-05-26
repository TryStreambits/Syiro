/// <reference path="jquery.d.ts" />

module Rocket {
	export function init(){ // Initialization function
		do {
			// Waiting
		} while ($ == undefined);

		$(document).ready(
			function(){
				$('div[data-rocket-component="list"]').on("click touchend MSPointerUp keydown.VK_ENTER", // For every list dropdown, create a click binding that shows or hides the dropdown
					function(e : JQueryEventObject){
						var $this = e.currentTarget;
						var currentDisplayValue = $($this).children('div[data-rocket-component="list-dropdown"]').css("display"); // Get the current display value

						if (currentDisplayValue !== "block"){ // If the list dropdown is currently hidden
							$('div[data-rocket-component="list-dropdown"]').hide(); // Hide all other dropdowns
							$($this).children('div[data-rocket-component="list-dropdown"]').show(); // Show the dropdown
						}
						else{ // If it is already shown when clicked
							$($this).children('div[data-rocket-component="list-dropdown"]').hide(); // Hide the dropdown
						}
					}
				);

				$(document).on("scroll", // Whenever the document is scrolled, make sure the list dropdowns are hidden
					function(){
						$('div[data-rocket-component="list-dropdown"]').fadeOut(250,
							function(e : JQueryEventObject){
								$('div[data-rocket-component="list-dropdown"]').hide();
							}
						);
					}
				);
			}
		);
	}

	// #region Rocket Component Meta Functions

	export class RocketComponentFunctions {

		constructor(){}

		componentExistsCheck(parentElement : HTMLElement, component : any){ // Check if a Rocket component (or tag) exists within the parentElement
			if (typeof component !== "string"){ // If the component is NOT a string (a.k.a not a tag)
				if (parentElement.innerHTML.indexOf(component.outerHTML) !== 1){ // If the parentElement has the component (validated by checking HTML)
					return true;
				}
				else{ // If it does NOT contain the component
					return false;
				}
			}
			else{ // If the component type IS a string
				if ((typeof parentElement.getElementsByTagName(component)) !== "object"){ // If the type of the returned getElementsByTagName is NOT an object (most likely NodeList)
					return true;
				}
				else{
					return false;
				}
			}
		}

		addComponent(prependOrAppend : string, parentElement : Element, component : Element){ // This function adds a component to the parent element
			if (prependOrAppend == "prepend"){ // If we are prepending the component
				parentElement.insertBefore(component, parentElement.firstChild); // Insert before the first component
			}
			else{ // If we are appending the component
				parentElement.appendChild(component); // Append
			}
		}

		removeComponent(parentElement : Element, component : any){ // This function removes a component from a parent element
			if (typeof component !== "string"){ // If the component is NOT a string, meaning it is an HTML element
				parentElement.removeChild(component);
			}
			else{ // If it is a string, meaning it is a tag
				parentElement.removeChild(parentElement.getElementsByTagName(component)[0]); // Remove the first component (tag)
			}
		}
	}

	// #endregion

	// #region Rocket Header Component

		export class Header extends RocketComponentFunctions{
			rocketComponent : HTMLElement; // rocketComponent defined as an HTMLElement

			constructor(rocketComponentSelector : string){ // Generates (or selects an existing) component based on the options provided.
				super();
				this.rocketComponent = $(rocketComponentSelector).get(0); // Leverage jQuery.get() to return an HTMLElement rather than our own boilerplating.
			}

			setLogo(src : string){ // Sets the header logo
				var headerLogoElement : HTMLElement; // Define headerLogoElement as an HTMLElement

				if (this.rocketComponent.querySelector('img [data-rocket-minor-component="logo"') == null){ // If it could not find an img element with the logo component
					headerLogoElement = document.createElement("img"); // Create a new HTML Element
					this.addComponent("prepend", this.rocketComponent, headerLogoElement); // Prepend the logo to the start of the header
				}

				headerLogoElement.setAttribute("data-rocket-component", "logo"); // Set
				headerLogoElement.setAttribute("src", src); // Set the src of the header logo img
			}

			removeLogo = this.removeComponent(this.rocketComponent, this.rocketComponent.querySelector('img [data-rocket-minor-component="logo"')); // removeLogo is a new function based on removeComponent

			add(type : string, component : HTMLElement){ // Add a searchbar or list component to the header
				if (type == ("list" || "searchbar")){
					this.addComponent("append", this.rocketComponent, component);
				}
			}

			remove(type : string, component : HTMLElement){ // Remove a search bar or list component from the header
				if (type == ("list" || "searchbar")){
					this.removeComponent(this.rocketComponent, component);
				}
			}
	}

	// #endregion

	// #region Rocket Footer Main Component

	export class Footer extends RocketComponentFunctions{
		rocketComponent : HTMLElement; // rocketComponent defined as an HTMLElement

		constructor(rocketComponentSelector : string){ // Generates (or selects an existing) footer based on the options provided.
			super();
			this.rocketComponent = $(rocketComponentSelector).get(0); // Leverage jQuery.get() to return an HTMLElement rather than our own boilerplating.
		}

		add(type : string, text : string, link ?: string, target ?: string){ // Set the text or add links to the footer
			if (type == "text"){
				var textTag : HTMLElement; // Define textTag as an HTML Element

				if (this.rocketComponent.querySelector("pre") == null){ // If the footer does NOT have the text tag
					textTag = document.createElement("pre"); // Create a new HTML Element (pre) and set it to the textTag
					this.addComponent("prepend", this.rocketComponent, textTag); // Prepend the text tag to the footer
				}
				else{
					textTag = this.rocketComponent.getElementsByTagName("pre")[0]; // Get the text tag
				}

				textTag.innerText = text; // Set the text of the pre tag
			}
			else if (type == "link"){
				if (target == undefined){ // If the target is undefined
					target = "_blank"; // Set the link to open in a new tab
				}

				var newLink : HTMLElement = document.createElement("a"); // Create a new link a tag
				newLink.setAttribute("href", link); // Set the href to the link URL
				newLink.setAttribute("target", target); // Set the target to the defined target
				newLink.innerText = text; // Set the text of the element

				this.addComponent("append", this.rocketComponent, newLink); // Add the new link
			}
		}

		remove(type : string, link ?: string){ // Remove the footer text or a link (based on the link href)
			var elementToRemove : any; // Define elementToRemove as the element we'll be removing from the footer

			if (type == "text"){ // If we are removing the footer text
				elementToRemove = "pre"; // Define elementToRemove as the pre tag
			}
			else{ // If we are removing a link
				var links = this.rocketComponent.getElementsByTagName("a"); // Get all the a tags within the footer

				for (var linkElement in links){ // Recursively search for an element with the href equal to what is defined
					var hrefValue = linkElement.attributes.getNamedItem("href").value; // Get the href value of the particular linkElement

					if (hrefValue == link){ // If the hrefValue is the same as the link provided
						elementToRemove = linkElement; // Define elementToRemove as this link element
					}
				}
			}

			if (elementToRemove !== undefined){ // If we are either removing the text or we found the link with the associated href
				this.removeComponent(this.rocketComponent, elementToRemove); // Remove the element
			}
		}
	}

	// #endregion

	// #region Rocket Button Main Component

	export class Button extends RocketComponentFunctions{
		rocketComponent : HTMLElement; // rocketComponent defined as an HTMLElement

		constructor(rocketComponentSelector : string){ // Generates (or selects an existing) component based on the options provided.
			super();
			this.rocketComponent = $(rocketComponentSelector).get(0); // Leverage jQuery.get() to return an HTMLElement rather than our own boilerplating.
		}

		listen(primaryCallback : Function, secondaryCallback ?: Function){ // Listener function that creates an event handle
			$(this.rocketComponent).on("click touchend MSPointerUp", { primaryFunction : primaryCallback, secondaryFunction : secondaryCallback},
				function(e : JQueryEventObject){
					var $rocketComponent = e.currentTarget; // Define $rocketComponent as the component that has been triggered

					var primaryFunction : Function = e.data["primaryFunction"];
					var secondaryFunction : Function = e.data["secondaryFunction"];

					if ($($rocketComponent).attr("data-rocket-component-type") == "toggle"){
						var toggleValue : string = $($rocketComponent).attr("data-rocket-component-status");
						var newToggleValue : string;

						if (toggleValue == "false"){ // If the CURRENT toggle value is FALSE
							newToggleValue = "true"; // Set the NEW toggle value to TRUE

							if (secondaryFunction !== undefined){ // If the secondary function is defined
								secondaryFunction(newToggleValue); // Call the secondary function
							}
							else{ // If the secondary function is NOT defined
								primaryFunction(newToggleValue); // Call the primary function
							}
						}
						else{ // If the CURRENT toggle value is TRUE
							newToggleValue = "false"; // Set the NEW toggle value to FALSE
							primaryFunction(newToggleValue);
						}

						$($rocketComponent).attr("data-rocket-component-status", newToggleValue); // Update the status
					}
					else{ // If the component is a basic button
						primaryFunction(); // Call the primary function
					}
				}
			);
		}
	}

	// #endregion

	// #region Rocket List Main Component

	export class List extends RocketComponentFunctions{ // List Components
		rocketComponent : HTMLElement; // rocketComponent defined as an HTMLElement
		listLabelSelector : string = 'div[data-rocket-component="list-label"]'; // Set listLabelSelector as the logical rocket component selector for the list's label
		listDropdownSelector : string = 'div[data-rocket-component="list-dropdown"]'; // Set listDropdownSelector as the logical rocket component selector for the list's dropdown


		constructor(rocketComponentSelector : string){ // Generates (or selects an existing) component based on the options provided.
			super();
			this.rocketComponent = $(rocketComponentSelector).get(0); // Leverage jQuery.get() to return an HTMLElement rather than our own boilerplating.
		}

		setLabelText(labelText : string){ // Function that sets the list label text
			var savedInternalLabelContent : string = ""; // Set the savedInternalLabelContent to any potential html we'll need to re-add to the label (mainly img)

			if ($(this.rocketComponent).children(this.listLabelSelector).children("img").length > 0){ // If an image exists
				savedInternalLabelContent = $(this.rocketComponent).children(this.listLabelSelector).children("img").get(0).outerHTML; // Fetch the avatar and save it's HTML
			}

			$(this.rocketComponent).children(this.listLabelSelector).html( // Change the listLabelSelector HTML
				savedInternalLabelContent + labelText // Set the list label to any IMG html and the text specified as labelText
			);
		}

		setLabelImage(imageSource : string){ // Function that sets the list label image
			if ($(this.rocketComponent).children(this.listLabelSelector).children("img").length > 0){ // If an image already exists
				$(this.rocketComponent).children(this.listLabelSelector).children("img").first().attr("src", imageSource); // Set the image source
			}
			else{ // If an image does NOT exist in the list's label
				var currentLabelText = $(this.rocketComponent).children(this.listLabelSelector).text(); // Get the current list label text
				$(this.rocketComponent).children(this.listLabelSelector).html( // Set the HTML of the list label to the image and existing label text
					'<img alt="" src="' + imageSource +'" />' + currentLabelText
				);
			}
		}

		addListItem(prependOrAppend : string, listItem : Element){ // Function that adds a list item
			var listDropdown = $(this.rocketComponent).children('div[data-rocket-component="list-dropdown"]').get(0); // Set listDropdown as the HTMLElement provided by .get() from the dropdown grabbed via selector
			this.addComponent(prependOrAppend, listDropdown, listItem); // Add the list item
		}

		removeListItem(listItem : Element){ // Function that removes a list item
			var listDropdown = $(this.rocketComponent).children('div[data-rocket-component="list-dropdown"]').get(0); // Set listDropdown as the HTMLElement provided by .get() from the dropdown grabbed via selector
			this.removeComponent(listDropdown, listItem); // Remove the list item
		}

		listen(rocketComponent : HTMLElement){
			Rocket.init(); // Do a re-initialization, jQuery will automatically add the dropdown listeners
		}
	}
}

var rocket = Rocket;