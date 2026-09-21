(() => {
  "use strict";

  const activity = {
    openedFirstPage: true,
    continuedToVerification: false,
    requestedCode: false,
    submittedVerification: false,
    viewedSafetyReveal: false
  };

  const byId = (id) => document.getElementById(id);
  const stages = Array.from(document.querySelectorAll(".stage"));
  const breadcrumb = byId("breadcrumb");
  const infoForm = byId("info-form");
  const nameInput = byId("student-name");
  const idInput = byId("student-id");
  const phoneInput = byId("student-phone");
  const codeInput = byId("verification-code");
  const requestCodeButton = byId("request-code");
  const loadingMask = byId("loading-mask");
  let transitionPending = false;

  function setError(input, errorId, message) {
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    byId(errorId).textContent = message;
  }

  function clearSensitiveFields() {
    nameInput.value = "";
    idInput.value = "";
    phoneInput.value = "";
    codeInput.value = "";
  }

  function updateBreadcrumb(stageNumber) {
    const current = stageNumber === 1 ? "信息核验" : stageNumber === 2 ? "身份确认" : "安全提醒";
    breadcrumb.querySelector("strong").textContent = current;
    breadcrumb.hidden = stageNumber === 3;
  }

  function showStage(stageNumber) {
    stages.forEach((stage) => {
      const isTarget = Number(stage.dataset.stage) === stageNumber;
      stage.hidden = !isTarget;
      stage.classList.toggle("is-active", isTarget);
    });
    updateBreadcrumb(stageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateFirstStage() {
    const nameValid = nameInput.value.trim().length > 0;
    const idValid = idInput.value.trim().length > 0;
    const phoneValid = /^1\d{10}$/.test(phoneInput.value.trim());

    setError(nameInput, "name-error", nameValid ? "" : "姓名不能为空");
    setError(idInput, "id-error", idValid ? "" : "请输入学号");
    setError(phoneInput, "phone-error", phoneValid ? "" : "请输入正确的11位手机号");

    if (!nameValid) nameInput.focus();
    else if (!idValid) idInput.focus();
    else if (!phoneValid) phoneInput.focus();

    return nameValid && idValid && phoneValid;
  }

  function revealExercise(action) {
    if (transitionPending) return;
    transitionPending = true;
    activity.viewedSafetyReveal = true;
    if (action === "request-code") activity.requestedCode = true;
    if (action === "submit") activity.submittedVerification = true;
    clearSensitiveFields();

    byId("result-message").textContent = activity.requestedCode
      ? "你已经走到了“获取验证码”这一步。如果这是真实诈骗，此时应该立即停止操作并通过官方渠道进行核实。"
      : "你已经进入了“验证码”验证环节。如果这是真实诈骗，此时应该立即停止操作并通过官方渠道进行核实。";

    byId("reveal-footer").hidden = false;
    byId("footer-primary").hidden = true;
    showStage(3);
    transitionPending = false;
  }

  infoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateFirstStage()) return;
    activity.continuedToVerification = true;
    const phone = phoneInput.value.trim();
    byId("masked-phone-value").textContent = `${phone.slice(0, 3)}****${phone.slice(-4)}`;
    clearSensitiveFields();
    showStage(2);
  });

  [nameInput, idInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
      const errorId = input === nameInput ? "name-error" : input === idInput ? "id-error" : "phone-error";
      setError(input, errorId, "");
    });
  });

  requestCodeButton.addEventListener("click", () => {
    if (transitionPending) return;
    transitionPending = true;
    activity.requestedCode = true;
    requestCodeButton.disabled = true;
    loadingMask.hidden = false;

    window.setTimeout(() => {
      loadingMask.hidden = true;
      requestCodeButton.disabled = false;
      transitionPending = false;
      revealExercise("request-code");
    }, 700);
  });

  byId("verify-submit").addEventListener("click", () => revealExercise("submit"));
  byId("back-to-info").addEventListener("click", () => {
    clearSensitiveFields();
    showStage(1);
  });

  byId("restart-demo").addEventListener("click", () => {
    clearSensitiveFields();
    activity.continuedToVerification = false;
    activity.requestedCode = false;
    activity.submittedVerification = false;
    activity.viewedSafetyReveal = false;
    byId("reveal-footer").hidden = true;
    byId("footer-primary").hidden = false;
    showStage(1);
  });
})();
