/*
	These are interface extensions so Typescript doesn't freak out.
*/

var Promise : any;
var resolve : Function;

interface Document { // Document extensions, primarily Fullscreen API vendor prefixed variables
	msFullscreenElement : Element;
	msExitFullscreen : Function;
	mozFullScreenElement : Element;
	mozCancelFullScreen : Function;

	SyiroFullscreenElement : Element;
}

interface Element { // Element extensions
	msRequestFullscreen : Function; // MS Request Fullscreen
	mozRequestFullScreen : Function; // Mozilla Request Fullscreen
}

interface AnimationOptions extends Object { // AnimationOptions
	animation : "fade-in" | "fade-out" | "slide";
	postAnimationFunc ?: Function;
}

interface ComponentObject extends Object { // Component Object
	id : string; // Define id as a string
	type : string; // Define type as string
}

interface LinkPropertiesObject extends Object { // Link Properties
	link : string; // URL / href
	title : string; // Title / content of A Element
}

interface MutationObserver { // MutationObserver extensions
    observe(target: HTMLElement, options: MutationObserverInit): void; // Allow targetting document.body by setting target as HTMLElement
}

interface Navigator { // Navigator extensions
	doNotTrack : string; // Define doNotTrack as a string
}

interface Node { // Node extensions
	appendChild(newChild : (Element | HTMLElement)) : Node;
	insertBefore(newChild : (Element | HTMLElement), refChild ?: (Element | HTMLElement  | Node)) : Node;
	removeChild(newChild : (Element | HTMLElement)) : Node;
}

interface Screen { // Screen extensions
	orientation : any;
	mozOrientation : any;
	onorientationchange : any;
	onmozorientationchange : any;
}

// #region Component Property Objects

interface ButtonPropertiesObject extends Object { // Properties Object for Button Component
	content ?: string; // Content of Basic and Dropdown type Buttons
	default ?: boolean; // Default state of Toggle type Button
	icon ?: string; // Custom icon that can be used in Basic and Dropdown type Buttons
	image ?: string; // Source of image to use in Basic and Dropdown type Buttons
	items ?: Array<any>; // Define items as an Array
	list ?: ComponentObject; // List ComponentObject
	position ?: Array<string>; // Position of Dropdown type Buttons
	type ?: string; // Type of the Button
}

interface GridPropertiesObject extends Object { // Properties Object for Grid Components
	columns ?: number; // Fixed columns of a Grid (otherwise is dynamic)
	items : Array<GridItemPropertiesObject>; // Array of GridItemPropertiesObject
}

interface GridItemPropertiesObject extends Object { // Properties Object for Grid Item Components
	html ?: any; // HTML content of Grid Item, can be an Element or string
}

interface ListPropertiesObject extends Object { // Properties object for List Components
	header ?: string; // Content of a List Header
	items : Array<any>; // Array of Lists or List Items
}

interface ListItemPropertiesObject extends Object { // Properties object for List Item Components
	control ?: ComponentObject; // ComponentObject of the Control
	html ?: any; // HTML Element or string content
	image ?: string; // Source of image to use in image generation
	label ?: string; // Label content
	link ?: LinkPropertiesObject; // Link Properties
}

interface MediaPlayerPropertiesObject extends Object { // Properties object for Media Player Components
	// Audio-type Media Player properties
	artist ?: string; // Artist of media content (used in Audio-type Media Control)
	title ?: string; // Title of media content (used in Audio-type Media Control)
	generateContentInfo ?: boolean; // If we should generate content information

	// Dimensions
	height ?: number; // Height of the Media Player
	width ?: number; // Width of the Media Player

	art ?: string; // Artwork to use in the Media Player
	ForceLiveUX ?: boolean; // Should we force the Live UX or not
	menu ?: ComponentObject; // List ComponentObject
	sources : Array<string>; // Define sources as an array of URLs (strings)
	type ?: "audio" | "video"; // Type of the Media Player
	UsingExternalLibrary ?: boolean; // Use an external library
}

interface NavbarPropertiesObject extends Object { // Properties object for Navbar Components
	// Bottom-position Navbar properties
	content ?: string; // Content, usually a Copyright section

	// Top-position Navbar properties
	logo ?: string; // Source of the logo to use in the Navbar

	fixed ?: boolean; // Should we have a fixed position
	items : Array<any>; // Items to add to the Navbar
	position ?: "top" | "bottom"; // Position of the Navbar (top or bottom)
}

interface SearchboxPropertiesObject extends Object { // Properties object for Searchbox Components
	content ?: string; // Content of the Searchbox
	DisableInputTrigger ?: boolean; // Disable triggering suggestions on input
	handler ?: Function; // Handler for getting suggestions
	listItemHandler ?: Function; // Function to call when we click List Items from suggestions
	preseed ?: Array<string>; // Preseeded suggestions
	suggestions ?: boolean; // Enabling suggestions
}

interface SidepanePropertiesObject extends Object { // Properties object for Sidepane Components
	items ?: Array<any>; // Array of Items
	logo ?: string; // Source of the logo to use in the Sidepane
	searchbox ?: ComponentObject; // Searchbox Component Object
}

interface ToastPropertiesObject extends Object { // Properties object for Toast Components
	buttons ?: Array<ToastButtonPropertiesObject>; // Array of buttons
	message : string; // Required message in the Toast
	title ?: string; // Title of the Toast
	type ?: "dialog" | "normal"; // Dialog or Normal type Toast
}

interface ToastButtonPropertiesObject extends Object { // Properties of Buttons used in Toasts
	action ?: "affirm" | "deny"; // Affirm or Deny action
	content ?: string; // Content of the button
	function ?: Function; // Function used when clicking the Button
}

// #endregion