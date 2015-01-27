/*
 This is the module for information and functionality Syiro provides regarding the device using Syiro.
*/

/// <reference path="interfaces.ts" />

// #region Syiro Device Information and Functionality

module syiro.device {

    // #region Browser / Device Support (Default all to true since Detect() will change it if necessary)

    export var DoNotTrack : boolean; // Define DoNotTrack as a boolean if the browser's user has Do Not Track enabled.
    export var HasCryptography : boolean = true; // Define HasCryptography as a boolean if the device has Crypto support (for instance for getting random values).
    export var HasGeolocation : boolean = true; // Define HasGeolocation as a boolean if the device has Geolocation support.
    export var HasIndexedDB : boolean = true; // Define HasIndexedDB as a boolean if the device has IndexedDB support.
    export var HasLocalStorage : boolean = true; // Define HasLocalStorage as a boolean if the device has LocalStorage support.
    export var IsOnline : boolean = true; // Define IsOnline as a boolean if the device is online.
    export var SupportsTouch : boolean = false; // Define SupportsTouch as a boolean, defaulting to false, as to whether or not the device supports touch.

    // #region Screen Variables

    export var IsSubHD : boolean; // Define IsSubHD as a boolean if the device is less than an HD (720p) display.
    export var IsHD : boolean; // Define IsHD as a boolean if the device is HD (720p) or greater than 720p.
    export var IsFullHDOrAbove : boolean; // Define IsFullHDOrAbove as a boolean if the device is Full HD (1080p) or above.
    export var Orientation : string; // Define orientation as the correct device orientation
    export var OrientationObject : any = screen; // Define orientationObject as the proper Object to listen to orientation change events on. During detection, this CAN change to screen.orientation.

    export var orientation = syiro.device.Orientation; // Backwards compatibility variable.
    // #endregion

    // #region Detection Function - Use to detect functionality, define variables, etc.

