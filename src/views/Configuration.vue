<template>
  <div id="Configuration">
    <div class="nav-title valign-wrapper"> <i class="material-icons"> settings </i> Configuration </div>
    <ConfigMenu></ConfigMenu>
    <ConfigStudio></ConfigStudio>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import ConfigMenu from '@/components/config/ConfigMenu.vue';
import ConfigStudio from '@/components/config/ConfigStudio.vue';

export default ({
  components: {
    ConfigMenu,
    ConfigStudio
  },
  setup() {

    ipcRenderer.on('tagxs', () => {
      console.log('TAGS');
    })

    return {

    }
  }
});
</script>

<style scoped lang="scss">

  #Configuration {
    display: grid;
    height: 100vh;
    grid-template-columns: 1fr 5fr;
    grid-template-rows: 50px 1fr;
  }

  #ConfigStudio {
    padding: 20px;
    border-left: 1px solid lightgray;
  }

  .nav-title {

    i {
      padding-right: 10px;
    }

    grid-column: 1 / 3;
    font-size: 20px;
    height: 50px;
    padding-left: 20px;
    text-align: left;
    background-color: $main-color;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  }

</style>