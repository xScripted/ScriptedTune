<template>
  <div id="EditPlaylist">
    <div id="visualizer">
      <button class="toggle-type waves-effect waves-light btn blue lighten-5" @click="toggleTypeFunc"> {{ $t('config.' + toggleType )  }} </button>

      <div class="showcase">

        <div class="showcase-tags" v-if="toggleType == 'tags' ">
            <div class="tag-item tag" v-for="tag in tagList" :key="tag.id" @click="toggleShowcaseTags($event.target, tag.id)"
              :style="{ backgroundColor: tag.bgColor, color: tag.textColor }"> 
            {{ tag.emoji + ' ' + tag.name }}
          </div>
        </div>

        <div class="showcase-portadas" v-if="toggleType == 'portada' ">
            <div class="mini-portada z-depth-1" :portada-id="portada.id" v-for="portada in portadaList" :key="portada.id" 
            @click="toggleShowcasePortada($event.target, portada.id)"
              :style="{ backgroundImage: `url('img/${portada.url}')` }"> 
          </div>
        </div>
        
      </div>

      <div class="showcase-actions">
        <button class="showcase-add btn blue lighten-5" @click="showcaseToSongs('add')"> {{ $t('config.playlist.add') }} </button>
        <button class="showcase-remove btn blue lighten-5" @click="showcaseToSongs('remove')"> {{ $t('config.playlist.remove') }} </button>
      </div>

    </div>
    <Searcher id="searcher"></Searcher>
    <div id="order-by">

      <label class="song-checkbox">
        <input type="checkbox" @click="toggleAllCheckbox" />
        <span></span>
      </label>

      <div class="by-title"> {{ $t('playlist.title') }} </div>
      <div class="by-artist"> {{ $t('playlist.artist') }} </div>
      <div class="by-portada"></div>
      <div class="by-date">Tags</div>
      <div class="song-remove-checked" @click="removeSongs">
        <i class="material-icons"> close </i>
      </div>

    </div>
    <div id="playlist-editor">

      <div class="song-row" :key="song.id" v-for="song in songList" >

        <label class="song-checkbox">
          <input type="checkbox" :idsong="song.id" @click="toggleCheckbox(song.id)"/>
          <span></span>
        </label>

        <input class="song-title" type="text" :value="song.title" @input="updateSongInfo($event, song, 'title')">
        <input class="song-artist" type="text" :value="song.artist" @input="updateSongInfo($event, song, 'artist')">

        <div class="song-url" @click="editSongUrl(song)"> <i class="material-icons"> insert_link </i> </div>

        <div class="song-album" :style="{ backgroundImage: getPortada(song.portada[0]) }"> </div>

        <div class="song-tags">
          <div class="tag" :key="idTag" v-for="idTag of song.tags"
                :style="{ backgroundColor: tagById(idTag).bgColor, color: tagById(idTag).textColor }"> 
            {{ tagById(idTag).emoji + ' ' + tagById(idTag).name }} 
            <i class="song-tags-remove material-icons" @click="removeSingleTagFromSong(song.id, idTag)"> close </i>
          </div>
        </div>

        <div class="song-remove" @click="removeSong(song.id)"> <i class="material-icons"> close </i> </div>

      </div>

    </div>

    <div id="url-modal" v-if="toggleUrlModal" class="z-depth-5">
      <div class="modal-title"> {{ modalSong.title + ' - ' + modalSong.artist }} </div>
      <input type="text" :value="modalSong.url" @input="updateSongInfo($event, modalSong, 'url')">
      <i class="material-icons" @click="() => toggleUrlModal = false">close</i>
    </div>
  </div>
</template>

<script lang="ts">

import { ref, watch } from 'vue';
import store from '@/store/store';
import Searcher from '@/components/Searcher.vue';
import { ipcRenderer } from 'electron';
import { Portada } from '@/models/Portada';
import { Song } from '@/models/Song';

