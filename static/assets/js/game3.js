const startButton3 = document.getElementById('startBtn3');
//const gameboard = document.querySelector('.gameboard');

const miSound = new Audio('../static/assets/audio/mi.mp3');
const solSound = new Audio('../static/assets/audio/sol.mp3');
const faSound = new Audio('../static/assets/audio/fa.mp3');
const keyToSound = {
    'q': miSound,
    'w': faSound,
    'e': solSound
};
let dev2 = 1;
let userInput2 = []; // To store the user's key presses
let keydownListener2; // keydown 이벤트 리스너의 참조를 저장하는 변수
let userSequence3 = []

const max_interval2 = 1.7;

//const beepSound = new Audio('../static/assets/audio/beep.mp3');
//const clapSound = new Audio('../static/assets/audio/clap.mp3')
//const soundDict = {'Clap': new Audio('../static/assets/audio/clap.mp3'), 'Beep': new Audio('../static/assets/audio/beep.mp3')};

let problem_list2 = generate_problem3();
function set_variable2(){
    gameStarted2 = true;
    Completed = false;
    problemIndex = 0; // Keep track of the current problem
    canPressKey = false;
    start_time = new Date()
    score = 0;
    document.removeEventListener('keydown', keydownListener);
    dev2 = 1.0;

}


function generate_problem3() {
    let num_prob = 50;
    let problem_list2 = [];

    for (let i = 0; i < num_prob; i++) {
        let prob = [];

        for (let j = 0; j < 1; j++) {
            let sound_idx = Math.floor(Math.random() * problem_list2.length);


            let sound = 'Sound' + i; // You can replace this with your sound generation logic.
            prob.push(sound);
            let inter = []
let expected_sequence_length = Math.floor(Math.random() * 3) + 2; // Generates values from 2 to 4.
inter.push(0);
                    for (let j = 1; j < expected_sequence_length; j++) {

                    let random_interval = Math.random() * max_interval2 + 0.9;
    inter.push(random_interval);
        }
        prob.push(inter)

            prob.push(expected_sequence_length); // Push the expected sequence length
        let soundSequence = [];
        for (let j = 0; j < expected_sequence_length; j++) {
            let randomValue = Math.random();
            if (randomValue < 0.33) {

                soundSequence.push('q');
            } else if (randomValue < 0.67) {

                soundSequence.push('w');
            } else {

                soundSequence.push('e');
            }
        }
        prob.push(soundSequence);
        }

        problem_list2.push(prob);
    }

    return problem_list2;
}






startButton3.addEventListener('click', () => {
    console.log("CHEKC")
  startButton3.style.display = 'none';
  set_variable2()
  game1=false;
    game3 = true;
  game2 = false;
//  stopGame1();
//  stopGame2()
  gameStarted2 = true; // The game has started once the button is clicked
  showProblem2();

});

function wait_keyInput2() {
    keydownListener2 = (event) => {
      if (gameStarted2 && game3) {
        if (event.key === 'q') {
            miSound.play();
            showPressedKey3('q');
            userSequence3.push('q')
        }
        else if (event.key === 'w') {
            faSound.play();
            showPressedKey3('w');
            userSequence3.push('w')
        }
        else if (event.key === 'e') {
            solSound.play();
            showPressedKey3('e');
            userSequence3.push('e')
        }
      }
    };
    document.addEventListener('keydown', keydownListener2); // 이벤트 리스너 등록
}

