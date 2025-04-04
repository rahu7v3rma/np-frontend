<img width="1417" alt="Screenshot 2025-03-28 at 3 00 41 PM" src="https://github.com/user-attachments/assets/f10fb20a-2e92-4ade-a3be-26feb523ca80" />
<img width="1416" alt="Screenshot 2025-03-28 at 2 58 26 PM" src="https://github.com/user-attachments/assets/fb731ec0-2e86-45d9-b0a3-3a78e5682ffb" />
<img width="1416" alt="Screenshot 2025-03-28 at 3 31 03 PM" src="https://github.com/user-attachments/assets/f6833b81-722b-4cce-b04a-442c9e548756" />

https://www.nicklas.co.il/

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
