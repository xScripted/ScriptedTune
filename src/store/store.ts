import { reactive, computed } from 'vue';

import { Song } from '../models/Song';
import { Tag } from '../models/Tag';
import { Portada } from '@/models/Portada';
import Store from 'electron-store';

const database: any = new Store();

const state = reactive({
    songList: [] as Song[],
    songListFilter: [] as Song[],
    tagList: [] as Tag[],
    tagListFilter: [] as string[],
    tagAndOr: false,
    portadaList: [] as Portada[],
    searcherText: '',
    titleStudio: 'Edit Playlist',
    showHelp: false,
    playlist: [] as Song[],
    queueMode: false,
});

const getters = {
    songlist: computed(() => state.songList),
    songListFilter: computed(() => state.songListFilter),
    tagList: computed(() => state.tagList),
    portadaList: computed(() => state.portadaList),
    searcherText: computed(() => state.searcherText),
    titleStudio: computed(() => state.titleStudio),
    playlist: computed(() => state.playlist),
    queueMode: computed(() => state.queueMode),
    getTagById: (id: string) => state.tagList.find( (tag: Tag) => tag.id === id),
};

const actions = {

    //SETTERS
    setTagAndOr: ( isAndOr: boolean ) => state.tagAndOr = isAndOr,
    setSearcherText: ( text: string ) => state.searcherText = text,
    setTitleStudio: ( title: string ) => state.titleStudio = title, 
    setQueueMode: ( isQueueMode: boolean) => state.queueMode = isQueueMode,
    setSongList( data: Song[] ) {
        state.songList = state.songListFilter = data;
        database.set('STMusic', JSON.stringify(state.songList));
    },
    setTagList( data: Tag[], concat = false ) {
        state.tagList = concat ? state.tagList.concat(data) : data;
        database.set('STMusicTags', JSON.stringify(state.tagList));
    },
    setPortadaList( data: Portada[], concat = false ) {
        state.portadaList = data;
        database.set('STMusicPortadas', JSON.stringify(state.portadaList));
    },
    addPortada(portada: Portada) {
        state.portadaList.push(portada);
        database.set('STMusicPortadas', JSON.stringify(state.portadaList) );
    },
    addToPlaylist( song: Song ) {

        const exists = state.playlist.find( (plsong: Song) => plsong.id === song.id);
        if(!exists) state.playlist.push(song);
    },

    //REMOVES
    removeSongs( ids: string[] ) {
  
        // Bucle invertido para que splice no afecte al loop
        for(let i = (state.songList.length - 1); i >= 0; i--) {
            const exists = ids.find( (id: string) => state.songList[i].id === id);
            if(exists) state.songList.splice( i, 1 );
        }
        database.set('STMusic', JSON.stringify(state.songList));
    },
    removeSingleTagFromSong: ( idSong: string, idTag: string  ) => {
        state.songList.map( (song: Song) => {
            if( song.id === idSong ) {
                const indexTag = song.tags.indexOf(idTag);
                if(indexTag >= 0) song.tags.splice( indexTag, 1);
            }
        })

        database.set('STMusic', JSON.stringify(state.songList));
    },
    removePortada( id: string ) {
        for(let i = (state.portadaList.length - 1); i >= 0; i--) {
            if(state.portadaList[i].id === id) state.portadaList.splice( i, 1);
        }
        database.set('STMusicPortadas', JSON.stringify(state.portadaList));
    },
    removeTag( id: string ) {
        for(let i = (state.tagList.length - 1); i >= 0; i--) {
            if(state.tagList[i].id === id) state.tagList.splice( i, 1);
        }

        state.songList.map( (song: Song) => {
            const i = song.tags.indexOf(id); 
            if(i != -1) song.tags.splice( i, 1);
        })

        database.set('STMusic', JSON.stringify(state.songList));
        database.set('STMusicTags', JSON.stringify(state.tagList));
    },
    removeToPlaylist( ids: string[] ) {
        for(let i = (state.playlist.length - 1); i >= 0; i--) {
            const exists = ids.find( (id: string) => state.playlist[i].id === id);
            if(exists) state.playlist.splice( i, 1 );
        }
    },

    //UPDATE
    updateTag(tag: any) {

        let index = -1;

        state.tagList.forEach( ( el, i ) => el.id == tag.id.value ? index = i : index );

        state.tagList[index].name = tag.name.value;
        state.tagList[index].bgColor = tag.bgColor.value;
        state.tagList[index].textColor = tag.textColor.value;
        state.tagList[index].emoji = tag.emoji.value;

        database.set('STMusicTags', JSON.stringify(state.tagList));
    },
    updateSongInfo( updatedSong: Song) {

        state.songList.map( (song: Song, index) => {
            if(song.id === updatedSong.id) state.songList[index] = updatedSong;
        })

        database.set('STMusic', JSON.stringify(state.songList));  
    },

    //GENERAL
    showcaseToSongs: ( type: string, newInfo: string[], addRemove: string, idList: string[] ) => {
        if(type === 'tags' || type === 'portada') {

            state.songList.map( (song: Song) => {
                if(idList.includes(song.id)) {

                    if(addRemove == 'add') {
                        
                        newInfo.map( ( idInfo: string ) => {
                        
                            if(!song[type].includes(idInfo) && type === 'tags') song[type].push(idInfo);
                            if(!song[type].includes(idInfo) && type === 'portada') song[type][0] = idInfo;
                        })
                    }
                        
                    if(addRemove == 'remove') {
                        
                        newInfo.map( ( idInfo: string ) => {
                            if(song[type].includes(idInfo)) {
                                const index = song[type].indexOf(idInfo);
                                song[type].splice( index, 1);
                            }
                        })

                    }
                }
            })
                
        }
  
        database.set('STMusic', JSON.stringify(state.songList));  
    },
    tagListFilter(addRemove: string, idTag: string) {
        
        if( addRemove == 'add' && !state.tagListFilter.includes(idTag)) {
            state.tagListFilter.push(idTag);
        }

        if( addRemove == 'remove' && state.tagListFilter.includes(idTag) ) {
            const index = state.tagListFilter.indexOf(idTag);
            state.tagListFilter.splice( index, 1 );
        }

        actions.filterSongs();

        if(state.tagListFilter.length === 0) state.songListFilter = state.songList;
    },
    filterSongs() {

        state.songListFilter = state.songList.filter( (song: any) => {
            const hasTitle = song.title.toLowerCase().includes(state.searcherText.toLowerCase());
            const hasArtist = song.artist.toLowerCase().includes(state.searcherText.toLowerCase());
    
            let exists = true;
    
            if(state.tagListFilter.length > 0) {
                if(state.tagAndOr) { 
                    exists = state.tagListFilter.find( ( songTag: string) => song.tags.includes(songTag)) ? true : false;
                } else { 
                    exists = state.tagListFilter.every( ( songTag: string) => song.tags.includes(songTag))
                }    
            }

            return (hasTitle || hasArtist) && exists;
        });

    },
    togglePlaying(id: string, playing: boolean) {
        state.songList.forEach( (song: any) => {
          if(song.id === id) song.playing = playing;
        })
    },
    orderSongs( type: keyof Song, direction: boolean ) {
        
        const dir1 = direction ? 1 : -1;
        const dir2 = direction ? -1 : 1;
        
        state.songListFilter.sort( (song: Song, song2: Song) => song[type] > song2[type] ? dir1 : dir2 );
    },
    reorderPlaylist(currentSong: Song, dragSong: Song) {
        actions.removeToPlaylist([dragSong.id]);

        let index = -1;

        state.playlist.map( (song, i) => {
            if( song.id === currentSong.id) index = i;
        })

        if(index >= 0) state.playlist.splice(index, 0, dragSong);
    }
}

const store = { getters, actions };

export default store;