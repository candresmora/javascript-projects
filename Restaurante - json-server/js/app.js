let cliente = {
    mesa: '',
    hora: '',
    pedido: [],
}

const categorias = {
    1 : 'Comida',
    2 : 'Bebida',
    3 : 'Postre'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
const modalBody = document.querySelector('.modal-body');

btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {

    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    if(mesa === '' || hora === '') {
        imprimirAlerta('Debe ingresar una mesa y una hora');
        return;
    }

    cliente.mesa = mesa;
    cliente.hora = hora;

    cliente = {...cliente, mesa, hora};
    
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    mostrarSecciones();

    obtenerPlatillos();

    
}

function imprimirAlerta(mensaje) {

    const existeAlerta = document.querySelector('.invalid-feedback');

    if(!existeAlerta) {
        const divAlerta = document.createElement('div');
        divAlerta.classList.add('invalid-feedback', 'd-block', 'text-center');
        divAlerta.textContent = mensaje;

        modalBody.appendChild(divAlerta);

        setTimeout(() => {
            divAlerta.remove();
        }, 2500);
    }
}

function mostrarSecciones() {
    const secciones = document.querySelectorAll('.d-none');
    secciones.forEach( seccion => seccion.classList.remove('d-none'))
}

function obtenerPlatillos() {
    const url = `http://localhost:3000/platillos`;

    fetch(url)
        .then(response => response.json())
        .then(resultado => mostrarPlatillos(resultado));
}

function mostrarPlatillos(platillos) {
    const divContenido = document.querySelector('.contenido');

    platillos.forEach(platillo => {
        const {id, nombre, precio, categoria} = platillo;

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const divNombre = document.createElement('DIV');
        divNombre.classList.add('col-md-4');
        divNombre.textContent = nombre;

        const divPrecio = document.createElement('DIV');
        divPrecio.classList.add('col-md-3', 'fw-bold');
        divPrecio.textContent = `$${precio}`;

        const divCategoria = document.createElement('DIV');
        divCategoria.classList.add('col-md-3');
        divCategoria.textContent = categorias[categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${id}`;
        inputCantidad.value = 0;
        inputCantidad.classList.add('form-control');

        // function 

        inputCantidad.onchange = function() {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        };

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(divNombre);
        row.appendChild(divPrecio);
        row.appendChild(divCategoria);
        row.appendChild(agregar);

        divContenido.appendChild(row);
    });
}

function agregarPlatillo(producto) {

    let { pedido } = cliente;

    if(producto.cantidad > 0) {

        if(pedido.some( platillo => platillo.id === producto.id)) {
            const pedidoActualizado = pedido.map( articulo => {
                if(articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            })
            cliente.pedido = [...pedidoActualizado];
        } else {
            cliente.pedido = [...pedido, producto];
        }

    } else {
        console.log('no es mayor a cero');
        const resultado = pedido.filter( platillo => platillo.id !== producto.id);

        cliente.pedido = [...resultado];
    }

    // console.log(cliente.pedido);

    limpiarHTML();

    if(cliente.pedido.length) {
        obtenerResumen();
    } else {
        mensajePedidoVacio();
    }

}

function obtenerResumen() {

    const contenidoDiv = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    mesa.appendChild(mesaSpan);
    
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    hora.appendChild(horaSpan);

    const heading = document.createElement('H3');
    heading.textContent = 'Platos Consumidos';
    heading.classList.add('my-2', 'text-center');

    // iterar sobre el arreglo del pedido

    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    
    // if(pedido.length === 0) {
    //     platillosEliminados();
    // } else {

        limpiarHTML();

        pedido.forEach( platillo => {

        const { id, cantidad, nombre, precio } = platillo;
        
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreElem = document.createElement('H4');
        nombreElem.classList.add('my-4');
        nombreElem.textContent = nombre;

        const cantidadElem = document.createElement('P');
        cantidadElem.classList.add('fw-bold');
        cantidadElem.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        const precioElem = document.createElement('P');
        precioElem.classList.add('fw-bold');
        precioElem.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `${precio}`;
        
        const subtotalElem = document.createElement('P');
        subtotalElem.classList.add('fw-bold');
        subtotalElem.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        btnEliminar.onclick = function() {
            eliminarDelPedido(id);
        };

        // Insertar valores en sus containers

        cantidadElem.appendChild(cantidadValor);
        precioElem.appendChild(precioValor);
        subtotalElem.appendChild(subtotalValor);
        
        // Insertar elementos en el LI

        lista.appendChild(nombreElem);
        lista.appendChild(precioElem);
        lista.appendChild(cantidadElem);
        lista.appendChild(subtotalElem);
        lista.appendChild(btnEliminar);

        // Insertar LI en la UL - Grupo 

        grupo.appendChild(lista);
    })

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenidoDiv.appendChild(resumen);

    // Formulario propinas

    formularioPropinas();
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
    return `$${precio * cantidad}`;
}

function eliminarDelPedido(id) {

    const {pedido} = cliente;
    const resultado = pedido.filter( pedido => pedido.id !== id );

    cliente.pedido = [...resultado];

    limpiarHTML();


    if(cliente.pedido.length) {
        obtenerResumen();
    } else {
        mensajePedidoVacio();
    }

    const inputCantidad = document.querySelector(`#producto-${id}`);
    inputCantidad.value = 0;
}

function platillosEliminados() {

    const parrafo = document.querySelector('#resumen .contenido p');

    if(!parrafo) {
        const contenido = document.createElement('DIV');
        contenido.classList.add('contenido');
        
        const p = document.createElement('P');
        p.classList.add('text-center');
        
        p.textContent = 'No hay productos en el pedido';
        
        contenido.appendChild(p);
        
        const resumen = document.querySelector('#resumen');
        
        resumen.appendChild(contenido);
        return;
    } else {

        parrafo.remove();
    }
    
    
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'No hay productos en el pedido';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');
    
    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow', 'text-center');

    const heading = document.createElement('H3');
    heading.classList.add('my-4');
    heading.textContent = 'Propina';

    // Creacion de los radios buttons

    // radio 10

    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // radio 25 

    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // radio 50 

    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    // Agregando al div principal

    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    formulario.appendChild(divFormulario);

    // Agregando al form

    contenido.appendChild(formulario);
}

function calcularPropina() {
    
    const {pedido} = cliente;
    let subtotal = 0;

    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    })

    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    // Calcular la propina

    const propina = ((subtotal * parseInt(propinaSeleccionada))/100);

    // Total a pagar

    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);

}

function mostrarTotalHTML(subtotal, total, propina) {

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'my-4');

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    // Total 
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    const contenidoDiv = document.querySelector('.total-pagar');

    if(contenidoDiv) {
        contenidoDiv.remove();
    }


    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);
}


