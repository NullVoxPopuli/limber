# limber

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

```
TAILWIND_MODE=watch ember s
```

## Running / Development

### Standalone

This build converts ES Modules to CommonJS so that the can be eval'd

1. `pnpm run start` to start the app.

When `pnpm run build` is ran, the app will refresh

### With experimental service worker and import maps

_NOTE: these instructions are incorrect atm_

In 3 separate terminals:

1. `npm run watch-sw`
  - will recompile the service worker as changes are detected
2. `npm run sync`
  - requires this [inotify watch script](https://github.com/NullVoxPopuli/dotfiles/blob/master/home/scripts/watch)
  - copies the service-worker output file to the browser app
3. `SERVICE_WORKER=true npm run start`
  - starts the browser app
4. visit [http://localhost:4200](http://localhost:4200)


## Contributing

PRs always welcome! ❤️

> This section is WIP

In the terminal of your choice, set up `node` to `--trace-warnings` and
`--unhandled-rejects=string`.
I have this in my `~/.bash_profile`
```
export NODE_OPTIONS='--trace-warnings --unhandled-rejections=strict'
```


### Editors

The editor packages only need to be rebuilt if configuration changed.
Otherwise, they are pre-built to help speed up the boot and rebuild times of
the main app.

_To build Monaco_

```bash
yarn build:monaco
```

_To build CodeMirror_
```bash
yarn build:codemirror
```

If the app dev server is active, every time a build for either
of these editors is executed, the app dev server will appropriately
detect the change and reload.

## Special Thanks

Cross-Browser testing provided by <a href='http://browserstack.com' target='_blank'><img src='https://d2ogrdw2mh0rsl.cloudfront.net/production/images/static/header/header-logo.svg'></a>

