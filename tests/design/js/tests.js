/// <reference path="syiro.d.ts" />
/// <reference path="perfily.d.ts" />

var perfilyInstance = new Perfily({ "autoclearExpecting" : true } ); // Create a new Perfily Instance with autoclearExpecting set to true

// #region Global Variables

var generatedSyiroElement; // Define generatedSyiroElement as the element generated by the ElementCreator
var timeValidObject = syiro.utilities.SecondsToTimeFormat(4523); // Create a "valid" time Object to use with the Perfily instance
var syiroGeneratedListItem;
var syiroGeneratedList;
var syiroGeneratedBasicButton;
var syiroGeneratedToggleButton;
var syiroGeneratedButtongroup;

// #endregion

function RunBenchmarks(){

	// #region Syiro Init Benchmark

	perfilyInstance.SetName("Syiro Init");
	perfilyInstance.SetFunction(function(){ // Set function to call syiro.Init()
		syiro.Init();
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro ElementCreator Benchmark

	perfilyInstance.SetName("Syiro ElementCreator");
	perfilyInstance.SetFunction(function(){ // Set function to generate Element
		generatedSyiroElement = syiro.utilities.ElementCreator("p", { "content" : "Example paragraph" });
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro SecondsToTimeFormat Benchmark

	perfilyInstance.SetName("Syiro SecondsToTimeFormat");
	perfilyInstance.SetExpecting(JSON.stringify(timeValidObject)); // Compare the JSON of timeValidObject with that provided by SecondsToTimeFormat
	perfilyInstance.SetFunction( function(){
		var localTimeObject = syiro.utilities.SecondsToTimeFormat(4523);
		return JSON.stringify(localTimeObject);
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro Add() Benchmark

	perfilyInstance.SetName("Syiro Add");
	perfilyInstance.SetFunction(function(){
		syiro.component.Add("append", document.body, generatedSyiroElement); // Add a component or Element via Syiro
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro Remove() Benchmark

	perfilyInstance.SetName("Syiro Remove");
	perfilyInstance.SetFunction(function(){
		syiro.component.Remove(generatedSyiroElement); // Remove a component or Element via Syiro
	});

	perfilyInstance.Run();

	// #endregion

	BenchmarkComponents(); // Generate and Benchmark Components
}

function BenchmarkComponents(){
	// #region Syiro New List Item Benchmark

	perfilyInstance.SetName("Syiro New List Item");
	perfilyInstance.SetFunction(function(){
		syiroGeneratedListItem = syiro.listitem.New({ "label" : "List Item" });
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro New List Benchmark

	perfilyInstance.SetName("Syiro New List");
	perfilyInstance.SetFunction(function(){
		syiroGeneratedList = syiro.list.New({ "items" : [syiroGeneratedListItem] });
	});

	perfilyInstance.Run(); // Run syiroListPerfilyInstance

	// #endregion

	// #region Syiro New Navbar Benchmark

	perfilyInstance.SetName("Syiro New Navbar");
	perfilyInstance.SetFunction(function(){
		syiro.navbar.New({ "items" : [{ "link" : "http://syiro.com", "title" : "Syiro"}], "position" : "fixed" });
	});

	perfilyInstance.Run(); // Run syiroNavbarPerfilyInstance

	// #endregion

	// #region Syiro New Searchbox Benchmark

	perfilyInstance.SetName("Syiro New Searchbox");
	perfilyInstance.SetFunction(function(){
		syiro.searchbox.New({ "content" : "Type your things..." });
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro New Sidepane Benchmark

	perfilyInstance.SetName("Syiro New Sidepane");
	perfilyInstance.SetFunction(function(){
		syiro.sidepane.New({ "header" : "Sidepane Header", "items" : [ syiroGeneratedList ] });
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro New Toast Benchmark

	perfilyInstance.SetName("Syiro New Toast");
	perfilyInstance.SetFunction(function(){
		syiro.toast.New({ "type" : "normal", "title" : "This is a Toast!", "message" : "This is a message!" });
	});

	perfilyInstance.Run();

	// #endregion

	TestButtongroupAndButtons(); // Run the benchmarking of Buttongroup and Buttons
}

function TestButtongroupAndButtons(){
	// #region Syiro New Basic Button Benchmark

	perfilyInstance.SetName("Syiro New Basic Button");
	perfilyInstance.SetFunction( function(){
		syiroGeneratedBasicButton = syiro.button.New({"type" : "basic", "content" : "Basic Button"});
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro New Toggle Button Benchmark

	perfilyInstance.SetName("Syiro New Toggle Button");
	perfilyInstance.SetFunction(function(){
		syiroGeneratedToggleButton = syiro.button.New({"type" : "toggle", "default" : true});
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro New Buttongroup Benchmark

	perfilyInstance.SetName("Syiro New Buttongroup");
	perfilyInstance.SetFunction(function(){
		syiroGeneratedButtongroup = syiro.buttongroup.New({
			"items" : [ syiroGeneratedBasicButton, { "content" : "Button2" }, { "content" : "Button3" } ],
			"active" : 2
		});
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro Basic Button Function Benchmarking

	perfilyInstance.SetName("Button SetIcon");
	perfilyInstance.SetFunction(function(){
		syiro.button.SetIcon(syiroGeneratedBasicButton, "img/message-inverted.png");
	});

	perfilyInstance.Run();

	perfilyInstance.SetName("Button SetImage");
	perfilyInstance.SetFunction(function(){
		syiro.button.SetImage(syiroGeneratedBasicButton, "img/message-inverted.png");
	});

	perfilyInstance.Run();

	perfilyInstance.SetName("Button SetText");
	perfilyInstance.SetFunction(function(){
		syiro.button.SetText(syiroGeneratedBasicButton, "Text");
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro Toggle Button Function Benchmarking

	perfilyInstance.SetName("Toggle Button - Toggle Function");
	perfilyInstance.SetFunction(function(){
		syiro.button.Toggle(syiroGeneratedToggleButton);
	});

	perfilyInstance.Run();

	// #endregion

	// #region Syiro Buttongroup Function Benchmarking

	perfilyInstance.SetName("Buttongroup Toggle");
	perfilyInstance.SetFunction(function(){
		syiro.buttongroup.Toggle(syiroGeneratedBasicButton);
	});

	perfilyInstance.Run();

	// #endregion
}

function TestPlayerFunctionality(){

}