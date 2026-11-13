# Caesium Vault — Troubleshooting Guide

Quick fixes for common issues. Keep this handy during Maths competitions.

---

## 🌐 LAN Access — Other Devices Can't Connect

**Symptom:** You type `http://<IP>:3000` on another device's browser and nothing loads, or it times out.

### Fix 1: Open Windows Firewall (MOST COMMON)

Open **PowerShell as Administrator** (right-click → Run as Administrator) and run:

```powershell
netsh advfirewall firewall add rule name="Caesium Vault Ports" dir=in action=allow protocol=TCP localport=3000,3001,8080
```

### Fix 2: Change Network Profile to Private

Windows blocks incoming connections on "Public" networks. Run as Administrator:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

> **Note:** Replace `"Wi-Fi"` with your actual adapter name if different. To check, run:
> ```powershell
> Get-NetConnectionProfile
> ```

### Fix 3: Verify All Devices Are on the Same Network

Every device (host laptop + student devices) must be connected to the **exact same Wi-Fi network or hotspot**.

### Fix 4: Check the Correct IP Address

On the host laptop, run in any terminal:

```powershell
ipconfig
```

Look for the **Wireless LAN adapter Wi-Fi** section → **IPv4 Address** (e.g., `192.168.43.196`). Tell students to use that address.

### Fix 5: Verify Both Servers Are Running

Both the **backend** (port 3001) and **frontend** (port 3000) must be running:

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Caecium-Vault"
cd backend ; node server.js
```

In a **second terminal**:

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Caecium-Vault\frontend"
npm run dev
```

Or use the start script:

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Caecium-Vault"
start.bat
```

---

## ⏳ "Connecting to Caesium Vault…" Stuck on Loading

**Symptom:** A browser shows the loading spinner forever.

1. Open the browser's developer console (press `F12` → Console tab) and check for errors.
2. **Clear localStorage:** In the console, type `localStorage.clear()` then refresh the page.
3. Make sure the **backend** server is actually running (port 3001). Check the terminal where you started it.
4. Try a hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac).

---

## 🔌 Backend Won't Start / "Port Already in Use"

**Symptom:** `Error: listen EADDRINUSE :::3001`

Find and kill the process using the port:

```powershell
netstat -ano | findstr :3001
```

Note the PID (last number), then kill it:

```powershell
taskkill /PID <PID> /F
```

Then restart the backend.

---

## 🏟️ Math Arena Shows No Questions

**Symptom:** Teacher starts a match but no questions appear.

The questions database may be empty. Re-seed it:

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Caecium-Vault\backend"
node seed_arena_questions.js
node seed_mental_math.js
```

This loads 99 questions into the database.

---

## 🔗 Socket.io Connection Fails

**Symptom:** Students can see the login page but Arena shows "Connecting…" or nothing happens when joining.

1. Make sure the **backend** is running on port `3001` (check its terminal for "Server running on port 3001").
2. On the student device, open `F12` → Console and look for CORS or WebSocket errors.
3. Verify the frontend's `NEXT_PUBLIC_WS_URL` points to the host IP, not `localhost`. Students connecting from other devices need the IP address, not `localhost`.

---

## 🔒 Database Locked

**Symptom:** `SQLITE_BUSY: database is locked`

1. Stop all running Node processes:

```powershell
taskkill /IM node.exe /F
```

2. Delete the journal file if it exists:

```powershell
del "c:\Users\HP\OneDrive\Desktop\Caecium-Vault\backend\caecium.db-journal"
```

3. Restart the backend.

---

## 🤖 Study Agent / Ollama Not Working

**Symptom:** Study Agent page shows "Ollama is offline" or doesn't respond.

1. Make sure Ollama is installed: Download from [ollama.com](https://ollama.com).
2. Start Ollama and pull a model:

```powershell
ollama run llama3.2
```

3. Verify Ollama is running:

```powershell
curl http://localhost:11434/api/tags
```

> **Note:** Ollama requires a compatible GPU. If your machine doesn't have one, the Study Agent won't work. The rest of the app functions normally without it.

---

## ⚡ Quick Pre-Competition Checklist

Run through this before every Maths Arena session:

| Step | Command / Action |
|------|-----------------|
| 1. Start backend | `cd backend && node server.js` |
| 2. Start frontend | `cd frontend && npm run dev` |
| 3. Check IP | `ipconfig` → note Wi-Fi IPv4 address |
| 4. Test on host | Open `http://localhost:3000` in browser |
| 5. Test from another device | Open `http://<YOUR_IP>:3000` on a phone/tablet |
| 6. Firewall (if step 5 fails) | Run firewall rule as Admin (see Fix 1 above) |
| 7. Teacher logs in | Use teacher account in Arena |
| 8. Students join | Students open the IP address and join the Arena lobby |

---

## 🧯 Emergency: Reset Everything

If all else fails, stop everything and start fresh:

```powershell
# Kill all Node processes
taskkill /IM node.exe /F

# Clear database and re-seed
cd "c:\Users\HP\OneDrive\Desktop\Caecium-Vault\backend"
del caecium.db
del caecium.db-journal
node server.js
```

In another terminal, re-seed questions:

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Caecium-Vault\backend"
node seed_arena_questions.js
node seed_mental_math.js
```

> ⚠️ **Warning:** Deleting `caecium.db` removes ALL data — user accounts, match history, everything. Only do this as a last resort.

---

## 📞 Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `EADDRINUSE` | Port is already in use | Kill the process using that port |
| `SQLITE_BUSY` | Another process has the database locked | Stop all Node processes, delete journal file |
| `ECONNREFUSED` | Backend server isn't running | Start the backend first |
| `ERR_CONNECTION_TIMED_OUT` | Firewall or wrong IP | Run firewall rule, verify IP address |
| `Each child in list should have unique key` | React warning (cosmetic) | Safe to ignore — doesn't break functionality |
| `CORS error` | Frontend can't reach backend | Verify both servers use the same IP/hostname |
