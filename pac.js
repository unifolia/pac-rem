const pacApp = {}

// Some 🆕 and 🆒 variables 
let pacInitiated = false
let timeLeft = 60
let totalCoins = 0
let x = "horizontal"
let y = "vertical"
let userInput = ""
let konamiCode = "38384040373937396665"
let initialX = null
let initialY = null

const pacWorldDiv = document.getElementsByClassName("pacWorld")[0]
const audio = document.querySelector("audio")
audio.muted = true
audio.loop = true
// for mobile height
let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)

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

let generateNumber = n => {
    return Math.floor(Math.random() * n)
}

// Wildcard for map generation
let w = () => {
    return Math.round(Math.random() + 1)
}

// 0 = background
// 1 = coin
// 2 = wall
// 3 = player
// 4 = portal
// 5 = enemy
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

// Generate ghost on Konami code
pacApp.switcheroo = () => {
    let ghostNo = generateNumber(4)

    if (ghostNo == 0) {
        player.name = "blinky"
    } else if (ghostNo == 1) {
        player.name = "pinky"
    } else if (ghostNo == 2) {
        player.name = "inky"
    } else {
        player.name = "clyde"
    }

    audio.src = "./music/ghostMusic.mp3"
}

pacApp.endGame = result => {
    alert(`You ${result}!`)
    location.reload()
}

pacApp.updateScore = character => {
    character.counter++

    document.querySelector(`.${character.name}Score`).innerHTML = 
    `${character.counter}`

    if (player.counter > totalCoins / 2) {
        pacApp.endGame("win")
    } else if (enemy.counter > totalCoins / 2) {
        pacApp.endGame("lose")
    }
}

pacApp.countDown = () => {
    setInterval(() => {
        document.querySelector("progress").value = (timeLeft -= 1)

        if (timeLeft === 0) {
            setTimeout(() => {
                if (player.counter !== enemy.counter) {
                    pacApp.endGame("lose")
                } else {
                    pacApp.endGame("end up in a draw! What a stunning display of athleticism and sportsmanship by both characters. Thank you")
                }
            }, 10)
        }
    }, 250)
}

// Reset body content when world is generated
pacApp.setText = () => {
    document.querySelector("h2").innerHTML =
    `<span class="score">Score:</span>
    <span class="charName">${player.name}</span> -  
    <span class="${player.name}Score">${player.counter}</span>
    vs. 
    <span class="charName">Dog</span> -  
    <span class="enemyScore">${enemy.counter}</span>`

    document.querySelector("h3").innerHTML = 
    `Time: <progress value="${timeLeft}" max="${timeLeft}"></progress>`

    document.querySelector(".gameInfo").hidden = false
    document.querySelector(".gameInfo").setAttribute("aria-hidden", false)
    document.querySelector(".pacWorld").setAttribute("aria-hidden", true)
    document.querySelector(".volumeToggle").className = "volumeToggle squish"
}

// Each element block has a unique ID to keep track of movement/status
pacApp.pacWorldAppend = (type, row, column) => {
    pacWorldDiv.innerHTML += 
    `<div class="${type}" id="n${row + "-" + column}"></div>`
}

// Loop through pacWorld arrays and create game map
// Path: rows > columns > associated "element" code in each column
pacApp.generatePacWorld = () => {
    pacWorldDiv.innerHTML = ""

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
    // The coordinates before movement
    let {x: thisX, y: thisY} = character

    // moveToBlock = character's location after movement
    if (movementAxis == y) {
        moveToBlock = pacMap[thisY + movementUnit][thisX]
    } else if (movementAxis == x) {
        moveToBlock = pacMap[thisY][thisX + movementUnit]
    }

    // 0 = background
    // 1 = coin
    // 2 = wall
    // 3 = player
    // 4 = portal
    // 5 = enemy
    if (moveToBlock !== 2) {
        if (moveToBlock == 3 || moveToBlock == 5) {
            pacApp.endGame("lose")
        } else if (moveToBlock == 4) {
            pacApp.portal(character, movementUnit)
        } else {
            if (movementAxis == y) {
                character.y += movementUnit
            } else {
                character.x += movementUnit
            }
        }
        
        let oldBlock = document.querySelector(`#n${thisY}-${thisX}`)
        let newBlock = document.querySelector(`#n${character.y}-${character.x}`)
        
        pacMap[thisY][thisX] = 0
        oldBlock.className = "background"

        pacMap[character.y][character.x] = character.code
        newBlock.className = `${character.name}`

        if (moveToBlock == 1) {
            pacApp.updateScore(character)
        }
    }
}

pacApp.portal = (character, movement) => {
    // If (coins beside portal)
    if (pacMap[6][13] == 1 || pacMap[6][1] == 1) {
        pacApp.updateScore(character)
    }

    // Portal functionality
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

    function startTouch(event) {
        initialX = event.touches[0].clientX
        initialY = event.touches[0].clientY
    }

    function moveTouch(event) {
        if (initialX !== null || initialY !== null) {
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
}

pacApp.enemyMovement = () => {
    setTimeout(() => {
        setInterval(() => {
            let move = generateNumber(2)

            // Enemy A.I. version 1.0
            // Goals: Enemy to not get stuck, enemy to utilize portals
            // More to come!
            if (player.x > enemy.x) {
                if (player.y > enemy.y) {
                    if (move == 0) {
                        pacApp.moveCharacter(enemy, y, 1)
                    } else {
                        pacApp.moveCharacter(enemy, x, 1)
                    }
                } else {
                    if (move == 0) {
                        pacApp.moveCharacter(enemy, y, -1)
                    } else {
                        pacApp.moveCharacter(enemy, x, 1)
                    } 
                }
            } else {
                if (player.y > enemy.y) {
                    if (move == 0) {
                        pacApp.moveCharacter(enemy, y, 1)
                    } else {
                        pacApp.moveCharacter(enemy, x, -1)
                    }
                } else {
                    if (move == 0) {
                        pacApp.moveCharacter(enemy, y, -1)
                    } else {
                        pacApp.moveCharacter(enemy, x, -1)
                    }
                }
            }
        }, 85)
    }, 100)
}

document.querySelector(".volumeToggle").addEventListener("click", () => {
    document.querySelector("i").classList.toggle("fa-volume-up")
    audio.muted = !audio.muted
})

// Start it all up
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
    if (!pacInitiated) {
        pacApp.switcheroo()
    }
})