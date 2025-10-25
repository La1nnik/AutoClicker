
//adds a glowing effect to whatever element that is curently cliked inside clickConfig

var clickConfigElements = document.querySelectorAll(".clickConfig input, .clickConfig select");

for (let i = 0; i < clickConfigElements.length; i++) {
    let element = clickConfigElements[i];
    element.addEventListener("click", (event) => {
        event.stopPropagation();

        // Remove clicked class from all elements first
        for (let j = 0; j < clickConfigElements.length; j++) {
            element.classList.remove("clicked");
        }

        // Then add it to the current element
        element.classList.add("clicked");


        //Removes the glowing effect if clicked somewhere else
        document.addEventListener("click", () => {
            element.classList.remove("clicked");
            document.removeEventListener("click");
        })
    });
}

/*
if (element.classList.contains("clicked")) {
    element.classList.remove("clicked");
}
else {
    element.classList.add("clicked");
}
*/