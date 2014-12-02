/*
These are interface extensions so Typescript doesn't freak out.
*/

declare module rocket.player {
    function Init(component: Object): void;
}

declare module rocket.device {
    var Detect : Function;
}

declare module rocket.component {
    var listenerStrings : Object;
    var storedComponents: Object;
    function AddListeners(...args: any[]): boolean;
}

declare module rocket.dropdown {
    var Toggle : Function;
}

declare module rocket {
    function Init(): void;
}
