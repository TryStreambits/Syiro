// <reference path="./syiro.js" />

// #region Page Setup Functions

var normalToastComponentObject; // Declare normalToastComponentObject
var dialogToastComponentObject; // Declare dialogToastComponentObject

function generatePage(){
	// #region Generate Toasts

	normalToastComponentObject = syiro.toast.New({"type" : "normal", "title" : "This is an example Normal Toast!", "message" : "This is the message of the toast"});
	dialogToastComponentObject = syiro.toast.New({
		"type" : "dialog", "title" : "This is an example Dialog Toast!", "message" : "We are going to show off custom labels on the two buttons as well.",
		"buttons" : [{ "action" : "deny", "content" : "REJECT ME"}, { "action" : "affirm", "content" : "AFFIRMATIVE" }]
	});

	document.body.appendChild(syiro.Fetch(normalToastComponentObject)); // Append the Normal Toast Component Object to the document
	document.body.appendChild(syiro.Fetch(dialogToastComponentObject)); // Append the Dialog Toast Component Object to the document

	// #endreigon

    generateNavbarAndSidepane(); // Generate the Navbar, Sidepane & Associated Components

    /* Buttongroup Generation */

    var audioButtonComponent = syiro.button.New( { "content" : "Audio"});
    var videoButtonComponent = syiro.button.New( { "content" : "Video"});
    var buttonGroupComponent = syiro.buttongroup.New({ "active" : 1, "items" : [ audioButtonComponent, videoButtonComponent ]}); // Generate a Button Group with two Buttons
    buttonGroupContainer.appendChild(syiro.Fetch(buttonGroupComponent)); // Fetch the Buttongroup Component and append it to Buttongroup Container

    syiro.events.Add(syiro.events.Strings["up"], audioButtonComponent, showPlayerContainer.bind(this, "audio")); // Add an event (up) to the audioButtonComponent, having it trigger showPlayerContainer w/ audio
    syiro.events.Add(syiro.events.Strings["up"], videoButtonComponent, showPlayerContainer.bind(this, "video")); // Add an event (up) to the videoButtonComponent, having it trigger showPlayerContainer w/ video

    /* End of Buttongroup Generation */

    generateMediaPlayers(); // Generate the Media Players

    syiro.events.Add("resize", window, function(){ // Add a resize event to the window
        syiro.CSS(videoPlayerContainer, "height", (syiro.device.height - 120).toString() + "px");
    });
}

// #region Generate Navbar + Sidepane Function

function generateNavbarAndSidepane(){
	// #region Dropdown Button Component Generation

	var toggleNormalToastListItemObject = syiro.listitem.New({"label" : "Toggle Normal Toast"}); // Generate a List Item with the content being "Toggle Normal Toast"
	var toggleDialogToastListItemObject  = syiro.listitem.New({"label" : "Toggle Dialog Toast"}); // Generate a List Item with the content being "Toggle Dialog Toast"

	var dropdownButtonComponentObject = syiro.button.New({ "type" : "dropdown", "icon" : "custom", "items" : [ toggleNormalToastListItemObject,  toggleDialogToastListItemObject ], "position" : ["below", "right"] });

	// #endregion

    // #region Navbar Component Generation

    var navbarComponentObject = syiro.navbar.New({
        "position" : "top",
        "items" : [
			{ "link" : "http://syiro.com", "title" : "Home" },
			{ "link" : "https://github.com/StroblIndustries/Syiro/wiki", "title" : "Documentation"},
			{ "link" : "https://github.com/StroblIndustries/Syiro/issues", "title" : "Issues"},
			dropdownButtonComponentObject
		]
    });

    // #endregion

	// #region Searchbox Generation

	var searchboxComponent= syiro.searchbox.New({ "DisableInputTrigger" : true}); // Generate a new Searchbox

    var backgroundColorToggler = syiro.button.New({ "type" : "toggle" }); // Generate a Toggle Button
    var sidepaneListObject = syiro.list.New(  // Generate a List
		{
			"header" : "Syiro",
			"items" : [ { "label" : "Dark BG", "control" : backgroundColorToggler}, { "label" : "Another List Item" }, { "link" : { "link" : "http://syiro.com", "title" : "Syiro Website" } } ]
		}
	)
    var sidepaneComponentObject = syiro.sidepane.New({ "searchbox" : searchboxComponent, "items" : [ sidepaneListObject ]}); // Generate a List

    document.body.insertBefore(syiro.Fetch(sidepaneComponentObject), syiro.page); // Prepend in body
    syiro.page.insertBefore(syiro.Fetch(navbarComponentObject), syiro.page.firstChild); // Append the fetched Navbar Element to the main Element

	syiro.events.Add(syiro.events.Strings["up"], toggleNormalToastListItemObject, syiro.toast.Toggle.bind(this, normalToastComponentObject)); // Listen to up event for the Normal Toast List Item Object that'll toggle the Normal Toast Component
	syiro.events.Add(syiro.events.Strings["up"], toggleDialogToastListItemObject, syiro.toast.Toggle.bind(this, dialogToastComponentObject)); // Listen to up event for the Dialog Toast List Item Object that'll toggle the Dialog Toast Component

	syiro.events.Add("input", searchboxComponent, outputSearchboxContent); // Set input event of Searchbox Component to outputSearchboxContent func
    syiro.events.Add(syiro.events.Strings["up"], backgroundColorToggler, backgroundColorSwitcher); // Add the backgroundColorSwitcher function to the toggle button
}

