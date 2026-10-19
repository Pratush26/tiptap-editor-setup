1. `npm install`
1. `npm test`
1. `npm run build`

## Choose according to the requirement
### Bug fixes (1.0.0 → 1.0.1)
`npm version patch`

### New backward-compatible features (1.0.0 → 1.1.0)
`npm version minor`

### Breaking changes (1.0.0 → 2.0.0)
`npm version major`

---

1. `npm login`
1. `npm whoami`

### For a scoped package that should be public, such as @myname/my-package:
----
`npm publish --access public`

### Otherwise for normal public package
----
`npm publish`
