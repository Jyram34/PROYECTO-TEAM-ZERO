using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Security.Cryptography;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

using FireSharp.Config;
using FireSharp.Interfaces;
using FireSharp.Response;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace LogisticaWS
{
   
    public class WSLogistica : IWSLogistica
    {

        //Metodo para comunicarse con el weebhook
        private async Task<string> SendWebhookRequest(string tipo, string mensaje)
        {
            string url = "http://localhost:3000/api/webhook/event";

            // Crear el contenido del JSON
            var jsonData = new
            {
                tipo = tipo,
                mensaje = mensaje
            };

            try
            {
                // Convertir el JSON a un string
                string jsonString = JsonConvert.SerializeObject(jsonData);

                // Configurar el cliente HTTP
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Crear el contenido para la solicitud
                    var content = new StringContent(jsonString, Encoding.UTF8, "application/json");

                    // Enviar la solicitud POST
                    HttpResponseMessage response = await client.PostAsync(url, content);

                    // Leer la respuesta como string
                    string responseBody = await response.Content.ReadAsStringAsync();

                    // Verificar si la solicitud fue exitosa
                    if (response.IsSuccessStatusCode)
                    {
                        return $"Solicitud enviada con éxito: {responseBody}";
                    }
                    else
                    {
                        return $"Error en la solicitud: {response.StatusCode} - {responseBody}";
                    }
                }
            }
            catch (Exception ex)
            {
                return $"Error al enviar la solicitud: {ex.Message}";
            }
        }
        //Metodo para generar ID Unico 
        private string GenerateUniqueId()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            Random random = new Random();

            // Selecciona 6 caracteres aleatorios del conjunto `chars`
            string uniqueId = new string(Enumerable.Repeat(chars, 6)
                                                  .Select(s => s[random.Next(s.Length)])
                                                  .ToArray());
            return uniqueId;
        }
        // Método para obtener la categoría según el ISBN

        //LOGISTICA 

        //FUNCIONA PARA CREAR UNA NUEVA ORDEN
        public Logistica CrearOrden(string productos, string detalles)
        {
            IFirebaseConfig config = new FirebaseConfig
            {
                AuthSecret = "vnppV2e9y0aMpXiKmdlnG5CRpagbkWSAWu6gh3Gi",
                BasePath = "https://suministros-225a6-default-rtdb.firebaseio.com/"
            };
            IFirebaseClient client = new FireSharp.FirebaseClient(config);

            if (client == null)
            {
                return new Logistica() { status = "Error", data = "Error de inicialización del cliente Firebase" };
            }

            try
            {
                // Validar que ambos JSON no estén vacíos
                if (string.IsNullOrEmpty(productos) || string.IsNullOrEmpty(detalles))
                {
                    return new Logistica() { status = "Error", data = "Llena todos los campos requeridos" };
                }

                // Deserializar los JSON
                Dictionary<string, string> productosDict;
                Dictionary<string, string> detallesDict;

                try
                {
                    productosDict = JsonConvert.DeserializeObject<Dictionary<string, string>>(productos);
                    detallesDict = JsonConvert.DeserializeObject<Dictionary<string, string>>(detalles);
                }
                catch (JsonException ex)
                {
                    return new Logistica() { status = "ERROR", data = $"El JSON está mal formado: {ex.Message}" };
                }

                // Generar ID único para la orden
                string idOrden = GenerateUniqueId();
                DateTime fechaHoraActual = DateTime.Now;
                string fechaHoraCadena = fechaHoraActual.ToString("yyyy-MM-dd HH:mm:ss");

                // Crear el objeto para insertar en Firebase
                var ordenData = new
                {
                    Fecha = fechaHoraCadena,
                    Productos = productosDict,
                    Detalles = detallesDict,
                    Estado = "Orden Creada"
                };

                // Insertar en Firebase bajo el nodo `Logistica`
                client.Set("Logistica/" + idOrden, ordenData);

                // Enviar solicitud al webhook
                string tipo = "Nueva Orden";
                string mensaje = $"Se ha creado una nueva orden con ID: {idOrden}";
                Task<string> task = SendWebhookRequest(tipo, mensaje);  // Enviar el Webhook
                // Respuesta exitosa
                return new Logistica()
                {
                    Id = idOrden,
                    data = "La orden se ha insertado correctamente",
                    fecha = fechaHoraCadena,
                    status = "success"
                };
            }
            catch (Exception ex)
            {
                return new Logistica() { status = "ERROR", data = "Ha sucedido un error inesperado: " + ex.Message };
            }
        }

        //FUNCION PARA ACTUALIZAR EL ESTADO DE UNA ORDEN A TRAVES DEL ID E INGRESANDO EL NUEVO ESTADO
        public Logistica EstadoOrden(string id, string estado)
        {
            IFirebaseConfig config = new FirebaseConfig
            {
                AuthSecret = "vnppV2e9y0aMpXiKmdlnG5CRpagbkWSAWu6gh3Gi",
                BasePath = "https://suministros-225a6-default-rtdb.firebaseio.com/"
            };
            IFirebaseClient client = new FireSharp.FirebaseClient(config);

            if (client == null)
            {
                return new Logistica() { status = "Error", data = "Error de inicialización del cliente Firebase" };
            }

            try
            {
                // Validar si los valores son nulos o vacíos
                if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(estado))
                {
                    return new Logistica() { status = "Error", data = "Llena todos los campos requeridos" };
                }

                // Verificar si la orden existe en Firebase
                var orden = client.Get("Logistica/" + id);
                if (orden.Body == "null")
                {
                    return new Logistica() { status = "Error", data = "La orden con el ID proporcionado no existe" };
                }

                // Actualizar el estado de la orden
                var estadoData = new
                {
                    Estado = estado,
                    FechaActualizacion = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                };

                client.Set("Logistica/" + id + "/Estado", estado);
                client.Set("Logistica/" + id + "/FechaActualizacion", estadoData.FechaActualizacion);

                // Enviar solicitud al webhook
                string idOrden = id;
                string tipo = "Actualizacion de Estado";
                string mensaje = $"Se ha actualizado el estado de la orden: {idOrden}";
                Task<string> task = SendWebhookRequest(tipo, mensaje);  // Enviar el Webhook

                return new Logistica()
                {
                    Id = id,
                    data = $"El estado de la orden ha sido actualizado a '{estado}'",
                    status = "success"
                };
            }
            catch (Exception ex)
            {
                return new Logistica() { status = "ERROR", data = "Ha sucedido un error inesperado: " + ex.Message };
            }
        }

        //FUNCION PARA ACTUALIZAR UNA ORDEN A TRAVES DEL ID E INGRESANDO NUEVOS DATOS
        public Logistica ActualizarOrden(string id, string nuevosDatos)
        {
            IFirebaseConfig config = new FirebaseConfig
            {
                AuthSecret = "vnppV2e9y0aMpXiKmdlnG5CRpagbkWSAWu6gh3Gi",
                BasePath = "https://suministros-225a6-default-rtdb.firebaseio.com/"
            };
            IFirebaseClient client = new FireSharp.FirebaseClient(config);

            if (client == null)
            {
                return new Logistica() { status = "Error", data = "Error de inicialización del cliente Firebase" };
            }

            try
            {
                // Validar si los valores son nulos o vacíos
                if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(nuevosDatos))
                {
                    return new Logistica() { status = "Error", data = "Llena todos los campos requeridos" };
                }

                // Verificar si la orden existe en Firebase
                var orden = client.Get("Logistica/" + id);
                if (orden.Body == "null")
                {
                    return new Logistica() { status = "Error", data = "La orden con el ID proporcionado no existe" };
                }

                // Validar que el JSON esté bien formado
                Dictionary<string, object> nuevosDatosDict;
                try
                {
                    nuevosDatosDict = JsonConvert.DeserializeObject<Dictionary<string, object>>(nuevosDatos);
                }
                catch (JsonException ex)
                {
                    return new Logistica() { status = "ERROR", data = $"El JSON está mal formado: {ex.Message}" };
                }

                // Actualizar los datos de la orden
                foreach (var kvp in nuevosDatosDict)
                {
                    client.Update("Logistica/" + id + "/" + kvp.Key, kvp.Value);
                }

                // Respuesta exitosa
                return new Logistica()
                {
                    Id = id,
                    data = "La orden ha sido actualizada correctamente",
                    status = "success"
                };
            }
            catch (Exception ex)
            {
                return new Logistica() { status = "ERROR", data = "Ha sucedido un error inesperado: " + ex.Message };
            }
        }

        //FUNCION PARA ELIMINAR UNA ORDEN A TRAVES DEL ID
        public Logistica EliminarOrden(string id)
        {
            IFirebaseConfig config = new FirebaseConfig
            {
                AuthSecret = "vnppV2e9y0aMpXiKmdlnG5CRpagbkWSAWu6gh3Gi",
                BasePath = "https://suministros-225a6-default-rtdb.firebaseio.com/"
            };
            IFirebaseClient client = new FireSharp.FirebaseClient(config);

            if (client == null)
            {
                return new Logistica() { status = "Error", data = "Error de inicialización del cliente Firebase" };
            }

            try
            {
                // Validar que el ID no esté vacío
                if (string.IsNullOrEmpty(id))
                {
                    return new Logistica() { status = "Error", data = "El ID de la orden es requerido" };
                }

                // Verificar si la orden existe en Firebase
                var orden = client.Get("Logistica/" + id);
                if (orden.Body == "null")
                {
                    return new Logistica() { status = "Error", data = "La orden con el ID proporcionado no existe" };
                }

                // Eliminar la orden de Firebase
                client.Delete("Logistica/" + id);

                // Enviar solicitud al webhook
                string tipo = "Orden Eliminada";
                string mensaje = $"Se ha eliminado la orden: {id}";
                Task<string> task = SendWebhookRequest(tipo, mensaje);  // Enviar el Webhook
                // Respuesta exitosa
                return new Logistica()
                {
                    Id = id,
                    data = "La orden ha sido eliminada correctamente",
                    status = "success"
                };
            }
            catch (Exception ex)
            {
                return new Logistica() { status = "ERROR", data = "Ha sucedido un error inesperado: " + ex.Message };
            }
        }

        //FUNCION PARA OBTENER UNA ORDEN EN ESPECIFICO A TRAVES DEL ID
        public Logistica verOrden(string id)
        {
            IFirebaseConfig config = new FirebaseConfig
            {
                AuthSecret = "vnppV2e9y0aMpXiKmdlnG5CRpagbkWSAWu6gh3Gi",
                BasePath = "https://suministros-225a6-default-rtdb.firebaseio.com/"
            };
            IFirebaseClient client = new FireSharp.FirebaseClient(config);

            if (client == null)
            {
                return new Logistica() { status = "Error", data = "Error de inicialización del cliente Firebase" };
            }

            try
            {
                // Validar que el ID no esté vacío
                if (string.IsNullOrEmpty(id))
                {
                    return new Logistica() { status = "Error", data = "El ID de la orden es requerido" };
                }

                // Obtener los datos de la orden desde Firebase
                var orden = client.Get("Logistica/" + id);

                // Verificar si la orden existe
                if (orden.Body == "null")
                {
                    return new Logistica() { status = "Error", data = "La orden con el ID proporcionado no existe" };
                }

                // Convertir los datos de Firebase en un objeto
                var ordenData = JsonConvert.DeserializeObject<Dictionary<string, object>>(orden.Body);

                // Crear un objeto que incluye el ID y los detalles de la orden
                var ordenConId = new
                {
                    Id = id,  // Incluir el ID de la orden al principio
                    Orden = ordenData  // Los detalles de la orden
                };

                // Serializar el objeto completo (ID + Detalles de la orden) como JSON
                string ordenJson = JsonConvert.SerializeObject(ordenConId, Formatting.Indented);

                // Respuesta exitosa con los datos completos de la orden en 'data'
                return new Logistica()
                {
                    Id = id,
                    data = ordenJson,  // Aquí devolvemos el JSON completo con el ID primero
                    status = "success"
                };
            }
            catch (Exception ex)
            {
                return new Logistica() { status = "ERROR", data = "Ha sucedido un error inesperado: " + ex.Message };
            }
        }

        //FUNCION PARA LISTAR TODAS LAS ORDENES DE LOGISTICA
        public Logistica ListarOrdenes()
        {
            IFirebaseConfig config = new FirebaseConfig
            {
                AuthSecret = "vnppV2e9y0aMpXiKmdlnG5CRpagbkWSAWu6gh3Gi",
                BasePath = "https://suministros-225a6-default-rtdb.firebaseio.com/"
            };
            IFirebaseClient client = new FireSharp.FirebaseClient(config);

            if (client == null)
            {
                return new Logistica() { status = "Error", data = "Error de inicialización del cliente Firebase" };
            }

            try
            {
                // Obtener todas las órdenes desde Firebase bajo el nodo "Logistica"
                var ordenes = client.Get("Logistica");

                // Verificar si existen órdenes
                if (ordenes.Body == "null")
                {
                    return new Logistica() { status = "Error", data = "No se encontraron órdenes" };
                }

                // Convertir las órdenes en un diccionario
                var ordenesData = JsonConvert.DeserializeObject<Dictionary<string, object>>(ordenes.Body);

                // Serializar el resultado como JSON
                string ordenesJson = JsonConvert.SerializeObject(ordenesData, Formatting.Indented);

                // Respuesta exitosa con la lista de órdenes
                return new Logistica()
                {
                    data = ordenesJson,  // Devuelve el JSON con todas las órdenes
                    status = "success"
                };
            }
            catch (Exception ex)
            {
                return new Logistica() { status = "ERROR", data = "Ha sucedido un error inesperado: " + ex.Message };
            }
        }









    }
}
