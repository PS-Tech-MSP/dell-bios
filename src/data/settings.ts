import type { Dependency, Model, Option, Platform, Section, Setting, Value } from './types'

/* ------------------------------------------------------------------ */
/* Platform groups                                                     */
/* ------------------------------------------------------------------ */
const LAP: Platform[] = ['latitude', 'precision-mobile']
const DESK: Platform[] = ['optiplex-micro', 'optiplex-tower', 'precision-tower']
const TOWER: Platform[] = ['optiplex-tower', 'precision-tower']
const ALL: Platform[] = [...LAP, ...DESK]
const LAT: Platform[] = ['latitude']

export const SECTIONS: Section[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'boot', label: 'Boot Configuration' },
  { id: 'integrated', label: 'Integrated Devices' },
  { id: 'storage', label: 'Storage' },
  { id: 'display', label: 'Display' },
  { id: 'connection', label: 'Connection' },
  { id: 'power', label: 'Power' },
  { id: 'security', label: 'Security' },
  { id: 'passwords', label: 'Passwords' },
  { id: 'update', label: 'Update,Recovery' },
  { id: 'sysmgmt', label: 'System Management' },
  { id: 'keyboard', label: 'Keyboard' },
  { id: 'preboot', label: 'Pre-boot Behavior' },
  { id: 'virtualization', label: 'Virtualization Support' },
  { id: 'performance', label: 'Performance' },
  { id: 'logs', label: 'System Logs' },
  { id: 'about', label: 'About' },
]

/* ------------------------------------------------------------------ */
/* Builder helpers                                                     */
/* ------------------------------------------------------------------ */
const opts = (...labels: string[]): Option[] => labels.map((l) => ({ value: l, label: l }))
const dep = (id: string, value: Value | Value[], reason: string): Dependency => ({ id, value, reason })

interface Extra {
  at?: Platform[]
  adv?: boolean
  /** true = could NOT be confirmed in a Dell manual (name, option list or default). */
  u?: boolean
  options?: Option[]
  dep?: Dependency[]
  action?: Setting['action']
  buttonLabel?: string
  passwordKind?: Setting['passwordKind']
  infoKey?: string
  min?: number
  max?: number
  step?: number
  unit?: string
  maxLength?: number
}

const list: Setting[] = []
function add(
  sectionId: string,
  group: string,
  id: string,
  label: string,
  control: Setting['control'],
  def: Value,
  help: string,
  x: Extra = {},
) {
  list.push({
    id: `${sectionId}.${id}`,
    sectionId,
    group,
    label,
    control,
    default: def,
    help,
    appliesTo: x.at ?? ALL,
    advanced: x.adv,
    verified: !x.u,
    options: x.options,
    dependsOn: x.dep,
    action: x.action,
    buttonLabel: x.buttonLabel,
    passwordKind: x.passwordKind,
    infoKey: x.infoKey,
    min: x.min,
    max: x.max,
    step: x.step,
    unit: x.unit,
    maxLength: x.maxLength,
  })
}
const info = (section: string, group: string, id: string, label: string, key: string, help: string, x: Extra = {}) =>
  add(section, group, id, label, 'readonly', '', help, { ...x, infoKey: key })
const tog = (section: string, group: string, id: string, label: string, def: boolean, help: string, x: Extra = {}) =>
  add(section, group, id, label, 'toggle', def, help, x)
const sel = (section: string, group: string, id: string, label: string, o: string[], def: string, help: string, x: Extra = {}) =>
  add(section, group, id, label, 'dropdown', def, help, { ...x, options: opts(...o) })
const rad = (section: string, group: string, id: string, label: string, o: string[], def: string, help: string, x: Extra = {}) =>
  add(section, group, id, label, 'radio', def, help, { ...x, options: opts(...o) })

/* ------------------------------------------------------------------ */
/* OVERVIEW                                                            */
/* ------------------------------------------------------------------ */
{
  const s = 'overview'
  const g = 'System Information'
  info(s, g, 'bios', 'BIOS Version', 'biosVersion', 'The firmware version currently installed. Useful to quote to support when checking whether an update is needed.')
  info(s, g, 'tag', 'Service Tag', 'serviceTag', 'The 7-character Dell service tag. It is also on the label on the device and is used to look up warranty and drivers.')
  info(s, g, 'asset', 'Asset Tag', 'assetTag', 'Asset tag set under System Management. Blank if none has been entered.')
  info(s, g, 'mfg', 'Manufacture Date', 'manufactureDate', 'Date the system was built.')
  info(s, g, 'own', 'Ownership Date', 'ownershipDate', 'Date ownership of the system was recorded.')
  info(s, g, 'esc', 'Express Service Code', 'expressServiceCode', 'Numeric form of the service tag for phone support.')
  info(s, g, 'signed', 'Signed Firmware Update', 'signedFw', 'Shows Enabled when BIOS updates must be digitally signed. Not editable.', { adv: true })

  const b = 'Battery Information'
  info(s, b, 'batt', 'Primary', 'battery.primary', 'The primary battery.', { at: LAP })
  info(s, b, 'level', 'Battery Level', 'battery.level', 'Current charge level.', { at: LAP })
  info(s, b, 'state', 'Battery State', 'battery.state', 'Charging, discharging or fully charged.', { at: LAP })
  info(s, b, 'health', 'Health', 'battery.health', 'Overall battery health reported by the BIOS.', { at: LAP })
  info(s, b, 'ac', 'AC Adapter', 'battery.ac', 'Connected AC adapter wattage.', { at: LAP })

  const p = 'Processor Information'
  info(s, p, 'cpu', 'Processor Type', 'cpu', 'The installed CPU model.')
  info(s, p, 'cores', 'Core Count', 'cpuCores', 'Number of logical cores.')
  info(s, p, 'id', 'Processor ID', 'cpuId', 'CPU family/model/stepping identifier.')
  info(s, p, 'clock', 'Current Clock Speed', 'cpuClock', 'The base clock speed.')
  info(s, p, 'cache', 'L3 Cache', 'cpuCache', 'Last-level cache size.')
  info(s, p, 'ht', 'Hyper-Threading Capable', 'yes', 'Whether the processor supports Hyper-Threading.')

  const m = 'Memory Configuration'
  info(s, m, 'mem', 'Memory Installed', 'memoryInstalled', 'Total physical memory fitted.')
  info(s, m, 'avail', 'Memory Available', 'memoryAvailable', 'Memory usable by the OS after hardware reservations.')
  info(s, m, 'speed', 'Memory Speed', 'memorySpeed', 'Running speed of the memory.')
  info(s, m, 'chan', 'Memory Channel Mode', 'memoryChannel', 'Single or dual channel. Dual is faster.')
  info(s, m, 'tech', 'Memory Technology', 'memoryTech', 'The memory type.')
  for (let i = 0; i < 4; i++)
    info(s, m, `dimm${i + 1}`, `DIMM ${i + 1} Size`, `dimm:${i}`, `Size of the module in DIMM slot ${i + 1}.`, { at: i < 2 ? ALL : ['precision-tower'] })

  const d = 'Devices'
  info(s, d, 'video', 'Video Controller', 'video', 'The graphics adapter.')
  info(s, d, 'panel', 'Panel Type', 'panel', 'The display panel fitted.', { at: LAP })
  info(s, d, 'res', 'Native Resolution', 'nativeRes', 'Native resolution of the built-in panel.', { at: LAP })
  info(s, d, 'wifi', 'Wi-Fi Device', 'wifi', 'The installed wireless adapter.')
  info(s, d, 'audio', 'Audio Controller', 'audio', 'The audio codec.')
  info(s, d, 'bt', 'Bluetooth Device', 'bluetooth', 'The Bluetooth adapter.')
  info(s, d, 'lom', 'LOM MAC Address', 'lomMac', 'MAC address of the onboard (wired) network controller. Synthetic.')
  info(s, d, 'ptmac', 'Pass Through MAC Address', 'passThroughMac', 'MAC address presented by a dock when MAC Address Pass-Through is on. Synthetic.', { at: LAP })
}

