// VARIÁVEIS DE ESTADO E REFERÊNCIAS GLOBAIS
let tasks = []; // Array principal para armazenar os dados das tarefas (Estado da Aplicação)
const views = document.querySelectorAll('.view'); // Todos os contêineres de "página"
const taskForm = document.getElementById('task-form');
let nextId = 1; // Para garantir IDs únicos para novas tarefas

/**
 * Funções do Módulo SPA
 */

/**
 * 1. Função principal do SPA: Esconde todas as views e mostra apenas a desejada.
 * @param {string} viewId - O ID da seção a ser exibida (ex: 'home', 'new', 'list').
 */
function renderView(viewId) {
    views.forEach(view => {
        view.style.display = 'none'; // Esconde todas as seções
    });
    
    // Mostra apenas a seção desejada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
    }
}

/**
 * 2. Configura os Event Listeners para a navegação.
 */
function setupNavigation() {
    document.getElementById('nav-home').addEventListener('click', () => renderView('home'));
    document.getElementById('nav-new').addEventListener('click', () => renderView('new'));
    
    // Ao clicar em 'list', renderiza a view e os dados
    document.getElementById('nav-list').addEventListener('click', () => {
        renderView('list');
        renderTasks(tasks); // Função para renderizar a lista (implementada abaixo)
    });
}


/**
 * Funções de Persistência de Dados (localStorage)
 */

/**
 * Carrega dados do localStorage (se existirem) e define o estado inicial.
 */
function loadTasks() {
    const storedTasks = localStorage.getItem('advanced-tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks); 
        // Garante que o nextId seja maior que o maior ID existente para evitar duplicatas
        const maxId = tasks.reduce((max, task) => Math.max(max, task.id || 0), 0);
        nextId = maxId + 1;
    }
}

/**
 * Salva o estado atual do array de tarefas no localStorage.
 */
function saveTasks() {
    localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
}

/**
 * Função para adicionar uma nova tarefa ao estado e salvar.
 */
function saveTask(formData) {
    const newTask = {
        id: nextId++,
        titulo: formData.get('titulo'),
        data: formData.get('data'),
        completed: false
    };

    tasks.push(newTask);
    saveTasks(); // Persiste no armazenamento local
    console.log('Tarefa salva:', newTask);
}


/**
 * 💥 1. SISTEMA DE VERIFICAÇÃO DE CONSISTÊNCIA DE DADOS (Obrigatório)
 *
 * @param {HTMLFormElement} form - O formulário a ser validado.
 * @returns {boolean} - Retorna verdadeiro se o formulário for consistente.
 */
function validateForm(form) {
    let isValid = true;
    
    // Limpar todas as mensagens de erro antes de uma nova validação
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');

    const tituloInput = form.elements['titulo'];
    const dataInput = form.elements['data'];
    
    // --- VALIDAÇÃO 1: Campo Título Vazio ---
    if (tituloInput.value.trim() === '') {
        document.getElementById('error-titulo').textContent = 'O título da tarefa é obrigatório.';
        tituloInput.focus();
        isValid = false;
    }

    // --- VALIDAÇÃO 2: Campo Data Vazio ---
    if (dataInput.value.trim() === '') {
        document.getElementById('error-data').textContent = 'A data de vencimento é obrigatória.';
        if (isValid) dataInput.focus();
        isValid = false;
    }
    
    // --- VALIDAÇÃO 3 (Consistência): Data no Passado ---
    // Esta validação só ocorre se o campo data estiver preenchido
    if (dataInput.value.trim() !== '') {
        const today = new Date();
        // Zera as horas/minutos/segundos de "hoje" para garantir comparação apenas da data
        today.setHours(0, 0, 0, 0); 
        
        const selectedDate = new Date(dataInput.value);
        
        if (selectedDate < today) {
            document.getElementById('error-data').textContent = 'A data de vencimento não pode ser no passado.';
            if (isValid) dataInput.focus();
            isValid = false;
        }
    }
    
    return isValid;
}


/**
 * 2. SISTEMA DE TEMPLATES JAVASCRIPT E RENDERIZAÇÃO
 *
 * (Usando o template do HTML para criar novos elementos de forma eficiente)
 */
function renderTasks(currentTasks) {
    const container = document.getElementById('tasks-container');
    const template = document.getElementById('task-template');
    
    // Limpa a lista existente (DOM Manipulation)
    container.innerHTML = ''; 

    if (currentTasks.length === 0) {
        container.innerHTML = '<li>Nenhuma tarefa cadastrada. Use o menu "Nova Tarefa" para começar.</li>';
        return;
    }

    currentTasks.forEach(task => {
        // Clonar o conteúdo do template (Melhor performance do que criar tudo do zero)
        const clone = document.importNode(template.content, true); 
        
        // Manipulação do DOM para preencher os dados no template
        clone.querySelector('.task-title').textContent = task.titulo;
        clone.querySelector('.task-date').textContent = new Date(task.data).toLocaleDateString('pt-BR');
        
        // Adicionar o ID ao botão de exclusão (necessário para o próximo passo)
        const deleteBtn = clone.querySelector('.delete-btn');
        deleteBtn.setAttribute('data-id', task.id);
        
        // Adiciona o novo item preenchido ao contêiner
        container.appendChild(clone);
    });
}


/**
 * Configura o manipulador de submissão do formulário
 */
function setupFormHandler() {
    taskForm.addEventListener('submit', function(event) {
        // ESSENCIAL: Impede o envio padrão do formulário
        event.preventDefault(); 
        
        // 1. Validação de Consistência
        const isFormValid = validateForm(taskForm);
        
        if (isFormValid) {
            // Se válido, coleta os dados e salva
            const formData = new FormData(taskForm);
            saveTask(formData);
            
            // Limpa o formulário e navega
            taskForm.reset(); 
            renderView('list');
            renderTasks(tasks); // Renderiza a lista atualizada
        } else {
            console.warn('Formulário inválido. Aviso ao usuário exibido.');
        }
    });
}


/**
 * Função de inicialização da Aplicação
 */
function init() {
    loadTasks();
    setupNavigation();
    setupFormHandler();
    renderView('home');
}

document.addEventListener('DOMContentLoaded', init);