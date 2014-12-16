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

    // #region Screen Size Variables

    export var IsSubHD : boolean; // Define IsSubHD as a boolean if the device is less than an HD (720p) display.
    export var IsHD : boolean; // Define IsHD as a boolean if the device is HD (720p) or greater than 720p.
    export var IsFullHDOrAbove : boolean; // Define IsFullHDOrAbove as a boolean if the device is Full HD (1080p) or above.

    // #endregion

    // #region Detection Function - Use to detect functionality, define variables, etc.

    export function Detect(){

        if (navigator.doNotTrack !== undefined){ // If DoNotTrack is defined in the navigator Object
            syiro.device.DoNotTrack = Boolean(navigator.doNotTrack); // Set the DoNotTrack variable to the value defined in navigator and converted to boolean
        }
        else{  // If DoNotTrack is not defined in the navigator Object
            syiro.device.DoNotTrack = true; // Set DoNotTrack to true by default
        }

        if (window.crypto == undefined){ // If Crypto is not defined in the window Object
            syiro.device.HasCryptography = false; // Set HasCryptography to false
        }

        if (navigator.geolocation == undefined){ // If Geolocation is not defined in the navigator Object
            syiro.device.HasGeolocation = false; // Set HasGeolocation to false
        }

        if (window.indexedDB == undefined){ // If IndexedDB is not defined in the window Object
            syiro.device.HasIndexedDB = false; // Set HasIndexedDB to false
        }

        if (window.localStorage == undefined){ // If LocalStorage is not defined in the window Object
            syiro.device.HasLocalStorage = false; // Set HasLocalStorage to false
        }

        if (navigator.onLine !== undefined){ // If the browser is online
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

        if ((typeof window.ontouchend !== "undefined") || ((typeof navigator.maxTouchPoints !== "undefined") && (navigator.maxTouchPoints > 0))){ // If the device supports ontouchend event or supports touch points
            syiro.device.SupportsTouch = true; // Set syiro.device.SupportsTouch to true
        }

        syiro.device.FetchScreenDetails(); // Do an initial fetch of the screen details

        syiro.events.Add("resize", window, syiro.device.FetchScreenDetails); // Listen to the window resizing
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

}

// #endregion
