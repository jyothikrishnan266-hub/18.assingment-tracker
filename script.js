let assignments = JSON.parse(
  localStorage.getItem("assignments")
) || [];

const form = document.getElementById("assignmentForm");
const assignmentList = document.getElementById("assignmentList");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("search");
const filter = document.getElementById("filter");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const subject = document.getElementById("subject").value;
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;

  const assignment = {
    id: Date.now(),
    title: title,
    subject: subject,
    dueDate: dueDate,
    priority: priority,
    completed: false
  };

  assignments.push(assignment);

  saveAssignments();
  form.reset();

  document.getElementById("priority").value = "Medium";

  displayAssignments();
});

searchInput.addEventListener("input", displayAssignments);
filter.addEventListener("change", displayAssignments);

function displayAssignments() {

  const searchText = searchInput.value.toLowerCase();
  const filterValue = filter.value;

  let filtered = assignments.filter(function (assignment) {

    const matchesSearch =
      assignment.title.toLowerCase().includes(searchText) ||
      assignment.subject.toLowerCase().includes(searchText);

    let matchesFilter = true;

    if (filterValue === "pending") {
      matchesFilter = !assignment.completed;
    }

    if (filterValue === "completed") {
      matchesFilter = assignment.completed;
    }

    if (filterValue === "high") {
      matchesFilter = assignment.priority === "High";
    }

    return matchesSearch && matchesFilter;
  });

  // Sort by due date
  filtered.sort(function (a, b) {
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  assignmentList.innerHTML = "";

  if (filtered.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  filtered.forEach(function (assignment) {

    const div = document.createElement("div");

    div.className =
      "assignment " +
      (assignment.completed ? "completed" : "");

    div.innerHTML = `
      <input
        type="checkbox"
        class="check"
        ${assignment.completed ? "checked" : ""}
        onchange="toggleAssignment(${assignment.id})"
      >

      <div class="assignment-info">

        <div class="assignment-title">
          ${escapeHTML(assignment.title)}
        </div>

        <div class="assignment-meta">
          <span>📚 ${escapeHTML(assignment.subject)}</span>
          <span>📅 ${formatDate(assignment.dueDate)}</span>

          <span class="priority ${assignment.priority}">
            ${assignment.priority}
          </span>
        </div>

      </div>

      <button
        class="delete-btn"
        onclick="deleteAssignment(${assignment.id})"
      >
        🗑 Delete
      </button>
    `;

    assignmentList.appendChild(div);
  });

  updateDashboard();
}

function toggleAssignment(id) {

  assignments = assignments.map(function (assignment) {

    if (assignment.id === id) {
      assignment.completed = !assignment.completed;
    }

    return assignment;
  });

  saveAssignments();
  displayAssignments();
}

function deleteAssignment(id) {

  const confirmed = confirm(
    "Are you sure you want to delete this assignment?"
  );

  if (!confirmed) return;

  assignments = assignments.filter(function (assignment) {
    return assignment.id !== id;
  });

  saveAssignments();
  displayAssignments();
}

function updateDashboard() {

  const total = assignments.length;

  const completed = assignments.filter(function (assignment) {
    return assignment.completed;
  }).length;

  const pending = total - completed;

  const high = assignments.filter(function (assignment) {
    return assignment.priority === "High" &&
           !assignment.completed;
  }).length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("highCount").textContent = high;
}

function saveAssignments() {
  localStorage.setItem(
    "assignments",
    JSON.stringify(assignments)
  );
}

function formatDate(date) {

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric"
  };

  return new Date(date + "T00:00:00")
    .toLocaleDateString("en-US", options);
}

function escapeHTML(text) {

  const div = document.createElement("div");
  div.textContent = text;

  return div.innerHTML;
}

// Load assignments when page opens
displayAssignments();
