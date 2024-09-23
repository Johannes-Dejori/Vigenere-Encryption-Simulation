import "./../scss/style.scss";

// Alphabets
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Generate the Vigenère table
function generateVigenereTable() {
  const tableContainer = document.getElementById("vigenereTableContainer");
  const table = document.createElement("table");

  const headerRow = document.createElement("tr");
  const emptyCornerCell = document.createElement("td"); // Top-left empty cell
  headerRow.appendChild(emptyCornerCell);

  // Header top row
  for (let i = 0; i < alphabet.length; i++) {
    const headerCell = document.createElement("td");
    headerCell.textContent = alphabet[i];
    headerCell.classList.add("header");
    headerRow.appendChild(headerCell);
  }
  table.appendChild(headerRow);

  // Create the rest of the Vigenère table with an additional column for the left orientation (plaintext)
  for (let i = 0; i < alphabet.length; i++) {
    const row = document.createElement("tr");

    // Add the left orientation column cell (plaintext)
    const leftHeaderCell = document.createElement("td");
    leftHeaderCell.textContent = alphabet[i];
    leftHeaderCell.classList.add("header");
    row.appendChild(leftHeaderCell);

    for (let j = 0; j < alphabet.length; j++) {
      const cell = document.createElement("td");
      cell.textContent = alphabet[(i + j) % alphabet.length];
      cell.dataset.row = i;
      cell.dataset.col = j;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

let isAnimating = false; 

// Function to encrypt the plaintext using the Vigenère cipher
function encrypt() {
  if (isAnimating) {
    return; // Exit if an animation is already in progress
  }

  isAnimating = true;

  const plaintext = document
    .getElementById("plaintext")
    .value.toUpperCase()
    .replace(/[^A-Z]/g, "");
  const key = document
    .getElementById("key")
    .value.toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (!plaintext || !key) {
    alert("Please enter both plain text and a key.");
    isAnimating = false;
    return;
  }

  const table = document.querySelector("#vigenereTableContainer table");
  const cells = table.getElementsByTagName("td");

  let ciphertext = "";
  let animationSteps = [];

  // Vigenère encryption process
  for (let i = 0; i < plaintext.length; i++) {
    const plainChar = plaintext[i];
    const keyChar = key[i % key.length];
    const rowIndex = alphabet.indexOf(keyChar);
    const colIndex = alphabet.indexOf(plainChar);

    const cell = [...cells].find(
      (cell) =>
        parseInt(cell.dataset.row) === rowIndex &&
        parseInt(cell.dataset.col) === colIndex &&
        !cell.classList.contains("header")
    );
    animationSteps.push({ cell, rowIndex, colIndex, char: cell.textContent });
    ciphertext += cell.textContent;
  }

  // Clear previous highlights
  [...cells].forEach((cell) => cell.classList.remove("selected", "highlight"));
  document.getElementById("output").textContent = "";

  // Animate the process
  let stepIndex = 0;
  function animateStep() {
    if (stepIndex > 0) {
      const prevStep = animationSteps[stepIndex - 1];
      clearHighlights(prevStep.rowIndex, prevStep.colIndex);
    }

    if (stepIndex < animationSteps.length) {
      const { cell, rowIndex, colIndex, char } = animationSteps[stepIndex];

      // Highlight the header cells
      const headerRowCell = table.rows[0].cells[colIndex + 1];
      const headerColCell = table.rows[rowIndex + 1].cells[0];

      headerRowCell.classList.add("highlight");
      headerColCell.classList.add("highlight");

      // Animate from header cells to the target cell
      animateRowAndCol(rowIndex, colIndex, cell).then(() => {
        document.getElementById("output").textContent += char;
        stepIndex++;
        animateStep();
      });
    } else {
      isAnimating = false;
    }
  }
  animateStep();
}

// Set the default animation mode to simultaneous
let isSimultaneous = true;

const animationCheckbox = document.getElementById('animationCheckbox');

// Update isSimultaneous whenever the checkbox changes
animationCheckbox.onchange = () => {
    isSimultaneous = animationCheckbox.checked;
};

// Helper function to animate the row and column highlighting
function animateRowAndCol(rowIndex, colIndex, targetCell) {
  return new Promise((resolve) => {
    const table = document.querySelector("#vigenereTableContainer table");

    let currentColIndex = 1;
    let currentRowIndex = 1;

    function animateColumn() {
      if (currentColIndex <= colIndex + 1) {
        const speed = document.getElementById("speed").value;
        const cell = table.rows[rowIndex + 1].cells[currentColIndex];

        if (!cell.classList.contains("highlight")) {
          cell.classList.add("highlight");
        }

        currentColIndex++;
        setTimeout(animateColumn, speed); // Call animateColumn recursively with the latest speed
      } else {
        // Mark column animation as finished
        columnAnimationFinished();
      }
    }

    function animateRow() {
      if (currentRowIndex <= rowIndex + 1) {
        const speed = document.getElementById("speed").value;
        const cell = table.rows[currentRowIndex].cells[colIndex + 1];

        if (!cell.classList.contains("highlight")) {
          cell.classList.add("highlight");
        }

        currentRowIndex++;
        setTimeout(animateRow, speed); // Call animateRow recursively with the latest speed
      } else {
        // Mark row animation as finished
        rowAnimationFinished();
      }
    }

    let isRowFinished = false;
    let isColumnFinished = false;

    function rowAnimationFinished() {
      isRowFinished = true;
      if (isRowFinished && isColumnFinished) {
        highlightTargetCell();
      }
    }

    function columnAnimationFinished() {
      isColumnFinished = true;
      if (isRowFinished && isColumnFinished) {
        highlightTargetCell();
      }
    }

    // Function to highlight the target cell once both animations are complete
    function highlightTargetCell() {
      const finalSpeed = document.getElementById("speed").value;
      setTimeout(() => {
        targetCell.classList.add("selected");
        resolve();
      }, finalSpeed);
    }

    // Start the animations based on the mode
    if (isSimultaneous) {
        animateColumn();
        animateRow();
    } else {
      // Animate row first, then column
      const animateRowLinear = () => {
          if (currentRowIndex <= rowIndex + 1) {
              const currentSpeed = document.getElementById('speed').value; // Get current speed
              const cell = table.rows[currentRowIndex].cells[colIndex + 1];

              if (!cell.classList.contains("highlight")) {
                  cell.classList.add("highlight");
              }

              currentRowIndex++;
              setTimeout(animateRowLinear, currentSpeed); // Recursively call to continue row animation
          } else {
              rowAnimationFinished();
              animateColumn();
          }
      };

      animateRowLinear();
  }
  });
}

// Helper function to clear highlights from the previous step
function clearHighlights(rowIndex, colIndex) {
  const table = document.querySelector("#vigenereTableContainer table");

  for (let j = 1; j <= colIndex + 1; j++) {
    const cell = table.rows[rowIndex + 1].cells[j];
    cell.classList.remove("highlight");
  }

  for (let i = 1; i <= rowIndex + 1; i++) {
    const cell = table.rows[i].cells[colIndex + 1];
    cell.classList.remove("highlight");
  }

  const headerRowCell = table.rows[0].cells[colIndex + 1];
  const headerColCell = table.rows[rowIndex + 1].cells[0];

  headerRowCell.classList.remove("highlight");
  headerColCell.classList.remove("highlight");
}

window.encrypt = encrypt;
window.onload = generateVigenereTable;
