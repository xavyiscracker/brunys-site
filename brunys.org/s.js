const canvas=document.getElementById("stars");
const ctx=canvas.getContext("2d");
let w,h,stars=[];
function resize(){
    w=canvas.width=innerWidth;
    h=canvas.height=innerHeight;
    stars=[];
    for(let i=0;i<220;i++){
        stars.push({
            x:Math.random()*w,
            y:Math.random()*h,
            r:Math.random()*2,
            s:Math.random()*0.4+0.1,
            a:Math.random()
        });
    }
}
resize();
addEventListener("resize",resize);
function draw(){
    ctx.clearRect(0,0,w,h);
    for(const star of stars){
        star.y+=star.s;
        if(star.y>h){
            star.y=0;
            star.x=Math.random()*w;
        }
        star.a+=0.02;
        ctx.beginPath();
        ctx.fillStyle=`rgba(255,255,255,${
            .15+Math.sin(star.a)*.35
        })`;
        ctx.arc(star.x,star.y,star.r,0,Math.PI*2);
        ctx.fill();
    }
    requestAnimationFrame(draw);
}
draw();

const playlist=[
    { title:"The Love I Lost",  artist:"Fried By Flouride", src:"/assets/songs/theloveilost.mp3", cover:"/assets/images/album/fbf.jpeg" },
    { title:"2008",  artist:"wifiskeleton", src:"/assets/songs/2008.mp3",  cover:"/assets/images/album/2008.jpeg" }, 
    { title:"it’s like i’m not even here",  artist:"mthu", src:"/assets/songs/itslikeimnotevenhere.mp3",  cover:"/assets/images/album/mthu.jpeg" }, 
    { title:"stalk ur socials", artist:"s0rrow", src:"/assets/songs/stalkyoursocials.mp3",  cover:"/assets/images/album/sus.jpeg" }
];

const audio        = document.getElementById("audio");
const overlay       = document.getElementById("enterOverlay");
const enterLabel    = document.getElementById("enterLabel");
const trackCover     = document.getElementById("trackCover");
const trackName     = document.getElementById("trackName");
const trackArtist   = document.getElementById("trackArtist");
const playPauseBtn  = document.getElementById("playPauseBtn");
const prevBtn        = document.getElementById("prevBtn");
const nextBtn        = document.getElementById("nextBtn");
const replayBtn      = document.getElementById("replayBtn");
const volumeBar      = document.getElementById("volumeBar");
const progressBar    = document.getElementById("progressBar");
const curTimeEl      = document.getElementById("curTime");
const durTimeEl      = document.getElementById("durTime");

const STORAGE_KEY = "aboutme_player_state";

function loadState(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return null;
        return JSON.parse(raw);
    }catch(e){
        return null;
    }
}
function saveState(){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            trackIndex: currentIndex,
            time: audio.currentTime || 0,
            volume: audio.volume,
            everEntered: true
        }));
    }catch(e){  }
}

let saved = loadState();
let currentIndex = saved && playlist[saved.trackIndex] ? saved.trackIndex : 0;
let resumeTime    = saved ? (saved.time || 0) : 0;
let startVolume   = saved && typeof saved.volume === "number" ? saved.volume : 0.6;

volumeBar.value = startVolume;
audio.volume = startVolume;

enterLabel.textContent = (saved && saved.everEntered) ? "Click to Resume" : "Click to Enter";

function formatTime(t){
    if(!isFinite(t)) return "0:00";
    const m = Math.floor(t/60);
    const s = Math.floor(t%60).toString().padStart(2,"0");
    return `${m}:${s}`;
}

function loadTrack(index, autoplay){
    currentIndex = (index + playlist.length) % playlist.length;
    const track = playlist[currentIndex];
    audio.src = track.src;
    trackCover.src = track.cover || "";
    trackName.textContent = track.title;
    trackArtist.textContent = track.artist;
    progressBar.value = 0;
    curTimeEl.textContent = "0:00";
    durTimeEl.textContent = "0:00";
    if(autoplay){
        audio.play().catch(()=>{});
    }
    saveState();
}

function updatePlayPauseIcon(){
    playPauseBtn.textContent = audio.paused ? "▶" : "⏸";
}

overlay.addEventListener("click", ()=>{
    overlay.classList.add("hidden");
    loadTrack(currentIndex, false);
    audio.currentTime = resumeTime || 0;
    audio.play().catch(()=>{});
    updatePlayPauseIcon();
}, { once:true });

playPauseBtn.addEventListener("click", ()=>{
    if(!audio.src){
        loadTrack(currentIndex, true);
    }else if(audio.paused){
        audio.play().catch(()=>{});
    }else{
        audio.pause();
    }
});
audio.addEventListener("play", updatePlayPauseIcon);
audio.addEventListener("pause", updatePlayPauseIcon);

nextBtn.addEventListener("click", ()=>{
    loadTrack(currentIndex + 1, true);
});
prevBtn.addEventListener("click", ()=>{
    loadTrack(currentIndex - 1, true);
});

replayBtn.addEventListener("click", ()=>{
    audio.currentTime = 0;
    audio.play().catch(()=>{});
});

audio.addEventListener("ended", ()=>{
    loadTrack(currentIndex + 1, true);
});

audio.addEventListener("loadedmetadata", ()=>{
    durTimeEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", ()=>{
    if(audio.duration){
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
    curTimeEl.textContent = formatTime(audio.currentTime);
    saveState();
});
progressBar.addEventListener("input", ()=>{
    if(audio.duration){
        audio.currentTime = (progressBar.value/100) * audio.duration;
    }
});

volumeBar.addEventListener("input", ()=>{
    audio.volume = parseFloat(volumeBar.value);
    saveState();
});


setInterval(saveState, 3000);
window.addEventListener("beforeunload", saveState);

loadTrack(currentIndex, false);
if(resumeTime){
    audio.currentTime = resumeTime;
    progressBar.value = 0;
}