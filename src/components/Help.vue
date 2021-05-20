<template>
    <div id="help-modal">
        <div id="help-container">
            <i class="material-icons" id="close-help"  @click="$emit('close')"> close </i>

            <div class="text-info"> 
                <h5 >¿Que tiene de especial este reproductor?</h5>
                <p> <b> ✨ Modo nightcore: </b> Puedes convertir la canción que estes escuchando a nightcore o lowcore en tiempo real!<br>
                     - Nightcore hará la canción mas marchosa.<br>
                     - Lowcore hará la canción mas melancólica.<br>
                    <img class="z-depth-3" src="@/assets/img/help-nightcore.png" />
                </p>

                <p> <b> 📂 Estructura por tags:</b> Las playlist son substituidas por tags. <br>
                Puedes añadir tags a las canciones según su genero, estilo, mood, idioma, etc. Por ejemplo, una canción puede tener los tags:
                POP, voz femenina, favorita, karaoke, español.<br>

                Cuando tengas todas tus canciones catalogadas a tu gusto si un día te apetece escuchar canciones relajantes haces click en el
                tag relajante y se filtrarán creando una "playlist" dinámica.<br> 

                El potencial viene cuando te apetece escuchar canciones relajantes en español, en ese caso harás click en los dos tags y 
                tendrás una nueva playlist que cumpla esos criterios.<br>

                Existen dos modos: <br>
                 - Divisor <i class="material-icons"> call_split </i>: Acepta las canciones que tengan como mínimo un tag de los elegidos<br>
                 - Acumulativo <i class="material-icons"> call_merge </i>: Acepta las canciones que tengan TODOS los tags elegidos
                </p>

                <p style="color: gray; font-size: 10px"> Si haces click en la palabra Tags del menú de la izquierda se seleccionan todos a la vez</p>

                <p><b> 📀 Reproducción dinámica: (por defecto) </b> Se reproducirá lo que se ve actualmente en la lista de canciones</p>
                <p><b> 💿 Reproducción por cola: </b> Se reproducirá las canciones añadidas a la cola a través del signo + </p>
                <img class="z-depth-3" src="@/assets/img/queuemode.png" />

                <h5 style="margin-top: 50px"> ¿Cómo configurar las canciones?</h5>

                Para entrar en la zona de configuración haz click en la rueda que esta arriba a la derecha <i class="material-icons"> settings </i>
                
                <br><br> <b>Flujo de trabajo:</b>  <br>
                1 - Elige las canciones que quieres editar.<br>
                2 - Arriba haz click en los tags o portada que quieras añadir.<br>
                3 - Haz click en añadir o borrar.<br>
                4 - Acuerdate de deseleccionar canciones y/o tags/portadas que no quieras utilizar más.<br>

                <p style="color: gray; font-size: 10px"> Puedes cambiar el titulo / artista de una canción escribiendo directamente encima del nombre</p>
                <img class="z-depth-3" style="width: 60%" src="@/assets/img/config.png" />

                <br> <b> Creador de Tags </b> <br>
                <img class="z-depth-3" style="width: 60%" src="@/assets/img/editartag.png" />

                <br> <b> Importar / Exportar </b> <br>
                En la pestaña General tienes la opción de importar / exportar Tags, Portadas, Playlist que hayas creado.

                <p style="color: gray; font-size: 10px"> La aplicación no guarda las canciones, sólo la ruta donde estan alojadas en tu ordenador, <br>
                sin embargo, las portadas si quedan guardadas dentro de la app.</p>


                <h5 style="margin-top: 50px"> <b> ✍ INFORMACIÓN DE LA APP </b> </h5>
                <p> Esta app ha sido creada con el propósito de solucionar una necesidad personal y para mostrar/mejorar mis
                    habilidades en el Desarrollo Web
                </p>

                <b> Tecnologías utilizadas: </b><br>

                - Vue 3 <br>
                - Electron 8 <br> 
                - Howler <br>
                - Materialize <br>
                <br>

                <b> Github: </b> https://github.com/xScripted/ScriptedTune<br>
                <br>
                <b> www.miqueltoran.com </b>

            </div>
        </div>
    </div>
</template>

<script lang="ts">

export default ({
    setup() {
        return true;
    }
})
</script>

<style scoped lang="scss">
    #help-modal {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);

        #help-container {
            position: absolute;
            height: 90vh;
            overflow-y: scroll;
            background-color: white;
            width: 90%;
            margin: auto;
            right: 0;
            left: 0;
            margin-top: 5vh;
            border-radius: 5px;
            box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.5);

            * {
                user-select: text !important;
            }

            #close-help {
                transition: .3s;
                cursor: pointer;
                position: absolute;
                right: 15px;
                top: 15px;

                &:hover{
                    transition: .3s;
                    color: rgb(187, 0, 0);
                }
            }

            .text-info {
                padding: 2%;
                color: black;
                text-align: left;

                img {
                    border-radius: 5px;
                    margin: 10px;
                }
            }

            .material-icons{
                font-size: 20px;
            }
        }
    }
</style>
