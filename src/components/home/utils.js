/**
 * @param {string} filename 
 */
export function getImageSource(filename){
  return require(`@assets/images/${filename}`)
}

/**
 * @param {string} os 
 */
export function osFilter(os){
  let image = new Image()
  os = os.includes('Android') ? 'android.png' : 'ios.png'
  image.src = getImageSource(os)
  image.title = os
  return `<img src="${image.src}" title="${image.title}" alt="${image.title}" width="20px"  />`
}

/**
 * @param {string} str
 */
export function cutText(str){
  return (str ? str : '').substring(0, (str ? str : '').indexOf(")")+1)
}
