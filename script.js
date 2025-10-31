// Application State
let currentView = 'myday';
let tasks = JSON.parse(localStorage.getItem('modernTodoTasks')) || [];
let customLists = JSON.parse(localStorage.getItem('modernTodoLists')) || [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const searchInput = document.getElementById('search-input');
const taskStats = document.getElementById('task-stats');
const customListsContainer = document.getElementById('custom-lists');
const addListBtn = document.getElementById('add-list-btn');

// Quick add templates
const quickAddTemplates = {
  meeting: 'Schedule meeting with team',
  call: 'Call ',
  email: 'Send email to ',
  shopping: 'Buy '
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  updateCurrentDate();
  renderTasks();
  updateCounts();
  updateTaskStats();
  renderCustomLists();
  setupEventListeners();
  setInterval(updateCurrentDate, 60000); // Update every minute
});

function updateCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  document.querySelector('.current-date').textContent = dateStr;
}

function setupEventListeners() {
  taskForm.addEventListener('submit', handleAddTask);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavigation);
  });

  searchInput.addEventListener('input', handleSearch);

  document.getElementById('user-btn').addEventListener('click', () => {
    alert('User account features coming soon!');
  });
  document.getElementById('sync-btn').addEventListener('click', () => {
    alert('Sync complete!');
  });

  // Quick add templates
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const template = this.dataset.template;
      if (quickAddTemplates[template]) {
        taskInput.value = quickAddTemplates[template];
        taskInput.focus();
      }
    });
  });

  // Custom lists
  addListBtn.addEventListener('click', function() {
    const listName = prompt('Enter list name:');
    if (listName && listName.trim()) {
      addCustomList(listName.trim());
    }
  });
}

function handleAddTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    important: false,
    createdAt: new Date(),
    dueDate: null,
    list: currentView === 'tasks' ? 'tasks' : currentView
  };
  tasks.push(newTask);
  taskInput.value = '';
  saveTasks();
  renderTasks();
  updateCounts();
  updateTaskStats();
}

function handleNavigation(e) {
  e.preventDefault();
  const view = e.currentTarget.dataset.view;
  if (!view) return;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  e.currentTarget.classList.add('active');
  currentView = view;
  updatePageTitle();
  renderTasks();
  updateCounts();
  updateTaskStats();
}

function updatePageTitle() {
  const titles = {
    myday: { icon: 'fas fa-sun today-indicator', title: 'My Day', subtitle: 'Focus on your day' },
    important: { icon: 'fas fa-star', title: 'Important', subtitle: 'Your starred tasks' },
    planned: { icon: 'fas fa-calendar', title: 'Planned', subtitle: 'Tasks with due dates' },
    assigned: { icon: 'fas fa-user', title: 'Assigned to me', subtitle: 'Tasks assigned by others' },
    tasks: { icon: 'fas fa-home', title: 'Tasks', subtitle: 'All your tasks' }
  };
  const config = titles[currentView];
  if (config) {
    pageTitle.innerHTML = `<i class="${config.icon}"></i> ${config.title}`;
    pageSubtitle.innerHTML = config.subtitle;
  } else {
    // Custom list
    pageTitle.textContent = currentView;
    pageSubtitle.textContent = '';
  }
}

function handleSearch(e) {
  renderTasks(e.target.value);
}

