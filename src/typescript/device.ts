/*
 This is the namespace for information and functionality Syiro provides regarding the device using Syiro.
*/

/// <reference path="events.ts" />
/// <reference path="interfaces.ts" />

// #region Syiro Device Information and Functionality

namespace syiro.device {

	// #region Browser / Device Support (Default all to true since Detect() will change it if necessary)

	export var DoNotTrack : boolean; // Define DoNotTrack as a boolean if the browser's user has Do Not Track enabled.
	export var HasCryptography : boolean = true; // Define HasCryptography as a boolean if the device has Crypto support (for instance for getting random values).
	export var HasGeolocation : boolean = true; // Define HasGeolocation as a boolean if the device has Geolocation support.
	export var HasIndexedDB : boolean = true; // Define HasIndexedDB as a boolean if the device has IndexedDB support.
	export var HasLocalStorage : boolean = true; // Define HasLocalStorage as a boolean if the device has LocalStorage support.
	export var IsOnline : boolean = true; // Define IsOnline as a boolean if the device is online.
	export var OperatingSystem : string; // Define OperatingSystem as a string of what the OS is
	export var SupportsMutationObserver : boolean = false; // Define SupportsMutationObserver as a boolean, defaulting to false, as to whether the browser / device supports MutationObserver or WebKitMutationObserver
	export var SupportsTouch : boolean = false; // Define SupportsTouch as a boolean, defaulting to false, as to whether or not the device supports touch.

	// #region Screen Variables

	export var IsSubHD : boolean; // Define IsSubHD as a boolean if the device is less than an HD (720p) display.
	export var IsHD : boolean; // Define IsHD as a boolean if the device is HD (720p) or greater than 720p.
	export var IsFullHDOrAbove : boolean; // Define IsFullHDOrAbove as a boolean if the device is Full HD (1080p) or above.
	export var Orientation : string; // Define Orientation as the correct device orientation
	export var OrientationObject : any = screen; // Define orientationObject as the proper Object to listen to orientation change events on. During detection, this CAN change to screen.orientation.

	export var height : number; // Define height as the number of the true height of the content
	export var width : number; // Define width as the number of the true width of the content

	// #endregion

	// #region Detection Function - Use to detect functionality, define variables, etc.

