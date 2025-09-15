// Script principal del proyecto

// Variable para manejar el carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Variable para almacenar los datos de los planes
let datosPlanes = null;

// Cuando la página se carga completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada correctamente');
    
    // Configurar tema
    initTheme();
    
    // Cargar datos de los planes desde el archivo JSON
    cargarDatosPlanes().then(() => {
        // Verificar en qué página estamos para inicializar las funciones correspondientes
        if (window.location.pathname.includes('planes.html')) {
            initPlanes();
        } else if (window.location.pathname.includes('carrito.html')) {
            initCarrito();
        }
        
        // Actualizar el contador del carrito en la barra de navegación
        actualizarContadorCarrito();
    });
});

// Función para cargar datos desde el archivo JSON
async function cargarDatosPlanes() {
    try {
    // Ajustar ruta según ubicación
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const dataPath = isInPagesFolder ? '../mock/data.json' : 'mock/data.json';
        
        const response = await fetch(dataPath);
        const data = await response.json();
        datosPlanes = data;
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

function initPlanes() {
    const botonesSeleccionar = document.querySelectorAll('.planes-card .boton, .planes-card-popular .boton');
    
    botonesSeleccionar.forEach((boton, index) => {
        boton.addEventListener('click', function() {
            const plan = obtenerDatosPlanDesdeJSON(index);
            agregarAlCarrito(plan);
            mostrarMensaje('Plan agregado al carrito', 'success');
        });
    });
}

function obtenerDatosPlanDesdeJSON(index) {
    if (!datosPlanes || !datosPlanes.planes) {
        console.error('Datos de planes no disponibles');
        return null;
    }
    
    const plan = datosPlanes.planes[index];
    if (!plan) {
        console.error('Plan no encontrado en el índice:', index);
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

function initCarrito() {
    mostrarCarrito();
    configurarEventosCarrito();
}

function mostrarCarrito() {
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
        
        carrito.forEach((item, index) => {
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
                                <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${index})">
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
    
    actualizarResumenCompra();
}

function configurarEventosCarrito() {
    const botonFinalizar = document.querySelector('.col-md-4 .boton');
    
    if (carrito.length > 0) {
        botonFinalizar.disabled = false;
        botonFinalizar.addEventListener('click', finalizarCompra);
    }
}

function actualizarResumenCompra() {
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

function agregarAlCarrito(plan) {
    // Verificar si el plan ya está en el carrito
    const planExistente = carrito.find(item => item.id === plan.id);
    
    if (planExistente) {
        mostrarMensaje('Este plan ya está en tu carrito', 'warning');
        return;
    }
    
    carrito.push(plan);
    guardarCarrito();
    actualizarContadorCarrito();
    
    // Si estamos en la página del carrito, actualizar el resumen
    if (window.location.pathname.includes('carrito.html')) {
        actualizarResumenCompra();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    mostrarCarrito();
    actualizarContadorCarrito();
    actualizarResumenCompra();
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarMensaje('El carrito ya está vacío', 'warning');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        mostrarCarrito();
        actualizarContadorCarrito();
        actualizarResumenCompra();
        mostrarMensaje('Carrito vaciado correctamente', 'success');
    }
}

function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarMensaje('Tu carrito está vacío', 'warning');
        return;
    }
    
    mostrarMensaje('¡Compra realizada con éxito!', 'success');
    
    // Limpiar el carrito directamente sin confirmación para simular la compra
    setTimeout(() => {
        carrito = [];
        guardarCarrito();
        mostrarCarrito();
        actualizarContadorCarrito();
        actualizarResumenCompra();
    }, 2000);
}

// Funciones auxiliares

function guardarCarrito() {
    // Guardar el carrito en el localStorage para que persista
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
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

function mostrarMensaje(mensaje, tipo) {
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
function initTheme() {
    // Obtener el tema guardado en localStorage o usar 'dark' por defecto
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Aplicar el tema guardado
    applyTheme(savedTheme);
    
    // Configurar el evento del botón toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Función para cambiar entre temas
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme;

    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else {
        newTheme = 'light';
    }
    
    applyTheme(newTheme);
    
    // Guardar la preferencia en localStorage
    localStorage.setItem('theme', newTheme);
}


// Función para aplicar un tema específico
function applyTheme(theme) {
    // Aplicar el atributo data-theme al documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Actualizar el ícono del botón toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const iconMoon = themeToggle.querySelector('.icon-moon');
        const iconSun = themeToggle.querySelector('.icon-sun');
        
        if (theme === 'light') {
            iconMoon.style.display = 'none';
            iconSun.style.display = 'inline';
        } else {
            iconMoon.style.display = 'inline';
            iconSun.style.display = 'none';
        }
    }
    
    // Actualizar el título de la página para indicar el modo actual
    updatePageTitle(theme);
}

// Función para actualizar el título de la página
function updatePageTitle(theme) {
    const currentTitle = document.title;
    const baseTitle = currentTitle.replace(' 🌙', '').replace(' ☀️', '');
    
    if (theme === 'light') {
        document.title = baseTitle + ' ☀️';
    } else {
        document.title = baseTitle + ' 🌙';
    }
}

// Función para obtener el tema actual
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

// Función para verificar si el tema es oscuro
function isDarkTheme() {
    return getCurrentTheme() === 'dark';
}

// Función para verificar si el tema es claro
function isLightTheme() {
    return getCurrentTheme() === 'light';
}

// Función principal de inicialización
function init() {
    console.log('Proyecto inicializado');
}