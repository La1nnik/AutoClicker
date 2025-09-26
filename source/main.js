


const { app, BrowserWindow, ipcMain } = require('electron/main')
const { mouse, keyboard, Button, Key } = require("@nut-tree-fork/nut-js");
const { globalShortcut, webContents } = require('electron');

let win;

let clicking = false;
let msInterval = 1000;
let clickInterval;
let hotkey = "F6";
let clickCount = 0;



async function startClicking(interval) {
  if (clicking) return;
  clicking = true;

  clickInterval = setInterval(() => {

    (async () => {
      await mouse.click(Button.LEFT);
      clickCount++;
      win.webContents.send("clickCount", clickCount);
    })();
  }, interval);

  console.log("Started clicking");
}

function stopClicking() {
  if (!clicking) return;
  clearInterval(clickInterval);
  clicking = false;
  clickInterval = null;
  console.log("Stopped clicking");
}

const createWindow = () => {

  win = new BrowserWindow({
    width: 700,
    height: 800,
    minHeight: 700,
    minWidth: 480,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })

  const path = require('path');
  win.loadFile(path.join(__dirname, "index.html"));
}

//----------------------------------------------------------------
app.whenReady().then(() => {
  createWindow();
  let interval;
  ipcMain.on("interval", (event, ms) => {
    console.log("Yay, the event was fired")
    interval = ms;
  })

  // Hotkey
  globalShortcut.register(hotkey, () => {
    if (clicking) {
      win.webContents.send("ended");

      stopClicking();

    } else {

      win.webContents.send("started");
      startClicking(interval);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



