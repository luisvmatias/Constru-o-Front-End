const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const loginAlert = document.getElementById("loginAlert");

function resetErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  loginAlert.textContent = "";
  loginAlert.className = "login-alert";
}

function setError(element, message) {
  element.textContent = message;
}

function showMessage(message, type) {
  loginAlert.textContent = message;
  loginAlert.className = `login-alert ${type}`;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  resetErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  let hasError = false;

  if (!email) {
    setError(emailError, "Informe seu e-mail.");
    hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError(emailError, "Digite um e-mail válido.");
    hasError = true;
  }

  if (!password) {
    setError(passwordError, "Informe sua senha.");
    hasError = true;
  } else if (password.length < 6) {
    setError(passwordError, "A senha precisa ter pelo menos 6 caracteres.");
    hasError = true;
  }

  if (hasError) {
    showMessage("Verifique os campos com erro e tente novamente.", "error");
    return;
  }

  showMessage("Login realizado com sucesso! Bem-vindo ao Pomodoro.", "success");
  loginForm.reset();
});
