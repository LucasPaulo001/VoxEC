
//Evento para marcar seleção do avatar
const avatars = [...document.querySelectorAll('.avatar')]
avatars.map((avatar) => {
    avatar.addEventListener('click', () => {
        if(!avatar.classList.contains('avatarSelecter')){
            document.querySelectorAll('.avatar').forEach(element => element.classList.remove('avatarSelected'))
        }
        avatar.classList.toggle('avatarSelected')
    })
})

let selectedAvatar = ""

function selectAvatar(url){
    selectedAvatar = url
    console.log('avatar selecionado: ', selectedAvatar)
}

function saveAvatar(){
    if(!selectedAvatar){
        alert('Selecione um avatar!')
        return
    }
    const url = '/user/avatar'
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: selectedAvatar })
    })
    .then(response => response.json())
    .then((data) => {
        if(data.success){
            document.getElementById("avatarImg").src = data.avatar
            alert("Avatar atualizado com sucesso!")
        }
    })
    .catch(error => console.log(error))
}