	export function Detect(){
		// #region Do Not Track

		if (typeof navigator.doNotTrack !== "undefined"){ // If DoNotTrack is defined in the navigator Object
			syiro.device.DoNotTrack = Boolean(navigator.doNotTrack); // Set the DoNotTrack variable to the value defined in navigator and converted to boolean
		} else {  // If DoNotTrack is not defined in the navigator Object
			syiro.device.DoNotTrack = true; // Set DoNotTrack to true by default
		}

		// #endregion

		syiro.device.HasCryptography = (typeof window.crypto !== "undefined"); // HasCryptography is set to true if window.crypto is not undefined
		syiro.device.HasGeolocation = (typeof navigator.geolocation !== "undefined"); // HasGeolocation is set to true if navigator.geolocation is not undefined
		syiro.device.HasIndexedDB == (typeof window.indexedDB !== "undefined"); // HasIndexDB is set to true if window.indexedDB is not undefined
		syiro.device.HasLocalStorage =  (typeof window.localStorage !== "undefined"); // HasLocalStorage is set to true if window.localStorage is not undefined

		// #endregion

		// #region MutationObserver Support

		if ((typeof MutationObserver !== "undefined") || (typeof WebKitMutationObserver !== "undefined")){ // If MutationObserver is supported by the browser
			if (typeof WebKitMutationObserver !== "undefined"){ // If WebKitMutationObserver is used instead (like on iOS)
				MutationObserver = WebKitMutationObserver; // Set MutationObserver to WebKitMutationObserver
			}

			syiro.device.SupportsMutationObserver = true; // Set SupportsMutationObserver support variable to true
		}

		// #region Online Status Support

		if (typeof navigator.onLine !== "undefined"){ // If the browser is online
			syiro.device.IsOnline = navigator.onLine; // Set the IsOnline to the browser's online status

			syiro.events.Add("online", document,  // Add an event listener that listens to the "online" event, which means the user went from offline to online, and update the IsOnline value
				function(){ // When the user goes online
					syiro.device.IsOnline = true; // Set syiro.device.IsOnline to true
				}
			);

			syiro.events.Add("offline", document, // Add an event listener that listens to the "offline" event, which means the user went from online to offline, and update the IsOnline value
				function(){ // When the user goes offline
					syiro.device.IsOnline = false; // Set syiro.device.IsOnline to false
				}
			);
		}

		// #endregion

		syiro.device.FetchOperatingSystem(); // Fetch the device operating system

		// #region Touch Support Checking

		var eventsToRemove : Array<string>; // Define eventsToRemove as an array of strings to remove from eventStrings

		if ((navigator.userAgent.indexOf("Firefox/") == -1) &&(syiro.device.OperatingSystem !== "Linux") && (syiro.device.OperatingSystem !== "OS X") && (syiro.device.OperatingSystem !== "Sailfish") && (syiro.device.OperatingSystem !== "Windows")){ // If we are not on a desktop operating system, Firefox, or Sailfish OS (since Gecko has half-backed Touch Events support)
			syiro.device.SupportsTouch = true; // Set syiro.device.SupportsTouch to true
			syiro.events.eventStrings["down"] = ["touchstart"]; // Set down events to touchstart
			syiro.events.eventStrings["up"] = ["touchend"]; // Set up events to touchend
			syiro.events.eventStrings["move"] = ["touchmove"]; // Set move events to touchmove
		} else { // If we are on a desktop operating system
			syiro.events.eventStrings["down"] = ["mousedown"]; // Set down events to mousedown
			syiro.events.eventStrings["up"]= ["mouseup"]; // Set up events to mouseup
			syiro.events.eventStrings["move"] = ["mousemove"]; // Set move events to mousemove
		}

		Object.freeze(syiro.events.eventStrings["down"]); // Lock down events
		Object.freeze(syiro.events.eventStrings["up"]); // Lock up events
		Object.freeze(syiro.events.eventStrings["move"]); // Lock move events

		// #endregion

		syiro.device.FetchScreenDetails(); // Do an initial fetch of the screen details

		syiro.device.Orientation = syiro.device.FetchScreenOrientation(); // Do an initial fetch of the screen orientation
		syiro.events.Add("resize", window, syiro.device.FetchScreenDetails); // Listen to the window resizing for updating the screen details

		// #region Orientation Listening and Determinination Support

		var orientationChangeHandler : Function = function(){ // This function is the handler for when the orientation is changed (or if we fire the function during a window interval / timer)
			var currentOrientation : string = syiro.device.FetchScreenOrientation(); // Fetch the current screen orientation (portrait or landscape)

			if (currentOrientation !== syiro.device.Orientation){ // If currentOrientation does not match the syiro.device.Orientation stored already
				syiro.device.Orientation = currentOrientation; // Update Orientation value for syiro.device.Orientation

				var allPlayers : NodeList = document.querySelectorAll('div[data-syiro-component$="player"]'); // Get all Audio Players and Video Players

				for (var playerIndex in allPlayers){ // For each Player
					var thisPlayer : any = allPlayers[playerIndex]; // Define thisPlayer as the index of allPlayers

					if (syiro.utilities.TypeOfThing(thisPlayer, "Element")){ // If this is an Element
						syiro.render.Scale(syiro.component.FetchComponentObject(thisPlayer)); // Scale this Player

						if (thisPlayer.getAttribute("data-syiro-component-type") == "audio"){ // If it is an audio-type Media Player
							var mediaPlayerComponent : ComponentObject = syiro.component.FetchComponentObject(thisPlayer);
							syiro.mediaplayer.CenterInformation(mediaPlayerComponent); // Recenter the audio-type Media Player Component information
						}
					}
				}

				if (arguments[0] == "interval"){ // If we are calling orientationChangeHandler via window.setInterval, call all the other [vendor]orientationchange handlers
					var orientationChangeViaIntervalHanders : Array<Function> = syiro.data.Read("screen->handlers->orientationchange-viainterval"); // Define orientationChangeViaIntervalHanders as the fetched array of Functions from screen
					for (var orientationChangeIndex in orientationChangeViaIntervalHanders){ // For each orientation handler
						orientationChangeViaIntervalHanders[orientationChangeIndex](); // Call the function
					}
				}
			}
		}

		if ((typeof screen.orientation !== "undefined") && (typeof screen.orientation.onchange !== "undefined")){ // If Screen Orientation API is properly supported
			syiro.device.OrientationObject = screen.orientation; // Point syiro.device.OrientationObject to screen.orientation type
			syiro.events.eventStrings["orientationchange"] = ["change"]; // Set our eventStrings orientationchange to only change
		} else if (typeof screen.onmsorientationchange !== "undefined"){ // If this is the Internet Explorer vendor-prefixed orientation change
			syiro.device.OrientationObject = screen; // Point syiro.device.OrientationObject to screen.msOrientation rather than screen
			syiro.events.eventStrings["orientationchange"] = ["msorientationchange"]; // Set our eventStrings orientationchange to only the IE event string
		} else if (typeof screen.onmozorientationchange !== "undefined"){ // If this is the Gecko vendor-prefixing (Mozilla) orientation change
			syiro.device.OrientationObject = screen; // Point syiro.device.OrientationObject to screen.mozOrientation rather than screen
			syiro.events.eventStrings["orientationchange"] = ["mozorientationchange"]; // Set our eventStrings orientationchange to only the Moz event string
		} else { // If orientationchange simply isn't supported
			syiro.events.eventStrings["orientationchange"] = ["orientationchange-viainterval"]; // Delete our event string for orientationchange
		}

		if (syiro.events.eventStrings["orientationchange"][0] !== "orientationchange-viainterval"){ // If orientation change is supported on the device
			syiro.events.Add(syiro.events.eventStrings["orientationchange"], syiro.device.OrientationObject, orientationChangeHandler); // Add an orientation change event for the screen with our orientationChangeHandler
		} else { // If the device does not support orientation change
			window.setInterval(orientationChangeHandler.bind(this, "interval"), 2000); // Set a timer for every two seconds to check for change in device orientation. We are using this due to the lack of full orientationchange event support in major browsers.
		}

		Object.freeze(syiro.events.eventStrings["orientationchange"]); // Lock orientationchange events

		// #endregion

		Object.freeze(syiro.events.eventStrings); // Lock the eventStrings Object
	}

