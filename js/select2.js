$(document).ready(function () {
    $('#provincia').select2({
        theme: "bootstrap4",
        language: {
            noResults: function () { return "No se encontraron resultados" }
        }
    });

    $('#localidad').select2({
        // placeholder: '- Seleccione una opción -',
        // allowClear: true,
        theme: "bootstrap4",
        minimumInputLength: 3,
        language: {
            inputTooShort: function (e) {
                var n = e.minimum - e.input.length, r = "Por favor, introduzca " + n + " car"; return r += 1 == n ? "ácter" : "acteres";
            },
            noResults: function () { return "No se encontraron resultados"; }
        }
    });
});