/* ------------------------------------------------------------------ */
/* BOOT CONFIGURATION                                                  */
/* ------------------------------------------------------------------ */
{
  const s = 'boot'
  add(s, 'Boot Sequence', 'mode', 'Boot Mode', 'readonly', 'UEFI only', 'Current Dell systems boot in UEFI mode only. Legacy boot is not available.')
  add(s, 'Boot Sequence', 'order', 'Boot Sequence', 'bootorder', ['Windows Boot Manager', 'Onboard NIC (IPv4)', 'Onboard NIC (IPv6)'],
    'Order the system tries boot devices. Select an entry and use Up/Down to reorder; use Add Boot Option or Delete to change the list. Manuals show this list read-only; editing is a simulator convenience.', { u: true })
  tog(s, 'Boot Sequence', 'pxe-priority', 'Enable PXE Boot Priority', false, 'Places PXE network boot ahead of the local drive in the boot order.', { at: LAP })
  tog(s, 'Boot Sequence', 'force-pxe', 'Force PXE On Next Boot', false, 'Forces a single network (PXE) boot on the next restart.', { at: DESK })
  tog(s, 'Secure Digital (SD) Card Boot', 'sd-boot', 'Secure Digital (SD) Card Boot', false, 'Allows booting from an SD card.', { at: ['precision-tower'] })

  const sb = 'Secure Boot'
  tog(s, sb, 'secure-boot', 'Enable Secure Boot', false,
    'Only allows the system to start software signed by trusted keys. Windows 11 expects this ON. Note: Dell manuals disagree on the factory default between models; BIOS Defaults here is OFF.', { u: true })
  tog(s, sb, 'ms-ca', 'Enable Microsoft UEFI CA', true,
    'Trusts the Microsoft UEFI CA certificate. Turning this off can stop some graphics cards or peripherals and some operating systems from starting.',
    { adv: true, dep: [dep('boot.secure-boot', true, 'Requires Enable Secure Boot to be ON.')] })
  sel(s, sb, 'sb-mode', 'Secure Boot Mode', ['Deployed Mode', 'Audit Mode'], 'Deployed Mode',
    'Deployed Mode enforces signature checks. Audit Mode logs failures without blocking, and is used when preparing custom keys.',
    { u: true, dep: [dep('boot.secure-boot', true, 'Requires Enable Secure Boot to be ON.')] })

  const ek = 'Expert Key Management'
  tog(s, ek, 'custom-mode', 'Enable Custom Mode', false,
    'Allows the PK, KEK, db and dbx Secure Boot databases to be edited. Leave OFF unless you are loading custom keys.',
    { adv: true, dep: [dep('boot.secure-boot', true, 'Requires Enable Secure Boot to be ON.')] })
  sel(s, ek, 'key-db', 'Custom Mode Key Management', ['PK', 'KEK', 'db', 'dbx'], 'PK',
    'Chooses which key database the buttons below act on.',
    { adv: true, u: true, dep: [dep('boot.custom-mode', true, 'Requires Enable Custom Mode to be ON.')] })
  add(s, ek, 'clear-keys', 'Delete All Keys', 'button', '', 'Removes all keys from the selected database. Simulated: no keys are actually removed.',
    { adv: true, u: true, action: 'clear-secure-boot-keys', buttonLabel: 'Delete', dep: [dep('boot.custom-mode', true, 'Requires Enable Custom Mode to be ON.')] })
  add(s, ek, 'restore-keys', 'Restore Settings (Default Keys)', 'button', '', 'Reloads the factory Secure Boot keys. Simulated.',
    { adv: true, u: true, action: 'restore-secure-boot-keys', buttonLabel: 'Restore', dep: [dep('boot.custom-mode', true, 'Requires Enable Custom Mode to be ON.')] })
}

