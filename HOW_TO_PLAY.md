# How to Play WinterDrad - Visual Guide

## 🎮 The Easiest Way to Play

### Step 1: Run the Quick Start Script

**On Windows:**
- Double-click `play.bat`

**On Linux/Mac:**
```bash
./play.sh
```

That's it! The script will:
- ✅ Start a web server automatically
- ✅ Open your browser to the game
- ✅ Show you the controls

---

## 🎯 What You'll See

### Welcome Screen

When the game loads, you'll see a welcome screen:

![Welcome Screen](https://github.com/user-attachments/assets/27ffc900-77da-4b50-9685-1663cee8b170)

**Just click the green "Click to Play!" button to start!**

---

### Game View

After clicking, the welcome screen disappears and you see:

![Game Running](https://github.com/user-attachments/assets/4a91f219-820c-4845-abde-56b5ddf8b325)

**What you see:**
- 🎨 **Blue sky background** - The voxel world is rendering
- 📊 **FPS: 60** (top right) - Performance counter in green
- 📋 **Controls info** (top left) - Quick reference
- 🎮 **Status bar** (bottom) - Shows if mouse is captured

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **W** | Move forward |
| **S** | Move backward |
| **A** | Move left |
| **D** | Move right |
| **Mouse** | Look around (after clicking canvas) |
| **ESC** | Release mouse control |

---

## 💡 Tips

1. **Click the canvas first** - You need to click on the game area to capture your mouse
2. **Watch the status bar** - It tells you if the game has mouse control
3. **Press ESC anytime** - To release mouse and access your browser
4. **Check FPS counter** - Should show 60 FPS for smooth gameplay

---

## 🔧 Troubleshooting

### Script doesn't work?

**Option 1: Manual Python Server**
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Option 2: Node.js Server**
```bash
npx http-server -p 8080
```

**Option 3: Just open the file**
Some browsers let you open `index.html` directly, but this may have limitations.

### Can't move or look around?

Make sure you've **clicked on the canvas** first! Look for the status bar at the bottom:
- ❌ "Click canvas to start playing" (orange) - Click the game area
- ✅ "Playing - Press ESC to release mouse" (green) - You're ready!

### Game is black or blank?

- Make sure your browser supports WebGL
- Try Chrome or Firefox
- Check browser console (F12) for errors

---

## 🌐 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome/Chromium | ✅ Recommended |
| Firefox | ✅ Works Great |
| Edge | ✅ Supported |
| Safari | ✅ Supported |
| IE | ❌ Not Supported |

---

## 📚 More Information

See the full [README.md](README.md) for:
- Technical details
- Architecture information
- Development guides
- Complete troubleshooting

---

**Enjoy playing WinterDrad!** 🎮✨
