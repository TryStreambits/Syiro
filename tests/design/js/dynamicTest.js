/* ================= Page Setup ================= */

function generatePage(){
    generateNavbar(); // Generate the Navbar & Associated Components

    /* Buttongroup Generation */

    var audioButtonComponent = syiro.button.Generate( { "content" : "Audio"});
    var videoButtonComponent = syiro.button.Generate( { "content" : "Video"});
    var buttonGroupComponent = syiro.buttongroup.Generate({ "active" : 1, "items" : [ audioButtonComponent, videoButtonComponent ]}); // Generate a Button Group with two Buttons
    buttonGroupContainer.appendChild(syiro.Fetch(buttonGroupComponent)); // Fetch the Buttongroup Component and append it to Buttongroup Container

    syiro.events.Add(syiro.events.eventStrings["up"], audioButtonComponent, showPlayerContainer.bind(this, "audio")); // Add an event (up) to the audioButtonComponent, having it trigger showPlayerContainer w/ audio
    syiro.events.Add(syiro.events.eventStrings["up"], videoButtonComponent, showPlayerContainer.bind(this, "video")); // Add an event (up) to the videoButtonComponent, having it trigger showPlayerContainer w/ video

    /* End of Buttongroup Generation */

    generateMediaPlayers(); // Generate the Media Players

    syiro.events.Add("resize", window, function(){ // Add a resize event to the window
        syiro.CSS(videoPlayerContainer, "height", (screen.height * 0.50).toString() + "px");
        var videoPlayerComponentObject = syiro.FetchComponentObject(videoPlayerContainer.querySelector('div[data-syiro-component="video-player"]')); // Get the Component Object of the Video Player inside videoPlayerContainer
        syiro.render.Scale(videoPlayerComponentObject); // Rescale the Video Player
        console.log("resizing");
    });
}

function generateNavbar(){
    /* Navbar Data Definition */

    var topNavbarComponentData = {
        "position" : "top",
        "fixed" : true,
        "items" : [ { "link" : "http://syiro.com", "title" : "Home" }, { "link" : "https://github.com/StroblIndustries/Syiro/wiki", "title" : "Documentation"}, { "link" : "https://github.com/StroblIndustries/Syiro/issues", "title" : "Issues"} ]
    };

    /* End of Navbar Data Definition */

    var backgroundColorToggler = syiro.button.Generate({ "type" : "toggle" }); // Generate a Toggle Button
    var dropdownComponentObject = syiro.dropdown.Generate({ "items" : [ { "label" : "Dark BG", "control" : backgroundColorToggler}, { "label" : "Another List Item" } ] } ); // Use "Men" icon for Dropdown (no label defintion)
    topNavbarComponentData["items"].push(dropdownComponentObject); // Push the Dropdown to the Navbar Component

    var navbarComponentObject = syiro.navbar.Generate(topNavbarComponentData); // Generate the Navbar
    document.body.insertBefore(syiro.Fetch(navbarComponentObject), document.body.firstChild); // Append the fetched Navbar Element to the document

    syiro.events.Add(syiro.events.eventStrings["up"], backgroundColorToggler, backgroundColorSwitcher); // Add the backgroundColorSwitcher function to the toggle button
}