function showProblem2() {
  if (game1 == true || game2 == true){
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

    const infoMessage2 = document.createElement('div');
    infoMessage2.innerHTML = '<strong> \'q\' </strong> Key for Lowest Pitch, <strong>\'w\'</strong> Key for Middle Pitch, and <strong>\'e\'</span></strong> Key for Highest Pitch';
    infoMessage2.classList.add('info-message');
    problemInfoContainer.appendChild(infoMessage2);

    const infoMessage3 = document.createElement('div');
    infoMessage3.innerHTML = 'Make sure you listen and wait until the sounds have finished. Then, press the key in the correct order and time interval!';
    infoMessage3.classList.add('info-message');
    problemInfoContainer.appendChild(infoMessage3);

    console.log(problemIndex, problem_list2[problemIndex]);
    displayContent2(problem_list2[problemIndex]);
}

function displayContent2(curr_problem) {
    const contentElement = document.createElement('div');
    var text = '';
    var curr_interval = 0;

    for (let i = 0; i < curr_problem[2]; i++) {
        const keyInput = curr_problem[3][i];
        const soundToPlay = keyToSound[keyInput]; // Get the corresponding sound

        if (soundToPlay) {
            curr_interval += curr_problem[1][i];
            setTimeout(() => {
                console.log(i);
                text += keyInput;
                soundToPlay.play(); // Play the corresponding sound
            }, curr_interval * 1000);
        } else {
            console.log(`No sound found for key input: ${keyInput}`);
        }
    }
    wait_keyInput2();
}


function showPressedKey3(key) {
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
    userInput2.push(pressed_time.getTime()); // Use userInput declared in the broader scope

    // Check if the user's sequence length matches the expected sequence length
    if (userInput2.length === problem_list2[problemIndex][2]) {
      if (keydownListener2) {
        document.removeEventListener('keydown', keydownListener2);
      }
      setTimeout(checkSequence3, 500);
    }
}

function checkSequence3() {
    clearPressedKeys3();
    var intervals = [0]
    for (let i = 1; i < userInput2.length; i++) {
        var timeDiff = (userInput2[i] - userInput2[i-1]) / 1000;
        intervals.push(timeDiff);
    }
    console.log(intervals);
    var correct = true;
    var isInterval = true;
    var isorder = true
    for (var i = 0; i < intervals.length; i++) {
        if (correct) {
            min_dev = problem_list2[problemIndex][1][i] - dev2;
            max_dev = problem_list2[problemIndex][1][i] + dev2;
            console.log(min_dev, max_dev)
            if (intervals[i] <= min_dev || intervals[i] >= max_dev) {
                correct = false;
                isInterval = false;
            }
        }
    }
    const expectedSequence = problem_list2[problemIndex][3];

    const userSequenceString = userSequence3.join(' ');
    const expectedSequenceString = expectedSequence.join(' ');

    console.log("AAAAA"+userSequenceString);
    console.log("BBBBB"+expectedSequenceString);
    if (userSequenceString != expectedSequenceString) {
                 correct = false;
                isorder = false;
    }
    if (correct) {
        score++;
        const congratsElement = document.createElement('div');
        congratsElement.textContent = 'Congratulations!';
        congratsElement.classList.add('congratulations');
        gameboard.appendChild(congratsElement);
        correctSound.play();
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

        sendScoreToBackend(score);

        // Reset the game after a delay (e.g., 3 seconds)
        setTimeout(() => {
        // Remove the "Congratulations" message
        congratsElement.remove();

        // Progress to the next problem
        problemIndex++;
        if (problemIndex < problem_list2.length) {
            userInput2 = [];
            showProblem2();
        }
        else {
            gameCompleted3();
        }}, 3000);
    }
    else {
        if (isInterval==false && isorder == false) {
        // Create a container for the warning message and retry button
        const warningContainer = document.createElement('div');
        warningContainer.classList.add('warning-container', 'text-center'); // Center align content
        gameboard.appendChild(warningContainer);

        // Show a warning message
        const warningElement = document.createElement('div');
        warningElement.textContent = 'Wrong order and interval! Try again.';
        warningElement.classList.add('warning');
        warningContainer.appendChild(warningElement);
        wrongSound.play();
        // Add a retry button with Bootstrap styles and center it
        const retryButton3= document.createElement('button');
        retryButton3.textContent = 'Retry';
        retryButton3.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2','game3'); // Center using mx-auto
        retryButton3.addEventListener('click', () => {

        // Clear the warning message, reset the game, and remove the retry button
        warningContainer.remove();
//            const problemInfoContainer = document.querySelector('.pressed-key');
//            problemInfoContainer.remove();
        resetGame3();
    });
    warningContainer.appendChild(retryButton3);
    }
    else if(isInterval==false){
                const warningContainer = document.createElement('div');
        warningContainer.classList.add('warning-container', 'text-center'); // Center align content
        gameboard.appendChild(warningContainer);

        // Show a warning message
        const warningElement = document.createElement('div');
        warningElement.textContent = 'Wrong Interval! Try again.';
        warningElement.classList.add('warning');
        warningContainer.appendChild(warningElement);
        wrongSound.play();
        // Add a retry button with Bootstrap styles and center it
        const retryButton3= document.createElement('button');
        retryButton3.textContent = 'Retry';
        retryButton3.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2'); // Center using mx-auto
        retryButton3.addEventListener('click', () => {

        // Clear the warning message, reset the game, and remove the retry button
        warningContainer.remove();
//            const problemInfoContainer = document.querySelector('.pressed-key');
//            problemInfoContainer.remove();
        resetGame3();
    });
    warningContainer.appendChild(retryButton3);
    }else{
                        const warningContainer = document.createElement('div');
        warningContainer.classList.add('warning-container', 'text-center'); // Center align content
        gameboard.appendChild(warningContainer);

        // Show a warning message
        const warningElement = document.createElement('div');
        warningElement.textContent = 'Wrong order! Try again.';
        warningElement.classList.add('warning');
        warningContainer.appendChild(warningElement);
        wrongSound.play();
        // Add a retry button with Bootstrap styles and center it
        const retryButton3= document.createElement('button');
        retryButton3.textContent = 'Retry';
        retryButton3.classList.add('btn', 'btn-retry', 'mx-auto', 'mt-2'); // Center using mx-auto
        retryButton3.addEventListener('click', () => {

        // Clear the warning message, reset the game, and remove the retry button
        warningContainer.remove();
//            const problemInfoContainer = document.querySelector('.pressed-key');
//            problemInfoContainer.remove();
        resetGame3();
    });
    warningContainer.appendChild(retryButton3);
    }

}
}

function gameCompleted3() {
    const resultContainer = document.createElement('div');
    resultContainer.classList.add('result-container', 'text-center'); // Center align content
    gameboard.appendChild(resultContainer);

    // Show a warning message
    const resultElement = document.createElement('div');
    resultElement.textContent = 'SCORE ' + score;
    resultElement.classList.add('result');
    resultContainer.appendChild(resultElement);
}

function resetGame3() {
  userInput2 = [];
  userSequence3 = [];
  gameStarted2 = true;
  showProblem2();
}

function clearPressedKeys3() {
    const pressedKeys = document.querySelectorAll('.pressed-key');
    pressedKeys.forEach((key) => key.remove());
}



