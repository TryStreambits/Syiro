/*
	These are interface extensions so Typescript doesn't freak out.
*/

var WebKitMutationObserver : any;
var ontransitionend : Event;
var webkitTransitionEnd : Event;

// #region Extended Object Interface

interface Object { // As ComponentObject is inherently an Object, extend the Object interface / type
	id : string; // Unique Component ID. Marked as Optional since it only applies for returned Component Objects, syiro.data.storage stores the key / val differently.
	type : string; // Component Type (ex. navbar)
}

// #endregion

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

// #region Extended Element Interface

interface Element {
	// #region Microsoft
	
	msRequestFullscreen : Function;
	
	// #endregion

	// #region Mozilla
	
	mozRequestFullScreen : Function;
	
	// #endregion

	ALLOW_KEYBOARD_INPUT : any;
}

// #endregion

interface Navigator { // Implementation of valid spec not found in lib.d.ts
	doNotTrack : string; // Define doNotTrack as a string
}

// #region Extended Screen Interface

interface Screen {
	orientation : any;
	mozOrientation : any;
	onorientationchange : any;
	onmozorientationchange : any;
}

// #endregion

// #region Extended Node Interface

interface Node {
	appendChild(newChild : (Element | HTMLElement)) : Node;
	insertBefore(newChild : (Element | HTMLElement), refChild ?: (Element | HTMLElement  | Node)) : Node;
	removeChild(newChild : (Element | HTMLElement)) : Node;
}

// #enderegion

// #region Extended MutationObserver Interface

interface MutationObserver {
    observe(target: HTMLElement, options: MutationObserverInit): void; // Allow targetting document.body by setting target as HTMLElement
}

// #endregion