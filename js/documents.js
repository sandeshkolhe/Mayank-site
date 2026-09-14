/**
 * Mayank CHS Redevelopment Portal - Documents Preview Module
 * Preview only: no download links are rendered. Every published document is
 * listed as title + Preview, in the order they are stored; one without a file
 * yet (an upcoming meeting) shows an "Available Soon" note instead.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDocumentsPage();
});

function initDocumentsPage() {
  renderDocuments();
  setupDocModal();
}

function renderDocuments() {
  const container = document.getElementById('documentsListContainer');
  if (!container) return;

  // IMPORTANT: getPublicDocuments() filters ONLY items where status === 'active'
  const docs = window.MayankStore ? window.MayankStore.getPublicDocuments() : [];

  if (docs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3.5rem 1.5rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--border-strong);">
        <p style="color: var(--slate-600); font-size: 0.95rem;">No documents are published yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = docs.map(doc => `
    <article class="document-card" data-id="${escapeHtml(doc.id)}">
      <div class="doc-icon-wrap" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      </div>

      <h3 class="doc-title">${escapeHtml(doc.title)}</h3>

      <div class="doc-actions">
        ${doc.fileUrl ? `
        <button type="button" class="btn-preview" onclick="previewDocumentModal('${escapeHtml(doc.id)}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Preview
        </button>` : `
        <span class="doc-pending">Available Soon</span>`}
      </div>
    </article>
  `).join('');
}

/**
 * In-page PDF Preview Modal (no download link provided)
 */
function setupDocModal() {
  const modal = document.getElementById('documentPreviewModal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('.modal-close, .modal-dismiss');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', closePreviewModal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePreviewModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closePreviewModal();
  });
}

function closePreviewModal() {
  const modal = document.getElementById('documentPreviewModal');
  const frame = document.getElementById('modalDocFrame');
  if (modal) modal.classList.remove('show');
  if (frame) frame.src = ''; // stop loading / free memory once closed
}

function previewDocumentModal(docId) {
  const doc = window.MayankStore ? window.MayankStore.getDocumentById(docId) : null;
  if (!doc) return;

  const modal = document.getElementById('documentPreviewModal');
  if (!modal) return;

  document.getElementById('modalDocTitle').textContent = doc.title;

  const frame = document.getElementById('modalDocFrame');
  if (frame && doc.fileUrl) {
    frame.title = doc.title;
    frame.src = doc.fileUrl + '#toolbar=0&navpanes=0';
  }

  modal.classList.add('show');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
}

window.previewDocumentModal = previewDocumentModal;
window.closePreviewModal = closePreviewModal;
