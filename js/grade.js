/* ========================================
   GRADE CALCULATOR
   ======================================== */

/* ========================================
   DOM ELEMENTS
   ======================================== */

const courseList = document.getElementById("course-list");

const addCourseButton = document.getElementById("add-course");

const resetCoursesButton = document.getElementById("reset-courses");

const gradeError = document.getElementById("grade-error");

const totalCreditsDisplay = document.getElementById("total-credits");

const weightedAverageDisplay = document.getElementById("weighted-average");

const gpaDisplay = document.getElementById("gpa-result");

const performanceDisplay = document.getElementById("performance-result");

/* ========================================
   STATE
   ======================================== */

let courses = [
  {
    id: 1,
    name: "Mathematics",
    credits: 3,
    score: 85,
  },

  {
    id: 2,
    name: "JavaScript",
    credits: 4,
    score: 91,
  },

  {
    id: 3,
    name: "Computer Science",
    credits: 3,
    score: 78,
  },

  {
    id: 4,
    name: "UI/UX Design",
    credits: 2,
    score: 88,
  },
];

/* ========================================
   GPA SCALE
   ======================================== */

const gradeScale = [
  {
    min: 70,
    grade: "A",
    points: 4,
  },

  {
    min: 60,
    grade: "B",
    points: 3,
  },

  {
    min: 50,
    grade: "C",
    points: 2,
  },

  {
    min: 45,
    grade: "D",
    points: 1,
  },

  {
    min: 40,
    grade: "E",
    points: 0,
  },

  {
    min: 0,
    grade: "F",
    points: 0,
  },
];

/* ========================================
   INITIALIZE
   ======================================== */

function initializeGradeCalculator() {
  renderCourses();

  calculateGrades();
}

initializeGradeCalculator();

/* ========================================
   RENDER COURSES
   ======================================== */

function renderCourses() {
  courseList.innerHTML = "";

  courses.forEach((course) => {
    const row = createCourseRow(course);

    courseList.appendChild(row);
  });
}

/* ========================================
   CREATE COURSE ROW
   ======================================== */

function createCourseRow(course) {
  const row = document.createElement("div");

  row.className = "course-row";

  row.dataset.id = course.id;

  row.innerHTML = `

    <input
      type="text"
      class="course-name"
      value="${escapeHtml(course.name)}"
      placeholder="Course name"
      maxlength="80"
      aria-label="Course name"
    >


    <input
      type="number"
      class="course-credits"
      value="${course.credits}"
      min="1"
      max="30"
      step="1"
      aria-label="Credit units"
    >


    <input
      type="number"
      class="course-score"
      value="${course.score}"
      min="0"
      max="100"
      step="0.1"
      aria-label="Score"
    >


    <button
      type="button"
      class="remove-course"
      data-action="remove-course"
      data-id="${course.id}"
      aria-label="Remove ${escapeHtml(course.name)}"
      title="Remove course"
    >
      ×
    </button>

  `;

  return row;
}

/* ========================================
   ADD COURSE
   ======================================== */

function addCourse() {
  const newCourse = {
    id: Date.now(),

    name: "",

    credits: 3,

    score: 0,
  };

  courses.push(newCourse);

  renderCourses();

  calculateGrades();

  /*
   * Focus the newly created
   * course name field.
   */

  const rows = courseList.querySelectorAll(".course-row");

  const lastRow = rows[rows.length - 1];

  if (lastRow) {
    const nameInput = lastRow.querySelector(".course-name");

    nameInput.focus();
  }
}

/* ========================================
   REMOVE COURSE
   ======================================== */

function removeCourse(courseId) {
  if (courses.length <= 1) {
    showGradeError("You need at least one course.");

    return;
  }

  courses = courses.filter((course) => course.id !== courseId);

  clearGradeError();

  renderCourses();

  calculateGrades();
}

/* ========================================
   UPDATE COURSE
   ======================================== */

function updateCourse(courseId, field, value) {
  courses = courses.map((course) => {
    if (course.id !== courseId) {
      return course;
    }

    return {
      ...course,
      [field]: value,
    };
  });

  calculateGrades();
}

