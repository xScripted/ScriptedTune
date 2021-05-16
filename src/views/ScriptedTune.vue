<template>
  <div id="ScriptedTune">
    <Settings></Settings>
    <Playlist></Playlist>
    <Player></Player>
    <Help v-show="showHelp"></Help>
    <div id="app-version">
      v1.0
    </div>
    <div id="helper" class="btn-hover" @click="showHelp = !showHelp">
      <i class="material-icons"> help_outline </i>
    </div>
    <div id="configuration" @click="openConfigurationWindow" class="btn-hover">
      <i class="material-icons"> settings </i>
    </div>
  </div>
</template>

<script lang="ts">

import { ipcRenderer } from 'electron';
import { ref, provide } from 'vue';
import Playlist from '@/components/Playlist.vue'; // @ is an alias to /src
import Player from '@/components/Player.vue'; // @ is an alias to /src
import Settings from '@/components/Settings.vue'; // @ is an alias to /src
import Help from '@/components/Help.vue'; // @ is an alias to /src

export default ({
  components: {
    Playlist,
    Player,
    Settings,
    Help
  },
  setup() {

    const showHelp = ref(false);


    function openConfigurationWindow() {
      ipcRenderer.send('configurationIpc');
    }

    return {
      openConfigurationWindow, showHelp
    }

  }
});
</script>

<style scoped lang="scss">
  #ScriptedTune{
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;

    #configuration, #helper, #app-version {
      position: absolute;
      right: 5px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      top: 5px;

      i {
        margin-top: 3px;
      }
    }

    #helper {
      right: 40px;
    }

    #app-version {
      right: 80px;
      top: 13px;
      font-size: 10px;
      color: rgb(182, 182, 182);
    }

    #settings, #playlist {
      display: none;
      overflow: hidden;
    }

    @include tablet {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 5fr 100px;

      #settings {
        display: grid;
      }

       #playlist { 
         display: block;
       }
    }

    @include large {
      grid-template-columns: 25% 75%;
      grid-template-rows: 1fr 100px;

      #player {
        grid-column-start: 1;
        grid-column-end: span 4;
      }
    }

    #player {
      position: relative;
      cursor: pointer;
    }

  }



</style>