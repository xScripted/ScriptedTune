<template>
  <div id="player">

        <div id="progress-bar-sound-parent" @click="Player.selectSongMoment( $event )">
            <div id="info-song">
                <div id="song-portada" :style="{ backgroundImage: song.portada.value }"> </div>
                <div id="song-title"> {{ song.title.value }}</div>
                <div id="song-artist"> {{ song.artist.value }} </div>
            </div>
            <div :style="{ width: song.dynamicWidth.value }" id="progress-bar-sound"></div>
        </div>

        <div id="music-tool-bar">

            <div>
                <div id="current-durantion">{{ song.currentDuration.value }}</div>
            </div>

            <div class="btn-tool-bar btn-hover" @click="Player.lowcore" :class="[lowcoreActive]">
                <div id="btn-lowcore"></div>
            </div>
            
            <div class="btn-tool-bar btn-hover" @click="Player.shuffle" :class="[shuffleActive]">
                <i class="material-icons">shuffle</i>
            </div>
            
            <div class="btn-tool-bar btn-hover" @click="Player.prevSong">
                <i class="material-icons">skip_previous</i>
            </div>
            
            <div class="btn-tool-bar play-btn-wrap btn-hover">
                <i class="small material-icons play-btn" @play-this-song="Player.play()" @click="Player.play()">  {{ playPauseBtn }} </i>
            </div>
            
            <div class="btn-tool-bar btn-hover" @click="Player.nextSong">
                <i class="material-icons">skip_next</i>
            </div>
            
            <div class="btn-tool-bar btn-hover" @click="Player.loop" :class="[loopActive]">
                <i class="material-icons">loop</i>
            </div>
  
            <div class="btn-tool-bar btn-hover" @click="Player.nightcore" :class="[nightcoreActive]">
                <div id="btn-nightcore"></div>
            </div>
            
            <div>
                <div id="total-durantion">{{ song.totalDuration.value }}</div>
            </div>
            
        </div>

        <div id="volume-bar">
            <input type="range" min="0" max="100" value="50" v-on:input="Player.volume">
        </div>

        <div id="queue-mode">

            <i class="material-icons btn-hover" @click="showQueue = !showQueue">queue_music</i>
            <div class="switch">
                <label>
               
                <input type="checkbox" @click="Player.switchQueueMode()">
                <span class="lever"></span>

                </label>
            </div>
        </div>
        <transition name="fade">    
            <div v-if="showQueue" id="container-queue" class="z-depth-5">
                <div class="total-songs"> 
                    <span>{{ playlist.length }}</span> 
                    <i class="material-icons">library_music</i> 
                    <div class="total-songs-title"> {{ $t('player.queuetitle') }} </div>
                </div>
                <div class="queue-songs">
                    <div class="queue-song" draggable="true" 
                        @dragover="Playlist.allowDrop($event)" 
                        @drop="Playlist.drop($event, song)"
                        @dragstart="Playlist.drag($event, song)"
                        :key="song.id" v-for="song in playlist">
                        <div class="queue-song-portada" :style="{ backgroundImage: getPortada(song.portada[0]) }"> </div>
                        <div class="queue-song-title"> {{ song.title }} </div>
                        <div class="queue-song-artist"> {{ song.artist }} </div>
                        <i class="material-icons" @click="Playlist.removePlaylistSong([song.id])"> close </i>
                    </div>
                </div>
            </div>
        </transition>

  </div>
</template>


