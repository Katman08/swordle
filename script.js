// ################################################################################
// Swordle Web App - Main Script
// ################################################################################

const PARTS = ["end", "handle", "hilt", "blade", "tip"];
const NUM_SWORDS = 5;
let secretSword = [];
let currentRow = 0;
let board = [];
let gameOver = false;
// New: Track current guess as an array of up to 5 selected parts
let currentGuess = [];

function pickSecretSword() {
    // Pick a random part from each category to create a mixed sword
    secretSword = PARTS.map(part => {
        const idx = Math.floor(Math.random() * NUM_SWORDS) + 1;
        return {category: part, filename: `${idx}.png`};
    });
}

function initBoard() {
    board = Array.from({ length: 6 }, () => Array(PARTS.length).fill(null));
}

function renderBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for (let r = 0; r < 6; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        for (let c = 0; c < PARTS.length; c++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "part-cell";
            let part = board[r][c];
            if (r === currentRow && !gameOver) {
                // Show currentGuess in the current row
                if (currentGuess[c]) {
                    part = currentGuess[c];
                    const img = document.createElement("img");
                    img.src = `sword_parts/${part.category}/${part.filename}`;
                    img.alt = part.category;
                    cellDiv.appendChild(img);
                }
            } else if (part) {
                const img = document.createElement("img");
                img.src = `sword_parts/${part.category}/${part.filename}`;
                img.alt = part.category;
                cellDiv.appendChild(img);
            }
            // Only add feedback classes after a guess is submitted
            if (r < currentRow) {
                // For feedback, compare full part objects
                const guessRow = board[r];
                const answerRow = secretSword;
                const feedback = getFeedback(guessRow, answerRow)[c];
                if (feedback) cellDiv.classList.add(feedback);
            }
            rowDiv.appendChild(cellDiv);
        }
        boardDiv.appendChild(rowDiv);
    }
}

function renderPartsKeyboard() {
    const pickerDiv = document.getElementById("parts-picker");
    if (gameOver || currentRow >= 6) {
        pickerDiv.innerHTML = "";
        return;
    }
    pickerDiv.innerHTML = "";
    // Keyboard grid
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(5, 48px)";
    grid.style.gap = "8px";
    grid.style.justifyContent = "center";
    grid.style.marginBottom = "12px";
    PARTS.forEach((part, partIdx) => {
        for (let i = 1; i <= NUM_SWORDS; i++) {
            const btn = document.createElement("button");
            btn.className = "part-key";
            btn.style.padding = 0;
            btn.style.border = "2px solid #3a3a3c";
            btn.style.background = "#222";
            btn.onclick = () => {
                if (currentGuess.length < 5) {
                    currentGuess.push({category: part, index: i, filename: `${i}.png`});
                    renderPartsKeyboard();
                    renderBoard();
                }
            };
            const img = document.createElement("img");
            img.src = `sword_parts/${part}/${i}.png`;
            img.alt = part + ` #${i}`;
            img.style.width = "40px";
            img.style.height = "40px";
            img.style.objectFit = "cover";
            btn.appendChild(img);
            grid.appendChild(btn);
        }
    });
    pickerDiv.appendChild(grid);
    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "12px";
    buttonContainer.style.marginTop = "12px";
    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Sword";
    submitBtn.className = "part-key submit-btn";
    submitBtn.disabled = currentGuess.length !== 5;
    submitBtn.onclick = () => {
        if (currentGuess.length === 5) {
            submitSwordGuess(currentGuess);
            currentGuess = [];
            renderPartsKeyboard();
            renderBoard();
        }
    };
    buttonContainer.appendChild(submitBtn);
    // Backspace button
    const backBtn = document.createElement("button");
    backBtn.textContent = "⌫";
    backBtn.className = "part-key delete-btn";
    backBtn.style.margin = "0";
    backBtn.onclick = () => {
        if (currentGuess.length > 0) {
            currentGuess.pop();
            renderPartsKeyboard();
            renderBoard();
        }
    };
    buttonContainer.appendChild(backBtn);
    pickerDiv.appendChild(buttonContainer);
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById("message");
    msgDiv.textContent = msg;
    msgDiv.className = "";
    if (type === "win") msgDiv.classList.add("win-message");
    if (type === "loss") msgDiv.classList.add("loss-message");
    if (!msg) {
        msgDiv.style.display = "none";
    } else {
        msgDiv.style.display = "inline-block";
    }
}

