<template>
  <div id="settings">

        <Searcher></Searcher>

        <div id="tag-list">
            <div class="taglist"> Tags </div>
            <div class="tag-item tag" v-for="tag in tags" :key="tag.id" @click="activeTagFilter($event.target, tag.id)"
                :style="{ backgroundColor: tag.bgColor, color: tag.textColor }"> 
                {{ tag.emoji + ' ' + tag.name }}
            </div>
        </div>

        <div class="switch" @click="switchAndOr">
            <label>
                <i class="material-icons"> call_split </i>
                    <input type="checkbox" v-model="andOrCheck">
                    <span class="lever"></span>
                <i class="material-icons"> call_merge </i>
            </label>
        </div>

        <div class="shorcut-buttons">

            <div id="add-tag" class="shorcut-btn valign-wrapper" @click="openTagConfig"> 
                <i class="material-icons">add</i> Crear Tag
            </div>

            <div id="add-music" class="shorcut-btn valign-wrapper" @click="addMusic"> 
                <i class="material-icons">add</i> Añadir Canciones 
            </div>

        </div>
  </div>
</template>


<script lang="ts">

    import { ref, inject } from 'vue';
    import { remote, ipcRenderer } from 'electron';
    import { Song } from '@/models/Song';
    import Searcher from '@/components/Searcher.vue';
    import store from '@/store/store';

    export default ({
        components: {
            Searcher
        },
        setup() {
            
            const createuuid: any = inject('createuuid');
            const searcherText = ref('');
            const searcherType = ref('cancion');
            const active = ref('');
            const newTagName = ref(''); 
            const newTagColor = ref(''); 
            const selectStudio = ref('Crear Tag');
            const filterTags = ref('');
            const andOrCheck = ref(true);
            const tags = store.getters.tagList;
            var indexStudio = 0;

            function addMusic() {

                // Importar canciones desde una carpeta
                const songList = remote.dialog.showOpenDialog(
                    { properties: ['openFile' , 'multiSelections'], 
                      filters: [{ name: 'MP3', extensions: ['mp3'] }]
                    }); 

                var newSongs: Song[] = [];
                
                //Cuando cargen add nuevo array a newMusic y actualizar bbdd
                songList.then((fileList) => {

                    for(let songUrl of fileList.filePaths) {

                        var metadata = getMetadata(songUrl);

                        newSongs.push({
                            id: 'song-' + createuuid(),
                            url: songUrl,
                            title: metadata.title,
                            artist: metadata.artist,
                            tags: [],
                            portada: [],
                            playing: false,
                            date: new Date(),
                            isSong: true,
                        });
                    }

                    store.actions.setSongList(store.getters.songlist.value.concat(newSongs));
                })

                //Intenta sacar el titulo y el artista a partir del nombre del archivo
                function getMetadata(url: string) {

                    var metadata = url.split("\\");
                    var fullname = metadata[metadata.length - 1];
                    var titleartist = fullname.split('-');

                    return {
                        title: titleartist[1] ? titleartist[1].split('.')[0].trim() : titleartist[0].trim(),
                        artist: titleartist[0].trim()
                    };
                }
            }
          
            function toggleConfiguration() {
               // store.dispatch('toggleConfiguration');
                //active.value = store.getters.configuration ? 'active' : '';
            }

            function switchStudio() {
                const studios = ['Crear Tag', 'Portadas'];
                
                indexStudio++;

                indexStudio = indexStudio >= studios.length ? 0 : indexStudio; 

                selectStudio.value = studios[indexStudio];
            }

            function activeTagFilter(domTag: any, idTag: string) {

                domTag.classList.toggle('tag-selected');

                if(domTag.classList.contains('tag-selected')) {
                    store.actions.tagListFilter('add', idTag);
                } else {
                    store.actions.tagListFilter('remove', idTag);
                }

            }

            function openTagConfig() {
                ipcRenderer.send('configurationIpc', 'tags');
            }

            function switchAndOr() {
                store.actions.setTagAndOr(andOrCheck.value);
                store.actions.filterSongs();
            }

            return {
                addMusic, searcherText, searcherType, toggleConfiguration, 
                active, newTagName, newTagColor, activeTagFilter, switchAndOr,
                filterTags, selectStudio, switchStudio,tags, openTagConfig, andOrCheck
            }
        }
    });

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    #settings {
        position: relative;
        overflow: hidden;
        padding: 10px;
        display: grid;
        grid-template-rows: 100px 1fr 30px 80px;
        grid-template-columns: 1fr;

        border-right: 1px solid lightgray;

        #tag-list{
            border-bottom: 1px solid lightgray;
            overflow-y: scroll;
            &::-webkit-scrollbar { display: none;  }

            .taglist {
                border-bottom: 1px solid lightgray;
                text-align: left;
                
                margin-bottom: 20px;
            }

            .tag-item {
                transition: .3s;
                float: left;
                margin: 5px;

            }
        }

        .switch {
            margin-top: 10px;

            .lever {
                margin-top: -15px;
                background-color: #84C7C1;
                &:after {
                    background-color: #26A69A;
                }
            }
        }


        .shorcut-btn{
            cursor: pointer;
            user-select: none;
            height: 40px;

            i {
                margin-right: 10px;
            }
        }
    }

    .creation-studio {
        border: 2px solid black;
        border-radius: 5px;
        position: relative;
        margin: 5%;
        width: 90%;
        height: 100%;


        #select-studio{
            transition: .3s ease-in-out;
            user-select: none;
            height: 40px;
            font-weight: bold;
            padding-top: 20px;
            margin-bottom: 10px;
            font-size: 20px;
            border-bottom: 2px solid;
            border-radius: 3px 3px 0px 0px;
            cursor: pointer;
            box-shadow: inset 0px 0px 0px 0px rgb(129, 0, 123);
            
            &:hover {
                transition: .3s ease-in-out;
                box-shadow: inset 0px 0px 20px 0px rgb(250, 135, 240);
              
            }
        }


        #portada-creator {
            #upload-image {
                width: 20px;
                height: 20px;
                padding: 10px;
                background-repeat: no-repeat;
                cursor: pointer;
                background-size: 70%;
                background-position: center;
            }

            .portada {
                width: 30px;
                height: 30px;
                background-size: 90%;
                background-position: center;
                background-repeat: no-repeat;
            }
        }


        #tag-creator{
            display: grid;
            grid-template-rows: 100% 30px;
            .list-of-tags { 

                .tag-row {
                    display: grid;
                    margin: 5px;
                    grid-template-columns: 10fr 1fr 1fr;
                    justify-items: start;
                    
                    .tag {
                        transition: .3s;
                        cursor: pointer;
                        &:hover {
                            transition: .3s;
                            filter: brightness(80%);
                            box-shadow: 0px 0px 5px 0px rgb(141, 141, 141);
                        }
                    }

                    .remove-tag {
                        transition: .3s;
                        padding-left: 10px;
                        padding-right: 10px;
                        cursor: pointer;

                        &:hover{
                            transition: .3s;
                            color: red;
                        }
                    }
                }
            }
            .create-tag-btns {
                display: flex;

                .new-tag-name {
                    width: 50%;
                    margin: 0px 5px;
                }
                .create-tag{
                    border: 1px solid;
                    border-radius: 5px;
                    margin: 0px 5px;
                    width: 40px;
                }
            }
        }
    }

    .task-bar {
        display: flex;
        justify-content: space-between;

        #add-music{
            cursor: pointer;
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
            width: 13%;
            height: 50px;
        }

        #searcher {
            position: relative;
            width: 60%;
   
            input { 
                transition: .3s;
                margin-top: 5px;
                width: 100%;
                height: 30px;
                font-size: 15px;
                border: 2px solid rgba(103, 1, 112, 0.294);
                border-radius: 2px;

                &:focus {
                    transition: .3s;
                    background-color: rgb(219, 205, 253);
                    outline: none;
                }
            }

            select {
                position: absolute;
                top: 5px;
                right: -8px;
                height: 36px; 
                outline: none;
            }

            .overlay-search {
                position: absolute;
                overflow: overlay;
                border: 2px solid black;
                width: 100%;
                height: 50vh;
                z-index: 1;
                background-color: white;
                border-radius: 5px;
                margin-top: 5px;
                box-shadow: 0px 0px 5px 0px rgb(90, 0, 112);
                

                .filter-tag {
                    background-color: rgb(0, 255, 30);
                    margin: 5px;
                    border: 1px solid gray;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;
                    text-align: center;
                    padding: 7px 10px 5px 20px;
                    width: 70%;
                    overflow: hidden;
                    margin-left: 8%;
                    font-weight: bold;

                    .add-tag-to-filter{
                        cursor: pointer;
                    }
                }
            }
        }
        
        #btn-configuration {
            cursor: pointer;
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
            width: 13%;
            height: 50px;
        }

    }


</style>