const globalStyle = require('./assets/css/main.css')
const PosterBandungJS = require('./assets/img/poster-bandungjs.jpeg')

function great(name) {
  return `Hello, ${name}`
}

document.body.innerHTML = `
  <div>
    <h1>${great('BandungJS')}</h1>  
    <img src="${PosterBandungJS}" alt="${PosterBandungJS}" />
  </div>
`
