<script>
  import { Link, navigateTo } from 'svero'
  import { username } from '../../stores.js';
  import { database } from '../../config/firebase'
  
  const crowns = ['gold.png', 'silver.png', 'bronze.png']
  let temp = []
  
   // get score data
  let usersRef = database.ref('users')
  usersRef.on('value', function(snapshot) {
      temp = []
      snapshot.forEach(function(childSnapshot) {
        let childData = childSnapshot.val()
        if(childData.current_score != undefined)
          temp.push(childData)
      }) 

      // sorting high_score (priority : high_score, current_score)
      temp = temp.sort((a, b) => (a.high_score < b.high_score) ? 1 : (a.high_score === b.high_score) ? 
        ((a.current_score < b.current_score) ? 1 : -1) : -1)

  })

  function getImageSource(filename){
    return require(`./assets/images/${filename}`)
  }

  function osFilter(os){
    let image = new Image()
    os = os.includes('Android') ? 'android.png' : 'ios.png'
    image.src = getImageSource(os)
    image.title = os
    return `<img src="${image.src}" title="${image.title}" alt="${image.title}" width="20px"  />`
  }
  
  function cutText(str){
    return (str ? str : '').substring(0, (str ? str : '').indexOf(")")+1)
  }

  function playGame(e){
    $username = prompt('Input your name : ') 
    if ($username) {
      navigateTo('/game')
    }
  }
</script>
<style>
  * {
    padding: 0;
    margin: 0;
  }
  
  .container{
    background: #0b2d53;
    min-height: 100vh;
    font-family: 'Roboto';
    color: white;
    overflow: hidden;
    padding: 15px;
  }

  .helmet{
    height: 40px;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 10px 0;
    text-decoration: none;
  }
  .armour{
    overflow-x: scroll;
  }
  .helmet > .helmet-title{
    color: white;
    padding: 10px;
  }

  .table{
    width: 100%;
    background: #0b2d53;
    color: white;
    border-collapse: collapse;
  }

  .table tbody{
    background-color: #0e3964;
  }

  .table th{
    background-color: transparent;
    text-transform: uppercase;
    color: #caecee;
    font-weight: bold;
    padding: 5px;
  }

  .table th:nth-child(2){
    text-align: left;
  }

  .table tr{
    margin: 3px 0;
    border-bottom: 3px solid #0b2d53;
  }

  .table td{
    padding: 5px;
  }

  .table td:first-child{
    text-align: center;
    border-right: 3px solid #0b2d53;
  }

  .table td small{
    color: #84aebf;
    text-overflow: ellipsis;
    font-size: 12px;
  }

  .text-center{
    text-align: center;
  }

  .bold{
    font-weight: bold;
  }

  .btn-play{
    color: white;
    text-decoration: none;
    border: 1px solid white;
    border-radius: 5px;
    padding: 8px 10px;
  }

 .crowns-container{
    display:flex; 
    align-items: center; 
    justify-content: center;
  }

  .crowns{
    margin-right: 5px;
    width: 20px;
  }
</style>

<div class="container">
  <div class="helmet">
    <div class="btn-play" on:click={playGame}>Play Game</div>
    <label class="helmet-title">#21 BandungJS</label>
  </div>
  <div class="armour">
    {#if temp.length > 0}
      <table class="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th colspan="2">Player</th>
            <th>Current Score</th>
            <th>High Score</th>
          </tr>
        </thead>
        <tbody>
          {#each temp as t, idx}
            <tr>
              <td>
                <div class="crowns-container">
                  {#if (idx < 3) }
                    <img class="crowns" src="{getImageSource(crowns[idx])}" alt="crown"/>
                  {/if}
                  {idx+1}
                </div>
              </td>
              <td class="text-center">{@html osFilter(t.user_agent != undefined ? t.user_agent : '-')}</td>
              <td>  
                <div>{t.username}</div>
                <small>{cutText(t.user_agent)}</small>
              </td>
              <td class="text-center bold">{t.current_score}</td>
              <td class="text-center bold">{t.high_score}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>Please wait a seconds...</p>
    {/if}
  </div>
</div>