/* ========================================
   CALCULATE GRADES
   ======================================== */

function calculateGrades() {
  clearGradeError();

  if (!courses.length) {
    resetResults();

    return;
  }

  let totalCredits = 0;

  let weightedScore = 0;

  let totalGradePoints = 0;

  for (const course of courses) {
    const credits = Number(course.credits);

    const score = Number(course.score);

    /*
     * Validate credit units.
     */

    if (!Number.isFinite(credits) || credits <= 0) {
      showGradeError("Each course must have valid credit units.");

      return;
    }

    /*
     * Validate score.
     */

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      showGradeError("Scores must be between 0 and 100.");

      return;
    }

    const grade = getGrade(score);

    totalCredits += credits;

    weightedScore += score * credits;

    totalGradePoints += grade.points * credits;
  }

  const weightedAverage = weightedScore / totalCredits;

  const gpa = totalGradePoints / totalCredits;

  const performance = getPerformance(weightedAverage);

  totalCreditsDisplay.textContent = totalCredits.toFixed(0);

  weightedAverageDisplay.textContent = `${weightedAverage.toFixed(2)}%`;

  gpaDisplay.textContent = gpa.toFixed(2);

  performanceDisplay.textContent = performance;
}

/* ========================================
   GET GRADE
   ======================================== */

function getGrade(score) {
  return (
    gradeScale.find((grade) => score >= grade.min) ||
    gradeScale[gradeScale.length - 1]
  );
}

/* ========================================
   PERFORMANCE
   ======================================== */

function getPerformance(average) {
  if (average >= 70) {
    return "Excellent";
  }

  if (average >= 60) {
    return "Very Good";
  }

  if (average >= 50) {
    return "Good";
  }

  if (average >= 45) {
    return "Pass";
  }

  if (average >= 40) {
    return "Needs Improvement";
  }

  return "Fail";
}

/* ========================================
   RESET RESULTS
   ======================================== */

function resetResults() {
  totalCreditsDisplay.textContent = "0";

  weightedAverageDisplay.textContent = "0%";

  gpaDisplay.textContent = "0.00";

  performanceDisplay.textContent = "—";
}

/* ========================================
   ERROR HANDLING
   ======================================== */

function showGradeError(message) {
  gradeError.textContent = message;
}

function clearGradeError() {
  gradeError.textContent = "";
}

/* ========================================
   EVENT DELEGATION
   ======================================== */

courseList.addEventListener("input", (event) => {
  const row = event.target.closest(".course-row");

  if (!row) {
    return;
  }

  const courseId = Number(row.dataset.id);

  if (event.target.classList.contains("course-name")) {
    updateCourse(courseId, "name", event.target.value);

    return;
  }

  if (event.target.classList.contains("course-credits")) {
    updateCourse(courseId, "credits", Number(event.target.value));

    return;
  }

  if (event.target.classList.contains("course-score")) {
    updateCourse(courseId, "score", Number(event.target.value));
  }
});

/* ========================================
   REMOVE BUTTON
   ======================================== */

courseList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='remove-course']");

  if (!button) {
    return;
  }

  const courseId = Number(button.dataset.id);

  removeCourse(courseId);
});

/* ========================================
   ADD / RESET
   ======================================== */

addCourseButton.addEventListener("click", addCourse);

resetCoursesButton.addEventListener("click", () => {
  courses = [
    {
      id: 1,
      name: "Mathematics",
      credits: 3,
      score: 85,
    },

    {
      id: 2,
      name: "JavaScript",
      credits: 4,
      score: 91,
    },

    {
      id: 3,
      name: "Computer Science",
      credits: 3,
      score: 78,
    },

    {
      id: 4,
      name: "UI/UX Design",
      credits: 2,
      score: 88,
    },
  ];

  clearGradeError();

  renderCourses();

  calculateGrades();
});

/* ========================================
   ESCAPE HTML
   ======================================== */

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}
