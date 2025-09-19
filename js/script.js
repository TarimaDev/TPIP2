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