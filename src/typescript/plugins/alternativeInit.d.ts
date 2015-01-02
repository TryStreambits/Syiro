declare module syiro.player {
    function Init(component: Object): void;
}
declare module syiro.device {
    var Detect: Function;
}
declare module syiro.component {
    var listenerStrings: Object;
    var componentData: Object;
    function AddListeners(...args: any[]): boolean;
    function Scale(component: Object): void;
}
declare module syiro.dropdown {
    var Toggle: Function;
}
declare module syiro {
    function Init(): void;
}
declare module syiro.plugin.alternativeInit {
    function Init(): void;
}
