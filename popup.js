// Select our inputs
const taskInput = document.getElementById("task");
const dueDateInput = document.getElementById("dueDate");
const dueTimeInput = document.getElementById("dueTime");
const clearBtn = document.getElementById("clearDateTime");

// Function to clear the date and time fields completely
clearBtn.addEventListener("click", () => {
    dueDateInput.value = "";
    dueTimeInput.value = ""; 
});

// Event listener for the "Add Task" button
document.getElementById("addTask").addEventListener("click", function () {
    const task = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const dueTime = dueTimeInput.value;

    if (task && dueDate && dueTime) {
        // Combine date and time to match the standard datetime format
        const combinedDateTime = `${dueDate}T${dueTime}`;
        const taskId = Date.now().toString();

        // Save the task to local storage
        chrome.storage.sync.get({ tasks: [] }, function (result) {
            const tasks = result.tasks;
            tasks.push({ id: taskId, task, dueTime: combinedDateTime }); 
            chrome.storage.sync.set({ tasks }, function () {
                console.log("Task saved:", task);
            });
        });

        // Add task to the UI
        addTaskToUI(taskId, task, combinedDateTime);

        // Clear the inputs completely after adding
        taskInput.value = "";
        dueDateInput.value = "";
        dueTimeInput.value = ""; 
        
    } else {
        alert("Please enter a task, date, and time.");
    }
});

// Function to add a task to the UI
function addTaskToUI(taskId, task, dueTime) {
    const tasksDiv = document.getElementById("tasks");
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-item";
    
    // Format the date for the task list display
    const dateObj = new Date(dueTime);
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = dateObj.toLocaleString('en-US', options);

    taskDiv.innerHTML = `
        <div>
            <strong>${task}</strong> <br/>
            <span>Due: ${formattedDate}</span>
        </div>
        <button class="remove-task" data-id="${taskId}">Remove</button>
    `;
    tasksDiv.appendChild(taskDiv);

    // Add event listener to the remove button
    taskDiv.querySelector(".remove-task").addEventListener("click", function () {
        removeTask(taskId, taskDiv);
    });
}

// Function to remove a task from the UI and storage
function removeTask(taskId, taskDiv) {
    chrome.storage.sync.get({ tasks: [] }, function (result) {
        const tasks = result.tasks.filter(t => t.id !== taskId);
        chrome.storage.sync.set({ tasks }, function () {
            console.log("Task removed:", taskId);
        });
    });
    taskDiv.remove();
}

// Load saved tasks from storage when popup is opened
chrome.storage.sync.get({ tasks: [] }, function (result) {
    const tasks = result.tasks;
    tasks.forEach(function (taskObj) {
        addTaskToUI(taskObj.id, taskObj.task, taskObj.dueTime);
    });
});