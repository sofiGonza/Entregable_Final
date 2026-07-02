/*Esta clase tiene un arreglo donde se van guardando todas las conversiones realizadas mientras el servidor esté encendido. */
class Conversiones {

    constructor() {
        /*Arreglo donde se almacenan todas las conversiones realizadas mientras el servidor permanezca en ejecución. */
        this.historial = [];
    }
        /*Recibe un objeto con la información de una conversión y lo almacena dentro del historial. */
        /*Imprime la informacion que recibe.*/
    guardar(conversion) {
        this.historial.push(conversion);
        console.log('====================');
        console.log("Conversión registrada:");
        console.log(conversion);
    }
/*Devuelve el arreglo completo con todas las conversiones registradas durante la ejecución del servidor.*/
    obtenerHistorial() {
        return this.historial;
    }

}
/*exporta la clase Conversiones para que pueda ser utilizada en otros archivos del proyecto. */
module.exports = Conversiones;