<script lang="ts">

    import { inject, ref } from 'vue';
    import { Howl } from 'howler';
    import store from '@/store/store';
    import { Portada } from '@/models/Portada';
    import Store from 'electron-store';
    import { ipcRenderer } from 'electron';

    export default {
        setup(){

            /* --- Variables --- */
            const emitter: any = inject('emitter');
            const formatTime: any = inject('formatTime');
            var oldSong = '';
            var shuffle = false;
            const database: any = new Store();

            // Player
            const loopActive = ref('');
            const shuffleActive = ref('');
            const nightcoreActive = ref('');
            const lowcoreActive = ref(''); 
            const showQueue = ref(false);
            const playPauseBtn = ref('play_circle_outline');
            const portadas = store.getters.portadaList;
            const playlist = store.getters.playlist;
            const queueMode = store.getters.queueMode;
            const rate = ref(1);
            const volume = ref(1);
            let nightcoreRate = 1.2;
            let lowcoreRate = 0.9;

            const song = {
                id: '',
                howl: {} as Howl,
                title: ref(''),
                artist: ref(''),
                portada: ref(''),
                currentDuration: ref('00:00'),
                totalDuration: ref('00:00'),
                dynamicWidth: ref('0%'),
            };

            // Computed
            const songList = store.getters.songListFilter;
            
            var songNumber = 0;

            function loadCoreRates() {
                //Get Rates
                let config = JSON.parse(database.get('STMusicConfig'));

                if(config.nightcore) {
                    nightcoreRate = config.nightcore; 
                }

                if(config.lowcore) {
                    lowcoreRate = config.lowcore; 
                }

                if(typeof(song.howl.rate) === 'function') {

                    if(nightcoreActive.value) { 
                        song.howl.rate( nightcoreRate );
                        rate.value = nightcoreRate;
                    }

                    if(lowcoreActive.value) {
                        song.howl.rate( lowcoreRate );
                        rate.value = lowcoreRate;
                    }
                }
            }

            loadCoreRates();

            ipcRenderer.on('reloadConfig', () => {
                loadCoreRates();
            })

            /* --- Functions Player --- */
            const Player = {

                // Music Tool Bar 
                play(songObj: any, songemitted = false) {
                  
                    if(oldSong && songemitted) store.actions.togglePlaying(oldSong, false);
                    
                    if(songemitted && Object.entries(song.howl).length != 0) {
                        song.howl.unload(); // Borrar cancion antigua
                        song.howl = {} as Howl; 
                    }

                    if(Object.entries(song.howl).length === 0) {
                        song.howl = new Howl({
                            src: ['safe-file-protocol://' + songObj.url],
                            volume: volume.value,
                            rate: rate.value,
                            onplay: function() {

                                oldSong = songObj.id;

                                song.totalDuration.value = formatTime(song.howl.duration());
                    
                                window.requestAnimationFrame(() => stepFunction()); // No funciona como esperaba *REVISAR*

                                song.id = songObj.id;
                                song.title.value = songObj.title;
                                song.artist.value = songObj.artist;
                                song.portada.value = getPortada(songObj.portada[0]);

                                store.actions.togglePlaying(songObj.id, true);
                            
                            },
                            onend: function() {

                                const listType = queueMode.value ? playlist.value : songList.value;

                                if(loopActive.value != '') return 0;

                                if(shuffle) {
                                    const randSong = Math.round(Math.random() * listType.length - 1);
                                    Player.play(listType[randSong], true);
                                    return 0;
                                } 

                                let index = newIndexSong(songObj.id, listType);

                                //Si esta en modo playlist toca la 0
                                if(queueMode.value) index = 0;

                                // Ejecuta la siguiente o 0
                                Player.play(listType[index], true);

                                // Borra la cancion de la playlist
                                if(queueMode.value) store.actions.removeToPlaylist([listType[index].id]);
                            }
                        });
                    } 

                    if(song.howl.playing() && !songemitted) {
                        playPauseBtn.value = 'play_circle_outline';
                        song.howl.pause();
                    } else {
                        playPauseBtn.value = 'pause_circle_outline';
                        song.howl.play();
                    }

                },
                prevSong() {

                    const listType = queueMode.value ? playlist.value : songList.value;

                    if(shuffle) {
                        songNumber = Math.round(Math.random() * (listType.length - 1));
                    } else {
                        songNumber = newIndexSong(song.id, listType, true);
                    }

                    //Si esta en modo playlist toca la 0
                    if(queueMode.value) songNumber = 0;
                    
                    Player.play( listType[songNumber], true);

                    // Borra la cancion de la playlist
                    if(queueMode.value) store.actions.removeToPlaylist([listType[songNumber].id]);
                },
                nextSong() {

                    const listType = queueMode.value ? playlist.value : songList.value;

                    if(shuffle) {
                        songNumber = Math.round(Math.random() * (listType.length - 1));
                    } else {
                        songNumber = newIndexSong(song.id, listType);
                    }

                    //Si esta en modo playlist toca la 0
                    if(queueMode.value) songNumber = 0;

                    if(listType.length > 0) Player.play( listType[songNumber], true);

                    // Borra la cancion de la playlist
                    if(queueMode.value) store.actions.removeToPlaylist([listType[songNumber].id]);
                },
                nightcore() {
                    if(Object.entries(song.howl).length != 0) {
                        var howlRate = song.howl.rate();
                        howlRate = howlRate <= 1 ? nightcoreRate : 1;
                        rate.value = howlRate;
                        song.howl.rate(howlRate);
                        nightcoreActive.value = howlRate <= 1 ? '' : 'stm-active';
                        lowcoreActive.value = nightcoreActive.value == 'stm-active' ? '' : '';
                    }
                },
                lowcore() {
                    if(Object.entries(song.howl).length != 0) {
                        var howlRate = song.howl.rate();
                        howlRate = howlRate >= 1 ? lowcoreRate : 1;
                        rate.value = howlRate;
                        song.howl.rate(howlRate);
                        lowcoreActive.value = howlRate >= 1 ? '' : 'stm-active';
                        nightcoreActive.value = lowcoreActive.value == 'stm-active' ? '' : '';
                    }
                },
                loop() {
                    if(Object.entries(song.howl).length != 0) {
                        var loop = !song.howl.loop();
                        song.howl.loop(loop);
                        loopActive.value = loop ? 'stm-active' : '';
                    }
                },
                selectSongMoment(event: any) {
                    var songMoment = (event.clientX / window.innerWidth * 100) * song.howl.duration() / 100;
                    song.howl.seek(songMoment);
                },
                volume(range: any) {
                    var vol = range.target.value / 100;
                    song.howl.volume(vol);
                    volume.value = vol;
                },
                shuffle() {
                    shuffle = !shuffle;
                    shuffleActive.value = shuffle ? 'stm-active' : '';
                },
                switchQueueMode() {
                    store.actions.setQueueMode(!queueMode.value)
                }
            }

            emitter.on('play-this-song', (songInfo: any) => {
                Player.play(songInfo.songObj, true);
                songNumber = songInfo.index;
            });

     
            function stepFunction() {
                const seek = song.howl.seek() as number;
                song.currentDuration.value = formatTime(song.howl.seek()); // Segundo actual de la canción
                song.dynamicWidth.value = (seek / song.howl.duration() * 100) + '%';
 
                if (song.howl.playing()) window.requestAnimationFrame(() => stepFunction());
            }

            function getPortada( id: string ){
        
                let url = '';

                portadas.value.map( ( portada: Portada) => {
                    if( portada.id === id) url = portada.url;
                })

                return `url('/img/${url}')`;
            }

            function newIndexSong( oldId: string, playlist: any[], prev = false) {

                let index = -1;

                // Busca la posicion donde se encuentra la cancion actual
                playlist.forEach( (arrSong: any, arrIndex: number) => {
                    if(arrSong.id === oldId) index = arrIndex;
                });

                // Si es la ultima canción vuelve a empezar por la 0
                index = (index >= playlist.length - 1) ? 0 : prev ? index - 1 : index + 1; 

                if(index === -1) index = 0;

                return index;
            }

            // Playlist functions
            const Playlist = {
                allowDrop(ev) {
                    ev.preventDefault();
                },
                drag(ev, dragSong) {
                    ev.dataTransfer.setData('dragSong', JSON.stringify(dragSong));
                },
                drop(ev, currentSong) {
                    ev.preventDefault();
                    const dragSong = JSON.parse(ev.dataTransfer.getData('dragSong'));
                    store.actions.reorderPlaylist(currentSong, dragSong);
                },

                removePlaylistSong(ids: string[]) {
                    store.actions.removeToPlaylist(ids);
                }
            }


            return {
                Player, song, stop, Playlist,
                playPauseBtn, shuffleActive,
                loopActive, nightcoreActive, showQueue,
                lowcoreActive, getPortada, playlist,
            };
        },
    };

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

    #progress-bar-sound-parent {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #ececec;

        #progress-bar-sound{
            transition: 0.1s;
            position: absolute;
            width: 0%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
        }
    }

    #music-tool-bar {
        display: grid;
        grid-template-columns: 50px 40px 40px 40px 50px 40px 40px 40px 50px;
        position: absolute;
        padding: 5px;
        height: 38px;
        width: 400px;
        bottom: 5px;
        left: 0;
        right: 0;
        margin: auto;
        user-select: none;

        .btn-tool-bar {
            transition: .2s;
            width: 30px;
            height: 30px;
            margin: 0px 2px;


            i {
                margin-top: 3px;
            }
        }

        .play-btn-wrap {
            width: 40px;
            height: 40px;
            margin-top: -5px;
        }

        .play-btn {
            margin-top: 0px !important;
            margin-left: -1px !important;
            font-size: 40px;
        }

        #btn-play, #btn-shuffle, #btn-next, #btn-prev, #btn-loop, #btn-nightcore, #btn-lowcore {
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-position: center;
        }

        #btn-lowcore {
            background-image: url('../assets/img/nightcore.png');
            background-size: 70%;
            background-position: center;
            filter: grayscale(80%);
        }

        #btn-nightcore {
            background-image: url('../assets/img/nightcore.png');
            background-size: 70%;
            background-position: center;
        }

        #current-durantion{
            position: relative;
            padding-top: 8px;
            font-size: 14px;
            color: rgb(44, 44, 44);
        }

        #total-durantion{
            text-align: center;
            position: relative;
            padding-top: 8px;
            font-size: 14px;
            color: rgb(44, 44, 44);
        }
    }

    #volume-bar { 
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        width: 100px;
        bottom: 50px;

        @include tablet {
            left: auto;
            margin: 0;
            right: 20px;
            bottom: 10px;
        }
    }
    
    #info-song{
        position: absolute;
        display: grid;
        grid-template-columns: 100px 1fr;
        grid-template-rows: 1fr 1fr;
        height: 100px;
        width: 400px;
        left: 0;
        right: 0;
        margin: auto;
        margin-top: 20px;
        font-family: 'Ubuntu';

        @include tablet {
            position: absolute;
            display: grid;
            grid-template-columns: 100px 1fr;
            grid-template-rows: 1fr 1fr;
            height: 100%;
            width: 250px;
            margin: 0;
        }

        @include desktop {
            width: 400px;
        }

        @include large {
            width: 600px;
        }

        #song-portada{
            grid-row: 1 / 3;
            width: 100px;
            height: 100px;
            background-size: 100%;
            background-position: center;
            background-repeat: no-repeat;
        }

            
        #song-title {            
            text-align: left;
            padding: 25px 0px 0px 20px;
            font-size: 20px;
            text-overflow: ellipsis;
            overflow: hidden; 
            white-space: nowrap;
        }

        #song-artist {
            text-align: left;
            padding: 5px 0px 0px 20px;
            font-size: 15px;
            font-weight: bold;
            text-overflow: ellipsis;
            overflow: hidden; 
            white-space: nowrap;
        }

        #song-img{
            border: 1px solid green;
            width: 100%;
        }
    }

    #queue-mode {
        display: flex;
        position: absolute;
        width: 100px;
        height: 30px;
        right: 20px;
        top: 10px;

        i {
            width: 30px;
            height: 30px;
            padding: 3px;
        }

        .switch{
            margin-top: 2px;
        }
    }

    #container-queue {
        position: absolute;
        top: -70vh;
        right: 1%;
        height: calc(80vh - 100px);
        width: 30%;
        border: 1px solid lightgray;
        border-radius: 5px;
        background-color: white;
        padding: 20px;
        padding-top: 50px;
        display: grid;
        grid-template-rows: 10px 1fr;

        .total-songs {
            margin-top: -35px;
            color: gray;
            text-align: left;
            font-size: 15px;
            display: flex;
            align-items: center;
            background-color: white;
            border-bottom: 1px solid lightgray;

            i {
                font-size: 25px;
            }

            .total-songs-title {
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                width: 100%;
            }
        }

        .queue-songs {
            overflow-y: scroll;
            cursor: grab;

            .queue-song {
                display: grid;
                grid-template-columns: 37px 1fr 1fr 30px;
                height: 50px;
                align-items: center;
                border-bottom: 1px solid;
            }

            .queue-song-title, .queue-song-artist {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis
            }

            .queue-song-portada { 
                width: 36px;
                height: 36px;
                background-size: 100%;
                border-radius: 100%;
                margin: 2px;
              
            }
        }
    }
</style>