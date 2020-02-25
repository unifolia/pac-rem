const pacApp = {}

const pacWorldDiv = document.getElementsByClassName("pacWorld")[0]
const audio = document.querySelector("audio")

let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)

audio.muted = true
audio.loop = true

let pacInitiated = false

let timeLeft = 25
let totalCoins = 0

let x = "horizontal"
let y = "vertical"

let userInput = ""
let konamiCode = "38384040373937396665"

let player = {
    name: "rembrandt",
    x: 7,
    y: 4,
    code: 3,
    counter: 0,
}

let enemy = {
    name: "enemy",
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

pacApp.onKonamiCode = callback => {
    document.addEventListener("keydown", event => {
        userInput += ("" + event.keyCode)
        if (userInput === konamiCode) {
            return callback()
        } else if (!konamiCode.indexOf(userInput)) {
            return
        } else {
            userInput = ("" + event.keyCode)
        }
    })
}

pacApp.switcheroo = () => {
    player.name = "pinky"
    audio.src = "./ghostMusic.mp3"
}

pacApp.endGame = result => {
    alert(`You ${result}!`)
    location.reload()
}

pacApp.updateScore = character => {
    character.counter++

    document.querySelector(`.${character.name}Score`).innerHTML = `${character.counter}`

    if (player.counter > totalCoins / 2) {
        pacApp.endGame("win")
    } else if (enemy.counter > totalCoins / 2) {
        pacApp.endGame("lose")
    }
}

pacApp.countDown = () => {
    setInterval(() => {
        document.querySelector("progress").value = (timeLeft -= 1)

        if (timeLeft == 0) {
            setTimeout(() => {
                pacApp.endGame("lose")
            }, 10)
        }
    }, 750)
}

pacApp.setText = () => {
    let {name, counter} = player

    document.querySelector("h2").innerHTML =
    `<span class="score">Score:</span>
    <span class="charName">${name}</span> -  
    <span class="${name}Score">${counter}</span>
    vs. 
    <span class="charName">Dog Cop</span> -  
    <span class="enemyScore">${enemy.counter}</span>`

    document.querySelector("h3").innerHTML = `Time: <progress value="${timeLeft}" max="${timeLeft}"></progress>`

    document.querySelector(".gameInfo").hidden = false
    document.querySelector(".gameInfo").setAttribute("aria-hidden", false)
    document.querySelector(".pacWorld").setAttribute("aria-hidden", true)
    document.querySelector(".volumeToggle").className = "volumeToggle squish"

    pacWorldDiv.innerHTML = ""
}

pacApp.pacWorldAppend = (type, row, column) => {
    pacWorldDiv.innerHTML += 
    `<div class="${type}" id="n${row.toString() + column}"></div>`
}

pacApp.generatePacWorld = () => {
    pacMap.forEach((row, rowNumber) => {
        row.forEach((element, columnNumber) => {
            if (element == 0) {
                pacApp.pacWorldAppend("background", rowNumber, columnNumber)
            } else if (element == 1) {
                pacApp.pacWorldAppend("coin", rowNumber, columnNumber)
                totalCoins++
            } else if (element == 2) {
                pacApp.pacWorldAppend("wall", rowNumber, columnNumber)
            } else if (element == 3) {
                pacApp.pacWorldAppend(`${player.name}`, rowNumber, columnNumber)
            } else if (element == 4) {
                pacApp.pacWorldAppend("portal", rowNumber, columnNumber)
            } else {
                pacApp.pacWorldAppend("enemy", rowNumber, columnNumber)
            } 
        })
        pacWorldDiv.innerHTML += "<br>"
    })
}

pacApp.moveCharacter = (character, movementAxis, movementUnit) => {
    if (movementAxis == y) {
        moveToBlock = pacMap[character.y + movementUnit][character.x]
    } else if (movementAxis == x) {
        moveToBlock = pacMap[character.y][character.x + movementUnit]
    }

    if (moveToBlock !== 2) {
        if (moveToBlock == 1) {
            pacApp.updateScore(character)
        } else if (moveToBlock == 3 || moveToBlock == 5) {
            pacApp.endGame("lose")
        }

        pacMap[character.y][character.x] = 0
        document.querySelector(`#n${character.y}${character.x}`).className = "background"

        if (moveToBlock == 4) {
            pacApp.portal(character, movementUnit)
        } else {
            if (movementAxis == y) {
                character.y += movementUnit
            } else {
                character.x += movementUnit
            }
        }

        pacMap[character.y][character.x] = character.code
        document.querySelector(`#n${character.y}${character.x}`).className = `${character.name}`
    }
}

pacApp.portal = (character, movement) => {
    if (pacMap[6][13] == 1 || pacMap[6][1] == 1) {
        character.counter++
    }

    if (movement == - 1) {
        character.x = 13
    } else {
        character.x = 1
    }
}

pacApp.playerMovement = () => {
    document.onkeydown = event => {
        keyPress = event.key

        if (keyPress == "ArrowUp" || keyPress == "w") {
            pacApp.moveCharacter(player, y, -1)
        } else if (keyPress == "ArrowRight" || keyPress == "d") {
            pacApp.moveCharacter(player, x, 1)
        } else if (keyPress == "ArrowDown" || keyPress == "s") {
            pacApp.moveCharacter(player, y, 1)
        } else if (keyPress == "ArrowLeft" || keyPress == "a") {
            pacApp.moveCharacter(player, x, -1)
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
        event.preventDefault()

        if (initialX === null || initialY === null) {
            return
        }

        let currentX = event.touches[0].clientX
        let currentY = event.touches[0].clientY

        let diffX = initialX - currentX
        let diffY = initialY - currentY

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                pacApp.moveCharacter(player, x, -1)
                pacApp.moveCharacter(player, x, -1)
            } else {
                pacApp.moveCharacter(player, x, 1)
                pacApp.moveCharacter(player, x, 1)
            }
        } else {
            if (diffY > 0) {
                pacApp.moveCharacter(player, y, -1)
                pacApp.moveCharacter(player, y, -1)
            } else {
                pacApp.moveCharacter(player, y, 1)
                pacApp.moveCharacter(player, y, 1)
            }
        }
        initialX = null
        initialY = null
    }
}

pacApp.enemyMovement = () => {
    setTimeout(() => {
        setInterval(() => {
            let moveToMake = randomEnemyMove()
            if (moveToMake === 0) {
                pacApp.moveCharacter(enemy, y, -1)
            } else if (moveToMake === 1) {
                pacApp.moveCharacter(enemy, x, 1)
            } else if (moveToMake === 2) {
                pacApp.moveCharacter(enemy, y, 1)
            } else if (moveToMake === 3) {
                pacApp.moveCharacter(enemy, x, -1)
            } 
        }, 50)
    }, 500)
}

document.querySelector(".volumeToggle").addEventListener("click", () => {
    document.querySelector("i").classList.toggle("fa-volume-up")
    audio.muted = !audio.muted
})

document.querySelector(".startButton").addEventListener("click", () => {
    pacInitiated = true
    pacApp.setText()
    pacApp.generatePacWorld()
    pacApp.countDown()
    pacApp.playerMovement()
    pacApp.enemyMovement()
    pacApp.detectSwipe()
    audio.play()
})

pacApp.onKonamiCode(() => {
    if (pacInitiated == false) {
        pacApp.switcheroo()
    }
})