function getFeedback(guess, answer) {
    // guess and answer are arrays of part objects (or null)
    const feedback = Array(PARTS.length).fill("absent");
    const answerArr = answer.map((a) => a ? { ...a } : null);
    const guessArr = guess.map((g) => g ? { ...g } : null);
    // First pass: correct (green)
    for (let i = 0; i < PARTS.length; i++) {
        if (
            guessArr[i] && answerArr[i] &&
            guessArr[i].category === answerArr[i].category &&
            guessArr[i].filename === answerArr[i].filename
        ) {
            feedback[i] = "correct";
            answerArr[i] = null; // Mark as used
            guessArr[i] = null;
        }
    }
    // Second pass: present (yellow)
    for (let i = 0; i < PARTS.length; i++) {
        if (feedback[i] === "correct" || !guessArr[i]) continue;
        const idx = answerArr.findIndex(
            (a) => a && a.category === guessArr[i].category && a.filename === guessArr[i].filename
        );
        if (idx !== -1) {
            feedback[i] = "present";
            answerArr[idx] = null; // Mark as used
        }
    }
    return feedback;
}

function showSolutionSword() {
    const solDiv = document.getElementById("solution-sword");
    solDiv.innerHTML = "";
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    for (let i = 0; i < PARTS.length; i++) {
        const cellDiv = document.createElement("div");
        cellDiv.className = "part-cell";
        const img = document.createElement("img");
        img.src = `sword_parts/${PARTS[i]}/${secretSword[i].filename}`;
        img.alt = PARTS[i];
        cellDiv.appendChild(img);
        rowDiv.appendChild(cellDiv);
    }
    solDiv.appendChild(rowDiv);
}

function clearSolutionSword() {
    document.getElementById("solution-sword").innerHTML = "";
}

function submitSwordGuess(guess) {
    if (gameOver) return;
    // guess is an array of part objects
    board[currentRow] = currentGuess.slice();
    const feedback = getFeedback(currentGuess, secretSword);
    renderBoard();
    if (feedback.every(f => f === "correct")) {
        showMessage("You win!", "win");
        gameOver = true;
        renderPartsKeyboard();
        document.getElementById("reset-btn").style.display = "block";
        clearSolutionSword();
        return;
    }
    currentRow++;
    if (currentRow === 6) {
        showMessage(`Game over! The sword was:`, "loss");
        gameOver = true;
        renderPartsKeyboard();
        document.getElementById("reset-btn").style.display = "block";
        showSolutionSword();
        return;
    }
    renderPartsKeyboard();
    showMessage("");
    clearSolutionSword();
}

function startGame() {
    pickSecretSword();
    initBoard();
    currentGuess = [];
    window.currentSelection = null;
    window.currentSelectionRow = null;
    currentRow = 0;
    gameOver = false;
    renderBoard();
    renderPartsKeyboard();
    showMessage("");
    document.getElementById("reset-btn").style.display = "none";
    clearSolutionSword();
}

document.addEventListener("DOMContentLoaded", () => {
    startGame();
    document.getElementById("reset-btn").addEventListener("click", startGame);
});

// Add keyboard event listener for Delete key
document.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !gameOver && currentRow < 6) {
        if (currentGuess.length > 0) {
            currentGuess.pop();
            renderPartsKeyboard();
            renderBoard();
        }
    }
    if (e.key === "Enter" && !gameOver && currentRow < 6 && currentGuess.length === 5) {
        submitSwordGuess(currentGuess);
        currentGuess = [];
        renderPartsKeyboard();
        renderBoard();
    }
}); 