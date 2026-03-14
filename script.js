const wizard = document.getElementById("wizard");

const ductworkPresenceOptions = [
  { label: "Yes", image: "https://www.novakheating.com/wp-content/webp-express/webp-images/uploads/2022/09/Novak_Ducts-vs.-Vents-1.png.webp", value: true },
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

const gasEfficiencyOptions = [
  {
    key: "standard",
    label: "Standard Efficiency Gas Furnace",
    image: "assets/gas-standard-efficiency.svg",
  },
  {
    key: "high",
    label: "High Efficiency Gas Furnace",
    image: "assets/gas-high-efficiency.svg",
  },
  {
    key: "upgrade",
    label: "I have a Standard Gas Furnace But I want a High Efficiency Upgrade",
    image: "assets/gas-high-upgrade.svg",
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
  desiredSystem: null,
  conversionPageTitle: null,
  gasEfficiency: null,
  homeSquareFeet: null,
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

function resetDuctedPathState() {
  state.desiredSystem = null;
  state.conversionPageTitle = null;
  state.gasEfficiency = null;
  state.homeSquareFeet = null;
}

function renderStart() {
  state.hasDuctwork = null;
  state.currentSystem = null;
  state.currentFuelType = null;
  state.currentTargetType = null;
  resetDuctedPathState();

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
        resetDuctedPathState();

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

function isGasSystemSelection() {
  return state.currentSystem === "A/C and Gas Furnace" || state.currentSystem === "Gas Furnace Only";
}

function continueToSizingFlow() {
  if (isGasSystemSelection() && !state.gasEfficiency) {
    renderGasEfficiencyQuestion();
    return;
  }

  renderHomeSizeQuestion();
}

function renderDesiredDuctedSystem() {
  renderThumbnailQuestion({
    title: "What type of system are you looking to get installed?",
    subtitle: "All ducted replacement systems qualify for 10 Years of Free Maintenance!",
    options: desiredDuctedSystems.map((option) => ({
      ...option,
      onClick: () => {
        state.desiredSystem = option;
        state.homeSquareFeet = null;

        if (isDirectReplacement(option)) {
          state.conversionPageTitle = null;
          renderDuctedSelectionPage();
          return;
        }

        state.conversionPageTitle = getConversionPageTitle(option);
        renderSystemConversionPage();
      },
    })),
    onBack: renderDuctCondition,
    highlightMatcher: (option) => isDirectReplacement(option),
  });
}

function renderDuctedSelectionPage() {
  clearWizard();
  wizard.innerHTML = `
    <h2 class="panel-title">Selected System Path</h2>
    <p class="panel-subtitle">
      You currently have <strong>${state.currentSystem}</strong> and selected
      <strong>${state.desiredSystem.label.replace(" (Using Your Existing Ductwork)", "")}</strong>.
    </p>
    <div class="option-row">
      <button class="primary-btn" type="button" data-role="to-sizing">Continue to System Selection</button>
      <button class="secondary-btn" type="button" data-role="to-desired">Back to System Choices</button>
    </div>
  `;

  wizard.querySelector('[data-role="to-sizing"]').addEventListener("click", continueToSizingFlow);
  wizard.querySelector('[data-role="to-desired"]').addEventListener("click", renderDesiredDuctedSystem);
}

function renderSystemConversionPage() {
  clearWizard();
  const desiredLabel = state.desiredSystem.label.replace(" (Using Your Existing Ductwork)", "");

  wizard.innerHTML = `
    <h2 class="panel-title">${state.conversionPageTitle}</h2>
    <p class="panel-subtitle">
      You currently have <strong>${state.currentSystem}</strong> and selected
      <strong>${desiredLabel}</strong>.
    </p>
    <p class="panel-subtitle">
      Stand-in page for this specific conversion setup. During your free Pre-Install Verification,
      we’ll confirm design requirements, equipment compatibility, electrical/fuel updates, and available rebates.
    </p>
    <div class="option-row">
      <button class="primary-btn" type="button" data-role="to-sizing">Continue to System Selection</button>
      <button class="secondary-btn" type="button" data-role="to-desired">Back to System Choices</button>
    </div>
  `;

  wizard.querySelector('[data-role="to-sizing"]').addEventListener("click", continueToSizingFlow);
  wizard.querySelector('[data-role="to-desired"]').addEventListener("click", renderDesiredDuctedSystem);
}

function renderGasEfficiencyQuestion() {
  renderThumbnailQuestion({
    title: "What gas furnace efficiency do you currently have?",
    subtitle: "Choose the option that best matches your current gas setup.",
    options: gasEfficiencyOptions.map((option) => ({
      ...option,
      onClick: () => {
        if (option.key === "upgrade") {
          renderHighEfficiencyUpgradePage();
          return;
        }

        state.gasEfficiency = option.key;
        renderHomeSizeQuestion();
      },
    })),
    onBack: () => {
      if (state.conversionPageTitle) {
        renderSystemConversionPage();
      } else {
        renderDuctedSelectionPage();
      }
    },
    cardClass: "thumbnail-grid--xl",
  });
}

function renderHighEfficiencyUpgradePage() {
  clearWizard();
  state.gasEfficiency = "standard_to_high_upgrade";
  wizard.innerHTML = `
    <h2 class="panel-title">High Efficiency Furnace Upgrade Page</h2>
    <p class="panel-subtitle">
      Great choice. We’ll evaluate venting updates, condensate handling, and airflow requirements needed
      for a high-efficiency gas furnace upgrade.
    </p>
    <div class="option-row">
      <button class="primary-btn" type="button" data-role="to-sizing">Continue to System Sizing</button>
      <button class="secondary-btn" type="button" data-role="to-efficiency">Back to Efficiency Options</button>
    </div>
  `;

  wizard.querySelector('[data-role="to-sizing"]').addEventListener("click", renderHomeSizeQuestion);
  wizard.querySelector('[data-role="to-efficiency"]').addEventListener("click", renderGasEfficiencyQuestion);
}

function renderHomeSizeQuestion() {
  clearWizard();
  wizard.innerHTML = `
    <h2 class="panel-title">What size home do you have?</h2>
    <p class="panel-subtitle">Enter your home size in square feet so we can prepare system sizing guidance.</p>
    <form class="contact-form" data-role="size-form">
      <label>
        Home Size (Square Feet)
        <input required name="squareFeet" type="number" min="300" step="1" placeholder="e.g., 2200" />
      </label>
      <button class="primary-btn" type="submit">Continue</button>
    </form>
    <button class="secondary-btn" type="button" data-role="back-button">Back</button>
  `;

  const form = wizard.querySelector('[data-role="size-form"]');
  const input = form.querySelector('input[name="squareFeet"]');
  if (state.homeSquareFeet) {
    input.value = state.homeSquareFeet;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.homeSquareFeet = input.value;
    renderFinalStep();
  });

  wizard.querySelector('[data-role="back-button"]').addEventListener("click", () => {
    if (isGasSystemSelection()) {
      renderGasEfficiencyQuestion();
      return;
    }

    if (state.conversionPageTitle) {
      renderSystemConversionPage();
      return;
    }

    renderDuctedSelectionPage();
  });
}

function renderFinalStep() {
  clearWizard();
  const template = document.getElementById("final-template").content.cloneNode(true);
  const summary = [];

  if (state.desiredSystem) {
    summary.push(`You selected: ${state.desiredSystem.label}.`);
  }

  if (state.currentSystem) {
    summary.push(`Current system: ${state.currentSystem}.`);
  }

  if (state.homeSquareFeet) {
    summary.push(`Home size: ${state.homeSquareFeet} sq ft.`);
  }

  if (state.gasEfficiency === "standard") {
    summary.push("Gas furnace efficiency noted: Standard.");
  } else if (state.gasEfficiency === "high") {
    summary.push("Gas furnace efficiency noted: High.");
  } else if (state.gasEfficiency === "standard_to_high_upgrade") {
    summary.push("Requested path: Standard gas furnace to high-efficiency upgrade.");
  }

  if (state.conversionPageTitle) {
    summary.push(`Conversion path: ${state.conversionPageTitle.replace(" Page", "")}.`);
  }

  template.querySelector('[data-role="summary"]').textContent = summary.join(" ");
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
