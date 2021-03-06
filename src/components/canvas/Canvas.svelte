<script>
  import { onMount } from 'svelte'
  import { navigateTo } from 'svero'
  import { username, lastKey, hasKey, isPlaying } from '@stores';
  import { database } from '@config/firebase.js'

  let uniqueID = $lastKey == null ?  Math.random().toString(36).substring(7) : $lastKey
  lastKey.update(value => value = uniqueID)

  // check username is exists
  if($username == null){
    $username = prompt('Input your name : ')
    while($username == null || $username.length == 0){
      $username = prompt('Input your name : ')
    }
  }

  function scoreboardScene(){
    console.log('jump to scoreboard scene')
    navigateTo('/')
  }

  function getDate(){
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0')
    let yyyy = today.getFullYear()

    today = mm + '/' + dd + '/' + yyyy
    return today
  }

  function writeScore(unique_id, name, current_score, high_score, user_agent, date) {
    hasKey.update(value => value = unique_id)
    database.ref('users/' + unique_id).set({
      username: name,
      current_score: current_score,
      high_score: high_score,
      user_agent: user_agent,
      date: date,
      unique_id: unique_id,
    }, function(error) {
      if (error)
        console.log(error)
      else 
        console.log('data has been saved')
    })
  }

  let canvas

  onMount(() => {
    const ctx = canvas.getContext('2d')

    let frame

    const device = {
      width: (window.innerWidth > 0) ? window.innerWidth : screen.width,
      height: (window.innerHeight > 0) ? window.innerHeight : screen.height,
    }
    
    const CANVAS_WIDTH = canvas.width
    const CANVAS_HEIGHT = canvas.height

    const PRIMARY_COLOR = '#f58220'
    const SECONDARY_COLOR = 'white'

    let frames = 0
    const DEGREE = Math.PI / 180

    /**
     * @param {string} params.src
     * @param {string} params.alt
     */
    function createImage({
      src = 'sprite.png',
      alt = 'sprites images',
    } = {}) {
      const image = new Image()
      image.src = require(`@assets/images/${src}`)
      image.alt = alt
      return image
    }

    /**
     * @param {string} file
     */
    function createAudio(file, loop = false) {
      const audio = new Audio()
      audio.src = require(`@assets/audio/${file}`)
      audio.loop = loop
      return audio
    }

    const BACKSOUND = createAudio('backsound.mp3', true)
    const SCORE_S = createAudio('point.mp3')
    const FLAP = createAudio('flap.mp3')
    const HIT = createAudio('hit.wav')
    const SWOOSHING = createAudio('swoosh.wav')
    const DIE = createAudio('die.mp3')

    const state = {
      current: 0,
      getReady: 0,
      game: 1,
      over: 2,
    }

    const restartBtn = {
      x: 0,
      y: 0,
      w: device.width,
      h: device.height,
    }

    // game controls
    canvas.addEventListener('touchstart', e => {
      switch (state.current) {
        case state.getReady:
          state.current = state.game

          if($isPlaying){
            BACKSOUND.play()
            isPlaying.update(value => value = false)
          }

          SWOOSHING.play()
          break
        case state.game:
          if (dragon.y - dragon.radius <= 0) return
          dragon.flap()
          FLAP.play()
          break
        case state.over:
          let rect = canvas.getBoundingClientRect()
          let clickX = e.touches[0].clientX - rect.left
          let clickY = e.touches[0].clientY - rect.top
          
          // check if we click on the start button
          if (
            clickX >= restartBtn.x &&
            clickX <= restartBtn.x + restartBtn.w &&
            clickY >= restartBtn.y &&
            clickY <= restartBtn.y + restartBtn.h
          ) {
            obstacles.reset()
            dragon.speedReset()
            score.reset()
            state.current = state.getReady
          }
          break
      }
    })

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

    const fg = {
      sX: 277,
      sY: 0,
      w: 222,
      h: 104,
      x: -222,
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
          320,
          this.h+8,
        )
        ctx.drawImage(
          createImage(),
          this.sX,
          this.sY,
          this.w,
          this.h,
          this.x + 320,
          this.y,
          320,
          this.h+8,
        )
      },

      update: function() {
        if (state.current == state.game)
          this.x = (this.x - this.dx) % (320/1)
      },
    }

    const dragon = {
      animation: [
        {sX: 10, sY: 0},
        {sX: 200, sY: 0},
        {sX: 393, sY: 0},
        {sX: 200, sY: 0},
      ],
      x: 30,
      y: 150,
      w: 42,
      h: 57,

      radius: 15,

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
          createImage( {src: 'sprite-dragon.png' }),
          dragon.sX,
          dragon.sY,
          162,
          177,
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
          } else 
            this.rotation = -15 * DEGREE

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
      drawBackground: function() {
        ctx.drawImage(
          createImage(),
          320,
          112,
          100,
          100,
          0,
          0,
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        )
      },
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

          let bottomObstacleYPos = p.y + this.h + this.gap

          // Check Collision
          if (
            dragon.x + dragon.radius > p.x &&
            dragon.x - dragon.radius < p.x + this.w &&
            dragon.y + dragon.radius > p.y &&
            dragon.y - dragon.radius < p.y + this.h
          ) {
            console.log('[collided] top obstacles')
            state.current = state.over
            HIT.play()
          }
          if (
            dragon.x + dragon.radius > p.x &&
            dragon.x - dragon.radius < p.x + this.w &&
            dragon.y + dragon.radius > bottomObstacleYPos &&
            dragon.y - dragon.radius < bottomObstacleYPos + this.h
          ) {
            console.log('[collided] bottom obstacles')
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
            score.high_score = Math.max(score.value, score.high_score)
            localStorage.setItem(`high_score_${uniqueID}`, score.high_score)
            writeScore(uniqueID, $username, score.value, score.high_score, navigator.userAgent, getDate())            
          }
        }
      },

      reset: function() {
        this.position = []
        frames = 0
      },
    }

    const score = {
      high_score: parseInt(localStorage.getItem(`high_score_${uniqueID}`)) || 0,
      value: 0,

      draw: function() {
        ctx.fillStyle = '#000'
        ctx.strokeStyle = '#fff'

        if (state.current == state.game) {
          ctx.lineWidth = 1
          ctx.font = 'bold 35px Arial'
          ctx.fillText(this.value, CANVAS_WIDTH / 2, 50)
          ctx.strokeText(this.value, CANVAS_WIDTH / 2, 50)
        } else if (state.current == state.over) {
          gameOver.drawBackground()
          gameOver.draw()

          ctx.font = '25px Arial'
          ctx.fillText(this.value, 170, 180)
          ctx.fillText(this.high_score, 170, 215)
        }
      },

      reset: function() {
        this.value = 0
      },
    }

    function draw() {
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

    function update() {
      dragon.update()
      fg.update()
      obstacles.update()
    }

    (function loop(){
      update()
      draw()
      frames++
      frame = requestAnimationFrame(loop)
    }()) 

		return () => {
			cancelAnimationFrame(frame)
		}
  })

  let temp = []
  let tempRank = '-'
  
   // get score data
  let usersRef = database.ref('users')
  usersRef.on('value', function(snapshot) {
      temp = []
      
      snapshot.forEach(function(childSnapshot) {
        let childData = childSnapshot.val()
        
        if(childData.current_score != undefined){
          temp.push(childData)
        }
      }) 

      // sorting high_score (priority : high_score, current_score)
      temp = temp.sort((a, b) => (a.high_score < b.high_score) ? 1 : (a.high_score === b.high_score) ? 
        ((a.current_score < b.current_score) ? 1 : -1) : -1)
      temp.map((item, idx) => {
        if(item.unique_id == uniqueID){
          tempRank = idx+1
          return
        }  
      })

  })
  $: currentRank = tempRank
</script>

<style>
  .helmet{
    background: #f58220;
    width: calc(100% - 6px);
    height: 20px;
    padding: 3px;
    font-size: 14px;
    color: white;
    font-family: 'Roboto';
    display: flex;
    justify-content: space-between;
  }
  canvas {
    width: 100%;
    height: calc(100vh - 20px);
  }
  label.user-label{
    color: white;
  }
  label.scoreboard-label{
    color: white;
    background-color: #7a400d;
    font-size: 12px;
    border-radius: 2px;
    padding: 3px 5px;
  }
</style>
<div class="helmet">
  <label class="user-label">Hello, <strong>{$username}</strong></label>
  <label class="scoreboard-label" on:click={scoreboardScene}>You're in rank <strong>{currentRank}</strong></label>
</div>
<canvas bind:this={canvas} width={320} height={480}></canvas>
