// year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// intersection reveal
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// GitHub auto-fetch disabled; curated projects are listed statically in index.html

// Render Experience from resume API
// Experience is now statically rendered from resume content in index.html

// Render resume-derived sections
(function renderProfile() {
  const eduList = document.getElementById('education-list');
  const expList = document.getElementById('experience-list');
  const awdList = document.getElementById('awards-list');
  if (!eduList && !expList && !awdList) return;

  fetch('/api/profile')
    .then(res => res.json())
    .then(data => {
      // Education
      if (eduList) {
        const items = (data.education || []).map(entry => `
          <article class="card reveal">
            <h3>${escapeHtml(entry.title)}</h3>
            ${(entry.details || []).map(d => `<p class="meta">${escapeHtml(d)}</p>`).join('')}
          </article>
        `);
        eduList.innerHTML = items.join('') || '<p class="meta">No education data found.</p>';
      }

      // Experience
      if (expList) {
        const items = (data.experience || []).map(entry => `
          <article class="item reveal">
            <div class="item-header">
              <h3>${escapeHtml(entry.title)}</h3>
            </div>
            <ul class="bullets">
              ${(entry.details || []).map(d => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
          </article>
        `);
        expList.innerHTML = items.join('') || '<p class="meta">No experience data found.</p>';
      }

      // Awards & Certifications
      if (awdList) {
        const awards = (data.awards || []).concat(data.certifications || []);
        const items = awards.map(entry => `
          <article class="card reveal">
            <h3>${escapeHtml(entry.title)}</h3>
            ${(entry.details || []).map(d => `<p class="meta">${escapeHtml(d)}</p>`).join('')}
          </article>
        `);
        awdList.innerHTML = items.join('') || '<p class="meta">No awards or certifications found.</p>';
      }

      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })
    .catch(err => {
      console.error('Profile load error:', err);
      if (eduList) eduList.innerHTML = '<p class="meta">Unable to load education from resume.</p>';
      if (expList) expList.innerHTML = '<p class="meta">Unable to load experience from resume.</p>';
      if (awdList) awdList.innerHTML = '<p class="meta">Unable to load awards/certifications from resume.</p>';
    });
})();