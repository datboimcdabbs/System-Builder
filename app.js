const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const proposalTabs = document.getElementById("proposal-tabs");
const quoteName = document.getElementById("quote-name");
const paymentType = document.getElementById("payment-type");
const proposalImage = document.getElementById("proposal-image");
const proposalTitle = document.getElementById("proposal-title");
const proposalPrice = document.getElementById("proposal-price");
const proposalDescription = document.getElementById("proposal-description");
const badgeRow = document.getElementById("badge-row");
const seer2 = document.getElementById("seer2");
const eer2 = document.getElementById("eer2");
const hspf2 = document.getElementById("hspf2");
const seer2Summary = document.getElementById("seer2-summary");
const eer2Summary = document.getElementById("eer2-summary");
const hspf2Summary = document.getElementById("hspf2-summary");
const outdoorLabel = document.getElementById("outdoor-label");
const outdoor = document.getElementById("outdoor");
const indoorLabel = document.getElementById("indoor-label");
const indoor = document.getElementById("indoor");
const ahriLink = document.getElementById("ahri-link");
const rebate = document.getElementById("rebate");
const selectionSummary = document.getElementById("selection-summary");
const outdoorFeatureDescription = document.getElementById("outdoor-feature-description");
const indoorFeatureDescription = document.getElementById("indoor-feature-description");
const outdoorFeatures = document.getElementById("outdoor-features");
const indoorFeatures = document.getElementById("indoor-features");

const badgeConfig = [
  { key: "showEnergyStarBadge", label: "Energy Star Certified", tone: "success" },
  { key: "showRebateBadge", labelFrom: "rebateText", tone: "warning" },
  { key: "showColdBadge", labelFrom: "coldClimateText", tone: "success" },
  { key: "showNeepBadge", label: "NEEP Listed", tone: "success", hrefFrom: "neepLink" },
];

const toTitleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const renderList = (element, items, allowHtml = false) => {
  element.replaceChildren();

  items.forEach((item) => {
    const li = document.createElement("li");

    if (allowHtml) {
      li.innerHTML = item;
    } else {
      li.textContent = item;
    }

    element.appendChild(li);
  });
};

const renderSelections = (selections) => {
  const items = [
    `${toTitleCase(selections.tstat.type)} thermostat included`,
    `${toTitleCase(selections.filter.type)} filtration package included`,
    selections.others > 0 ? `Additional selections: ${currency.format(selections.others)}` : "No additional accessories selected yet",
  ];

  renderList(selectionSummary, items);
};

const renderBadges = (proposal) => {
  badgeRow.replaceChildren();

  badgeConfig.forEach((badge) => {
    if (!proposal[badge.key]) {
      return;
    }

    const label = badge.labelFrom ? proposal[badge.labelFrom] : badge.label;
    const node = proposal[badge.hrefFrom] ? document.createElement("a") : document.createElement("span");
    node.className = `badge badge--${badge.tone}`;
    node.textContent = label;

    if (proposal[badge.hrefFrom]) {
      node.href = proposal[badge.hrefFrom];
      node.target = "_blank";
      node.rel = "noreferrer noopener";
    }

    badgeRow.appendChild(node);
  });
};

const renderProposal = (key, data) => {
  const proposal = data.proposalData[key];
  const total = proposal.cashNetTotalOverride ?? proposal.subtotal;

  proposalImage.src = proposal.image;
  proposalTitle.textContent = proposal.title;
  proposalPrice.textContent = currency.format(total);
  proposalDescription.textContent = proposal.description;
  renderBadges(proposal);

  seer2.textContent = proposal.seer2;
  eer2.textContent = proposal.eer2;
  hspf2.textContent = proposal.hspf2;
  seer2Summary.textContent = proposal.seer2Summary;
  eer2Summary.textContent = proposal.eer2Summary;
  hspf2Summary.textContent = proposal.hspf2Summary;

  outdoorLabel.textContent = proposal.outdoorLabel ?? "Outdoor unit";
  outdoor.textContent = proposal.outdoor;
  indoorLabel.textContent = proposal.indoorLabel ?? "Indoor unit";
  indoor.textContent = proposal.indoor;
  ahriLink.href = proposal.ahriLink;
  ahriLink.textContent = proposal.ahriText;
  rebate.textContent = proposal.rebateText;

  outdoorFeatureDescription.textContent = proposal.outdoorFeatureDescription ?? "";
  indoorFeatureDescription.textContent = proposal.indoorFeatureDescription ?? "";
  renderList(outdoorFeatures, proposal.outdoorFeatures, true);
  renderList(indoorFeatures, proposal.indoorFeatures, true);

  proposalTabs.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.key === key);
    button.setAttribute("aria-pressed", String(button.dataset.key === key));
  });
};

const renderTabs = (data) => {
  proposalTabs.replaceChildren();

  Object.entries(data.proposalData).forEach(([key, proposal]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "proposal-tab";
    button.dataset.key = key;
    button.innerHTML = `
      <small>${key === data.currentProposalKey ? "Default selection" : "Compare option"}</small>
      <strong>${proposal.title}</strong>
      <span>${proposal.seer2} SEER2 • ${proposal.hspf2} HSPF2</span>
      <span>${currency.format(proposal.cashNetTotalOverride ?? proposal.subtotal)}</span>
    `;

    button.addEventListener("click", () => renderProposal(key, data));
    proposalTabs.appendChild(button);
  });
};

const init = async () => {
  const response = await fetch("./data/quote-2026-03-21.json");
  const data = await response.json();

  quoteName.textContent = data.name;
  paymentType.textContent = `Payment: ${toTitleCase(data.paymentType)}`;

  renderSelections(data.selections);
  renderTabs(data);
  renderProposal(data.currentProposalKey, data);
};

init().catch((error) => {
  document.body.innerHTML = `<main class="page-shell"><p>Unable to load quote data.</p><pre>${error}</pre></main>`;
});
