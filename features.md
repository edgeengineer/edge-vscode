# Edge Developer Extension

Edge Developer Extension helps developer manage connected Nvidia Jetson, Raspberry Pi's and other EdgeOS devices. EdgeOS devices are connected over Ethernet over USB (by using USB host mode). We use a DHCP server to assign IP addresses to the devices and mDNS/Avahi to resolve the device names.

## Primary Sidebar

1. The VSCode Extension logo is located in `resources/logo.svg`
2. When clicked on the logo, we should show the primary sidebar 
3. The primary sidebar should have a list of devices that are connected to the user's computer (for now let's use a mock list of devices)

# Seeing a List of Devices

Here's the interface for a device:

For now let's just create a mock array of devices that are ["Raspberry Pi 4", "Jetson AGX Orin", "Jetson Orin Nano", "Raspberry Pi 5", "Raspberry Pi Zero 2"]

```
interface Device {
    id: string;
    name: string;
    type: string;
    ip: string;
    port: number;
    host: string;
    operatingSystem: string;
    operatingSystemVersion: string; 
}
```

1. On the Primary Sidebar of the VSCode Extension, there should be a expandable list of "Devices". 
2. Each item should use the `device` name
3. The list of devices should be alphabetically sorted
4. On the right hand side of the list, we should use https://code.visualstudio.com/api/references/icons-in-labels to show two buttons
  a. `$(debug-stop)` for Stopping the app on the Device
  b. `$(debug-start)` for Running the app on the Device
  c. `$(callstack-view-icon)` for Running the app on with the debugger attached
  d. `$(callstack-view-session)` for Attaching the bugger to a running instace of the app
5. If the user clicks on the list item for a device, a page should open that shows the details of the device. Let's call it `DeviceDetailsPage`


# Sidebar Documentation Links 

1. In the primary sidebar underneath the expandable list of "Devices", we should have a list of "Documentation" links
2. The list should have:
  * "Website"
  * "Framework API References"
  * "GitHub"
  * "Forums"
  * "Support"

# Device Details Page

1. When the user clicks on a device in the primary sidebar, the `DeviceDetailsPage` should open
2. On the `DeviceDetailsPage`. We should have a table of all the device properties listed like name, type, ip, port, host, operatingSystem, operatingSystemVersion. 
3. Below the table of details we need another table that shows the list of Wi-Fi networks that are available, and which one is currently connected. 
4. In the cell that has a `Connected` Wi-Fi network, we should have a button that says "Disconnect"
5. In the title where the "Device Tails: {{DEVICE_NAME}}" is, all the way to the right should have a refresh button that says "Refresh" using the vscode icon `$(sync)`. This should be occasionally syncing in the background but pressing the button should force a refresh.
6. In the title where the "Wi-Fi Networks" is, all the way to the right should have a refresh button that says "Refresh" using the vscode icon `$(sync)`. This should be occasionally syncing in the background but pressing the button should force a refresh.

# Setup `.vscode` `tasks.json` and `launch.json`

1. In the primary sidebar we need a new section called "Setup Project"
2. There should be two items in this section:
  * "Setup .vscode"
  * "Setup only tasks.json"
  * "Setup only launch.json"