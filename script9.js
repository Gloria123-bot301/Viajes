const alarmasActivasPorPlaca = {};

const contadorViajesPorPlaca = {};

function obtenerLimitesAlarmas() {
    return {
        minA1: parseInt(localStorage.getItem('minA1')) || 0,
        maxA1: parseInt(localStorage.getItem('maxA1')) || 0,
        minA2: parseInt(localStorage.getItem('minA2')) || 0,
        maxA2: parseInt(localStorage.getItem('maxA2')) || 0,
        minA3: parseInt(localStorage.getItem('minA3')) || 0,
        maxA3: parseInt(localStorage.getItem('maxA3')) || 0,
        minA4: parseInt(localStorage.getItem('minA4')) || 0,
        maxA4: parseInt(localStorage.getItem('maxA4')) || 0,
        minA5: parseInt(localStorage.getItem('minA5')) || 0,
        maxA5: parseInt(localStorage.getItem('maxA5')) || 0,
		
    };

}

function generarAlarmas(alarmas) {
    return alarmas.map(color => `<span class="alarma ${color}"></span>`).join("");
}

function abrirModal() {
    document.getElementById("modalViaje").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalViaje").style.display = "none";
}

function mostrarSeccion(id) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
        seccion.style.display = "none"; // Se oculta al cambiar de sección
    });

    // Mostrar la sección seleccionada
    const seccionSeleccionada = document.getElementById(id);
    seccionSeleccionada.classList.add('activa');
    seccionSeleccionada.style.display = "block"; // Mostrar la sección activada

    // Ocultar la barra superior y el cuadro de contraseña si no es la configuración
    if (id !== 'configuracion') {
        document.getElementById("barra-superior-configuracion").style.display = "none";
        document.getElementById("i-contrasena").style.display = "none";
        document.getElementById("contenido-configuracion").style.display = "none";
    } else {
        document.getElementById("barra-superior-configuracion").style.display = "none";
        document.getElementById("i-contrasena").style.display = "block";
        document.getElementById("contenido-configuracion").style.display = "none";
    }
}


document.addEventListener("DOMContentLoaded", function() {
    mostrarSeccion('traslados'); // Mostrar la sección de Traslados por defecto al cargar la página
});

function buscarViajes(){
let fechaInicio = document.getElementById("fechaInicio").value;
let fechaFin = document.getElementById("fechaFin").value;
let estatus = document.getElementById("estatus").value;
let tipoBusqueda = document.getElementById("Select1").value;
let valorBusqueda = document.getElementById("CuadroDeTexto1").value;

let params = new URLSearchParams();
if(fechaInicio)params.append("fechaInicio",fechaInicio);
if(fechaFin)params.append("fechaFin", fechaFin);
if(estatus !== "none")params.append("estatus", estatus);
if(tipoBusqueda !== "ocultar" && valorBusqueda)params.append("tipoBusqueda", tipoBusqueda);
if(tipoBusqueda !== "ocultar" && valorBusqueda)params.append("valorBusqueda", valorBusqueda);

fetch(`http://localhost:8080/BD9.php?${params.toString()}`)
   .then(response => response.json())
   .then(datos => mostrarDatos(datos))
   .catch(error => console.error("Error en la búsqueda:", error));
}

function iniciarViaje() {
    let folio = document.getElementById("folioTurno").value;
    let estatus = "Iniciado";
    let fechaInicio = document.getElementById("fechaHoraInicio").value;
    let fechaFin = document.getElementById("fechaHoraFin").value;
    let transportista = document.getElementById("lineaTransportista").value;
    let tipoTransporte = document.getElementById("tipoTransporte").value;
    let origen = document.getElementById("terminalOrigen").value;
    let destino = document.getElementById("terminalDestino").value;

    if (!folio || !fechaInicio || !transportista || !origen || !destino) {
        alert("Por favor, llena los campos obligatorios.");
        return;
    }

    let tabla = document.getElementById("tablaResultados");
    let nuevaFila = tabla.insertRow();

    nuevaFila.innerHTML = `
        <td>${folio}</td>
        <td>${estatus}</td>
        <td>${fechaInicio}</td>
        <td>${fechaFin || "N/A"}</td>
        <td>${transportista}</td>
        <td>${tipoTransporte || "N/A"}</td>
        <td>N/A</td>
        <td>${origen}</td>
        <td>${destino}</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
    `;

    cerrarModal();

    document.getElementById("folioTurno").value = "";
    document.getElementById("fechaHoraInicio").value = "";
    document.getElementById("fechaHoraFin").value = "";
    document.getElementById("lineaTransportista").value = "";
    document.getElementById("tipoTransporte").value = "";
    document.getElementById("terminalOrigen").value = "";
    document.getElementById("terminalDestino").value = "";
}

