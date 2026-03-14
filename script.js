const wizard = document.getElementById("wizard");

const ductworkPresenceOptions = [
  { label: "Yes", image: "assets/ductwork-yes.svg", value: true },
  { label: "No", image: "assets/ductwork-no.svg", value: false },
];

const systemsWithDuctwork = [
  { label: "Heat Pump System", image: "assets/heat-pump.svg", fuelType: "electric", targetType: "Heat Pump" },
  {
    label: "A/C and Gas Furnace",
    image: "assets/ac-gas-furnace.svg",
    fuelType: "gas",
    targetType: "Gas Furnace",
  },
  {
    label: "A/C and Oil Furnace",
    image: "assets/ac-oil-furnace.svg",
    fuelType: "oil",
    targetType: "Oil Furnace",
  },
  { label: "A/C and Fan Coil", image: "assets/ac-fan-coil.svg", fuelType: "electric", targetType: "Fan Coil" },
  { label: "Oil Furnace Only", image: "assets/oil-furnace-only.svg", fuelType: "oil", targetType: "Oil Furnace" },
  { label: "Gas Furnace Only", image: "assets/gas-furnace-only.svg", fuelType: "gas", targetType: "Gas Furnace" },
];

const systemsWithoutDuctwork = [
  { label: "I don’t have any system in my home, but I want one!", image: "assets/no-system.svg" },
  { label: "Oil Boiler", image: "assets/oil-boiler.svg" },
  { label: "Gas Boiler", image: "assets/gas-boiler.svg" },
  { label: "Gas Combi-Boiler/Tankless Water Heater", image: "assets/combi-boiler.svg" },
  { label: "Mini Split (Indoor and Outdoor Units)", image: "assets/mini-split.svg" },
];

const ductConditionOptions = [
  {
    label: "Yes, I believe my ductwork is in usable condition.",
    image: "assets/duct-condition-good.svg",
    onSelect: () => renderDesiredDuctedSystem(),
  },
  {
    label: "I think it is good, but I want to make sure first.",
    image: "assets/duct-condition-check.svg",
    expandableCopy:
      "We always confirm the ductwork during your free Pre-Install Verification appointment, to make sure that your existing ducts can provide the best comfort with your new system!",
    onSelect: () => renderDesiredDuctedSystem(),
  },
  {
    label: "I believe that some or all of my ductwork may need to be replaced.",
    image: "assets/duct-condition-replace.svg",
    onSelect: () => renderContactPage(),
  },
];

const desiredDuctedSystems = systemsWithDuctwork.map((item) => ({
  ...item,
  label: `${item.label} (Using Your Existing Ductwork)`,
}));

const fuelLabel = {
  gas: "Gas",
  oil: "Oil",
  electric: "Electric",
};

const state = {
  hasDuctwork: null,
  currentSystem: null,
  currentFuelType: null,
  currentTargetType: null,
};

function clearWizard() {
  wizard.innerHTML = "";
}

function createThumbnailCard(option, highlightMatcher) {
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
  return card;
}

function renderThumbnailQuestion({ title, subtitle, options, onBack, highlightMatcher, cardClass }) {
  clearWizard();
  const template = document.getElementById("thumbnail-question-template").content.cloneNode(true);
  template.querySelector(".panel-title").textContent = title;
  template.querySelector(".panel-subtitle").textContent = subtitle || "";
  const grid = template.querySelector('[data-role="thumbnail-options"]');

  if (cardClass) {
    grid.classList.add(cardClass);
  }

  options.forEach((option) => {
    const card = createThumbnailCard(option, highlightMatcher);
    card.addEventListener("click", option.onClick);
    grid.appendChild(card);

    if (option.expandableCopy) {
      const expandable = document.createElement("div");
      expandable.className = "expand-copy";
      expandable.hidden = true;
      expandable.innerHTML = `
        <p>${option.expandableCopy}</p>
        <button class="primary-btn" type="button">Continue</button>
      `;
      expandable.querySelector("button").addEventListener("click", (event) => {
        event.stopPropagation();
        option.onClick();
      });
      card.addEventListener("click", () => {
        expandable.hidden = !expandable.hidden;
      });
      grid.appendChild(expandable);
    }
  });

  const backBtn = template.querySelector('[data-role="back-button"]');
  if (onBack) {
    backBtn.addEventListener("click", onBack);
  } else {
    backBtn.remove();
  }

  wizard.appendChild(template);
}

