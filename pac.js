const pacApp = {}

const pacWorldDiv = document.getElementsByClassName("pacWorld")[0]

let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)

let timeLeft = 50
let winningScore = 0
let totalCoins = 0
let totalCoinsArray = []
let coinsCounted = false

let x = "horizontal"
let y = "vertical"

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

pacApp.getWinScore = () => {
    totalCoinsArray.forEach(coin => {
        totalCoins += coin
    })
    winningScore = totalCoins / 2
    coinsCounted = true
}

pacApp.endGame = result => {
    alert(`You ${result}!`)
    location.reload()
}

pacApp.countScore = character => {
    character.counter++

    if (rembrandt.counter > winningScore) {
        pacApp.endGame("win")
    } else if (enemy.counter > winningScore) {
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
    }, 250)
}

pacApp.setText = () => {
    document.querySelector("h2").innerHTML =
    `<span class="score">Score:</span>
    <span class="charName">Rembrandt</span> -  
    <span class="rembrandtScore">${rembrandt.counter}</span>
    vs. 
    <span class="charName">Dog Cop</span> -  
    <span class="enemyScore">${enemy.counter}</span>`

    document.querySelector("h3").innerHTML = `Time: <progress value="${timeLeft}" max="${timeLeft}"></progress>`

    document.querySelector(".gameInfo").hidden = false
    document.querySelector(".gameInfo").setAttribute("aria-hidden", false)
    document.querySelector(".pacWorld").setAttribute("aria-hidden", true)
}

pacApp.resetMap = () => {
    pacWorldDiv.innerHTML = ""

    document.querySelector(".rembrandtScore").innerHTML = `${rembrandt.counter}`
    document.querySelector(".enemyScore").innerHTML = `${enemy.counter}`
}

pacApp.pacWorldAppend = type => {
    pacWorldDiv.innerHTML += `<div class="${type}"></div>`
}

pacApp.generatePacWorld = () => {
    pacApp.resetMap()
    pacMap.forEach(row => {
        row.forEach(element => {
            if (element == 0) {
                pacApp.pacWorldAppend("background")
            } else if (element == 1) {
                pacApp.pacWorldAppend("coin")
                if (coinsCounted == false) {
                    totalCoinsArray.push(element)
                }
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

    if (coinsCounted == false) {
        pacApp.getWinScore()
    }
}

pacApp.moveCharacter = (character, movementAxis, movementUnit) => {
    if (movementAxis == y) {
        moveToBlock = pacMap[character.y + movementUnit][character.x]
    } else if (movementAxis == x) {
        moveToBlock = pacMap[character.y][character.x + movementUnit]
    }

    if (moveToBlock !== 2) {
        if (moveToBlock == 1) {
            pacApp.countScore(character)
        } else if (moveToBlock == 3 || moveToBlock == 5) {
            pacApp.endGame("lose")
        }

        pacMap[character.y][character.x] = 0

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

        pacApp.generatePacWorld()
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

pacApp.rembrandtMovement = () => {
    document.onkeydown = event => {
        keyPress = event.key

        if (keyPress == "ArrowUp" || keyPress == "w") {
            pacApp.moveCharacter(rembrandt, y, -1)
        } else if (keyPress == "ArrowRight" || keyPress == "d") {
            pacApp.moveCharacter(rembrandt, x, 1)
        } else if (keyPress == "ArrowDown" || keyPress == "s") {
            pacApp.moveCharacter(rembrandt, y, 1)
        } else if (keyPress == "ArrowLeft" || keyPress == "a") {
            pacApp.moveCharacter(rembrandt, x, -1)
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
                pacApp.moveCharacter(rembrandt, x, -1)
            } else {
                pacApp.moveCharacter(rembrandt, x, 1)
            }
        } else {
            if (diffY > 0) {
                pacApp.moveCharacter(rembrandt, y, -1)
            } else {
                pacApp.moveCharacter(rembrandt, y, 1)
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
        }, 25)
    }, 500)
}

document.querySelector("button").addEventListener("click", () => {
    pacApp.setText()
    
    pacApp.generatePacWorld()
    pacApp.countDown()
    pacApp.rembrandtMovement()
    pacApp.enemyMovement()
    pacApp.detectSwipe()
})