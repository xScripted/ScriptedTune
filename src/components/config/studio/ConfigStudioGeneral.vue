<template>
  <div id="GeneralConfig">

       <div id="export-import">
            <div>
                <button id="toggleType" class="toggle-type waves-effect waves-light btn blue lighten-4" 
                        @click="toggleType"> 
                    {{ type }} 
                </button>
                Elige que tipo de información quieres exportar/importar  
            </div>

            <div>
                <button id="exportType" class="toggle-type waves-effect waves-light btn blue lighten-5" @click="importTypeAction">
                    IMPORTAR {{ type }}
                </button>
                <input id="importType" type="file" accept="application/JSON" @change="importType($event.target.files[0])">
            </div>
            
            <div>
                <button id="exportType" class="toggle-type waves-effect waves-light btn blue lighten-5" @click="exportType">
                    EXPORTAR {{ type }}
                </button>
            </div>


       </div>
  </div>
</template>

<script lang="ts">

import { ref } from 'vue';
import store from '@/store/store';
import M from 'materialize-css';
import { ipcRenderer } from 'electron';

import Store from 'electron-store';

const database: any = new Store();

export default ({
    setup() {
        const type = ref('Playlist');
        var index = 0;

        var newData = [] as any[];

        function toggleType() {
            const types = ['Playlist', 'Tags', 'Portadas'];
            type.value = index < types.length - 1 ? types[++index] : types[index = 0];
        }

        function exportType() {

            const date = new Date();
            const today = '-' + date.getDate() + '-' + date.getMonth() + '-' +  date.getFullYear();

            const dic = {
                Playlist: 'STMusic',
                Tags: 'STMusicTags',
                Portadas: 'STMusicPortadas',
            } as any;

            const content = database.get(dic[type.value]) as string;

            download(type.value + today + '.json', content );
        }

        function importType(file: File) {

            console.log('Import file');

            const reader = new FileReader();

            reader.onload = function(evt: any) {

                newData = JSON.parse(evt.target.result);
            };

            reader.readAsText(file);

        }

        function importTypeAction() {
            // REFACTORIZAR
            if( newData[0] ) {

                if(type.value === 'Tags' && 'isTag' in newData[0] ) {
                    store.actions.setTagList( newData );
                    M.toast({html:' Se han importado los TAGS correctamente! ✌' , classes: 'green lighten-2'});
                    ipcRenderer.send('reloadData');
                    return 0;
                }

                if(type.value === 'Playlist' && 'isSong' in newData[0] ) {
                    store.actions.setSongList( newData );
                    M.toast({html:' Se han importado las CANCIONES correctamente! ✌' , classes: 'green lighten-2'});
                    ipcRenderer.send('reloadData');
                    return 0;
                }

                if(type.value === 'Portadas' && 'isPortada' in newData[0] ) {
                    store.actions.setPortadaList( newData );
                    M.toast({html:' Se han importado las PORTADAS correctamente! ✌' , classes: 'green lighten-2'});
                    ipcRenderer.send('reloadData');
                    return 0;
                }

                M.toast({html: 'El tipo ' + type.value + ' no corresponde con el archivo que has subido ! ❌', classes: 'red lighten-2'});
            }  else {
                M.toast({html: 'No has elegido ningún archivo! ❌', classes: 'red lighten-2'});
            }

        }

        function download(filename: string, text: string) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        return {
            type, toggleType, exportType, importType, importTypeAction
        }
    }
});
</script>

<style scoped lang="scss">


    #export-import {

        #toggleType, #exportType, #importType {
            margin-right: 20px;
            color: black;
        }

        display: grid;
        row-gap: 20px;
        align-items: left;
        text-align: left;
    }

    .warning{
        background-color: red;
    }
</style>