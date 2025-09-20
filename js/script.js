// Script principal del proyecto

// Variable para manejar el carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Variable para almacenar los datos de los planes
let datosPlanes = null;

// Cuando la página se carga completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada correctamente');
    
    // Configurar tema
    IniciarTema();
    
    // Cargar datos de los planes desde el archivo JSON
    CargarDatosPlanes().then(() => {
        // Verificar en qué página estamos para inicializar las funciones correspondientes
        if (window.location.pathname.includes('planes.html')) {
            IniciarPlanes();
        } else if (window.location.pathname.includes('carrito.html')) {
            IniciarCarrito();
        } else if (window.location.pathname.includes('contacto.html')) {
            IniciarFormularioContacto();
        }
        
        // Actualizar el contador del carrito en la barra de navegación
        ActualizarContadorCarrito();
    });
});

// Función para cargar datos desde el archivo JSON
async function CargarDatosPlanes() {
    try {
    // Ajustar ruta según ubicación
    const estaEnCarpetaPages = window.location.pathname.includes('/pages/');
    const rutaDatos = estaEnCarpetaPages ? '../mock/data.json' : 'mock/data.json';
        
        const respuesta = await fetch(rutaDatos);
        const datos = await respuesta.json();
        datosPlanes = datos;
        console.log('Datos de planes cargados:', datosPlanes);
    } catch (error) {
        console.error('Error al cargar los datos de planes:', error);
        // Fallback a datos hardcodeados si falla la carga
        datosPlanes = {
            planes: [
                {
                    id: 1,
                    nombre: "Plan Básico",
                    precio: 99,
                    descripcion: "Servicio básico, Soporte por email, Actualizaciones mensuales"
                },
                {
                    id: 2,
                    nombre: "Plan Profesional",
                    precio: 199,
                    descripcion: "Todo del plan básico, Soporte prioritario, Funciones avanzadas"
                },
                {
                    id: 3,
                    nombre: "Plan Empresarial",
                    precio: 399,
                    descripcion: "Todo del plan profesional, Soporte 24/7, Funciones personalizadas"
                }
            ],
            configuracion: {
                costoServicio: 25
            }
        };
    }
}

// Funciones para manejar los planes

function IniciarPlanes() {
    const botonesSeleccionar = document.querySelectorAll('.planes-card .boton, .planes-card-popular .boton');
    
    botonesSeleccionar.forEach((boton, indice) => {
        boton.addEventListener('click', function() {
            const plan = ObtenerDatosPlanDesdeJSON(indice);
            AgregarAlCarrito(plan);
            MostrarMensaje('Plan agregado al carrito', 'success');
        });
    });
}

function ObtenerDatosPlanDesdeJSON(indice) {
    if (!datosPlanes || !datosPlanes.planes) {
        console.error('Datos de planes no disponibles');
        return null;
    }
    
    const plan = datosPlanes.planes[indice];
    if (!plan) {
        console.error('Plan no encontrado en el índice:', indice);
        return null;
    }
    
    return {
        id: plan.id,
        nombre: plan.nombre,
        precio: plan.precio,
        descripcion: plan.descripcion
    };
}

// Funciones para el carrito

function IniciarCarrito() {
    MostrarCarrito();
    ConfigurarEventosCarrito();
}

function MostrarCarrito() {
    const contenedorCarrito = document.querySelector('.col-md-8 .card .card-body');
    const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
    
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="carrito-vacio">
                <h5>Tu carrito está vacío</h5>
                <p>No hay elementos en tu carrito de compras.</p>
                <a href="planes.html" class="boton">
                    Ver Planes
                </a>
            </div>
        `;
        if (btnVaciarCarrito) {
            btnVaciarCarrito.style.display = 'none';
        }
    } else {
        let html = '<h5 style="color: var(--color-letras); margin-bottom: 1.5rem;">Productos en tu carrito</h5>';
        
        carrito.forEach((item, indice) => {
            html += `
                <div class="card carrito-item mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h6 class="mb-1" style="color: var(--color-letras);">${item.nombre}</h6>
                                <small style="color: var(--color-letras); opacity: 0.8;">${item.descripcion}</small>
                            </div>
                            <div class="col-md-3">
                                <span class="fw-bold" style="color: var(--color-botones);">$${item.precio}/mes</span>
                            </div>
                            <div class="col-md-3 text-end">
                                <button class="btn btn-sm btn-outline-danger" onclick="EliminarDelCarrito(${indice})">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        contenedorCarrito.innerHTML = html;
        if (btnVaciarCarrito) {
            btnVaciarCarrito.style.display = 'block';
        }
    }
    
    ActualizarResumenCompra();
}

