/*
	These are interface extensions so Typescript doesn't freak out.
*/

var WebKitMutationObserver : any;

interface Document { // Document extensions
	// #region Microsoft

	msFullscreenElement : Element;
	msExitFullscreen : Function;

	// #endregion

	// #region Mozilla

	mozFullScreenElement : Element;
	mozCancelFullScreen : Function;

	// #endregion

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