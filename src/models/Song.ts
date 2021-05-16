export interface Song {
    id: string,
    url: string,
    title: string,
    artist: string,
    tags: string[],
    portada: string[],
    playing: boolean,
    date: Date,
    isSong: boolean,
}

