const friends = document.getElementById('windowFriends')
  function openFriendsData(){
    friends.classList.add('ativeDataFriends')
  }
  document.getElementById('windowFriends').addEventListener('click', (event) => {
    if(event.target.id === 'windowFriends' || event.target.id === 'closeFriends'){
        document.getElementById('windowFriends').classList.remove('ativeDataFriends')
    }
  })

function openEdit(id){
  const idCard = id.getAttribute('data-id')
  const window = document.getElementById(`windowEdit-${idCard}`)
  window.classList.add('ativeEdit')
}
document.querySelectorAll('.windowEdit').forEach(window => {
  window.addEventListener('click', () => {
    window.classList.remove('ativeEdit')
  })
})