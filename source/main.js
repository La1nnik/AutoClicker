


const { app, BrowserWindow, ipcMain } = require('electron/main')
const { mouse, Button } = require("@nut-tree-fork/nut-js");
const { globalShortcut } = require('electron');

let win;

let clicking = false;
let clickInterval;
let repeater;
let hotkey = "F6";
let clickCount = 0;

//map for choosing the right function
const clickTypeMap = {
  single: async (btn) => {
    await mouse.click(btn);
  },
  double: async (btn) => {
    await mouse.doubleClick(btn);
  }
}

//map for choosing the right button
const buttonMap = {
  left: Button.LEFT,
  right: Button.RIGHT,
};

//responsible for starting clicking and repeat count feature
async function startClicking(interval, clickType, mouseBtn, repeatCount) {
  if (clicking) return;
  clicking = true;


  const btn = buttonMap[mouseBtn];
  const clickFnc = clickTypeMap[clickType];

  //Clicks a set amoount of times and then stops.
  if (repeatCount > 0) {
    let repeatedClicks = 0;

    repeater = setInterval(async () => {
      if (repeatedClicks >= repeatCount) {
        clearInterval(repeater);
        clicking = false;
        win.webContents.send("ended");
        return;
      }

      await clickFnc(btn);
      clickCount++;
      repeatedClicks++;
      win.webContents.send("clickCount", clickCount);

    }, interval)

    return;
  }

  //Clicks infinitly
  clickInterval = setInterval(async () => {

    await clickFnc(btn);
    clickCount++;
    win.webContents.send("clickCount", clickCount);

  }, interval);
}



function stopClicking() {
  if (!clicking) return;
  clearInterval(clickInterval);
  clearInterval(repeater);
  clicking = false;
  clickInterval = null;
  repeater = null;
}

//=======================================================================================
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


app.whenReady().then(() => {
  createWindow();

  let interval = 1000;
  let clickType = "single";
  let mouseBtn = "left";
  let repeatCount = 0;

  ipcMain.on("interval", (event, ms) => {
    interval = ms;
  })

  ipcMain.on("clickType", (event, data) => {
    clickType = data;
  })

  ipcMain.on("mouseBtn", (event, data) => {
    mouseBtn = data;
  })

  ipcMain.on("repeatCount", (event, data) => {
    repeatCount = data;
  })


  // Hotkey
  globalShortcut.register(hotkey, () => {
    if (clicking) {
      win.webContents.send("ended");
      stopClicking();

    } else {
      win.webContents.send("started");
      startClicking(interval, clickType, mouseBtn, repeatCount);
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