function ConfigurarEventosCarrito() {
    const botonFinalizar = document.querySelector('.col-md-4 .boton');
    
    if (carrito.length > 0) {
        botonFinalizar.disabled = false;
        botonFinalizar.addEventListener('click', FinalizarCompra);
    }
}

function ActualizarResumenCompra() {
    // Calcular el subtotal sumando todos los precios
    const subtotal = carrito.reduce((total, item) => total + item.precio, 0);
    
    // Obtener el costo de servicio desde la configuración
    const costoPorServicio = datosPlanes?.configuracion?.costoServicio || 25;
    const costoEnvio = carrito.length * costoPorServicio;
    const total = subtotal + costoEnvio;
    
    const resumenCard = document.querySelector('.carrito-resumen .card-body');
    if (!resumenCard) return;
    
    // Actualizar los valores en la interfaz
    const subtotalElement = resumenCard.querySelector('.d-flex:first-child span:last-child');
    const costoServicioElement = resumenCard.querySelector('.d-flex:nth-child(2) span:last-child');
    const totalElement = resumenCard.querySelector('.d-flex.fw-bold span:last-child');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal}`;
    if (costoServicioElement) costoServicioElement.textContent = `$${costoEnvio}`;
    if (totalElement) totalElement.textContent = `$${total}`;
}

// Funciones para manejar el carrito

function AgregarAlCarrito(plan) {
    // Verificar si el plan ya está en el carrito
    const planExistente = carrito.find(item => item.id === plan.id);
    
    if (planExistente) {
        MostrarMensaje('Este plan ya está en tu carrito', 'warning');
        return;
    }
    
    carrito.push(plan);
    GuardarCarrito();
    ActualizarContadorCarrito();
    
    // Si estamos en la página del carrito, actualizar el resumen
    if (window.location.pathname.includes('carrito.html')) {
        ActualizarResumenCompra();
    }
}

function EliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    GuardarCarrito();
    MostrarCarrito();
    ActualizarContadorCarrito();
    ActualizarResumenCompra();
}

function VaciarCarrito() {
    if (carrito.length === 0) {
        MostrarMensaje('El carrito ya está vacío', 'warning');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        GuardarCarrito();
        MostrarCarrito();
        ActualizarContadorCarrito();
        ActualizarResumenCompra();
        MostrarMensaje('Carrito vaciado correctamente', 'success');
    }
}

function FinalizarCompra() {
    if (carrito.length === 0) {
        MostrarMensaje('Tu carrito está vacío', 'warning');
        return;
    }
    
    MostrarMensaje('¡Compra realizada con éxito!', 'success');
    
    // Limpiar el carrito directamente sin confirmación para simular la compra
    setTimeout(() => {
        carrito = [];
        GuardarCarrito();
        MostrarCarrito();
        ActualizarContadorCarrito();
        ActualizarResumenCompra();
    }, 2000);
}

// Funciones auxiliares

function GuardarCarrito() {
    // Guardar el carrito en el localStorage para que persista
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function ActualizarContadorCarrito() {
    // Actualizar el ícono del carrito en la navbar con la cantidad
    const contador = document.querySelector('.navbar .nav-link[href*="carrito"]');
    if (contador) {
        if (carrito.length > 0) {
            contador.innerHTML = `🛒 Carrito (${carrito.length})`;
        } else {
            contador.innerHTML = '🛒 Carrito';
        }
    }
}

function MostrarMensaje(mensaje, tipo) {
    // Crear y mostrar un mensaje de notificación
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `alert alert-${tipo === 'success' ? 'success' : tipo === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show position-fixed`;
    mensajeDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    mensajeDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(mensajeDiv);
    
    // Quitar el mensaje después de 3 segundos
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.parentNode.removeChild(mensajeDiv);
        }
    }, 3000);
}

// Sistema de temas

// Función para inicializar el sistema de temas
function IniciarTema() {
    // Obtener el tema guardado en localStorage o usar 'dark' por defecto
    const temaGuardado = localStorage.getItem('theme') || 'dark';
    
    // Aplicar el tema guardado
    AplicarTema(temaGuardado);
    
    // Configurar el evento del botón toggle
    const botonToggle = document.getElementById('themeToggle');
    if (botonToggle) {
        botonToggle.addEventListener('click', CambiarTema);
    }
}

// Función para cambiar entre temas
function CambiarTema() {
    const temaActual = document.documentElement.getAttribute('data-theme');
    let temaNuevo;

    if (temaActual === 'light') {
        temaNuevo = 'dark';
    } else {
        temaNuevo = 'light';
    }
    
    AplicarTema(temaNuevo);
    
    // Guardar la preferencia en localStorage
    localStorage.setItem('theme', temaNuevo);
}


// Función para aplicar un tema específico
function AplicarTema(tema) {
    // Aplicar el atributo data-theme al documento
    document.documentElement.setAttribute('data-theme', tema);
    
    // Actualizar el ícono del botón toggle
    const botonToggle = document.getElementById('themeToggle');
    if (botonToggle) {
        const iconoLuna = botonToggle.querySelector('.icon-moon');
        const iconoSol = botonToggle.querySelector('.icon-sun');
        
        if (tema === 'light') {
            iconoLuna.style.display = 'none';
            iconoSol.style.display = 'inline';
        } else {
            iconoLuna.style.display = 'inline';
            iconoSol.style.display = 'none';
        }
    }
    
    // Actualizar el título de la página para indicar el modo actual
    ActualizarTituloPagina(tema);
}

// Función para actualizar el título de la página
function ActualizarTituloPagina(tema) {
    const tituloActual = document.title;
    const tituloBase = tituloActual.replace(' 🌙', '').replace(' ☀️', '');
    
    if (tema === 'light') {
        document.title = tituloBase + ' ☀️';
    } else {
        document.title = tituloBase + ' 🌙';
    }
}

// Función para obtener el tema actual
function ObtTemaActual() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

// Función para verificar si el tema es oscuro
function TemaOscuro() {
    return ObtTemaActual() === 'dark';
}

// Función para verificar si el tema es claro
function TemaClaro() {
    return ObtTemaActual() === 'light';
}

// Función principal de inicialización
function init() {
    console.log('Proyecto inicializado');
}

// Formulario de contacto - versión simple
function IniciarFormularioContacto() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Obtener los campos del formulario
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const telefono = document.getElementById('telefono');
    const fecha = document.getElementById('fecha');
    const motivo = document.getElementById('motivo');
    const acepto = document.getElementById('acepto');
    const mensaje = document.getElementById('mensaje');
    
    // Función para mostrar si un campo está bien o mal
    function mostrarEstado(campo, estaBien) {
        const icono = document.getElementById(campo + '-icon');
        if (icono) {
            if (estaBien) {
                icono.textContent = '✅';
                icono.style.color = 'green';
            } else {
                icono.textContent = '❌';
                icono.style.color = 'red';
            }
        }
    }
    
    // Función para validar el nombre
    function validarNombre() {
        const valor = nombre.value.trim();
        if (valor.length < 2) {
            mostrarEstado('nombre', false);
            return false;
        }
        mostrarEstado('nombre', true);
        return true;
    }
    
    // Función para validar el email
    function validarEmail() {
        const valor = email.value.trim();
        if (valor.includes('@') && valor.includes('.')) {
            mostrarEstado('email', true);
            return true;
        }
        mostrarEstado('email', false);
        return false;
    }
    
    // Función para validar el teléfono
    function validarTelefono() {
        const valor = telefono.value.trim();
        if (valor.length === 10 && !isNaN(valor)) {
            mostrarEstado('telefono', true);
            return true;
        }
        mostrarEstado('telefono', false);
        return false;
    }
    
    // Función para validar la fecha
    function validarFecha() {
        const valor = fecha.value;
        if (valor === '') {
            mostrarEstado('fecha', false);
            return false;
        }
        const hoy = new Date();
        const fechaSeleccionada = new Date(valor);
        if (fechaSeleccionada > hoy) {
            mostrarEstado('fecha', false);
            return false;
        }
        mostrarEstado('fecha', true);
        return true;
    }
    
    // Función para validar el motivo
    function validarMotivo() {
        if (motivo.value === '') {
            mostrarEstado('motivo', false);
            return false;
        }
        mostrarEstado('motivo', true);
        return true;
    }
    
    // Función para validar la preferencia
    function validarPreferencia() {
        const radios = document.querySelectorAll('input[name="preferencia"]');
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                mostrarEstado('preferencia', true);
                return true;
            }
        }
        mostrarEstado('preferencia', false);
        return false;
    }
    
    // Función para validar el checkbox
    function validarAcepto() {
        if (acepto.checked) {
            mostrarEstado('acepto', true);
            return true;
        }
        mostrarEstado('acepto', false);
        return false;
    }
    
    // Función para validar todo el formulario
    function validarFormulario() {
        if (!validarNombre()) {
            alert('El nombre debe tener al menos 2 caracteres');
            return false;
        }
        if (!validarEmail()) {
            alert('Ingresa un email válido');
            return false;
        }
        if (!validarTelefono()) {
            alert('El teléfono debe tener 10 dígitos');
            return false;
        }
        if (!validarFecha()) {
            alert('Selecciona una fecha válida');
            return false;
        }
        if (!validarMotivo()) {
            alert('Selecciona un motivo');
            return false;
        }
        if (!validarPreferencia()) {
            alert('Selecciona una preferencia de contacto');
            return false;
        }
        if (!validarAcepto()) {
            alert('Debes aceptar recibir información');
            return false;
        }
        return true;
    }
    
    // Función para enviar el formulario
    function enviarFormulario() {
        if (!validarFormulario()) {
            return;
        }
        
        // Recopilar los datos
        const datos = {
            nombre: nombre.value,
            email: email.value,
            telefono: telefono.value,
            fecha: fecha.value,
            motivo: motivo.value,
            preferencia: document.querySelector('input[name="preferencia"]:checked').value,
            aceptaInfo: acepto.checked,
            mensaje: mensaje.value
        };
        
        // Simular envío con Fetch API
        fetch('mock/data.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(function(response) {
            // Simular que el servidor responde bien
            return { ok: true };
        })
        .catch(function(error) {
            // Simular error de red
            return { ok: false, error: error };
        })
        .then(function(result) {
            if (result.ok) {
                // Guardar en localStorage como respaldo
                let contactos = [];
                if (localStorage.getItem('contactos')) {
                    contactos = JSON.parse(localStorage.getItem('contactos'));
                }
                
                // ID incremental simple
                let nuevoId = 1;
                if (contactos.length > 0) {
                    nuevoId = contactos.length + 1;
                }
                
                const nuevoContacto = {
                    id: nuevoId,
                    ...datos,
                    fechaEnvio: new Date().toISOString()
                };
                
                contactos.push(nuevoContacto);
                localStorage.setItem('contactos', JSON.stringify(contactos));
                
                // Mostrar mensaje de éxito
                alert('¡Mensaje enviado! Te contactaremos pronto.');
                
                // Limpiar el formulario
                form.reset();
            } else {
                alert('Error al enviar el mensaje. Intenta de nuevo.');
            }
        });
    }
    
    // Agregar eventos para validar mientras el usuario escribe
    nombre.addEventListener('input', validarNombre);
    email.addEventListener('input', validarEmail);
    telefono.addEventListener('input', validarTelefono);
    fecha.addEventListener('change', validarFecha);
    motivo.addEventListener('change', validarMotivo);
    acepto.addEventListener('change', validarAcepto);
    
    // Validar preferencia cuando cambie
    const radios = document.querySelectorAll('input[name="preferencia"]');
    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', validarPreferencia);
    }
    
    // Agregar el evento de envío
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        enviarFormulario();
    });
}