/* ------------------------------------------------------------------ */
/* INTEGRATED DEVICES                                                  */
/* ------------------------------------------------------------------ */
{
  const s = 'integrated'
  const now = new Date()
  const p2 = (n: number) => String(n).padStart(2, '0')
  const g = 'Date/Time'
  add(s, g, 'date', 'Date', 'text', `${p2(now.getMonth() + 1)}/${p2(now.getDate())}/${now.getFullYear()}`, 'System date, format MM/DD/YYYY.', { maxLength: 10 })
  add(s, g, 'time', 'Time', 'text', `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`, 'System time, 24-hour format HH:MM:SS.', { maxLength: 8 })

  tog(s, 'Camera', 'camera', 'Enable Camera', true, 'Turns the built-in camera on or off. If a user reports the camera is missing in Teams or Zoom, check this first.', { at: LAP })

  const a = 'Audio'
  tog(s, a, 'audio', 'Enable Audio', true, 'Master switch for onboard audio.')
  tog(s, a, 'mic', 'Enable Microphone', true, 'Turns the built-in microphone on or off.', { dep: [dep('integrated.audio', true, 'Requires Enable Audio.')] })
  tog(s, a, 'speaker', 'Enable Internal Speaker', true, 'Turns the internal speaker on or off.', { dep: [dep('integrated.audio', true, 'Requires Enable Audio.')] })

  const u = 'USB/Thunderbolt Configuration'
  tog(s, u, 'usb-boot', 'Enable USB Boot Support', true, 'Allows booting from USB storage such as install media.')
  tog(s, u, 'ext-usb', 'Enable External USB Ports', true, 'Turns the external USB ports on or off.', { at: LAP })
  tog(s, u, 'tb', 'Enable Thunderbolt Technology Support', true, 'Turns Thunderbolt on or off.', { at: LAT })
  tog(s, u, 'tb-boot', 'Enable Thunderbolt Boot Support', false, 'Allows booting from Thunderbolt-attached devices.', { at: LAT, dep: [dep('integrated.tb', true, 'Requires Thunderbolt Technology Support.')] })
  tog(s, u, 'tb-preboot', 'Enable Thunderbolt (and PCIe behind TBT) pre-boot modules', false, 'Loads Thunderbolt and PCIe devices before the OS starts.', { at: LAT, adv: true, dep: [dep('integrated.tb', true, 'Requires Thunderbolt Technology Support.')] })
  tog(s, u, 'usb4', 'Disable USB4 PCIE Tunneling', false, 'Blocks PCIe tunneling over USB4, a security hardening option.', { at: LAT, adv: true })
  tog(s, u, 'typec-video', 'Video/Power only on Type-C Ports', false, 'Limits Type-C ports to video and power only (no data).', { at: LAT, adv: true })
  tog(s, u, 'dock-override', 'Type-C Dock Override', true, 'Lets a Type-C dock keep working with a lower-wattage adapter.', { at: LAT, adv: true })
  tog(s, u, 'dock-audio', 'Type-C Dock Audio', true, 'Allows audio through a Type-C dock.', { at: LAT, adv: true })
  tog(s, u, 'dock-lan', 'Type-C Dock LAN', true, 'Allows the LAN port on a Type-C dock.', { at: LAT, adv: true })
  tog(s, u, 'front-usb', 'Enable Front USB Ports', true, 'Turns the front USB ports on or off.', { at: DESK })
  tog(s, u, 'rear-usb', 'Enable Rear USB Ports', true, 'Turns the rear USB ports on or off.', { at: DESK })
  tog(s, u, 'fp', 'Enable Fingerprint Reader Device', true, 'Turns the fingerprint reader on or off.', { at: LAT })
  rad(s, 'Serial Port', 'serial', 'Serial Port 1', ['Disabled', 'COM1', 'COM2'], 'COM1', 'Legacy serial port configuration.', { at: ['optiplex-tower'], u: true })
  tog(s, 'Maintenance', 'dust', 'Dust Filter Maintenance', false, 'Shows a reminder to clean the dust filter.', { at: ['optiplex-tower'] })
  tog(s, 'Unobtrusive Mode', 'unobtrusive', 'Enable Unobtrusive Mode', false, 'Turns off LEDs, the screen backlight and audio. Fn+B toggles it in the OS.', { at: LAT })
}

/* ------------------------------------------------------------------ */
/* STORAGE                                                             */
/* ------------------------------------------------------------------ */
{
  const s = 'storage'
  sel(s, 'SATA/NVMe Operation', 'op', 'SATA/NVMe Operation', ['Disabled', 'AHCI/NVMe', 'RAID On'], 'RAID On',
    'RAID On (Intel RST) is the factory default and the OS needs matching storage drivers. Changing this on an installed Windows system can cause a boot failure (INACCESSIBLE_BOOT_DEVICE) unless the OS is prepared first.', { u: true })
  const g = 'Storage Interface'
  tog(s, g, 'nvme0', 'Port Enablement: M.2 PCIe SSD-0', true, 'Turns the M.2 PCIe SSD slot on or off.')
  tog(s, g, 'sata0', 'Port Enablement: SATA-0', true, 'Turns the SATA-0 port on or off.', { at: ['optiplex-tower', 'precision-tower'] })
  tog(s, 'SMART Reporting', 'smart', 'Enable SMART Reporting', false, 'Reports drive SMART warnings during startup.')
  const d = 'Drive Information'
  info(s, d, 'drive0', 'M.2 PCIe SSD-0', 'storage:0', 'The drive detected in the primary M.2 slot.')
  info(s, d, 'drive1', 'SATA-0', 'storage:1', 'The drive detected on SATA-0.', { at: TOWER })
  tog(s, 'Media Card', 'sd', 'Secure Digital (SD) Card', true, 'Turns the SD card reader on or off.', { at: ['precision-tower'] })
  tog(s, 'Media Card', 'sd-ro', 'SD Card Read-Only Mode', false, 'Makes inserted SD cards read-only.', { at: ['precision-tower'], dep: [dep('storage.sd', true, 'Requires the SD card reader to be enabled.')] })
}

/* ------------------------------------------------------------------ */
/* DISPLAY                                                             */
/* ------------------------------------------------------------------ */
{
  const s = 'display'
  const g = 'Display Brightness'
  add(s, g, 'batt', 'Brightness on battery power', 'slider', '50', 'Screen brightness when running on battery.', { at: LAP, min: 0, max: 100, step: 5, unit: '%' })
  add(s, g, 'ac', 'Brightness on AC power', 'slider', '100', 'Screen brightness when plugged in.', { at: LAP, min: 0, max: 100, step: 5, unit: '%' })
  tog(s, 'Touchscreen', 'touch', 'Touchscreen', true, 'Turns the touch function of the display on or off.', { at: LAT })
  tog(s, 'Full Screen Logo', 'logo', 'Full Screen Logo', false, 'Shows a full-screen logo during startup if the logo matches the screen resolution.')
  tog(s, 'Multi-Display', 'multi', 'Enable Multi-Display', true, 'Allows more than one display to be used.', { at: ['precision-tower'], u: true })
}

