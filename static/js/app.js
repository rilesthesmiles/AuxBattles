// Scores and rounds
let player1Score = 0;
let player2Score = 0;
let rounds = 0;
const maxRounds = 5;

// Arrays for text prompts and image prompts
let prompts = [
    "Best Song for a Road Trip",
    "Best Party Song",
    "Best Song to Dance To",
    "Most Hated Song"
];
let promptImages = [
    "/static/pics/roadtrip.jpg",
    "/static/pics/campfire.jpg",
    "/static/pics/concert.jpg",
    "/static/pics/joe.jpg"
];

let currentPromptIndex = 0;
let promptType = null;



function selectPromptType(type) {
    // Redirect to spotify.html with the selected prompt type as a query parameter
    window.location.href = `/spotify?promptType=${type}`;
}




function getSpotifyEmbed(songInputId, artistInputId, embedContainerId) {
    const songName = document.getElementById(songInputId).value;
    const artistName = document.getElementById(artistInputId).value;
    if (songName === '') {
        alert("Please enter a song name!");
        return;
    }
    const requestBody = { song_name: songName };
    if (artistName !== '') requestBody.artist_name = artistName;
    fetch('/get_embed_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.embed_url) {
            document.getElementById(embedContainerId).innerHTML = `<iframe style="border-radius:12px" src="${data.embed_url}" width="250" height="330" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
        } else {
            alert("Song not found!");
        }
    })
    .catch(error => console.error('Error fetching song:', error));
}

function addScores() {
    const votesPlayer1 = parseInt(document.getElementById('votesPlayer1').value);
    const votesPlayer2 = parseInt(document.getElementById('votesPlayer2').value);

    if (isNaN(votesPlayer1) || isNaN(votesPlayer2)) {
        alert("Please enter valid votes for both players.");
        return;
    }

    const totalVotes = votesPlayer1 + votesPlayer2;

    const percentagePlayer1 = (votesPlayer1 / totalVotes) * 100;
    const percentagePlayer2 = (votesPlayer2 / totalVotes) * 100;

    player1Score += percentagePlayer1;
    player2Score += percentagePlayer2;

    document.getElementById('player1Score').innerText = Math.round(player1Score);
    document.getElementById('player2Score').innerText = Math.round(player2Score);

    rounds++;
    if (rounds === maxRounds) {
        determineWinner();
    } else {
        updatePrompt();
        resetVotes();
    }
}


function resetVotes() {
    document.getElementById('votesPlayer1').value = '';
    document.getElementById('votesPlayer2').value = '';
}

function determineWinner() {
    if (player1Score > player2Score) {
        document.getElementById('winnerMessage').innerText = "Player 1 Wins!";
    } else if (player2Score > player1Score) {
        document.getElementById('winnerMessage').innerText = "Player 2 Wins!";
    } else {
        document.getElementById('winnerMessage').innerText = "It's a Tie!";
    }

    // Reset game after determining winner
    resetGame();
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    rounds = 0;

    // Reset the displayed scores
    document.getElementById('player1Score').innerText = player1Score;
    document.getElementById('player2Score').innerText = player2Score;

    // Reset votes and prompts
    resetVotes();
    updatePrompt();
    
    // Hide winner message after a few seconds
    setTimeout(() => {
        document.getElementById('winnerMessage').innerText = '';
    }, 5000);
}



function goToPersonTwo() {
    const promptType = getQueryParam('promptType');
    window.location.href = `/person_two?promptType=${promptType}`;
}


function goToVoting() {
    const promptType = getQueryParam('promptType');
    window.location.href = `/voting?promptType=${promptType}`;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function updatePrompt(promptType) {
    const prompts = [
        "Best Song for a Road Trip",
        "Best Party Song",
        "Best Song to Dance To",
        "Most Hated Song"
    ];

    const promptImages = [
        "/static/pics/roadtrip.jpg",
        "/static/pics/campfire.jpg",
        "/static/pics/concert.jpg",
        "/static/pics/joe.jpg"
    ];

    // Just for now, use the first prompt for testing.
    let currentPromptIndex = 0;

    if (promptType === 'text') {
        document.getElementById('prompt').innerText = `Prompt: ${prompts[currentPromptIndex]}`;
        document.getElementById('prompt').classList.remove('hidden');
        document.getElementById('promptImage').classList.add('hidden');
    } else if (promptType === 'image') {
        document.getElementById('promptImage').src = promptImages[currentPromptIndex];
        document.getElementById('promptImage').classList.remove('hidden');
        document.getElementById('prompt').classList.add('hidden');
    }
}


function storeSongAndGoToNextPage(player, songInputId, artistInputId, embedContainerId, nextPage) {
    const songName = document.getElementById(songInputId).value;
    const artistName = document.getElementById(artistInputId).value;

    if (songName === '') {
        alert("Please enter a song name!");
        return;
    }

    const requestBody = { song_name: songName };
    if (artistName !== '') requestBody.artist_name = artistName;

    fetch('/get_embed_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.embed_url) {
            // Store the song's embed URL in localStorage
            localStorage.setItem(player + '_song', data.embed_url);

            // Navigate to the next page (Player 2 or Voting page)
            window.location.href = nextPage;
        } else {
            alert("Song not found!");
        }
    })
    .catch(error => console.error('Error fetching song:', error));
}
