# TikTok Ads CLI Enhancements Implementation Plan

> **For Hermes:** Execute this plan directly with strict TDD discipline for each behavior change.

**Goal:** Upgrade the existing TikTok Marketing API CLI skeleton with media upload support, normalized common arguments, validation, pagination helpers, and table output so it is materially closer to lanbow-ads usability.

**Architecture:** Keep the current small Node.js module layout. Add focused helpers for argument parsing, normalization, table formatting, and multipart upload. Preserve the low-level pass-through `--payload/--query` escape hatch while layering ergonomic flags on top for common workflows.

**Tech Stack:** Node.js 18+, built-in fetch/FormData/File APIs, node:test, ES modules.

---

### Task 1: Add failing tests for parsing common flags and output mode
**Objective:** Lock expected behavior for `--format`, `--page-size`, `--page`, and common create/list convenience flags.

**Files:**
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/test/commands.test.js`
- Create: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/normalize.js`

**Step 1:** Write tests for normalized campaign create/list/report parsing.
**Step 2:** Run `node --test` and confirm failure.
**Step 3:** Implement minimal normalization helpers.
**Step 4:** Run `node --test` and confirm pass.

### Task 2: Add failing tests for table formatting
**Objective:** Verify list/report commands can render array/object results as a readable table when `--format table` is requested.

**Files:**
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/test/commands.test.js`
- Create: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/output.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/cli.js`

**Step 1:** Add tests for table rendering on synthetic rows.
**Step 2:** Run `node --test` and confirm failure.
**Step 3:** Implement minimal table output support.
**Step 4:** Run `node --test` and confirm pass.

### Task 3: Add failing tests for multipart media upload plumbing
**Objective:** Verify upload commands construct request metadata and file handling without requiring real credentials in unit tests.

**Files:**
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/test/commands.test.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/http.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/client.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/commands.js`

**Step 1:** Add tests around image/video upload command parsing and client invocation.
**Step 2:** Run `node --test` and confirm failure.
**Step 3:** Implement multipart upload support and commands.
**Step 4:** Run `node --test` and confirm pass.

### Task 4: Add validation for required fields on ergonomic commands
**Objective:** Prevent obviously invalid command invocations before hitting TikTok API.

**Files:**
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/test/commands.test.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/normalize.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/commands.js`

**Step 1:** Add tests for missing required fields (e.g. campaign name, file path).
**Step 2:** Run `node --test` and confirm failure.
**Step 3:** Implement validation helpers.
**Step 4:** Run `node --test` and confirm pass.

### Task 5: Update help text and README
**Objective:** Document new commands and common flag shortcuts.

**Files:**
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/src/commands.js`
- Modify: `/Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli/README.md`

**Step 1:** Extend help examples.
**Step 2:** Update README usage section.
**Step 3:** Run `node ./bin/tiktok-ads.js help` and verify output.

### Task 6: Run full verification
**Objective:** Ensure the upgraded CLI works as documented.

**Files:**
- Verify only

**Step 1:** Run `node --test`.
**Step 2:** Run help command.
**Step 3:** Run auth status with env vars.
**Step 4:** Run at least one normalized command locally (no network if possible).