/* ------------------------------------------------------------------ */
/* CONNECTION                                                          */
/* ------------------------------------------------------------------ */
{
  const s = 'connection'
  sel(s, 'Integrated NIC', 'nic', 'Integrated NIC', ['Disabled', 'Enabled', 'Enabled with PXE'], 'Enabled with PXE',
    'Controls the onboard network adapter. "Enabled with PXE" also allows booting from the network.', { at: DESK, u: true })
  sel(s, 'Integrated NIC', 'nic-lap', 'Integrated NIC', ['Disabled', 'Enabled', 'Enabled with PXE'], 'Enabled with PXE',
    'Controls the wired network adapter (docks and dongles may be separate). "Enabled with PXE" also allows network boot.', { at: LAP, u: true })

  const w = 'Wireless Device Enable'
  tog(s, w, 'wlan', 'WLAN', true, 'Turns the Wi-Fi adapter on or off.', { at: LAP })
  tog(s, w, 'bt', 'Bluetooth', true, 'Turns Bluetooth on or off.')
  tog(s, w, 'wwan', 'WWAN/GPS', true, 'Turns the mobile broadband modem and GPS on or off (only if fitted).', { at: LAT })
  tog(s, w, 'nfc', 'Contactless Smartcard/NFC', true, 'Turns the NFC/smartcard reader on or off.', { at: LAT })

  const r = 'Wireless Radio Control'
  tog(s, r, 'ctl-wlan', 'Control WLAN Radio', false, 'Lets the system switch the Wi-Fi radio off automatically when connected to a wired network.', { at: LAP, dep: [dep('connection.wlan', true, 'Requires WLAN to be enabled.')] })
  tog(s, r, 'ctl-wwan', 'Control WWAN Radio', false, 'Lets the system switch the mobile broadband radio off automatically when on a wired network.', { at: LAT, dep: [dep('connection.wwan', true, 'Requires WWAN to be enabled.')] })

  const n = 'UEFI Network Stack'
  sel(s, n, 'uefi-net', 'Enable UEFI Network Stack', ['Disabled', 'Enabled', 'Auto Enabled'], 'Auto Enabled',
    'Needed for network (PXE) and HTTP(s) boot in UEFI mode. Auto Enabled turns it on only when a network boot is needed.', { u: true })
  tog(s, n, 'http', 'HTTP(s) Boot', true, 'Allows booting from an HTTP(s) URL (used by BIOSConnect and some imaging).', { dep: [dep('connection.uefi-net', ['Enabled', 'Auto Enabled'], 'Requires the UEFI Network Stack.')] })
  rad(s, n, 'http-mode', 'HTTP(s) Boot Modes', ['Auto Mode', 'Manual Mode'], 'Auto Mode', 'Auto uses a URL from DHCP; Manual uses the Boot URL below.', { u: true, dep: [dep('connection.http', true, 'Requires HTTP(s) Boot.')] })
  add(s, n, 'http-url', 'Boot URL', 'text', '', 'URL of the boot image when using Manual Mode.', { maxLength: 255, dep: [dep('connection.http-mode', 'Manual Mode', 'Requires Manual Mode.')] })
}

/* ------------------------------------------------------------------ */
/* POWER                                                               */
/* ------------------------------------------------------------------ */
{
  const s = 'power'
  const b = 'Battery Configuration'
  sel(s, b, 'batt', 'Battery Configuration', ['Adaptive', 'Standard', 'ExpressCharge', 'Primarily AC Use', 'Custom'], 'Adaptive',
    'How the battery is charged. Adaptive learns usage; ExpressCharge charges fastest; Primarily AC Use protects a battery that is mostly plugged in; Custom sets start and stop levels.', { at: LAP, u: true })
  add(s, b, 'start', 'Custom Charge Start', 'slider', '50', 'Charging starts when the battery falls below this level.', { at: LAP, min: 50, max: 95, step: 5, unit: '%', dep: [dep('power.batt', 'Custom', 'Requires Battery Configuration = Custom.')] })
  add(s, b, 'stop', 'Custom Charge Stop', 'slider', '90', 'Charging stops at this level.', { at: LAP, min: 55, max: 100, step: 5, unit: '%', dep: [dep('power.batt', 'Custom', 'Requires Battery Configuration = Custom.')] })
  tog(s, b, 'adv-charge', 'Enable Advanced Battery Charge Configuration', false, 'Lets you set a daily period when the battery is charged to full, and a standard algorithm the rest of the time.', { at: LAP, adv: true })
  sel(s, b, 'adv-start', 'Advanced Charge: Beginning of day', ['00:00', '06:00', '07:00', '08:00', '09:00'], '07:00', 'Start of the daily peak-use period.', { at: LAP, adv: true, u: true, dep: [dep('power.adv-charge', true, 'Requires Advanced Battery Charge Configuration.')] })
  tog(s, b, 'peak', 'Enable Peak Shift', false, 'Runs on battery during peak electricity hours to save cost. Requires set start/end times.', { at: LAP, adv: true, u: true })
  sel(s, b, 'peak-batt', 'Peak Shift: Minimum battery threshold', ['15', '20', '25', '30'], '15', 'Battery level at which the system returns to AC power during Peak Shift (%).', { at: LAP, adv: true, u: true, dep: [dep('power.peak', true, 'Requires Peak Shift.')] })
  tog(s, b, 'typec-wake', 'Wake on Dell USB-C Dock', true, 'Lets the laptop wake when connected to a Dell USB-C dock.', { at: LAT })
  sel(s, b, 'typec-pwr', 'Type-C Connector Power', ['7.5 Watts', '15 Watts'], '7.5 Watts', 'Power the Type-C port can supply to attached devices.', { at: LAT, u: true })
  tog(s, 'USB PowerShare', 'powershare', 'Enable USB PowerShare', false, 'Lets the USB PowerShare port charge phones and devices while the laptop is off or asleep. Manuals disagree on the default.', { at: LAP, u: true })

  const t = 'Thermal Management'
  sel(s, t, 'thermal', 'Thermal Management', ['Optimized', 'Cool', 'Quiet', 'Ultra Performance'], 'Optimized',
    'Balances fan noise, temperature and performance. Cool = cooler surfaces, Quiet = quieter fan, Ultra Performance = fastest.', { u: true })
  tog(s, t, 'fan-override', 'Fan Control Override', false, 'Runs the fan at full speed. For diagnostics only.', { at: DESK, adv: true })

  const m = 'Sleep and Wake'
  tog(s, m, 'usb-wake', 'Enable USB Wake Support', false, 'Lets USB devices wake the system from sleep.', { at: DESK })
  tog(s, m, 'block-sleep', 'Block Sleep', false, 'Prevents the system entering sleep (S3) in the OS.')
  tog(s, m, 'lid', 'Enable Lid Switch', true, 'Lets closing the lid trigger the OS lid action (sleep etc).', { at: LAP })
  tog(s, m, 'lid-open', 'Power On Lid Open', true, 'Turns the laptop on when the lid is opened.', { at: LAT })
  tog(s, m, 'speedshift', 'Intel Speed Shift Technology', true, 'Lets the CPU choose its own performance state for faster response.', { adv: true })
  sel(s, m, 'ac-recovery', 'AC Recovery', ['Power Off', 'Power On', 'Last Power State'], 'Power Off',
    'What the desktop does when power returns after an outage. Power On is useful for servers and kiosks.', { at: DESK, u: true })
  sel(s, m, 'deep-sleep', 'Deep Sleep Control', ['Disabled', 'Enabled in S5 only', 'Enabled in S4 and S5'], 'Enabled in S4 and S5',
    'Saves power when off or hibernating. Deep Sleep can prevent Wake on LAN from working.', { at: DESK, u: true })
}

