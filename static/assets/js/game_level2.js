const startButton = document.getElementById('startBtn');
const gameboard = document.querySelector('.gameboard');
const beepSound = new Audio('../static/assets/audio/beep.mp3');

let gameStarted = false;
let Completed = false;
let problemIndex = 0; // Keep track of the current problem
let keyIndex = 1;
let userInput = []; // To store the user's key presses
let canPressKey = false;
let check_flag = true
let start_time = new Date()
let score = 0;

//let currentQuestion = 1;
//let incorrectCnt = 0;
//const incorrectLimit = 5;


const problem_list = [ // img, interval, showNum
    ['Beep', [1, 3], 3],
    ['Clap', [1, 2, 1], 4]
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
    canPressKey = false;
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

    console.log(problemIndex, problem_list[problemIndex]);

    displayContent(problem_list[problemIndex]);
    wait_keyInput()
}

function displayContent(curr_problem) {
//    const problemInfoContainer = document.querySelector('.problem-info-container');
//    if (problemInfoContainer) {
//        problemInfoContainer.remove();
//    }

    const contentElement = document.createElement('div');
    var text = '';
    var curr_interval = curr_problem[1];

    for (let i = 0; i < curr_problem[2]; i++) {
        if (i==0) {
            text = curr_problem[0];
            contentElement.textContent = text;
            contentElement.classList.add('content-element');
            gameboard.appendChild(contentElement);
            beepSound.play();
        }
        else {
            setTimeout(() => {
                console.log(i)
                text += curr_problem[0];
                contentElement.textContent = text;
                contentElement.classList.add('content-element');
                gameboard.appendChild(contentElement);
                console.log('Play '+ curr_problem[0] + ' sound after ' + curr_interval[i-1]*1000 + 'seconds.');
                beepSound.play();
            }, curr_interval[i-1] * 1000); }
    }
    canPressKey = true;
}

function showPressedKey(key) {
    const problemInfoContainer = document.querySelector('.problem-info-container');
    if (problemInfoContainer) {
      problemInfoContainer.remove();
    }

    let pressed_time = new Date()
    const displayElement = document.createElement('div');
    displayElement.textContent = `${key}`;
    displayElement.classList.add('pressed-key');
    gameboard.appendChild(displayElement);

//    // Increment the index for the next key
//    keyIndex++;

    // Add the key to the user's sequence
    userInput.push(pressed_time.getTime());
    // Check if the user's sequence length matches the expected sequence length
    if (userInput.length === problem_list[problemIndex][2]) {
      // Check the sequence after a short delay (e.g., 500 milliseconds)
      canPressKey = false;
      setTimeout(checkSequence, 500);
    }
}

function checkSequence() {
    if (check_flag) {
        console.log(userInput[problemIndex])
        clearPressedKeys();
        var intervals = []
        console.log(userInput);
        for (let i = 1; i < userInput.length; i++) {
            var timeDiff = Math.round((userInput[i] - userInput[i-1]) / 1000);
            intervals.push(timeDiff);
        }
        console.log(intervals);
        console.log(JSON.stringify(problem_list[problemIndex][1]), JSON.stringify(intervals));
        const correct = JSON.stringify(problem_list[problemIndex][1]) === JSON.stringify(intervals);
        if (correct) {
            score++;
            const congratsElement = document.createElement('div');
            congratsElement.textContent = 'Congratulations!';
            congratsElement.classList.add('congratulations');
            gameboard.appendChild(congratsElement);
            sendScoreToBackend(score);

            // Reset the game after a delay (e.g., 3 seconds)
            setTimeout(() => {
            // Remove the "Congratulations" message
            congratsElement.remove();

            // Progress to the next problem
            problemIndex++;
            if (problemIndex < problem_list.length) {
//                keyIndex = 1;
                userInput = [];
                showProblem();
            }
            else {
                gameCompleted();
            }}, 3000);
        }
        else {
            // Create a container for the warning message and retry button
            const warningContainer = document.createElement('div');
            warningContainer.classList.add('warning-container', 'text-center'); // Center align content
            gameboard.appendChild(warningContainer);

            // Show a warning message
            const warningElement = document.createElement('div');
            warningElement.textContent = 'Wrong answer! Try again.';
            warningElement.classList.add('warning');
            warningContainer.appendChild(warningElement);

            // Add a retry button with Bootstrap styles and center it
            const retryButton 2= document.createElement('button');
            retryButton2.textContent = 'Retry';
            retryButton2.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2'); // Center using mx-auto
            retryButton2.addEventListener('click', () => {

            // Clear the warning message, reset the game, and remove the retry button
            warningContainer.remove();
            resetGame();
        });
        warningContainer.appendChild(retryButton2);
        }

    }
}

function gameCompleted() {
    const resultContainer = document.createElement('div');
    resultContainer.classList.add('result-container', 'text-center'); // Center align content
    gameboard.appendChild(resultContainer);

    // Show a warning message
    const resultElement = document.createElement('div');
    resultElement.textContent = 'SCORE ' + score;
    resultElement.classList.add('result');
    resultContainer.appendChild(resultElement);
}

function resetGame() {
  keyIndex = 1;
  userInput = [];
  gameStarted = true;
  showProblem();
  problemIndex = 0;
  score = 0;
  canPressKey = false;
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