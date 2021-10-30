'use strict';

const d = document;

const selectProvincia = d.querySelector('select#provincia');
const selectLocalidad = d.querySelector('select#localidad');
const backdrop = d.querySelector('.backdrop');

// Variables globales
let provincia, data;

let coor = { lat: -32.8752975, lng: -68.8448029 };

const provincias = [
    "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Ciudad Autónoma de Buenos Aires",
    "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy",
    "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén",
    "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
    "Santiago del Estero", "Tierra del Fuego, Antártida e Islas del Atlántico Sur", "Tucumán"
];

d.addEventListener('DOMContentLoaded', () => {
    initChangeProvincia();
    // En la carga del DOM desabilitamos el select de localidad (Estado inicial disabled)
    if (selectLocalidad) { selectLocalidad.disabled = true; }
    initChangeLocalidad();
    initPreventKeyboard();
});

// Inicializar el cambio de Provincia
function initChangeProvincia() {
    if (selectProvincia) {
        selectProvincia.onchange = function (e) { return handleChangeProvincia(this, e); }
    }
}

// Manejar el cambio de Provincia
function handleChangeProvincia(selectObj, objEvent) {
    if (selectLocalidad) {
        // Solo se habilitará cuando el índice seleccionado sea distinto de cero
        selectLocalidad.disabled = true;
        // Removemos opciones si las hay
        removeOptions(selectLocalidad);
        // Removemos datos de salida, si los hay
        output('');
        // Obtenemos el índice seleccionado
        const selectedIndex = selectObj.selectedIndex;
        // Verificamos que el índice sea mayor a cero
        if (selectedIndex > 0) {
            // Obtenemos el valor de la opción seleccionada
            provincia = selectObj.options[selectedIndex].value;
            // Válidamos que sea una provincia válida antes de continuar
            if (provincias.includes(provincia)) {
                // V. 1
                // const url = 'https://neorepo.github.io/localidades-argentinas/by-province/' + provincia.replaceAll(" ", "") + '.json';
                // V. 2
                const url = 'https://neorepo.github.io/localidades-argentinas/by-province-v2/' + provincia + '.json';
                // Solicitar datos al servidor
                sendHttpRequest('GET', url, null, loadLocalities);
                // Habilitamos el select de localidades
                selectLocalidad.disabled = false;
            } else {
                alert('Lo sentimos, no podemos procesar su solicitud!');
            }
        }
    }
}

// Cargar las localidades
function loadLocalities(response) {
    // Parseamos la respuesta del servidor
    data = JSON.parse(response).localidades;
    if (data) {
        // Creamos opciones
        createOptions(data, selectLocalidad);
    } else {
        // Removemos las opciones del select localidades, sí las hay
        removeOptions(selectLocalidad);
        console.log("Algo salió mal!");
    }
}

// Inicializar el cambio de Localidad
function initChangeLocalidad() {
    if (selectLocalidad) {
        // En la carga del DOM desabilitamos el select de localidad
        selectLocalidad.disabled = true;
        selectLocalidad.onchange = function (e) { return handleChangeLocalidad(this, e); }
    }
}

// Manejar el cambio de Localidad
function handleChangeLocalidad(selectObj, objEvent) {
    const selectedIndex = selectObj.selectedIndex;
    let message = '';
    if (selectedIndex > 0) {
        const obj = data[selectedIndex - 1];
        message += `<div class="output"><h3>${obj.nombre}, ${provincia.toUpperCase()}</h3><h4>Código postal: ${obj.cp}</h4></div>`;

        // Si existen las coordenadas, mostramos el mapa
        if (obj.latitud && obj.longitud) {
            coor.lat = obj.latitud;
            coor.lng = obj.longitud;
            initMap();
        }
    }
    // Mostrar datos
    output(message);
}

let map;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: coor.lat, lng: coor.lng },
        zoom: 12,
    });

    const marker = new google.maps.Marker({
        position: { lat: coor.lat, lng: coor.lng },
        map: map
    });

    const infowindow = new google.maps.InfoWindow({
        content: "<p>Marker Location:" + marker.getPosition() + "</p>",
    });

    google.maps.event.addListener(marker, "click", () => {
        infowindow.open(map, marker);
    });
}

// Crea opciones en objetos select
function createOptions(data, selectObj) {
    let newOpt;
    const fragment = d.createDocumentFragment();
    data.forEach(obj => {
        newOpt = d.createElement('option');
        newOpt.value = obj.id;
        newOpt.text = obj.nombre + " (" + obj.partido + ")";
        try {
            fragment.add(newOpt);
        } catch (error) {
            fragment.appendChild(newOpt);
        }
    });
    selectObj.appendChild(fragment);
}

// Remueve todas las opciones excepto el índice 0 (osea no remueve la primera opción)
function removeOptions(selectObj) {
    let len = selectObj.options.length;
    while (len-- > 1) selectObj.remove(1);
}

// Datos de salida
function output(message) {
    const output = d.querySelector('#output');
    if (output) output.innerHTML = message;
}

// Enviar solicitud al servidor
function sendHttpRequest(method, url, data, callback) {
    const xhr = getXhr();
    xhr.onreadystatechange = processRequest;
    function getXhr() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    function processRequest() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status == 200 && xhr.response != null) {
                if (callback) callback(xhr.response);
            } else {
                console.log("There was a problem retrieving the data: " + xhr.statusText);
            }
        }
    }
    xhr.open(method, url + ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime());
    xhr.onloadstart = function (e) { openLoader(); }
    xhr.onloadend = function (e) { closeLoader(); }
    if (data && !(data instanceof FormData)) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);
    xhr.onerror = function (e) { console.log("Error: " + e + " Could not load url."); }
}

// Validamos el caracter que forma parte del código 3166-2
function validCharacter(c) {
    // Solo letras mayúsculas son permitidas
    const re = /^[ABCDEFGHJKLMNPQRSTUVWXYZ]{1}$/; // No incluidas => I,Ñ,O
    return re.test(c);
}

function closeLoader() {
    if (backdrop) backdrop.style.display = "none";
}

function openLoader() {
    if (backdrop) backdrop.style.display = "block";
}

function initPreventKeyboard() {
    window.oncontextmenu = (e) => { e.preventDefault(); }
    window.onkeydown = (e) => {
        if ((e.ctrlKey && e.shiftKey && e.keyCode == 73) ||
            (e.ctrlKey && e.keyCode == 85)) {
            e.preventDefault();
        }
    }
}
