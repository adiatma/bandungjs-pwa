const mainCss = require('./assets/css/main.css')

function mountElement({elementID, width = 320, height = 480}) {
  return `
    <canvas id="${elementID}" width="${width}" height="${height}"></canvas>
  `
}

const mountEl = mountElement({
  elementID: 'app',
})

document.body.innerHTML = `${mountEl}`

const canvas = document.getElementById('app')
const ctx = canvas.getContext('2d')
const CANVAS_WIDTH = canvas.width
const CANVAS_HEIGHT = canvas.height

const PRIMARY_COLOR = '#f58220'
const SECONDARY_COLOR = 'white'

let frames = 0
const DEGREE = Math.PI / 180

const ASSETS = './assets'
const IMAGES = `${ASSETS}/images`
const AUDIO = `${ASSETS}/audio`

/**
 * @param {string} params.src
 * @param {string} params.alt
 */
function createImage({
  src = 'sprite.png',
  alt = 'sprites images',
} = {}) {
  const image = new Image()
  image.src = require(`${IMAGES}/${src}`)
  image.alt = alt
  return image
}

/**
 * @param {string} file
 */
function createAudio(file) {
  const audio = new Audio()
  audio.src = require(`${AUDIO}/${file}`)
  return audio
}

const BG_MUSIC = createAudio('bg_music.mp3')
const SCORE_S = createAudio('point.mp3')
const FLAP = createAudio('flap.mp3')
const HIT = createAudio('sfx_hit.wav')
const SWOOSHING = createAudio('sfx_swooshing.wav')
const DIE = createAudio('die.mp3')

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
}

const startBtn = {
  x: 0,
  y: 0,
  w: CANVAS_WIDTH,
  h: CANVAS_HEIGHT,
}

// CONTROL THE GAME
canvas.onclick = e => {
  switch (state.current) {
    case state.getReady:
      state.current = state.game
      SWOOSHING.play()
      break
    case state.game:
      if (dragon.y - dragon.radius <= 0) return
      dragon.flap()
      FLAP.play()
      break
    case state.over:
      let rect = canvas.getBoundingClientRect()
      let clickX = e.clientX - rect.left
      let clickY = e.clientY - rect.top

      // check if we click on the start button
      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        obstacles.reset()
        dragon.speedReset()
        score.reset()
        state.current = state.getReady
      }
      break
  }
}

const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: CANVAS_HEIGHT - 226,

  draw: function() {
    ctx.drawImage(
      createImage(),
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h,
    )
    ctx.drawImage(
      createImage(),
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h,
    )
  },
}

// FOREGROUND
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: CANVAS_HEIGHT - 112,

  dx: 2,

  draw: function() {
    ctx.drawImage(
      createImage(),
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h,
    )
    ctx.drawImage(
      createImage(),
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h,
    )
  },

  update: function() {
    if (state.current == state.game)
      this.x = (this.x - this.dx) % (this.w / 2)
  },
}

const dragon = {
  animation: [
    {sX: 276, sY: 112},
    {sX: 276, sY: 139},
    {sX: 276, sY: 164},
    {sX: 276, sY: 139},
  ],
  x: 20,
  y: 150,
  w: 34,
  h: 26,

  radius: 12,

  frame: 0,

  gravity: 0.25,
  jump: 4.6,
  speed: 0,
  rotation: 0,

  draw: function() {
    let dragon = this.animation[this.frame]

    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.drawImage(
      createImage(),
      dragon.sX,
      dragon.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h,
    )

    ctx.restore()
  },

  flap: function() {
    this.speed = -this.jump
  },

  update: function() {
    // if the game state is get ready state, the dragon must flap slowly
    this.period = state.current == state.getReady ? 10 : 5
    // we increment the frame by 1, each period
    this.frame += frames % this.period == 0 ? 1 : 0
    // frame goes from 0 to 4, then again to 0
    this.frame = this.frame % this.animation.length

    if (state.current == state.getReady) {
      this.y = 150 // reset player position
      this.rotation = 0 * DEGREE
    } else {
      this.speed += this.gravity
      this.y += this.speed

      if (this.y + this.h / 2 >= CANVAS_HEIGHT - fg.h) {
        this.y = CANVAS_HEIGHT - fg.h - this.h / 2
        if (state.current == state.game) {
          state.current = state.over
          DIE.play()
        }
      }

      // if the speed is greater than the jump means the dragon is falling down
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE
        this.frame = 1
      } else {
        this.rotation = -25 * DEGREE
      }
    }
  },
  speedReset: function() {
    this.speed = 0
  },
}

