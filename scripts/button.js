
function buttonClick(button) {
    button.style.transform = "scale(0.95)";
    button.style.boxShadow = "inset 0 0 10px 0 rgba(0, 0, 0, 0.2)";
    setTimeout(() => {
        button.style.transform = "scale(1)";
        button.style.boxShadow = "none";
    }, 150);
}