/*
	These are interface extensions so Typescript doesn't freak out.
*/

interface Object { // As ComponentObject is inherently an Object, extend the Object interface / type
	id ?: string; // Unique Component ID. Marked as Optional since it only applies for returned Component Objects, syiro.data.storage stores the key / val differently.
	type : string; // Component Type (ex. header)
	link : string; // Used for Link Properties in the Footer
	title : string; // Used for Link Properties in the Footer
	listeners ?: Array<string>; // Define listeners as an array of strings
	handlers ?: Array<Function>; // Define handlers as an array of functions
	HTMLElement ?: Element; // HTMLElement that is really an Element. Only applies in syiro.data.storage when the component is newly generated.
}

interface Document {
	fullscreenElement : Element;
	mozFullScreenElement : Element;
	webkitFullscreenElement : Element;

	exitFullscreen : Function;
	mozCancelFullScreen : Function;
	webkitExitFullscreen : Function;

	SyiroFullscreenElement : Element;
}

interface Element { // Implementation of valid spec not found in lib.d.ts
	requestFullscreen : Function;
	mozRequestFullScreen : Function;
	webkitRequestFullscreen : Function;

	ALLOW_KEYBOARD_INPUT : any;

	parentElement : Element; // Element's parentElement
	offsetTop: number;
	offsetBottom: number;
	offsetLeft : number;
	offsetRight : number;
	offsetHeight : number;
	offsetWidth : number;
}

interface Navigator { // Implementation of valid spec not found in lib.d.ts
	doNotTrack : string; // Define doNotTrack as a string
}

interface HTMLElement { // Implementation of HTMLElement
	autoplay : boolean; // Technically not in spec except for HTMLAudioElement and HTMLVideoElement
}

interface Screen { // Implementation of Screen
	orientation : string;
	mozOrientation : string;
	onorientationchange : any;
	onmozorientationchange : any;
}

interface Window { // Implementation of valid spec not found in lib.d.ts
	crypto : any; // Define crypto as any
	ontouchend : any; // Define ontouchend as any
}

// #region Official Plugins

declare module syiro.plugin.alternativeInit {
	function Init(): void;
	function Wait(): void;
}

// #endregion
