document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Dark/Light Theme Handler
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Retrieve theme preference from localStorage or fall back to system dark-mode preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    body.className = currentTheme;
  } else {
    // If no preference stored, check standard operating system settings
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    body.className = systemPrefersLight ? 'light-theme' : 'dark-theme';
  }

  // Toggle button event listener
  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('theme', 'light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  });


  // ==========================================
  // 2. Accordion Panel Animation Manager
  // ==========================================
  const accordions = document.querySelectorAll('.accordion-card');

  accordions.forEach(card => {
    const header = card.querySelector('.accordion-header');
    const content = card.querySelector('.accordion-content');

    header.addEventListener('click', (e) => {
      // Prevent button default actions
      e.preventDefault();

      const isExpanded = card.classList.contains('is-expanded');

      // Toggle state representation
      if (isExpanded) {
        card.classList.remove('is-expanded');
        header.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0px';
      } else {
        card.classList.add('is-expanded');
        header.setAttribute('aria-expanded', 'true');
        // Set dynamic height from internal scroll height for a fluid animation
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });

  // Re-adjust accordion content heights on window resize if they are currently expanded
  window.addEventListener('resize', () => {
    accordions.forEach(card => {
      if (card.classList.contains('is-expanded')) {
        const content = card.querySelector('.accordion-content');
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });


  // ==========================================
  // 3. Clipboard Copy & Toast Alert Manager
  // ==========================================
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  let toastTimeout = null;

  // Robust fallback for copy to clipboard
  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('copy command failed'));
        }
      } catch (err) {
        document.body.removeChild(textArea);
        return Promise.reject(err);
      }
    }
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Avoid triggering any card click events

      const targetId = btn.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).textContent.trim();

      try {
        await copyTextToClipboard(textToCopy);
        
        // Visual button confirmation states
        const copySvg = btn.querySelector('.copy-svg');
        const checkSvg = btn.querySelector('.check-svg');

        copySvg.style.display = 'none';
        checkSvg.style.display = 'block';

        // Trigger global Toast feedback
        showToast(`Copied path to clipboard!`);

        // Revert back button state after 2 seconds
        setTimeout(() => {
          copySvg.style.display = 'block';
          checkSvg.style.display = 'none';
        }, 2000);

      } catch (err) {
        console.error('Failed to copy to clipboard: ', err);
        showToast('Failed to copy path. Please select manually.');
      }
    });
  });

  // Helper function to animate the toast popup
  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    
    toast.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
});