function generateMediaPlayers(){
    /* Share Dialogs List Generation */

    var menuDialogItems = [ { "image" : "img/facebook.png", "label" : "Facebook" }, { "image" : "img/google-plus.png", "label" : "Google+" }, { "image" : "img/twitter.png", "label" : "Twitter" } ];
    var audioMenuDialogList = syiro.list.Generate({ "items" : menuDialogItems } );
    var videoMenuDialogList = syiro.list.Generate({ "items" : menuDialogItems } );

    /* End of Share Dialogs List Generation */

    var generatedAudioPlayer = syiro.audioplayer.Generate(
            {
                "UsingExternalLibrary" : true,
                "menu" : audioMenuDialogList,
                "sources": ["http://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg", "http://www.noiseaddicts.com/samples/55.mp3" ],
                "art" : "https://c2.staticflickr.com/6/5134/5518988345_9df9892bb2_b.jpg",
                "title" : "Example OGG File",
                "artist" : "JesseW"
            }
    );

    var generatedVideoPlayer = syiro.videoplayer.Generate(
            {
                "art" : "img/video-art.png",
                "UsingExternalLibrary" : true, // Declare that we are using an external library and to ignore canPlayType error
                "menu" : videoMenuDialogList,
                "fill" : [1,1],
                "sources" : ["http://download.blender.org/peach/trailer/trailer_480p.mov", "http://mirror.cessen.com/blender.org/peach/trailer/trailer_iphone.m4v", "http://video.webmfiles.org/big-buck-bunny_trailer.webm"]
            }
    );

    audioPlayerContainer.appendChild(syiro.Fetch(generatedAudioPlayer)); // Fetch and append the Audio Player to the Audio Player Container
    videoPlayerContainer.appendChild(syiro.Fetch(generatedVideoPlayer)); // Fetch and append the Video Player to the Video Player Container

    /* Change Source Button Generation */

    var changeSourceButtonComponent = syiro.button.Generate({ "content" : "Change Sources" }); // Generate the Change Source Button
    videoPlayerContainer.appendChild(syiro.Fetch(changeSourceButtonComponent)); // Fetch and append the Change Source Button to the Video Player Container
    syiro.events.Add(syiro.events.eventStrings["up"], changeSourceButtonComponent, changeVideoSource); // Set event (up) of changeSourceButtonComponent to call changeVideoSource()
}

/* ================= End of Page Setup ================= */

/* ================= Page Functions ================= */

function backgroundColorSwitcher(){
    if (syiro.CSS(document.body, "background-color") == false){ // If we are currently using a light background
        syiro.CSS(document.body, "background-color", "rgba(0,0,0,0.75)"); // Set to 75% black
    }
    else { // If we are currently using a dark background
        syiro.CSS(document.body, "background-color", false); // Unset
    }
}

function changeVideoSource(){
    var buttonComponentObject = arguments[0]; // Set the buttonComponentObject to the first argument
    var buttonComponentElement = syiro.Fetch(buttonComponentObject); // Set buttonComponentElement as the fetched buttonComponentObject Element

    var videoPlayerComponentObject = syiro.FetchComponentObject(videoPlayerContainer.querySelector('div[data-syiro-component="video-player"]')); // Get the Component Object of the Video Player inside videoPlayerContainer

    if (buttonComponentElement.textContent == "Change Sources"){ // If we are using original sources
        syiro.button.SetLabel(buttonComponentObject, "Prior Sources"); // Set Button label to "Prior Sources"
        syiro.player.SetSources(videoPlayerComponentObject, ["https://download.blender.org/durian/trailer/sintel_trailer-720p.ogv", "https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4"]); // Change the source
    }
    else { // If we are not using original sources
        syiro.button.SetLabel(buttonComponentObject, "Change Sources"); // Set Button label to original label
        syiro.player.SetSources(videoPlayerComponentObject, ["http://download.blender.org/peach/trailer/trailer_480p.mov", "http://mirror.cessen.com/blender.org/peach/trailer/trailer_iphone.m4v", "http://video.webmfiles.org/big-buck-bunny_trailer.webm"]); // Change the source to original
    }
}

function showPlayerContainer(){
    var section = arguments[0]; // Set section equal to the first argument passed

    if (section == "audio"){ // If the section is audio
        syiro.animation.FadeOut(videoPlayerContainer, function(){
            syiro.CSS(videoPlayerContainer, "display", "none"); // Set display to none
            syiro.CSS(videoPlayerContainer, "visibility", "hidden"); // Set visibility to hidden
            syiro.CSS(audioPlayerContainer, "display", "block"); // Set display to block

            syiro.animation.FadeIn(audioPlayerContainer); // Fade in the audio section
        });
    }
    else{ // IF the section is video
        syiro.animation.FadeOut(audioPlayerContainer, function(){
            syiro.CSS(audioPlayerContainer, "display", "none"); // Set display to none
            syiro.CSS(videoPlayerContainer, "display", "block"); // Set display to block
            syiro.CSS(videoPlayerContainer, "visibility", "visible"); // Set visibility to visible

            syiro.animation.FadeIn(videoPlayerContainer); // Fade in the video section
        });
    }
}

/* ================= End of Page Functions ================= */
