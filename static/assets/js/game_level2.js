const startButton = document.getElementById('startBtn');
const gameboard = document.querySelector('.gameboard');
const beepSound = new Audio('../static/assets/audio/beep.mp3');

let gameStarted = false;
let Completed = false;
let problemIndex = 0; // Keep track of the current problem
let keyIndex = 1;
let userSequence = []; // To store the user's key presses
let canPressKey = false;


//let currentQuestion = 1;
//let score = 0;
//let incorrectCnt = 0;
//const incorrectLimit = 5;

const expectedSequences = [ // img, interval, showNum
    ['Beep', 1, 3],
    ['Beep', 2, 4]
];

startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  gameStarted = true; // The game has started once the button is clicked
  showProblem();
});

function wait_keyInput() {
    document.addEventListener('keydown', (event) => {
      if (gameStarted) {
        if (canPressKey) {
            if (event.key === 'Enter') {
              showPressedKey('Enter');
            }
        }
      }
    });
}

function showProblem() {
  // Show problem index and information message on separate lines
  const problemInfoContainer = document.createElement('div');
  problemInfoContainer.classList.add('problem-info-container', 'text-center');
  gameboard.appendChild(problemInfoContainer);

  // Add left and right arrow icons using Bootstrap Icons
  const problemIndexElement = document.createElement('div');
  problemIndexElement.innerHTML = `Problem ${problemIndex + 1}`;
  problemIndexElement.classList.add('problem-index');
  problemInfoContainer.appendChild(problemIndexElement);

  const infoMessage = document.createElement('div');
  infoMessage.textContent = 'Listen to the sounds and Press the \'Enter\' key in time interval.';
  infoMessage.classList.add('info-message');
  problemInfoContainer.appendChild(infoMessage);

  console.log(expectedSequences[problemIndex]);
  displayContent(expectedSequences[problemIndex]);
  wait_keyInput()

}
let start_time = new Date()
function displayContent(curr_problem) {
    const problemInfoContainer = document.querySelector('.problem-info-container');
    if (problemInfoContainer) {
        problemInfoContainer.remove();
    }

    const contentElement = document.createElement('div');
    var text = '';
    var count = 0;
    var display_interval = setInterval(function() {
        count++;
        text += curr_problem[0];
        contentElement.textContent = text;
        gameboard.appendChild(contentElement);
        console.log("Play beep sound");
        beepSound.play();
        if (count === curr_problem[2]) {
            clearInterval(display_interval);
            canPressKey = true
            start_time = new Date();
        }
    }, curr_problem[1] * 1000);
}

function showPressedKey(key) {
    let end_time = new Date()
    let timeDiff = end_time.getTime() - start_time.getTime();

    const displayElement = document.createElement('div');
    displayElement.textContent = `${key}` + ' ' + timeDiff/1000 + 'seconds';
    displayElement.classList.add('pressed-key');
    gameboard.appendChild(displayElement);

    // Add the key to the user's sequence
    userSequence.push(key);
    canPressKey = false;
}

function checkSequence() {
  const userSequenceString = userSequence.join(' ');
  const expectedSequenceString = expectedSequence.join(' ');

  // Check if the user's sequence matches the expected sequence
  if (userSequenceString === expectedSequenceString) {
    // If the sequences match, hide the displayed keys and show "Congratulations"
    clearPressedKeys();

    const congratsElement = document.createElement('div');
    congratsElement.textContent = 'Congratulations!';
    congratsElement.classList.add('congratulations');
    gameboard.appendChild(congratsElement);
    canPressKeys = false;
    sendScoreToBackend(score);

    // Reset the game after a delay (e.g., 3 seconds)
    setTimeout(() => {
      // Remove the "Congratulations" message
      congratsElement.remove();

      // Progress to the next problem
      problemIndex++;

      // Check if there are more problems
      if (problemIndex < expectedSequences.length) {
        // Set the expected sequence for the next problem
        expectedSequence = expectedSequences[problemIndex];

        // Reset keyIndex and userSequence for the new problem
        keyIndex = 1;
        userSequence = [];

        // Display the new problem
        hideStartButton();
        canPressKeys = true;
      } else {

        // If all problems are completed, show a final message or perform other actions
        gameCompleted();
      }
    }, 3000);
  } else {
    // If the sequences don't match, clear the displayed keys
    clearPressedKeys();

    // Create a container for the warning message and retry button
    const warningContainer = document.createElement('div');
    warningContainer.classList.add('warning-container', 'text-center'); // Center align content
    gameboard.appendChild(warningContainer);

    // Show a warning message
    const warningElement = document.createElement('div');
    warningElement.textContent = 'Wrong answer! Try again.';
    warningElement.classList.add('warning');
    warningContainer.appendChild(warningElement);
    canPressKeys = false;
    // Add a retry button with Bootstrap styles and center it
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2'); // Center using mx-auto
    retryButton.addEventListener('click', () => {
      // Clear the warning message, reset the game, and remove the retry button
      warningContainer.remove();
      resetGame();
    });
    warningContainer.appendChild(retryButton);
  }
}

function resetGame() {
  keyIndex = 1;
  userSequence = [];
  gameStarted = true; // Allow the user to press keys again
  hideStartButton(); // Display the information message again
  canPressKeys = true;
}

function clearPressedKeys() {
  const pressedKeys = document.querySelectorAll('.pressed-key');
  pressedKeys.forEach((key) => key.remove());
}



function sendScoreToBackend(score) {
  const xhr = new XMLHttpRequest();

  const endpoint = '/update_score';

  const formData = new FormData();
  formData.append('score', score);

  xhr.open('POST', endpoint, true);

  // Send the FormData object
  xhr.send(formData);
}