const startButton2 = document.getElementById('startBtn2');
//const gameboard = document.querySelector('.gameboard');
const beepSound = new Audio('../static/assets/audio/beep.mp3');

function set_variable(){
    gameStarted = false;
    Completed = false;
    problemIndex = 0; // Keep track of the current problem
    keyIndex = 1;
    userInput = []; // To store the user's key presses
    canPressKey = false;
    check_flag = true
    start_time = new Date()
    score = 0;
    dev = 2;
}

//let currentQuestion = 1;
//let incorrectCnt = 0;
//const incorrectLimit = 5;


const problem_list = [ // img, interval, showNum
//    ['Beep', [0, 1, 3], 3],
    ['Beep', [0, 1, 2, 3], 3]
];

startButton2.addEventListener('click', () => {
  startButton2.style.display = 'none';
  set_variable()
  gameStarted = true; // The game has started once the button is clicked
  showProblem();
//    removeContent();
});

let keyInputListener;

function wait_keyInput() {
    if (keyInputListener) {
        document.removeEventListener('keydown', keyInputListener);
    }

    keyInputListener = (event) => {
        if (gameStarted) {
            if (canPressKey) {
                if (event.key === 'Enter') {
                    showPressedKey2('Enter');
                }
            }
        }
    };
    document.addEventListener('keydown', keyInputListener);
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
//    displayContent(problem_list[problemIndex]);

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
        setTimeout(() => {
            console.log(i)
            text += curr_problem[0];
            console.log('Play '+ curr_problem[0] + ' sound after ' + curr_interval[i-1]*1000 + 'seconds.');
            beepSound.play();
//            beepSound.stop();
        }, curr_interval[i] * 1000);
    }
    canPressKey = true;
}

function showPressedKey2(key) {
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
      setTimeout(checkSequence2, 2000);
    }
}

function checkSequence2() {
    if (check_flag) {
        console.log(userInput.length)
        clearPressedKeys();
        var intervals = [0]
        console.log(userInput);
        for (let i = 1; i < userInput.length; i++) {
            var timeDiff = (userInput[i] - userInput[i-1]) / 1000;
            intervals.push(timeDiff);
        }
        console.log(intervals);
        var correct = true;
        for (var i = 0; i < intervals.length; i++) {
            if (correct) {
                min_dev = problem_list[problemIndex][1][i] - dev;
                max_dev = problem_list[problemIndex][1][i] + dev;
                console.log(min_dev, max_dev)
                if (intervals[i] <= min_dev || intervals[i] >= max_dev) {
                    correct = false;
                }
            }
        }

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
            const retryButton2= document.createElement('button');
            retryButton2.textContent = 'Retry';
            retryButton2.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2'); // Center using mx-auto
            retryButton2.addEventListener('click', () => {

            // Clear the warning message, reset the game, and remove the retry button
            warningContainer.remove();
//            const problemInfoContainer = document.querySelector('.pressed-key');
//            problemInfoContainer.remove();
            resetGame2();
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

function resetGame2() {
  keyIndex = 1;
  userInput = [];
  gameStarted = true;
  showProblem();
  problemIndex = 0;
  score = 0;
  canPressKey = true;
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

  // Set up a function to handle the response from the server
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Parse the response JSON
        const response = JSON.parse(xhr.responseText);
        const newScore = response.score;

        // Update the score on the webpage
        const currentScoreElement = document.getElementById('currentScore');
        if (currentScoreElement) {
          currentScoreElement.innerText = newScore;
        }
      } else {
        console.error('Failed to update score: ' + xhr.status);
      }
    }
  };

  // Send the FormData object
  xhr.send(formData);
}