
/* DATOS */
const contenedorData = document.querySelector('#contenedorData');
const botones = document.querySelectorAll('button');

/* PROVEEDORES */
const btnProveedores = document.querySelector('#proveedoresBtn');
btnProveedores.addEventListener('click', showProvedoores);
function showProvedoores(){
	if(btnProveedores.classList.contains('activo') || contenedorData.dataset.id == 'proveedores'){
		return;
	}
	contenedorData.innerHTML = '';
	contenedorData.dataset.id = '';
	
	
	//Traer datos de Proveedores
	async function cargarProd(){
		try {
			const response = await fetch('http://localhost:8888/Proveedor');
	
			// Verifica si la respuesta es exitosa
			if (!response.ok) {
				console.log('Error al cargar los datos:', response.status);
				return;
			}
	
			// Si la respuesta es exitosa, convierte los datos a JSON
			const products = await response.json();
			console.log(products);
	
			// Muestra los productos
			showProducts(products);
		} catch(error){
			console.log('Error en la solicitud:', error);
		}
	}
	function showProducts(data){
		// Convierte los datos a un array con los IDs incluidos
		const products = Object.entries(data) // Convertimos el objeto array clave valor
						.map(([id, producto]) => // Itera sobre cada par y desestructura los datos
						({ id, ...producto })); // Creamos objeto con el id y las propiedades de producto

		// Recorre el array para mostrar los productos
		products.forEach(prod => {
			// CREAR CONTENEDORES DE LOS DATOS
			const product = document.createElement('DIV');
			product.classList.add('card', 'info');
			product.setAttribute('data-id', `${prod.id}`);
			product.innerHTML= `

				<br>
				<br>
				<br>
				<p><span> Clave: </span>${prod.id}</p>
				<p><span> Producto: </span>${prod.producto}</p>
				<p><span> Cantidad: </span>${prod.cantidad}</p>
			`; 

			contenedorData.appendChild(product);

			

			
		});
	}

	cargarProd();
	
}

