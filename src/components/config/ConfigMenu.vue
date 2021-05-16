<template>
  <div id="ConfigMenu">
    <div class="config-menu-list"> 
        <ul>
            <li class="valign-wrapper" :class="{ activeMenu: isActive('Edit Playlist') }" @click="tagCreator('Edit Playlist')">
                <i class="material-icons"> chevron_right </i> 
                Editar Playlist
            </li>
            <li class="valign-wrapper" :class="{ activeMenu: isActive('Tag Creator') }" @click="tagCreator('Tag Creator')">
                <i class="material-icons"> chevron_right </i>  
                Creador de Tags 
            </li>
            <li class="valign-wrapper" :class="{ activeMenu: isActive('Cover Images') }" @click="tagCreator('Cover Images')">
                <i class="material-icons"> chevron_right </i>  
                Portadas
            </li>
            <li class="valign-wrapper" :class="{ activeMenu: isActive('General') }" @click="tagCreator('General')">
                <i class="material-icons"> chevron_right </i>  
                General 
            </li>
        </ul>
    </div>
  </div>
</template>

<script lang="ts">

import store from '@/store/store';

export default ({
    setup() {

        function tagCreator(title: string) {
            store.actions.setTitleStudio(title);
        }

        function isActive( type: string ) {
            return type === store.getters.titleStudio.value;
        }

        return {
            tagCreator, isActive
        }
    }
});
</script>

<style scoped lang="scss">
    .config-menu-list {
        font-size: 15px;
        text-align: left;
        padding: 30px;

        li {
            transition: .3s;
            cursor: pointer;
            height: 50px;

            &:hover {
                transition: .3s;
                padding: 5px;
            }
        }

        .activeMenu {
            font-weight: bold;
        }
    }

</style>