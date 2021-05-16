<template>
    <div id="playlist">


        <div id="order-by">
            <div id="songs-length"> {{ songList.length }} <i class="material-icons">library_music</i></div>
            <div id="order-by-title"  @click="orderSongs('title')"> Título <i class="material-icons"> {{ arrow.title.value }} </i> </div>
            <div id="order-by-artist" @click="orderSongs('artist')"> Artista <i class="material-icons"> {{ arrow.artist.value }} </i> </div>
            <div></div>
            <div></div>
            <div id="order-by-date" @click="orderSongs('date')"> Fecha <i class="material-icons"> {{ arrow.date.value }} </i> </div>
        </div>

        <div id="song-list">
            <div class="song-row" :key="song.id" v-for="(song, index) in songList" @click="playSong(song, index)">
                <div class="playing"> <i class="material-icons" v-if="song.playing">volume_up</i> </div>
                <div class="add-queue"> <i class="material-icons">add</i> </div>
                <div class="title"> {{ song.title }} </div>
                <div class="artist"> {{ song.artist }} </div>
                <div class="portada"> <div class="portada" :style="{ backgroundImage: getPortada( song.portada[0] )}"> </div>  </div>
                <div class="tags">
                    <div class="tag" :key="idTag" v-for="idTag of song.tags"
                        :style="{ backgroundColor: tagById(idTag).bgColor, color: tagById(idTag).textColor }"> 
                        {{ tagById(idTag).emoji + ' ' + tagById(idTag).name }} 
                    </div>    
                </div>
                <div class="creation-date"> {{ prettyDate(song.date) }}</div>
            </div>
        </div>

  </div>
</template>


<script lang="ts">

    import { inject, ref } from 'vue';
    import store from '@/store/store';
    import { Portada } from '@/models/Portada';
    import { Song } from '../models/Song';

    export default {
        setup(){
            const emitter: any = inject('emitter');
            const prettyDate = inject('prettyDate');
            const songList = store.getters.songListFilter;
            const portadas = store.getters.portadaList;
            var toggleOrder: any = { title: true, artist: true }
            var checked = ref(false);
            const arrow = {
                title: ref(''),
                artist: ref(''),
                date: ref('')
            }

            function playSong(songObj: any, index: number) {
                emitter.emit('play-this-song', { songObj, index });
            }

            function getPortada( id: string ){
        
                let url = '';

                portadas.value.map( ( portada: Portada) => {
                    if( portada.id === id) url = portada.url;
                })

                return `url('/img/${url}')`;
            }

            function orderSongs(type: keyof Song) {
                var direction = toggleOrder[type] = !toggleOrder[type]; 
                store.actions.orderSongs( type );

                // Arrow
                if( type == 'title') {
                    arrow.title.value = direction ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
                    arrow.date.value = '';
                    arrow.artist.value = '';
                }

                if( type == 'artist') {
                    arrow.artist.value = direction ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
                    arrow.date.value = '';
                    arrow.title.value = '';
                }
                
                if( type == 'date') {
                    arrow.date.value = direction ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
                    arrow.artist.value = '';
                    arrow.title.value = '';
                }
            }

            function tagById(id: string) {
                return store.actions.getTagById(id);
            }

            return {
                 playSong, orderSongs, arrow, checked, prettyDate, songList, tagById, getPortada
            }
        }
    };

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

    #playlist{
        padding: 0px 20px;
    }

    #order-by {
        height: 70px;
        width: 100%;
        margin: auto;
        cursor: pointer;
        padding-top: 10px;
        color: rgb(182, 182, 182);
        user-select: none;
        display: grid;
        grid-template-columns: 40px 40px 1fr 1fr 40px 2fr 100px;
        
        border-bottom: 1px solid lightgray;
        box-shadow: 0px 2px 2px -2px lightgray;

        i {
            position: absolute;
            margin-top: -1px;
            margin-left: 5px;
        }

        #order-by-title, #order-by-artist, #order-by-date, #songs-length {
            text-align: left;
            padding-top: 24px;
            padding-left: 10px;
            width: 100%;
        }

        #songs-length{
            grid-column: 1 / 3;
        }

    }



    #song-list{
        height: 100%;
        padding-bottom: 100px;
        overflow: scroll;

                /* Hide scrollbar for Chrome, Safari and Opera */
        &::-webkit-scrollbar {
            display: none;
        }
        
        .song-row{
            cursor: pointer;
            border-bottom: 1px solid lightgray;
            width: 100%;
            margin: auto;
            height: 40px;
            display: grid;
            grid-template-columns: 40px 40px 1fr 1fr 40px 2fr 100px;
            
            .title, .artist, .creation-date {
                font-family: 'Ubuntu';
                text-align: left;
                padding-left: 10px;
                padding-top: 8px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .portada{
                width: 40px;
                height: 40px;
                background-size: 100%;
                background-position: center;
            }

            .playing, .add-queue {
                padding-top: 8px;
            }

            .tags {
                overflow-y: scroll;

                &::-webkit-scrollbar { display: none;  }

                .tag{
                    float: left;
                    margin-left: 7px;
                    margin-top: 10px;
                    font-size: 10px;
                    padding: 1px 2px;
                    height: 20px;
                }
            }

            .creation-date {
                color: lightgray;
            }
        }   


    }
</style>