declare var WebKitMutationObserver: any;
declare var ontransitionend: Event;
declare var webkitTransitionEnd: Event;
interface Object {
    id: string;
    type: string;
}
interface Document {
    msFullscreenElement: Element;
    msExitFullscreen: Function;
    mozFullScreenElement: Element;
    mozCancelFullScreen: Function;
    SyiroFullscreenElement: Element;
}
interface Element {
    msRequestFullscreen: Function;
    mozRequestFullScreen: Function;
    ALLOW_KEYBOARD_INPUT: any;
}
interface Navigator {
    doNotTrack: string;
}
interface Screen {
    orientation: any;
    mozOrientation: any;
    onorientationchange: any;
    onmozorientationchange: any;
}
interface Node {
    appendChild(newChild: (Element | HTMLElement)): Node;
    insertBefore(newChild: (Element | HTMLElement), refChild?: (Element | HTMLElement | Node)): Node;
    removeChild(newChild: (Element | HTMLElement)): Node;
}
interface MutationObserver {
    observe(target: HTMLElement, options: MutationObserverInit): void;
}
declare module syiro.plugin.alternativeInit {
    function Init(): void;
    function Wait(): void;
}
declare module syiro.data {
    var storage: Object;
    function Manage(modificationType: string, keyList: string, data?: any): any;
    function Read(keyList: string): any;
    function Write(keyList: string, data: any): any;
    function Delete(keyList: string): any;
}
declare module syiro.utilities {
    function ElementCreator(type: string, attributes: Object): any;
    function SanitizeHTML(content: any): any;
    function SecondsToTimeFormat(seconds: number): Object;
}
declare module syiro.generator {
    var lastUniqueIds: Object;
    function IdGen(type: string): string;
    var ElementCreator: typeof utilities.ElementCreator;
}
declare module syiro.events {
    var eventStrings: Object;
    function Handler(): void;
    function Add(...args: any[]): boolean;
    function Remove(...args: any[]): boolean;
}
declare module syiro.render {
    function Position(...args: any[]): boolean;
    function Scale(component: Object, data?: Object): void;
}
declare module syiro.component {
    function CSS(component: any, property: string, newValue?: (string | boolean)): any;
    function Fetch(component: Object): any;
    function FetchComponentObject(...args: any[]): Object;
    function FetchDimensionsAndPosition(component: any): Object;
    function FetchLinkedListComponentObject(component: any): Object;
    function IsComponentObject(variable: any): boolean;
    function Update(componentId: string, componentElement: Element): void;
    function Add(append: boolean, parentComponent: Object, childComponent: any): boolean;
    function Remove(componentsToRemove: any): void;
}
declare module syiro.animation {
    function Animate(component: any, properties: Object): void;
    function Reset(component: any): void;
    function FadeIn(component: any, postAnimationFunction?: Function): void;
    function FadeOut(component: any, postAnimationFunction?: Function): void;
    function Slide(component: any, postAnimationFunction?: Function): void;
}
declare module syiro.device {
    var DoNotTrack: boolean;
    var HasCryptography: boolean;
    var HasGeolocation: boolean;
    var HasIndexedDB: boolean;
    var HasLocalStorage: boolean;
    var IsOnline: boolean;
    var OperatingSystem: string;
    var SupportsTouch: boolean;
    var IsSubHD: boolean;
    var IsHD: boolean;
    var IsFullHDOrAbove: boolean;
    var Orientation: string;
    var OrientationObject: any;
    function Detect(): void;
    function FetchOperatingSystem(): string;
    function FetchScreenDetails(): void;
    function FetchScreenOrientation(): string;
}
declare module syiro.navbar {
    function Generate(properties: Object): Object;
    function AddLink(append: boolean, component: Object, elementOrProperties: any): boolean;
    function RemoveLink(component: Object, elementOrProperties: any): boolean;
    function SetLogo(component: Object, image: string): boolean;
    function RemoveLogo(component: Object): boolean;
    function SetLabel(component: Object, labelText: string): boolean;
    function RemoveLabel(component: Object): boolean;
}
declare module syiro.header {
    function Generate(properties: Object): Object;
    var SetLogo: typeof navbar.SetLogo;
    var RemoveLogo: typeof navbar.RemoveLogo;
}
declare module syiro.footer {
    function Generate(properties: Object): Object;
    var SetLabel: typeof navbar.SetLabel;
    var AddLink: typeof navbar.AddLink;
    var RemoveLink: typeof navbar.RemoveLink;
}
declare module syiro.button {
    function Generate(properties: Object): Object;
    function SetIcon(component: Object, content: string): boolean;
    function SetImage(component: Object, content: string): boolean;
    function SetText(component: Object, content: string): boolean;
    var SetLabel: Function;
    function Toggle(component?: Object): void;
}
declare module syiro.buttongroup {
    function Generate(properties: Object): {
        "id": string;
        "type": string;
    };
    function CalculateInnerButtonWidth(component: any): HTMLElement;
    function Toggle(buttonComponent?: Object): void;
}
declare module syiro.list {
    function Generate(properties: Object): Object;
    var AddItem: typeof component.Add;
    var RemoveItem: typeof component.Remove;
}
declare module syiro.listitem {
    function Generate(properties: Object): Object;
    function SetControl(component: Object, control: Object): boolean;
    function SetImage(component: Object, content: string): boolean;
    function SetLabel(component: Object, content: string): boolean;
}
declare module syiro.dropdown {
    var FetchLinkedListComponentObject: Function;
    function Generate(properties: Object): Object;
    var Toggle: Function;
    function SetText(component: Object, content: any): boolean;
    var SetIcon: Function;
    function SetImage(component: Object, content: any): boolean;
    function AddItem(component: Object, listItemComponent: Object): void;
    function RemoveItem(component: Object, listItemComponent: Object): void;
}
declare module syiro.player {
    function Init(component: Object): void;
    function CheckIfStreamable(component: Object): void;
    function FetchInnerContentElement(component: Object): HTMLMediaElement;
    function GetPlayerLengthInfo(component: Object): Object;
    function IsPlaying(component: Object): boolean;
    function PlayOrPause(component: Object, playButtonComponentObject?: Object): void;
    function FetchSources(component: Object): Array<Object>;
    function GenerateSources(type: string, sources: any): Array<HTMLElement>;
    function Reset(component: Object): void;
    function SetSources(component: Object, sources: any): void;
    function SetTime(component: Object, time: number): void;
    function SetVolume(component: Object, volume: number): void;
    function ToggleFullscreen(...args: any[]): void;
    function ToggleMenuDialog(component: Object): void;
}
declare module syiro.playercontrol {
    function Generate(properties: Object): Object;
    function TimeLabelUpdater(component: Object, timePart: number, value: any): void;
    function Toggle(component: Object, forceShow?: boolean): void;
}
declare module syiro.audioplayer {
    function Generate(properties: Object): Object;
    function CenterInformation(component: Object): void;
}
declare module syiro.videoplayer {
    function Generate(properties: Object): Object;
}
declare module syiro.searchbox {
    function Generate(properties: Object): Object;
    function Suggestions(...args: any[]): void;
    function SetText(component: Object, placeholderText: any): void;
}
declare module syiro.sidepane {
    function Generate(properties: Object): Object;
    function GestureInit(): void;
    function Drag(): void;
    function Release(): void;
    function Toggle(component: Object, touchData: any): void;
}
declare module syiro {
    var backgroundColor: string;
    var primaryColor: string;
    var secondaryColor: string;
    function Init(): void;
    var CSS: typeof component.CSS;
    var Fetch: typeof component.Fetch;
    var FetchComponentObject: typeof component.FetchComponentObject;
    var FetchDimensionsAndPosition: typeof component.FetchDimensionsAndPosition;
    var FetchLinkedListComponentObject: typeof component.FetchLinkedListComponentObject;
    var IsComponentObject: typeof component.IsComponentObject;
    var Add: typeof component.Add;
    var Remove: typeof component.Remove;
    var Position: typeof render.Position;
}
