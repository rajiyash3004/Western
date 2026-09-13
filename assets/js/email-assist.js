/* ===== Western Avenue — email-assist.js =====
   Live email validation + domain-typo correction + domain autocomplete.
   Usage: waSetupEmailAssist('emailInputId','iconId','hintId','suggestBoxId');
*/

const WA_COMMON_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','rediffmail.com','protonmail.com','live.com'];
const WA_TYPO_MAP = {
  'gmial.com':'gmail.com','gmai.com':'gmail.com','gmal.com':'gmail.com','gmail.co':'gmail.com','gmail.cm':'gmail.com','gmail.con':'gmail.com',
  'yahooo.com':'yahoo.com','yaho.com':'yahoo.com','yahoo.co':'yahoo.com',
  'outlok.com':'outlook.com','outllok.com':'outlook.com','outlook.co':'outlook.com',
  'hotmial.com':'hotmail.com','hotmil.com':'hotmail.com','hotmail.co':'hotmail.com',
  'iclod.com':'icloud.com','icoud.com':'icloud.com'
};

function waCheckIconSvg(){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="4 12 9 17 20 6"/></svg>';
}
function waCrossIconSvg(){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
}
function waIsValidEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function waSetupEmailAssist(inputId, iconId, hintId, suggestId){
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  const hint = document.getElementById(hintId);
  const suggestBox = document.getElementById(suggestId);
  if(!input) return;

  function clearSuggest(){
    if(!suggestBox) return;
    suggestBox.classList.remove('show');
    suggestBox.innerHTML = '';
  }

  function applyDomain(domain){
    const local = input.value.split('@')[0];
    input.value = local + '@' + domain;
    clearSuggest();
    evaluate();
    input.focus();
  }

  function evaluate(){
    const val = input.value.trim();
    if(icon){ icon.classList.remove('show'); icon.style.color = ''; }
    if(hint){ hint.textContent = ''; hint.className = 'field-hint'; }
    clearSuggest();

    if(val.length === 0) return;

    const atIndex = val.indexOf('@');
    if(atIndex > -1){
      const domainPart = val.slice(atIndex + 1);

      if(domainPart.length > 2 && WA_TYPO_MAP[domainPart.toLowerCase()]){
        const fixed = WA_TYPO_MAP[domainPart.toLowerCase()];
        const fullFixed = val.slice(0, atIndex + 1) + fixed;
        if(hint){
          hint.className = 'field-hint bad';
          hint.innerHTML = 'Did you mean <button type="button">' + fullFixed + '</button>?';
          hint.querySelector('button').addEventListener('click', function(){
            input.value = fullFixed;
            evaluate();
          });
        }
      } else if(domainPart.length > 0 && !domainPart.includes('.')){
        const matches = WA_COMMON_DOMAINS.filter(function(d){ return d.startsWith(domainPart.toLowerCase()); });
        if(matches.length && suggestBox){
          suggestBox.innerHTML = matches.map(function(d){
            return '<button type="button" data-domain="' + d + '">' + val.slice(0, atIndex + 1) + '<b>' + d + '</b></button>';
          }).join('');
          suggestBox.classList.add('show');
          suggestBox.querySelectorAll('button').forEach(function(btn){
            btn.addEventListener('click', function(){ applyDomain(btn.getAttribute('data-domain')); });
          });
        }
      }
    }

    if(waIsValidEmail(val)){
      if(icon){ icon.classList.add('show'); icon.style.color = 'var(--good)'; icon.innerHTML = waCheckIconSvg(); }
      input.classList.add('valid'); input.classList.remove('invalid');
      if(hint && !hint.textContent){ hint.className = 'field-hint good'; hint.textContent = 'Looks good.'; }
    } else if(atIndex > -1 && val.length > 4){
      if(icon){ icon.classList.add('show'); icon.style.color = 'var(--bad)'; icon.innerHTML = waCrossIconSvg(); }
      input.classList.add('invalid'); input.classList.remove('valid');
    } else {
      input.classList.remove('valid','invalid');
    }
  }

  input.addEventListener('input', evaluate);
  input.addEventListener('blur', function(){ setTimeout(clearSuggest, 150); });
}

function waSetupPasswordToggle(scope){
  (scope || document).querySelectorAll('.pw-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      const target = document.getElementById(btn.getAttribute('data-target'));
      if(!target) return;
      if(target.type === 'password'){ target.type = 'text'; btn.textContent = 'HIDE'; }
      else { target.type = 'password'; btn.textContent = 'SHOW'; }
    });
  });
}

function waSetupPasswordStrength(inputId, barsId, labelId){
  const input = document.getElementById(inputId);
  const bars = document.getElementById(barsId);
  const label = document.getElementById(labelId);
  if(!input || !bars) return;
  const spans = bars.querySelectorAll('span');

  input.addEventListener('input', function(){
    const v = input.value;
    let score = 0;
    if(v.length >= 6) score++;
    if(v.length >= 10) score++;
    if(/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;

    spans.forEach(function(s){ s.className = ''; });
    let cls = '', text = '';
    if(v.length === 0){ text = ''; }
    else if(score <= 2){ cls = 'on-weak'; text = 'Weak — try adding numbers or symbols'; }
    else if(score <= 3){ cls = 'on-ok'; text = 'Okay — a little longer would help'; }
    else { cls = 'on-strong'; text = 'Strong password'; }

    const fillCount = v.length === 0 ? 0 : Math.min(spans.length, Math.max(1, score));
    for(let i = 0; i < fillCount; i++){ spans[i].className = cls; }
    if(label) label.textContent = text;
  });
}
