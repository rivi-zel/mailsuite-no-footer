# Mailsuite - No Footer

An unofficial patched copy of Mailsuite **12.96.1** for Chrome. Its automatic promotional footer and unsubscribe link are disabled. The tracking code is unchanged; test it after installing.

## Install

1. Download this repository as a ZIP and extract it.
2. Disable or remove the store-installed Mailsuite to avoid conflicts.
3. Open `chrome://extensions` and enable **Developer mode**.
4. Click **Load unpacked** and choose the folder containing `manifest.json`.
5. Send yourself a test email: check that there is no footer and opens still register.

## Updates

The extension checks this repository's `version.json` on installation/startup and then daily, at most once per 24 hours. A newer version triggers a Chrome notification each day until it is installed; click it to open the repository. Updates are installed manually. Checks fail silently while this repo is private or unavailable. Chrome/OS notification settings may hide the notification.

To publish an update, commit the new extension files with a higher `manifest.json` version and set `version.json` to that same version, with short release notes. Keep the default branch named `main`. Changing the repository name or owner requires updating `update-checker.js`. The update feed works once the repository is public.

## Patch & credit

The footer gate in `scripts/bundles/gmail.end.bundle.js` returns `false`. A separate background wrapper loads the original background code and the update checker. Chrome-generated `_metadata` files are omitted for unpacked installation.

Original extension and branding belong to [Mailsuite](https://mailsuite.com). This build is not affiliated with or endorsed by Mailsuite. No rights to redistribute the original extension are granted here; check the applicable terms before making this repository public.
