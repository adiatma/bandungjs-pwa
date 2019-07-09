<script>
  import { Router, Route } from 'svero'

  import Index from './components/index/Index.svelte'
  import Canvas from './components/canvas/Canvas.svelte'
</script>

<Router>
  <Route path="/" component={Index} />
  <Route path="/game" component={Canvas} />
</Router>