export default ({
  components: {
    Searcher
  },
  setup() {

    const toggleType = ref('tags');
    const toggleUrlModal = ref(false);
    const modalSong = ref('');

    const songList = store.getters.songListFilter;
    const tagList = store.getters.tagList;
    const portadaList = store.getters.portadaList;

    var checkedIds = [] as string[];
    var showcaseTags = [] as string[];
    var showcasePortada = '';
    var isAllCheckbox = true; //Boton seleccionar todas las canciones


    function toggleTypeFunc() {
      showcaseTags = [];
      if(toggleType.value == 'tags') return toggleType.value = 'portada';
      toggleType.value = 'tags';
    }

    function toggleCheckbox(id: string) {
      if(checkedIds.includes(id)) {
        const index = checkedIds.indexOf(id);
        checkedIds.splice(index, 1);
      } else {
        checkedIds.push(id);
      }
    }

    function toggleShowcaseTags( domElement: any,tagId: string) {

      var tagIndex = showcaseTags.indexOf(tagId);

      if( tagIndex == -1 )  {
        showcaseTags.push(tagId);
        domElement.classList.add('tag-selected');
      } else {
        showcaseTags.splice(tagIndex, 1);
        domElement.classList.remove('tag-selected');
      }

    }

    function toggleShowcasePortada( domElement: any, portadaId: string) {
      domElement.parentNode.children.forEach( ( domPortada: any) => {

        const currentId = domPortada.getAttribute('portada-id');
        
        if(currentId === portadaId) {

          if(domPortada.classList.contains('portada-selected')) {
            domPortada.classList.remove('portada-selected');
            showcasePortada = '';
          } else {
            domPortada.classList.add('portada-selected');
            showcasePortada = portadaId;
          }

        } else {
          domPortada.classList.remove('portada-selected');
        }

      })

    }

    function showcaseToSongs(addRemove: string) {
      const data = toggleType.value === 'tags' ? showcaseTags : [showcasePortada];
      store.actions.showcaseToSongs(toggleType.value, data, addRemove, checkedIds);
      ipcRenderer.send('reloadData');
    }

    function updateSongInfo( event: any, song: Song, type: string){

      if(type === 'title' || type === 'artist' || type === 'url') {
        song[type] = event.target.value;
      }

      store.actions.updateSongInfo(song);
      ipcRenderer.send('reloadData');
    }

    function tagById(id: string) {
      return store.getters.getTagById(id);
    }

    function removeSong(id: string) {
      store.actions.removeSongs([id]);
      ipcRenderer.send('reloadData');
    }

    function removeSongs() {
      store.actions.removeSongs(checkedIds);
      ipcRenderer.send('reloadData');
      checkedIds = [];
    }

    function removeSingleTagFromSong(idSong: string, idTag: string) {
      store.actions.removeSingleTagFromSong(idSong, idTag);
    }

    function toggleAllCheckbox() {

      const domSongs = document.querySelectorAll('.song-row .song-checkbox input');

      domSongs.forEach( (domSong: any) => {
        domSong.checked = isAllCheckbox;

        const idsong = domSong.getAttribute('idsong');

          if(isAllCheckbox && !checkedIds.includes(idsong)) {
            checkedIds.push(idsong);
          } 

          if(!isAllCheckbox && checkedIds.includes(idsong)) {
            const index = checkedIds.indexOf(idsong);
            checkedIds.splice(index, 1);
          }
      })

      isAllCheckbox = !isAllCheckbox;
    }

    watch(songList, () => {
      const domSongs = document.querySelectorAll('.song-row .song-checkbox input');

      domSongs.forEach( (domSong: any) => {
        const idsong = domSong.getAttribute('idsong') || '';
        if(checkedIds.includes(idsong)) domSong.checked = true;
      })
    })

    function getPortada( id: string ){

        let url = '';

        portadaList.value.map( ( portada: Portada) => {
            if( portada.id === id) url = portada.url;
        })

        return `url('/img/${url}')`;
    }

    function editSongUrl(song: any) {
      toggleUrlModal.value = true;
      modalSong.value = song;
    }

    return {
      songList, toggleType, toggleTypeFunc, tagList, toggleCheckbox, removeSingleTagFromSong, toggleAllCheckbox,
      toggleShowcaseTags, showcaseToSongs, tagById, removeSongs, removeSong, portadaList,
      toggleShowcasePortada, getPortada, toggleUrlModal, editSongUrl, modalSong, updateSongInfo
    }
  }
});
</script>