/* Inventario */
const inventarioBtn = document.querySelector('#inventarioBtn');
inventarioBtn.addEventListener('click', showInventario);
function showInventario(){
	if(inventarioBtn.classList.contains('activo') || contenedorData.dataset.id == 'inventario'){
		return;
	}
	contenedorData.innerHTML = '';
	contenedorData.dataset.id = '';
	
	const acciones = document.createElement('DIV');
	acciones.classList.add('card', 'agregar');
	acciones.setAttribute('id', 'btnAgregar')
	acciones.innerHTML =`
		<p> 
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="36" height="36" stroke-width="2.5"> <path d="M4 4h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 3h6m-3 -3v6"></path> </svg> 
		</p>
		<h2> Agregar producto </h2>
	`;

	contenedorData.dataset.id = 'inventario';
	contenedorData.appendChild(acciones);

	// TRAER DATOS DE PRODUCTOS
	async function cargarProd(){
		try {
			const response = await fetch('http://127.0.0.1:4000/Productos');
			if(!response){
				console.log('No se cargaron los datos');
				return;
			}
			const products = await response.json();
			console.log(products);
			showProducts(products);
		} catch(error){
			console.log(error);
		}
	}
	
	function showProducts(data){
		// Convierte los datos a un array con los IDs incluidos
		const products = Object.entries(data) // Convertimos el objeto array clave valor
						.map(([id, producto]) => // Itera sobre cada par y desestructura los datos
						({ id, ...producto })); // Creamos objeto con el id y las propiedades de producto

		// Recorre el array para mostrar los productos
		products.forEach(prod => {
			// CREAR CONTENEDORES DE LOS DATOS
			const product = document.createElement('DIV');
			product.classList.add('card', 'info');
			product.setAttribute('data-id', `${prod.id}`);
			product.innerHTML= `
				<div class="controles">
					<button id="edit">
						<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						>
						<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
						<path d="M13.5 6.5l4 4" />
						</svg>
					</button>

					<button id="delete">
						<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						>
						<path d="M4 7h16" />
						<path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
						<path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
						<path d="M10 12l4 4m0 -4l-4 4" />
						</svg>
					</button>
				</div>

				<p><span> Clave: </span>${prod.id}</p>
				<p><span> Nombre: </span>${prod.nombre}</p>
				<p><span> Categoria: </span>${prod.categoria}</p>
				<p><span> Precio: $</span>${prod.precio}</p>
				<p><span> Stock: </span>${prod.stock}</p>
			`; 

			contenedorData.appendChild(product);

			// ACCION EDIT
			product.querySelector('#edit').addEventListener('click', (e) =>{
				e.preventDefault();
				const productCard = e.target.closest('.card');
				const productId = productCard.getAttribute('data-id');
				handleEdit(productId);
				
			});

			// ACCION DELETE
			product.querySelector('#delete').addEventListener('click', (e) =>{
				e.preventDefault();
				const productCard = e.target.closest('.card');
				const productId = productCard.getAttribute('data-id');
				handleDelete(productId);
				
			})

			async function handleDelete(id) {
				try {
					const response = await fetch(`http://localhost:4000/producto=${id}`);
					if(!response.ok) {
						const error = await response.json();
						mostrarAlerta(`${error.error}`, 'error');
						return
					} else {
						const prod = await response.json();
						modalConfirmacion(id, prod.nombre);
					}
				} catch (error){
					console.log(error);
				}
			}

			async function handleEdit(id){
				try{
					const response = await fetch(`http://localhost:4000/producto=${id}`);
					if(!response.ok){
						const error = await response.json();
						mostrarAlerta(`${error.error}`, 'error');
						return
					} else {
						const prod = await response.json();
						showModal(prod);
						changeModal(id);
					}
				} catch(error) {
					console.log(error);
				}
			
			}
		});
	}

	cargarProd();

	// Modal del formulario 
	document.querySelector('#btnAgregar').addEventListener('click', () => {
		showModal();
	})

	function changeModal(id){
		const titulo = document.querySelector('.modal-1secc H2');
		const btnCrear  = document.querySelector('#btnEnviar');
		titulo.textContent = 'Editar producto';
		btnCrear.textContent = 'Actualizar';
		btnCrear.setAttribute('data-id', id);
	}

	function modalConfirmacion(id, nombre){
		// Crear el modal
		const modal = document.createElement('div');
		modal.id = 'modal-confirmacion';
		modal.classList.add('modal-confirmacion');
	
		// Crear contenido del modal
		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');
	
		const titulo = document.createElement('h2');
		titulo.textContent = 'Confirmar eliminación';
	
		const mensaje = document.createElement('p');
		mensaje.textContent = `¿Estás seguro que deseas eliminar al producto ${nombre}?`;
	
		const confirmarBtn = document.createElement('button');
		confirmarBtn.textContent = 'Confirmar';
		confirmarBtn.classList.add('confirmar-button')
		confirmarBtn.addEventListener('click', function() {
			deleteProd(id);
			document.body.removeChild(modal);  // Cerrar modal
		});
	
		const cancelarBtn = document.createElement('button');
		cancelarBtn.textContent = 'Cancelar';
		cancelarBtn.classList.add = 'cancelar-button'
		cancelarBtn.addEventListener('click', function() {
			document.body.removeChild(modal);  // Cerrar modal
	});
	
		// Agregar contenido al modal
		modalContent.appendChild(titulo);
		modalContent.appendChild(mensaje);
		modalContent.appendChild(confirmarBtn);
		modalContent.appendChild(cancelarBtn);
		modal.appendChild(modalContent);
	
		// Agregar el modal al body
		document.body.appendChild(modal);
	
		// Hacer visible el modal
		modal.style.display = 'flex';
	
	}


	async function deleteProd(id){
		try {
			const response = await fetch(`http://localhost:4000/producto=${id}`, {
				method: 'DELETE'
			});
			const data = await response.json();
			if(response.ok){
				alert(`${data.message}`);
			} else{
				alert(`${data.error}`);
			}
		} catch (error){
			console.log(error);
		}
	}

	function showModal(data){
		const modal = document.createElement('MODAL');
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-1secc">
					<h2>Agregar producto</h1>
					<button class="cerrar-modal"> 
						<svg xmlns="http://www.w3.org/2000/svg" x-bind:width="size" x-bind:height="size" viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
							<path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z"></path>
						</svg>
					</button>
				</div>
				<div id="alertas">
				
				</div>
				<form class="formulario">
					<div class="parametro">
						<label> Id: </label>
						<input name="id" type="text" id="ID" placeholder="Ej. PRO001"/> 
					</div>
					<div class="parametro" >
						<label> Nombre: </label>
						<input name="nombre" type="text" id="nombre" placeholder="Ej. Mouse gamer"/> 
					</div>
					<div class="parametro">
						<label> Categoria: </label>
						<input name="categoria" type="text" id="categoria" placeholder="Ej. Mouse"/> 
					</div>
					<div class="parametro">
						<label> Precio: </label>
						<input name="precio" type="number" step="0.01" id="precio" placeholder="Ej. 300.00"/> 
					</div>
					<div class="parametro">
						<label> Stock: </label>
						<input name="stock" type="number" id="stock"  placeholder="Ej. 50 "/> 
					</div>

					<button id="btnEnviar" class="enviar-data"> Agregar </button>
				</form>
				
			</div>
			
		`;
		document.body.appendChild(modal);
		// Asignar evento al botón "Cerrar"
		modal.querySelector('.cerrar-modal').addEventListener('click', () => {
			document.body.removeChild(modal);
		});

		const idInput = modal.querySelector('#ID');
		const nombreInput = modal.querySelector('#nombre');
		const categoriaInput = modal.querySelector('#categoria');
		const precioInput = modal.querySelector('#precio');
		const stock = modal.querySelector('#stock');
		const btnEnviar = modal.querySelector('#btnEnviar');

		const producto = {
			id: '',
			nombre: '',
			categoria: '',
			precio: 0,
			stock: 0
		}



		idInput.addEventListener('blur', validar);
		nombreInput.addEventListener('blur', validar);
		categoriaInput.addEventListener('blur', validar);
		precioInput.addEventListener('blur', validar);
		stock.addEventListener('blur', validar);
		btnEnviar.addEventListener('click', (e) => {
			e.preventDefault();
			if(data){
				updateData();
				return;
			}
			sendDato();
		});

		if(data){
			idInput.value = data.id;
			nombreInput.value = data.nombre;
			categoriaInput.value = data.categoria;
			precioInput.value = data.precio;
			stock.value = data.stock;

			producto.id = data.id;
			producto.nombre = data.nombre;
			producto.categoria = data.categoria;
			producto.precio = data.precio;
			producto.stock = data.stock;
		}


		function validar(e){
			limpiarAlerta();

			if(e.target.value.trim() === ''){
				mostrarAlerta(`El valor ${e.target.name} no puede estar vacio`, 'error');
				producto[e.target.name] = '';
				comprobarDatos();
				return;
			}

			if(e.target.name === 'id'){
				producto[e.target.name] = e.target.value.trim().toUpperCase();
			}
			// Convertir `precio` a float
			else if (e.target.name === 'precio') {
				producto[e.target.name] = parseFloat(e.target.value) || 0; // Usa `parseFloat`
			} 
			// Convertir `stock` a número entero
			else if (e.target.name === 'stock') {
				producto[e.target.name] = parseInt(e.target.value, 10) || 0; // Usa `parseInt` con base 10
			} 
			// Guardar otros valores como están
			else {
				producto[e.target.name] = e.target.value.trim();
			}
		
			comprobarDatos();
		}

		function mostrarAlerta(msg, tipo){
			const alertasDiv = modal.querySelector('#alertas');
			const alerta = document.createElement('P');
			if(tipo === 'error'){
				alerta.classList.add('error');
			} else {
				alerta.classList.add('correcto');
			}
			
			alerta.innerText = msg;
			alertasDiv.appendChild(alerta);
		}

		function limpiarAlerta(){
			const alerta = modal.querySelector('.error');
			if(alerta){
				alerta.remove();
			}
		}

		function comprobarDatos(){
			if(Object.values(producto).includes('')){
				btnEnviar.classList.add('opacity-50');
				btnEnviar.disable = true;
				return;
			}
			btnEnviar.classList.remove('opacity-50');
			btnEnviar.disable = false;
		}

		async function sendDato(){
			try {
				const response = await fetch('http://127.0.0.1:4000/producto', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(producto)
				});
				if(!response.ok){
					const error = await response.json();
					mostrarAlerta(`${error.status}`, 'error');
					return;
				} else {
					const data = await response.json();
					mostrarAlerta(`${data.status}, ${data.nombre}`, 'correcto')
				}
			} catch(error){
				console.log(error);
			}
		}

		async function updateData(){
			try{
				const response = await fetch(`http://127.0.0.1:4000/producto`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(producto)
				});
				if(!response.ok){
					const error = await response.json();
					mostrarAlerta(`${error.status}`, 'error');
					return;
				} else {
					const data = await response.json();
					mostrarAlerta(`${data.status}, ${data.nombre}`, 'correcto')
				}
			} catch(error){
				console.log(error);
			}
		}
	}
}