function obtenerDatos() {
    fetch('http://localhost:8080/BD9.php')  // Ruta BD
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(datos => {
            let tablaResultados = document.getElementById("tablaResultados");

            if (!datos || datos.length === 0) {
                console.warn('No se recibieron datos.');
                tablaResultados.innerHTML = "<tr><td colspan='21'>No hay datos disponibles</td></tr>";
                return;
            }

            mostrarDatos(datos);
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
            alert('No se pudieron obtener los datos. Intenta nuevamente.');
        });
}

//Funcion para calcular A1, A2, A3, A4 y A5
function calcularAlarmas(dato, index, datos) {
    const ORIGEN_LC_ID = 12;
    const DESTINO_TUMII_ID = 18;

    const origenId = dato.nIdManiobristaOrigen019;
    const destinoId = dato.nIdManiobristaDestino019;

    let origen;
    if (origenId === 12 || origenId === "12" || origenId === 'LC LOGISTICS GPS') {
        origen = 'LC LOGISTICS GPS';
    } else if (origenId === 18 || origenId === "18" || origenId === 'TUMII') {
        origen = 'TUMII';
    } else {
        origen = 'NULL';
    }

    let destino;
    if (destinoId === 12 || destinoId === "12" || destinoId === 'LC LOGISTICS GPS') {
        destino = 'LC LOGISTICS GPS';
    } else if (destinoId === 18 || destinoId === "18" || destinoId === 'TUMII') {
        destino = 'TUMII';
    } else {
        destino = 'NULL';
    }

    const fechaSalida = new Date(dato.dFechaSalida);
    const fechaLlegadaAPI = dato.dFechaLlegada;
    const placas = dato.sPlacas;
    const estado = dato.nEstado;

    // Si el origen o el destino son Null, o el estado es Cancelado, mostrar sin color
    if (origen === 'NULL' || destino === 'NULL' || estado === "Cancelado") {
        return { a1: "", a2: "", a3: "", a4: "", a5: "" };
    }

    let fechaLlegada = null;
    if (estado === "Iniciado") {
        fechaLlegada = new Date(); // Utilizar la hora actual si el estado es "Iniciado"
    } else if (fechaLlegadaAPI && fechaLlegadaAPI !== "Sin fecha") {
        const parsedFechaLlegada = new Date(fechaLlegadaAPI);
        if (!isNaN(parsedFechaLlegada)) {
            fechaLlegada = parsedFechaLlegada;
        } else {
            console.warn(`Fecha de llegada inválida para el registro ${index}: ${fechaLlegadaAPI}`);
            return { a1: "", a2: "", a3: "", a4: "", a5: "" }; 
        }
    } else {
        return { a1: "verde", a2: "verde", a3: "verde", a4: "verde", a5: "verde" };
    }

    // Función para calcular la diferencia M
    function diferenciaMinutos(fecha1, fecha2) {
        if (isNaN(fecha1) || isNaN(fecha2)) return 0;
        return Math.abs((fecha1 - fecha2) / 60000);
    }

    // Función para asignar colores
    function colorPorMinutos(dif, limiteMin, limiteMax) {
        if (limiteMax === 0 && limiteMin === 0) return ""; 
        if (dif > limiteMax) return "negro";
        if (dif > limiteMin) return "rojo";
        return "verde";
    }

    const limites = obtenerLimitesAlarmas(); 
    let a1 = "verde", a2 = "verde", a3 = "verde", a4 = "verde", a5 = "verde";

    if ((origen === 'LC LOGISTICS GPS' && destino === 'TUMII') || (origen === 'TUMII' && destino === 'LC LOGISTICS GPS')) {
        
		// A1 TUMII
        if (origen === 'LC LOGISTICS GPS' && destino === 'TUMII' && fechaLlegada) {
            const dif = diferenciaMinutos(fechaSalida, fechaLlegada);
            const color = colorPorMinutos(dif, limites.minA1, limites.maxA1);
            if (color !== "verde") a1 = color; 
        }

        // A2 (comparar con viaje anterior)
        if (origen === 'TUMII' && destino === 'LC LOGISTICS GPS') {
            const anterior = datos.slice(0, index).reverse().find(d =>
                (d.nIdManiobristaOrigen019 === 12 || d.nIdManiobristaOrigen019 === "12" || d.nIdManiobristaOrigen019 === 'LC LOGISTICS GPS') &&
                (d.nIdManiobristaDestino019 === 18 || d.nIdManiobristaDestino019 === "18" || d.nIdManiobristaDestino019 === 'TUMII') &&
                d.dFechaLlegada &&
                d.dFechaLlegada !== "Sin fecha" &&
                !isNaN(new Date(d.dFechaLlegada)) &&
                d.sPlacas === placas &&
                d.nEstado !== "Cancelado"
            );

            if (anterior && anterior.dFechaLlegada && anterior.dFechaLlegada !== "Sin fecha") {
                const anteriorLlegada = new Date(anterior.dFechaLlegada);
                const dif = diferenciaMinutos(fechaSalida, anteriorLlegada);
                const color = colorPorMinutos(dif, limites.minA2, limites.maxA2);
                if (color !== "verde") a2 = color; 
            }
        }

        // A3 GPS
        if (origen === 'TUMII' && destino === 'LC LOGISTICS GPS' && fechaLlegada) {
            const dif = diferenciaMinutos(fechaSalida, fechaLlegada);
            const color = colorPorMinutos(dif, limites.minA3, limites.maxA3);
            if (color !== "verde") a3 = color; 
        }

        // A4 (comparar con viaje anterior)
        if (origen === 'LC LOGISTICS GPS' && destino === 'TUMII') {
            const anterior = datos.slice(0, index).reverse().find(d =>
                (d.nIdManiobristaOrigen019 === 18 || d.nIdManiobristaOrigen019 === "18" || d.nIdManiobristaOrigen019 === 'TUMII') &&
                (d.nIdManiobristaDestino019 === 12 || d.nIdManiobristaDestino019 === "12" || d.nIdManiobristaDestino019 === 'LC LOGISTICS GPS') &&
                d.dFechaLlegada &&
                d.dFechaLlegada !== "Sin fecha" &&
                !isNaN(new Date(d.dFechaLlegada)) &&
                d.sPlacas === placas &&
                d.nEstado !== "Cancelado"
            );

            if (anterior && anterior.dFechaLlegada && anterior.dFechaLlegada !== "Sin fecha") {
                const anteriorLlegada = new Date(anterior.dFechaLlegada);
                const dif = diferenciaMinutos(fechaSalida, anteriorLlegada);
                const color = colorPorMinutos(dif, limites.minA4, limites.maxA4);
                if (color !== "verde") a4 = color; 
            }
        }

        // A5 Vuelta Completa
		function calcularA5(origenFiltro, destinoFiltro) {
			let similares = [];

			if (origenFiltro === 'LC LOGISTICS GPS' && destinoFiltro === 'TUMII') {
				similares = datos.filter(d =>
					(d.nIdManiobristaOrigen019 === 12 || d.nIdManiobristaOrigen019 === "12" || d.nIdManiobristaOrigen019 === 'LC LOGISTICS GPS') &&
					(d.nIdManiobristaDestino019 === 18 || d.nIdManiobristaDestino019 === "18" || d.nIdManiobristaDestino019 === 'TUMII') &&
					d.dFechaSalida &&
					d.sPlacas === placas &&
					d.nEstado !== "Cancelado"
				).sort((a, b) => new Date(a.dFechaSalida) - new Date(b.dFechaSalida)); 

				const idx = similares.findIndex(d => d === dato);

				if (idx > 0) {
					const actual = new Date(similares[idx].dFechaSalida);
					const anterior = new Date(similares[idx - 1].dFechaSalida);
					const dif = diferenciaMinutos(actual, anterior);
					return colorPorMinutos(dif, limites.minA5, limites.maxA5);
				}

			} else if (origenFiltro === 'TUMII' && destinoFiltro === 'LC LOGISTICS GPS') {
				similares = datos.filter(d =>
					(d.nIdManiobristaOrigen019 === 18 || d.nIdManiobristaOrigen019 === "18" || d.nIdManiobristaOrigen019 === 'TUMII') &&
					(d.nIdManiobristaDestino019 === 12 || d.nIdManiobristaDestino019 === "12" || d.nIdManiobristaDestino019 === 'LC LOGISTICS GPS') &&
					d.dFechaSalida &&
					d.sPlacas === placas &&
					d.nEstado !== "Cancelado"
				).sort((a, b) => new Date(a.dFechaSalida) - new Date(b.dFechaSalida)); 
				const idx = similares.findIndex(d => d === dato);

				if (idx > 0) {
					const actual = new Date(similares[idx].dFechaSalida);
					const anterior = new Date(similares[idx - 1].dFechaSalida);
					const dif = diferenciaMinutos(actual, anterior);
					return colorPorMinutos(dif, limites.minA5, limites.maxA5);
				}
			}

			return "verde"; 
		}

        if (origen === 'LC LOGISTICS GPS' && destino === 'TUMII') {
            a5 = calcularA5('LC LOGISTICS GPS', 'TUMII');
        }

        if (origen === 'TUMII' && destino === 'LC LOGISTICS GPS') {
            a5 = calcularA5('TUMII', 'LC LOGISTICS GPS');
        }
    }

    console.log(`Registro ${index}: Origen=${origen}, Destino=${destino}, Fecha Salida=${fechaSalida}, Fecha Llegada=${fechaLlegada}, Placas=${placas}, Estado=${estado}`);
    console.log(`Registro ${index}: a1=${a1}, a2=${a2}, a3=${a3}, a4=${a4}, a5=${a5}`);

    return { a1, a2, a3, a4, a5 };
}

