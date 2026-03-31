// ── Greet button ──
document.getElementById("greet-btn")
  .addEventListener("click", function() {
    alert("Hey! I'm Tyrone — future software engineer at Marquette.");
  });

// ── Theme toggle ──
const themeBtn = document.getElementById("theme-btn");

themeBtn.addEventListener("click", function() {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    themeBtn.textContent = "Dark Mode";
  } else {
    themeBtn.textContent = "Light Mode";
  }
});