const { ipcRenderer } = require("electron");

const stateBtn = document.getElementById("state");
const clicksHTML = document.getElementById("clicks");
const clickInterval = document.getElementById("clickInterval");
const clickType = document.getElementById("clickType");
const mouseBtn = document.getElementById("mouseBtn");
const repeatCount = document.getElementById("repeatCount");


//sends the input of click interval from the renderer to the main proccess;
function sendClickInterval() {
    ipcRenderer.send("interval", Number(clickInterval.value));
}

function sendClickType() {
    ipcRenderer.send("clickType", clickType.value);
}

function sendMouseBtn() {
    ipcRenderer.send("mouseBtn", mouseBtn.value);
}

function sendRepeatCount() {
    ipcRenderer.send("repeatCount", repeatCount.value);
}


function sendHotkey() {

}

//Stopwatch==================================================

let output = document.getElementById("runtime");
let time;
let sec = 0;
let min = 0;
let hr = 0;

function timer() {
    sec++;
    if (sec === 60) {
        min++
        sec = 0
    }
    if (min === 60) {
        hr++;
        sec, min = 0;
    }

    //Doing some string interpolation

    let seconds = sec < 10 ? `0` + sec : sec;
    let minute = min < 10 ? `0` + min : min;
    let hour = hr < 10 ? "0" + hr : hr;

    let timer = `${hour}:${minute}:${seconds}`;
    output.innerHTML = timer;
};
//===========================================================









//AutoClicker ON
ipcRenderer.on("started", () => {

    time = setInterval(timer, 1000);

    clicksHTML.style.color = "#a551f5"
    stateBtn.innerHTML = "Active";
    stateBtn.style.color = "#f03d3dff";


});

//AutoClicker OFF
ipcRenderer.on("ended", () => {
    clearInterval(time);
    stateBtn.innerHTML = "Idle";
    stateBtn.style.color = "#78ff84";

});

//ClickCount

ipcRenderer.on("clickCount", (event, clickCount) => {
    clicksHTML.innerHTML = clickCount;
});


//Modal
const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const saveModal = document.getElementById("saveModal");
const rendererHotkeyText = document.getElementById("hotkey");


let hotkey

function handleKeydown(event) {
    hotkey = event.key.toUpperCase();
    rendererHotkeyText.innerHTML = hotkey;
}

function handleMousedown(event) {
    if (event.target === saveModal || event.target === closeBtn) return;

    switch (event.button) {
        case 0:
            rendererHotkeyText.innerHTML = "LMB";
            hotkey = "LMB";
            break;
        case 1:
            rendererHotkeyText.innerHTML = "MMB";
            hotkey = "MMB";
            break;

        case 2:
            rendererHotkeyText.innerHTML = "RMB";
            hotkey = "RMB";
            break;

        case 3:
            rendererHotkeyText.innerHTML = "MB4";
            hotkey = "MB4";
            break;
        case 4:
            rendererHotkeyText.innerHTML = "MB5";
            hotkey = "MB5";
            break;
    }


}



openBtn.addEventListener("click", () => {
    modal.classList.add("open");

    ipcRenderer.send("pause");


    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleMousedown);


});

closeBtn.addEventListener("click", () => {
    document.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("mousedown", handleMousedown);
    ipcRenderer.send("action", false);
    modal.classList.remove("open");

});

saveModal.addEventListener("click", () => {
    document.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("mousedown", handleMousedown);

    ipcRenderer.send("action", true);
    ipcRenderer.send("getHotkey", hotkey);
    openBtn.innerHTML = hotkey;

    modal.classList.remove("open");
});



//Add a comparison check between the event.target and saveModal
//Make the the save button change the hotkey button outside the modal