/* ------------------------------------------------------------------ */
/* SECURITY                                                            */
/* ------------------------------------------------------------------ */
{
  const s = 'security'
  const t = 'TPM 2.0 Security'
  tog(s, t, 'tpm', 'TPM 2.0 Security On', true, 'Turns the Trusted Platform Module on. Needed for BitLocker and Windows 11. Turning it off can lock BitLocker drives.')
  const need = [dep('security.tpm', true, 'Requires TPM 2.0 Security On.')]
  tog(s, t, 'attest', 'Attestation Enable', true, 'Allows the TPM to attest the platform state.', { dep: need })
  tog(s, t, 'keystore', 'Key Storage Enable', true, 'Allows the TPM to store keys.', { dep: need })
  tog(s, t, 'sha256', 'SHA-256', true, 'Uses the SHA-256 hash algorithm for the TPM.', { dep: need })
  tog(s, t, 'clear', 'Clear', false, 'Erases all keys held in the TPM on next boot. WARNING: this will lock a BitLocker drive unless the recovery key is known.', { dep: need })
  tog(s, t, 'ppi', 'PPI Bypass for Clear Commands', false, 'Allows the OS to clear the TPM without a physical-presence prompt at boot.', { dep: need })

  tog(s, 'Intel Total Memory Encryption', 'tme', 'Multi-Key Total Memory Encryption', false, 'Encrypts system memory with multiple keys. Small performance cost.', { adv: true })
  sel(s, 'Chassis Intrusion', 'chassis', 'Chassis Intrusion', ['Disabled', 'Enabled', 'On-Silent'], 'Disabled',
    'Detects the case being opened. Enabled warns at next boot and logs; On-Silent only logs.')
  tog(s, 'Chassis Intrusion', 'chassis-block', 'Block Boot Until Cleared', false, 'Stops startup until the chassis intrusion warning is cleared.', { dep: [dep('security.chassis', ['Enabled', 'On-Silent'], 'Requires Chassis Intrusion enabled.')] })
  tog(s, 'SMM Security Mitigation', 'smm', 'SMM Security Mitigation', true, 'Extra protection for System Management Mode. Leave on unless an old driver requires otherwise.', { adv: true })
  tog(s, 'Data Wipe on Next Boot', 'wipe', 'Start Data Wipe', false, 'Securely erases all data on the next restart. IRREVERSIBLE. A training simulator will not erase anything real.')
  sel(s, 'Absolute', 'absolute', 'Absolute', ['Enabled', 'Disabled', 'Permanently Disabled'], 'Enabled',
    'Absolute is a third-party asset tracking agent built into the BIOS. Permanently Disabled cannot be undone.', { u: true })
  sel(s, 'UEFI Boot Path Security', 'bootpath', 'UEFI Boot Path Security', ['Always', 'Always Except Internal HDD', 'Always Except Internal HDD and PXE', 'Never'], 'Always Except Internal HDD',
    'When the admin password is set, controls when the system asks for it while booting from a UEFI path via F12.', { u: true })
  sel(s, 'Firmware Device Tamper Detection', 'tamper', 'Firmware Device Tamper Detection', ['Disabled', 'Silent', 'Enabled'], 'Silent',
    'Detects tampering with firmware devices.', { at: LAP, adv: true, u: true })
  tog(s, 'Firmware Device Tamper Detection', 'tamper-clear', 'Clear Firmware Device Tamper Detection', false, 'Clears a recorded tamper detection event.', { at: LAP, adv: true, u: true })
}

