# limber

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

```
TAILWIND_MODE=watch ember s
```

## Running / Development

### Standalone

This build converts ES Modules to CommonJS so that the can be eval'd

1. npm run start

### With experimental service worker and import maps

In 3 separate terminals:

1. `npm run watch-sw`
  - will recompile the service worker as changes are detected
2. `npm run sync`
  - requires this [inotify watch script](https://github.com/NullVoxPopuli/dotfiles/blob/master/home/scripts/watch)
  - copies the service-worker output file to the browser app
3. `SERVICE_WORKER=true npm run start`
  - starts the browser app
4. visit [http://localhost:4200](http://localhost:4200)

