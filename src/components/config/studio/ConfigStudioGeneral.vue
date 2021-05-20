<template>
  <div id="GeneralConfig">

       <div id="export-import">
            <div>
                <button id="toggleType" class="toggle-type waves-effect waves-light btn blue lighten-4" 
                        @click="toggleType"> 
                    {{ type }} 
                </button>
                {{ $t('config.general.portstitle') }}
            </div>

            <div>
                <button id="exportType" class="toggle-type waves-effect waves-light btn blue lighten-5" @click="importTypeAction">
                    {{ $t('config.general.import') }} {{ type }}
                </button>
                <input id="importType" type="file" accept="application/JSON" @change="importType($event.target.files[0])">
            </div>
            
            <div>
                <button id="exportType" class="toggle-type waves-effect waves-light btn blue lighten-5" @click="exportType">
                    {{ $t('config.general.export') }} {{ type }}
                </button>
            </div>


       </div>

       <div class="cores"> 
           <label> Nightcore </label>
           <input type="range" step="0.001" max="4" min="0.5" :value="nightcoreRate" @input="changeRate($event, 'night')">
           <input type="number" max="4" min="0.5" :value="nightcoreRate" @input="changeRate($event, 'night')"> 
        </div>

       <div class="cores"> 
            <label> Lowcore </label>
            <input type="range" step="0.001" max="4" min="0.5" :value="lowcoreRate" @input="changeRate($event,'low')">
            <input type="number" max="4" min="0.5" :value="lowcoreRate" @input="changeRate($event, 'low')"> 
        </div>

       <div id="dark-mode">
           Dark Mode

            <div class="switch">
                <label>
                    Off
                    <input id="darkSwitch" type="checkbox" @click="darkMode">
                    <span class="lever"></span>
                    On
                </label>
            </div>
       </div>

       <div id="change-lang">
           {{ $t('config.general.lang') }}

            <div class="switch">
                <label>
                    Español
                    <input id="langSwitch" type="checkbox" @click="changeLang">
                    <span class="lever"></span>
                    English
                </label>
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

        var config = JSON.parse(database.get('STMusicConfig'));

        const type = ref('Playlist');
        const isDark = ref(config.darkMode);
        const nightcoreRate = ref(1.2);
        const lowcoreRate = ref(0.9);

        var index = 0;

        var newData = [] as any[];

        if(config.nightcore) {
            nightcoreRate.value = config.nightcore; 
        }

        if(config.lowcore) {
            lowcoreRate.value = config.lowcore; 
        }

        function changeRate(ev, type: string) {
           

            if(type === 'night') {
                nightcoreRate.value = ev.target.value;
                config.nightcore = ev.target.value;
            }
            if(type === 'low') {
                lowcoreRate.value = ev.target.value;
                config.lowcore = ev.target.value;
            }

            database.set('STMusicConfig', JSON.stringify(config) );
            ipcRenderer.send('reloadConfig');
        }

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

        function darkMode() {

            isDark.value = !isDark.value;
            config.darkMode = isDark.value;

            database.set('STMusicConfig', JSON.stringify(config));
            ipcRenderer.send('darkMode');
        }

        function changeLang() {
            
            config.lang = config.lang === 'es' ? 'en' : 'es';
            database.set('STMusicConfig', JSON.stringify(config));
        }

        return {
            type, toggleType, exportType, importType, importTypeAction, darkMode,
            nightcoreRate, lowcoreRate, changeRate, changeLang
        }
    },
    mounted() {
        const config = JSON.parse(database.get('STMusicConfig'));
        const darkSwitch = document.getElementById('darkSwitch');
        const langSwitch = document.getElementById('langSwitch');
        if(config.darkMode && darkSwitch) darkSwitch.setAttribute('checked', 'checked');
        if(config.lang === 'en' && langSwitch) langSwitch.setAttribute('checked', 'checked');
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

    #dark-mode, #change-lang {
        margin-top: 40px;
        display: grid;
        align-items: left;
        text-align: left;
    }

    .cores {
        display: grid;
        width: 200px;

        grid-template-columns: 80px 350px 70px;

        margin-top: 20px;

        label {
            margin-top: 15px;
            margin-right: 20px;
            font-size: 15px;
        }

        input {
            border: 0;
            padding-right: 20px;
        }
    }

    .warning{
        background-color: red;
    }
</style>