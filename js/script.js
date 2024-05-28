console.log("JavaScript begins here");
let currentSong = new Audio();
let songs;
let curFolder;

async function getsongs(folder) {
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  curFolder = folder;
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  // get the songs in console
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // add song in the library
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Arjit Singh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
  }
  // Attack a event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
  return songs
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${curFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00.00 / 00.00";
};
function secondsToMinutes(seconds) {
  // Calculate minutes and remaining seconds
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  // Format minutes and seconds to be two digits
  let formattedMinutes = minutes.toString().padStart(2, "0");
  let formattedSeconds = remainingSeconds.toFixed(2).padStart(5, "0");

  // Combine formatted minutes and seconds
  return `${formattedMinutes}/${formattedSeconds}`;
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchor);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      //    Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
        <img src="/songs/${folder}/cover.jpg" alt="">
        <h2>${response.title} </h2>
        <p>${response.discription}</p>
        <div class="play">
            <img src="img/play.svg" alt="">
        </div>
    </div>`;
    }
  }

  // Load the PlayList whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      console.log(item.target, item.currentTarget.dataset);
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // get the list of all the songs
  await getsongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the album in the display
  displayAlbums();

  // Attach an event listener to play
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });
  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )}:${secondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add eventlistener to  humburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // Add eventListener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left ").style.left = "-120%";
  });

  // Add eventListener to previous and next
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("previous song=" + currentSong.src);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    // currentSong.pause();
    console.log("next song=" + currentSong.src);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
   
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
    if((index+1)==songs.length){
        playMusic(songs[0]);
    }
  });

  //  Add eventListener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log("Setting voulume=" + e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listener to mute the music
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = .1;
      
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });

}
main();
