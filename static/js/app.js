// Scores and rounds
let currentRound = parseInt(localStorage.getItem('current_round')) || 1;
const maxRounds = 2; // Change this if you want more rounds
let player1TotalScore = parseInt(localStorage.getItem('player1_total_score')) || 0;
let player2TotalScore = parseInt(localStorage.getItem('player2_total_score')) || 0;

let currentPromptIndex = parseInt(localStorage.getItem('current_prompt_index')) || 0;
let promptType = localStorage.getItem('prompt_type') || null;

// Arrays for text prompts and image prompts
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

// Function to handle Spotify embed
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

// Function to add and calculate scores based on votes
function addScores() {
    const votesPlayer1 = parseInt(document.getElementById('votesPlayer1').value);
    const votesPlayer2 = parseInt(document.getElementById('votesPlayer2').value);

    if (isNaN(votesPlayer1) || isNaN(votesPlayer2)) {
        alert("Please enter valid votes for both players.");
        return;
    }

    const totalVotes = votesPlayer1 + votesPlayer2;

    const pointsPlayer1 = Math.round((votesPlayer1 / totalVotes) * 100);
    const pointsPlayer2 = Math.round((votesPlayer2 / totalVotes) * 100);

    // Update cumulative score for both players
    let player1TotalScore = parseInt(localStorage.getItem('player1_total_score')) || 0;
    let player2TotalScore = parseInt(localStorage.getItem('player2_total_score')) || 0;
    player1TotalScore += pointsPlayer1;
    player2TotalScore += pointsPlayer2;

    // Store cumulative scores in localStorage
    localStorage.setItem('player1_total_score', player1TotalScore);
    localStorage.setItem('player2_total_score', player2TotalScore);

    // Get and store prompt type in localStorage before redirecting
    const promptType = getQueryParam('promptType');
    if (promptType) {
        localStorage.setItem('prompt_type', promptType);
    }

    // Redirect to score_results.html with the promptType in the URL
    window.location.href = `/score_results?promptType=${promptType}`;
}



// Function to display scores on score_results.html
function displayScores() {
    const player1TotalScore = parseInt(localStorage.getItem('player1_total_score')) || 0;
    const player2TotalScore = parseInt(localStorage.getItem('player2_total_score')) || 0;

    document.getElementById('player1Score').innerText = `Player 1 Total Points: ${player1TotalScore}`;
    document.getElementById('player2Score').innerText = `Player 2 Total Points: ${player2TotalScore}`;
}

// Function to reset votes after each round
function resetVotes() {
    document.getElementById('votesPlayer1').value = '';
    document.getElementById('votesPlayer2').value = '';
}

// Function to start the next round
function goToNextRound() {
    resetVotes();

    // Increment prompt index and store it
    currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
    localStorage.setItem('current_prompt_index', currentPromptIndex);

    // Redirect back to Player 1 for the next round with the same prompt type
    window.location.href = `/person_one?promptType=${promptType}`;
}

// Function to update the prompt based on the round and prompt type
function updatePrompt(promptType) {
    let currentPromptIndex = parseInt(localStorage.getItem('current_prompt_index')) || 0;

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


// Store song and navigate to the next page
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
            localStorage.setItem(player + '_song', data.embed_url);
            window.location.href = nextPage; // Navigate to Player 2 or voting page
        } else {
            alert("Song not found!");
        }
    })
    .catch(error => console.error('Error fetching song:', error));
}

// Function to retrieve query parameters
// Function to start the next round
function nextRound() {
    // Increment the round
    let currentRound = parseInt(localStorage.getItem('current_round')) || 1;
    currentRound++;

    if (currentRound > maxRounds) {
        alert("Game over! Redirecting to final results.");
        window.location.href = '/final_results'; // Redirect to final results
    } else {
        // Increment prompt index and store it
        let currentPromptIndex = parseInt(localStorage.getItem('current_prompt_index')) || 0;
        currentPromptIndex = (currentPromptIndex + 1) % prompts.length; // Cycle through prompts

        // Store the updated round and prompt index in localStorage
        localStorage.setItem('current_round', currentRound);
        localStorage.setItem('current_prompt_index', currentPromptIndex);

        // Retrieve the prompt type from localStorage or ensure it is not null
        let promptType = localStorage.getItem('prompt_type');
        if (!promptType || promptType === 'null') {
            promptType = getQueryParam('promptType'); // Get from query parameter if missing
            if (promptType) {
                localStorage.setItem('prompt_type', promptType); // Save in localStorage
            } else {
                alert("Prompt type is missing!");
                return;
            }
        }

        // Redirect to Player 1 for the next round with the same prompt type and new prompt index
        window.location.href = `/person_one?promptType=${promptType}`;
    }
}

// Store the initial prompt type when the user selects it
function selectPromptType(type) {
    // Store the initial prompt type in localStorage
    localStorage.setItem('prompt_type', type);

    // Redirect to the first person with the selected prompt type
    window.location.href = `/person_one?promptType=${type}`;
}

// Helper function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}




function resetGame() {
    // Clear the scores, round, and prompt index from localStorage
    localStorage.removeItem('player1_total_score');
    localStorage.removeItem('player2_total_score');
    localStorage.removeItem('current_round');
    localStorage.removeItem('current_prompt_index');
    localStorage.removeItem('prompt_type');

    // Redirect to the prompt selection screen to start a new game
    window.location.href = '/choose_prompt'; 
}

function startGame() {
    // Clear all game-related localStorage items
    localStorage.removeItem('player1_total_score');
    localStorage.removeItem('player2_total_score');
    localStorage.removeItem('current_round');
    localStorage.removeItem('current_prompt_index');
    localStorage.removeItem('prompt_type');

    console.log('Local storage cleared. Starting new game...');

    // Redirect to the prompt selection page
    window.location.href = '/game_mode'; 
}