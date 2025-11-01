


const { app, BrowserWindow, ipcMain } = require('electron/main')
const { mouse, Button } = require("@nut-tree-fork/nut-js");
const { globalShortcut } = require('electron');
const { globalAgent } = require('http');
const iohook = require('@tkomde/iohook');
const { event } = require('jquery');



let win;


let clicking = false;
let clickInterval;
let repeater;
let clickCount = 0;
let hold = false;


//default settings
let interval = 1000;
let clickType = "single";
let mouseBtn = "left";
let repeatCount = 0;
let hotkey = "F6";
let keyCode = "F6";// Will store event.code string from renderer

// iohook keycode to event.code mapping
const iohookToEventCode = {
  59: "F1", 60: "F2", 61: "F3", 62: "F4", 63: "F5", 64: "F6",
  65: "F7", 66: "F8", 67: "F9", 68: "F10", 87: "F11", 88: "F12",
  1: "Escape", 41: "Backquote", 2: "Digit1", 3: "Digit2", 4: "Digit3",
  5: "Digit4", 6: "Digit5", 7: "Digit6", 8: "Digit7", 9: "Digit8",
  10: "Digit9", 11: "Digit0", 12: "Minus", 13: "Equal", 14: "Backspace",
  15: "Tab", 16: "KeyQ", 17: "KeyW", 18: "KeyE", 19: "KeyR", 20: "KeyT",
  21: "KeyY", 22: "KeyU", 23: "KeyI", 24: "KeyO", 25: "KeyP",
  26: "BracketLeft", 27: "BracketRight", 28: "Enter", 58: "CapsLock",
  30: "KeyA", 31: "KeyS", 32: "KeyD", 33: "KeyF", 34: "KeyG",
  35: "KeyH", 36: "KeyJ", 37: "KeyK", 38: "KeyL", 39: "Semicolon",
  40: "Quote", 43: "Backslash", 42: "ShiftLeft", 44: "KeyZ",
  45: "KeyX", 46: "KeyC", 47: "KeyV", 48: "KeyB", 49: "KeyN",
  50: "KeyM", 51: "Comma", 52: "Period", 53: "Slash", 54: "ShiftRight",
  29: "ControlLeft", 3675: "ControlRight", 56: "AltLeft", 3640: "AltRight",
  57: "Space"
};

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
async function startClicking() {
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


function registerKeyboardHotkey() {

  iohook.removeAllListeners("keydown");
  iohook.removeAllListeners("keyup");

  //Hold to autoclick with keyboard button
  if (hold == true) {
    globalShortcut.unregisterAll();

    iohook.on("keydown", (event) => {
      // Only ignore if the app window is focused (to prevent triggering while using the app)
      if (BrowserWindow.getFocusedWindow()) return;

      const eventCode = iohookToEventCode[event.keycode];
      if (eventCode === keyCode && !clicking) {
        win.webContents.send("started");
        startClicking();
      }
    });

    iohook.on("keyup", (event) => {

      const eventCode = iohookToEventCode[event.keycode];
      if (eventCode === keyCode && clicking) {
        win.webContents.send("ended");
        stopClicking();
      }
    });


  }

  else if (hold == false) {
    globalShortcut.register(hotkey, () => {
      if (clicking) {
        win.webContents.send("ended");
        stopClicking();

      } else {
        win.webContents.send("started");
        startClicking();
      }
    });
  }

  iohook.start();
}






const mouseKeys = {
  RMB: 2,
  MMB: 3,
  MB4: 4,
  MB5: 5,
};


function registerMouseHotkey() {

  iohook.removeAllListeners("mousedown");
  iohook.removeAllListeners("mouseup");

  //Hold to autoclick with mouse button
  if (hold == true) {
    iohook.on("mousedown", (event) => {

      // Only ignore if the app window is focused (to prevent triggering while using the app)
      if (BrowserWindow.getFocusedWindow()) return;

      if (event.button === mouseBtn[hotkey] && !clicking) {
        win.webContents.send("started");
        startClicking();
      }
    });

    iohook.on("mouseup", (event) => {

      if (event.button === mouseBtn[hotkey] && clicking) {
        win.webContents.send("ended");
        stopClicking();
      }
    });
  }

  //Click to autoclick with mouse button
  else if (hold == false) {
    iohook.on("mousedown", (event) => {

      // Only ignore if the app window is focused (to prevent triggering while using the app)
      if (BrowserWindow.getFocusedWindow()) return;

      if (event.button === mouseKeys[hotkey] && !clicking) {
        win.webContents.send("started");
        startClicking();
      }
      else if (event.button === mouseKeys[hotkey] && clicking) {
        win.webContents.send("ended");
        stopClicking();
      }
    });
  }


  iohook.start();
}





function waitForRendererHotkey() {
  return new Promise((resolve) => {
    ipcMain.once("getHotkey", (event, data, dataKeyCode) => {
      keyCode = dataKeyCode;
      resolve(data);
    });
  });
}

function waitForRendererModalAction() {
  return new Promise((resolve) => {
    ipcMain.once("action", (event, data) => {
      resolve(data);
    });
  });
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

  //pause globalShortcut while the modal for the hotkey is open to prevent unwanted start of the autoclicker.
  ipcMain.on("pause", async (event) => {
    globalShortcut.unregisterAll();

    save = await waitForRendererModalAction();
    //regex to check if the hotkey is a mouse button
    const pattern = /^(MMB|RMB|MB4|MB5)$/i;
    if (save) {
      hotkey = await waitForRendererHotkey();
      if (pattern.test(hotkey)) {
        registerMouseHotkey();
      }
      else {
        registerKeyboardHotkey();
      }
    } else {
      // Re-register the existing hotkey when closing without saving
      if (pattern.test(hotkey)) {
        registerMouseHotkey();
      }
      else {
        registerKeyboardHotkey();
      }
    }
  })

  ipcMain.on("hold", (event) => {
    hold = true;
    // Re-register mouse hotkey to apply new hold setting
    const pattern = /^(MMB|RMB|MB4|MB5)$/i;
    if (pattern.test(hotkey)) {
      registerMouseHotkey();
    }
    else {
      registerKeyboardHotkey();
    }
  })

  ipcMain.on("unhold", (event) => {
    hold = false;
    // Re-register mouse hotkey to apply new hold setting
    const pattern = /^(MMB|RMB|MB4|MB5)$/i;
    if (pattern.test(hotkey)) {
      registerMouseHotkey();
    }
    else {
      registerKeyboardHotkey();
    }
  })


  registerKeyboardHotkey();


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  iohook.removeAllListeners();
  iohook.stop();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



