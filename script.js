"use strict";

/* ============================================
   TRACKIFY - Personal Finance Tracker
   Vanilla JavaScript - Modular & Secure
   ============================================ */

// ─── Utility Helpers ────────────────────────────────────────

const Utils = {
  /**
   * Sanitize a string to prevent XSS.
   * Escapes HTML special characters.
   */
  sanitize(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  /**
   * Generate a unique ID.
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  },

  /**
   * Format a number as currency.
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format a date string for display.
   */
  formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  /**
   * Debounce a function call.
   */
  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },
};

// ─── Category Config ────────────────────────────────────────

const CATEGORIES = {
  salary: { label: "Salary", emoji: "\uD83D\uDCB0", type: "income" },
  freelance: { label: "Freelance", emoji: "\uD83D\uDCBB", type: "income" },
  investment: { label: "Investment", emoji: "\uD83D\uDCC8", type: "income" },
  gift: { label: "Gift", emoji: "\uD83C\uDF81", type: "income" },
  "other-income": { label: "Other Income", emoji: "\uD83D\uDCB5", type: "income" },
  food: { label: "Food & Dining", emoji: "\uD83C\uDF54", type: "expense" },
  transport: { label: "Transport", emoji: "\uD83D\uDE97", type: "expense" },
  shopping: { label: "Shopping", emoji: "\uD83D\uDED2", type: "expense" },
  bills: { label: "Bills & Utilities", emoji: "\uD83D\uDCA1", type: "expense" },
  entertainment: { label: "Entertainment", emoji: "\uD83C\uDFAC", type: "expense" },
  health: { label: "Health", emoji: "\uD83C\uDFE5", type: "expense" },
  education: { label: "Education", emoji: "\uD83D\uDCDA", type: "expense" },
  "other-expense": { label: "Other Expense", emoji: "\uD83D\uDCCB", type: "expense" },
};

// ─── Storage Module ─────────────────────────────────────────

const Storage = {
  KEY: "trackify_transactions",
  THEME_KEY: "trackify_theme",

  getTransactions() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTransactions(transactions) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error("Failed to save transactions:", e);
    }
  },

  getTheme() {
    try {
      return localStorage.getItem(this.THEME_KEY) || "light";
    } catch {
      return "light";
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  },
};

// ─── Toast Module ───────────────────────────────────────────

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById("toastContainer");
  },

  show(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const iconSvg = this._getIcon(type);
    const iconSpan = document.createElement("span");
    iconSpan.innerHTML = iconSvg;

    const textSpan = document.createElement("span");
    textSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(textSpan);
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("removing");
      toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
  },

  _getIcon(type) {
    switch (type) {
      case "success":
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      case "error":
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
      case "info":
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      default:
        return "";
    }
  },
};

// ─── Animated Counter ───────────────────────────────────────

const AnimatedCounter = {
  /**
   * Animate a numeric counter from current to target value.
   */
  animate(element, targetValue, duration = 600) {
    const currentText = element.textContent.replace(/[^0-9.\-]/g, "");
    const startValue = parseFloat(currentText) || 0;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * eased;

      element.textContent = Utils.formatCurrency(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = Utils.formatCurrency(targetValue);
      }
    };

    requestAnimationFrame(step);
  },
};

// ─── Charts Module ──────────────────────────────────────────

