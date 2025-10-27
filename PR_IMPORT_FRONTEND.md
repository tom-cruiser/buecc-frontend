PR: Import local frontend (admin/property form updates)

What this PR contains
- Import of local frontend files into repository (initial import branch `import-local-frontend`).
- Major changes to `src/components/admin/PropertyForm.tsx` to accept multiple image sources (uploaded files + external URLs), bulk-paste input for amenities/features, and refined UI layout.

Why
- Align frontend with backend data shape and improve admin UX for property creation and editing.

Testing checklist (manual)
- [ ] Start the frontend dev server (`cd project && npm install && npm run dev`).
- [ ] Open the Admin -> Properties page and open the Create Property modal.
- [ ] Add title/description/price/location and add external image URL and local file upload; submit and verify API payload by inspecting network request:
    - The request should be FormData with a `property` field (JSON) and `images` files appended.
- [ ] Test editing an existing property; ensure existing images render and can be removed.

Notes
- There were TypeScript and lint fixes applied; please run your standard CI checks.
- If you'd like, I can add a small Cypress/Playwright smoke test that opens the create modal and submits a sample property.
