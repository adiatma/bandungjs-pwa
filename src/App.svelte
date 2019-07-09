<script>
  import { Router, Route } from 'svero'

  import Canvas from './Canvas.svelte'
  import Index from './Index.svelte'

</script>

<Router>
  <Route path="/" component={Index} />
  <Route path="/game" component={Canvas} />
</Router>