const Charts = {
  categoryChart: null,
  overviewChart: null,

  init() {
    this._setupCategoryChart();
    this._setupOverviewChart();
  },

  update(transactions) {
    this._updateCategoryChart(transactions);
    this._updateOverviewChart(transactions);
  },

  _getChartColors() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      textColor: isDark ? "#9ca3af" : "#6b7280",
      gridColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    };
  },

  _setupCategoryChart() {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    const colors = this._getChartColors();
    this.categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "#6C63FF", "#48C6EF", "#10b981", "#f59e0b",
              "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
              "#f97316", "#6366f1", "#84cc16", "#e11d48",
              "#0ea5e9",
            ],
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.textColor,
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: "'Inter', sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "rgba(26, 26, 46, 0.9)",
            titleFont: { family: "'Inter', sans-serif", weight: "600" },
            bodyFont: { family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return " " + Utils.formatCurrency(context.parsed);
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 800,
          easing: "easeOutQuart",
        },
      },
    });
  },

  _setupOverviewChart() {
    const ctx = document.getElementById("overviewChart");
    if (!ctx) return;

    const colors = this._getChartColors();
    this.overviewChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Income",
            data: [],
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderColor: "#10b981",
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Expenses",
            data: [],
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "#ef4444",
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.textColor,
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: "'Inter', sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "rgba(26, 26, 46, 0.9)",
            titleFont: { family: "'Inter', sans-serif", weight: "600" },
            bodyFont: { family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return " " + context.dataset.label + ": " + Utils.formatCurrency(context.parsed.y);
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: "'Inter', sans-serif", size: 11 } },
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: (val) => Utils.formatCurrency(val),
            },
          },
        },
        animation: {
          duration: 800,
          easing: "easeOutQuart",
        },
      },
    });
  },

  _updateCategoryChart(transactions) {
    if (!this.categoryChart) return;

    const expenses = transactions.filter((t) => t.type === "expense");
    const doughnutEmpty = document.getElementById("doughnutEmpty");
    const chartWrapper = this.categoryChart.canvas.parentElement;

    if (expenses.length === 0) {
      doughnutEmpty.style.display = "block";
      chartWrapper.style.display = "none";
      return;
    }

    doughnutEmpty.style.display = "none";
    chartWrapper.style.display = "flex";

    const categoryTotals = {};
    expenses.forEach((t) => {
      const cat = CATEGORIES[t.category];
      const label = cat ? cat.label : t.category;
      categoryTotals[label] = (categoryTotals[label] || 0) + t.amount;
    });

    this.categoryChart.data.labels = Object.keys(categoryTotals);
    this.categoryChart.data.datasets[0].data = Object.values(categoryTotals);
    this.categoryChart.update("active");
  },

  _updateOverviewChart(transactions) {
    if (!this.overviewChart) return;

    const barEmpty = document.getElementById("barEmpty");
    const chartWrapper = this.overviewChart.canvas.parentElement;

    if (transactions.length === 0) {
      barEmpty.style.display = "block";
      chartWrapper.style.display = "none";
      return;
    }

    barEmpty.style.display = "none";
    chartWrapper.style.display = "flex";

    // Group by month
    const monthData = {};
    transactions.forEach((t) => {
      const date = new Date(t.date + "T00:00:00");
      const key = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!monthData[key]) monthData[key] = { income: 0, expense: 0 };
      if (t.type === "income") monthData[key].income += t.amount;
      else monthData[key].expense += t.amount;
    });

    // Sort by date and take last 6 months
    const sortedKeys = Object.keys(monthData).slice(-6);

    this.overviewChart.data.labels = sortedKeys;
    this.overviewChart.data.datasets[0].data = sortedKeys.map((k) => monthData[k].income);
    this.overviewChart.data.datasets[1].data = sortedKeys.map((k) => monthData[k].expense);
    this.overviewChart.update("active");
  },

  updateTheme() {
    const colors = this._getChartColors();
    if (this.categoryChart) {
      this.categoryChart.options.plugins.legend.labels.color = colors.textColor;
      this.categoryChart.update("none");
    }
    if (this.overviewChart) {
      this.overviewChart.options.plugins.legend.labels.color = colors.textColor;
      this.overviewChart.options.scales.x.ticks.color = colors.textColor;
      this.overviewChart.options.scales.y.ticks.color = colors.textColor;
      this.overviewChart.options.scales.y.grid.color = colors.gridColor;
      this.overviewChart.update("none");
    }
  },
};

// ─── App Module ─────────────────────────────────────────────

