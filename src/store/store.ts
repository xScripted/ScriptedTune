import { reactive, computed, inject } from 'vue';

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
    showHelp: false
});

const getters = {
    songlist: computed(() => state.songList),
    songListFilter: computed(() => state.songListFilter),
    tagList: computed(() => state.tagList),
    portadaList: computed(() => state.portadaList),
    searcherText: computed(() => state.searcherText),
    titleStudio: computed(() => state.titleStudio),
};

interface Type {
    title: string,
    artist: string,
    date: string
}

const actions = {
    setSongList: ( data: Song[] ) => {
        state.songList = state.songListFilter = data;
        database.set('STMusic', JSON.stringify(state.songList));
    },
    setTagList: ( data: Tag[], concat = false ) => {
        state.tagList = concat ? state.tagList.concat(data) : data;
        database.set('STMusicTags', JSON.stringify(state.tagList));
    },
    setPortadaList: ( data: Portada[], concat = false ) => {
        state.portadaList = data;
        database.set('STMusicPortadas', JSON.stringify(state.portadaList));
    },
    setTagAndOr: ( isAndOr: boolean ) => state.tagAndOr = isAndOr,
    setSearcherText: ( text: string ) => state.searcherText = text,
    setTitleStudio: ( title: string ) => state.titleStudio = title, 
    updateTag: (tag: any) => {

        let index = -1;

        state.tagList.forEach( ( el, i ) => el.id == tag.id.value ? index = i : index );

        state.tagList[index].name = tag.name.value;
        state.tagList[index].bgColor = tag.bgColor.value;
        state.tagList[index].textColor = tag.textColor.value;
        state.tagList[index].emoji = tag.emoji.value;

        database.set('STMusicTags', JSON.stringify(state.tagList));
    },
    showcaseToSongs: ( type: string, newInfo: string[], addRemove: string, idList: string[] ) => {

        if(type === 'tags' || type === 'portada') {

            state.songList.map( (song: Song) => {
                if(idList.includes(song.id)) {

                    if(addRemove == 'add') {
                        
                        newInfo.map( ( idInfo: string ) => {
                            console.log(song[type], idInfo, song[type].includes(idInfo));
                            if(!song[type].includes(idInfo) && type === 'tags') song[type].push(idInfo);
                            if(!song[type].includes(idInfo) && type === 'portada') song[type][0] = idInfo;
                        })
                    }
                        
                    if(addRemove == 'remove') {
                        console.log(song[type], newInfo);
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
    getTagById: (id: string) => state.tagList.find( (tag: Tag) => tag.id === id),
    removeSongs: ( ids: string[] ) => {
  
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
    activeTagFilter: () => {
        //state.songListFilter = state.songList.filter() 
    },
    tagListFilter: (addRemove: string, idTag: string) => {
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
    filterSongs: () => {

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
    togglePlaying: (id: string) => {
        state.songList.forEach( (song: any, index: number) => {
          if(song.id === id) song.playing = !song.playing;
        })
    },
    addPortada: (portada: Portada) => {
        state.portadaList.push(portada);
        database.set('STMusicPortadas', JSON.stringify(state.portadaList) );
    },
    orderSongs( type: keyof Song ) {
        state.songListFilter.sort( (song: Song) => song[type] > song[type] ? 1 : -1 );
    }
};

const store = { getters, actions };

export default store;

