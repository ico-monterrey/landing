(() => {
  const form = document.querySelector('#registerFormV21');
  if (!form) return;

  const country = document.querySelector('#phoneCountryV21');
  const phoneLocal = document.querySelector('#phoneLocalV21');
  const whatsapp = document.querySelector('#whatsappV21');
  const phoneField = document.querySelector('#phoneFieldV21');
  const submit = document.querySelector('#registerSubmitV21');
  const status = document.querySelector('#formStatusV21');

  let sending = false;
  let complete = false;

  const digitsOnly = value => String(value || '').replace(/\D/g, '');

  function isMexico() {
    return String(country?.value || '') === '+52';
  }

  function formatMexico(value) {
    const d = digitsOnly(value).slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `${d.slice(0,2)} ${d.slice(2)}`;
    return `${d.slice(0,2)} ${d.slice(2,6)} ${d.slice(6,10)}`;
  }

  function formatInternational(value) {
    const d = digitsOnly(value).slice(0, 15);
    return d.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }

  function applyPhoneFormat() {
    if (!phoneLocal) return;
    const formatted = isMexico()
      ? formatMexico(phoneLocal.value)
      : formatInternational(phoneLocal.value);
    phoneLocal.value = formatted;
    phoneLocal.maxLength = isMexico() ? 12 : 20;
  }

  function setStatus(message, type = '') {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    if (type) status.classList.add(`is-${type}`);
  }

  function buildPhone() {
    const dial = String(country?.value || '+52').trim();
    const local = digitsOnly(phoneLocal?.value);
    const allDigits = digitsOnly(dial) + local;

    if (isMexico() && local.length !== 10) {
      phoneField?.classList.add('is-invalid');
      return '';
    }

    if (!isMexico() && (local.length < 7 || allDigits.length > 15)) {
      phoneField?.classList.add('is-invalid');
      return '';
    }

    phoneField?.classList.remove('is-invalid');
    return `+${allDigits}`;
  }

  phoneLocal?.addEventListener('input', () => {
    applyPhoneFormat();
    phoneField?.classList.remove('is-invalid');
    if (status?.classList.contains('is-error')) setStatus('');
  });

  country?.addEventListener('change', () => {
    applyPhoneFormat();
    phoneField?.classList.remove('is-invalid');
    if (status?.classList.contains('is-error')) setStatus('');
  });

  applyPhoneFormat();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || complete) return;

    setStatus('');

    if (!form.reportValidity()) return;

    const fullPhone = buildPhone();
    if (!fullPhone) {
      setStatus(isMexico() ? 'Escribe un número de WhatsApp de 10 dígitos.' : 'Revisa tu número de WhatsApp antes de continuar.', 'error');
      phoneLocal?.focus();
      return;
    }

    if (whatsapp) whatsapp.value = fullPhone;

    const payload = Object.fromEntries(new FormData(form));
    delete payload.phoneLocal;

    if (payload.website) return;

    sending = true;
    form.setAttribute('aria-busy', 'true');
    submit?.classList.remove('is-success');
    submit?.classList.add('is-loading');
    if (submit) submit.disabled = true;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      let result = null;
      try { result = await response.json(); } catch (_) {}

      if (!response.ok || result?.ok === false) {
        throw new Error(result?.message || 'No se pudo completar el registro.');
      }

      sending = false;
      complete = true;
      form.removeAttribute('aria-busy');
      form.classList.add('is-success');
      submit?.classList.remove('is-loading');
      submit?.classList.add('is-success');

      form.querySelectorAll('input:not([type="hidden"]), select').forEach(control => {
        control.disabled = true;
      });

      setStatus('');

    } catch (error) {
      sending = false;
      form.removeAttribute('aria-busy');
      submit?.classList.remove('is-loading');
      if (submit) submit.disabled = false;
      setStatus(error?.message || 'No pudimos enviar tu registro. Intenta de nuevo.', 'error');
    }
  });
})();
