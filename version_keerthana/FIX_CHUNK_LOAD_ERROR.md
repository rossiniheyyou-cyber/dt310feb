# Fix ChunkLoadError: Loading chunk app/layout failed

## Quick Fix Steps

### 1. Restart the Dev Server (Try this first)
```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
# or
yarn dev
```

### 2. Clear Next.js Cache
```bash
# Delete the .next folder
rm -rf .next
# or on Windows:
rmdir /s /q .next

# Then restart the dev server
npm run dev
```

### 3. Clear Node Modules (if above doesn't work)
```bash
# Delete node_modules and .next
rm -rf node_modules .next
# or on Windows:
rmdir /s /q node_modules .next

# Reinstall dependencies
npm install
# or
yarn install

# Restart dev server
npm run dev
```

### 4. Check for Port Conflicts
Make sure port 3000 is not being used by another process:
```bash
# On Windows (PowerShell)
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID> /F
```

### 5. Hard Refresh Browser
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)
- This clears browser cache for the page

## Common Causes

1. **Hot Module Replacement (HMR) issue** - Dev server needs restart
2. **Corrupted build cache** - `.next` folder needs deletion
3. **Port conflict** - Another process using port 3000
4. **Browser cache** - Old chunks cached in browser
5. **Import errors** - Check console for actual import errors

## If Error Persists

Check the browser console and terminal for:
- Actual import errors
- Syntax errors in layout.tsx or imported components
- Missing dependencies

The layout.tsx file looks correct, so this is likely a cache/build issue.
