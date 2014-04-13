/// <reference path="jquery.d.ts" />

class Rocket {
	thisClass : any;
	thisPage = document.getElementsByTagName("body")[0]; // Define thisPage as the body tag

	constructor(){
		this.rocketCallbacks = {}; // Create a new rocketCallbacks Object
	}

	init(){ // Initialization function
		do {
			// Waiting
		} while ($ == undefined);

		$(document).ready(
			function(){
				$('div[data-rocket-component="list"]').on("click touchend MSPointerUp keydown.VK_ENTER", // For every list dropdown, create a click binding that shows or hides the dropdown
					function(){
						var currentDisplayValue = $(this).children('div[data-rocket-component="list-dropdown"]').css("display"); // Get the current display value

						if (currentDisplayValue !== "block"){ // If the list dropdown is currently hidden
							$('div[data-rocket-component="list-dropdown"]').hide(); // Hide all other dropdowns
							$(this).children('div[data-rocket-component="list-dropdown"]').show(); // Show the dropdown
						}
						else{ // If it is already shown when clicked
							$(this).children('div[data-rocket-component="list-dropdown"]').hide(); // Hide the dropdown
						}
					}
				);

				$(document).on("scroll", // Whenever the document is scrolled, make sure the list dropdowns are hidden
					function(){
						$('div[data-rocket-component="list-dropdown"]').fadeOut(250,
							function(){
								$(this).hide();
							}
						);
					}
				);
			}
		);
	}

	// #region Callbacks Registry

	rocketCallbacks : Object; // Define rocketCallbacks as an object to hold developer-defined functions from different Rocket components

	addCallback(componentRegister : string, componentElement : HTMLElement, componentFunction : Function, secondaryFunction ?: Function){ // Function to add a callback to the registry
		var thisComponentRegisterObject = { // Create a component register object to be added to the rocketCallbacks
			"element" : componentElement,
			"primary function" : componentFunction
		};

		if (secondaryFunction !== undefined){ // If a secondary function is defined (ex. for a toggle button)
			thisComponentRegisterObject["secondary function"] = secondaryFunction; // Define the secondary function as the one defined
		}

		this.rocketCallbacks[componentRegister] = thisComponentRegisterObject; // Add the component to the registry with the component registry info
	}

	removeCallback(componentRegister : string){ // Function to remove / nullify the registered callback
		this.rocketCallbacks[componentRegister] == undefined; // Declare as undefined
	}

	// #endregion

	// #region Component Meta Functions

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

	addComponent(prependOrAppend : string, parentElement : HTMLElement, component : Element){ // This function adds a component to the parent element
		if (prependOrAppend == "prepend"){ // If we are prepending the component
			parentElement.insertBefore(component, parentElement.firstChild); // Insert before the first component
		}
		else{ // If we are appending the component
			parentElement.appendChild(component); // Append
		}
	}

	removeComponent(parentElement : HTMLElement, component : any){ // This function removes a component from a parent element
		if (typeof component !== "string"){ // If the component is NOT a string, meaning it is an HTML element
			parentElement.removeChild(component);
		}
		else{ // If it is a string, meaning it is a tag
			parentElement.removeChild(parentElement.getElementsByTagName(component)[0]); // Remove the first component (tag)
		}
	}

	// #endregion

	// #region Rocket Header Main Component

	Header(rocketComponent : HTMLElement){ // Generates (or selects an existing) footer based on the options provided.

		function setLogo(src : string){ // Sets the header logo
			var headerLogoElement : HTMLElement; // Define headerLogoElement as an HTMLElement

			if (rocketComponent.querySelector('img [data-rocket-minor-component="logo"') == null){ // If it could not find an img element with the logo component
				headerLogoElement = document.createElement("img"); // Create a new HTML Element
				this.addComponent("prepend", rocketComponent, headerLogoElement); // Prepend the logo to the start of the header
			}

			headerLogoElement.setAttribute("data-rocket-component", "logo"); // Set
			headerLogoElement.setAttribute("src", src); // Set the src of the header logo img
		}

		var removeLogo : Function = this.removeComponent.bind(this.thisClass, rocketComponent, rocketComponent.querySelector('img [data-rocket-minor-component="logo"')); // removeLogo is a new function based on removeComponent

		function add(type : string, component : HTMLElement){ // Add a searchbar or list component to the header
			if (type == ("list" || "searchbar")){
				this.addComponent("append", rocketComponent, component);
			}
		}

		function remove(type : string, component : HTMLElement){ // Remove a search bar or list component from the header
			if (type == ("list" || "searchbar")){
				this.removeComponent(rocketComponent, component);
			}
		}
	}

