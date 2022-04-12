//import pg from pg
const {Pool} = require('pg');
const chalk = require('chalk')

//corriendo el servidor
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'always_music',
    password: '',
    max: 20,
    min: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000
})

//? condicion de ingreso de datos 
//con esta condicion copiamos el original de los datos ingresados
const accion = process.argv.slice(2);
//? se imprimira en pantalla los datos ingresados de color verde
console.log(chalk.green(accion));
// condicion y transformar a minuscula con un dato
if (accion[0].toLowerCase() == "consulta" && accion.length == 1) {
 consultar();
//? condicion y transformar a minuscula requiere 5 parametros
} else if (accion[0].toLowerCase() == "nuevo" && accion.length == 5) {
 insertar(accion[1], accion[2], accion[3], accion[4]);
//? condicion y transformacion para editar un estudiante requiere 5 parametros
} else if (accion[0].toLowerCase() == "editar" && accion.length == 5) {
 actualizar(accion[1], accion[2], accion[3], accion[4]);
//? condicion de buscar por rut
} else if (accion[0].toLowerCase() == "rut" && accion.length == 2) {
 consultaRut(accion[1]);
//? condicion para eliminar
} else if (accion[0].toLowerCase() == "eliminar" && accion.length == 2) {
 eliminar(accion[1]);
} else {
//? condicion para datos incorrectos se le aplicara un color rojo con chalk
console.log(chalk.rgb(255,10,10).bold("Los datos ingresados no son correctos"));
 return;
}

//? funcion consultar
async function consultar(){
    //primero solicitamos un cliente
    let client 
    try{
        client = await pool.connect()
    }catch(err_conexion){
    //segundo imprimimos el error en caso de existir 
    console.log(err_conexion)
    return
    }

    //creamos la variable para guardar la respuesta
    let res;
    try{
        //realizamos la consulta
        res = await client.query({
        text:'select * from estudiantes',
        rowMode:'array',
        name:'Se obtiene toda la informacion de estudiantes'
        })
    }catch(pg_error){
        console.log(pg_error)
        return
    }
    //console.log(res.rows.map(row => chalk.green(JSON.stringify(row))))
    console.log(res.rows)
    client.release()
    pool.end()
}
//? funcion insertar
async function insertar(nombre, rut, curso, nivel){
    //se solicita un cliente de conexion
    let client
    try {
        client = await pool.connect()
                
    } catch (err_conexion) {
    //segundo imprimimos el error en caso de existir 
    console.log(err_conexion)
    return
    } 
    //creamos nuestra variable de respuesta
    let res;
    //realizamos la peticion
    try {
        res = await client.query({
        text:"insert into estudiantes(nombre, rut, curso, nivel) values($1, $2, $3, $4)",
        values:[nombre, rut, curso, nivel],        
        name:'Se realiza el ingreso de un nuevo estudiante'    
        })
        
    }catch(pg_error){
        console.log(pg_error)
        return
    }
    console.log(res.rows)
    //libero el cliente
    client.release()
    pool.end()
}
//? consulta de un estudiante por rut
async function consultaRut(rut){
    //se solicita un cliente de conexion
    let client
    try {
        client = await pool.connect()
                
    } catch (err_conexion) {
    //segundo imprimimos el error en caso de existir 
    console.log(err_conexion)
    return
    }

    //creamos la variable para guardar la respuesta
    let res;      
    try{
        //realizamos la consulta
        res = await client.query({
        text:`select * from estudiantes where rut=$1`, 
        values:[rut],
        rowMode: "Array",
        name:"Se obtiene la informacion del estudiante por rut"
        })
    }catch(pg_error){
        console.log(pg_error)
        return
    }
    // nos proporciona el resultado de la consulta
    console.log(chalk.rgb(150,190,10).bold(`La consulta realizada al rut:${rut} entrega el siguiente Resultado:`));
    console.log(res.rows)

    //libero el cliente
    client.release()
    pool.end()
}
//? actualizar datos del estudiante por rut
 async function actualizar(nombre, rut, curso, nivel){
    //solicitamos cliente
    let client
    try {
        client = await pool.connect()
        
    } catch (err_conexion) {
        console.log(err_conexion)
        return
    } 
    //realizamos la consulta de actualizacion
    let res;
    try {
        res = await client.query({
            text:`update estudiantes set nombre=$1, curso=$3, nivel=$4 where rut=$2`,
            values:[nombre, rut, curso, nivel],        
            name:'Se realiza la actualizacion del estudiante'
        })
        //condicion para buscar el rut ingresado
        if (res.rows.length == 0) {
            console.log(chalk.rgb(200,120,20).bold("No se encontró alumno con el rut ingresado"));
        } else {
            
            console.log(chalk.rgb(150,190,10).bold(`El estudiante ${nombre} fue actualizado correctamente`))
        }

    } catch(pg_error){
        console.log(pg_error)
        return
    }
    //libero el cliente
    client.release()
    pool.end()
}
//? eliminar el estudiante 
async function eliminar(rut){
    let client
    try {
        client = await pool.connect()
        
    } catch (err_conexion) {
        console.log(err_conexion)
        return
    } 
    //realizando la query de eliminacion
    let res;
    try {
        res = await client.query({
            text:`delete from estudiantes where rut =$1`,
            values:[rut],
            name:`se ha eliminado un registro de la base de datos`
        });
        
        console.log(chalk.rgb(150,190,10).bold(`registro de estudiante con rut:'${rut}' fue eliminado de la base de datos`));
    }catch(pg_error){
        console.log(pg_error)
        return
    } 
    
    //libero el cliente
    client.release()
    pool.end()
}
