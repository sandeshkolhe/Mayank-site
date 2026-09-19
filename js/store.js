/**
 * Mayank CHS Redevelopment Portal - Data Store & LocalStorage Manager
 */

const STORAGE_KEYS = {
  SOCIETY: 'mayank_chs_society_details',
  MEMBERS: 'mayank_chs_committee_members',
  DOCUMENTS: 'mayank_chs_documents',
  PAGE_CONTENT: 'mayank_chs_page_content',
  ADMIN_SESSION: 'mayank_chs_admin_session',
  DATA_VERSION: 'mayank_chs_data_version'
};

// Bump whenever DEFAULT_* content below changes, so returning browsers
// with older cached localStorage data pick up the new official content.
const CURRENT_DATA_VERSION = '15';

// --- Generic dot-path helpers (used to read/write nested PAGE_CONTENT fields) ---
function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function setByPath(obj, path, value) {
  if (!obj || !path) return obj;
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

// Official society details (Registration Certificate & SGBM letterhead, Plot No. 5, Sector 5, Airoli)
const DEFAULT_SOCIETY_DETAILS = {
  name: "Mayank Co-operative Housing Society Ltd.",
  shortName: "Mayank CHS",
  regNo: "N.B.O.M/CIDCO/HSG/(T.C)/10537/D.R/2024-2025",
  regDate: "22 Nov 2024",
  classification: "Tenant Co-Partnership Housing Society, registered under Section 154(B)(2) of the Maharashtra Co-operative Societies Act, 1960",
  tagline: "A Landmark Location. A Shared Vision. A New Chapter.",
  establishedYear: "2024",
  plotArea: "3,588.22 Sq. Mtrs.",
  totalUnits: "64 Member Families",
  buildings: "Building No. 9 to 12 (4 Existing Buildings)",
  plotRef: "Plot No. 5, Sector 5, Node AL-6, Airoli, Navi Mumbai",
  currentPhase: "SGBM Resolution Passed (1 Feb 2026): Redevelopment Approved & Core Committee Formed",
  address: "Mayank Co-operative Housing Society Ltd., Plot No. 5, Sector 5, Airoli, Navi Mumbai - 400708",
  landmark: "Along the Mulund-Airoli Highway, Node AL-6, Airoli",
  officeNote: "For official correspondence, members may contact the Managing Committee or Redevelopment Committee representative of their building.",
  // Left blank on purpose - fill these in from the Admin Panel. Each one is
  // hidden on the public page until it has a value, so nothing is invented.
  contactPhone: "",
  contactEmail: "",
  contactHours: "",
  heroImage: "assets/images/mayank-building-hero.jpeg",
  herbalImage: "assets/images/herbal-garden.jpg",
  // Approximate location of Sector 5, Airoli, Navi Mumbai - update with the exact
  // plot coordinates from the Admin Panel (Society Details tab).
  mapLat: "19.1484242",
  mapLng: "72.998427",
  heroDescription: "Our Housing Society, comprising of 64 members situated on a prime 3,588.22 sqm. CIDCO-leased plot along the Mulund-Airoli Highway - A location with exceptional potential for a thoughtfully planned Redevelopment. The proposed Commercial-cum-Residential Development will bring together quality Residences, well-planned Commercial spaces and Modest, carefully selected Amenities, creating a contemporary environment focused on Comfort, Convenience and lasting Values.",
  aboutParagraph1: "Our Housing Society, comprising 64 members, occupies a prime 3,588.22 sq. m. CIDCO-leased plot along the Mulund-Airoli Highway. Its location offers excellent redevelopment potential.",
  aboutParagraph2: "The proposed project will create a modern commercial-cum-residential development with quality homes, suitable commercial spaces and essential amenities, while protecting every member's interests.",
  aboutParagraph3: "Redevelopment will improve our living environment, enhance property values and support a better future for all. This website provides transparent, timely updates on project documents, milestones, presentations and decisions.",
  status: "active"
};

// Managing Committee - Source: "MC & RDC Members" record
const DEFAULT_COMMITTEE_MEMBERS = [
  { id: "mc-01", name: "Mr. Prashant Pawar", designation: "President", category: "Managing Committee", unitRef: "11/04", status: "active" },
  { id: "mc-02", name: "Mr. Bhaskar Sawant", designation: "Secretary", category: "Managing Committee", unitRef: "11/08", status: "active" },
  { id: "mc-03", name: "Mr. Sunil Suryavanshi", designation: "Treasurer", category: "Managing Committee", unitRef: "12/02", status: "active" },
  { id: "mc-04", name: "Mr. Ghanshyam Palod", designation: "Committee Member", category: "Managing Committee", unitRef: "09/07", status: "active" },
  { id: "mc-05", name: "Mrs. Sumedha Dongre", designation: "Committee Member", category: "Managing Committee", unitRef: "09/09", status: "active" },
  { id: "mc-06", name: "Mr. Krishna Iyer", designation: "Committee Member", category: "Managing Committee", unitRef: "10/01", status: "active" },
  { id: "mc-07", name: "Mr. Anil Londhe", designation: "Committee Member", category: "Managing Committee", unitRef: "10/04", status: "active" },
  { id: "mc-08", name: "Smt. Veena Dalvi", designation: "Committee Member", category: "Managing Committee", unitRef: "10/11", status: "active" },
  { id: "mc-09", name: "Mr. Murali Menon", designation: "Committee Member", category: "Managing Committee", unitRef: "11/15", status: "active" },
  { id: "mc-10", name: "Mr. Neelesh Naik", designation: "Committee Member", category: "Managing Committee", unitRef: "12/14", status: "active" },
  { id: "rdc-01", name: "Mr. S. M. Suryavanshi", designation: "Chief Coordinator / Single Point Contact", category: "Redevelopment Committee", unitRef: "", status: "active" },
  { id: "rdc-02", name: "Mr. Vaibhav Ahinave", designation: "RDC Member - Building 9", category: "Redevelopment Committee", unitRef: "09/04", status: "active" },
  { id: "rdc-03", name: "Mr. Satish Naik", designation: "RDC Member - Building 10", category: "Redevelopment Committee", unitRef: "10/15", status: "active" },
  { id: "rdc-04", name: "Mr. Dattatray Deokar", designation: "RDC Member - Building 11", category: "Redevelopment Committee", unitRef: "11/10", status: "active" },
  { id: "rdc-05", name: "Mr. Umesh Deshpande", designation: "RDC Member - Building 12", category: "Redevelopment Committee", unitRef: "12/07", status: "active" }
];

// Official documents - preview only, sourced from Society records.
// Listed publicly in this order (no categories or search on the page).
const DEFAULT_DOCUMENTS = [
  {
    id: "doc-05",
    title: "Managing & Redevelopment Committee - Members List",
    category: "Committee",
    refNo: "MC & RDC Records",
    date: "",
    displayDate: "Current Term",
    description: "Official record listing all Managing Committee (MC) and Redevelopment / Core Redevelopment Committee (RDC) members representing the society and each building in the redevelopment process.",
    fileUrl: "assets/docs/MC_RDC_Members_List.pdf",
    status: "active"
  },
  {
    id: "doc-01",
    title: "Society Registration Certificate",
    category: "Certificate",
    refNo: "N.B.O.M/CIDCO/HSG/(T.C)/10537/D.R/2024-2025",
    date: "2024-11-22",
    displayDate: "22 Nov 2024",
    description: "Official registration certificate issued by the Deputy Registrar, Cooperative Societies (CIDCO), Navi Mumbai, confirming Mayank Co-operative Housing Society Ltd. is duly registered under Section 154(B)(2) of the Maharashtra Co-operative Societies Act, 1960.",
    fileUrl: "assets/docs/MCHS_Registration_Certificate.pdf",
    status: "active"
  },
  {
    id: "doc-03",
    title: "Development Plan - Node Airoli (2018-2038)",
    category: "Plan",
    refNo: "NMMC Development Plan",
    date: "2025-07-23",
    displayDate: "Sanctioned 23 Jul 2025",
    description: "Navi Mumbai Municipal Corporation's proposed land-use Development Plan map for Node-Airoli, marking Plot No. 5, Sector No. 5, Airoli, Navi Mumbai as the land under reference for this society.",
    fileUrl: "assets/docs/MAYANK_PLAN.pdf",
    status: "active"
  },
  {
    id: "doc-02",
    title: "NMMC Zone Certificate (Zone Dakhala)",
    category: "Notice",
    refNo: "NMMC / Town Planning",
    date: "2026-08-14",
    displayDate: "14 Aug 2026",
    description: "Zone Certificate (Zone Dakhala) issued by Navi Mumbai Municipal Corporation confirming the residential zone classification for Plot No. 5, Building No. 9 to 12, Sector 5, Airoli, Navi Mumbai, under the sanctioned Development Plan.",
    fileUrl: "assets/docs/Mayank_CHS_Plot_No_5_Notice.pdf",
    status: "active"
  },
  {
    id: "doc-09",
    title: "PMC Agreement",
    category: "Agreement",
    refNo: "PMC / Vastospati Design Group",
    date: "2026-07-02",
    displayDate: "2 Jul 2026",
    description: "Project Management Consultancy Agreement dated 2 July 2026 between Mayank Co-operative Housing Society Ltd. and M/s. Vastospati Design Group for the proposed redevelopment at Plot No. 5, Sector 5, Airoli, Navi Mumbai.",
    fileUrl: "assets/docs/PMC_Agreement_06Sep2026.pdf",
    status: "active"
  },
  {
    id: "doc-10",
    title: "Advocate Appointment Letter & Scope Of Work",
    category: "Appointment",
    refNo: "Prime Legal",
    date: "2026-06-23",
    displayDate: "23 Jun 2026",
    description: "Letter dated 23 June 2026 appointing Prime Legal, Advocates & Legal Consultants, CBD Belapur, as Legal Counsel for the society's redevelopment following the SGBM of 21 June 2026, together with the scope of work.",
    fileUrl: "assets/docs/Legal_Counsel_Appointment_06Sep2026.pdf",
    status: "active"
  },
  {
    id: "doc-07",
    title: "Redevelopment Feasibility Report",
    category: "Plan",
    refNo: "PMC Report",
    date: "2026-08-01",
    displayDate: "1 Aug 2026",
    description: "Feasibility Report for the proposed redevelopment, submitted by the Society's Project Management Consultant on 1 August 2026 and placed before members at SGBM 3.",
    fileUrl: "assets/docs/Redevelopment_Feasibility_Report.pdf",
    status: "active"
  },
  {
    id: "doc-04",
    title: "SGBM 1 Minutes - 1st February 2026",
    category: "Minutes",
    refNo: "SGBM / 2026-01",
    date: "2026-02-01",
    displayDate: "1 Feb 2026",
    description: "Minutes of the Special General Body Meeting: Resolution to proceed with redevelopment passed unanimously, Core Redevelopment Committee (CRDC) formed, and Mr. S. M. Suryavanshi appointed as Single Point Contact for the redevelopment process.",
    fileUrl: "assets/docs/SGBM_Minutes_01Feb2026.pdf",
    status: "active"
  },
  {
    id: "doc-06",
    title: "SGBM 2 Minutes - 21st June 2026",
    category: "Minutes",
    refNo: "SGBM / 2026-02",
    date: "2026-06-21",
    displayDate: "21 Jun 2026",
    description: "Minutes of the Special General Body Meeting held on 21 June 2026: appointment of M/s. Vastospati Design Group as PMC, M/s. Prime Legal as Legal Firm and Mr. V. Chandrasekhar as Advisor, approval of draft appointment letters and provision for pre-operative expenses.",
    fileUrl: "assets/docs/SGBM2_Minutes_21Jun2026.pdf",
    status: "active"
  },
  {
    id: "doc-08",
    title: "SGBM 3 Minutes - 30th August 2026",
    category: "Minutes",
    refNo: "SGBM / 2026-03",
    date: "2026-08-30",
    displayDate: "30 Aug 2026",
    description: "Minutes of the Special General Body Meeting held on 30 August 2026, issued 12 September 2026: corrections to SGBM 2 Resolutions 1, 2, 4 and 8, Resolution No. 1 approving the Redevelopment Feasibility Report, and circulation of the draft Tender Document to members.",
    fileUrl: "assets/docs/SGBM3_Minutes_30Aug2026.pdf",
    status: "active"
  },
  {
    id: "doc-11",
    title: "SGBM 4 (Upcoming) - 20th September 2026",
    category: "Minutes",
    refNo: "SGBM / 2026-04",
    date: "2026-09-20",
    displayDate: "20 Sep 2026",
    description: "Special General Body Meeting scheduled for 20 September 2026. Minutes will be published here after the meeting.",
    fileUrl: "",
    status: "active"
  },
  {
    id: "doc-13",
    title: "AAI - NOC for Height Clearance",
    category: "NOC",
    refNo: "SNCR/WEST/B/072126/2876864",
    date: "2026-07-21",
    displayDate: "21 Jul 2026",
    description: "Airports Authority of India (AAI) No Objection Certificate for height clearance for the proposed redevelopment at Plot No. 5, Sector 5, Airoli, Navi Mumbai.",
    fileUrl: "assets/docs/SNCR_WEST_B_072126_2876864.pdf",
    status: "active"
  }
];

// Every editable label and every show/hide toggle for both public pages.
// Structure: DEFAULT_PAGE_CONTENT.home.<section>.<field> / .documents.<section>.<field>
// `visible` (or `xVisible`) booleans control whether a block renders at all.
const DEFAULT_PAGE_CONTENT = {
  home: {
    nav: {
      home: "Home",
      about: "About the Project",
      committee: "Committee Members",
      documents: "Documents",
      documentsBadge: "PDFs"
    },
    topBar: {
      visible: true,
      plotLine: "Plot No. 5, Sector 5, Airoli, Navi Mumbai",
      docsLinkLabel: "Redevelopment Documents"
    },
    hero: {
      visible: true,
      badge: "Plot No. 5, Sector 5 · Mulund-Airoli Highway",
      titleLine1: "Redefining the Skyline of",
      titleLine2: "Airoli",
      tagline: "A Fast Track Redevelopment Project on the Anvil.",
      btnPrimary: "View Project Documents",
      btnSecondary: "Committee Members",
      statusBadge: "Current Status",
      imageVisible: true,
      imageCaption: "Reference View · Proposed Redevelopment",
      snapshotVisible: true,
      snapshotTitle: "Project Snapshot",
      snapshotLabel1: "Total Members:",
      snapshotLabel2: "Total Plot Area:",
      snapshotLabel3: "Existing Buildings:",
      snapshotLabel4: "Location:",
      snapshotLabel5: "Registered:"
    },
    statsBar: {
      visible: true,
      stat1Number: "64",
      stat1Label: "Member Families",
      stat2Number: "3,588",
      stat2Label: "Plot Area (Sq. Mtrs.)",
      stat3Number: "4",
      stat3Label: "Existing Buildings",
      stat4Number: "2024",
      stat4Label: "Society Registered"
    },
    about: {
      visible: true,
      tag: "A New Chapter for Our Society",
      title: "Shaping the Future",
      highlight1Title: "Quality Residences",
      highlight1Desc: "Well-planned homes designed for comfort, convenience and lasting value for all 64 member families.",
      highlight2Title: "Commercial Spaces",
      highlight2Desc: "Well-planned commercial-cum-residential development along a prominent highway-facing plot.",
      highlight3Title: "Modest, Curated Amenities",
      highlight3Desc: "Including a landscaped Herbal Garden designed as a wellness and relaxation space for residents.",
      highlight4Title: "Transparent Records",
      highlight4Desc: "Project documents, milestones, presentations and decisions published here as they happen."
    },
    herbal: {
      visible: true,
      imageVisible: true,
      tag: "Modest Living Experience",
      title: "A Landscaped Herbal Garden",
      desc: "Designed as a wellness and relaxation space for every member family — one of the modest, carefully selected amenities envisioned for the redeveloped society.",
      feature1Title: "A Landmark Location",
      feature1Desc: "Fronting the Mulund–Airoli Highway, Node AL-6, Sector 5, Airoli.",
      feature2Title: "A Shared Vision",
      feature2Desc: "Keeping the collective interests of all 64 members at the heart of every decision.",
      feature3Title: "A New Chapter",
      feature3Desc: "Moving forward together through trust, transparency and shared progress.",
      ctaLabel: "View All Documents"
    },
    roadmap: {
      visible: true,
      tag: "Redevelopment Journey",
      title: "Project Milestones So Far",
      desc: "A transparent record of how the redevelopment process is progressing for Mayank CHS.",
      // stepNPoints: one point per line (edited as a textarea in the Admin Panel).
      step1Status: "Completed",
      step1Title: "SGBM 1",
      step1Date: "1 Feb 2026",
      step1Points: "Unanimous resolution & written consent for redevelopment\nRedevelopment Committee Formed\nAppointed Single Point of Contact\nRedevelopment through Standalone and/or Amalgamation",
      step2Status: "Completed",
      step2Title: "SGBM 2",
      step2Date: "21 Jun 2026",
      step2Points: "Appointment of Project Management Consultant (PMC)\nAppointment of Legal Counsel\nProject Advisor Onboard\nApproval of Draft Appointment Letter\nApproval for Pre-Operative Expenses\nMethodology of Tendering Approved",
      step3Status: "Completed",
      step3Title: "SGBM 3",
      step3Date: "30 Aug 2026",
      step3Points: "Feasibility Report passed unanimously",
      step4Status: "Upcoming",
      step4Title: "SGBM 4",
      step4Date: "20 Sep 2026",
      step4Points: "Approval of Draft Tender Document",
      step5Status: "Upcoming",
      // step5Title: "SGBM 5",
      // step5Date: "Date to be announced",
      // step5Points: ""
    },
    committee: {
      visible: true,
      tag: "Leadership & Governance",
      title: "Managing & Redevelopment Committee",
      desc: "Elected and appointed members of Mayank CHS working together to safeguard member interests throughout the redevelopment process.",
      mcVisible: true,
      mcTitle: "Managing Committee (MC)",
      rdcVisible: true,
      rdcTitle: "Redevelopment Committee (RDC)",
      rdcDesc: "Core Redevelopment Committee members, with one representative nominated from each building."
    },
    office: {
      visible: true,
      tag: "Registered Office",
      title: "Society Registration & Address",
      ctaLabel: "Preview Registration Certificate",
      labelAddress: "Registered Address",
      labelReg: "Registration No.",
      labelClassification: "Classification",
      labelPlotRef: "Plot Reference",
      mapVisible: true,
      mapTitle: "Find Us on the Map",
      mapDirectionsLabel: "Get Directions",
      contactVisible: true,
      contactLabel: "Single Point Contact"
    },
    footer: {
      visible: true,
      blurb: "A transparent information platform for members — sharing project documents, presentations, milestones and decisions throughout our building redevelopment journey.",
      complianceLine: "Registered under the Maharashtra Co-operative Societies Act, 1960.",
      navHeading: "Navigation",
      officeHeading: "Registered Office",
      bottomTagline: "Official Redevelopment Information Portal"
    }
  },
  documents: {
    pageHeader: {
      visible: true,
      title: "Redevelopment Documents"
    }
  }
};

const Store = {
  // --- Society Profile ---
  getSocietyDetails() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOCIETY);
      return data ? JSON.parse(data) : DEFAULT_SOCIETY_DETAILS;
    } catch (e) {
      console.error("Failed to load society details from storage", e);
      return DEFAULT_SOCIETY_DETAILS;
    }
  },

  getMapEmbedUrl() {
    const s = this.getSocietyDetails();
    if (!s.mapLat || !s.mapLng) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(s.mapLat)},${encodeURIComponent(s.mapLng)}&z=16&output=embed`;
  },

  getMapDirectionsUrl() {
    const s = this.getSocietyDetails();
    if (!s.mapLat || !s.mapLng) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapLat)},${encodeURIComponent(s.mapLng)}`;
  },

  saveSocietyDetails(details) {
    try {
      const current = this.getSocietyDetails();
      const updated = { ...current, ...details };
      localStorage.setItem(STORAGE_KEYS.SOCIETY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Failed to save society details", e);
      return null;
    }
  },

  // --- Page Content (every label + section visibility toggle) ---
  getPageContent() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAGE_CONTENT);
      return data ? JSON.parse(data) : DEFAULT_PAGE_CONTENT;
    } catch (e) {
      console.error("Failed to load page content", e);
      return DEFAULT_PAGE_CONTENT;
    }
  },

  // Deep-merges `updates` (a partial, possibly nested object) into the
  // stored page content, so callers can save one field without clobbering others.
  savePageContent(updates) {
    const deepMerge = (base, patch) => {
      const out = { ...base };
      Object.keys(patch).forEach(key => {
        if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
          out[key] = deepMerge(base[key] || {}, patch[key]);
        } else {
          out[key] = patch[key];
        }
      });
      return out;
    };
    const current = this.getPageContent();
    const updated = deepMerge(current, updates);
    localStorage.setItem(STORAGE_KEYS.PAGE_CONTENT, JSON.stringify(updated));
    return updated;
  },

  getByPath,
  setByPath,

  // --- Committee Members ---
  getAllMembers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_COMMITTEE_MEMBERS));
        return DEFAULT_COMMITTEE_MEMBERS;
      }
      const members = JSON.parse(data);
      let updated = false;
      DEFAULT_COMMITTEE_MEMBERS.forEach(defaultMember => {
        if (!members.some(m => m.id === defaultMember.id)) {
          members.push(defaultMember);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      }
      return members;
    } catch (e) {
      console.error("Failed to load members", e);
      return DEFAULT_COMMITTEE_MEMBERS;
    }
  },

  getPublicMembers() {
    // ONLY items with status === 'active' are displayed on public pages
    const members = this.getAllMembers();
    return members.filter(m => m.status === 'active');
  },

  getMemberById(id) {
    const members = this.getAllMembers();
    return members.find(m => m.id === id);
  },

  saveMember(member) {
    const members = this.getAllMembers();
    let updated;
    if (member.id) {
      updated = members.map(m => m.id === member.id ? { ...m, ...member } : m);
    } else {
      const newMember = {
        ...member,
        id: 'mem-' + Date.now(),
        status: member.status || 'active'
      };
      updated = [newMember, ...members];
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
    return updated;
  },

  deleteMember(id) {
    const members = this.getAllMembers();
    const updated = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
    return updated;
  },

  toggleMemberStatus(id) {
    const members = this.getAllMembers();
    const updated = members.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'active' ? 'inactive' : 'active' };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
    return updated;
  },

  // --- Documents / Notices / Circulars ---
  getAllDocuments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DOCUMENTS));
        return DEFAULT_DOCUMENTS;
      }
      const docs = JSON.parse(data);
      let updated = false;
      DEFAULT_DOCUMENTS.forEach(defaultDoc => {
        if (!docs.some(d => d.id === defaultDoc.id)) {
          docs.push(defaultDoc);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      }
      return docs;
    } catch (e) {
      console.error("Failed to load documents", e);
      return DEFAULT_DOCUMENTS;
    }
  },

  getPublicDocuments() {
    // ONLY items with status === 'active' are displayed on public pages
    const docs = this.getAllDocuments();
    return docs.filter(d => d.status === 'active');
  },

  getDocumentById(id) {
    const docs = this.getAllDocuments();
    return docs.find(d => d.id === id);
  },

  saveDocument(doc) {
    const docs = this.getAllDocuments();
    let updated;
    if (doc.id) {
      updated = docs.map(d => d.id === doc.id ? { ...d, ...doc } : d);
    } else {
      const newDoc = {
        ...doc,
        id: 'doc-' + Date.now(),
        displayDate: doc.displayDate || this.formatDate(doc.date || new Date().toISOString().split('T')[0]),
        status: doc.status || 'active'
      };
      updated = [newDoc, ...docs];
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
    return updated;
  },

  deleteDocument(id) {
    const docs = this.getAllDocuments();
    const updated = docs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
    return updated;
  },

  toggleDocumentStatus(id) {
    const docs = this.getAllDocuments();
    const updated = docs.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'active' ? 'inactive' : 'active' };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
    return updated;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  },

  // --- Reset to Factory Defaults ---
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.SOCIETY, JSON.stringify(DEFAULT_SOCIETY_DETAILS));
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_COMMITTEE_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.PAGE_CONTENT, JSON.stringify(DEFAULT_PAGE_CONTENT));
    return {
      society: DEFAULT_SOCIETY_DETAILS,
      members: DEFAULT_COMMITTEE_MEMBERS,
      documents: DEFAULT_DOCUMENTS,
      pageContent: DEFAULT_PAGE_CONTENT
    };
  },

  // --- Admin Session ---
  isAdminLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  },

  setAdminLogin(status) {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  }
};

// Initialize defaults on first visit, and re-sync if the shipped content
// (this file) has been updated since the visitor's last cached version.
if (!localStorage.getItem(STORAGE_KEYS.SOCIETY) || localStorage.getItem(STORAGE_KEYS.DATA_VERSION) !== CURRENT_DATA_VERSION) {
  Store.resetToDefaults();
  localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
}

window.MayankStore = Store;
