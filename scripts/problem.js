

let isExpanded = true;
const body = document.body;
const expanderInstructions = document.getElementsByClassName("expansion-instruction")[0];
const expandArrow = document.getElementsByClassName("expand-arrow")[0];
const expander = document.getElementsByClassName("problem-title-container")[0];
const problemDescription = document.getElementsByClassName("problem-description")[0];
const problemImage = document.getElementsByClassName("problem-image")[0];
function toggleExpand() {
  if (isExpanded) {
    body.style.gridTemplateAreas =
      "header              header"
    "problem-title       problem-title"
    "editor              shaderCanvas";
    expanderInstructions.textContent = "Expand";
    expandArrow.style.transform = "rotate(0deg)";
    expander.style.borderBottom = "1px solid #DDD";
    problemDescription.style.display = "none";
    problemImage.style.display = "none";

    isExpanded = false;
  } else {
    body.style.gridTemplateAreas =
      "header              header"
    "problem-title       problem-title"
    "problem-description problem-image"
    "editor              shaderCanvas";
    expanderInstructions.textContent = "Collapse";
    expandArrow.style.transform = "rotate(90deg)";
    expander.style.borderBottom = "none";
    problemDescription.style.display = "block";
    problemImage.style.display = "block";

    isExpanded = true;
  }
}