// Data Management
class ExpenseManager {
    constructor() {
        this.expenses = this.loadFromStorage('expenses') || [];
        this.categories = this.loadFromStorage('categories') || [];
        this.budgets = this.loadFromStorage('budgets') || [];
        this.currentFilter = { startDate: null, endDate: null, category: null };
        this.chart = null;
        
        this.initializeDefaultCategories();
        this.init();
    }

    // Initialize default categories if none exist
    initializeDefaultCategories() {
        if (this.categories.length === 0) {
            const defaultCategories = [
                { id: '1', name: 'Food', color: '#ef4444' },
                { id: '2', name: 'Fuel', color: '#f59e0b' },
                { id: '3', name: 'Dress', color: '#8b5cf6' },
                { id: '4', name: 'Groceries', color: '#10b981' },
                { id: '5', name: 'Transport', color: '#3b82f6' },
                { id: '6', name: 'Entertainment', color: '#ec4899' },
                { id: '7', name: 'Bills', color: '#6366f1' },
                { id: '8', name: 'Healthcare', color: '#14b8a6' },
                { id: '9', name: 'Shopping', color: '#f97316' },
                { id: '10', name: 'Others', color: '#94a3b8' }
            ];
            this.categories = defaultCategories;
            this.saveToStorage('categories', this.categories);
        }
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupDateDefaults();
        this.loadCategories();
        this.loadExpenses();
        this.loadBudgets();
        this.updateDashboard();
        this.renderCharts();
    }