// #endregion

// #region Generate Media Players Function

function generateMediaPlayers(){
    /* Share Dialogs List Generation */

    var menuDialogItems = [ { "image" : "img/facebook.png", "label" : "Facebook" }, { "image" : "img/google-plus.png", "label" : "Google+" }, { "image" : "img/twitter.png", "label" : "Twitter" } ];
    var audioMenuDialogList = syiro.list.New({ "items" : menuDialogItems } );
    var videoMenuDialogList = syiro.list.New({ "items" : menuDialogItems } );

    /* End of Share Dialogs List Generation */

    var generatedAudioPlayer = syiro.mediaplayer.New(
            {
				"type" : "audio",
                "menu" : audioMenuDialogList,
                "sources": ["http://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg", "http://www.noiseaddicts.com/samples/55.mp3" ],
                "art" : "img/lake.jpg",
                "title" : "Example OGG File",
                "artist" : "JesseW"
            }
    );

    var generatedVideoPlayer = syiro.mediaplayer.New(
            {
				"type" : "video",
                "art" : "img/video-art.png",
                "menu" : videoMenuDialogList,
                "fill" : [0.8,1],
                "sources" : ["http://download.blender.org/peach/trailer/trailer_480p.mov", "http://mirror.cessen.com/blender.org/peach/trailer/trailer_iphone.m4v", "http://video.webmfiles.org/big-buck-bunny_trailer.webm"]
            }
    );

    audioPlayerContainer.appendChild(syiro.Fetch(generatedAudioPlayer)); // Fetch and append the Audio Player to the Audio Player Container
    videoPlayerContainer.appendChild(syiro.Fetch(generatedVideoPlayer)); // Fetch and append the Video Player to the Video Player Container

    /* Change Source Button Generation */

    var changeSourceButtonComponent = syiro.button.New({ "content" : "Change Sources" }); // Generate the Change Source Button
    videoPlayerContainer.appendChild(syiro.Fetch(changeSourceButtonComponent)); // Fetch and append the Change Source Button to the Video Player Container
    syiro.events.Add(syiro.events.Strings["up"], changeSourceButtonComponent, changeVideoSource); // Set event (up) of changeSourceButtonComponent to call changeVideoSource()
}

// #endregion

// #endregion

// #region Page Functions

// #region Background Color Switcher

function backgroundColorSwitcher(){
    if (syiro.CSS(document.body, "background-color") == ""){ // If we are currently using a light background
        syiro.CSS(document.body, "background-color", "rgba(0,0,0,0.75)"); // Set to 75% black
    }
    else { // If we are currently using a dark background
        syiro.CSS(document.body, "background-color", ""); // Unset
    }
}

// #endregion

// #region Change VIdeo Source

function changeVideoSource(){
    var buttonComponentObject = arguments[0]; // Set the buttonComponentObject to the first argument
    var buttonComponentElement = syiro.Fetch(buttonComponentObject); // Set buttonComponentElement as the fetched buttonComponentObject Element

    var videoPlayerComponentObject = syiro.FetchComponentObject(videoPlayerContainer.querySelector('div[data-syiro-component="media-player"][data-syiro-component-type="video"]')); // Get the Component Object of the Video Player inside videoPlayerContainer

    if (buttonComponentElement.textContent == "Change Sources"){ // If we are using original sources
        syiro.button.SetLabel(buttonComponentObject, "Prior Sources"); // Set Button label to "Prior Sources"
        syiro.mediaplayer.SetSources(videoPlayerComponentObject, ["https://download.blender.org/durian/trailer/sintel_trailer-720p.ogv", "https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4"]); // Change the source
    }
    else { // If we are not using original sources
        syiro.button.SetLabel(buttonComponentObject, "Change Sources"); // Set Button label to original label
        syiro.mediaplayer.SetSources(videoPlayerComponentObject, ["http://download.blender.org/peach/trailer/trailer_480p.mov", "http://mirror.cessen.com/blender.org/peach/trailer/trailer_iphone.m4v", "http://video.webmfiles.org/big-buck-bunny_trailer.webm"]); // Change the source to original
    }
}

// #endregion

// #region Output Searchbox Content

function outputSearchboxContent(){
	console.log(arguments);
}

// #region Show Player Container

function showPlayerContainer(){
    var section = arguments[0]; // Set section equal to the first argument passed

    if (section == "audio"){ // If the section is audio
        syiro.animation.FadeOut(videoPlayerContainer, function(){
            syiro.CSS(videoPlayerContainer, "display", "none"); // Set display to none
            syiro.CSS(audioPlayerContainer, "display", "block"); // Set display to block

            syiro.animation.FadeIn(audioPlayerContainer); // Fade in the audio section
        });
    }
    else{ // IF the section is video
        syiro.animation.FadeOut(audioPlayerContainer, function(){
            syiro.CSS(audioPlayerContainer, "display", "none"); // Set display to none
            syiro.CSS(videoPlayerContainer, "display", "block"); // Set display to block

            syiro.animation.FadeIn(videoPlayerContainer); // Fade in the video section
        });
    }
}

// #endregion

// #endregion
