const startButton = document.getElementById('startBtn');
const gameboard = document.querySelector('.gameboard');
let keyIndex = 1;
let problemIndex = 0; // Keep track of the current problem
let currentQuestion = 1;
let gameStarted = false;
let score = 1;
let expectedSequences = [
  ['left','left','right','left'], // Problem 1
  ['right', 'left', 'left', 'right','left'], // Problem 2
  ['right', 'left','right', 'left', 'right','right']
  // Add more problems as needed
];
let level1Completed = false;

let userSequence = []; // To store the user's key presses

const dogBarkSound = new Audio('../static/assets/audio/dog.mp3');
const catMeowSound = new Audio('../static/assets/audio/cat.mp3');

function playSound(problem) {
  for (let i = 0; i < problem.length; i++) {
    if (problem[i] == 'left') {
      setTimeout(() => {
        console.log("Play dog bark sound");
        dogBarkSound.play();  // Play the dog bark sound
      }, i * 1200);  // Play with a 3-second interval
    } else if (problem[i] == 'right') {
      setTimeout(() => {
        console.log("Play cat meow sound");
        catMeowSound.play();  // Play the cat meow sound
      }, i * 1200);  // Play with a 3-second interval
    }
  }
}





function hideStartButton() {
  startButton.style.display = 'none';
  gameStarted = true; // The game has started once the button is clicked

  // Show problem index and information message on separate lines
  const problemInfoContainer = document.createElement('div');
  problemInfoContainer.classList.add('problem-info-container', 'text-center');
  gameboard.appendChild(problemInfoContainer);

  // Add left and right arrow icons using Bootstrap Icons
  const problemIndexElement = document.createElement('div');
  problemIndexElement.innerHTML = `Problem ${problemIndex + 1}`;
  problemIndexElement.classList.add('problem-index');
  problemInfoContainer.appendChild(problemIndexElement);

  console.log(expectedSequences[problemIndex]);
  playSound(expectedSequences[problemIndex]) // Play the sound for the current problem

  const infoMessage = document.createElement('div');
  infoMessage.textContent = 'Listen to the sounds and Press the correct keys in order.';
  infoMessage.classList.add('info-message');
  problemInfoContainer.appendChild(infoMessage);


  const infoMessage2 = document.createElement('div');
  infoMessage2.innerHTML = `'<strong><span class="bi bi-arrow-left"></span></strong>' Key for Dog '<strong><span class="bi bi-arrow-right"></span></strong>' Key for Cat`;
  infoMessage2.classList.add('info-message');
  problemInfoContainer.appendChild(infoMessage2);

  // Set the expected sequence for the current problem
  expectedSequence = expectedSequences[problemIndex];
}
let canPressKeys = true;
function showPressedKey(key) {
if (canPressKeys) {
  if (gameStarted) {
    // Remove problem index and information message
    const problemInfoContainer = document.querySelector('.problem-info-container');
    if (problemInfoContainer) {
      problemInfoContainer.remove();
    }

    const displayElement = document.createElement('div');
    displayElement.textContent = `${key}`;
    displayElement.classList.add('pressed-key');
    gameboard.appendChild(displayElement);

    // Increment the index for the next key
    keyIndex++;

    // Add the key to the user's sequence
    userSequence.push(key);

    // Check if the user's sequence length matches the expected sequence length
    if (userSequence.length === expectedSequence.length) {
      // Check the sequence after a short delay (e.g., 500 milliseconds)
      setTimeout(checkSequence, 500);
    }
  }
  }
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

document.addEventListener('keydown', (event) => {
  if (gameStarted) {
    if (event.key === 'ArrowLeft') {
      showPressedKey('left');
    } else if (event.key === 'ArrowRight') {
      showPressedKey('right');
    }
  }
});

startButton.addEventListener('click', () => {
  hideStartButton();
});

function sendScoreToBackend(score) {
  const xhr = new XMLHttpRequest();

  const endpoint = '/update_score';

  const formData = new FormData();
  formData.append('score', score);

  xhr.open('POST', endpoint, true);

  // Send the FormData object
  xhr.send(formData);
}