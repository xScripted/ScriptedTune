<template>
  <div id="CoverCreator">
    <div class="nav-title valign-wrapper add-photo" > 
        <i class="material-icons"> add_a_photo </i> 
        Subir nueva portada  
    </div>
    <input type="file" multiple="multiple" id="new-portada-file" accept="image/png, image/jpeg" @change="newPortada($event)">

    <div id="portadas-list">
        <div class="portada z-depth-1" :key="portada.id" v-for="portada of portadaList" 
        :style="{ backgroundImage:  `url('img/${portada.url}')` }">
            <i class="material-icons" @click="removePortada(portada.id)"> close </i>
        </div>
    </div>
  </div>
</template>

<script lang="ts">

import { inject } from 'vue';
import { remote, ipcRenderer } from 'electron';
import store from '@/store/store';

export default ({
    setup() {

        const createuuid: any = inject('createuuid');
        const portadaList = store.getters.portadaList;
        const fs = remote.require('fs');

        function newPortada( data: any ) {

            for(const file of data.target.files) {
                fs.readFile(file.path, function( err: any, data: any) {
                
                    fs.writeFile('./public/img/' + file.name, data, function(err: any) {
                        if(err) console.warn(err);
                        if(!err) {
                            const portada = {
                                id: 'portada-' + createuuid(),
                                url: file.name, // REVISAR NO LO ENTIENDO
                                date: new Date(),
                                isPortada: true,
                            }
                            store.actions.addPortada(portada);
                        }
                    });
                })
            }

            ipcRenderer.send('reloadData');

        }

        function removePortada( id: string ) {
            store.actions.removePortada(id);
        }

        return {
            newPortada, portadaList, removePortada
        }
    }
});
</script>

<style scoped lang="scss">
    .nav-title {
        font-size: 20px;
        height: 50px;
        text-align: left;
    }

    #new-portada-file {
        margin: 5px;
        width: 100%;
        text-align: left;
    }

    #portadas-list {
        margin-top: 10px;
        margin-left: 5px;
        display: flex;
        flex-wrap: wrap;

        .portada {
            position: relative;
            margin-top: 20px;
            margin-right: 20px;
            width: 150px;
            height: 150px;
            border: 1px solid lightgray;
            border-radius: 5px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;

             i {
                 transition: .3s;
                 cursor: pointer;
                 position: absolute;
                 right: 0;
                 margin: 5px;
                 filter: blur(5px);
                 color: red;
                 font-size: 20px;
                 border-radius: 100%;

                 &:hover {
                    transition: .3s;
                    filter: blur(0px);  
                 }
             }
        }
    }
  
    .add-photo{
       user-select: none;

        i {
            margin-top: -5px;
            margin-right: 10px;
            font-size: 40px;
        }
    }

</style>