declare module rocket.player {
    function Init(component: Object): void;
}
declare module rocket.component {
    var dropdownToggler: Function;
    var storedComponents: Object;
    function AddListeners(...args: any[]): boolean;
}
declare module rocket {
    function Init(): void;
}
declare module rocket.plugin.alternativeInit {
    function Init(): void;
    function Wait(): void;
}
