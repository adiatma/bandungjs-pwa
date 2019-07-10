<script>
  import { Router, Route } from 'svero'

  import Home from '@components/home/Home.svelte'
  import Canvas from '@components/canvas/Canvas.svelte'
  import Reset from '@components/reset/Reset.svelte'
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/game" component={Canvas} />
  <Route path="/reset" component={Reset} />
</Router>
