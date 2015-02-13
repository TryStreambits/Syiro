## Syiro ##

Syiro is a highly-focused framework for building front-end applications for devices ranging from mobile to desktop. Syiro utilizes HTML5, CSS3, and Typescript to easily manage front-end application components and is licensed under the Apache 2 licensing.

### FAQ ###

#### How does Syiro compare to the likes of Bootstrap and Polymer? ####

1. Syiro is significantly more focused on functionality and components compared to Bootstrap and Polymer.
2. Bootstrap implements components that are redundant given the capabilities of HTML5, such as progress bars, and as a result those frameworks are significantly more bloated and have to provide functionality to help trim out all the unnecessary components they package in.
3. Bootstrap, unlike Syiro, also requires jQuery to do simple functionality like event handing, making the footprint for creating applications significantly larger as well as adding complexity in regards to dependencies.
4. Polymer, just like Bootstrap, requires multiple dependencies and therefore makes rapid development more complex and forces you to rely on tools like Bower for dependency management.
5. Polymer relies on Custom Elements, which is a working draft and is only supported in Chrome, therefore not friendly to the web as a whole, since users of any browser not using the Blink engine can't utilize Custom Elements without polyfilling. Syiro, on the other hand, leverages the HTML5 standard data-* to define components.
6. Neither Bootstrap nor Polymer offer an easy way to generate components via Javascript. With Syiro you can easily generate a component by calling syiro.X.Generate (where X = the component type).

#### You mentioned that Syiro does not rely on jQuery, does that mean I can choose any other JavaScript framework to use with Syiro? ####

Absolutely. Since jQuery is not used in Syiro, you will not have to worry about dependency conflicts. All Syiro functionality is encapsulated in our Syiro module. You are free to use the likes of jQuery, Prototype, MooTools, etc.

#### How easy is it to modify the theming of Syiro to help my application differentiate? ####

Syiro uses LESS / CSS to theme components, making it easy to differentiate your application from the rest. We recommend you take a look at our [theming guide](https://github.com/StroblIndustries/Syiro/wiki/Theming).

#### What is Syiro's policy on backwards compatibility? ####

We have a [document that highlights our policy](https://github.com/StroblIndustries/Syiro/wiki/API-Support-Policy) on API support and backwards compatibility, so you know exactly when something *could* break and when something *shouldn't* break so you can yell at us!

### Download ###

You can download either our [stable 1.1.0 release](https://github.com/StroblIndustries/Syiro/blob/master/stable.tar.gz) or our [development releases](https://github.com/StroblIndustries/Syiro/blob/master/devel.tar.gz) which provides the necessary minified CSS, images and JS wrapped in a nice package.

The package also comes with a gzipped version of the JavaScript code, so you can easily serve the compressed content.

#### Footprint Comparison ####

Framework | Minified CSS | Minified JS | Gzipped JS
--------------- | ----------------- | --------------- | --------------
Bootstrap | 114kb + 19.2kb (theme.min.css)| 118.9kb | 37.4kb
Polymer | Varies depending on use of components | 123.5kb | 35.7kb
**Syiro** | **13.3kb** | **83.1kb** | **13.6kb**

Details:

1. Bootstrap did not provide a gzipped JavaScript file.
2. Bootstrap's size is also calculating in jQuery, which is a requirement for Bootstrap.
3. Syiro's build script auto-minifies and gzipped JS.
4. All gzipped  JavaScript was done using [zopfli](https://code.google.com/p/zopfli/) with default iterations: `zopfli x.min.js`
5. This is as of 1.1.0 and will update for releases (*aside from release candidates*).

### Using Syiro ###

You can get started using Syiro by using the guide below:

1. [Understanding Syiro Components](https://github.com/StroblIndustries/Syiro/wiki/Understanding-Syiro-Components) - *Honestly not much to understand*
2. [The Components Index](https://github.com/StroblIndustries/Syiro/wiki/Component-Index) - *Like the Pokèdex but for Components*
3. [Managing Components](https://github.com/StroblIndustries/Syiro/wiki/Managing-Components) - *Covers creating both static and dynamically defined Components and other Component functions.*
4. [Syiro's Event System](https://github.com/StroblIndustries/Syiro/wiki/Event-System) - *Covers Syiro's Event System and adding / removing listeners.*
5. [Theming Syiro](https://github.com/StroblIndustries/Syiro/wiki/Theming) - *Yay for writing LESS (see what I did there?)*
6. [Getting Device Information](https://github.com/StroblIndustries/Syiro/wiki/Getting-Device-Information) - *Are you even using a FullHDOrAbove screen, bro?*

We also highly recommend you take a look at the [Additional Component Functions](https://github.com/StroblIndustries/Syiro/wiki/Additional-Component-Functions) page, which goes into detail additional functions that are exposed to particular Components that are certainly useful.

### Open Plans And Tasks For Development ###

In this section, we show our plans for Syiro and when we intend on implementing particular features.

- [Current, Upcoming, and Past Releases](https://github.com/StroblIndustries/Syiro/wiki/Releases)
