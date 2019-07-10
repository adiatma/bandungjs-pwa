<script>
    import { database } from '@config/firebase.js'
    let token = ''
    $: message = ''
    function reset(){
        var ref = database.ref(`auth/admin`)
        ref.once('value')
        .then(function(snapshot) {
            let checkToken = token == snapshot.child('token').val()
            if(checkToken){
                database.ref('users').remove()
                message = 'Data has been deleted'
            }
            else{
                token = ''
                message = 'Whoops, wrong password'
            }
        });
    }
</script>
<style>
    .container{
        font-family: 'Roboto';
        background: #0b2d53;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
        color: white;
        flex-direction: column;
    }

    .flex{
        display: flex;
    }

    .custom-input{
        outline: none;
        border: 1px solid white;
        padding: 8px 10px;
        border-radius: 5px 0 0 5px;
    }

    .btn-reset{
        outline: none;
        background: #0b2d53;
        color: white;
        text-decoration: none;
        border: 1px solid white;
        border-radius: 0 5px 5px 0;
        padding: 8px 10px;
    }

    .message{
        font-size: 12px;
    }
</style>
<div class="container">
    <h4>Delete user data</h4>
    <div class="flex">
        <input class="custom-input" bind:value={token} type="password" placeholder="TOKEN" />
        <button class="btn-reset" on:click={reset}>RESET</button>
    </div>
    <p class="message">{message}</p>
</div>