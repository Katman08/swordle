// ################################################################################
// Shortle Web App - Main Script
// ################################################################################

const WORD_LENGTH = 4;
const MAX_GUESSES = 6;
let secretWord = "";
let currentRow = 0;
let board = [];
let gameOver = false;
let answerList = []; // Secret words from answer_list.txt
let guessList = []; // Valid guesses from guess_list.txt

// Load word lists from external files
async function loadWordLists() {
    try {
        console.log('Starting to load word lists...');
        
        // Load answer list (secret words)
        console.log('Loading answer_list.txt...');
        const answerResponse = await fetch('answer_list.txt');
        if (!answerResponse.ok) {
            throw new Error(`Failed to load answer_list.txt: ${answerResponse.status}`);
        }
        const answerText = await answerResponse.text();
        answerList = answerText.split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length >= WORD_LENGTH && /^[A-Z]+$/.test(word))
            .map(word => word.substring(0, WORD_LENGTH));
        
        // Load guess list (valid guesses)
        console.log('Loading guess_list.txt...');
        const guessResponse = await fetch('guess_list.txt');
        if (!guessResponse.ok) {
            throw new Error(`Failed to load guess_list.txt: ${guessResponse.status}`);
        }
        const guessText = await guessResponse.text();
        guessList = guessText.split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length >= WORD_LENGTH && /^[A-Z]+$/.test(word))
            .map(word => word.substring(0, WORD_LENGTH));
        
        console.log(`Loaded ${answerList.length} answer words and ${guessList.length} guess words`);
        return { answerList, guessList };
    } catch (error) {
        console.error('Error loading word lists:', error);
        throw error;
    }
}

function pickSecretWord() {
    if (answerList.length === 0) {
        console.error('Answer list not loaded yet');
        return;
    }
    const randomIndex = Math.floor(Math.random() * answerList.length);
    secretWord = answerList[randomIndex];
    console.log('Secret word:', secretWord); // For debugging (remove in production)
}

function initBoard() {
    board = Array.from({ length: MAX_GUESSES }, () => Array(WORD_LENGTH).fill(""));
}

function renderBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    
    for (let r = 0; r < MAX_GUESSES; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        
        for (let c = 0; c < WORD_LENGTH; c++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            
            if (board[r][c]) {
                cellDiv.textContent = board[r][c];
                
                // Add feedback classes for completed rows (only for submitted guesses)
                if (r < currentRow) {
                    const feedback = getFeedback(board[r], secretWord)[c];
                    cellDiv.classList.add(feedback);
                }
            }
            
            rowDiv.appendChild(cellDiv);
        }
        boardDiv.appendChild(rowDiv);
    }
}

function renderKeyboard() {
    const keyboardDiv = document.getElementById("keyboard");
    keyboardDiv.innerHTML = "";
    
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];
    
    keys.forEach((row, rowIndex) => {
        const keyRow = document.createElement("div");
        keyRow.className = "key-row";
        
        row.forEach(key => {
            const keyBtn = document.createElement("button");
            keyBtn.className = "key";
            keyBtn.textContent = key;
            
            if (key === "Enter") {
                keyBtn.id = "enter-key";
                keyBtn.addEventListener("click", () => {
                    if (!gameOver && currentRow < MAX_GUESSES) {
                        submitGuess();
                    }
                });
            } else if (key === "⌫") {
                keyBtn.id = "delete-key";
                keyBtn.addEventListener("click", () => {
                    if (!gameOver && currentRow < MAX_GUESSES) {
                        deleteLetter();
                    }
                });
            } else {
                keyBtn.addEventListener("click", () => {
                    if (!gameOver && currentRow < MAX_GUESSES) {
                        addLetter(key);
                    }
                });
            }
            
            keyRow.appendChild(keyBtn);
        });
        
        keyboardDiv.appendChild(keyRow);
    });
}

function addLetter(letter) {
    const currentGuess = board[currentRow];
    const emptyIndex = currentGuess.findIndex(cell => cell === "");
    
    if (emptyIndex !== -1 && emptyIndex < WORD_LENGTH) {
        currentGuess[emptyIndex] = letter;
        renderBoard();
    }
}

