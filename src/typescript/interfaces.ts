/*
	These are interface extensions so Typescript doesn't freak out.
*/

var WebKitMutationObserver : any;

// #region Extended Document Interface

interface Document {
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

// #endregion

// #region Component Object

interface ComponentObject extends Object {

}

// #endregion

interface Console { // Implement Mozilla Console Profile spec.
	profileEnd(profile ?: string);
}

// #region Extended Element Interface

interface Element {
	msRequestFullscreen : Function; // MS Request Fullscreen
	mozRequestFullScreen : Function; // Mozilla Request Fullscreen
}

// #endregion

// #region Component Object

interface ComponentObject extends Object {
	id : string; // Define id as a string
	type : string; // Define type as string
}

// #endregion

// #region Link Properties Object

interface LinkPropertiesObject extends Object {
	link : string; // URL / href
	title : string; // Title / content of A Element
}

// #endregion

// #region MutationObserver Interface extensions

interface MutationObserver {
    observe(target: HTMLElement, options: MutationObserverInit): void; // Allow targetting document.body by setting target as HTMLElement
}

// #endregion

// #region Navigator interface extensions

interface Navigator { // Implementation of valid spec not found in lib.d.ts
	doNotTrack : string; // Define doNotTrack as a string
}

// #endregion

// #region Node interface extensions

interface Node {
	appendChild(newChild : (Element | HTMLElement)) : Node;
	insertBefore(newChild : (Element | HTMLElement), refChild ?: (Element | HTMLElement  | Node)) : Node;
	removeChild(newChild : (Element | HTMLElement)) : Node;
}

// #enderegion

// #region Screen interface extensions

interface Screen {
	orientation : any;
	mozOrientation : any;
	onorientationchange : any;
	onmozorientationchange : any;
}

// #endregion