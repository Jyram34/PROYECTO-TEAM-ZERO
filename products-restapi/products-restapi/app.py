from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db

# Inicializar la aplicación Flask
app = Flask(__name__)
CORS(app)

# Inicializar Firebase
cred = credentials.Certificate('C:/Users/yiram/OneDrive/Escritorio/products-restapi/products-restapi/suministros-225a6-firebase-adminsdk-xmotz-483bde7355.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://suministros-225a6-default-rtdb.firebaseio.com/'
})

# Función para verificar campos vacíos
def verificar_campos_vacios(data):
    required_fields = ["nombre", "categoria", "id"]
    for field in required_fields:
        if not data.get(field):
            return field
    return None

# Rutas y servicios

@app.route('/Productos', methods=['GET'])
def get_productos():
    # Referencia a la base de datos para los productos
    ref = db.reference("Productos")
    
    # Obtener todos los productos
    productos = ref.get()
    
    # Verificar si hay productos
    if not productos:
        return jsonify({"status": "No hay productos disponibles."}), 404

    return jsonify( productos), 200

#GETID
@app.route('/producto=<producto_id>', methods=['GET'])
def get_producto_by_id(producto_id):
    # Verificar que el ID no esté vacío
    if not producto_id:
        return jsonify({"error": "El campo 'id' no puede estar vacío."}), 400

    # Referencia al producto en Firebase
    ref = db.reference(f"Productos/{producto_id}")
    producto = ref.get()

    # Verificar si el producto existe
    if not producto:
        return jsonify({"error": "Producto no encontrado."}), 404

    # Incluir el ID del producto en la respuesta
    producto["id"] = producto_id

    return jsonify(producto), 200


@app.route('/producto', methods=['POST'])
def post_crear_producto():
    data = request.get_json()
    
    # Verificar campos vacíos
    campo_vacio = verificar_campos_vacios(data)
    if campo_vacio:
        return jsonify({"status": f"Error: El campo {campo_vacio} está vacío."}), 400

    producto_id = data.get("id")
    precio = data.get("precio")
    stock = data.get("stock")

    # Asegurarse de que precio, stock y id no sean vacíos o nulos
    if precio is None or precio == "":
        return jsonify({"status": "Error: El campo 'precio' no puede estar vacío."}), 400
    if stock is None or stock == "":
        return jsonify({"status": "Error: El campo 'stock' no puede estar vacío."}), 400
    if producto_id is None or producto_id == "":
        return jsonify({"status": "Error: El campo 'id' no puede estar vacío."}), 400

    # Verificar si el ID ya existe
    ref = db.reference(f"Productos/{producto_id}")
    if ref.get() is not None:
        return jsonify({"status": "Error: Ya existe un producto con ese ID."}), 400

    # Crear producto (sin incluir el campo 'id')
    ref.set({
        "nombre": data["nombre"],
        "categoria": data["categoria"],
        "precio": precio,
        "stock": stock
    })

    return jsonify({"status": "Producto creado", "nombre": data["nombre"], "id": producto_id}), 201


@app.route('/producto', methods=['PUT'])
def actualizar_producto():
    data = request.get_json()
    
    # Verificar campos vacíos
    campo_vacio = verificar_campos_vacios(data)
    if campo_vacio:
        return jsonify({"status": f"Error: El campo {campo_vacio} está vacío."}), 400

    producto_id = data.get("id")
    precio = data.get("precio")
    stock = data.get("stock")

    # Asegurarse de que precio, stock y id no sean vacíos o nulos
    if precio is None or precio == "":
        return jsonify({"status": "Error: El campo 'precio' no puede estar vacío."}), 400
    if stock is None or stock == "":
        return jsonify({"status": "Error: El campo 'stock' no puede estar vacío."}), 400
    if producto_id is None or producto_id == "":
        return jsonify({"status": "Error: El campo 'id' no puede estar vacío."}), 400

    # Verificar si el producto existe
    ref = db.reference(f"Productos/{producto_id}")
    if ref.get() is None:
        return jsonify({"status": "Error: Producto no encontrado."}), 404

    # Actualizar producto (sin incluir el campo 'id')
    ref.update({
        "nombre": data["nombre"],
        "categoria": data["categoria"],
        "precio": precio,
        "stock": stock
    })

    return jsonify({"status": "Producto actualizado", "id": producto_id, "nombre": data["nombre"]}), 200


@app.route('/producto=<producto_id>', methods=['DELETE'])
def delete_producto(producto_id):
    # Verificar que el ID no esté vacío
    if not producto_id:
        return jsonify({"error": "El campo 'id' no puede estar vacío."}), 400

    # Referencia al producto en Firebase
    ref = db.reference(f"Productos/{producto_id}")
    producto = ref.get()

    # Verificar si el producto existe
    if not producto:
        return jsonify({"error": "Producto no encontrado."}), 404

    # Eliminar producto
    ref.delete()

    return jsonify({"message": f"Producto con ID '{producto_id}' eliminado exitosamente."}), 200


# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True, port=4000)
