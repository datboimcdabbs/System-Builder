const wizard = document.getElementById("wizard");

const systemsWithDuctwork = [
  { label: "Heat Pump System", image: "assets/heat-pump.svg" },
  { label: "A/C and Gas Furnace", image: "assets/ac-gas-furnace.svg" },
  { label: "A/C and Oil Furnace", image: "assets/ac-oil-furnace.svg" },
  { label: "A/C and Fan Coil", image: "assets/ac-fan-coil.svg" },
  { label: "Oil Furnace Only", image: "assets/oil-furnace-only.svg" },
  { label: "Gas Furnace Only", image: "assets/gas-furnace-only.svg" },
];

const systemsWithoutDuctwork = [
  { label: "I don’t have any system in my home, but I want one!", image: "assets/no-system.svg" },
  { label: "Oil Boiler", image: "assets/oil-boiler.svg" },
  { label: "Gas Boiler", image: "assets/gas-boiler.svg" },
  { label: "Gas Combi-Boiler/Tankless Water Heater", image: "assets/combi-boiler.svg" },
  { label: "Mini Split (Indoor and Outdoor Units)", image: "assets/mini-split.svg" },
];

const desiredDuctedSystems = systemsWithDuctwork.map((item) => ({
  ...item,
  label: `${item.label} (Using Your Existing Ductwork)`,
}));

const state = {
  hasDuctwork: null,
  currentSystem: null,
};

function clearWizard() {
  wizard.innerHTML = "";
}

function renderBinaryQuestion({ title, subtitle, options }) {
  clearWizard();
  const template = document.getElementById("binary-question-template").content.cloneNode(true);
  template.querySelector(".panel-title").textContent = title;
  template.querySelector(".panel-subtitle").textContent = subtitle || "";
  const row = template.querySelector('[data-role="binary-options"]');

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = option.label;
    button.addEventListener("click", option.onClick);
    row.appendChild(button);
  });

  wizard.appendChild(template);
}

function renderThumbnailQuestion({ title, subtitle, options, onBack, highlightMatcher }) {
  clearWizard();
  const template = document.getElementById("thumbnail-question-template").content.cloneNode(true);
  template.querySelector(".panel-title").textContent = title;
  template.querySelector(".panel-subtitle").textContent = subtitle;
  const grid = template.querySelector('[data-role="thumbnail-options"]');

  options.forEach((option) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "thumbnail-card";

    if (highlightMatcher && highlightMatcher(option)) {
      const badge = document.createElement("span");
      badge.className = "direct-badge";
      badge.textContent = "Direct Replacement";
      card.appendChild(badge);
    }

    const img = document.createElement("img");
    img.src = option.image;
    img.alt = option.label;
    const text = document.createElement("span");
    text.textContent = option.label;

    card.append(img, text);
    card.addEventListener("click", option.onClick);
    grid.appendChild(card);
  });

  template.querySelector('[data-role="back-button"]').addEventListener("click", onBack);
  wizard.appendChild(template);
}

function renderDuctCondition() {
  clearWizard();
  const template = document.getElementById("duct-check-template").content.cloneNode(true);
  const stack = template.querySelector('[data-role="duct-options"]');

  const addOption = ({ label, onClick, expandableCopy }) => {
    const wrapper = document.createElement("div");
    wrapper.className = "duct-option";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "duct-option-btn";
    button.textContent = label;
    button.addEventListener("click", () => {
      if (!expandableCopy) {
        onClick();
        return;
      }

      const existing = wrapper.querySelector(".expand-copy");
      if (existing) {
        existing.remove();
        return;
      }

      const expandable = document.createElement("div");
      expandable.className = "expand-copy";
      expandable.innerHTML = `
        <p>We always confirm the ductwork during your free Pre-Install Verification appointment, to make sure that your existing ducts can provide the best comfort with your new system!</p>
        <button class="primary-btn" type="button">Continue</button>
      `;
      expandable.querySelector("button").addEventListener("click", onClick);
      wrapper.appendChild(expandable);
    });

    wrapper.appendChild(button);
    stack.appendChild(wrapper);
  };

  addOption({
    label: "Yes, I believe my ductwork is in usable condition.",
    onClick: renderDesiredDuctedSystem,
  });

  addOption({
    label: "I think it is good, but I want to make sure first.",
    onClick: renderDesiredDuctedSystem,
    expandableCopy: true,
  });

  addOption({
    label: "I believe that some or all of my ductwork may need to be replaced.",
    onClick: renderContactPage,
  });

  template.querySelector('[data-role="back-button"]').addEventListener("click", renderCurrentSystemQuestion);
  wizard.appendChild(template);
}

function renderCurrentSystemQuestion() {
  const list = state.hasDuctwork ? systemsWithDuctwork : systemsWithoutDuctwork;
  renderThumbnailQuestion({
    title: "What type of system do you have?",
    subtitle: "What system currently heats and/or cools your home?",
    options: list.map((option) => ({
      ...option,
      onClick: () => {
        state.currentSystem = option.label;
        if (state.hasDuctwork) {
          renderDuctCondition();
          return;
        }
        renderContactPage();
      },
    })),
    onBack: renderStart,
  });
}

function renderDesiredDuctedSystem() {
  renderThumbnailQuestion({
    title: "What type of system are you looking to get installed?",
    subtitle: "All ducted replacement systems qualify for 10 Years of Free Maintenance!",
    options: desiredDuctedSystems.map((option) => ({
      ...option,
      onClick: () => renderFinalStep(option.label),
    })),
    onBack: renderDuctCondition,
    highlightMatcher: (option) => option.label.startsWith(state.currentSystem),
  });
}

function renderFinalStep(selectedSystem) {
  clearWizard();
  const template = document.getElementById("final-template").content.cloneNode(true);
  template.querySelector('[data-role="summary"]').textContent =
    `You selected: ${selectedSystem}. We also noted your current system as ${state.currentSystem}.`;
  template.querySelector('[data-role="contact-button"]').addEventListener("click", renderContactPage);
  template.querySelector('[data-role="restart-button"]').addEventListener("click", renderStart);
  wizard.appendChild(template);
}

function renderContactPage() {
  clearWizard();
  const template = document.getElementById("contact-template").content.cloneNode(true);
  const form = template.querySelector('[data-role="contact-form"]');

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.createElement("p");
    message.className = "form-message";
    message.textContent = "Thank you! A comfort specialist will contact you shortly.";
    form.replaceWith(message);
  });

  template.querySelector('[data-role="restart-button"]').addEventListener("click", renderStart);
  wizard.appendChild(template);
}

function renderStart() {
  state.hasDuctwork = null;
  state.currentSystem = null;
  renderBinaryQuestion({
    title:
      "Does your Heating/Cooling system use Ductwork and registers to keep your air comfortable?",
    subtitle: "",
    options: [
      {
        label: "Yes",
        onClick: () => {
          state.hasDuctwork = true;
          renderCurrentSystemQuestion();
        },
      },
      {
        label: "No",
        onClick: () => {
          state.hasDuctwork = false;
          renderCurrentSystemQuestion();
        },
      },
    ],
  });
}

renderStart();
