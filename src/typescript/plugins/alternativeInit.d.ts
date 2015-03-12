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
    function CSS(component: any, property: string, newValue?: any): any;
    function Scale(component: Object): void;
    function FetchComponentObject(...args: any[]): Object;
    function FetchLinkedListComponentObject(component: any): Object;
}
declare module syiro.events {
    function Add(...args: any[]): boolean;
    var eventStrings: Object;
}
declare module syiro.searchbox {
    function Suggestions(...args: any[]): void;
}
declare module syiro.dropdown {
    var Toggle: Function;
}
declare module syiro.data {
    var storage: Object;
    function Manage(modificationType: string, keyList: string, data?: any): any;
    function Read(keyList: string): any;
    function Write(keyList: string, data: any): any;
    function Delete(keyList: string): any;
}
declare module syiro {
    function Init(): void;
}
declare module syiro.plugin.alternativeInit {
    function Init(): void;
}