    export function Detect(){

        // #region Do Not Track

        if (typeof navigator.doNotTrack !== "undefined"){ // If DoNotTrack is defined in the navigator Object
            syiro.device.DoNotTrack = Boolean(navigator.doNotTrack); // Set the DoNotTrack variable to the value defined in navigator and converted to boolean
        }
        else{  // If DoNotTrack is not defined in the navigator Object
            syiro.device.DoNotTrack = true; // Set DoNotTrack to true by default
        }

        // #endregion

        // #region Basic Crypto Functionality

        if (typeof window.crypto == "undefined"){ // If Crypto is not defined in the window Object
            syiro.device.HasCryptography = false; // Set HasCryptography to false
        }

        // #endregion

        // #region Geolocation Support

        if (typeof navigator.geolocation == "undefined"){ // If Geolocation is not defined in the navigator Object
            syiro.device.HasGeolocation = false; // Set HasGeolocation to false
        }

        // #endregion

        // #region IndexedDB Support

        if (typeof window.indexedDB == "undefined"){ // If IndexedDB is not defined in the window Object
            syiro.device.HasIndexedDB = false; // Set HasIndexedDB to false
        }

        // #endregion

        // #region LocalStorage Support

        if (typeof window.localStorage == "undefined"){ // If LocalStorage is not defined in the window Object
            syiro.device.HasLocalStorage = false; // Set HasLocalStorage to false
        }

        // #endregion

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

        // #region Touch Support Checking

        var eventsToRemove : Array<string>; // Define eventsToRemove as an array of strings to remove from eventStrings

        if ((typeof window.ontouchend !== "undefined") || ((typeof navigator.maxTouchPoints !== "undefined") && (navigator.maxTouchPoints > 0))){ // If the device supports ontouchend event or supports touch points
            syiro.device.SupportsTouch = true; // Set syiro.device.SupportsTouch to true
            eventsToRemove = ["mousedown", "mouseup"]; // Set eventsToRemove as an array of mouse-oriented event strings to remove
        }
        else{ // If touch is not supported on this device
            eventsToRemove = ["touchstart", "touchend"]; // Set eventsToRemove as an array of touch-oriented event strings to remove
        }

        syiro.events.eventStrings["down"].splice(syiro.events.eventStrings["down"].indexOf(eventsToRemove[0]), 1); // Remove either mousedown or touchstart
        syiro.events.eventStrings["up"].splice(syiro.events.eventStrings["up"].indexOf(eventsToRemove[1]), 1); // Remove either mouseup or touchend

        // #endregion

        syiro.device.FetchScreenDetails(); // Do an initial fetch of the screen details
        syiro.device.Orientation = syiro.device.FetchScreenOrientation(); // Do an initial fetch of the screen orientation
        syiro.events.Add("resize", window, syiro.device.FetchScreenDetails); // Listen to the window resizing for updating the screen details

        // #region Orientation Listening and Determinination Support

        var orientationChangeHandler : Function = function(){ // This function is the handler for when the orientation is changed (or if we fire the function during a window interval / timer)
            var currentOrientation : string = syiro.device.FetchScreenOrientation(); // Fetch the current screen orientation (portrait or landscape)

            if (currentOrientation !== syiro.device.Orientation){ // If currentOrientation does not match the syiro.device.Orientation stored already
                syiro.device.Orientation = currentOrientation; // Update orientation value for syiro.device.Orientation

                var allPlayers : NodeList = document.querySelectorAll('div[data-syiro-component$="player"]'); // Get all Audio Players and Video Players

                for (var allPlayersIndex = 0; allPlayersIndex < allPlayers.length; allPlayersIndex++){ // For each Player
                    var thisPlayer : any = allPlayers[allPlayersIndex]; // Define thisPlayer as the index of allPlayers
                    syiro.component.Scale(syiro.component.FetchComponentObject(thisPlayer)); // Scale this Player
                }

                if (arguments[0] == "interval"){ // If we are calling orientationChangeHandler via window.setInterval, call all the other [vendor]orientationchange handlers
                    var orientationChangeViaIntervalHanders : Array<Function> = syiro.data.Read("screen->handlers->orientationchange-viainterval"); // Define orientationChangeViaIntervalHanders as the fetched array of Functions from screen
                    for (var orientationChangeIndex in orientationChangeViaIntervalHanders){ // For each orientation handler
                        orientationChangeViaIntervalHanders[orientationChangeIndex](); // Call the function
                    }
                }
            }
        }

        if (typeof screen.orientation.onchange !== "undefined"){ // If Screen Orientation API is properly supported
            syiro.device.OrientationObject = screen.orientation; // Point syiro.device.OrientationObject to screen.orientation rather than screen
            syiro.events.eventStrings["orientationchange"] = ["change"]; // Set our eventStrings orientationchange to only change
        }
        else if (typeof screen.onmsorientationchange !== "undefined"){ // If this is the Internet Explorer vendor-prefixed orientation change
            syiro.events.eventStrings["orientationchange"] = ["msorientationchange"]; // Set our eventStrings orientationchange to only the IE event string
        }
        else if (typeof screen.onmozorientationchange !== "undefined"){ // If this is the Gecko vendor-prefixing (Mozilla) orientation change
            syiro.events.eventStrings["orientationchange"] = ["mozorientationchange"]; // Set our eventStrings orientationchange to only the Moz event string
        }
        else{ // If orientationchange simply isn't supported
            syiro.events.eventStrings["orientationchange"] = ["orientationchange-viainterval"]; // Delete our event string for orientationchange
        }

        if (typeof syiro.events.eventStrings["orientationchange"][0] !== "orientationchange-viainterval"){ // If orientation change is supported on the device
            syiro.events.Add(syiro.events.eventStrings["orientationchange"], syiro.device.OrientationObject, orientationChangeHandler); // Add an orientation change event for the screen with our orientationChangeHandler
        }
        else{ // If the device does not support orientation change
            window.setInterval(orientationChangeHandler.bind(this, "interval"), 2000); // Set a timer for every two seconds to check for change in device orientation. We are using this due to the lack of full orientationchange event support in major browsers.
        }

        // #endregion

    }

    // #endregion

    // #region Screen Dimension Details

    export function FetchScreenDetails(){
        if (window.screen.height < 720){ // If the screen height is less than 720px
            syiro.device.IsSubHD = true; // Set IsSubHD to true
            syiro.device.IsHD = false; // Set IsHD to false
            syiro.device.IsFullHDOrAbove = false; // Set IsFullHDOrAbove to false
        }
        else{ // If the screen height is greater than 720px
            if (((window.screen.height >= 720) && (window.screen.height < 1080)) && (window.screen.width >= 1280)){ // If the screen is essentially "720p" HD (greater than 720px but less than 1080px) in width
                syiro.device.IsSubHD = false; // Set IsSubHD to false
                syiro.device.IsHD = true; // Set IsHD to true
                syiro.device.IsFullHDOrAbove = false; // Set IsFullHDOrAbove to false
            }
            else if ((window.screen.height >= 1080) && (window.screen.width >= 1920)){ // If the screen width is greater or equal to 1920px and the screen height is greater or equal to 1080px
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

        if ((typeof screen.orientation !== "undefined") && (screen.orientation == "landscape-primary")){
            deviceOrientation = "landscape"; // We are in landscape mode
        }
        else if ((typeof screen.msOrientation !== "undefined") && (screen.msOrientation == "landscape-primary")){
            deviceOrientation = "landscape"; // We are in landscape mode
        }
        else if ((typeof screen.mozOrientation !== "undefined") && (screen.mozOrientation == "landscape-primary")){
            deviceOrientation = "landscape"; // We are in landscape mode
        }
        else if (screen.height < screen.width){ // If none of the Screen Orientation API is supported AND the screen width is larger than the height
            deviceOrientation = "landscape"; // We are in landscape mode
        }

        return deviceOrientation;
    }

    // #endregion

}

// #endregion