/* ------------------------------------------------------------------ */
/* PASSWORDS                                                           */
/* ------------------------------------------------------------------ */
{
  const s = 'passwords'
  const g = 'Passwords'
  add(s, g, 'admin', 'Admin Password', 'password', '', 'Protects BIOS Setup. Once set, F2 asks for it. Set, change and delete take effect immediately (not through Apply Changes).', { passwordKind: 'admin' })
  add(s, g, 'system', 'System Password', 'password', '', 'Asked at every startup before the OS loads.', { passwordKind: 'system' })
  add(s, g, 'nvme', 'M.2 PCIe SSD-0 Password', 'password', '', 'Drive-level password stored on the SSD. Data is unreadable without it.', { passwordKind: 'nvme' })

  const c = 'Password Configuration'
  tog(s, c, 'upper', 'Upper Case Letter', false, 'Require at least one uppercase letter in new passwords.')
  tog(s, c, 'lower', 'Lower Case Letter', false, 'Require at least one lowercase letter in new passwords.')
  tog(s, c, 'digit', 'Digit', false, 'Require at least one number in new passwords.')
  tog(s, c, 'special', 'Special Character', false, 'Require at least one special character (e.g. ! # $).')
  sel(s, c, 'min', 'Minimum Characters', ['4', '6', '8', '10', '12', '16'], '4', 'Shortest allowed password.')
  sel(s, c, 'bypass', 'Password Bypass', ['Disabled', 'Reboot Bypass'], 'Disabled', 'Reboot Bypass skips the System Password prompt on warm restarts.', { u: true, dep: [dep('pw:system', true, 'Requires a System Password.')] })
  tog(s, c, 'nonadmin', 'Allow Non-Admin Password Changes', true, 'Lets users change the System and drive passwords without the Admin Password.', { dep: [dep('pw:admin', true, 'Requires an Admin Password.')] })
  tog(s, c, 'nonadmin-setup', 'Non-Admin Setup Changes', false, 'Lets users change some BIOS settings (like Wi-Fi) without the Admin Password.', { at: LAT, dep: [dep('pw:admin', true, 'Requires an Admin Password.')] })
  tog(s, c, 'lockout', 'Enable Admin Setup Lockout', false, 'Stops anyone entering BIOS Setup when the Admin Password is set but forgotten. Contact Dell if locked out.', { dep: [dep('pw:admin', true, 'Requires an Admin Password.')] })
  tog(s, c, 'master', 'Enable Master Password Lockout', false, 'Disables Dell service password recovery. If the drive password is lost the drive is unrecoverable.', { dep: [dep('pw:admin', true, 'Requires an Admin Password.')] })
  tog(s, c, 'psid', 'Allow Non-Admin PSID Revert', false, 'Allows an SSD to be reset (PSID revert) without the Admin Password.', { adv: true })
}

/* ------------------------------------------------------------------ */
/* UPDATE RECOVERY                                                     */
/* ------------------------------------------------------------------ */
{
  const s = 'update'
  tog(s, 'Firmware Updates', 'capsule', 'Enable UEFI Capsule Firmware Updates', true, 'Allows BIOS updates through Windows Update, LVFS and the OS (UEFI capsule). Turning it off blocks those update routes.', { adv: true })
  tog(s, 'Firmware Updates', 'downgrade', 'Allow BIOS Downgrade', true, 'Lets an older BIOS version be installed. Turn off to stop rollback attacks.', { adv: true })
  tog(s, 'Recovery', 'recovery', 'BIOS Recovery from Hard Drive', true, 'Lets the BIOS repair itself from a recovery file on the drive if it becomes corrupt.')
  tog(s, 'Recovery', 'sa', 'SupportAssist OS Recovery', true, 'Allows the SupportAssist OS Recovery tool to start automatically after repeated boot failures, or from F12.')
  tog(s, 'Recovery', 'biosconnect', 'BIOSConnect', true, 'Lets the BIOS download and run SupportAssist OS Recovery from Dell over the network.', { dep: [dep('update.sa', true, 'Requires SupportAssist OS Recovery.')] })
  sel(s, 'Recovery', 'threshold', 'Dell Auto OS Recovery Threshold', ['0', '1', '2', '3'], '2',
    'Number of failed boots before SupportAssist OS Recovery starts automatically. 0 = off.', { adv: true, u: true, dep: [dep('update.sa', true, 'Requires SupportAssist OS Recovery.')] })
}

/* ------------------------------------------------------------------ */
/* SYSTEM MANAGEMENT                                                   */
/* ------------------------------------------------------------------ */
{
  const s = 'sysmgmt'
  const g = 'System Management'
  info(s, g, 'tag', 'Service Tag', 'serviceTag', 'The Dell service tag. Cannot be edited.')
  add(s, g, 'asset', 'Asset Tag', 'text', '', 'Your own asset label (up to 64 characters). On many Latitudes it cannot be changed once set.', { maxLength: 64 })
  const p = 'AC Behavior'
  tog(s, p, 'wake-ac', 'Wake on AC', false, 'Turns the laptop on when AC power is connected.', { at: LAP })
  rad(s, p, 'wol', 'Wake on LAN', ['Disabled', 'LAN Only', 'LAN with PXE Boot'], 'Disabled', 'Lets a network "magic packet" turn the computer on. Needs Deep Sleep Control to allow it.', { u: true })
  sel(s, p, 'auto-on', 'Auto On Time', ['Disabled', 'Every Day', 'Weekdays', 'Select Days'], 'Disabled', 'Turns the computer on at a set time.', { at: DESK, u: true })
  add(s, p, 'auto-on-time', 'Auto On Time (HH:MM)', 'text', '08:00', 'Time of day the computer starts.', { at: DESK, maxLength: 5, dep: [dep('sysmgmt.auto-on', ['Every Day', 'Weekdays', 'Select Days'], 'Requires Auto On Time to be on.')] })
  const m = 'Management'
  sel(s, m, 'amt', 'Intel AMT Capability', ['Disabled', 'Restrict MEBx Access', 'Enabled'], 'Restrict MEBx Access', 'Intel Active Management Technology remote management.', { at: DESK, adv: true, u: true })
  tog(s, m, 'mebx', 'MEBx Hotkey', false, 'Allows Ctrl+P to open Intel Management Engine BIOS Extension at startup.', { at: DESK, adv: true, dep: [dep('sysmgmt.amt', ['Restrict MEBx Access', 'Enabled'], 'Requires Intel AMT.')] })
  tog(s, m, 'os-agent', 'OS Agent Requests', true, 'Allows the OS agent (e.g. SupportAssist) to run diagnostics at boot.')
  tog(s, m, 'post-recovery', 'Power-on-Self-Test Automatic Recovery', true, 'Lets the system try to recover itself after a failed POST.', { adv: true })
  info(s, m, 'first-on', 'First Power On Date', 'manufactureDate', 'Date the system was first switched on.')
}