    // LocalStorage Management
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
            alert('Error saving data. Please check your browser storage settings.');
        }
    }

    // Navigation
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.content-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSection = btn.dataset.section;
                
                navButtons.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(targetSection).classList.add('active');
                
                if (targetSection === 'dashboard') {
                    this.updateDashboard();
                    this.renderCharts();
                }
            });
        });
    }

    // Date Defaults
    setupDateDefaults() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('expense-date').valueAsDate = today;
        document.getElementById('filter-start').valueAsDate = firstDayOfMonth;
        document.getElementById('filter-end').valueAsDate = today;
    }

    // Event Listeners
    setupEventListeners() {
        // Expense form
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.resetExpenseForm();
        });

        // Category form
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        document.getElementById('category-cancel-btn').addEventListener('click', () => {
            this.resetCategoryForm();
        });

        // Budget form
        document.getElementById('budget-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBudgetSubmit();
        });

        document.getElementById('budget-type').addEventListener('change', (e) => {
            const categoryGroup = document.getElementById('budget-category-group');
            categoryGroup.style.display = e.target.value === 'category' ? 'block' : 'none';
        });

        // Filters
        document.getElementById('apply-filter').addEventListener('click', () => {
            this.applyDateFilter();
        });

        document.getElementById('clear-filter').addEventListener('click', () => {
            this.clearDateFilter();
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.currentFilter.category = e.target.value || null;
            this.loadExpenses();
        });

        document.getElementById('search-expense').addEventListener('input', (e) => {
            this.filterExpensesBySearch(e.target.value);
        });
    }

    // Category Management
    loadCategories() {
        // Populate category selects
        const expenseCategorySelect = document.getElementById('expense-category');
        const categoryFilterSelect = document.getElementById('category-filter');
        const budgetCategorySelect = document.getElementById('budget-category');

        const updateSelects = () => {
            const options = this.categories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');

            expenseCategorySelect.innerHTML = '<option value="">Select a category</option>' + options;
            categoryFilterSelect.innerHTML = '<option value="">All Categories</option>' + options;
            budgetCategorySelect.innerHTML = '<option value="">Select a category</option>' + options;
        };

        updateSelects();
        this.renderCategories();
    }

    handleCategorySubmit() {
        const id = document.getElementById('category-id').value;
        const name = document.getElementById('category-name').value.trim();
        const color = document.getElementById('category-color').value;

        if (!name) {
            alert('Please enter a category name');
            return;
        }

        if (id) {
            // Edit existing
            const index = this.categories.findIndex(c => c.id === id);
            if (index !== -1) {
                this.categories[index] = { id, name, color };
            }
        } else {
            // Add new
            const newCategory = {
                id: Date.now().toString(),
                name,
                color
            };
            this.categories.push(newCategory);
        }

        this.saveToStorage('categories', this.categories);
        this.loadCategories();
        this.resetCategoryForm();
        this.loadExpenses();
        this.updateDashboard();
    }

    renderCategories() {
        const container = document.getElementById('categories-list');
        
        if (this.categories.length === 0) {
            container.innerHTML = '<p class="empty-state">No categories yet. Add your first category above!</p>';
            return;
        }

        container.innerHTML = this.categories.map(cat => `
            <div class="category-card" style="border-left-color: ${cat.color}">
                <div class="category-card-header">
                    <div class="category-card-color" style="background-color: ${cat.color}"></div>
                    <div class="category-card-name">${this.escapeHtml(cat.name)}</div>
                    <div class="category-card-actions">
                        <button class="btn btn-sm btn-primary" onclick="expenseManager.editCategory('${cat.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="expenseManager.deleteCategory('${cat.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;

        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-color').value = category.color;
        document.getElementById('category-form-title').textContent = 'Edit Category';
        document.getElementById('category-submit-btn').textContent = 'Update Category';
        document.getElementById('category-cancel-btn').style.display = 'block';
    }

    deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category? Expenses in this category will be uncategorized.')) {
            return;
        }

        this.categories = this.categories.filter(c => c.id !== id);
        this.saveToStorage('categories', this.categories);
        
        // Update expenses that used this category
        this.expenses = this.expenses.map(exp => {
            if (exp.category === id) {
                exp.category = '';
            }
            return exp;
        });
        this.saveToStorage('expenses', this.expenses);

        this.loadCategories();
        this.loadExpenses();
        this.updateDashboard();
    }

    resetCategoryForm() {
        document.getElementById('category-form').reset();
        document.getElementById('category-id').value = '';
        document.getElementById('category-color').value = '#3498db';
        document.getElementById('category-form-title').textContent = 'Add New Category';
        document.getElementById('category-submit-btn').textContent = 'Add Category';
        document.getElementById('category-cancel-btn').style.display = 'none';
    }

    // Expense Management
    handleExpenseSubmit() {
        const id = document.getElementById('expense-id').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value.trim();
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!description) {
            alert('Please enter a description');
            return;
        }

        if (!category) {
            alert('Please select a category');
            return;
        }

        if (id) {
            // Edit existing
            const index = this.expenses.findIndex(e => e.id === id);
            if (index !== -1) {
                this.expenses[index] = {
                    ...this.expenses[index],
                    amount,
                    description,
                    category,
                    date
                };
            }
        } else {
            // Add new
            const newExpense = {
                id: Date.now().toString(),
                amount,
                description,
                category,
                date,
                timestamp: Date.now()
            };
            this.expenses.push(newExpense);
        }

        this.saveToStorage('expenses', this.expenses);
        this.loadExpenses();
        this.resetExpenseForm();
        this.updateDashboard();
        this.renderCharts();
    }

    loadExpenses() {
        let filteredExpenses = [...this.expenses];

        // Apply date filter
        if (this.currentFilter.startDate || this.currentFilter.endDate) {
            filteredExpenses = filteredExpenses.filter(exp => {
                const expDate = new Date(exp.date);
                if (this.currentFilter.startDate && expDate < this.currentFilter.startDate) return false;
                if (this.currentFilter.endDate && expDate > this.currentFilter.endDate) return false;
                return true;
            });
        }

        // Apply category filter
        if (this.currentFilter.category) {
            filteredExpenses = filteredExpenses.filter(exp => exp.category === this.currentFilter.category);
        }

        this.renderExpenses(filteredExpenses);
    }

    renderExpenses(expenses) {
        const container = document.getElementById('expenses-list');
        
        if (expenses.length === 0) {
            container.innerHTML = '<p class="empty-state">No expenses found. Add your first expense above!</p>';
            return;
        }

        container.innerHTML = expenses.map(exp => {
            const category = this.categories.find(c => c.id === exp.category);
            const categoryName = category ? category.name : 'Uncategorized';
            const categoryColor = category ? category.color : '#94a3b8';
            const date = new Date(exp.date).toLocaleDateString();

            return `
                <div class="expense-item" style="border-left-color: ${categoryColor}">
                    <div class="expense-item-info">
                        <div class="expense-item-description">${this.escapeHtml(exp.description)}</div>
                        <div class="expense-item-meta">
                            <span>${categoryName}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="expense-item-amount">₹${exp.amount.toFixed(2)}</div>
                    <div class="expense-item-actions">
                        <button class="btn btn-sm btn-primary" onclick="expenseManager.editExpense('${exp.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="expenseManager.deleteExpense('${exp.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    editExpense(id) {
        const expense = this.expenses.find(e => e.id === id);
        if (!expense) return;

        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('form-title').textContent = 'Edit Expense';
        document.getElementById('submit-btn').textContent = 'Update Expense';
        document.getElementById('cancel-btn').style.display = 'block';

        document.getElementById('expenses').scrollIntoView({ behavior: 'smooth' });
    }

    deleteExpense(id) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        this.expenses = this.expenses.filter(e => e.id !== id);
        this.saveToStorage('expenses', this.expenses);
        this.loadExpenses();
        this.updateDashboard();
        this.renderCharts();
    }

    resetExpenseForm() {
        document.getElementById('expense-form').reset();
        document.getElementById('expense-id').value = '';
        document.getElementById('expense-date').valueAsDate = new Date();
        document.getElementById('form-title').textContent = 'Add New Expense';
        document.getElementById('submit-btn').textContent = 'Add Expense';
        document.getElementById('cancel-btn').style.display = 'none';
    }

    filterExpensesBySearch(query) {
        const container = document.getElementById('expenses-list');
        const expenseItems = container.querySelectorAll('.expense-item');
        
        if (!query.trim()) {
            this.loadExpenses();
            return;
        }

        const searchTerm = query.toLowerCase();
        expenseItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    }

    // Budget Management
    handleBudgetSubmit() {
        const type = document.getElementById('budget-type').value;
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        const period = document.getElementById('budget-period').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        if (type === 'category' && !category) {
            alert('Please select a category');
            return;
        }

        const budgetId = type === 'overall' ? 'overall' : `category-${category}`;
        
        const existingIndex = this.budgets.findIndex(b => b.id === budgetId);
        const budget = {
            id: budgetId,
            type,
            category: type === 'category' ? category : null,
            amount,
            period
        };

        if (existingIndex !== -1) {
            this.budgets[existingIndex] = budget;
        } else {
            this.budgets.push(budget);
        }

        this.saveToStorage('budgets', this.budgets);
        this.loadBudgets();
        this.updateDashboard();
        document.getElementById('budget-form').reset();
        document.getElementById('budget-category-group').style.display = 'none';
    }

    loadBudgets() {
        this.renderBudgets();
    }

    renderBudgets() {
        const container = document.getElementById('budgets-list');
        
        if (this.budgets.length === 0) {
            container.innerHTML = '<p class="empty-state">No budgets set yet. Set your first budget above!</p>';
            return;
        }

        container.innerHTML = this.budgets.map(budget => {
            const spent = this.calculateBudgetSpent(budget);
            const percentage = (spent / budget.amount) * 100;
            const remaining = budget.amount - spent;
            const statusClass = percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : '';
            
            let title = budget.type === 'overall' ? 'Overall Budget' : 
                       this.categories.find(c => c.id === budget.category)?.name || 'Category Budget';

            return `
                <div class="budget-item">
                    <div class="budget-item-header">
                        <div class="budget-item-title">${this.escapeHtml(title)}</div>
                        <div class="budget-item-amount">₹${budget.amount.toFixed(2)}</div>
                    </div>
                    <div class="budget-item-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                    </div>
                    <div class="budget-item-details">
                        <span>Spent: ₹${spent.toFixed(2)}</span>
                        <span>Remaining: ₹${remaining.toFixed(2)}</span>
                        <span>${budget.period}</span>
                    </div>
                    <div class="budget-item-actions">
                        <button class="btn btn-sm btn-danger" onclick="expenseManager.deleteBudget('${budget.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateBudgetSpent(budget) {
        let filteredExpenses = [...this.expenses];

        // Filter by period
        const now = new Date();
        let startDate;

        if (budget.period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (budget.period === 'weekly') {
            const dayOfWeek = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
        } else if (budget.period === 'yearly') {
            startDate = new Date(now.getFullYear(), 0, 1);
        }

        if (startDate) {
            filteredExpenses = filteredExpenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= startDate && expDate <= now;
            });
        }

        // Filter by category if category budget
        if (budget.type === 'category' && budget.category) {
            filteredExpenses = filteredExpenses.filter(exp => exp.category === budget.category);
        }

        return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }

    deleteBudget(id) {
        if (!confirm('Are you sure you want to delete this budget?')) {
            return;
        }

        this.budgets = this.budgets.filter(b => b.id !== id);
        this.saveToStorage('budgets', this.budgets);
        this.loadBudgets();
        this.updateDashboard();
    }

    // Date Filtering
    applyDateFilter() {
        const startDate = document.getElementById('filter-start').value;
        const endDate = document.getElementById('filter-end').value;

        this.currentFilter.startDate = startDate ? new Date(startDate) : null;
        this.currentFilter.endDate = endDate ? new Date(endDate) : null;

        if (this.currentFilter.endDate) {
            this.currentFilter.endDate.setHours(23, 59, 59, 999);
        }

        this.updateDashboard();
        this.renderCharts();
    }

    clearDateFilter() {
        this.currentFilter.startDate = null;
        this.currentFilter.endDate = null;
        this.setupDateDefaults();
        this.updateDashboard();
        this.renderCharts();
    }

    // Analytics & Calculations
    getFilteredExpenses() {
        let expenses = [...this.expenses];

        if (this.currentFilter.startDate || this.currentFilter.endDate) {
            expenses = expenses.filter(exp => {
                const expDate = new Date(exp.date);
                if (this.currentFilter.startDate && expDate < this.currentFilter.startDate) return false;
                if (this.currentFilter.endDate && expDate > this.currentFilter.endDate) return false;
                return true;
            });
        }

        return expenses;
    }

    calculateTotalExpenses() {
        return this.getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0);
    }

    calculateExpensesByCategory() {
        const expenses = this.getFilteredExpenses();
        const categoryMap = {};

        expenses.forEach(exp => {
            const catId = exp.category || 'uncategorized';
            if (!categoryMap[catId]) {
                categoryMap[catId] = 0;
            }
            categoryMap[catId] += exp.amount;
        });

        return categoryMap;
    }

    calculateMonthlyExpenses() {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return this.expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= firstDayOfMonth && expDate <= now;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    }

    getBudgetStatus() {
        const overallBudget = this.budgets.find(b => b.id === 'overall');
        if (!overallBudget) {
            return { spent: 0, budget: 0, remaining: 0, percentage: 0 };
        }

        const spent = this.calculateBudgetSpent(overallBudget);
        const remaining = overallBudget.amount - spent;
        const percentage = (spent / overallBudget.amount) * 100;

        return { spent, budget: overallBudget.amount, remaining, percentage };
    }

    updateDashboard() {
        const totalExpenses = this.calculateTotalExpenses();
        const monthlyExpenses = this.calculateMonthlyExpenses();
        const budgetStatus = this.getBudgetStatus();

        document.getElementById('total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        document.getElementById('month-expenses').textContent = `₹${monthlyExpenses.toFixed(2)}`;
        document.getElementById('category-count').textContent = this.categories.length;

        if (budgetStatus.budget > 0) {
            const statusText = budgetStatus.remaining >= 0 
                ? `Remaining: ₹${budgetStatus.remaining.toFixed(2)}`
                : `Over budget by ₹${Math.abs(budgetStatus.remaining).toFixed(2)}`;
            document.getElementById('budget-status').textContent = `₹${budgetStatus.spent.toFixed(2)} / ₹${budgetStatus.budget.toFixed(2)}`;
            document.getElementById('budget-status-text').textContent = statusText;
        } else {
            document.getElementById('budget-status').textContent = '₹0.00';
            document.getElementById('budget-status-text').textContent = 'No budget set';
        }

        this.renderCategoryBreakdown();
    }

    renderCategoryBreakdown() {
        const categoryExpenses = this.calculateExpensesByCategory();
        const container = document.getElementById('category-list');
        const total = this.calculateTotalExpenses();

        if (Object.keys(categoryExpenses).length === 0) {
            container.innerHTML = '<p class="empty-state">No expenses in selected period</p>';
            return;
        }

        const sortedCategories = Object.entries(categoryExpenses)
            .sort((a, b) => b[1] - a[1])
            .map(([catId, amount]) => {
                const category = this.categories.find(c => c.id === catId);
                const name = category ? category.name : 'Uncategorized';
                const color = category ? category.color : '#94a3b8';
                const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;

                return { name, amount, color, percentage };
            });

        container.innerHTML = sortedCategories.map(cat => `
            <div class="category-item" style="border-left-color: ${cat.color}">
                <div class="category-item-info">
                    <div class="category-color-dot" style="background-color: ${cat.color}"></div>
                    <div class="category-item-name">${this.escapeHtml(cat.name)}</div>
                </div>
                <div class="category-item-amount">
                    ₹${cat.amount.toFixed(2)} (${cat.percentage}%)
                </div>
            </div>
        `).join('');
    }

    // Chart Rendering
    renderCharts() {
        const ctx = document.getElementById('expense-chart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const expenses = this.getFilteredExpenses();
        this.renderPieChart(ctx, expenses);
    }

    renderPieChart(ctx, expenses) {
        const categoryExpenses = this.calculateExpensesByCategory();
        const categories = Object.keys(categoryExpenses).map(catId => {
            const category = this.categories.find(c => c.id === catId);
            return {
                name: category ? category.name : 'Uncategorized',
                color: category ? category.color : '#94a3b8',
                amount: categoryExpenses[catId]
            };
        });

        const labels = categories.map(c => c.name);
        const data = categories.map(c => c.amount);
        const colors = categories.map(c => c.color);

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ₹' + value.toFixed(2) + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
let expenseManager;
document.addEventListener('DOMContentLoaded', () => {
    expenseManager = new ExpenseManager();
});