	// #endregion

	// #region Fetch Operating System

	export function FetchOperatingSystem(){
		var userAgent : string = navigator.userAgent; // Get the userAgent

		if (userAgent.indexOf("Android") !== -1){ // If the userAgent is set to claim the device is Android
			syiro.device.OperatingSystem = "Android"; // Set device to Android
		} else if ((userAgent.indexOf("iPhone") !== -1) || (userAgent.indexOf("iPad") !== -1)){ // If the userAgent is set to claim the device is an iPhone or iPad
			syiro.device.OperatingSystem = "iOS"; // Set device to iOS
		} else if ((userAgent.indexOf("Linux") !== -1) && (userAgent.indexOf("Android") == -1)){ // If the userAgent is set to claim the device is Linux (but not Android)
			syiro.device.OperatingSystem = "Linux"; // Set device to Linux

			if (userAgent.indexOf("Sailfish") !== -1){ // If the userAgent is set to claim the device is a Sailfish OS device
				syiro.device.OperatingSystem = "Sailfish"; // Set device to Sailfish OS
			} else if ((userAgent.indexOf("Ubuntu") !== -1) && ((userAgent.indexOf("Mobile") !== -1) || (userAgent.indexOf("Tablet") !== -1))){ // IF the userAgent is claiming the device is running Ubuntu Touch
				syiro.device.OperatingSystem = "Ubuntu Touch"; // Set device to Ubuntu Touch
			}
		} else if (userAgent.indexOf("Macintosh") !== -1){ // If the userAgent is set to claim the device is a Macintosh
			syiro.device.OperatingSystem = "OS X"; // Set device to OS X
		} else if (userAgent.indexOf("Windows Phone") !== -1){ // If the userAgent is set to claim the device is a Windows Phone
			syiro.device.OperatingSystem = "Windows Phone"; // Set device to Windows Phone
		} else if (userAgent.indexOf("Windows NT") !== -1){ // If the userAgent is set to claim the device is Windows
			syiro.device.OperatingSystem = "Windows"; // Set device to Windows
		} else { // If something else
			syiro.device.OperatingSystem = "Other"; // Set to Other
		}

		return syiro.device.OperatingSystem; // Return the OS in the event someone directly calls FetchOperatingSystem
	}

