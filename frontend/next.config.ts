import type { NextConfig } from "next";
import os from "os";

// Gather all local network IPv4 addresses so Next.js dev server & Turbopack
// allow assets, websockets, and HMR from any device connected to the school LAN / Wi-Fi
function getLocalIps(): string[] {
  const ips: string[] = ["localhost", "127.0.0.1"];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  // Allow all devices on LAN to access Next.js dev server assets without CORS / origin blocking
  allowedDevOrigins: [
    ...getLocalIps(),
    "192.168.*",
    "10.*",
    "172.16.*",
    "172.17.*",
    "172.18.*",
    "172.19.*",
    "172.20.*",
    "172.21.*",
    "172.22.*",
    "172.23.*",
    "172.24.*",
    "172.25.*",
    "172.26.*",
    "172.27.*",
    "172.28.*",
    "172.29.*",
    "172.30.*",
    "172.31.*",
  ],
};

export default nextConfig;
