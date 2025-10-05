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
const rendererHotkey = document.getElementById("hotkey");

let hotkey;

openBtn.addEventListener("click", () => {
    modal.classList.add("open");
    openBtn.addEventListener("keydown");
    openBtn.addEventListener("mousedown");

    ipcRenderer.send("getHotkey");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});

saveModal.addEventListener("click", () => {
    modal.classList.remove("open");
});



