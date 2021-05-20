export default function(darkMode) {
    const darkItems = ['#app', '#progress-bar-sound', '#progress-bar-sound-parent', '#current-durantion', 
                        '#total-durantion', '.stm-active', '.btn-hover', '#music-tool-bar', '.searcher',
                        '#Configuration', '.nav-title', '#playlist-editor', '#ConfigStudio'];

    darkItems.map( ( name ) => {
        const els = document.querySelectorAll(name);
        
        for(let x = 0; x < els.length; x++) {
            if(darkMode) els[x].classList.add('dark-mode');
            if(!darkMode) els[x].classList.remove('dark-mode');
        }
    })
    
}