	// #endregion

	// #region Screen Dimension Details

	export function FetchScreenDetails(){
		syiro.device.height = screen.height;
		syiro.device.width = screen.width;

		if (syiro.device.height < 720){ // If the document height is less than 720px
			syiro.device.IsSubHD = true; // Set IsSubHD to true
			syiro.device.IsHD = false; // Set IsHD to false
			syiro.device.IsFullHDOrAbove = false; // Set IsFullHDOrAbove to false
		} else { // If the screen height is greater than 720px
			if (((syiro.device.height >= 720) && (syiro.device.height< 1080)) && (syiro.device.width >= 1280)){ // If the document is essentially "720p" HD (greater than 720px but less than 1280px) in width
				syiro.device.IsSubHD = false; // Set IsSubHD to false
				syiro.device.IsHD = true; // Set IsHD to true
				syiro.device.IsFullHDOrAbove = false; // Set IsFullHDOrAbove to false
			} else if ((syiro.device.height >= 1080) && (syiro.device.width >= 1920)){ // If the document width is greater or equal to 1920px and the document height is greater or equal to 1080px
				syiro.device.IsSubHD = false; // Set IsSubHD to false
				syiro.device.IsHD = true; // Set IsHD to true, since technically it supports 720p content
				syiro.device.IsFullHDOrAbove = true; // Set IsFullHDOrAbove to true
			}
		}
	}

	// #endregion

	// #region Screen Orientation Data

	export function FetchScreenOrientation() : string {
		var deviceOrientation : string = "portrait"; // Define deviceOrientation as the orientation of the device, defaulting to portrait

		if ((typeof screen.orientation !== "undefined") && (typeof screen.orientation.onchange !== "undefined")){ // If Screen Orientation API is properly supported
			deviceOrientation = screen.orientation; // Set deviceOrientation to screen.orientation type
		} else if (typeof screen.onmsorientationchange !== "undefined"){ // If this is the Internet Explorer vendor-prefixed orientation change
			deviceOrientation = screen.msOrientation; // Set deviceOrientation to screen.msOrientation
		} else if (typeof screen.onmozorientationchange !== "undefined"){ // If this is the Gecko vendor-prefixing (Mozilla) orientation change
			deviceOrientation = screen.mozOrientation; // Set deviceOrientation to screen.mozOrientation
		}

		if (deviceOrientation == "landscape-primary"){
			deviceOrientation = "landscape"; // We are in landscape mode
		} else if (screen.height < screen.width){ // If none of the Screen Orientation API is supported AND the screen width is larger than the height
			deviceOrientation = "landscape"; // We are in landscape mode
		}

		return deviceOrientation;
	}

	// #endregion

}

// #endregion