function renderStart() {
  state.hasDuctwork = null;
  state.currentSystem = null;
  state.currentFuelType = null;
  state.currentTargetType = null;

  renderThumbnailQuestion({
    title: "Does your Heating/Cooling system use Ductwork and registers to keep your air comfortable?",
    subtitle: "Choose the option that best matches your home.",
    options: ductworkPresenceOptions.map((option) => ({
      ...option,
      onClick: () => {
        state.hasDuctwork = option.value;
        renderCurrentSystemQuestion();
      },
    })),
    onBack: null,
  });
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
        state.currentFuelType = option.fuelType || null;
        state.currentTargetType = option.targetType || null;

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

function renderDuctCondition() {
  renderThumbnailQuestion({
    title: "Is your ductwork and registers in usable condition?",
    subtitle:
      "All ducted replacement systems qualify for 10 Years of Free Maintenance! We’ve seen it all—some ductwork systems have more holes than my dad’s socks, and some have become a home for a family of raccoons (you would probably know if this applies to you). We have even conducted a cat rescue mission in a customer's ductwork (the cat was upset at us when we pulled her out, but otherwise she’s happy and healthy to this day!).",
    options: ductConditionOptions.map((option) => ({
      ...option,
      onClick: option.onSelect,
    })),
    onBack: renderCurrentSystemQuestion,
    cardClass: "thumbnail-grid--duct-condition",
  });
}

function isDirectReplacement(option) {
  return option.label.startsWith(state.currentSystem);
}

function getConversionPageTitle(targetSystem) {
  const fromLabel = state.currentTargetType || fuelLabel[state.currentFuelType] || "Current System";
  const toLabel = targetSystem.targetType || fuelLabel[targetSystem.fuelType] || "New System";
  return `${fromLabel} to ${toLabel} Page`;
}

function renderDesiredDuctedSystem() {
  renderThumbnailQuestion({
    title: "What type of system are you looking to get installed?",
    subtitle: "All ducted replacement systems qualify for 10 Years of Free Maintenance!",
    options: desiredDuctedSystems.map((option) => ({
      ...option,
      onClick: () => {
        if (isDirectReplacement(option)) {
          renderFinalStep(option.label);
          return;
        }
        renderSystemConversionPage(option);
      },
    })),
    onBack: renderDuctCondition,
    highlightMatcher: (option) => isDirectReplacement(option),
  });
}

function renderSystemConversionPage(targetSystem) {
  clearWizard();
  const title = getConversionPageTitle(targetSystem);
  const desiredLabel = targetSystem.label.replace(" (Using Your Existing Ductwork)", "");

  wizard.innerHTML = `
    <h2 class="panel-title">${title}</h2>
    <p class="panel-subtitle">
      You currently have <strong>${state.currentSystem}</strong> and selected
      <strong>${desiredLabel}</strong>.
    </p>
    <p class="panel-subtitle">
      Stand-in page for this specific conversion setup. During your free Pre-Install Verification,
      we’ll confirm design requirements, equipment compatibility, electrical/fuel updates, and available rebates.
    </p>
    <div class="option-row">
      <button class="primary-btn" type="button" data-role="to-contact">Continue to Contact Us</button>
      <button class="secondary-btn" type="button" data-role="to-desired">Back to System Choices</button>
    </div>
  `;

  wizard.querySelector('[data-role="to-contact"]').addEventListener("click", renderContactPage);
  wizard.querySelector('[data-role="to-desired"]').addEventListener("click", renderDesiredDuctedSystem);
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

renderStart();
