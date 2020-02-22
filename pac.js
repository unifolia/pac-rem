const pacApp = {}

let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)

let catCounter = 0
let upLeftMovement = -1
let downRightMovement = 1

const pacWorldDiv = document.getElementsByClassName('pacWorld')[0]
const scoreHeader = document.getElementsByClassName('score')[0]

let rembrandt = {
    x: 7,
    y: 4,
    code: 3,
    counter: 0,
}

let enemy = {
    x: 7,
    y: 6,
    code: 5,
    counter: 0,
}

let randomEnemyMove = () => {
    return Math.floor(Math.random() * 4)
}

// Wildcard
let w = () => {
    return Math.round(Math.random() + 1)
}

let pacMap = [
    [2, 2, 2, 2, 2,   2, 2, 2, 2, 2, 2,   2, 2, 2, 2],
    [2, 1, 1, 1, 1,   1, 2, 2, 2, 1, 1,   1, 1, 1, 2],
    [2, 1, 2, 2, 2,   1, 1, 1, 1, 1, 2,   2, 2, 1, 2],
    [2, 1, 1, 1, w(), 1, 2, 1, 2, 1, w(), 1, 1, 1, 2],
    [2, 1, 1, 1, w(), 1, 2, 3, 2, 1, w(), 1, 1, 1, 2],
    [2, 2, 2, 1, w(), 1, 2, 2, 2, 1, w(), 1, 2, 2, 2],
    [4, 1, 1, 1, 2,   1, 1, 5, 1, 1, 2,   1, 1, 1, 4],
    [2, 2, 2, 1, w(), 1, 2, 2, 2, 1, w(), 1, 2, 2, 2],
    [2, 1, 1, 1, w(), 1, 1, 1, 1, 1, w(), 1, 1, 1, 2],
    [2, 1, 2, 2, w(), 1, 2, 2, 2, 1, w(), 2, 2, 1, 2],
    [2, 1, 1, 1, 1,   1, 1, 2, 1, 1, 1,   1, 1, 1, 2],
    [2, 2, 2, 2, 2,   2, 2, 2, 2, 2, 2,   2, 2, 2, 2],
]

pacApp.youLose = () => {
    alert("You lose!")
    location.reload()
}

pacApp.countScore = () => {
    if (enemy.counter + rembrandt.counter == 78) {
        if (rembrandt.counter > enemy.counter) {
            alert("You win!")
            location.reload()
        } else {
            pacApp.youLose()
        }
    } 
}

pacApp.setMap = () => {
    pacWorldDiv.innerHTML = ""
    scoreHeader.innerHTML = `Rembrandt: <span class="counter">${rembrandt.counter} | Dog Cop: ${enemy.counter}</span>`
}

pacApp.pacWorldAppend = typeToAppend => {
    pacWorldDiv.innerHTML += `<div class="${typeToAppend}"></div>`
}

pacApp.generatePacWorld = () => {
    pacApp.countScore()
    pacApp.setMap()
    pacMap.forEach(row => {
        row.forEach(element => {
            if (element == 0) {
                pacApp.pacWorldAppend("background")
            } else if (element == 1) {
                pacApp.pacWorldAppend("coin")
            } else if (element == 2) {
                pacApp.pacWorldAppend("wall")
            } else if (element == 3) {
                pacApp.pacWorldAppend("rembrandt")
            } else if (element == 4) {
                pacApp.pacWorldAppend("portal")
            } else {
                pacApp.pacWorldAppend("enemy")
            }
        })
        pacWorldDiv.innerHTML += "<br>"
    })
}

pacApp.canMoveVertical = (character, movement) => {
    if (pacMap[character.y + movement][character.x] !== 2) {
        if (pacMap[character.y + movement][character.x] == 3 || pacMap[character.y + movement][character.x] == 5) {
            pacApp.youLose()
        }
        pacApp.increaseCounterUD(character, movement)

        pacMap[character.y][character.x] = 0
        character.y += movement
        pacMap[character.y][character.x] = character.code
        pacApp.generatePacWorld()
    }
}

