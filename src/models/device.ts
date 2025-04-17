export interface Device {
    id: string;
    name: string;
    type: string;
    ip: string;
    port: number;
    host: string;
    operatingSystem: string;
    operatingSystemVersion: string;
}

export interface WiFiNetwork {
    ssid: string;
    isConnected: boolean;
    signalStrength: number; // 0-100
    secured: boolean;
}

// Mock data for devices
export const mockDevices: Device[] = [
    {
        id: '1',
        name: 'Raspberry Pi 4',
        type: 'Raspberry Pi',
        ip: '192.168.1.101',
        port: 22,
        host: 'raspberrypi4.local',
        operatingSystem: 'Raspberry Pi OS',
        operatingSystemVersion: 'Bullseye'
    },
    {
        id: '2',
        name: 'Jetson AGX Orin',
        type: 'NVIDIA Jetson',
        ip: '192.168.1.102',
        port: 22,
        host: 'jetson-agx.local',
        operatingSystem: 'Ubuntu',
        operatingSystemVersion: '20.04'
    },
    {
        id: '3',
        name: 'Jetson Orin Nano',
        type: 'NVIDIA Jetson',
        ip: '192.168.1.103',
        port: 22,
        host: 'jetson-nano.local',
        operatingSystem: 'Ubuntu',
        operatingSystemVersion: '20.04'
    },
    {
        id: '4',
        name: 'Raspberry Pi 5',
        type: 'Raspberry Pi',
        ip: '192.168.1.104',
        port: 22,
        host: 'raspberrypi5.local',
        operatingSystem: 'Raspberry Pi OS',
        operatingSystemVersion: 'Bookworm'
    },
    {
        id: '5',
        name: 'Raspberry Pi Zero 2',
        type: 'Raspberry Pi',
        ip: '192.168.1.105',
        port: 22,
        host: 'pizero2.local',
        operatingSystem: 'Raspberry Pi OS',
        operatingSystemVersion: 'Bullseye'
    }
];

// Mock WiFi networks
export const mockWiFiNetworks: WiFiNetwork[] = [
    {
        ssid: 'Home Network',
        isConnected: true,
        signalStrength: 90,
        secured: true
    },
    {
        ssid: 'Guest Network',
        isConnected: false,
        signalStrength: 85,
        secured: true
    },
    {
        ssid: 'IoT Network',
        isConnected: false,
        signalStrength: 75,
        secured: true
    }
];
