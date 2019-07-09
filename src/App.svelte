<script>
  import { Router, Route } from 'svero'

  import Home from '@components/home/Home.svelte'
  import Canvas from '@components/canvas/Canvas.svelte'
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/game" component={Canvas} />
</Router>
