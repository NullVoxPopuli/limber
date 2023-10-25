Since web components are inherently supported by ember, 
we follow the docs exactly with combining previous ideas from this tutorial.

In this chapter, we'll focus on the [Ionic Framework's Toggle][ionic-toggle] component.

Properties in web components are set the same way as on native elements.
```hbs
checked="{{ same value }}"
```
and even though web components can bind to custom events, we can still use the `on` modifier
to easily bind to the toggle component's `ionChange` event.
```hbs
{{on 'ionChange' someHandler}}
```

and putting it altogether, you may end up with something like this:

```hbs
<ion-toggle checked="{{this.isOn}}" {{on "ionChange" this.toggle}}>
  toggle the state!
</ion-toggle>
```

-----------

Note that in this chapter, we're including the ionic toggle from CDN:
```hbs
<script src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic.js"></script>
```

in a real app, you may want to import this directly, which may have varying details, based on the web-component library you're using. 
In this case, using `@ionic/core`, [they recommend][ionic-readme]:
```js
import { defineCustomElement } from "@ionic/core/components/ion-toggle.js";
import { initialize } from "@ionic/core/components";

// Initializes the Ionic config and `mode` behavior
initialize();

// or
//  Defines the `ion-toggle` web component
defineCustomElement();
```


[ionic-toggle]: https://ionicframework.com/docs/api/toggle
[ionic-readme]: https://github.com/ionic-team/ionic-framework/tree/main/core#custom-elements-build

