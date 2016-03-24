# Syiro #

Syiro is a highly-focused framework for building front-end applications for devices ranging from mobile to desktop. Syiro utilizes HTML5, CSS3, and Typescript to easily manage front-end application components and is licensed under the Apache 2 licensing.

## FAQ ##

**How does Syiro compare to the likes of Bootstrap and Polymer?**

1. Bootstrap implements components that are redundant given the capabilities of HTML5, such as progress bars, and as a result those frameworks are significantly more bloated and have to provide functionality to help trim out all the unnecessary components they package in.
2. Bootstrap, unlike Syiro, also requires jQuery to do simple functionality like event handing, making the footprint for creating applications significantly larger as well as adding complexity in regards to dependencies.
3. Polymer, just like Bootstrap, requires multiple dependencies and therefore makes rapid development more complex and forces you to rely on tools like Bower for dependency management.
4. Polymer relies on Custom Elements, which is a working draft and is only supported in Chrome, which is neither friendly to the web ecosystem, nor to performance. Users of any browser not using the Blink engine can't utilize Custom Elements without polyfilling. Syiro, on the other hand, leverages the HTML5 standard data-* to define components.
5. Neither Bootstrap nor Polymer offer an easy way to generate components via Javascript. With Syiro you can easily create a component by calling syiro.X.New (where X = the component type).

**You mentioned that Syiro does not rely on jQuery, does that mean I can choose any other JavaScript framework to use with Syiro?**

Absolutely. Since jQuery is not used in Syiro, you will not have to worry about dependency conflicts. All Syiro functionality is encapsulated in our Syiro module. You are free to use the likes of jQuery, Prototype, MooTools, etc.

**How easy is it to modify the theming of Syiro to help my application differentiate?**

Syiro uses LESS / CSS to theme components, making it easy to differentiate your application from the rest. We recommend you take a look at our [theming guide](http://stroblindustries.com/devcenter/index.html?product=syiro&doc=theming).

**What is Syiro's policy on backwards compatibility?**

We have a [document that highlights our policy](http://stroblindustries.com/devcenter/index.html?product=syiro&doc=api-support-policy) on API support and backwards compatibility, so you know exactly when something *could* and when something *shouldn't* break.

## Download ##

You can download our [stable 1.6.0 release](https://github.com/StroblIndustries/Syiro/releases/download/1.6.0/stable.tar.gz) which provides the necessary minified CSS, images and JS wrapped in a nice package.

You can also download our [devel 1.7.0-rc1 release](https://github.com/StroblIndustries/Syiro/releases/download/1.7.0-rc1/devel.tar.xz).

The package also comes with a gzipped version of the JavaScript code, so you can easily serve the compressed content.

### Footprint Comparison ###

Framework | Minified CSS | Minified JS | Gzipped JS
--------------- | ----------------- | --------------- | --------------
Bootstrap 3.3.6 | 36.9kb | 122.5kb | None Provided
Polymer 1.3.1 | Varies depending on use of components | 155.3kb | None Provided
Syiro 1.6.0 | 31.7kb | 63.8kb | 14.4kb
Syiro 1.7.0-rc1 | 29.4kb | 58.1kb | 13.0kb
Syiro (DEV) | 29.0kb | 57.6kb | 12.9kb

Details:

1. Bootstrap's size is also calculating in jQuery `2.2.1`, jQuery being a requirement of Bootstrap.
2. Polymer's minified calculation is based on using:
``` bash
[CustomElement.min.js, HTMLImports.min.js, MutationObserver.min.js, ShadowDOM.min.js, webcomponents-lite.min.js]
```
3. All gzipped  JavaScript was done using [Google's Closure Compiler](https://developers.google.com/closure/compiler/) at "simple" optimizations level.
4. Syiro numbers are updated for stable releases and dev (working branch).

## Contributing ##

This project leverages CodeUtils for development and adopts the CodeUtils Usage Spec. To learn how to contribute to this project and set up CodeUtils, read [here](https://github.com/StroblIndustries/CodeUtils/blob/master/CodeUtils-Usage-Spec.md).

## Using Syiro ##

You can learn how to use Syiro by following documentation at our [Developer Center](http://stroblindustries.com/devcenter/index.html?product=syiro).

## Open Plans And Tasks For Development ##

In this section, we show our plans for Syiro and when we intend on implementing particular features.

- [Current, Upcoming, and Past Releases](http://stroblindustries.com/devcenter/index.html?product=syiro&doc=releases)