# Usability testing

This repo captures usability in two ways:

1. **Documented usability cases** in `docs/testing/usability/**.test.md` (manual review checklist).
2. A lightweight **automated validator** (`npm run test:usability`) that checks the usability matrices are well-formed (tables + required columns + non-empty fields) and emits results used to fill the `Kết quả` column.

> Note: the automated run validates the *test artifacts* (the usability checklist), not end-user UX. Real usability still needs humans.