const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 180,
  x: CANVAS_WIDTH / 2 - 173 / 2,
  y: 80,

  draw: function() {
    if (state.current == state.getReady)
      ctx.drawImage(
        createImage(),
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h,
      )
  },
}

const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: CANVAS_WIDTH / 2 - 225 / 2,
  y: 90,

  draw: function() {
    if (state.current == state.over)
      ctx.drawImage(
        createImage(),
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h,
      )
  },
}

const obstacles = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },

  w: 53,
  h: 400,
  gap: 100,
  maxYPos: -150,
  dx: 2,

  draw: function() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i]

      let topYPos = p.y
      let bottomYPos = p.y + this.h + this.gap

      // obstacles
      ctx.drawImage(
        createImage(),
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h,
      )
      ctx.drawImage(
        createImage(),
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h,
      )
    }
  },

  update: function() {
    if (state.current !== state.game) return

    if (frames % 100 == 0) {
      this.position.push({
        x: CANVAS_WIDTH,
        y: this.maxYPos * (Math.random() + 1),
      })
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i]

      let bottomPipeYPos = p.y + this.h + this.gap

      // Check Collision
      if (
        dragon.x + dragon.radius > p.x &&
        dragon.x - dragon.radius < p.x + this.w &&
        dragon.y + dragon.radius > p.y &&
        dragon.y - dragon.radius < p.y + this.h
      ) {
        state.current = state.over
        HIT.play()
      }
      if (
        dragon.x + dragon.radius > p.x &&
        dragon.x - dragon.radius < p.x + this.w &&
        dragon.y + dragon.radius > bottomPipeYPos &&
        dragon.y - dragon.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.over
        HIT.play()
      }

      // obtacles movement
      p.x -= this.dx

      // if the obstacles go beyond canvas, we delete them from the array
      if (p.x + this.w <= 0) {
        this.position.shift()
        score.value += 1
        SCORE_S.play()
        score.best = Math.max(score.value, score.best)
        localStorage.setItem('best', score.best)
      }
    }
  },

  reset: function() {
    this.position = []
  },
}

const score = {
  best: parseInt(localStorage.getItem('best')) || 0,
  value: 0,

  draw: function() {
    ctx.fillStyle = '#FFF'
    ctx.strokeStyle = '#000'

    if (state.current == state.game) {
      ctx.lineWidth = 2
      ctx.font = '35px Teko'
      ctx.fillText(this.value, CANVAS_WIDTH / 2, 50)
      ctx.strokeText(this.value, CANVAS_WIDTH / 2, 50)
    } else if (state.current == state.over) {
      // score value
      ctx.font = '25px Arial'
      ctx.fillText(this.value, 225, 186)
      ctx.strokeText(this.value, 225, 186)
      // best score
      ctx.fillText(this.best, 225, 228)
      ctx.strokeText(this.best, 225, 228)
    }
  },

  reset: function() {
    this.value = 0
  },
}

draw = () => {
  ctx.fillStyle = SECONDARY_COLOR
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  bg.draw()
  obstacles.draw()
  fg.draw()
  dragon.draw()
  getReady.draw()
  gameOver.draw()
  score.draw()
}

update = () => {
  dragon.update()
  fg.update()
  obstacles.update()
}

render = () => {
  update()
  draw()
  frames++

  requestAnimationFrame(render)
}
render()
