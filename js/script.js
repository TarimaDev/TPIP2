// Script principal del proyecto

// Variable para manejar el carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Cuando la página se carga completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada correctamente');
    
    // Verificar en qué página estamos para inicializar las funciones correspondientes
    if (window.location.pathname.includes('planes.html')) {
        initPlanes();
    } else if (window.location.pathname.includes('carrito.html')) {
        initCarrito();
    }
    
    // Actualizar el contador del carrito en la barra de navegación
    actualizarContadorCarrito();
});

// Funciones para manejar los planes

function initPlanes() {
    const botonesSeleccionar = document.querySelectorAll('.planes-card .boton, .planes-card-popular .boton');
    
    botonesSeleccionar.forEach((boton) => {
        boton.addEventListener('click', function() {
            const plan = obtenerDatosPlanDesdeHTML(boton);
            agregarAlCarrito(plan);
            mostrarMensaje('Plan agregado al carrito', 'success');
        });
    });
}

function obtenerDatosPlanDesdeHTML(boton) {
    const tarjeta = boton.closest('.card');
    
    // Sacar el nombre del plan del título
    const nombreElemento = tarjeta.querySelector('.card-header h4');
    const nombre = nombreElemento ? nombreElemento.textContent.trim() : 'Plan Desconocido';
    
    // Sacar el precio del texto
    const precioElemento = tarjeta.querySelector('.card-body h2');
    const precioTexto = precioElemento ? precioElemento.textContent : '$0';
    const precio = parseInt(precioTexto.replace('$', '').replace('/mes', '')) || 0;
    
    // Juntar todas las características en una descripción
    const listaElementos = tarjeta.querySelectorAll('.card-body li');
    const descripcion = Array.from(listaElementos).map(li => li.textContent.trim()).join(', ');
    
    // Asignar un ID según el tipo de plan
    let id = 1;
    if (nombre.includes('Profesional')) id = 2;
    else if (nombre.includes('Empresarial')) id = 3;
    
    return {
        id: id,
        nombre: nombre,
        precio: precio,
        descripcion: descripcion
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
    const costoPorServicio = 25; // Costo fijo por cada servicio
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
            contador.innerHTML = `🛒 (${carrito.length})`;
        } else {
            contador.innerHTML = '🛒';
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

// Función principal de inicialización
function init() {
    console.log('Proyecto inicializado');
}