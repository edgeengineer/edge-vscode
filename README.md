# Edge for VS Code

A Visual Studio Code extension for building, running, and debugging applications on EdgeOS devices.

## Overview

The Edge extension provides comprehensive integration with the Edge platform, allowing developers to build, run, and debug Swift applications for EdgeOS devices directly from Visual Studio Code. This extension streamlines the development workflow by managing device connections, providing convenient debugging configurations, and offering direct access to Edge documentation.

## Features

### Device Management
- **Device Explorer**: View and manage your EdgeOS devices in the sidebar
- **One-Click Device Selection**: Easily switch between multiple devices for deployment and debugging (Note: currently only 1 device is supported)
- **Auto Discovery**: Automatically detect EdgeOS devices on your network

![Device Management](images/devices.png)

### Swift Integration
- **Project Detection**: Automatic detection of Swift package projects
- **Build and Run**: Build and deploy your Swift packages to EdgeOS devices with one command
- **Task Integration**: EdgeOS tasks are fully integrated with VS Code's task system

![Swift Integration](images/swift-integration.png)

### Debugging
- **Debug Configuration Provider**: Automatically creates appropriate debug configurations for your Swift targets
- **Remote Debugging**: Connect to remote EdgeOS devices for debugging
- **LLDB Integration**: Full debugging support using LLDB with breakpoints, variable inspection, and more

![Debugging](images/debugging.png)

### Documentation
- **Quick Access**: Access EdgeOS documentation directly from the extension
- **Integrated Help**: Find answers to common questions without leaving your development environment

## Requirements

- Visual Studio Code 1.96.0 or newer
- Swift for Visual Studio Code extension
- Edge CLI installed and accessible
- Swift SDK for EdgeOS (for debugging)

## Installation

1. Install the extension from the VS Code Marketplace
2. Ensure the Edge CLI is installed (`edge --version` should work in your terminal)
3. Configure the Swift SDK path if needed for debugging

## Extension Settings

This extension contributes the following settings:

* `edgeos.cliPath`: Path to the Edge CLI executable. Leave empty for automatic detection.
* `edgeos.swiftSdkPath`: Path to the EdgeOS Swift SDK artifact bundle (required for debugging).
* `edgeos.devices`: List of Edge devices (managed by the extension).
* `edgeos.currentDevice`: ID of the currently selected Edge device (managed by the extension).

## Getting Started

1. Open a Swift package project
2. Add an EdgeOS device using the "+" button in the Edge Devices panel
3. Select the device as your current device
4. Use the Run or Debug buttons to deploy and run your application on the device

## Debugging Your Applications

1. Make sure you've configured your Swift SDK path via the settings
2. Select your target device in the Devices panel
3. Open the Debug panel and select "Debug Edge Application"
4. Start debugging to deploy and connect to your application

## Known Issues

- Swift SDK path must be configured manually for debugging
- Debugging requires port 4242 to be accessible on the target device

## Release Notes

### 0.0.6

- wifi configuration

### 0.0.5

- Added automated release process via GitHub Actions

### 0.0.1

- Initial release with basic device management, build and debugging support

---

## Development

### Release Process

This extension uses an automated release process via GitHub Actions. For details on how to release new versions, see [Release Process Documentation](docs/release-process.md).

## Feedback and Contributions

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/edgeengineer/edge-vscode).

**Enjoy building with EdgeOS!**
