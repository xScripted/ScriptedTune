<template>
  <div id="ConfigStudio">
    <transition name="fade">
      <ConfigStudioPlaylist v-if="titleStudio === 'Edit Playlist'"></ConfigStudioPlaylist>
    </transition>
    <transition name="fade">
      <ConfigStudioTag v-if="titleStudio === 'Tag Creator'"></ConfigStudioTag>
    </transition>
    <transition name="fade">
      <ConfigStudioCover v-if="titleStudio === 'Cover Images'"></ConfigStudioCover>
    </transition>
    <transition name="fade">
      <ConfigStudioGeneral v-if="titleStudio === 'General'"></ConfigStudioGeneral>
    </transition>
  </div>
</template>

<script lang="ts">

import store from '@/store/store';
import ConfigStudioPlaylist from '@/components/config/studio/ConfigStudioPlaylist.vue';
import ConfigStudioTag from '@/components/config/studio/ConfigStudioTag.vue';
import ConfigStudioCover from '@/components/config/studio/ConfigStudioCover.vue';
import ConfigStudioGeneral from '@/components/config/studio/ConfigStudioGeneral.vue';

export default ({
  components: {
    ConfigStudioPlaylist,
    ConfigStudioTag,
    ConfigStudioCover,
    ConfigStudioGeneral
  },
  setup() {

    const titleStudio = store.getters.titleStudio;

    return {
      titleStudio
    }
  }
});
</script>

<style scoped lang="scss">

  #ConfigStudio {
    overflow: hidden;
  }

  .nav-title {
    font-size: 20px;
    height: 50px;
    text-align: left;
  }
  

</style>