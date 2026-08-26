(function () {
  'use strict';

  /* ---------- billing history: empty-state preview ----------
     A labelled QA affordance ("Preview: no billing history yet"), not part of
     the product IA — it lets both gates and a human reviewer see the table
     survive zero rows without shipping two separate screens. */
  var emptyPreview = document.getElementById('emptyPreview');
  var historyWrap = document.getElementById('historyWrap');
  var emptyHistory = document.getElementById('emptyHistory');
  if (emptyPreview) {
    emptyPreview.addEventListener('change', function () {
      var isEmpty = emptyPreview.checked;
      historyWrap.hidden = isEmpty;
      emptyHistory.hidden = !isEmpty;
    });
  }

  /* ---------- cancel-subscription confirmation dialog ---------- */
  var trigger = document.getElementById('cancelTrigger');
  var overlay = document.getElementById('cancelOverlay');
  var dialog = document.getElementById('cancelDialog');
  var dismissBtn = document.getElementById('cancelDismiss');
  var confirmBtn = document.getElementById('cancelConfirm');
  var confirmLabel = confirmBtn.querySelector('.btn__label');
  var iconWrap = document.getElementById('cancelDialogIconWrap');
  var icon = document.getElementById('cancelDialogIcon');
  var titleEl = document.getElementById('cancelDialogTitle');
  var bodyEl = document.getElementById('cancelDialogBody');
  var actionsEl = document.getElementById('cancelDialogActions');
  var statusEl = document.getElementById('cancelStatus');
  var dangerCard = document.getElementById('dangerCard');

  var lastFocused = null;
  var resumeTarget = null; // where focus should land after a completed cancellation
  var isProcessing = false; // true while the cancel request is "in flight"

  function focusableEls() {
    var nodes = dialog.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(nodes, function (el) {
      return el.offsetParent !== null;
    });
  }

  function openDialog() {
    lastFocused = document.activeElement;
    isProcessing = false;
    overlay.hidden = false;
    document.addEventListener('keydown', onKeydown, true);
    var f = focusableEls();
    (f[0] || dialog).focus();
  }

  function closeDialog() {
    overlay.hidden = true;
    document.removeEventListener('keydown', onKeydown, true);
    var target = resumeTarget || lastFocused;
    resumeTarget = null;
    if (target && typeof target.focus === 'function') target.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (isProcessing) return; // a request is in flight — Escape does not abort it
      e.preventDefault();
      closeDialog();
      return;
    }
    if (e.key === 'Tab') {
      var f = focusableEls();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  trigger.addEventListener('click', openDialog);
  dismissBtn.addEventListener('click', closeDialog);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay && !isProcessing) closeDialog();
  });

  confirmBtn.addEventListener('click', function () {
    isProcessing = true;
    confirmBtn.disabled = true;
    dismissBtn.disabled = true;
    confirmBtn.setAttribute('aria-busy', 'true');
    confirmBtn.classList.add('is-loading');
    confirmLabel.textContent = 'Cancelling…';
    window.setTimeout(showCompletion, 900);
  });

  function showCompletion() {
    isProcessing = false;
    // the href lives on the <use> child, not the wrapping <svg> that carries the id
    icon.querySelector('use').setAttribute('href', '#i-check');
    iconWrap.classList.add('dialog__icon-wrap--done');
    titleEl.textContent = 'Subscription canceled';
    bodyEl.textContent = 'You’ll keep Team access until Sept 24, 2026, then your workspace moves to the Free plan.';
    actionsEl.innerHTML = '';
    var doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'btn btn--primary';
    doneBtn.id = 'cancelDone';
    doneBtn.textContent = 'Done';
    actionsEl.appendChild(doneBtn);
    statusEl.textContent = 'Subscription canceled. Team access ends Sept 24, 2026.';

    updateDangerCard();
    resumeTarget = document.getElementById('resumeBtn');
    doneBtn.addEventListener('click', closeDialog);
    doneBtn.focus();
  }

  function updateDangerCard() {
    dangerCard.classList.add('danger-card--resolved');
    dangerCard.innerHTML =
      '<div class="danger-card__text">' +
      '<p class="danger-card__title">Subscription canceled</p>' +
      '<p class="danger-card__body">Team access ends Sept 24, 2026. After that your workspace moves to the Free plan.</p>' +
      '</div>' +
      '<button class="btn btn--secondary" id="resumeBtn" type="button">Resume subscription</button>';
  }
})();