const App = {
  transactions: [],

  // DOM references
  dom: {},

  init() {
    this._cacheDom();
    this._initTheme();
    this._setDefaultDate();
    this._loadTransactions();
    this._bindEvents();
    this._initScrollReveal();
    this._setFooterYear();

    Toast.init();
    Charts.init();

    this._updateUI();

    // Page load animation
    document.body.classList.add("page-loading");
  },

  _cacheDom() {
    this.dom = {
      form: document.getElementById("transactionForm"),
      noteInput: document.getElementById("txnNote"),
      amountInput: document.getElementById("txnAmount"),
      typeSelect: document.getElementById("txnType"),
      categorySelect: document.getElementById("txnCategory"),
      dateInput: document.getElementById("txnDate"),
      addBtn: document.getElementById("addBtn"),
      totalBalance: document.getElementById("totalBalance"),
      totalIncome: document.getElementById("totalIncome"),
      totalExpenses: document.getElementById("totalExpenses"),
      transactionList: document.getElementById("transactionList"),
      emptyState: document.getElementById("emptyState"),
      filterCategory: document.getElementById("filterCategory"),
      filterDate: document.getElementById("filterDate"),
      themeToggle: document.getElementById("themeToggle"),
      noteError: document.getElementById("noteError"),
      amountError: document.getElementById("amountError"),
      typeError: document.getElementById("typeError"),
      categoryError: document.getElementById("categoryError"),
      dateError: document.getElementById("dateError"),
    };
  },

  _initTheme() {
    const saved = Storage.getTheme();
    document.documentElement.setAttribute("data-theme", saved);
  },

  _setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    this.dom.dateInput.value = `${yyyy}-${mm}-${dd}`;
  },

  _loadTransactions() {
    this.transactions = Storage.getTransactions();
  },

  _bindEvents() {
    // Form submission
    this.dom.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._handleAddTransaction();
    });

    // Button ripple effect
    this.dom.addBtn.addEventListener("click", (e) => {
      this._createRipple(e, this.dom.addBtn);
    });

    // Input focus animations
    const inputs = this.dom.form.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });
      input.addEventListener("blur", () => {
        input.parentElement.classList.remove("focused");
      });
      // Clear error on input
      input.addEventListener("input", () => {
        input.classList.remove("input-error");
        const errorSpan = input.parentElement.querySelector(".form-error");
        if (errorSpan) {
          errorSpan.textContent = "";
          errorSpan.classList.remove("visible");
        }
      });
    });

    // Filters
    this.dom.filterCategory.addEventListener("change", () => this._renderTransactions());
    this.dom.filterDate.addEventListener("change", () => this._renderTransactions());

    // Theme toggle
    this.dom.themeToggle.addEventListener("click", () => this._toggleTheme());

    // Delete transaction (event delegation)
    this.dom.transactionList.addEventListener("click", (e) => {
      const btn = e.target.closest(".txn-delete");
      if (btn) {
        const id = btn.dataset.id;
        this._handleDeleteTransaction(id);
      }
    });
  },

  _createRipple(e, button) {
    const ripple = button.querySelector(".btn-ripple");
    if (!ripple) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    ripple.classList.remove("active");
    // Force reflow
    void ripple.offsetWidth;
    ripple.classList.add("active");

    setTimeout(() => ripple.classList.remove("active"), 600);
  },

  _toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    Storage.saveTheme(next);
    Charts.updateTheme();
  },

  _initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  },

  _setFooterYear() {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  },

  // ─── Validation ─────────────────────────────────────────

  _validateForm() {
    let isValid = true;

    // Note / Description
    const note = this.dom.noteInput.value.trim();
    if (!note) {
      this._showFieldError(this.dom.noteInput, this.dom.noteError, "Description is required");
      isValid = false;
    } else if (note.length < 2) {
      this._showFieldError(this.dom.noteInput, this.dom.noteError, "Must be at least 2 characters");
      isValid = false;
    } else if (note.length > 100) {
      this._showFieldError(this.dom.noteInput, this.dom.noteError, "Must be under 100 characters");
      isValid = false;
    }

    // Amount
    const amountStr = this.dom.amountInput.value.trim();
    const amount = parseFloat(amountStr);
    if (!amountStr) {
      this._showFieldError(this.dom.amountInput, this.dom.amountError, "Amount is required");
      isValid = false;
    } else if (isNaN(amount) || amount <= 0) {
      this._showFieldError(this.dom.amountInput, this.dom.amountError, "Enter a positive amount");
      isValid = false;
    } else if (amount > 999999999) {
      this._showFieldError(this.dom.amountInput, this.dom.amountError, "Amount is too large");
      isValid = false;
    }

    // Type
    const type = this.dom.typeSelect.value;
    if (!type) {
      this._showFieldError(this.dom.typeSelect, this.dom.typeError, "Select a type");
      isValid = false;
    } else if (type !== "income" && type !== "expense") {
      this._showFieldError(this.dom.typeSelect, this.dom.typeError, "Invalid type");
      isValid = false;
    }

    // Category
    const category = this.dom.categorySelect.value;
    if (!category) {
      this._showFieldError(this.dom.categorySelect, this.dom.categoryError, "Select a category");
      isValid = false;
    } else if (!CATEGORIES[category]) {
      this._showFieldError(this.dom.categorySelect, this.dom.categoryError, "Invalid category");
      isValid = false;
    }

    // Date
    const date = this.dom.dateInput.value;
    if (!date) {
      this._showFieldError(this.dom.dateInput, this.dom.dateError, "Date is required");
      isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      this._showFieldError(this.dom.dateInput, this.dom.dateError, "Invalid date format");
      isValid = false;
    } else {
      const parsed = new Date(date + "T00:00:00");
      if (isNaN(parsed.getTime())) {
        this._showFieldError(this.dom.dateInput, this.dom.dateError, "Invalid date");
        isValid = false;
      }
    }

    return isValid;
  },

  _showFieldError(input, errorSpan, message) {
    input.classList.add("input-error");
    errorSpan.textContent = message;
    errorSpan.classList.add("visible");
  },

  _clearErrors() {
    const inputs = this.dom.form.querySelectorAll(".form-input");
    inputs.forEach((input) => input.classList.remove("input-error"));
    const errors = this.dom.form.querySelectorAll(".form-error");
    errors.forEach((err) => {
      err.textContent = "";
      err.classList.remove("visible");
    });
  },

  // ─── Transaction CRUD ───────────────────────────────────

  _handleAddTransaction() {
    this._clearErrors();

    if (!this._validateForm()) return;

    const transaction = {
      id: Utils.generateId(),
      note: Utils.sanitize(this.dom.noteInput.value.trim()),
      amount: Math.round(parseFloat(this.dom.amountInput.value) * 100) / 100,
      type: this.dom.typeSelect.value,
      category: this.dom.categorySelect.value,
      date: this.dom.dateInput.value,
      createdAt: Date.now(),
    };

    this.transactions.unshift(transaction);
    Storage.saveTransactions(this.transactions);
    this._updateUI();

    // Reset form
    this.dom.noteInput.value = "";
    this.dom.amountInput.value = "";
    this.dom.typeSelect.value = "";
    this.dom.categorySelect.value = "";
    this._setDefaultDate();

    Toast.show("Transaction added successfully!", "success");
  },

  _handleDeleteTransaction(id) {
    const item = this.dom.transactionList.querySelector(`[data-txn-id="${id}"]`);
    if (item) {
      item.classList.add("removing");
      item.addEventListener("animationend", () => {
        this.transactions = this.transactions.filter((t) => t.id !== id);
        Storage.saveTransactions(this.transactions);
        this._updateUI();
        Toast.show("Transaction removed", "info");
      });
    }
  },

  // ─── UI Updates ─────────────────────────────────────────

  _updateUI() {
    this._updateSummary();
    this._renderTransactions();
    Charts.update(this.transactions);
  },

  _updateSummary() {
    const income = this.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = this.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    AnimatedCounter.animate(this.dom.totalBalance, balance);
    AnimatedCounter.animate(this.dom.totalIncome, income);
    AnimatedCounter.animate(this.dom.totalExpenses, expense);
  },

  _getFilteredTransactions() {
    let filtered = [...this.transactions];

    const categoryFilter = this.dom.filterCategory.value;
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    const dateFilter = this.dom.filterDate.value;
    if (dateFilter) {
      filtered = filtered.filter((t) => t.date === dateFilter);
    }

    // Sort by date descending, then by createdAt descending
    filtered.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.createdAt - a.createdAt;
    });

    return filtered;
  },

  _renderTransactions() {
    const filtered = this._getFilteredTransactions();

    // Clear existing items (but keep emptyState)
    const existingItems = this.dom.transactionList.querySelectorAll(".transaction-item");
    existingItems.forEach((item) => item.remove());

    if (filtered.length === 0) {
      this.dom.emptyState.style.display = "flex";
      return;
    }

    this.dom.emptyState.style.display = "none";

    const fragment = document.createDocumentFragment();

    filtered.forEach((txn, index) => {
      const item = this._createTransactionElement(txn, index);
      fragment.appendChild(item);
    });

    this.dom.transactionList.appendChild(fragment);
  },

  _createTransactionElement(txn, index) {
    const item = document.createElement("div");
    item.className = `transaction-item ${txn.type}`;
    item.dataset.txnId = txn.id;
    item.style.animationDelay = `${index * 0.05}s`;

    // Icon
    const icon = document.createElement("div");
    icon.className = `txn-icon ${txn.type}`;
    const cat = CATEGORIES[txn.category];
    icon.textContent = cat ? cat.emoji : "\uD83D\uDCB3";

    // Details
    const details = document.createElement("div");
    details.className = "txn-details";

    const notePara = document.createElement("p");
    notePara.className = "txn-note";
    notePara.textContent = txn.note;

    const metaDiv = document.createElement("div");
    metaDiv.className = "txn-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = `txn-category-badge ${txn.type}`;
    categoryBadge.textContent = cat ? cat.label : txn.category;

    const dateSpan = document.createElement("span");
    dateSpan.textContent = Utils.formatDate(txn.date);

    metaDiv.appendChild(categoryBadge);
    metaDiv.appendChild(dateSpan);
    details.appendChild(notePara);
    details.appendChild(metaDiv);

    // Amount
    const amountSpan = document.createElement("span");
    amountSpan.className = `txn-amount ${txn.type}`;
    amountSpan.textContent =
      (txn.type === "income" ? "+" : "-") + Utils.formatCurrency(txn.amount);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "txn-delete";
    deleteBtn.dataset.id = txn.id;
    deleteBtn.setAttribute("aria-label", "Delete transaction");
    deleteBtn.title = "Delete";
    deleteBtn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

    item.appendChild(icon);
    item.appendChild(details);
    item.appendChild(amountSpan);
    item.appendChild(deleteBtn);

    return item;
  },
};

// ─── Initialize App ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
