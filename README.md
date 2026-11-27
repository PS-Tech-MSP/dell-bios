# PS Tech BIOS Setup Training Simulator

A front-end-only simulator of the current Dell BIOS Setup UI, used by PS Tech to talk end users through BIOS changes over the phone. All system data (service tags, MACs, versions, logs) is synthetic. Not affiliated with Dell. No Dell logos or artwork are used.

Stack: Vite + React + TypeScript (strict), Zustand (persisted to localStorage key `pst-bios-sim`), CSS Modules plus `src/styles/theme.css`. No router, no CDNs, no runtime API calls.

## Run locally

Needs Node 20+.

```powershell
npm install
npm run dev
```

If your endpoint-protection (e.g. ThreatLocker) blocks the `npm`/`.bin` shims, run the tools through node directly:

```powershell
node node_modules/vite/bin/vite.js
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
```

## Build

```powershell
npm run build      # tsc -b && vite build, output in dist/
npx vite preview   # serves dist/ locally
```

## Deploy to cPanel

`vite.config.ts` sets `base: './'`, so every asset URL is relative.

1. Run the build.
2. Upload the **contents** of `dist/` (not the folder itself) via cPanel File Manager/FTP to `public_html`, a subfolder (e.g. `public_html/bios-sim/`) or a subdomain's document root.
3. Browse to the folder URL. Nothing else is needed (no rewrite rules, no router).

`dist/robots.txt` disallows all crawlers and `index.html` has `noindex, nofollow`.

## Offline copy (double-click `index.html`)

Browsers block ES-module scripts on `file://`, so `dist/index.html` shows a blank page if double-clicked. For an offline copy:

```powershell
node node_modules/vite/bin/vite.js build --config vite.config.offline.ts
```

This writes `dist-offline/` using a classic (non-module) script. Upload `dist/` to cPanel; use `dist-offline/` only for local double-click use.
## Using it on a call

1. Pick the model the user has (Latitude / OptiPlex / Precision).
2. On the power-on screen press **F2** (BIOS Setup) or **F12** (One-Time Boot Menu), or click the prompts.
3. **Advanced Setup** (top bar) is OFF by default, as on the real BIOS; switch it ON to see advanced settings. **Help Text** shows or hides the inline descriptions. If an Admin Password is set, Setup opens locked until it is entered in the Admin Password tile.
4. Changes are *pending* until **Apply Changes**. Exit with pending changes asks to apply or discard, then returns to the power-on screen.
5. **Reset simulator** (model screen and power-on screen) clears localStorage and restores all defaults.

Keys: Tab/Shift+Tab, arrow keys (nav, boot list, settings), Enter/Space (toggle/press), Esc (close dialog, or Exit).

## Add or edit a setting

All content lives in `src/data/settings.ts`. Each setting is one helper call:

```ts
tog('power', 'Sleep and Wake', 'block-sleep', 'Block Sleep', false,
  'Help text shown under the setting name.',
  { at: LAP, adv: true, u: true, dep: [dep('power.other', true, 'Why it is greyed out')] })
```

- Helpers: `tog` (toggle), `sel` (dropdown), `rad` (radio), `info` (read-only from model info), or `add(...)` for text/slider/button/password/bootorder/table.
- `at` = platforms the setting appears on (`LAP`, `DESK`, `TOWER`, `LAT`, `ALL`, or a list like `['latitude','precision-mobile']`). Default is all.
- `adv: true` hides it when Advanced Setup is OFF.
- `u: true` sets `verified: false` (name, option list or default not confirmed in a Dell manual). The setting then shows a trainer note under its help text.
- `dep` greys the setting out unless another setting has a value. `pw:admin`, `pw:system`, `pw:nvme` refer to whether that password is set.
- The setting id is `<section>.<id>`. Sections are listed in `SECTIONS`.
- New defaults are picked up automatically; previously saved profiles fall back to the default for new settings.

