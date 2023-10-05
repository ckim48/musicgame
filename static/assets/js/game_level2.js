const startButton2 = document.getElementById('startBtn2');
//const gameboard = document.querySelector('.gameboard');

const beepSound = new Audio('../static/assets/audio/beep.mp3');

//const beepSound = new Audio('../static/assets/audio/beep.mp3');
//const clapSound = new Audio('../static/assets/audio/clap.mp3')
const soundDict = {'Do': new Audio('../static/assets/audio/clap.mp3')};
const keyDict = {'Do': 'Enter'};
const keyList = Object.keys(soundDict)


function set_variable(){
    gameStarted = true;
    Completed = false;
    problemIndex = 0; // Keep track of the current problem
    start_time = new Date()
    score = 0;
//    document.removeEventListener('keydown', keydownListener2);
    problem_list = [];
    userInput = [];
    canPressKey = false;
}
let keydownListener; // keydown 이벤트 리스너의 참조를 저장하는 변수


function gen_prob2() {
    for (let i = 0; i < num_prob; i++){
      var showNum = Math.floor(Math.random() * max_soundNum) + 2;
      var sound_idx = Math.floor(Math.random() * keyList.length);
      var prob = [0];
      for (let j = 0; j < showNum-1; j++) {
        var random_interval = Math.random() * max_interval + 0.5;
        prob.push(random_interval);
      }
//      console.log(prob);
      problem_list.push([keyList[sound_idx], prob]);
    }
    console.log(problem_list)
}


startButton2.addEventListener('click', () => {
  startButton2.style.display = 'none';
  set_variable();
  gen_prob2();
//  stopGame1();
//  stopGame3()
  setTimeout(showProblem, 500);
  game1=false;
    game2=true;
    game3=false;

});


function wait_keyInput() {
    keydownListener = (event) => {
    console.log(event.key);
      if (canPressKey && game2) {
          if (event.key === 'Enter') {
            showPressedKey2('Enter');
            }
      }else{
        console.log("can't press key");
      }};
    document.addEventListener('keydown', keydownListener); // 이벤트 리스너 등록
}

function showProblem() {

    if (keydownListener) {
        canPressKey = false;
        document.removeEventListener('keydown', keydownListener);
    }
      if (game1 == true || game3 == true){

    return;
  }
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
    infoMessage.innerHTML = '<strong> Please listen and wait</strong> until the sounds have finished.Then, press the \'Enter\' key in time interval.';
    infoMessage.classList.add('info-message');
    problemInfoContainer.appendChild(infoMessage);

    console.log(problemIndex, problem_list[problemIndex]);
    displayContent(problem_list[problemIndex]);
}

function displayContent(curr_problem) {
    var curr_interval = 0;

    for (let i = 0; i < curr_problem[1].length; i++) {
        curr_interval += curr_problem[1][i]
        setTimeout(() => {
            soundDict[curr_problem[0]].play();
        }, curr_interval * 1000);
    }
    canPressKey = true;
    wait_keyInput();
}

function showPressedKey2(key) {
    const problemInfoContainer = document.querySelector('.problem-info-container');
    if (problemInfoContainer) {
      problemInfoContainer.remove();
    }

    var pressed_time = new Date()
    const displayElement = document.createElement('div');
    displayElement.textContent = `${key}`;
    displayElement.classList.add('pressed-key');
    gameboard.appendChild(displayElement);

    // Add the key to the user's sequence
    userInput.push(pressed_time.getTime()); // Use userInput declared in the broader scope

    // Check if the user's sequence length matches the expected sequence length
    if (userInput.length === problem_list[problemIndex][1].length) {
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
//    console.log(intervals);
    var correct = true;
    for (var i = 0; i < intervals.length; i++) {
        if (correct) {
            min_dev = problem_list[problemIndex][1][i] - dev;
            max_dev = problem_list[problemIndex][1][i] + dev;
//            console.log(min_dev, max_dev)
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
        correctSound.play();
        show_firework();
        sendScoreToBackend(score);
        setTimeout(() => {
            // Remove the "Congratulations" message
            congratsElement.remove();

            // Progress to the next problem
            problemIndex++;
            if (problemIndex < num_prob) {
                userInput = [];
                setTimeout(showProblem, 500);
            } else {
                gameCompleted();
            }}, 3000);
    } else {
        console.log("Incorrect")
        canPressKey = false;
        // Create a container for the warning message and retry button
        const warningContainer = document.createElement('div');
        warningContainer.classList.add('warning-container', 'text-center'); // Center align content
        gameboard.appendChild(warningContainer);

        // Show a warning message
        const warningElement = document.createElement('div');
        warningElement.textContent = 'Wrong answer! Try again.';
        warningElement.classList.add('warning');
        warningContainer.appendChild(warningElement);
        wrongSound.play();

        // Add a retry button with Bootstrap styles and center it
        const retryButton2= document.createElement('button');
        retryButton2.textContent = 'Retry';
        retryButton2.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2','game2'); // Center using mx-auto
        warningContainer.appendChild(retryButton2);
        retryButton2.addEventListener('click', () => {
            warningContainer.remove();
            resetGame2();
        });
    }
}

function show_firework() {
    const firework = document.createElement('div');
    firework.classList.add('firework');
    gameboard.appendChild(firework);

    const firework2 = document.createElement('div');
    firework2.classList.add('firework2');
    gameboard.appendChild(firework2);

    const firework3 = document.createElement('div');
    firework3.classList.add('firework3');
    gameboard.appendChild(firework3);

    const firework4 = document.createElement('div');
    firework4.classList.add('firework4');
    gameboard.appendChild(firework4);

    const firework5 = document.createElement('div');
    firework5.classList.add('firework5');
    gameboard.appendChild(firework5);

    const firework6 = document.createElement('div');
    firework6.classList.add('firework6');
    gameboard.appendChild(firework6);

    // Remove the firework element after the animation
    firework.addEventListener('animationend', () => {
      firework.remove();
    });
    firework2.addEventListener('animationend', () => {
      firework2.remove();
    });
    firework3.addEventListener('animationend', () => {
      firework3.remove();
    });
    firework4.addEventListener('animationend', () => {
      firework4.remove();
    });
    firework5.addEventListener('animationend', () => {
      firework5.remove();
    });
    firework6.addEventListener('animationend', () => {
      firework6.remove();
    });
}


function gameCompleted() {
    const resultContainer = document.createElement('div');
    resultContainer.classList.add('result-container', 'text-center'); // Center align content
    gameboard.appendChild(resultContainer);

    // Show a warning message
    const resultElement = document.createElement('div');
    resultElement.classList.add('result');
    resultContainer.appendChild(resultElement);
}

function resetGame2() {
  userInput = [];
  setTimeout(showProblem, 500);
}

function clearPressedKeys() {
    const pressedKeys = document.querySelectorAll('.pressed-key');
    pressedKeys.forEach((key) => key.remove());
}