/* LOGISTICA */
const logisticaBtn = document.querySelector('#logisticaBtn');
/* Evento */
logisticaBtn.addEventListener('click', showLogistica);

function showLogistica() {
    if (logisticaBtn.classList.contains('activo') || contenedorData.dataset.id == 'logistica') {
        return;
    }

    // Limpiar el contenedor antes de mostrar la nueva información
    contenedorData.innerHTML = '';
    contenedorData.dataset.id = '';


    

    // Función para cargar las órdenes
    async function cargarOrdenes() {
        try {
            const response = await fetch('http://localhost:3001/api/logistica/listarOrdenes');
            if (!response.ok) {
                console.log('No se cargaron los datos');
                return;
            }
            const data = await response.json();

            // Verifica si 'data' contiene la cadena JSON que se debe parsear
            if (data && data.ListarOrdenesResult && data.ListarOrdenesResult.data) {
                // Parsear la cadena JSON que contiene las órdenes
                const ordenes = JSON.parse(data.ListarOrdenesResult.data);

                // Llamar a la función para mostrar las órdenes
                mostrarOrdenes(ordenes);
            } else {
                console.log('No se encontraron datos de órdenes');
            }
        } catch (error) {
            console.log('Error al cargar las órdenes:', error);
        }
    }

    function mostrarOrdenes(ordenes) {
		console.log('Mostrando órdenes:', ordenes);
	
		// Recorrer las órdenes y mostrar cada una
		Object.keys(ordenes).forEach(ordenId => {
			const orden = ordenes[ordenId];
			console.log('Orden ID:', ordenId);
			console.log('Detalles:', orden.Detalles);
			console.log('Estado:', orden.Estado);
			console.log('Fecha:', orden.Fecha);
			console.log('Productos:', orden.Productos);
	
			// Crear un contenedor para cada orden
			const orderDiv = document.createElement('DIV');
			orderDiv.classList.add('card', 'info');
			orderDiv.setAttribute('data-id', ordenId);
	
			// Crear la estructura HTML para cada orden
			orderDiv.innerHTML = `
				<p><span> ID: </span>${ordenId}</p>
				<p><span> Destinatario: </span>${orden.Detalles.Destinatario || orden.Detalles.cliente}</p>
				<p><span> Dirección: </span>${orden.Detalles.Direccion || orden.Detalles.direccion}</p>
				<p><span> Estado: </span>${orden.Estado}</p>
				<p><span> Fecha: </span>${orden.Fecha}</p>
				<p><span> Productos: </span></p>
				<ul id="productos">
					${Object.keys(orden.Productos).map(productoId => {
						const producto = orden.Productos[productoId];
						return `<li><strong>${producto.nombre}</strong> - Cantidad: ${producto.cantidad}</li>`;
					}).join('')}
				</ul>
			`;
	
			// Agregar la orden al contenedor
			contenedorData.appendChild(orderDiv);
	
		
	
			
			
		});
	}
	
	

    // Llamar la función para cargar las órdenes
    cargarOrdenes();

	// Modal del formulario 
	document.querySelector('#btnSolicitarEnvio').addEventListener('click', () => {
		showModalLogistica();
	})
	// TRAER DATOS DE PRODUCTOS
	async function cargarProd(){
		try {
			const response = await fetch('http://127.0.0.1:4000/getProductos');
			if(!response){
				console.log('No se cargaron los datos');
				return;
			}
			const products = await response.json();
			return products;
		} catch(error){
			console.log(error);
		}
	}
	async function showModalLogistica(){
		const prod = await cargarProd();
		console.log(prod);
		
		// Convierte los datos a un array con los IDs incluidos
		const products = Object.entries(prod) // Convertimos el objeto array clave valor
						.map(([id, producto]) => // Itera sobre cada par y desestructura los datos
						({ id, ...producto })); // Creamos objeto con el id y las propiedades de producto

		console.log(products);
		const modal = document.createElement('MODAL');
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-1secc">
					<h2>Agregar producto</h1>
					<button class="cerrar-modal"> 
						<svg xmlns="http://www.w3.org/2000/svg" x-bind:width="size" x-bind:height="size" viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
							<path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z"></path>
						</svg>
					</button>
				</div>
				<div id="alertas">
				
				</div>
				<form class="formulario">
					<div class="parametro" >
						<label> Destinario: </label>
						<input name="Destinatario" type="text" id="destinario" placeholder="Ej. Pedro Por Su Casa"/> 
					</div>
					<div class="parametro">
						<label> Direccion: </label>
						<input name="Direccion" type="text" id="categoria" placeholder="Ej. Av. Sin Numero 1918"/> 
					</div>
					<div class="parametro">
						<label> Productos: </label>
						<select id="producto" name="producto">
                        ${products.map(producto => {
                            return `<option value="${producto.id}">${producto.nombre}</option>`;
                        }).join('')}
                    </select>
					</div>
					<div class="parametro">
						<label> Cantidad: </label>
						<input name="Cantidad" type="text" id="categoria" placeholder="Ej. Av. Sin Numero 1918"/> 
					</div>
					<button type="submit" id="btnEnviar" class="enviar-data"> Agregar </button>
				</form>
				
			</div>
			
		`;
		document.body.appendChild(modal);
		// Asignar evento al botón "Cerrar"
		modal.querySelector('.cerrar-modal').addEventListener('click', () => {
			document.body.removeChild(modal);
		});
	}
}




/* Color botones */
botones.forEach(boton =>{
	boton.addEventListener('click', () => activarBoton(boton));
})

function activarBoton(boton){
	botones.forEach(btn =>{
		if(btn.classList.contains('activo')){
			btn.classList.remove('activo');
		}
	});

	boton.classList.add('activo');
}

