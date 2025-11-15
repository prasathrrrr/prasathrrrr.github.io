// script: set title from URL param and ensure animation restarts on click
(function(){
  const params = new URLSearchParams(location.search);
  const title = params.get('title') || 'YOUR TITLE';
  const textEl = document.querySelector('.hero-text .paint');
  if(textEl){
    textEl.textContent = title.toUpperCase();
  }

  // allow clicking the SVG to replay draw animation
  const svg = document.querySelector('.hero-text');
  svg && svg.addEventListener('click', ()=>{
    const el = document.querySelector('.hero-text .paint');
    if(!el) return;
    el.style.animation = 'none';
    // force reflow
    void el.offsetWidth;
    el.style.animation = '';
  });
  
  // Intro scroll reveal: use IntersectionObserver to reveal HELLO and reverse on scroll back
  const intro = document.getElementById('intro');
  if(intro && 'IntersectionObserver' in window){
    // We want HELLO to be hidden on first paint and only reveal when the user
    // actually starts scrolling down. A sticky full-viewport intro will start
    // fully intersecting (ratio=1) so we wait until the intersectionRatio
    // drops slightly (user scrolled) to trigger the reveal; when ratio returns
    // to ~1 we hide it again.
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        // reveal when the intro is no longer fully occupying the viewport
        if(entry.intersectionRatio < 0.98 && entry.intersectionRatio > 0){
          intro.classList.add('visible');
        } else {
          intro.classList.remove('visible');
        }
      });
    },{threshold:[0,0.01,0.25,0.5,0.75,0.98,1]});
    io.observe(intro);
    // also observe when intro is fully scrolled past to add a blacken state
    const ioPast = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.boundingClientRect.bottom <= 0){
          intro.classList.add('blacken');
        } else {
          intro.classList.remove('blacken');
        }
      });
    });
    ioPast.observe(intro);
  } else if(intro){
    // fallback: simple scroll listener
    const onScroll = ()=>{
      const rect = intro.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const reveal = rect.top < vh * 0.6 && rect.bottom > vh * 0.2;
      if(reveal){ intro.classList.add('visible') } else { intro.classList.remove('visible') }
      if(rect.bottom <= 0){ intro.classList.add('blacken') } else { intro.classList.remove('blacken') }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  // Contact form submission (uses a configurable endpoint such as Formspree)
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const statusEl = contactForm.querySelector('.form-status');
      const endpoint = contactForm.dataset.endpoint && contactForm.dataset.endpoint.trim();
      if(!endpoint){
        statusEl.textContent = 'Missing endpoint: paste your Formspree endpoint into the form "data-endpoint" attribute (see README).';
        statusEl.style.color = '#f8b4b4';
        return;
      }

      const formData = new FormData(contactForm);
      statusEl.textContent = 'Sending...';
      statusEl.style.color = '#fff';
      try{
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if(res.ok){
          contactForm.reset();
          statusEl.textContent = 'Message sent — thank you!';
          statusEl.style.color = '#a7f3d0';
        } else {
          const data = await res.json().catch(()=>({}));
          statusEl.textContent = data.error || 'Failed to send — please try again later.';
          statusEl.style.color = '#f8b4b4';
        }
      }catch(err){
        statusEl.textContent = 'Network error — please try again.';
        statusEl.style.color = '#f8b4b4';
      }
    });
  }

  // Side label show/hide and detach behavior (supports multiple hero sections)
  const sideLabels = document.querySelectorAll('.side-label');
  const heroEls = Array.from(document.querySelectorAll('.hero'));
  const introEl = document.getElementById('intro');
  if(heroEls.length && introEl){
    let introVisible = false;
    let heroVisible = false;
    let contactVisible = false;
    const updateClasses = ()=>{
      // if contact section is visible, always hide labels
      if(contactVisible){
        document.body.classList.remove('labels-visible','labels-detach');
        document.body.classList.add('labels-hidden');
        return;
      }
      if(introVisible){
        // when intro visible, animate detach to top and hide
        document.body.classList.remove('labels-visible');
        document.body.classList.add('labels-detach');
        clearTimeout(window._labelsDetachTO);
        window._labelsDetachTO = setTimeout(()=>{
          document.body.classList.remove('labels-detach');
          document.body.classList.add('labels-hidden');
        }, 450);
      } else if(!introVisible && heroVisible){
        // show labels floating next to photo(s)
        document.body.classList.remove('labels-hidden','labels-detach');
        document.body.classList.add('labels-visible');
      } else {
        // neither intro nor hero: hide labels
        document.body.classList.remove('labels-visible','labels-detach');
        document.body.classList.add('labels-hidden');
      }
    };

    const ioIntro = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ introVisible = e.intersectionRatio > 0.98; updateClasses(); });
    },{threshold:[0,0.25,0.5,0.75,0.98,1]});
    ioIntro.observe(introEl);

    // Use a robust viewport check (getBoundingClientRect) for hero visibility.
    // IntersectionObserver entries can be unreliable across multiple full-bleed
    // elements in some browsers; checking geometry on scroll/resize is simple
    // and reliable. We use requestAnimationFrame to throttle updates.
    let rafId = null;
    const checkHeroes = ()=>{
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // consider a hero visible if any part of it is within the viewport
      const anyVisible = heroEls.some(h=>{
        const r = h.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh;
      });
      heroVisible = anyVisible;
      updateClasses();
      rafId = null;
    };
    const scheduleCheck = ()=>{
      if(rafId == null) rafId = requestAnimationFrame(checkHeroes);
    };
    // initial check
    scheduleCheck();
    window.addEventListener('scroll', scheduleCheck, {passive:true});
    window.addEventListener('resize', scheduleCheck);

    // Observe contact section so labels stay hidden when user reaches contact
    const contactEl = document.getElementById('contact');
    if(contactEl){
      const ioContact = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ contactVisible = e.intersectionRatio > 0; updateClasses(); });
      },{threshold:[0,0.01,0.25]});
      ioContact.observe(contactEl);
    }

    // Smooth scroll when clicking side links that are internal anchors (#id).
    // If a side-link points to an external page (e.g. "projects.html"),
    // we should allow normal navigation instead of preventing the default.
    document.querySelectorAll('.side-link').forEach(a=>{
      a.addEventListener('click', (ev)=>{
        const href = a.getAttribute('href') || '';
        // Only intercept and smooth-scroll for hash links
        if(href.startsWith('#')){
          ev.preventDefault();
          const id = href.slice(1);
          const target = document.getElementById(id);
          if(target){ target.scrollIntoView({behavior:'smooth',block:'start'}); }
        }
        // otherwise, allow the browser to follow the link (no preventDefault)
      });
    });
  }

  // Trigger quote animation for center-quote when the second hero is visible
  const centerQuote = document.querySelector('.hero-2 .center-quote');
  if(centerQuote && 'IntersectionObserver' in window){
    const ioQuote = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting && e.intersectionRatio > 0.2){
          centerQuote.classList.add('visible');
        } else {
          centerQuote.classList.remove('visible');
        }
      });
    },{threshold:[0,0.2,0.5]});
    ioQuote.observe(document.querySelector('.hero-2'));
  } else if(centerQuote){
    // fallback: just make it visible
    centerQuote.classList.add('visible');
  }
})();
