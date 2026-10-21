
"use strict";

//  DOM ELEMENTS
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const message = document.getElementById("msg");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const filterButtons = document.querySelectorAll(".filter-btn");

//  LOCAL STORAGE
const STORAGE_KEY = "todoTasks";

function getTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        alert("Your tasks could not be saved in this browser.");
        console.error("Could not save tasks:", error);
    }
}

// task collection
let tasks = getTasks();
let currentFilter = "all";

// WELCOME MESSAGE ANIMATION
const welcomeText = "Plan your day, organize your schedule.";

if (message) {
    let wordIndex = 0;
    const words = welcomeText.split(" ");

    message.textContent = "";

    function typeMessage() {
        if (wordIndex < words.length) {
            message.textContent +=
                (wordIndex === 0 ? "" : " ") + words[wordIndex];

            wordIndex++;
            setTimeout(typeMessage, 300);
        } else {
            message.classList.add("typing-done");
        }
    }

    typeMessage();
}

//  ADD A NEW TASK
function addTask() {
    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task first!");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now() + Math.random(),
        title: title,
        is_completed: false,
        created_at: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();

    taskInput.value = "";
    taskInput.focus();

    renderTasks();
}

addTaskBtn.addEventListener("click", addTask);

// Also allow Enter to add a task
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

//  DISPLAY TASKS
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function (task) {
        if (currentFilter === "pending") {
            return !task.is_completed;
        }

        if (currentFilter === "completed") {
            return task.is_completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-message";

        if (currentFilter === "pending") {
            emptyMessage.textContent = "No pending tasks. Great job!";
        } else if (currentFilter === "completed") {
            emptyMessage.textContent = "No completed tasks yet.";
        } else {
            emptyMessage.textContent =
                "No tasks yet. Add your first task above!";
        }

        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach(function (task) {
            const listItem = document.createElement("li");
            listItem.dataset.id = task.id;

            if (task.is_completed) {
                listItem.classList.add("completed");
            }

            // Checkbox for completion
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.is_completed;
            checkbox.setAttribute("aria-label", "Mark task complete");

            checkbox.addEventListener("change", function () {
                task.is_completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            // Task title and timestamp
            const taskDetails = document.createElement("div");
            taskDetails.className = "task-details";

            const title = document.createElement("span");
            title.className = "task-title";
            title.textContent = task.title;

            const timestamp = document.createElement("small");
            timestamp.className = "task-timestamp";
            timestamp.textContent =
                "Added: " + formatDate(task.created_at);

            taskDetails.appendChild(title);
            taskDetails.appendChild(timestamp);

            // Inline edit button
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-btn";
            editButton.textContent = "Edit";

            editButton.addEventListener("click", function () {
                startEditing(task, taskDetails, listItem);
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                const confirmed = confirm(
                    "Are you sure you want to delete this task?"
                );

                if (!confirmed) {
                    return;
                }

                tasks = tasks.filter(function (item) {
                    return item.id !== task.id;
                });

                saveTasks();
                renderTasks();
            });

            listItem.appendChild(checkbox);
            listItem.appendChild(taskDetails);
            listItem.appendChild(editButton);
            listItem.appendChild(deleteButton);

            taskList.appendChild(listItem);
        });
    }

    updateTaskStats();
}

//  INLINE EDITING
function startEditing(task, taskDetails, listItem) {
    taskDetails.innerHTML = "";

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = task.title;
    editInput.className = "edit-input";
    editInput.setAttribute("aria-label", "Edit task title");

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "edit-btn";
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "delete-btn";
    cancelButton.textContent = "Cancel";

    function saveEdit() {
        const updatedTitle = editInput.value.trim();

        if (updatedTitle === "") {
            alert("Task title cannot be empty.");
            editInput.focus();
            return;
        }

        task.title = updatedTitle;
        saveTasks();
        renderTasks();
    }

    function cancelEdit() {
        renderTasks();
    }

    saveButton.addEventListener("click", saveEdit);
    cancelButton.addEventListener("click", cancelEdit);

    editInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveEdit();
        }

        if (event.key === "Escape") {
            cancelEdit();
        }
    });

    taskDetails.appendChild(editInput);
    taskDetails.appendChild(saveButton);
    taskDetails.appendChild(cancelButton);

    editInput.focus();
    editInput.select();
}

//  FORMAT THE TIMESTAMP
function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString();
}

//  UPDATE TASK COUNTERS
function updateTaskStats() {
    const completedCount = tasks.filter(function (task) {
        return task.is_completed;
    }).length;

    const pendingCount = tasks.length - completedCount;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completedCount;
    pendingTasks.textContent = pendingCount;
}

//  FILTER TASKS
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (filterButton) {
            filterButton.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

// 10. INITIAL DISPLAY
renderTasks();