function renderTasks(searchTerm = '') {
  let filtered = tasks;
  if (currentView === 'important') {
    filtered = filtered.filter(t => t.important);
  } else if (currentView === 'planned') {
    filtered = filtered.filter(t => t.dueDate !== null);
  } else if (currentView === 'assigned') {
    // No assigned logic for now
    filtered = [];
  } else if (currentView === 'tasks') {
    // Show all
  } else if (customLists.includes(currentView)) {
    filtered = filtered.filter(t => t.list === currentView);
  } else {
    // Default: myday
    filtered = filtered.filter(t => t.list === 'myday');
  }

  if (searchTerm) {
    filtered = filtered.filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  tasksContainer.innerHTML = '';
  if (filtered.length === 0) {
    emptyState.style.display = '';
    tasksContainer.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    tasksContainer.style.display = '';
    filtered.forEach(t => {
      const div = document.createElement('div');
      div.className = 'task-item';

      // Checkbox
      const check = document.createElement('span');
      check.className = 'task-checkbox' + (t.completed ? ' completed' : '');
      check.innerHTML = t.completed ? '<i class="fa fa-check"></i>' : '';
      check.onclick = () => { t.completed = !t.completed; saveTasks(); renderTasks(); updateCounts(); updateTaskStats(); };
      div.appendChild(check);

      // Text
      const text = document.createElement('span');
      text.className = 'task-text' + (t.completed ? ' completed' : '');
      text.textContent = t.text;
      div.appendChild(text);

      // Actions
      const actions = document.createElement('div');
      actions.className = 'task-actions';

      // Star
      const star = document.createElement('button');
      star.className = 'task-action-btn star' + (t.important ? ' starred' : '');
      star.innerHTML = '<i class="fa fa-star"></i>';
      star.title = t.important ? 'Unstar' : 'Star';
      star.onclick = () => { t.important = !t.important; saveTasks(); renderTasks(); updateCounts(); updateTaskStats(); };
      actions.appendChild(star);

      // Delete
      const del = document.createElement('button');
      del.className = 'task-action-btn delete';
      del.innerHTML = '<i class="fa fa-trash"></i>';
      del.title = 'Delete';
      del.onclick = () => { 
        tasks = tasks.filter(x => x.id !== t.id); 
        saveTasks(); renderTasks(); updateCounts(); updateTaskStats();
      };
      actions.appendChild(del);

      div.appendChild(actions);

      tasksContainer.appendChild(div);
    });
  }
}

function saveTasks() {
  localStorage.setItem('modernTodoTasks', JSON.stringify(tasks));
}

function updateCounts() {
  document.getElementById('myday-count').textContent = tasks.filter(t => t.list === 'myday').length;
  document.getElementById('important-count').textContent = tasks.filter(t => t.important).length;
  document.getElementById('planned-count').textContent = tasks.filter(t => t.dueDate !== null).length;
  document.getElementById('assigned-count').textContent = 0; // Not implemented
  document.getElementById('tasks-count').textContent = tasks.length;
}

function updateTaskStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const important = tasks.filter(t => t.important).length;
  const planned = tasks.filter(t => t.dueDate !== null).length;
  taskStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-number">${total}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${completed}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${important}</span>
      <span class="stat-label">Important</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${planned}</span>
      <span class="stat-label">Planned</span>
    </div>
  `;
}

function renderCustomLists() {
  customListsContainer.innerHTML = '';
  customLists.forEach(list => {
    const div = document.createElement('div');
    div.className = 'custom-list-item';
    div.textContent = list;
    div.onclick = () => {
      currentView = list;
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      updatePageTitle();
      renderTasks();
      updateCounts();
      updateTaskStats();
    };
    // List count
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = tasks.filter(t => t.list === list).length;
    div.appendChild(count);

    // Remove
    const rmBtn = document.createElement('button');
    rmBtn.className = 'remove-list-btn';
    rmBtn.title = 'Delete list';
    rmBtn.style = 'margin-left:10px; background:none; border:none; color:#e53e3e; cursor:pointer;';
    rmBtn.innerHTML = '<i class="fa fa-times"></i>';
    rmBtn.onclick = (ev) => {
      ev.stopPropagation();
      if (confirm(`Delete list "${list}"? This will delete all tasks in this list.`)) {
        tasks = tasks.filter(t => t.list !== list);
        customLists = customLists.filter(l => l !== list);
        saveTasks();
        saveCustomLists();
        renderCustomLists();
        renderTasks();
        updateCounts();
        updateTaskStats();
      }
    };
    div.appendChild(rmBtn);

    customListsContainer.appendChild(div);
  });
}

function addCustomList(listName) {
  if (!customLists.includes(listName)) {
    customLists.push(listName);
    saveCustomLists();
    renderCustomLists();
  }
}

function saveCustomLists() {
  localStorage.setItem('modernTodoLists', JSON.stringify(customLists));
}