function verificarCheckboxSeleccionado(){
	const checkboxes = document.querySelectorAll('.correo-checkbox');
	console.log("Checkboxes seleccionados:", checkboxes);
	const emailField = document.getElementById('email');
	let algunoSeleccionado = Array.from(checkboxes).some(chk => chk.checked);
	emailField.disabled =! algunoSeleccionado;
}

function getTooltip(color, tipoAlarma) {
    if (color === "rojo") {
        return `⚠️ Alarma ${tipoAlarma}: Exceso de tiempo fuera del rango permitido.`;
    } else if (color === "negro") {
        return `⛔ Alarma ${tipoAlarma}: Exceso grave de tiempo fuera de lo perimitido.`;
    } else {
        return "";
    }
}

function mostrarDatos(datos) {
    const tablaResultados = document.getElementById("tablaResultados");
    const calcularAlarmasActivado = document.getElementById("calcular").checked;
    tablaResultados.innerHTML = "";

    datos.forEach((dato, index) => {
		const origen = dato.nIdManiobristaOrigen019;
        const destino = dato.nIdManiobristaDestino019;
        const placas = dato.sPlacas;

        // Inicialización segura de objetos
        if((origen === "TUMII" && destino === "LC LOGISTICS GPS") || (origen === "LC LOGISTICS GPS" && destino === "TUMII")){ 
        if (!(placas in contadorViajesPorPlaca)) contadorViajesPorPlaca[placas] = 0;
        if (!(placas in alarmasActivasPorPlaca)) alarmasActivasPorPlaca[placas] = {a1:"verde", a2:"verde", a3:"verde", a4:"verde", a5:"verde"}; 
		}
        // Incrementar contador antes de la validación
        contadorViajesPorPlaca[placas]++;

        // Reset si ya hubo 4 viajes
        if (contadorViajesPorPlaca[placas] >= 5) {
            contadorViajesPorPlaca[placas] = 0;
            alarmasActivasPorPlaca[placas] = {a1:"verde", a2:"verde", a3:"verde", a4:"verde", a5:"verde"};
        }

        let alarmasViaje = { a1: "", a2: "", a3: "", a4: "", a5: "" };

        if (calcularAlarmasActivado) {
            const nuevasAlarmas = calcularAlarmas(dato, index, datos);
            alarmasViaje = nuevasAlarmas;

            // Acumular alarmas activas por placa
            for (const alarma in nuevasAlarmas) {
                const color = nuevasAlarmas[alarma];
                if (color !== "verde" && color !== "") {
                    alarmasActivasPorPlaca[placas][alarma] = color;
                }
            }
        }
		
        let jsdata = { a1: "", a2: "", a3: "", a4: "", a5: "" };

		if (
		  (origen === "TUMII" && destino === "LC LOGISTICS GPS") ||
		  (origen === "LC LOGISTICS GPS" && destino === "TUMII")
		) {
		  jsdata = calcularAlarmasActivado
			? { ...alarmasViaje, ...(alarmasActivasPorPlaca[placas] || {}) }
			: { a1: "verde", a2: "verde", a3: "verde", a4: "verde", a5: "verde" };
		}


        const esValido =
            (origen === "TUMII" && destino === "LC LOGISTICS GPS") ||
            (origen === "LC LOGISTICS GPS" && destino === "TUMII");

        const checkboxHTML = esValido
            ? `<input type="checkbox" class="correo-checkbox" data-folio="${dato.nFolio}">`
            : "";

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${dato.nFolio}</td>
            <td>${dato.nEstado}</td>
            <td>${dato.dFechaSalida}</td>
            <td>${dato.dFechaLlegada}</td>
            <td>${dato.bFleteCliente}</td>
            <td>${dato.nTipoEntrada}</td>
            <td>${dato.sRazonSocial}</td>
            <td>${dato.sPlacas}</td>
            <td>${dato.sNumEconomico}</td>
            <td>${dato.sViajes}</td>
            <td>${dato.sPlacasPlana1}</td>
            <td>${dato.sPlacasPlana2}</td>
            <td>${dato.nTipoOperacion}</td>
            <td>${dato.nIdManiobristaOrigen019}</td>
            <td>${dato.nIdManiobristaDestino019}</td>
			<td><span class="${jsdata.a1}" title="${getTooltip(jsdata.a1, 'A1')}">${jsdata.a1 ? " " : ""}</span></td>
			<td><span class="${jsdata.a2}" title="${getTooltip(jsdata.a2, 'A2')}">${jsdata.a2 ? " " : ""}</span></td>
			<td><span class="${jsdata.a3}" title="${getTooltip(jsdata.a3, 'A3')}">${jsdata.a3 ? " " : ""}</span></td>
			<td><span class="${jsdata.a4}" title="${getTooltip(jsdata.a4, 'A4')}">${jsdata.a4 ? " " : ""}</span></td>
			<td><span class="${jsdata.a5}" title="${getTooltip(jsdata.a5, 'A5')}">${jsdata.a5 ? " " : ""}</span></td>

            <td>${checkboxHTML}</td>
        `;

        tablaResultados.appendChild(fila);
    });
}

// Validación del envío 
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('.correo-checkbox:checked');
    const seleccionados = Array.from(checkboxes);

    if (seleccionados.length === 0) {
        alert("Por favor selecciona al menos un viaje para enviar el correo ✔️");
        return;
    }
	
	const foliosSeleccionados = seleccionados.map(chk => chk.dataset.folio).join(", ");
    const email = document.getElementById('email').value;

    if (!email || !email.includes("@")) {
        alert("Por favor, ingresa un correo válido.");
        return;
    }

    emailjs.sendForm('service_j1r0hap', 'template_7ag54om', this)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('Correo enviado exitosamente 📨!');
        }, function(error) {
            console.log('FAILED...', error);
            alert('Error al enviar el correo ❌');
        });
});



// Cargar datos al iniciar la página
window.onload = obtenerDatos;

function validarContrasena() {
    var contrasena = document.getElementById("contrasena").value;
    var contrasenaCorrecta = "1";  // Contraseña

    if (contrasena === contrasenaCorrecta) {
        // Ocultar el cuadro de contraseña
        document.getElementById("i-contrasena").style.display = "none";

        // Mostrar la barra superior y el contenido de configuración
        document.getElementById("barra-superior-configuracion").style.display = "block";
        document.getElementById("contenido-configuracion").style.display = "block";
    } else {
        alert("Contraseña incorrecta. Intenta de nuevo.");
    }
}

function guardarConfiguracion(){
	const inputs = document.querySelectorAll('#tablaAlarmas input');
	inputs.forEach(input => {
		localStorage.setItem(input.id, input.value);
		input.disabled = true;
	});
	alert("Configuración guardada.");
}

function editarConfiguracion(){
	const inputs = document.querySelectorAll('#tablaAlarmas input');
	inputs.forEach(input => input.disabled = false);
}

document.addEventListener('DOMContentLoaded', () => {
	const inputs = document.querySelectorAll('#tablaAlarmas input');
	inputs.forEach(input => {
		const savedValue = localStorage.getItem(input.id);
		if(savedValue !== null){
			input.value = savedValue;
			input.disabled = true;
		}else{
			input.vale="";
		}
	});
});