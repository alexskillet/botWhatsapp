const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

let fecha;
let direccion;
let latitud;
let longitud;
let telefono;
let nombre;
let correo;

const flowCobertura = addKeyword(['2', 'Cobertura']).addAnswer(
    ['Para conocer el área de cobertura, consulte en la aplicación oficial o en el siguiente mapa 👇',
    'Cobertura LavaGo',
    'https://goo.gl/maps/zk4zk8a4v23D3NMAA'],{ buttons: [{ body: '⬅️ Volver al Inicio' }] })

    const flowSecundario = addKeyword(['2', 'Cobertura']).addAnswer(
        ['Para conocer el área de cobertura, consulte en la aplicación oficial o en el siguiente mapa 👇',
        'Cobertura LavaGo',
        'https://goo.gl/maps/zk4zk8a4v23D3NMAA'],{ buttons: [{ body: '⬅️ Volver al Inicio' }] })

const flowAgendar = addKeyword(['1', 'Agendar'])
.addAnswer(['Excelente, vamos a agendar tu servicio de recolección',
            '📍 Por favor, comparte tu ubicación exacta o escribe tu dirección completa en un solo mensaje',
            '🏠 (Calle, número int, número ext, Colonia, Municipio/Alcaldía, Ciudad y Código Postal)'] ,
            { capture: true },
            (ctx)=>{
                if (!ctx.message.locationMessage || !ctx.message.locationMessage.degreesLatitude) {
                    direccion = ctx.body;
                  } else {
                    latitud = ctx.message.locationMessage.degreesLatitude;
                    longitud = ctx.message.locationMessage.degreesLongitude;
                    direccion = `https://www.google.com.mx/maps/search/${latitud},+${longitud}`;
                  }    
                telefono = ctx.from        
            }          
            
            )
            .addAnswer('Bien, por favor escribe en un mensaje,⏱️ la fecha y rango de horario en el que podemos pasar a recolectar tu servicio',{ capture: true },
            (ctx)=>{
                 fecha = ctx.body
             }    )
            .addAnswer('🏃🏻¿A nombre de quien se ingresará el pedido?',{ capture: true },
            (ctx)=>{
                 nombre = ctx.body
             }    )
            .addAnswer('📧Compárteme un correo electrónico para que recibas tu ticket digital',{ capture: true },
             (ctx)=>{
                  correo = ctx.body
              }    )
              .addAnswer('📄Te comparto el resumen de tu pedido.',null,
                    async (ctx, { flowDynamic}) => {
                            return flowDynamic(`- *Nombre:* ${nombre}
                    \n- *Dirección de recolección:* ${direccion}
                    \n- *Teléfono de contacto:* ${telefono} 
                    \n- *Fecha y hora:* ${fecha}
                    \n- *Correo electrónico:* ${correo}`)
                }
              )
              .addAnswer('Por favor acepta si estás de acuerdo.',
              {capture: true, buttons: [{ body: '❌ Cancelar solicitud' },{ body: '✔️ Aceptar solicitud' }] },
      
                      async (ctx, { flowDynamic, endFlow }) => {
                          if (ctx.body == '❌ Cancelar solicitud') 
                              return endFlow({body: '❌ Su solicitud ha sido cancelada',
                                    buttons:[{body:'⬅️ Volver al Inicio' }]
                              })
                              return flowDynamic(`🙌🏻Servicio Agendado existosamente, el repartidor te contactará cuando salga a ruta para recolectar tu pedido. Gracias por usar LavaGo WhatsApp😁\n
                              Escribe *MENÚ* para regresar al inicio`)
                  }
                )


const flowClientes = addKeyword(['3', 'cliente', 'clientes']).addAnswer(
    [
        '📄 Atención a clientes',
        'Escribe tu consulta en un mensaje detallado:',
    ],{capture: true},
).addAnswer([
    '👨🏻‍💼 Bien, en un momento un asesor te atenderá',
])

const flowSucursal = addKeyword(['4', 'Sucursal', 'Sucursales']).addAnswer(
    [
        '📄 Atención a Sucursales',
        'Escribe tu consulta en un mensaje detallado:',
    ],{capture: true},
).addAnswer([
    '👨🏻‍💼 Bien, en un momento un asesor te atenderá',
])




const flowPrincipal = addKeyword(['Hola','⬅️ Volver al Inicio','menu','menú'])
    .addAnswer(['🙌 Hola bienvenido a *LavaGo*',
        'Gracias por tu confianza',
        'A continuación escribe el *número* de la opción deseada:',
        '1️⃣Agendar un servicio 📆',
        '2️⃣Área de cobertura 🌎',
        '3️⃣Soporte a clientes 👩🏼‍💻',
        '4️⃣Soporte a Sucursales 🏬'
    ],
        null,
        null,
        [flowAgendar, flowCobertura, flowClientes, flowSucursal]
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
