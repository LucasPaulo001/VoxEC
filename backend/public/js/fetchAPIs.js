//Evento de atualização de estado das tasks
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskCheck = e.target
                const topicElement = taskCheck.closest(".windowTasks")
                const topicId = topicElement ? topicElement.getAttribute("id").split("-")[1] : null;
                const taskId = taskCheck.getAttribute("data-id")
                const isChecked = taskCheck.checked
                const status = isChecked ? "concluído" : "pendente"

                console.log("ID da Task:", taskId);
                console.log("Novo Status:", status)
                
                updateProgress(topicId)

                fetch("/user/studies/updateTask", {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({taskId, status})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error("Erro ao atualizar:", data.error)
                    } else {
                        console.log("Status atualizado:", data.message)
                    }
                })
                .catch(error => {
                    console.error("Erro na requisição:", error)
                })
            })
        })
        // Atualiza a barra de progresso ao carregar a página
        document.querySelectorAll(".windowTasks").forEach(window => {
            const topicId = window.getAttribute("id").split("-")[1];
            updateProgress(topicId);
        })
    })

// Função para calcular e atualizar a barra de progresso
function updateProgress(topicId) {
    const checkboxes = document.querySelectorAll(`#windowTasks-${topicId} .task-checkbox`);
    const totalTasks = checkboxes.length;
    const completedTasks = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const progressBar = document.getElementById(`progress-bar-${topicId}`);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }
}