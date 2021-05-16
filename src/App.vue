<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { provide, onMounted } from 'vue';
import store from '@/store/store';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

const database: any = new Store();

export default {
  setup() {

    provide('createuuid', () => {
      var dt = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (dt + Math.random()*16)%16 | 0;
          dt = Math.floor(dt/16);
          return (c=='x' ? r :(r&0x3|0x8)).toString(16);
      });
      return uuid;
    });

    provide('formatTime', (secs: number) => {
      var minutes = Math.floor(secs / 60) || 0;
      var seconds = Math.floor(secs - minutes * 60) || 0;
      return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    })  

    provide('prettyDate', (date: string) => {
      var d = new Date(date);
      return `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
    })

    function queryLocalStorage() {
      console.log('RELOAD DATA!');
      const storedSongs = database.get('STMusic');
      const storedTags = database.get('STMusicTags');
      const storedPortadas = database.get('STMusicPortadas');

      if(storedSongs) store.actions.setSongList(JSON.parse(storedSongs));
      if(storedTags) store.actions.setTagList(JSON.parse(storedTags));
      if(storedPortadas) store.actions.setPortadaList(JSON.parse(storedPortadas));

    }

    onMounted(() => {
      queryLocalStorage();
    });

    ipcRenderer.on('reloadData', () => queryLocalStorage());
    ipcRenderer.on('tags', () => store.actions.setTitleStudio('Tag Creator'));

  }
}

</script>
<style lang="scss">

body{
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

#nav {

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
