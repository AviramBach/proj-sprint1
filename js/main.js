"use strict"

var gBoard
const MINE = '💣'
const FLAG = '🚩'
const LIVES = '💖'

var gClicks
var gCountLives = 1
var gMarkedMines
var gClickedMines

const gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: {
        EASY: 1,
        MODERATE: 3,
        HARD: 3
    }
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    safeClicks: 3
}


///////////////////////////////////////

function onInit() {

    gClicks = 0
    gMarkedMines = 0
    gClickedMines = 0

    gGame.shownCount = 0
    gGame.markedCount = gLevel.MINES
    gGame.isOn = true
    gGame.safeClicks = 3
    gBoard = buildBoard()

    addRandMines()
    setMinesNegsCount(gBoard)
    rendNormalFace()
    rendLeftLives()
    rendLeftFlags()
    rendSafeClicks()
    renderBoard(gBoard)
}

function buildBoard() {
    const board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            var cellContent = ''

            if (cell.isShown && cell.isMine) {
                cellContent = cell.isMine ? MINE : cell.minesAroundCount;
            }
            strHTML += `<td class="${className} " onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }

    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

function setMinesNegsCount(board) {

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const currCell = board[i][j]
            currCell.minesAroundCount = checkNeighbors(board, i, j)
        }
    }
}


function checkNeighbors(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) {
                count++
            }
        }
    }
    return count
}

function replaceMineLocation(currRowIdx, currColIdx) { // if the first click is a mine, the function change its location 

    const randRowIdx = getRandomInt(0, gLevel.SIZE)
    const randColIdx = getRandomInt(0, gLevel.SIZE)
    var designatedCell = gBoard[randRowIdx][randColIdx]

    if ((randRowIdx === currRowIdx && randColIdx === currColIdx) || designatedCell.isMine === true) {
        replaceMineLocation(currRowIdx, currColIdx)
    } else {
        gBoard[currRowIdx][currColIdx].isMine = false;
        designatedCell.isMine = true;
    }
}

function onCellClicked(elCell, i, j) {

    if (gGame.isOn === true) {
        const cell = gBoard[i][j]

        if (gClicks === 0) {
            startTimer()
        }

        if (gClicks === 0) {
            if (cell.isMine === true) { // this condition is for checking if the first click is a mine
                replaceMineLocation(i, j)
            }
            gClicks++
        }
        if (cell.isMine === true && cell.isShown === false) {

            gCountLives--
            displayMine(elCell)
            rendLeftLives()
            cell.isShown = true
            elCell.classList.add('clicked')
            gClickedMines++
            checkGameOver()

            showMessage("You have been mined")
            setTimeout(hideMessage, 1000)
        }
        if (cell.isMine === false && cell.isMarked === false & cell.isShown === false) {
            cell.isShown = true
            elCell.classList.add('clicked')
            gGame.shownCount++

            if (cell.minesAroundCount > 0) {
                elCell.innerHTML = cell.minesAroundCount
            } else {
                expandShown(gBoard, i, j)
            }
            gClicks++
            checkGameOver()
        }
    }
}

function showMessage(message) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.classList.remove('hide');
}

function hideMessage() {
    const messageElement = document.getElementById("message");
    messageElement.classList.add('hide');
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            var cellSelector = '.' + getClassName({ i: i, j: j })
            var elNeighborCell = document.querySelector(cellSelector)

            if (currCell.isMine === false && currCell.isShown === false && currCell.isMarked === false) {
                currCell.isShown = true
                elNeighborCell.classList.add('clicked')
                gGame.shownCount++
                if (currCell.minesAroundCount > 0) {
                    elNeighborCell.innerHTML = currCell.minesAroundCount
                } else {
                    expandShown(board, i, j)
                }
            }
        }
    }
}

function displayMine(cell) {
    cell.innerHTML = MINE
    cell.classList.remove('mine')

}

function displayMines() {
    const cells = document.querySelectorAll('.cell');

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j];

            if (cell.isMine) {
                const cellIdx = i * gLevel.SIZE + j
                cells[cellIdx].innerHTML = MINE
                cells[cellIdx].classList.remove('mine')
            }
        }
    }
}

function addRandMines() {

    var placedMines = 0

    while (placedMines < gLevel.MINES) {
        const randRowIdx = getRandomInt(0, gLevel.SIZE)
        const randColIdx = getRandomInt(0, gLevel.SIZE)
        var designatedCell = gBoard[randRowIdx][randColIdx]

        if (designatedCell.isMine === false) {
            designatedCell.isMine = true
            placedMines++
        }
    }
}

function onCellMarked(elCell, i, j) {
    if (gGame.isOn === true) {
        event.preventDefault()
        const cell = gBoard[i][j]
        if (cell.isMarked && cell.isShown) {
            cell.isMarked = false;
            elCell.innerHTML = '';
            gGame.markedCount++
        }
        if (cell.isShown) return

        if (cell.isMarked) {
            cell.isMarked = false;
            elCell.innerHTML = '';
            if (gGame.markedCount < gLevel.MINES) {
                gGame.markedCount++
                if (cell.isMine) gMarkedMines--
            }
        } else {
            if (gGame.markedCount > 0) {
                cell.isMarked = true;
                elCell.innerHTML = FLAG;
                gGame.markedCount--
                if (cell.isMine) gMarkedMines++
            }
        }
        rendLeftFlags()
        checkGameOver()
    }
}

function rendLeftFlags() {
    const elFlagCount = document.querySelector('.flag');
    elFlagCount.textContent = gGame.markedCount;
}

function rendLeftLives() {
    const elFlagCount = document.querySelector('.live');
    elFlagCount.textContent = gCountLives;
}

function checkGameOver() {
    const totalCells = gLevel.SIZE * gLevel.SIZE

    if (gClickedMines + gMarkedMines + gGame.shownCount === totalCells
        || gMarkedMines + gGame.shownCount === totalCells) {
        gGame.isOn = false

        const elBtn = document.querySelector('.restart')
        elBtn.innerText = '😎'

        gameOver('VICTORIOUS! \n You are a mines expret!')
    }

    if (gCountLives === 0) {
        gGame.isOn = false

        const elBtn = document.querySelector('.restart')
        elBtn.innerText = '🤯'

        displayMines()
        gameOver('YOU LOST! \n Be Careful next time')

    }

}

function rendNormalFace() {

    const elBtn = document.querySelector('.restart')
    elBtn.innerText = '😃'
}

function gameOver(txt) {

    const elTitle = document.querySelector('.title')
    elTitle.innerText = txt

    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hide')

    console.log('Game Over')
    clearInterval(gTimerInterval)

}

function playAgain() {

    const elModal = document.querySelector('.modal')
    elModal.classList.add('hide')

    const elTimer = document.querySelector('.timer')
    clearInterval(gTimerInterval);
    elTimer.textContent = 'Time Elapsed: 0.000'


    if (gLevel.SIZE === 4) {
        gCountLives = gLevel.LIVES.EASY
    } else if (gLevel.SIZE === 8) {
        gCountLives = gLevel.LIVES.MODERATE
    } else if (gLevel.SIZE === 12) {
        gCountLives = gLevel.LIVES.HARD
    }

    onInit()
}

function setLevel(num) {

    if (num === 4) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gCountLives = gLevel.LIVES.EASY

    }
    if (num === 8) {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gCountLives = gLevel.LIVES.MODERATE
    }
    if (num === 12) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gCountLives = gLevel.LIVES.HARD
    }

    clearInterval(gTimerInterval)
    const elTimer = document.querySelector('.timer')
    elTimer.textContent = 'Time Elapsed: 0.000'
    playAgain()
}

function getClassName(location) {

    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}


var gStartTime
var gTimerInterval

function startTimer() {

    gStartTime = Date.now()
    updateTimer()
    gTimerInterval = setInterval(updateTimer, 1)
}

function updateTimer() {
    var currentTime = Date.now()
    var elapsedTime = currentTime - gStartTime
    var seconds = ((elapsedTime % 60000) / 1000).toFixed(3)

    document.querySelector('.timer').textContent = `Time Elapsed: ${seconds}`
}



////////////////////////////////////////
//Bonus Tasks//


function onSafeClick() {

    console.log('Safe click button was clicked.')
    
    if (gGame.safeClicks > 0 && gGame.isOn === true ){
    const safeCellLocation = getRandomSafeCell()

    const safeCellSelector = '.' + getClassName({ i: safeCellLocation.row, j: safeCellLocation.col })
    const elSafeCell = document.querySelector(safeCellSelector)

    elSafeCell.classList.add('highlighted')

    setTimeout(() => {
        elSafeCell.classList.remove('highlighted');
    }, 700)

    gGame.safeClicks--


    rendSafeClicks()
    }
}

function getRandomSafeCell() {
    var randRowIdx = getRandomInt(0, gLevel.SIZE);
    var randColIdx = getRandomInt(0, gLevel.SIZE);
    var safeCell = gBoard[randRowIdx][randColIdx];

    while (safeCell.isMine === true || safeCell.isShown === true) {
        randRowIdx = getRandomInt(0, gLevel.SIZE);
        randColIdx = getRandomInt(0, gLevel.SIZE);
        safeCell = gBoard[randRowIdx][randColIdx];
    }

    return { row: randRowIdx, col: randColIdx };
}

function rendSafeClicks(){

    const elSafeCounter = document.querySelector(".safe")
    elSafeCounter.innerText =`${gGame.safeClicks} clicks available`
    
}