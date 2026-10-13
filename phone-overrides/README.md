# VH investigator phone — custom wallpaper

The investigator phone keeps the iOS lock screen and unlocks straight to the three-app Home screen (no passcode).

## Replace the phone screen wallpaper

1. Prepare a portrait PNG image, ideally 640 × 1136 px (same 320:568 aspect ratio as the simulated iPhone).
2. In this GitHub folder (`phone-overrides/`), use **Add file → Upload files** and name the image exactly `phone_screen.png`.
3. Commit to `main`. The **Build VH three-app phone** workflow will automatically copy it to `phone/assets/screen/phone_screen.png` and deploy the site.
4. Hard-refresh the page if the old wallpaper is cached.

The image affects the wallpaper behind the lock screen and Home icons; it does not replace app screens. Do not upload it directly under `phone/assets/` because the sync workflow regenerates that folder from the Cauã source.

Alternatively, send the PNG to ChatGPT to have it installed in the VH repository.
