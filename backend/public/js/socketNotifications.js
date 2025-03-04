const socket = io({ query: { userId: userIdFromServer } }) 

// Notificação de solicitação de amizade
socket.on('friendRequest', (data) => {
    alert(`Nova solicitação de amizade recebida de ${data.fromUsername}!`)
})