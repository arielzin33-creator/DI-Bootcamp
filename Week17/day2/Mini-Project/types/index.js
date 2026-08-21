// Intentionally empty.
//
// This package ships *only* types (see index.d.ts). Every export there is an
// `interface`, so `import type { ... } from "@storyapp/types"` is erased at compile
// time and nothing is ever required at runtime. This file exists purely so that the
// package still resolves if some tool follows the "main" field.
module.exports = {};
