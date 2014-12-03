/*
These are interface extensions so Typescript doesn't freak out.
*/

declare module syiro.player {
    function Init(component: Object): void;
}

declare module syiro.device {
    var Detect : Function;
}

declare module syiro.component {
    var listenerStrings : Object;
    var storedComponents: Object;
    function AddListeners(...args: any[]): boolean;
}

declare module syiro.dropdown {
    var Toggle : Function;
}

declare module syiro {
    function Init(): void;
}
