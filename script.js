function login() {
    let user = document.getElementById("usuario").value;
    let pass = document.getElementById("password").value;

    if (user === "" || pass === "") {
        alert("Completa todos los campos");
    } else {
        window.location.href = "formulario.html";
    }
}

function enviar() {
    let nombre = document.getElementById("nombre").value;
    let edad = document.getElementById("edad").value;
    let estado = document.getElementById("estado").value;

    if (nombre === "" || edad === "" || estado === "") {
        alert("Completa todos los campos");
    } else {
        localStorage.setItem("estado", estado);
        window.location.href = "resultados.html";
    }
}

window.onload = function() {
    let resultado = document.getElementById("resultado");

    if (resultado) {
        let estado = localStorage.getItem("estado");

        if (estado === "bien") {
            resultado.innerHTML = "Resultado: Estado positivo 😊";
        } else if (estado === "regular") {
            resultado.innerHTML = "Resultado: Estado neutral 😐";
        } else {
            resultado.innerHTML = "Resultado: Estado negativo 😔";
        }
    }
};
