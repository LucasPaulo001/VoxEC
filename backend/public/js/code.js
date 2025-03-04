 document.getElementById('btns').addEventListener('click', (btn) => {
    const create = document.getElementById('createGroup')
    const settings = document.getElementById('settings')
    const account = document.getElementById('account')

    if(btn.target.id === 'btnAdd'){
        create.classList.toggle('ativeCreate')
        settings.classList.remove('ativeSettings')
        account.classList.remove('ativeAccount')
    }
    if(btn.target.id === 'btnSettings'){
        settings.classList.toggle('ativeSettings')
        create.classList.remove('ativeCreate')
        account.classList.remove('ativeAccount')
    }
    if(btn.target.id === 'btnAccount'){
        account.classList.toggle('ativeAccount')
        create.classList.remove('ativeCreate')
        settings.classList.remove('ativeSettings')
    }
})

function openFormAdd(){
    const form = document.getElementById('form')
    form.classList.toggle('ativeForm')
}