/*

	The following Typescript code is the aggregate module of Rocket

*/

/// <reference path="../definitions/jquery.d.ts" />
/// <reference path="Button.ts" />
/// <reference path="ComponentFunctions.ts" />
/// <reference path="Footer.ts" />
/// <reference path="Header.ts" />
/// <reference path="List.ts" />

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
}

var rocket = Rocket;