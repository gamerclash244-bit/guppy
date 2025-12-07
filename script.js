function swapCities(){
    let from = document.getElementById("from");
    let to = document.getElementById("to");

    let temp = from.value;
    from.value = to.value;
    to.value = temp;
}

// Basic validation
function checkFields(){
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;

    if(from === "" || to === ""){
        alert("Please enter both FROM and TO locations.");
    } else {
        alert("Searching flights from " + from + " to " + to);
    }
}

