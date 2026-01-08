let currFolder;

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")
    console.log(as);

    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // Extract just the filename from the full URL
            songs.push(element.href.split("/").pop())
        }
    }
    return songs;
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    seconds = Math.floor(seconds);

    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;

    if (secs < 10) secs = "0" + secs;

    return `${mins}:${secs}`;
}


let current_song = new Audio();

function playMusic(track, pause=false) {
    if (!track) {
        console.error("No track provided to playMusic");
        return;
    }
    current_song.src= `/${currFolder}/` + track
    if(!pause){
        current_song.pause()
        document.getElementById("play").src="imgs/play.svg"
    }
    
    
    document.querySelector(".songinfo").innerHTML=track.replaceAll("%20", " ").replace(".mp3", "")
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

async function main() {
    let songs = await getsongs("music/morning_coffe")  // Fixed: using correct folder name
    console.log(songs);

    if (songs.length > 0) {
        playMusic(songs[0])
    } else {
        console.error("No songs found in the directory");
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        let song_display_name = song.replaceAll("%20", " ").replace(".mp3", "")
        songUL.innerHTML = songUL.innerHTML + `
        <li data-song-path="${song}">
                            <img class="album" src="imgs/isolatio_waltz.jpg" alt="">
                            <div class="info">
                                <div>${song_display_name}</div> 
                                <div class="artist_name"></div>
                            </div>
                            <img class="invert" src="imgs/play.svg" alt="">
                        </li> 
        </li>`
    }

    songs = document.querySelector(".songlist").getElementsByTagName("li")
    for (const song of songs) {
        song.addEventListener("click", () => {
            let songPath = song.getAttribute("data-song-path")
            playMusic(songPath)
            console.log(song.getElementsByClassName("info")[0].innerText)
        })
    }

    document.getElementById("play").addEventListener("click", () => {
        if(current_song.paused){
            current_song.play()
            document.getElementById("play").src="imgs/pause.svg"
        }else{
            current_song.pause()
            document.getElementById("play").src="imgs/play.svg"
        }
    }) 

    current_song.addEventListener("timeupdate", () => {
        current_time=formatTime(current_song.currentTime)
        console.log(current_time)
        document.querySelector(".songtime").innerHTML=`${current_time} / ${formatTime(current_song.duration)}`
        document.querySelector(".circle").style.left=(current_song.currentTime/current_song.duration)*100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e =>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width) *100;
        document.querySelector(".circle").style.left= 
        current_song.currentTime=((current_song.duration) * percent)/100
    })

    document.querySelector(".hamburger").addEventListener("click", () =>{
        document.querySelector(".left").style.left="0"
        document.querySelector("body").addEventListener("click", e =>{
            if(!e.target.classList.contains("left") && !e.target.classList.contains("hamburger") ){
                document.querySelector(".left").style.left="-120%"
            }
        } )
    } )

    document.getElementById("previous").addEventListener("click", () => {
         console.log("clicked");
        let songArray = Array.from(songs);
        let currentFileName = current_song.src.split("/").pop();
        let index = songArray.findIndex(song => {
            let songPath = song.getAttribute("data-song-path");
            return songPath && songPath.includes(currentFileName);
        });
        if ((index - 1) >= 0) {
            playMusic(songArray[index - 1].getAttribute("data-song-path"));
        }
    })

    document.getElementById("next").addEventListener("click", () => {
        console.log("clicked");
        let songArray = Array.from(songs);
        let currentFileName = current_song.src.split("/").pop();
        let index = songArray.findIndex(song => {
            let songPath = song.getAttribute("data-song-path");
            return songPath && songPath.includes(currentFileName);
        });
        if ((index + 1) < songArray.length) {
            playMusic(songArray[index + 1].getAttribute("data-song-path"));
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e =>{
        current_song.volume=e.target.value
        if(current_song.volume==0){
            document.querySelector(".mute").style.display="block"
            document.querySelector(".volme_img img").style.display="none"
        }else{
            document.querySelector(".mute").style.display="none"
            document.querySelector(".volme_img img").style.display="block"
        }
    })

    //Loading the playlist
    Array.from(document.querySelectorAll(".card")).forEach(e =>{
        e.addEventListener("click", async item => {
            let newSongs = await getsongs(`music/${item.currentTarget.dataset.folder}`)
            
            // Clear existing songs from the UI
            let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
            songUL.innerHTML = `<li>
                            <div class="info">
                                <div class="song_name"></div>
                                <div class="artist_name"></div>
                            </div>
                        </li>`
            
            // Populate new songs
            for (const song of newSongs) {
                let song_display_name = song.replaceAll("%20", " ").replace(".mp3", "")
                songUL.innerHTML = songUL.innerHTML + `
        <li data-song-path="${song}">
                            <img class="album" src="imgs/isolatio_waltz.jpg" alt="">
                            <div class="info">
                                <div>${song_display_name}</div> 
                                <div class="artist_name"></div>
                            </div>
                            <img class="invert" src="imgs/play.svg" alt="">
                        </li>`
            }
            
            // Update the songs variable to point to new DOM elements
            songs = document.querySelector(".songlist").getElementsByTagName("li")
            
            // Re-attach click listeners to new song elements
            for (const song of songs) {
                song.addEventListener("click", () => {
                    let songPath = song.getAttribute("data-song-path")
                    if (songPath) {
                        playMusic(songPath)
                        console.log(song.getElementsByClassName("info")[0].innerText)
                    }
                })
            }
            
            // Auto-play first song if available
            if (newSongs.length > 0) {
                playMusic(newSongs[0])
            }
        })
    })

}

main()