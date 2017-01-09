
### Requirements

Install node and then use npm to install jspm 0.17 globally:

```
npm install -g jspm@beta
```

### Installation

```
npm install
jspm install
```

### Development

Run `npm run watch` to have babel watch the source files (in src/) and
update the transpiled output (in obj/).

Run `npm run serve` to start a webserver on port 8080 then load
`http://localhost:8080/index-dev.html`.

To reduce load time, run `npm run build-dev` to build a bundle
containing the dependencies.
Remember to re-run this command if you change (or update) the
dependencies.

### Production build

```
npm run build
```

Then point the platform to a location serving `index.html`.
