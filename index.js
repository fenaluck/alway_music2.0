//importamos la librerias
const {Client} = require("pg");
const chalk = require("chalk");
//otra forma:
//import pg from "pg";
//import chalk from 'chalk';

//creamos el cliente
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'always_music',
    password: '',
    port: 5432
})
//conectamos 
client.connect(err => {
    if(err){
        console.log('error en la conexion', err);
    }
})

function init(){
    // condicion de los parametros 
    
    if (process.argv.length < 3){
        console.log('Este programa requiere mas argumentos');
        process.exit(1);
    }
    
   // condicion de ingreso de datos 
   //*con esta condicion copiamos el original de los datos ingresados
   const accion = process.argv.slice(2);
   //*se imprimira en pantalla los datos ingresados de color verde
   console.log(chalk.green(accion));
   // condicion y transformar a minuscula con un dato
   if (accion[0].toLowerCase() == "consulta" && accion.length == 1) {
     consulta();
   // condicion y transformar a minuscula requiere 5 parametros
   } else if (accion[0].toLowerCase() == "nuevo" && accion.length == 5) {
     insertar(accion[1], accion[2], accion[3], accion[4]);
   // condicion y transformacion para editar un estudiante requiere 5 parametros
   } else if (accion[0].toLowerCase() == "editar" && accion.length == 5) {
     actualizar(accion[1], accion[2], accion[3], accion[4]);
   //condicion de buscar por rut
   } else if (accion[0].toLowerCase() == "rut" && accion.length == 2) {
     consultaRut(accion[1]);
    //condicion para eliminar
   } else if (accion[0].toLowerCase() == "eliminar" && accion.length == 2) {
     eliminar(accion[1]);
   } else {
    //condicion para datos incorrectos se le aplicara un color rojo con chalk
    console.log(chalk.rgb(255,10,10).bold("Los datos ingresados no son correctos"));
     return;
   }
  
    
    // insertando informacion a la tabla estudiantes
    async function insertar(nombre, rut, curso, nivel){
        await client.query(`insert into estudiantes(nombre, rut, curso, nivel)
        values('${nombre}', '${rut}', '${curso}', ${nivel})`
        )
        console.log(chalk.rgb(150,190,10).bold(`has insertado '${nombre}' como nuevo estudiante`));
        client.end()
    }
    
    // realizamos la consulta de todos los usuarios
    async function consulta(){
        // guardamos la respuesta 
        const res = await client.query(`select * from estudiantes`);
        //aplicamos color RGB con el metodo chalk y negrita a la respuesta
        console.log(chalk.rgb(150,190,10).bold("Resultado de la consulta:"));
        const print = console.log;
        
        print(res.rows);

        client.end();
    }

    // realizamos la consulta de un estudiante por rut
    async function consultaRut(rut){
        const res = await client.query(`select * from estudiantes where rut='${rut}'`);
        // nos proporciona el resultado de la consulta
        console.log(chalk.rgb(150,190,10).bold(`La consulta realizada al rut:${rut} entrega el siguiente Resultado:`));
        console.log(res.rows)

        client.end()
    }

    // actualizar
    async function actualizar(nombre, rut, curso, nivel){
    //guardamos la accion para aplicarle la condicion
    const pos = `update estudiantes set nombre='${nombre}', curso='${curso}', nivel='${nivel}' where rut='${rut}'returning*`
    const res = await client.query(pos);
    //condicion para buscar el rut ingresado
    if (res.rows.length == 0) {
        console.log(chalk.rgb(200,120,20).bold("No se encontró alumno con el rut ingresado"));
    } else {
        
        console.log(chalk.rgb(150,190,10).bold(`El estudiante ${nombre} fue actualizado correctamente`))
    }
    client.end()
    }
    // borrar usuarios
    async function eliminar(rut){
        const res = await client.query(`delete from estudiantes where rut ='${rut}'`);
        console.log(chalk.rgb(150,190,10).bold(`registro de estudiante con rut:'${rut}' fue eliminado de la base de datos`));
        
        client.end();
    }
}

init()
