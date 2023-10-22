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

[ionic-toggle]: https://ionicframework.com/docs/api/toggle