Models and synthetic system info are in `src/data/models.ts`. Add a model by adding a `build({...})` entry.

## Decisions

- **Node tooling:** the machine had no Node. Node 26 LTS was unpacked into `.tools/` (git-ignored). The Vite template is scaffolded by running create-vite directly, because the npx shim was blocked.
- **Linting:** the current Vite react-ts template ships **oxlint** (not ESLint); kept as the template default.
- **Logo contrast:** the logo has a near-black "Tech" block and transparent surround. On the white BIOS, boot menu and model screens it is used directly. On the black power-on screen it would vanish, so only the splash keeps the light rounded badge (`<Logo badge />`).
- **Favicon:** `public/favicon.svg` (also in `src/assets/`) is an SVG that crops the orange "PS" tile out of the logo PNG. No image tooling was available to produce a .png/.ico.
- **Extra files beyond the stated structure:** `Logo.tsx`, `Icons.tsx`, and `*.module.css` files, plus `.claude/launch.json` (dev preview helper).
- **Look and feel (v2, light theme):** Dell's pages (the "What is new in BIOS Setup" video transcript and KB 000125291) describe a "blue and white interface" with a left navigation menu, toggle switches, Advanced Setup / Help Text / Admin Password tiles top-left, Search and View All top-right, and a change counter that resets on Apply. They give no colours, screenshots or full section list, and the owner's manual System Setup chapters were not read. Everything below is therefore a best-judgement approximation.
- **Colours:** accent `#0672CB` (the brief's start value, unchanged since nothing confirmed otherwise); white/`#f5f6f8` surfaces, `#1f2328` text, `#e1e4e8` dividers. All in `src/styles/theme.css`.
- **Selected tile:** blue left bar plus pale-blue fill with blue text (not solid blue with white text). Unconfirmed.
- **Section icons:** original simple line icons in `Icons.tsx`; Dell's real icons are not reproduced.
- **Help Text default ON** (helps trainers on calls); the choice is persisted. When a setting is greyed out its reason always shows, even with Help Text off.
- **Control layout:** on/off settings (and read-only values, buttons, password rows) sit on the right of the row; dropdowns, radios, text, sliders and tables sit under the name and help. Toggles have no ON/OFF text.
- **Radios/dropdowns:** the settings data was not changed, so existing radio/dropdown settings with two options were not converted to toggles unless they were already toggles (they are not true on/off values).
- **Admin Password tile:** with a password set and not yet entered, the tile shows a password field and Unlock button and every control, plus Restore Settings, is locked (greyed). Once unlocked it shows "Unlocked". With none set it shows "Not set. Set" which opens the Set dialog. The v1 pre-setup prompt is removed; entering Setup (F2, F12 menu) always starts locked if a password exists, and Exit re-locks. Locked state is not persisted.
- **Search:** icon opens a popover under the top bar; the query and results are kept in memory for the session after clicking away or closing (a dot marks the icon). Results show section and sub-section.
- **View All:** a modal index; section names and sub-section headings are links (sub-sections scroll to the heading).
- **Bottom bar:** Restore Settings and "N unsaved changes" on the left; Apply Changes (solid blue) and Exit (outlined) on the right. Dell's pages did not say where these sit.
- **Dialogs:** blue primary, grey secondary. The "Discard Changes and Exit" button uses grey with red text.
- **Splash:** stays black (the only dark screen); its footer note is dark too so there is no white strip.
- **Right-hand HELP panel removed;** the "trainer note" for unverified settings now appears inline under the help text.
- **Screenshots:** no Playwright or headless browser was available, so no before/after screenshots and no pixel check at 1366x768 / 1920x1080. Layout uses flexible grid, not fixed sizes, but this was not visually verified.
- **Advanced Setup default OFF** (per the manuals). Which settings count as "advanced" is a best guess and not verified.
- **Chassis Intrusion** shows on all models. Your brief listed it as desktop-only, but the Latitude 5450 and Precision 3680 manuals both list it.
- **Fastboot, Extend BIOS POST Time, Keyboard Backlight timeouts, Numlock-on-boot** are included per your brief but could not be found in the manuals for these models; they are `verified: false`.
- **Secure Boot default OFF.** Dell manuals disagree by model (Disabled on 5450 and OptiPlex 7020, Enabled on 7450). Same for USB PowerShare and Password Bypass defaults.
- **Dependencies implemented:** Secure Boot gates Secure Boot Mode, Microsoft UEFI CA and Custom Mode (then key buttons); TPM off greys Attestation/Key Storage/SHA-256/Clear/PPI; VT gates VT-d, which gates DMA settings; TXT needs VT, VT-d, TPM and Hyper-Threading; SpeedStep gates C-States; SupportAssist gates BIOSConnect and the OS recovery threshold; Custom battery mode gates charge start/stop; password-dependent options (lockouts, bypass, non-admin changes) require the relevant password. Secure Boot does not grey out any other setting because no manual-confirmed incompatible option exists on these (UEFI-only) models.
- **Boot Sequence** is editable (reorder, add, delete) as a training convenience even though the manuals show it read-only; flagged `verified: false`. The F12 menu uses this order.
- **Passwords** are stored in plain text in localStorage (training data). Set/change/delete take effect immediately, not through Apply, as on the real BIOS. Admin password gates F2 and the F12 "BIOS Setup" entry once set.
- **Restore Settings:** "BIOS Defaults" and "Custom User Settings" load into pending changes (then Apply). Custom User Settings are saved with a button in the Restore dialog.
- **State is per model** (each model remembers its own applied settings, passwords and cleared logs).
- **Log clearing** happens on Apply (set "Clear Log", then Apply), then reverts to "Keep Log".
- **Destructive options** (TPM Clear, Data Wipe, Delete Secure Boot keys) are toggles/buttons that only change simulator state.
- The F12 menu entries are as specified in the brief; the manual pages that describe them did not load, so they are unconfirmed.

## Settings marked `verified: false`

42 of ~200 settings (see the "Trainer note" under each setting, or search `u: true` in `settings.ts`): Boot Sequence editing, Enable Secure Boot (default), Secure Boot Mode (Audit value), Custom Mode Key Management and key buttons, Serial Port 1, SATA/NVMe Operation options, Multi-Display, Integrated NIC (options), UEFI Network Stack (options), HTTP(s) Boot Modes, Battery Configuration options, Advanced Charge time, Peak Shift and threshold, Type-C Connector Power, USB PowerShare (default), Thermal Management options, AC Recovery options, Deep Sleep Control options, Absolute, UEFI Boot Path Security, Firmware Device Tamper Detection (+Clear), Password Bypass, Dell Auto OS Recovery Threshold, Wake on LAN options, Auto On Time options, Intel AMT Capability options, Fn Lock Mode, Keyboard Illumination, Backlight Timeouts, Numlock, Warnings and Errors alternatives, Fastboot, Extend BIOS POST Time, MAC Address Pass-Through options, Multi Core Support, Adaptive C-States.

## Sources

UI restyle (v2): Dell video page "What is new in BIOS Setup" (transcript only) and Dell KB 000125291.

Dell owner's manuals, "System setup options" pages on dell.com/support/manuals:

- Latitude 14 7450 2-in-1 (latitude_7450_om): System setup options, Power
- Latitude 14 5450 (latitude-5450-owners-manual): System setup options, View Advanced Setup options
- OptiPlex Tower 7020 (optiplex-tower-7020-owners-manual): System setup options
- Precision 3680 Tower (precision_3680_tower_om): System setup options

Not read (pages failed or were not fetched): Precision 3590, OptiPlex Micro 7020, Dell's F12 boot menu KB article. Those models reuse the data from their closest sibling.
