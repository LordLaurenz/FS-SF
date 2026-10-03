(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var bg = form.querySelector('select[name="background"]');
  var other = document.getElementById('bg-other');
  var otherInput = other && other.querySelector('input');
  var err = document.getElementById('form-error');
  var btn = form.querySelector('button[type="submit"]');

  function syncOther() {
    var on = bg.value === 'other';
    other.hidden = !on;
    if (otherInput) otherInput.required = on;
  }
  bg.addEventListener('change', syncOther);
  syncOther();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var fd = new FormData(form);
    var data = {
      firstName: fd.get('firstName') || '',
      lastName: fd.get('lastName') || '',
      email: fd.get('email') || '',
      company: fd.get('company') || '',
      background: fd.get('background') || '',
      backgroundOther: fd.get('backgroundOther') || '',
      contribute: fd.getAll('contribute'),
      message: fd.get('message') || '',
      consent: fd.get('consent') === 'on',
      website: fd.get('website') || ''
    };
    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Sending…';
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      document.getElementById('form-body').hidden = true;
      document.getElementById('form-sent').hidden = false;
    }).catch(function () {
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = label;
    });
  });
})();
