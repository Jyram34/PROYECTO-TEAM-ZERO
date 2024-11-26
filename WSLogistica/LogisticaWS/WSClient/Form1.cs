using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using FireSharp.Config;
using FireSharp.Interfaces;
using FireSharp.Response;

namespace WSClient
{
    public partial class Form1 : Form
    {
        IFirebaseConfig config = new FirebaseConfig
        {
            AuthSecret = "tWS15sQhJu6uFDKvjcmuHaFCWwyWBUte8wyDFmkA",
            BasePath = "https://webservices-f9634-default-rtdb.firebaseio.com/"
        };

        IFirebaseClient client;

        public Form1()
        {
            InitializeComponent();
        }

        
        private void btnBuscar_Click(object sender, EventArgs e)
        {
            var identificacion = txtIdentificacion.Text;

            using (WSPersonas.WSPersonasClient client = new WSPersonas.WSPersonasClient()) 
            {
                var persona = client.ObtenerPersona(identificacion);
                var nombre = persona.Nombre;

                textBox1.Text = "Nombre: " + persona.Nombre + "\r\n" +
                                "Edad: " + persona.Edad + "\r\n" +
                                "MensajeRespuesta: " + persona.MensajeRespuesta + "\r\n" +
                                "Error: " + persona.Error;
            }
        }

        private void Form1_Load_1(object sender, EventArgs e)
        {
            try
            {
                client = new FireSharp.FirebaseClient(config);

                var categoria = "libros";
                var producto = new
                {
                    LIB000 = "LIBRO EMILIO"
                };

                if (client != null)
                {
                    textBox1.Text = "Conexion lista";
                    MessageBox.Show("Conexion Establecida");
                    SetResponse response = client.Set("productos/" + categoria, producto);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error: " + ex.Message);
            }
        }
    }
}