/* ------------------------------------------------------------------ */
/* KEYBOARD                                                            */
/* ------------------------------------------------------------------ */
{
  const s = 'keyboard'
  const g = 'Keyboard'
  tog(s, g, 'fnlock', 'Fn Lock Options', true, 'Lets Fn+Esc switch the F1-F12 keys between standard and multimedia functions.', { at: LAP })
  rad(s, g, 'fnmode', 'Lock Mode', ['Standard', 'Secondary'], 'Secondary', 'Secondary = F1-F12 do their special function by default; Standard = F1-F12 act as plain function keys.', { at: LAP, u: true, dep: [dep('keyboard.fnlock', true, 'Requires Fn Lock Options.')] })
  rad(s, g, 'illum', 'Keyboard Illumination', ['Disabled', 'Dim', 'Bright'], 'Dim', 'Brightness of the keyboard backlight.', { at: LAP, u: true })
  sel(s, g, 'bl-ac', 'Keyboard Backlight Timeout on AC', ['5 sec', '10 sec', '15 sec', '30 sec', '1 min', '5 min', '15 min', 'Never'], '10 sec', 'How long the backlight stays on after the last keypress when on AC.', { at: LAP, u: true, dep: [dep('keyboard.illum', ['Dim', 'Bright'], 'Requires Keyboard Illumination.')] })
  sel(s, g, 'bl-batt', 'Keyboard Backlight Timeout on Battery', ['5 sec', '10 sec', '15 sec', '30 sec', '1 min', '5 min', '15 min', 'Never'], '10 sec', 'How long the backlight stays on after the last keypress when on battery.', { at: LAP, u: true, dep: [dep('keyboard.illum', ['Dim', 'Bright'], 'Requires Keyboard Illumination.')] })
  tog(s, g, 'hotkey', 'Device Configuration Hotkey Access', true, 'Lets Ctrl+I, Ctrl+P or Ctrl+C open RAID/management option ROM screens at startup.', { adv: true })
  tog(s, g, 'numlock', 'Enable Numlock', true, 'Switches Num Lock on when the computer starts.', { at: DESK, u: true })
  tog(s, g, 'numlock-led', 'Enable Numlock LED', true, 'Turns the Num Lock indicator light on or off.', { at: DESK })
  tog(s, g, 'kb-error', 'Enable Keyboard Error Detection', true, 'Reports a keyboard error at startup if no keyboard is found.', { at: DESK })
}

/* ------------------------------------------------------------------ */
/* PRE-BOOT BEHAVIOR                                                   */
/* ------------------------------------------------------------------ */
{
  const s = 'preboot'
  const g = 'Pre-boot Behavior'
  tog(s, g, 'adapter', 'Adapter Warnings', true, 'Shows a warning if the connected AC adapter has too little wattage for the system.', { at: LAP })
  sel(s, g, 'warn', 'Warnings and Errors', ['Prompt on Warnings and Errors', 'Continue on Warnings', 'Continue on Warnings and Errors'], 'Prompt on Warnings and Errors', 'What happens when the BIOS meets a non-critical problem during startup.', { u: true })
  tog(s, g, 'usbc', 'Enable Dock Warning Messages', true, 'Shows USB-C dock warnings, such as an under-powered dock.', { at: LAT })
  sel(s, g, 'fast', 'Fastboot', ['Minimal', 'Thorough', 'Auto'], 'Auto', 'How much hardware checking the BIOS does at startup. Minimal is quickest. Not found in the manuals for the supported models.', { u: true })
  sel(s, g, 'post-time', 'Extend BIOS POST Time', ['0 seconds', '5 seconds', '10 seconds'], '0 seconds', 'Holds the splash screen for longer so you can read messages or press F2/F12.', { u: true })
  tog(s, g, 'sol', 'Early Keyboard Backlight (Sign of Life)', true, 'Lights the keyboard early at power-on so the user sees the system is starting.', { at: LAP })
  sel(s, g, 'mac', 'MAC Address Pass-Through', ['Disabled', 'System Unique MAC Address', 'Passthrough MAC Address'], 'System Unique MAC Address', 'MAC address used by a dock or dongle network port. Handy for network access control that only trusts the laptop\'s own MAC.', { at: LAP, u: true })
}

/* ------------------------------------------------------------------ */
/* VIRTUALIZATION SUPPORT                                              */
/* ------------------------------------------------------------------ */
{
  const s = 'virtualization'
  const g = 'Virtualization'
  tog(s, g, 'vt', 'Enable Intel Virtualization Technology (VT)', true, 'Needed by Hyper-V, WSL2, Windows Sandbox, VMware and VirtualBox. Turn ON if a user\'s VM software says virtualization is disabled.')
  tog(s, g, 'vtd', 'Enable Intel VT for Direct I/O', true, 'Lets virtual machines use hardware devices directly. Also required by Kernel DMA Protection.', { dep: [dep('virtualization.vt', true, 'Requires Intel Virtualization Technology.')] })
  tog(s, g, 'txt', 'Enable Intel Trusted Execution Technology (TXT)', false, 'Measured launch of the OS. Needs TPM, Hyper-Threading, all cores, VT and VT for Direct I/O.',
    { adv: true, dep: [dep('virtualization.vt', true, 'Requires Intel VT.'), dep('virtualization.vtd', true, 'Requires VT for Direct I/O.'), dep('security.tpm', true, 'Requires TPM 2.0 Security On.'), dep('performance.ht', true, 'Requires Hyper-Threading.')] })
  const d = 'DMA Protection'
  tog(s, d, 'predma', 'Enable Pre-Boot DMA Support', true, 'Blocks DMA attacks from external ports before the OS loads.', { dep: [dep('virtualization.vtd', true, 'Requires VT for Direct I/O.')] })
  tog(s, d, 'osdma', 'Enable OS Kernel DMA Support', true, 'Lets Windows Kernel DMA Protection use IOMMU to block DMA attacks. Required for Kernel DMA Protection.', { dep: [dep('virtualization.vtd', true, 'Requires VT for Direct I/O.')] })
  tog(s, d, 'portdma', 'Internal Port DMA Compatibility Mode', false, 'Compatibility mode for internal ports that fail with DMA protection on.', { at: LAT, adv: true })
}

