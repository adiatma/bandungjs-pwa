<script>
  import { Link } from 'svero'
  import * as firebase from 'firebase/app'
  import 'firebase/auth'
  import 'firebase/database'

  let temp = []

  let firebaseConfig = {
    apiKey: 'AIzaSyCpPOYISxSTRudgw1P6ttXTyMZDrpGWp6A',
    authDomain: 'bandungjs-c3782.firebaseapp.com',
    databaseURL: 'https://bandungjs-c3782.firebaseio.com',
    projectId: 'bandungjs-c3782',
    storageBucket: '',
    messagingSenderId: '1085804661670',
    appId: '1:1085804661670:web:e9dbd4949057ccf2'
  }

  firebase.initializeApp(firebaseConfig)
  let database = firebase.database()

   // get score data
  let usersRef = database.ref('users')
  usersRef.on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        let childData = childSnapshot.val()
        temp.push(childData)
      }) 

      // sorting high_score (priority : high_score, current_score)
      temp = temp.sort((a, b) => (a.high_score < b.high_score) ? 1 : (a.high_score === b.high_score) ? 
        ((a.current_score < b.current_score) ? 1 : -1) : -1)
      console.clear()
      console.table(temp)
  })
</script>

<Link href="/game">Go to game!</Link>

{#if temp.length > 0}
  <table>
    <thead>
      <tr>
        <th>username</th>
        <th>current_score</th>
        <th>high_score</th>
        <th>user agent</th>
        <th>os</th>
      </tr>
    </thead>
    <tbody>
      {#each temp as t}
        <tr>
          <td>{t.username}</td>
          <td>{t.current_score}</td>
          <td>{t.high_score}</td>
          <td>{t.user_agent}</td>
          <td>{t.os}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>Please wait a minutes...</p>
{/if}

