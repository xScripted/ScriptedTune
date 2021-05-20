<template>
    <div class="searcher">
        <div class="input-field col s6">
          <input :placeholder="$t('searcher')" @input="searcher($event.target.value)" type="text" class="validate">
        </div>
    </div>
</template>

<script lang="ts">

import store from '@/store/store';

export default {
    
    setup() {
        
        function searcher(searcherText: string) {  
            store.actions.setSearcherText(searcherText);
            store.actions.filterSongs();
        }

        return {
            searcher
        };
    }
}

</script>

<style scoped lang="scss">

</style>
