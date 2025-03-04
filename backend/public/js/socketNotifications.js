const socket = io({ query: { userId: userIdFromServer } }) 

// Atualiza status online/offline
socket.on("userStatusChange", ({ userId, isOnline }) => {
    const userElement = document.querySelector(`[data-user-id="${userId}"]`)
    if (userElement) {
        userElement.innerHTML = isOnline ? '🟢' : '🔴'
    }
})

// Notificação de solicitação de amizade
socket.on('friendRequest', (data) => {
    alert(`Nova solicitação de amizade recebida de ${data.fromUsername}!`)
})