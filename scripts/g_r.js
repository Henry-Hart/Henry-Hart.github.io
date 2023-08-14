load_g_r = () => {
    content_area.innerHTML = "";
    ifr = document.createElement("iframe")
    ifr.src = challenge_blob_urls[6]
    //ifr.onload = () => {
    //    ifr.contentWindow.document.innerHTML = blob_data
    //}
    content_area.appendChild(ifr)
    return null
}

load_binary_star = () => {
    content_area.innerHTML = "";
    ifr = document.createElement("iframe")
    ifr.src = challenge_blob_urls[14]
    //ifr.onload = () => {
    //    ifr.contentWindow.document.innerHTML = blob_data
    //}
    content_area.appendChild(ifr)
    return null
}