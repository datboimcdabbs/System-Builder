const proposalEntries = Object.entries(quoteData.proposalData);
const proposalGrid = document.querySelector('#proposal-grid');
const detailsPanel = document.querySelector('#details-panel');
const selectionPill = document.querySelector('#selection-pill');
const quoteMeta = document.querySelector('#quote-meta');
const cardTemplate = document.querySelector('#proposal-card-template');

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatDate = (timestamp) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(timestamp));

const createBadgeItems = (proposal) => {
  const badges = [];

  if (proposal.showEnergyStarBadge) badges.push('Energy Star');
  if (proposal.showRebateBadge) badges.push('Utility Rebate');
  if (proposal.showColdBadge) badges.push(proposal.coldClimateText || 'Cold Climate');
  if (proposal.showNeepBadge) badges.push('NEEP Listed');

  return badges;
};

const metricSummary = (proposal) => [
  { label: 'SEER2', value: proposal.seer2 },
  { label: 'EER2', value: proposal.eer2 },
  { label: 'HSPF2', value: proposal.hspf2 },
];

const renderMeta = () => {
  const metaItems = [
    ['Quote name', quoteData.name],
    ['Saved', formatDate(quoteData.savedAt)],
    ['Payment type', quoteData.paymentType.toUpperCase()],
    ['Selected add-ons', 'Basic thermostat • Basic filter'],
  ];

  quoteMeta.innerHTML = metaItems
    .map(
      ([label, value]) => `
        <article class="meta-card">
          <p class="meta-card__label">${label}</p>
          <p class="meta-card__value">${value}</p>
        </article>
      `,
    )
    .join('');
};

const renderCards = (selectedKey) => {
  proposalGrid.innerHTML = '';

  proposalEntries.forEach(([key, proposal]) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const button = fragment.querySelector('.proposal-card');
    const image = fragment.querySelector('.proposal-card__image');
    const title = fragment.querySelector('.proposal-card__title');
    const price = fragment.querySelector('.proposal-card__price');
    const description = fragment.querySelector('.proposal-card__description');
    const badgeRow = fragment.querySelector('.badge-row');
    const metrics = fragment.querySelector('.metrics');

    button.dataset.key = key;
    button.classList.toggle('is-selected', key === selectedKey);
    button.setAttribute('aria-pressed', key === selectedKey ? 'true' : 'false');

    image.src = proposal.image;
    image.alt = proposal.title;
    title.textContent = proposal.title;
    price.textContent = formatCurrency.format(proposal.subtotal);
    description.textContent = proposal.description;

    badgeRow.innerHTML = createBadgeItems(proposal)
      .map((badge) => `<span class="badge">${badge}</span>`)
      .join('');

    metrics.innerHTML = metricSummary(proposal)
      .map(
        (metric) => `<span class="metric"><strong>${metric.value}</strong> ${metric.label}</span>`,
      )
      .join('');

    button.addEventListener('click', () => selectProposal(key));
    proposalGrid.appendChild(fragment);
  });
};

const renderFeatureItems = (items) =>
  items.map((item) => `<li>${item}</li>`).join('');

const renderDetails = (selectedKey) => {
  const proposal = quoteData.proposalData[selectedKey];
  const outdoorLabel = proposal.outdoorLabel || 'Outdoor equipment';
  const indoorLabel = proposal.indoorLabel || 'Indoor equipment';

  selectionPill.textContent = `Selected: ${proposal.title}`;

  detailsPanel.innerHTML = `
    <div class="details-header">
      <div class="details-header__copy">
        <p class="section-kicker">Proposal details</p>
        <h2>${proposal.title}</h2>
        <p class="copy">${proposal.description}</p>
        <div class="detail-badges">
          ${createBadgeItems(proposal)
            .map((badge) => `<span class="badge">${badge}</span>`)
            .join('')}
        </div>
      </div>
      <div class="details-image">
        <img src="${proposal.image}" alt="${proposal.title}" />
      </div>
    </div>

    <div class="details-grid">
      <article class="info-card">
        <h4>${outdoorLabel}</h4>
        <div class="spec-list">
          <span>${proposal.outdoor}</span>
          <span><strong>SEER2:</strong> ${proposal.seer2} • ${proposal.seer2Summary}</span>
          <span><strong>EER2:</strong> ${proposal.eer2} • ${proposal.eer2Summary}</span>
          <span><strong>HSPF2:</strong> ${proposal.hspf2} • ${proposal.hspf2Summary}</span>
        </div>
      </article>
      <article class="info-card">
        <h4>${indoorLabel}</h4>
        <div class="spec-list">
          <span>${proposal.indoor}</span>
          <span><strong>Efficiency range:</strong> ${proposal.seer2Range.join('–')} SEER2</span>
          <span><strong>Peak demand range:</strong> ${proposal.eer2Range.join('–')} EER2</span>
          <span><strong>Heating range:</strong> ${proposal.hspf2Range.join('–')} HSPF2</span>
        </div>
      </article>
    </div>

    <div class="detail-links">
      <a class="link-chip" href="${proposal.ahriLink}" target="_blank" rel="noopener noreferrer">${proposal.ahriText}</a>
      ${proposal.neepLink ? `<a class="link-chip" href="${proposal.neepLink}" target="_blank" rel="noopener noreferrer">View NEEP Listing</a>` : ''}
      ${proposal.rebateText ? `<span class="link-chip">${proposal.rebateText}</span>` : ''}
    </div>

    <section class="detail-section">
      <h3>Outdoor unit highlights</h3>
      ${proposal.outdoorFeatureDescription ? `<p class="copy">${proposal.outdoorFeatureDescription}</p>` : ''}
      <ul class="feature-list">${renderFeatureItems(proposal.outdoorFeatures)}</ul>
    </section>

    <section class="detail-section">
      <h3>Indoor unit highlights</h3>
      ${proposal.indoorFeatureDescription ? `<p class="copy">${proposal.indoorFeatureDescription}</p>` : ''}
      <ul class="feature-list">${renderFeatureItems(proposal.indoorFeatures)}</ul>
    </section>

    <div class="price-callout">
      <div class="price-callout__meta">
        <span class="price-callout__label">System subtotal</span>
        <span class="price-callout__value">${formatCurrency.format(proposal.subtotal)}</span>
      </div>
      <div class="price-callout__meta">
        <span class="price-callout__label">Payment method</span>
        <span>${quoteData.paymentType === 'cash' ? 'Cash proposal view' : 'Financing proposal view'}</span>
      </div>
      ${proposal.cashNetTotalOverride ? `<div class="price-callout__meta"><span class="price-callout__label">Cash net total</span><span>${formatCurrency.format(proposal.cashNetTotalOverride)}</span></div>` : ''}
      ${proposal.financeMonthlyOverride ? `<div class="price-callout__meta"><span class="price-callout__label">Estimated monthly</span><span>${formatCurrency.format(proposal.financeMonthlyOverride)}</span></div>` : ''}
    </div>

    <div class="cta-row">
      <button class="primary-action" type="button">Continue with ${proposal.title}</button>
      <button class="secondary-action" type="button">Download proposal PDF</button>
    </div>

    <p class="disclaimer">Prototype view generated from the saved quote payload for ID ${quoteData.id}. Buttons are placeholders for your existing quote acceptance and download flows.</p>
  `;
};

const selectProposal = (selectedKey) => {
  renderCards(selectedKey);
  renderDetails(selectedKey);
};

renderMeta();
selectProposal(quoteData.currentProposalKey);