	// #endregion

	// #region Rocket Footer Main Component

	Footer(rocketComponent : HTMLElement){ // Generates (or selects an existing) footer based on the options provided.
		function add(type : string, text : string, link ?: string, target ?: string){ // Set the text or add links to the footer
			if (type == "text"){
				var textTag : HTMLElement; // Define textTag as an HTML Element

				if (rocketComponent.querySelector("pre") == null){ // If the footer does NOT have the text tag
					textTag = document.createElement("pre"); // Create a new HTML Element (pre) and set it to the textTag
					this.addComponent("prepend", rocketComponent, textTag); // Prepend the text tag to the footer
				}
				else{
					textTag = rocketComponent.getElementsByTagName("pre")[0]; // Get the text tag
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

				this.addComponent("append", rocketComponent, newLink); // Add the new link
			}
		}

		function remove(type : string, link ?: string){ // Remove the footer text or a link (based on the link href)
			var elementToRemove : any; // Define elementToRemove as the element we'll be removing from the footer

			if (type == "text"){ // If we are removing the footer text
				elementToRemove = "pre"; // Define elementToRemove as the pre tag
			}
			else{ // If we are removing a link
				var links = rocketComponent.getElementsByTagName("a"); // Get all the a tags within the footer

				for (var linkElement in links){ // Recursively search for an element with the href equal to what is defined
					var hrefValue = linkElement.attributes.getNamedItem("href").value; // Get the href value of the particular linkElement

					if (hrefValue == link){ // If the hrefValue is the same as the link provided
						elementToRemove = linkElement; // Define elementToRemove as this link element
					}
				}
			}

			if (elementToRemove !== undefined){ // If we are either removing the text or we found the link with the associated href
				this.removeComponent(rocketComponent, elementToRemove); // Remove the element
			}
		}
	}

	// #endregion

	// #region Rocket Button Main Component

	Button(rocketComponent : HTMLElement){
		var predictableComponentRegister = rocketComponent.outerHTML.substr(0, 40); // Create a register based the component HTML to a max char limit of 20
		function listen(primaryCallback : Function, secondaryCallback ?: Function){ // Listener function that creates an event handle
			this.addCallback(predictableComponentRegister, rocketComponent, primaryCallback, secondaryCallback);

			$(rocketComponent).on("click touchend MSPointerUp keydown.VK_ENTER", { "componentRegister" : predictableComponentRegister },
				$.proxy(
					function(){
						var componentRegister = event.data["componentRegister"];

						var component : HTMLElement = this.rocketCallbacks[componentRegister]["element"];
						var primaryFunction : Function = this.rocketCallbacks[componentRegister]["primary function"];

						if (component.getAttribute("data-rocket-component-type") == "toggle"){
							var toggleValue : string = component.getAttribute("data-rocket-component-status");
							var newToggleValue : string;

							if (toggleValue == "false"){ // If the CURRENT toggle value is FALSE
								newToggleValue = "true"; // Set the NEW toggle value to TRUE

								if (this.rocketCallbacks[componentRegister].hasOwnProperty("secondary function")){ // If the secondary function is defined
									var secondaryFunction : Function = this.rocketCallbacks[componentRegister]["secondary function"];
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

							component.setAttribute("data-rocket-component-status", newToggleValue); // Update the status
						}
						else{ // If the component is a basic button
							primaryFunction(); // Call the primary function
						}
					},
					this.thisClass
				)
			);
		}
	}

	// #endregion

	// #region Rocket List Main Component

	List(rocketComponent: HTMLElement){
		function listen(rocketComponent : HTMLElement){
			this.init(); // Do a re-initialization, jQuery will automatically add the dropdown listeners
		}
	}
}