
//adds a glowing effect to whatever element that is curently cliked inside clickConfig

var clickConfigElements = document.querySelectorAll(".clickConfig input, .clickConfig select");


for (let i = 0; i < clickConfigElements.length; i++) {
    let element = clickConfigElements[i];
    element.addEventListener("click", (event) => {
        event.stopPropagation();


        const isAlreadyClicked = element.classList.contains("clicked");

        // Remove clicked class from all elements first
        for (let j = 0; j < clickConfigElements.length; j++) {
            clickConfigElements[j].classList.remove("clicked");
        }


        if (element.tagName === "SELECT" && !isAlreadyClicked) {
            element.classList.add("clicked");
        }
        else if (element.tagName === "INPUT") {
            element.classList.add("clicked");
        }


        //Removes the glowing effect if clicked somewhere else
        document.addEventListener("click", () => {
            element.classList.remove("clicked");
            document.removeEventListener("click", event);
        })
    });
}


