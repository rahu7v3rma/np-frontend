# np-frontend

This is a monorepo containing the different frontend projects of the Nicklas+ platform.

## Directory

### [employee-site](employee-site/README.md)

This is the webapp that employees will be able to access to see the available products, make an order etc.

## Backend mocks

An OpenAPI specification is available in the `openapi` folder. A package manifest is also available to enable running a mock server easily which can be used for connecting APIs without an active backend.

To start the mock server, install dependencies in that folder and start it:

```bash
$ cd openapi
$ npm install
$ npm start
```

You can also start the mock server yourself if you wish to change execution flags:

```bash
$ npx prism mock -p 8000 ./spec.yaml
```

Available endpoints may change in the future. Check out the list of them when the mock server is started.
