load_challenge_6 = () => {
    content_area.innerHTML = challenge_blob_data[1][0]
    a = document.createElement("script")
    a.src = challenge_blob_urls[2]
    content_area.appendChild(a);
    return null
}