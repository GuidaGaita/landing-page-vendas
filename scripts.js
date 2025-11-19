const testimonialSlides = [
	{
		quote: 'In four weeks I doubled MRR using the launch sprints.',
		name: 'Marina Costa',
		role: 'Course Creator'
	},
	{
		quote: 'The funnel templates saved months of work—worth every cent.',
		name: 'Lucas Andrade',
		role: 'Agency Owner'
	},
	{
		quote: 'Community feedback and coaching unlocked my best launch yet.',
		name: 'Ana Ribeiro',
		role: 'Infoproduct Producer'
	}
];

function mountCarousel(trackEl, slides) {
	slides.forEach((slide) => {
		const div = document.createElement('div');
		div.className = 'carousel-slide';
		if (slide.image) {
			const img = document.createElement('img');
			img.src = slide.image;
			img.alt = slide.title;
			div.appendChild(img);
		}
		if (slide.title) {
			const h3 = document.createElement('h3');
			h3.textContent = slide.title;
			div.appendChild(h3);
		}
		const p = document.createElement('p');
		p.textContent = slide.copy ?? slide.quote;
		div.appendChild(p);
		if (slide.name) {
			const span = document.createElement('span');
			span.textContent = `${slide.name} • ${slide.role}`;
			span.style.color = 'var(--accent)';
			span.style.fontWeight = '600';
			div.appendChild(span);
		}
		trackEl.appendChild(div);
	});
}

function setupCarousel(rootSelector, slides) {
	const track = document.querySelector(`.carousel-track[data-carousel="${rootSelector}"]`);
	const container = track?.parentElement;
	if (!track || !container) return;

	mountCarousel(track, slides);

	let index = 0;
	const slidesCount = slides.length;
	function update() {
		track.style.transform = `translateX(-${index * 100}%)`;
	}
	container.querySelectorAll('.carousel-control').forEach((btn) => {
		btn.addEventListener('click', () => {
			if (btn.classList.contains('next')) index = (index + 1) % slidesCount;
			else index = (index - 1 + slidesCount) % slidesCount;
			update();
		});
	});
	setInterval(() => {
		index = (index + 1) % slidesCount;
		update();
	}, 5000);
}

function setupReveal() {
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const targets = document.querySelectorAll('[data-animate]');
	if (prefersReduced) {
		targets.forEach(el => el.classList.add('in'));
		return;
	}
	const io = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('in');
				obs.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
	targets.forEach(el => io.observe(el));
}

const selectors = {
  countdown: {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  },
  faqToggles: document.querySelectorAll(".faq-toggle"),
  animated: document.querySelectorAll("[data-animate]"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function startCountdown() {
  const target = Date.now() + 72 * 60 * 60 * 1000;

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      selectors.countdown.days.textContent = "00";
      selectors.countdown.hours.textContent = "00";
      selectors.countdown.mins.textContent = "00";
      selectors.countdown.secs.textContent = "00";
      return;
    }

    const secs = Math.floor(diff / 1000);
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    selectors.countdown.days.textContent = pad(days);
    selectors.countdown.hours.textContent = pad(hours);
    selectors.countdown.mins.textContent = pad(mins);
    selectors.countdown.secs.textContent = pad(seconds);

    requestAnimationFrame(tick);
  };

  tick();
}

function setupFaq() {
  selectors.faqToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      const content = toggle.nextElementSibling;
      if (!expanded) {
        content.removeAttribute("hidden");
      } else {
        content.setAttribute("hidden", "");
      }
    });
  });
}

function setupScrollAnimations() {
  if (!("IntersectionObserver" in window)) {
    selectors.animated.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  selectors.animated.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
	// remove setupCarousel('hero', heroSlides);
	setupCarousel('testimonials', testimonialSlides);
	setupReveal();
	startCountdown();
	setupFaq();
	setupScrollAnimations();
});
