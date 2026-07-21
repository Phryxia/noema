# Features

- Any file changes in `shared` package will reboot dev server
- You can import `shared` package using `@rayelxia/shared`

# Warning

`server` package is not mean to be built. It uses `tsx` runtime **directly** with TypeScript source codes. Thanks to the transpiler, it can resolves absolute path using `paths` alias in `tsconfig.json`.

However, if you want to build sources into JavaScript, you must follow one of these:

1. Always use relative path to `shared` package.
2. Build `shared` package into JavaScript and configure build chain to resolve `@rayelxia/shared` to built result properly.