<style scoped lang="scss">

  #EditPlaylist{
    height: 100%;
    display: grid;
    grid-template-rows: 80px 70px 60px 1fr;


    * {
      user-select: none;
    }

    #visualizer {
      display: grid;
      grid-template-columns: 100px 1fr 100px;

      .toggle-type, .add-remove {
        color: black;
        height: 100%;
      }

      .showcase {
        height: 100%;
        overflow-y: scroll;
        &::-webkit-scrollbar { display: none;  }

        .showcase-tags {
          padding: 0px 10px;
          .tag-item{
            transition: .3s;
            float: left;
            margin: 5px;

            &:hover {
              transition: .3s;
              box-shadow: 0px 0px 1px 1px #000;     
            }
          }
        }

        .showcase-portadas{
          padding: 0px 10px;
          cursor: pointer;
          .mini-portada{
            transition: .5s ease-in-out;
            float: left;
            margin: 8px;
            height: 65px;
            width: 65px;
            background-size: 100%;
            background-position: cover;
            background-repeat: no-repeat;

            border-radius: 5px;
            border: 1px solid lightgray;

            
            &.portada-selected {
              transition: .5s ease-in-out;
              border-radius: 100%;
              box-shadow: 0px 0px 0px 5px black;
            }
          }
        }
      }

      .showcase-actions {
        justify-items: stretch;
      
        button {
          width: 100%;
          margin: 2px;
          color: black;
        }
      }
    }

    #order-by {
      display: grid;
      grid-template-columns: 60px 1fr 1fr 50px 3fr 50px;
      align-items: center;
      margin-top: 5px;

      .song-remove-checked {
        cursor: pointer;
        &:hover{
          color: rgb(0, 234, 255);
        }
      }
    }

    #playlist-editor {
      position: relative;
      height: 100%;
      padding-bottom: 100px;
      overflow-y: scroll;
      border-radius: 10px;
      border-top: 1px solid lightgray;
      box-shadow: inset 0px -5px 10px 0px rgba(0, 0, 0, 0.2);
   
      .song-row {
        display: grid;
        height: 40px;
        margin: 5px 0px;
        grid-template-columns: 60px 1fr 1fr 50px 50px 2fr 50px;
        align-items: center;

        border-bottom: 1px solid lightgray;

        .song-checkbox{
          margin-top: -10px;
        }

        .song-title, .song-artist{
          border-bottom: 2px solid transparent;
          margin-top: -7px;
          width: 95%;
        }

        .song-url {
          margin-top: -10px;
          cursor: pointer;
        }

        .song-album {
          background-size: 100%;
          background-repeat: no-repeat;
          margin-top: -15px;
          width: 40px;
          height: 40px;
        }

        .song-remove{
          cursor: pointer;

          &:hover{
            color: red;
          }
        }

        .song-tags{
          margin-top: -14px;
          height: 40px;
          overflow-y: scroll;
          &::-webkit-scrollbar { display: none;  }

          .tag{
            float: left;
            margin: 3px;
            font-size: 11px;
            padding: 0px 5px;
            height: 20px;

            display: flex;
            align-items: center;
            
            .song-tags-remove{
              transition: .2s;
              font-size: 12px;
              padding-left: 3px;

              filter: blur(2px);

              &:hover {
                transition: .2s;
                filter: blur(0px);
              }
            }

          }
        }
      }
    }

    #url-modal {
      position: absolute;
      border: 1px solid lightgray;
      width: 60%;
      height: 100px;
      padding: 20px;
      top: 50vh;
      left: 0;
      right: 0;
      margin: auto;
      z-index: 10;
      border-radius: 5px;
      background-color: white;

      .modal-title {
        font-weight: bold;
        font-size: 20px;
      }

      i {
        position: absolute;
        cursor: pointer;
        top: 5px;
        right: 10px;
      }
    }
  }

</style>