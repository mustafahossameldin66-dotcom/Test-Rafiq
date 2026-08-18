# V74 Structural Audit

- Removed duplicate `<!DOCTYPE html>`; exactly one doctype remains.
- Exactly one visible `<main>` remains.
- No `<style>` elements remain inside `<body>`.
- Removed block-level `<div>/<h3>` children from interactive `<button>` elements; replaced them with phrasing `<span>` content.
- All static buttons in the document have `type="button"`.
- All 7 inline JavaScript blocks parse successfully with `new Function()`.
- The reported parser error at line 2 was caused by the duplicate doctype in V73; this is fixed in V74.
