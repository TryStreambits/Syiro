declare var WebKitMutationObserver: any;
interface Document {
    msFullscreenElement: Element;
    msExitFullscreen: Function;
    mozFullScreenElement: Element;
    mozCancelFullScreen: Function;
    SyiroFullscreenElement: Element;
}
interface Console {
    profileEnd(profile?: string): any;
}
interface Element {
    msRequestFullscreen: Function;
    mozRequestFullScreen: Function;
}
interface ComponentObject extends Object {
    id: string;
    type: string;
}
interface LinkPropertiesObject extends Object {
    link: string;
    title: string;
}
interface MutationObserver {
    observe(target: HTMLElement, options: MutationObserverInit): void;
}
interface Navigator {
    doNotTrack: string;
}
interface Node {
    appendChild(newChild: (Element | HTMLElement)): Node;
    insertBefore(newChild: (Element | HTMLElement), refChild?: (Element | HTMLElement | Node)): Node;
    removeChild(newChild: (Element | HTMLElement)): Node;
}
interface Screen {
    orientation: any;
    mozOrientation: any;
    onorientationchange: any;
    onmozorientationchange: any;
}
declare namespace syiro.data {
    var storage: Object;
    function Manage(modificationType: string, keyList: string, data?: any): any;
    function Read(keyList: string): any;
    function Write(keyList: string, data: any): any;
    function Delete(keyList: string): any;
}
declare namespace syiro.animation {
    function Animate(component: any, properties: Object): void;
    function Reset(component: any): void;
    function FadeIn(component: any, postAnimationFunction?: Function): void;
    function FadeOut(component: any, postAnimationFunction?: Function): void;
    function Slide(component: any, postAnimationFunction?: Function): void;
}
declare namespace syiro.utilities {
    function ElementCreator(type: string, attributes: Object): any;
    function SanitizeHTML(content: any): any;
    function SecondsToTimeFormat(seconds: number): Object;
    function TypeOfThing(thing: any, checkAgainstType?: string): any;
}
declare namespace syiro.generator {
    var ElementCreator: typeof utilities.ElementCreator;
}
declare namespace syiro.events {
    var eventStrings: Object;
    function Handler(): void;
    function Trigger(eventType: string, component: any, eventData?: Event): void;
    function Add(listeners: any, component: any, listenerCallback: Function): boolean;
    function Remove(...args: any[]): boolean;
}
declare namespace syiro.render {
    function Position(positioningList: (string | Array<string>), componentObject: any, relativeComponentObject: any): boolean;
    function Scale(component: ComponentObject, data?: Object): void;
}
declare namespace syiro.component {
    var lastUniqueIds: Object;
    function CSS(component: any, property: string, newValue?: (string | boolean)): any;
    function Fetch(component: ComponentObject): any;
    function FetchComponentObject(...args: any[]): ComponentObject;
    function FetchDimensionsAndPosition(component: any): Object;
    function FetchLinkedListComponentObject(component: any): ComponentObject;
    function IdGen(type: string): string;
    function IsComponentObject(component: any): boolean;
    function Update(componentId: string, componentElement: Element): void;
    function Add(appendOrPrepend: any, parentComponent: any, childComponent: any): boolean;
    function Remove(componentsToRemove: any): void;
}
declare namespace syiro.init {
    function Parser(componentElement: Element): void;
    function createContentOverlay(purpose: string): Element;
    function Buttongroup(component: ComponentObject): void;
    function Grid(component: ComponentObject): void;
    function List(component: ComponentObject): void;
    function MediaPlayer(component: ComponentObject): void;
    function MediaControl(componentObject: ComponentObject, mediaControlComponentObject: ComponentObject): void;
    function Searchbox(component: ComponentObject): void;
    function Sidepane(component: ComponentObject): void;
    function Toast(component: ComponentObject): void;
}
declare namespace syiro.button {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function SetIcon(component: ComponentObject, content: string): boolean;
    function SetImage(component: ComponentObject, content: string): boolean;
    function SetText(component: ComponentObject, content: string): boolean;
    var SetLabel: Function;
    function Toggle(component?: ComponentObject, active?: boolean): void;
}
declare namespace syiro.buttongroup {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function CalculateInnerButtonWidth(component: any): HTMLElement;
    function Toggle(buttonComponent: ComponentObject): void;
}
declare namespace syiro.device {
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
declare module syiro.grid {
    function New(properties: Object): ComponentObject;
    function Scale(component: ComponentObject): void;
}
declare module syiro.griditem {
    function New(properties: Object): ComponentObject;
}
declare namespace syiro.navbar {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function AddLink(append: any, component: ComponentObject, elementOrProperties: any): boolean;
    function RemoveLink(component: ComponentObject, elementOrProperties: any): boolean;
    function SetLogo(component: ComponentObject, content: string): boolean;
    function SetLabel(component: ComponentObject, content: string): boolean;
}
declare namespace syiro.list {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function SetHeader(component: ComponentObject, content: any): void;
    function Toggle(component: any): void;
    var AddItem: typeof component.Add;
    var RemoveItem: typeof component.Remove;
}
declare namespace syiro.listitem {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function SetControl(component: ComponentObject, control: ComponentObject): boolean;
    function SetImage(component: ComponentObject, content: string): boolean;
    function SetLabel(component: ComponentObject, content: string): boolean;
    function SetLink(component: ComponentObject, properties: any): boolean;
}
declare module syiro.mediaplayer {
    function New(properties: Object): ComponentObject;
    function CenterInformation(component: ComponentObject): void;
    function Configure(component: ComponentObject): void;
    function DurationChange(component: ComponentObject): void;
    function FetchInnerContentElement(component: ComponentObject): HTMLMediaElement;
    function FetchSources(component: ComponentObject): Array<Object>;
    function GenerateSources(type: string, sources: Array<string>): Array<HTMLElement>;
    function GetPlayerLengthInfo(component: ComponentObject): Object;
    function IsPlayable(component: ComponentObject, returnIsStreamble?: boolean): (string | boolean);
    function IsPlaying(component: ComponentObject): boolean;
    function IsStreamable(component: ComponentObject): boolean;
    function PlayOrPause(component: ComponentObject, playButtonObjectOrElement?: any): void;
    function Reset(component: ComponentObject): void;
    function SetSources(component: ComponentObject, sources: any): void;
    function SetTime(component: ComponentObject, setting: any): void;
    function SetVolume(component: ComponentObject, volume: number, fromEvent?: string): void;
    function ToggleFullscreen(component: ComponentObject): void;
    function ToggleMenuDialog(component: ComponentObject): void;
}
declare module syiro.mediacontrol {
    function New(properties: Object): ComponentObject;
    function ShowVolumeSlider(mediaControlComponent: ComponentObject, volumeButtonComponent: ComponentObject): void;
    function TimeLabelUpdater(component: ComponentObject, timePart: number, value: any): void;
    function Toggle(component: ComponentObject, forceShow?: boolean): void;
}
declare namespace syiro.player {
    var New: typeof mediaplayer.New;
    var Generate: typeof mediaplayer.New;
    var DurationChange: typeof mediaplayer.DurationChange;
    var FetchInnerContentElement: typeof mediaplayer.FetchInnerContentElement;
    var FetchSources: typeof mediaplayer.FetchSources;
    var GenerateSources: typeof mediaplayer.GenerateSources;
    var GetPlayerLengthInfo: typeof mediaplayer.GetPlayerLengthInfo;
    var IsPlaying: typeof mediaplayer.IsPlaying;
    var IsPlayable: typeof mediaplayer.IsPlayable;
    var IsStreamable: typeof mediaplayer.IsStreamable;
    var PlayOrPause: typeof mediaplayer.PlayOrPause;
    var Reset: typeof mediaplayer.Reset;
    var SetSources: typeof mediaplayer.SetSources;
    var SetTime: typeof mediaplayer.SetTime;
    var SetVolume: typeof mediaplayer.SetVolume;
    var ToggleFullscreen: typeof mediaplayer.ToggleFullscreen;
    var ToggleMenuDialog: typeof mediaplayer.ToggleMenuDialog;
}
declare namespace syiro.playercontrol {
    var New: typeof mediacontrol.New;
    var Generate: typeof mediacontrol.New;
    var ShowVolumeSlider: typeof mediacontrol.ShowVolumeSlider;
    var TimeLabelUpdater: typeof mediacontrol.TimeLabelUpdater;
    var Toggle: typeof mediacontrol.Toggle;
}
declare namespace syiro.audioplayer {
    function New(properties: Object): ComponentObject;
    var CenterInformation: typeof mediaplayer.CenterInformation;
}
declare namespace syiro.videoplayer {
    function New(properties: Object): ComponentObject;
}
declare namespace syiro.searchbox {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function Suggestions(...args: any[]): void;
    function SetText(component: ComponentObject, content: any): void;
}
declare namespace syiro.sidepane {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function GestureInit(): void;
    function Drag(): void;
    function Release(): void;
    function Toggle(component: ComponentObject, eventData?: any): void;
}
declare namespace syiro.toast {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function Clear(component: ComponentObject): void;
    function ClearAll(): void;
    function Toggle(component: ComponentObject, action?: string): void;
}
declare namespace syiro {
    var page: Element;
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
