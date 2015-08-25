declare var WebKitMutationObserver: any;
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
}
interface Navigator {
    doNotTrack: string;
}
interface Console {
    profileEnd(profile?: string): any;
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
declare module syiro.data {
    var storage: Object;
    function Manage(modificationType: string, keyList: string, data?: any): any;
    function Read(keyList: string): any;
    function Write(keyList: string, data: any): any;
    function Delete(keyList: string): any;
}
declare module syiro.animation {
    function Animate(component: any, properties: Object): void;
    function Reset(component: any): void;
    function FadeIn(component: any, postAnimationFunction?: Function): void;
    function FadeOut(component: any, postAnimationFunction?: Function): void;
    function Slide(component: any, postAnimationFunction?: Function): void;
}
declare module syiro.utilities {
    function ElementCreator(type: string, attributes: Object): any;
    function SanitizeHTML(content: any): any;
    function SecondsToTimeFormat(seconds: number): Object;
    function TypeOfThing(thing: any, checkAgainstType?: string): any;
}
declare module syiro.generator {
    var ElementCreator: typeof utilities.ElementCreator;
}
declare module syiro.events {
    var eventStrings: Object;
    function Handler(): void;
    function Trigger(eventType: string, component: any, eventData?: Event): void;
    function Add(listeners: any, component: any, listenerCallback: Function): boolean;
    function Remove(...args: any[]): boolean;
}
declare module syiro.render {
    function Position(positioningList: (string | Array<string>), componentObject: (Object | Element), relativeComponentObject: (Object | Element)): boolean;
    function Scale(component: Object, data?: Object): void;
}
declare module syiro.component {
    var lastUniqueIds: Object;
    function CSS(component: any, property: string, newValue?: (string | boolean)): any;
    function Fetch(component: Object): any;
    function FetchComponentObject(...args: any[]): Object;
    function FetchDimensionsAndPosition(component: any): Object;
    function FetchLinkedListComponentObject(component: any): Object;
    function IdGen(type: string): string;
    function IsComponentObject(component: any): boolean;
    function Update(componentId: string, componentElement: Element): void;
    function Add(appendOrPrepend: any, parentComponent: any, childComponent: any): boolean;
    function Remove(componentsToRemove: any): void;
}
declare module syiro.init {
    function Parser(componentElement: Element): void;
    function createContentOverlay(purpose: string): Element;
    function Buttongroup(component: Object): void;
    function List(component: Object): void;
    function Player(component: Object): void;
    function PlayerControl(componentObject: Object, playerControlComponentObject: Object): void;
    function Searchbox(component: Object): void;
    function Sidepane(component: Object): void;
    function Toast(component: Object): void;
}
declare module syiro.device {
    var DoNotTrack: boolean;
    var HasCryptography: boolean;
    var HasGeolocation: boolean;
    var HasIndexedDB: boolean;
    var HasLocalStorage: boolean;
    var IsOnline: boolean;
    var OperatingSystem: string;
    var SupportsMutationObserver: boolean;
    var SupportsTouch: boolean;
    var IsSubHD: boolean;
    var IsHD: boolean;
    var IsFullHDOrAbove: boolean;
    var Orientation: string;
    var OrientationObject: any;
    var height: number;
    var width: number;
    function Detect(): void;
    function FetchOperatingSystem(): string;
    function FetchScreenDetails(): void;
    function FetchScreenOrientation(): string;
}
declare module syiro.navbar {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function AddLink(append: boolean, component: Object, elementOrProperties: any): boolean;
    function RemoveLink(component: Object, elementOrProperties: any): boolean;
    function SetLogo(component: Object, content: string): boolean;
    function SetLabel(component: Object, content: string): boolean;
}
declare module syiro.button {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function SetIcon(component: Object, content: string): boolean;
    function SetImage(component: Object, content: string): boolean;
    function SetText(component: Object, content: string): boolean;
    var SetLabel: Function;
    function Toggle(component?: Object, active?: boolean): void;
}
declare module syiro.buttongroup {
    function New(properties: Object): {
        "id": string;
        "type": string;
    };
    var Generate: typeof New;
    function CalculateInnerButtonWidth(component: any): HTMLElement;
    function Toggle(buttonComponent?: Object): void;
}
declare module syiro.list {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function SetHeader(component: Object, content: any): void;
    function Toggle(component: any): void;
    var AddItem: typeof component.Add;
    var RemoveItem: typeof component.Remove;
}
declare module syiro.listitem {
    function New(properties: Object): Object;
    var Generate: typeof New;
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
    function DurationChange(component: Object): void;
    function FetchInnerContentElement(component: Object): HTMLMediaElement;
    function FetchSources(component: Object): Array<Object>;
    function GetPlayerLengthInfo(component: Object): Object;
    function IsPlayable(component: Object): boolean;
    function IsPlaying(component: Object): boolean;
    function IsStreamable(component: Object): boolean;
    function GenerateSources(type: string, sources: Array<string>): Array<HTMLElement>;
    function PlayOrPause(component: Object, playButtonObjectOrElement?: any): void;
    function Reset(component: Object): void;
    function SetSources(component: Object, sources: any): void;
    function SetTime(...args: any[]): void;
    function SetVolume(component: Object, volume: number, fromEvent?: string): void;
    function ToggleFullscreen(component: Object): void;
    function ToggleMenuDialog(component: Object): void;
}
declare module syiro.playercontrol {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function ShowVolumeSlider(playerControlComponent: Object, volumeButtonComponent: Object): void;
    function TimeLabelUpdater(component: Object, timePart: number, value: any): void;
    function Toggle(component: Object, forceShow?: boolean): void;
}
declare module syiro.audioplayer {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function CenterInformation(component: Object): void;
}
declare module syiro.videoplayer {
    function New(properties: Object): Object;
    var Generate: typeof New;
}
declare module syiro.searchbox {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function Suggestions(...args: any[]): void;
    function SetText(component: Object, content: any): void;
}
declare module syiro.sidepane {
    function New(properties: Object): Object;
    var Generate: typeof New;
    function GestureInit(): void;
    function Drag(): void;
    function Release(): void;
    function Toggle(component: Object, eventData?: any): void;
}
declare module syiro.toast {
    function New(properties: Object): {
        "id": string;
        "type": string;
    };
    var Generate: typeof New;
    function Clear(component: Object): void;
    function ClearAll(): void;
    function Toggle(component: Object, action?: string): void;
}
declare module syiro {
    var backgroundColor: string;
    var primaryColor: string;
    var secondaryColor: string;
    var legacyDimensionsDetection: boolean;
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
    var Scale: typeof render.Scale;
}