/* ------------------------------------------------------------------ */
/* PERFORMANCE                                                         */
/* ------------------------------------------------------------------ */
{
  const s = 'performance'
  const g = 'Performance'
  sel(s, g, 'cores', 'Multi Core Support (Active Cores)', ['All Cores', '1', '2', '4'], 'All Cores', 'Number of CPU cores the system uses. Reducing this lowers performance.', { adv: true, u: true })
  tog(s, g, 'ht', 'Hyper-Threading', true, 'Lets each core run two threads. Turn off if software licensing or security policy requires.')
  tog(s, g, 'speedstep', 'Enable Intel SpeedStep Technology', true, 'Lets the CPU lower speed and voltage to save power.', { adv: true })
  tog(s, g, 'cstates', 'C-States Control', true, 'Lets the CPU enter low-power idle states.', { adv: true, dep: [dep('performance.speedstep', true, 'Requires Intel SpeedStep.')] })
  tog(s, g, 'turbo', 'Intel Turbo Boost Technology', true, 'Allows the CPU to exceed its base speed under load.')
  tog(s, g, 'adaptive-c', 'Adaptive C-States for Discrete Graphics', true, 'Adaptive C-State behaviour for systems with discrete graphics.', { at: ['precision-mobile'], adv: true, u: true })
  tog(s, g, 'dyntune', 'Dynamic Tuning: Machine Learning', true, 'Lets Dell tuning software adjust performance automatically.', { at: LAP, adv: true })
  tog(s, g, 'prefetch', 'Hardware Prefetcher', true, 'Pre-loads data into CPU cache.', { at: ['precision-tower'], adv: true })
  tog(s, g, 'rebar', 'PCIe Resizable BAR Support', false, 'Lets the CPU access all graphics memory at once. Can improve GPU performance.', { at: TOWER, adv: true })
}

/* ------------------------------------------------------------------ */
/* SYSTEM LOGS                                                         */
/* ------------------------------------------------------------------ */
{
  const s = 'logs'
  sel(s, 'BIOS Event Log', 'bios-clear', 'Clear BIOS Event Log', ['Keep Log', 'Clear Log'], 'Keep Log', 'Choose Clear Log and Apply Changes to erase the log.')
  add(s, 'BIOS Event Log', 'bios-table', 'BIOS Event Log', 'table', '', 'Entries recorded by the BIOS. All entries are synthetic.', { infoKey: 'bios' })
  sel(s, 'Thermal Event Log', 'thermal-clear', 'Clear Thermal Event Log', ['Keep Log', 'Clear Log'], 'Keep Log', 'Choose Clear Log and Apply Changes to erase the log.', { at: LAP })
  add(s, 'Thermal Event Log', 'thermal-table', 'Thermal Event Log', 'table', '', 'Temperature and fan events. Synthetic.', { at: LAP, infoKey: 'thermal' })
  sel(s, 'Power Event Log', 'power-clear', 'Clear Power Event Log', ['Keep Log', 'Clear Log'], 'Keep Log', 'Choose Clear Log and Apply Changes to erase the log.', { at: LAP })
  add(s, 'Power Event Log', 'power-table', 'Power Event Log', 'table', '', 'AC and battery events. Synthetic.', { at: LAP, infoKey: 'power' })
}

/* ------------------------------------------------------------------ */
/* ABOUT                                                               */
/* ------------------------------------------------------------------ */
{
  const s = 'about'
  const g = 'Firmware'
  info(s, g, 'vendor', 'BIOS Vendor', 'vendor', 'Firmware vendor. Synthetic.')
  info(s, g, 'ver', 'BIOS Version', 'biosVersion', 'Installed BIOS version. Synthetic.')
  info(s, g, 'date', 'BIOS Build Date', 'biosDate', 'Build date of the installed BIOS. Synthetic.')
  info(s, g, 'ec', 'EC Version', 'ecVersion', 'Embedded controller firmware version. Synthetic.', { at: LAP })
  info(s, g, 'me', 'Intel ME Firmware Version', 'meVersion', 'Management Engine firmware version. Synthetic.')
}

export const SETTINGS: Setting[] = list

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
export const settingById = (id: string) => SETTINGS.find((s) => s.id === id)

export const appliesTo = (s: { appliesTo?: Platform[] }, platform: Platform) =>
  !s.appliesTo || s.appliesTo.includes(platform)

/** Settings that exist on this model. */
export const settingsForModel = (model: Model) => SETTINGS.filter((s) => appliesTo(s, model.platform))

export const sectionsForModel = (model: Model) => SECTIONS.filter((s) => appliesTo(s, model.platform))

/** BIOS Defaults for every editable setting on the model. */
export function defaultsFor(model: Model): Record<string, Value> {
  const out: Record<string, Value> = {}
  for (const s of settingsForModel(model)) {
    if (s.control === 'readonly' || s.control === 'table' || s.control === 'button' || s.control === 'password') continue
    out[s.id] = s.default
  }
  return out
}

/** Text shown for a readonly/table setting, from model system info. */
export function infoValue(model: Model, key: string, assetTag: string): string {
  const i = model.info
  if (key === 'yes') return 'Yes'
  if (key === 'signedFw') return 'Enabled'
  if (key === 'vendor') return 'PS Tech Training Simulator (synthetic)'
  if (key === 'assetTag') return assetTag || 'Not Set'
  if (key.startsWith('dimm:')) return i.dimmSlots[Number(key.slice(5))] ?? 'Not Installed'
  if (key.startsWith('storage:')) return i.storage[Number(key.slice(8))]?.value ?? 'Not Installed'
  if (key.startsWith('battery.')) {
    const b = i.battery
    if (!b) return 'Not applicable'
    const k = key.slice(8)
    if (k === 'primary') return `${b.primary}`
    if (k === 'level') return '86%'
    if (k === 'ac') return '65W (synthetic)'
    return b[k as 'health' | 'state']
  }
  const v = (i as unknown as Record<string, unknown>)[key]
  return typeof v === 'string' && v ? v : 'Not available'
}
