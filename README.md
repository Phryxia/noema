This repository is an opiniated boilerplate for my fullstack web app development. I've been tired of scaffolding same structures over and over, so I just created one. I hope this works for most time perfectly and scalable to any situation.

# Features

This project uses following preferences:

## Shared

- [typescript](https://github.com/microsoft/TypeScript)
- [eslint](https://github.com/eslint/eslint)
- [vitest](https://github.com/vitest-dev/vitest)
- npm for both package manager and monorepo manager

## Client

- [react.js](https://github.com/facebook/react)
- [vite](https://github.com/vitejs/vite) on [swc](https://github.com/swc-project/swc)
- [@tanstack/react-router](https://github.com/TanStack/router)
- [@tanstack/react-query](https://github.com/TanStack/query)
- [classnames](https://github.com/JedWatson/classnames)
- [@picocss/pico](https://github.com/picocss/pico)
- [css reset by Josh W Comeau](https://www.joshwcomeau.com/css/custom-css-reset)

## Server

- [fastify](https://github.com/fastify/fastify)
- [tsx](https://github.com/privatenumber/tsx) runtime

For your interests, please checkout `package.json`

# Github Page Deployment

This repository has already equipped github page deployment configuration.

There are two ways to serve this repository as github page.

## Using Github Action

1. (optional) Edit the target branch `.github/workflows/static.yml` (default: `main`)
2. Go to your project's _Settings_ > _Pages_ and Set `Source` as `Github Actions`
3. Push the branch or manually dispatch using button on _Actions_ tab

## Using Branch

1. Go to your project's _Settings_ > _Pages_ and set `Source` to `Deploy from Branch`, target directory to `/docs`
2. (optional) Edit the target branch on _Pages_ and create that git branch on your local
3. Set your working branch as targeted one
4. **Remove `"docs"` from `.gitignore`**
5. Run `npm run build-gh-page`
6. Commit every changes in `/docs` directory
7. Push the branch

# Disclaimer

This repository was created for the personal usages. I'll not receive any changes from others. You can fork and modify based on your preference or situation. But any suggestions or debates are welcome!

Also this repository is **not suitable for complex web app**.

# Useful References

Shout out for the humanity

- [Managing TypeScript Packages in Monorepos by Juri Strumpflohner, January 2025](https://nx.dev/blog/managing-ts-packages-in-monorepos)