function deleteLetter() {
    const currentGuess = board[currentRow];
    const lastFilledIndex = currentGuess.map((cell, index) => cell !== "" ? index : -1).filter(index => index !== -1).pop();
    
    if (lastFilledIndex !== undefined) {
        currentGuess[lastFilledIndex] = "";
        renderBoard();
    }
}

function submitGuess() {
    const currentGuess = board[currentRow];
    
    if (currentGuess.some(cell => cell === "")) {
        showMessage("Not enough letters", "error");
        return;
    }
    
    const guessWord = currentGuess.join("");
    if (!guessList.includes(guessWord)) {
        showMessage("Not in guess list", "error");
        return;
    }
    
    const feedback = getFeedback(currentGuess, secretWord);
    updateKeyboardColors(currentGuess, feedback);
    
    if (feedback.every(f => f === "correct")) {
        showMessage("You win!", "win");
        gameOver = true;
        document.getElementById("reset-btn").style.display = "block";
        return;
    }
    
    currentRow++;
    renderBoard(); // Re-render after currentRow is incremented
    
    if (currentRow === MAX_GUESSES) {
        showMessage(`Game over! The word was: ${secretWord}`, "loss");
        gameOver = true;
        document.getElementById("reset-btn").style.display = "block";
        return;
    }
    
    showMessage("");
}

function getFeedback(guess, answer) {
    const feedback = Array(WORD_LENGTH).fill("absent");
    const answerArr = answer.split("");
    const guessArr = [...guess];
    
    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArr[i] === answerArr[i]) {
            feedback[i] = "correct";
            answerArr[i] = null;
            guessArr[i] = null;
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (feedback[i] === "correct" || !guessArr[i]) continue;
        
        const idx = answerArr.findIndex(letter => letter === guessArr[i]);
        if (idx !== -1) {
            feedback[i] = "present";
            answerArr[idx] = null;
        }
    }
    
    return feedback;
}

function updateKeyboardColors(guess, feedback) {
    guess.forEach((letter, index) => {
        // Find all keys with this letter (not Enter or Delete keys)
        const keyElements = document.querySelectorAll(`.key:not(#enter-key):not(#delete-key)`);
        keyElements.forEach(keyElement => {
            if (keyElement.textContent === letter) {
                const currentClass = keyElement.className;
                const newClass = feedback[index];
                
                if (!currentClass.includes("correct")) {
                    if (newClass === "correct") {
                        keyElement.classList.remove("present", "absent");
                        keyElement.classList.add("correct");
                    } else if (newClass === "present" && !currentClass.includes("correct")) {
                        keyElement.classList.remove("absent");
                        keyElement.classList.add("present");
                    } else if (newClass === "absent" && !currentClass.includes("correct") && !currentClass.includes("present")) {
                        keyElement.classList.add("absent");
                    }
                }
            }
        });
    });
}

function showMessage(msg, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = msg;
    messageDiv.className = type ? `message ${type}` : "message";
}

function startGame() {
    loadWordLists().then(() => { // Wait for word lists to load
        pickSecretWord();
        initBoard();
        currentRow = 0;
        gameOver = false;
        renderBoard();
        renderKeyboard();
        showMessage("");
        document.getElementById("reset-btn").style.display = "none";
    }).catch((error) => {
        console.error('Failed to start game:', error);
        // Show error message to user
        showMessage("Error loading word lists. Please refresh the page.", "error");
        // Still render the board and keyboard so user can see something
        initBoard();
        renderBoard();
        renderKeyboard();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM loaded, starting game...');
    startGame();
    document.getElementById("reset-btn").addEventListener("click", startGame);
});

// Keyboard event listeners
document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    
    if (e.key === "Enter") {
        if (currentRow < MAX_GUESSES) {
            submitGuess();
        }
    } else if (e.key === "Backspace") {
        deleteLetter();
    } else if (/^[A-Za-z]$/.test(e.key)) {
        addLetter(e.key.toUpperCase());
    }
}); 