pacApp.canMoveHorizontal = (character, movement) => {
    if (pacMap[character.y][character.x + movement] !== 2) {
        if (pacMap[character.y][character.x + movement] == 3 || pacMap[character.y][character.x + movement] == 5) {
            pacApp.youLose()
        }
        pacApp.increaseCounterLR(character, movement)

        pacMap[character.y][character.x] = 0

        if (pacMap[character.y][character.x + movement] !== 4) {
            character.x += movement
        } else {
            pacApp.portal(character, movement)
        }

        pacMap[character.y][character.x] = character.code
        pacApp.generatePacWorld()
    }
}

pacApp.increaseCounterLR = (character, movement) => {
    if (pacMap[character.y][character.x + movement] == 1) {
        character.counter++
    }
}

pacApp.increaseCounterUD = (character, movement) => {
    if (pacMap[character.y + movement][character.x] == 1) {
        character.counter++
    }
}

pacApp.portal = (character, movement) => {
    let portalY = pacMap[6]

    if (movement == - 1) {
        if (portalY[13] == 1) {
            portalY[13] == 3
            character.counter++
        }
        character.x = 13
    } else {
        if (portalY[1] == 1) {
            portalY[1] == 3
            character.counter++
        }
        character.x = 1
    }
}

pacApp.initializeMovement = () => {
    document.onkeydown = event => {
        keyPress = event.key

        if (keyPress == "ArrowUp" || keyPress == "w") {
            pacApp.canMoveVertical(rembrandt, upLeftMovement)
        } else if (keyPress == "ArrowRight" || keyPress == "d") {
            pacApp.canMoveHorizontal(rembrandt, downRightMovement)
        } else if (keyPress == "ArrowDown" || keyPress == "s") {
            pacApp.canMoveVertical(rembrandt, downRightMovement)
        } else if (keyPress == "ArrowLeft" || keyPress == "a") {
            pacApp.canMoveHorizontal(rembrandt, upLeftMovement)
        }
    }
}

pacApp.detectSwipe = () => {
    document.addEventListener("touchstart", startTouch, false)
    document.addEventListener("touchmove", moveTouch, false)

    let initialX = null
    let initialY = null

    function startTouch(event) {
        initialX = event.touches[0].clientX
        initialY = event.touches[0].clientY
    }

    function moveTouch(event) {
        if (initialX === null) {
            return
        }

        if (initialY === null) {
            return
        }

        var currentX = event.touches[0].clientX
        var currentY = event.touches[0].clientY

        var diffX = initialX - currentX
        var diffY = initialY - currentY

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                pacApp.canMoveHorizontal(rembrandt, upLeftMovement)
            } else {
                pacApp.canMoveHorizontal(rembrandt, downRightMovement)
            }
        } else {
            if (diffY > 0) {
                pacApp.canMoveVertical(rembrandt, upLeftMovement)
            } else {
                pacApp.canMoveVertical(rembrandt, downRightMovement)
            }
        }

        initialX = null
        initialY = null

        event.preventDefault()
    }
}

const enemyMovement = () => {
    setInterval(() => {
        let moveToMake = randomEnemyMove()
        if (moveToMake === 0) {
            pacApp.canMoveVertical(enemy, upLeftMovement)
        } else if (moveToMake === 1) {
            pacApp.canMoveHorizontal(enemy, downRightMovement)
        } else if (moveToMake === 2) {
            pacApp.canMoveVertical(enemy, downRightMovement)
        } else if (moveToMake === 3) {
            pacApp.canMoveHorizontal(enemy, upLeftMovement)
        } 
        }, 5)
}

document.addEventListener("click", event => {
    if (event.target.localName == "h2") {
        pacApp.generatePacWorld()
        pacApp.initializeMovement()
        pacApp.detectSwipe()
        enemyMovement()
    }
})