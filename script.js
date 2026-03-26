function login() {
    let user = document.getElementById("usuario").value;
    let pass = document.getElementById("password").value;

    if (user === "" || pass === "") {
        alert("Completa todos los campos");
    } else {
        window.location.href = "formulario.html";
    }
}

function evaluar() {
    let nombre = document.getElementById("nombre").value;
    let consumo = document.getElementById("consumo").value;
    let zona = document.getElementById("zona").value;

    if (nombre === "" || consumo === "" || zona === "") {
        alert("Completa todos los campos");
        return;
    }

    let resultado = "";

    if (zona === "alta" && consumo > 200) {
        resultado = "Excelente opción: La energía solar es altamente recomendable para ti ☀️";
    } 
    else if (zona === "media") {
        resultado = "Buena opción: Podrías beneficiarte parcialmente 🌤️";
    } 
    else {
        resultado = "Poco recomendable: La inversión podría no ser óptima 🌥️";
    }

    localStorage.setItem("resultado", resultado);
    window.location.href = "resultados.html";
}

window.onload = function() {
    let texto = document.getElementById("resultado");

    if (texto) {
        texto.innerHTML = localStorage.getItem("resultado");
    }
};
