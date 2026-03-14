const wizard = document.getElementById("wizard");

const ductworkPresenceOptions = [
  { label: "Yes", image: "https://www.novakheating.com/wp-content/webp-express/webp-images/uploads/2022/09/Novak_Ducts-vs.-Vents-1.png.webp", value: true },
  { label: "No", image: "https://fredelectric.com/wp-content/uploads/2026/01/Baseboard-Heaters-to-Heat-Pump-Blog-1024x576.png", value: false },
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


const systemSizeReference = [
  { ton: "1.5 ton", coolingBTU: "18,000 BTU", homeMin: 600, homeMax: 900, furnaceRange: "30k – 45k BTU" },
  { ton: "2 ton", coolingBTU: "24,000 BTU", homeMin: 900, homeMax: 1200, furnaceRange: "40k – 60k BTU" },
  { ton: "2.5 ton", coolingBTU: "30,000 BTU", homeMin: 1200, homeMax: 1500, furnaceRange: "50k – 70k BTU" },
  { ton: "3 ton", coolingBTU: "36,000 BTU", homeMin: 1500, homeMax: 1800, furnaceRange: "60k – 80k BTU" },
  { ton: "3.5 ton", coolingBTU: "42,000 BTU", homeMin: 1800, homeMax: 2100, furnaceRange: "70k – 90k BTU" },
  { ton: "4 ton", coolingBTU: "48,000 BTU", homeMin: 2100, homeMax: 2400, furnaceRange: "80k – 100k BTU" },
  { ton: "5 ton", coolingBTU: "60,000 BTU", homeMin: 2400, homeMax: 3000, furnaceRange: "100k – 120k BTU" },
];

const furnaceOnlyReference = [
  { output: "40,000 BTU", homeMin: 800, homeMax: 1000 },
  { output: "60,000 BTU", homeMin: 1200, homeMax: 1500 },
  { output: "80,000 BTU", homeMin: 1600, homeMax: 2000 },
  { output: "100,000 BTU", homeMin: 2000, homeMax: 2500 },
  { output: "120,000 BTU", homeMin: 2500, homeMax: 3000 },
];

const state = {
  hasDuctwork: null,
  currentSystem: null,
  currentFuelType: null,
  currentTargetType: null,
  desiredSystem: null,
  conversionPageTitle: null,
  gasEfficiency: null,
  homeSquareFeet: null,
  currentKnownSystemSize: null,
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
  state.currentKnownSystemSize = null;
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
  state.currentKnownSystemSize = null;

        if (isDirectReplacement(option)) {
          state.conversionPageTitle = null;
          continueToSizingFlow();
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
        renderDesiredDuctedSystem();
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
      <div class="know-size-block">
        <p class="know-size-title">Do you know your current system size?</p>
        <div class="option-row">
          <button class="primary-btn glowing-btn" type="button" data-role="know-size-yes">Yes</button>
          <button class="secondary-btn glowing-btn" type="button" data-role="know-size-no">No</button>
        </div>
        <div class="option-row know-size-options" data-role="size-options" hidden>
          <button class="primary-btn glowing-btn" type="button" data-size="1.5 ton">1.5 Ton</button>
          <button class="primary-btn glowing-btn" type="button" data-size="2 ton">2 Ton</button>
          <button class="primary-btn glowing-btn" type="button" data-size="2.5 ton">2.5 Ton</button>
          <button class="primary-btn glowing-btn" type="button" data-size="3 ton">3 Ton</button>
          <button class="primary-btn glowing-btn" type="button" data-size="3.5 ton">3.5 Ton</button>
          <button class="primary-btn glowing-btn" type="button" data-size="4 ton">4 Ton</button>
          <button class="primary-btn glowing-btn" type="button" data-size="5 ton">5 Ton</button>
        </div>
      </div>
      <button class="primary-btn glowing-btn" type="submit">Continue</button>
    </form>
    <button class="secondary-btn" type="button" data-role="back-button">Back</button>
  `;

  const form = wizard.querySelector('[data-role="size-form"]');
  const input = form.querySelector('input[name="squareFeet"]');
  const knowYesBtn = wizard.querySelector('[data-role="know-size-yes"]');
  const knowNoBtn = wizard.querySelector('[data-role="know-size-no"]');
  const sizeOptions = wizard.querySelector('[data-role="size-options"]');

  if (state.homeSquareFeet) {
    input.value = state.homeSquareFeet;
  }

  if (state.currentKnownSystemSize) {
    sizeOptions.hidden = false;
  }

  knowYesBtn.addEventListener("click", () => {
    sizeOptions.hidden = false;
  });

  knowNoBtn.addEventListener("click", () => {
    sizeOptions.hidden = true;
    state.currentKnownSystemSize = null;
  });

  sizeOptions.querySelectorAll('button[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentKnownSystemSize = btn.getAttribute('data-size');
      sizeOptions.querySelectorAll('button[data-size]').forEach((otherBtn) => {
        otherBtn.classList.remove('selected-size-btn');
      });
      btn.classList.add('selected-size-btn');
    });

    if (state.currentKnownSystemSize === btn.getAttribute('data-size')) {
      btn.classList.add('selected-size-btn');
    }
  });

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

    renderDesiredDuctedSystem();
  });
}


function getRecommendedSystemRange(squareFeet) {
  if (!squareFeet) {
    return null;
  }

  const numericSqFt = Number(squareFeet);
  const overlaps = systemSizeReference.filter((item) => numericSqFt >= item.homeMin && numericSqFt <= item.homeMax);

  if (overlaps.length > 0) {
    return overlaps;
  }

  if (numericSqFt < systemSizeReference[0].homeMin) {
    return [systemSizeReference[0]];
  }

  return [systemSizeReference[systemSizeReference.length - 1]];
}

function getRecommendedFurnaceOnlyRange(squareFeet) {
  if (!squareFeet) {
    return null;
  }

  const numericSqFt = Number(squareFeet);
  const overlaps = furnaceOnlyReference.filter((item) => numericSqFt >= item.homeMin && numericSqFt <= item.homeMax);

  if (overlaps.length > 0) {
    return overlaps;
  }

  if (numericSqFt < furnaceOnlyReference[0].homeMin) {
    return [furnaceOnlyReference[0]];
  }

  return [furnaceOnlyReference[furnaceOnlyReference.length - 1]];
}


function isHeatPumpSelection() {
  if (!state.desiredSystem) {
    return false;
  }

  return state.desiredSystem.targetType === "Heat Pump";
}

function isFurnaceOnlySelection() {
  if (!state.desiredSystem) {
    return false;
  }

  return state.desiredSystem.label.startsWith("Gas Furnace Only") || state.desiredSystem.label.startsWith("Oil Furnace Only");
}

function getRecommendedAndNextSizes(squareFeet) {
  const recommendedRange = getRecommendedSystemRange(squareFeet);
  if (!recommendedRange || recommendedRange.length === 0) {
    return { recommended: null, next: null };
  }

  const recommended = recommendedRange[0];
  const recommendedIndex = systemSizeReference.findIndex((item) => item.ton === recommended.ton);
  const next =
    recommendedIndex >= 0 && recommendedIndex < systemSizeReference.length - 1
      ? systemSizeReference[recommendedIndex + 1]
      : null;

  return { recommended, next };
}

function getSelectedSystemViewLabel() {
  if (!state.desiredSystem) {
    return "Systems";
  }

  if (state.desiredSystem.targetType === "Heat Pump") {
    return "Heat Pumps";
  }

  if (state.desiredSystem.targetType === "Gas Furnace") {
    return "Gas Furnaces";
  }

  if (state.desiredSystem.targetType === "Oil Furnace") {
    return "Oil Furnaces";
  }

  if (state.desiredSystem.targetType === "Fan Coil") {
    return "Fan Coils";
  }

  return "Systems";
}

function buildSizingMarkup() {
  const recommendedSystems = getRecommendedSystemRange(state.homeSquareFeet);
  const recommendedFurnaceOnly = getRecommendedFurnaceOnlyRange(state.homeSquareFeet);
  const { recommended, next } = getRecommendedAndNextSizes(state.homeSquareFeet);
  const selectedLabel = getSelectedSystemViewLabel();

  if (!recommendedSystems) {
    return "";
  }

  const systemRows = recommendedSystems
    .map((item) => {
      const baseLine = `<strong>${item.ton}</strong> (${item.coolingBTU}) · Typical home: ${item.homeMin}–${item.homeMax} sq ft`;
      const includeFurnaceRange = !isHeatPumpSelection();
      return `<li>${baseLine}${includeFurnaceRange ? ` · Typical furnace range: ${item.furnaceRange}` : ""}</li>`;
    })
    .join("");

  const furnaceRows = (recommendedFurnaceOnly || [])
    .map((item) => `<li><strong>${item.output}</strong> · Typical home: ${item.homeMin}–${item.homeMax} sq ft</li>`)
    .join("");

  const furnaceSection = isFurnaceOnlySelection()
    ? `
      <h3 class="sizing-title">Furnace-Only Heating Reference</h3>
      <ul class="sizing-list">${furnaceRows}</ul>
    `
    : "";

  const viewButtonsMarkup =
    state.desiredSystem && recommended
      ? `
      <div class="option-row sizing-actions">
        <button type="button" class="primary-btn glowing-btn" data-role="view-recommended-size">View ${recommended.ton} ${selectedLabel}</button>
        ${next ? `<button type="button" class="secondary-btn glowing-btn" data-role="view-next-size">View ${next.ton} ${selectedLabel}</button>` : ""}
      </div>
    `
      : "";

  return `
    <section class="sizing-panel">
      <h3 class="sizing-title">Estimated System Size Range</h3>
      <p class="panel-subtitle">Based on ${state.homeSquareFeet} sq ft and typical local residential assumptions (average insulation, 8–9 ft ceilings).</p>
      <ul class="sizing-list">${systemRows}</ul>
      ${viewButtonsMarkup}
      ${furnaceSection}
      <p class="panel-subtitle"><strong>Sizing & Pricing Disclaimer:</strong> The system sizes and pricing shown here are based on the square footage information you provided and typical sizing guidelines for homes in our area. Once you’ve selected the system you’d like, you can schedule your free verification and sizing appointment online with The Heating and Cooling Guys. During this visit, we’ll confirm the equipment selection and installation details. As long as no additional issues or installation requirements are discovered, the pricing shown here will remain accurate. If any adjustments are needed, we’ll review them with you before moving forward.</p>
    </section>
  `;
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

  if (state.currentKnownSystemSize) {
    summary.push(`Known current system size: ${state.currentKnownSystemSize}.`);
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

  const sizingMarkup = buildSizingMarkup();
  if (sizingMarkup) {
    wizard.insertAdjacentHTML("beforeend", sizingMarkup);

    const recommendedBtn = wizard.querySelector('[data-role="view-recommended-size"]');
    if (recommendedBtn) {
      recommendedBtn.addEventListener("click", renderContactPage);
    }

    const nextBtn = wizard.querySelector('[data-role="view-next-size"]');
    if (nextBtn) {
      nextBtn.addEventListener("click", renderContactPage);
    }
  }
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
