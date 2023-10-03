const startButton2 = document.getElementById('startBtn2');
//const gameboard = document.querySelector('.gameboard');
<<<<<<< HEAD
const beepSound = new Audio('../static/assets/audio/beep.mp3');
let userInput = [];
let dev = 2.0
=======
//const beepSound = new Audio('../static/assets/audio/beep.mp3');
//const clapSound = new Audio('../static/assets/audio/clap.mp3')
const soundDict = {'Clap': new Audio('../static/assets/audio/clap.mp3'), 'Beep': new Audio('../static/assets/audio/beep.mp3')};

>>>>>>> 69b88345918fd1975d1c922b179d168fca5cdbc3
function set_variable(){
    gameStarted = false;
    Completed = false;
    problemIndex = 0; // Keep track of the current problem
    canPressKey = false;
    start_time = new Date()
    score = 0;
<<<<<<< HEAD
    dev = 2.0;
=======
>>>>>>> 69b88345918fd1975d1c922b179d168fca5cdbc3
}
let dev = 1;
let userInput = []; // To store the user's key presses
let keydownListener; // keydown 이벤트 리스너의 참조를 저장하는 변수

//let currentQuestion = 1;
//let incorrectCnt = 0;
//const incorrectLimit = 5;


const problem_list = [ // img, interval, showNum
    ['Clap', [0, 0.3, 0.5, 0.3, 0.5], 5],
    ['Beep', [0, 1, 2], 3]
];

startButton2.addEventListener('click', () => {
  startButton2.style.display = 'none';
  set_variable()
  gameStarted = true; // The game has started once the button is clicked
  showProblem();
//    removeContent();
});

function wait_keyInput() {
    keydownListener = (event) => {
      if (gameStarted) {
        if (event.key === 'Enter') {
            showPressedKey2('Enter');
        }
      }
    };
    document.addEventListener('keydown', keydownListener); // 이벤트 리스너 등록
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

    console.log(problemIndex, problem_list[problemIndex]);
    displayContent(problem_list[problemIndex]);
}

function displayContent(curr_problem) {
//    const problemInfoContainer = document.querySelector('.problem-info-container');
//    if (problemInfoContainer) {
//        problemInfoContainer.remove();
//    }

    const contentElement = document.createElement('div');
    var text = '';
    var curr_interval = 0;

    for (let i = 0; i < curr_problem[2]; i++) {
        curr_interval += curr_problem[1][i]
        setTimeout(() => {
            console.log(i)
            text += curr_problem[0];
//            console.log('Play '+ curr_problem[0] + ' sound after ' + curr_interval*1000 + 'seconds.');
            soundDict[curr_problem[0]].play();
        }, curr_interval * 1000);
    }
    wait_keyInput()
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

    // Add the key to the user's sequence
    userInput.push(pressed_time.getTime()); // Use userInput declared in the broader scope

    // Check if the user's sequence length matches the expected sequence length
    if (userInput.length === problem_list[problemIndex][2]) {
      if (keydownListener) {
        document.removeEventListener('keydown', keydownListener);
      }
      setTimeout(checkSequence2, 500);
    }
}

function checkSequence2() {
    clearPressedKeys();
    var intervals = [0]
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
  userInput = [];
//  gameStarted = true;
  showProblem();
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