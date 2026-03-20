const pageShell = document.querySelector('.page-shell');
const pill = document.getElementById('recommendation-pill');
const primaryPath = document.getElementById('primary-path');
const ductworkInputs = document.querySelectorAll('input[name="ductwork"]');

function updateRecommendation() {
  const selectedDuctwork = document.querySelector('input[name="ductwork"]:checked')?.value;
  const isDirectReplacementPrimary = selectedDuctwork === 'good';

  pageShell.classList.toggle('secondary-state', !isDirectReplacementPrimary);
  primaryPath.classList.toggle('emphasis', isDirectReplacementPrimary);

  pill.textContent = isDirectReplacementPrimary
    ? 'Direct Replacement Recommended'
    : 'Ductwork Needs Review Before Recommending';
}

ductworkInputs.forEach((input) => {
  input.addEventListener('change', updateRecommendation);
});

updateRecommendation();
