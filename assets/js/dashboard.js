/**
 * Commercial Kitchen Exhaust Cleaning Template
 * Dashboard JavaScript File
 * 
 * Contains dashboard-specific functionality:
 * - Statistics and analytics
 * - NFPA compliance scheduling
 * - Service report management
 * - Reminder system
 * - Data tables
 */

(function() {
    'use strict';

    /**
     * Dashboard Manager
     * Main dashboard controller
     */
    const DashboardManager = {
        init() {
            this.initStats();
            this.initCharts();
            this.initDataTables();
            this.initNFPAScheduler();
            this.initReminderSystem();
            this.initServiceReports();
        },

        /**
         * Initialize statistics counters
         */
        initStats() {
            const counters = document.querySelectorAll('[data-stat]');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-stat'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = this.formatNumber(target);
                        clearInterval(timer);
                    } else {
                        counter.textContent = this.formatNumber(Math.floor(current));
                    }
                }, 16);
            });
        },

        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        /**
         * Initialize charts (using Chart.js or similar)
         */
        initCharts() {
            // Monthly Cleaning Chart
            const monthlyChart = document.getElementById('monthly-cleaning-chart');
            if (monthlyChart && typeof Chart !== 'undefined') {
                new Chart(monthlyChart, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                            label: 'Cleanings Completed',
                            data: [45, 52, 48, 61, 55, 67, 72, 68, 74, 80, 76, 85],
                            borderColor: '#2563EB',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.4
                        }, {
                            label: 'Scheduled',
                            data: [50, 55, 50, 65, 60, 70, 75, 70, 78, 82, 80, 88],
                            borderColor: '#059669',
                            backgroundColor: 'transparent',
                            borderDash: [5, 5],
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Compliance Status Chart
            const complianceChart = document.getElementById('compliance-chart');
            if (complianceChart && typeof Chart !== 'undefined') {
                new Chart(complianceChart, {
                    type: 'doughnut',
                    data: {
                        labels: ['Compliant', 'Due Soon', 'Overdue'],
                        datasets: [{
                            data: [85, 10, 5],
                            backgroundColor: ['#059669', '#F59E0B', '#EF4444']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        },

        /**
         * Initialize data tables
         */
        initDataTables() {
            const tables = document.querySelectorAll('.data-table');
            tables.forEach(table => {
                // Add row click event
                table.querySelectorAll('tbody tr').forEach(row => {
                    row.addEventListener('click', () => {
                        table.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                        row.classList.add('selected');
                    });
                });

                // Add search functionality
                const searchInput = table.parentElement.querySelector('.table-search');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        table.querySelectorAll('tbody tr').forEach(row => {
                            const text = row.textContent.toLowerCase();
                            row.style.display = text.includes(searchTerm) ? '' : 'none';
                        });
                    });
                }

                // Add sort functionality
                table.querySelectorAll('th[data-sort]').forEach(th => {
                    th.addEventListener('click', () => {
                        const sortKey = th.getAttribute('data-sort');
                        const isAsc = !th.classList.contains('sorted-asc');
                        this.sortTable(table, sortKey, isAsc);
                        
                        table.querySelectorAll('th').forEach(h => {
                            h.classList.remove('sorted-asc', 'sorted-desc');
                        });
                        th.classList.add(isAsc ? 'sorted-asc' : 'sorted-desc');
                    });
                });
            });
        },

        sortTable(table, key, ascending = true) {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {
                const aVal = a.querySelector(`[data-${key}]`)?.textContent || '';
                const bVal = b.querySelector(`[data-${key}]`)?.textContent || '';
                
                if (key === 'date') {
                    return ascending ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
                }
                
                if (key === 'amount') {
                    return ascending ? parseFloat(aVal.replace(/[^0-9.-]/g, '')) - parseFloat(bVal.replace(/[^0-9.-]/g, '')) : parseFloat(bVal.replace(/[^0-9.-]/g, '')) - parseFloat(aVal.replace(/[^0-9.-]/g, ''));
                }
                
                return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
            
            rows.forEach(row => tbody.appendChild(row));
        },

        /**
         * NFPA Compliance Scheduling System
         */
        initNFPAScheduler() {
            this.initCalendar();
            this.initComplianceTracking();
        },

        initCalendar() {
            const calendarEl = document.getElementById('nfpa-calendar');
            if (!calendarEl) return;

            // Simple calendar implementation
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            // Calendar header
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.innerHTML = `
                <button class="calendar-prev">&larr;</button>
                <span class="calendar-month">${monthNames[currentMonth]} ${currentYear}</span>
                <button class="calendar-next">&rarr;</button>
            `;
            calendarEl.appendChild(header);

            // Calendar grid
            const grid = document.createElement('div');
            grid.className = 'calendar-grid';
            
            // Day headers
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                grid.appendChild(dayHeader);
            });
            
            // Get first day of month and total days
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            // Empty cells for days before first day
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                grid.appendChild(emptyCell);
            }
            
            // Days of month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';
                dayCell.textContent = day;
                
                // Highlight today
                if (day === today.getDate()) {
                    dayCell.classList.add('today');
                }
                
                // Add scheduled events (demo data)
                if ([5, 12, 18, 25].includes(day)) {
                    dayCell.classList.add('has-event');
                    dayCell.setAttribute('title', 'Scheduled cleaning');
                }
                
                grid.appendChild(dayCell);
            }
            
            calendarEl.appendChild(grid);

            // Navigation
            header.querySelector('.calendar-prev')?.addEventListener('click', () => {
                // Navigate to previous month
                console.log('Previous month');
            });
            
            header.querySelector('.calendar-next')?.addEventListener('click', () => {
                // Navigate to next month
                console.log('Next month');
            });
        },

        initComplianceTracking() {
            const complianceItems = document.querySelectorAll('.compliance-item');
            
            complianceItems.forEach(item => {
                const status = item.getAttribute('data-status');
                const dueDate = item.getAttribute('data-due');
                const alertDays = parseInt(item.getAttribute('data-alert')) || 30;
                
                // Check if compliance is due soon or overdue
                if (status === 'compliant') {
                    const daysUntilDue = this.getDaysUntilDue(dueDate);
                    if (daysUntilDue <= alertDays && daysUntilDue > 0) {
                        item.classList.add('due-soon');
                    } else if (daysUntilDue <= 0) {
                        item.classList.add('overdue');
                    }
                }
                
                // Add renewal button functionality
                const renewBtn = item.querySelector('.btn-renew');
                if (renewBtn) {
                    renewBtn.addEventListener('click', () => {
                        this.renewCompliance(item);
                    });
                }
            });
        },

        getDaysUntilDue(dateString) {
            const dueDate = new Date(dateString);
            const today = new Date();
            const diffTime = dueDate - today;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        },

        renewCompliance(item) {
            // Simulate compliance renewal
            item.querySelector('.compliance-status').textContent = 'Compliant';
            item.querySelector('.compliance-due').textContent = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
            item.classList.remove('due-soon', 'overdue');
            item.classList.add('just-renewed');
            
            setTimeout(() => {
                item.classList.remove('just-renewed');
            }, 3000);
        },

        /**
         * Reminder System
         */
        initReminderSystem() {
            this.loadReminders();
            this.initAddReminder();
            this.initReminderActions();
        },

        loadReminders() {
            const remindersList = document.getElementById('reminders-list');
            if (!remindersList) return;

            // Demo reminders
            const reminders = [
                {
                    id: 1,
                    title: 'Restaurant A - Monthly Cleaning Due',
                    type: 'scheduling',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    priority: 'high'
                },
                {
                    id: 2,
                    title: 'NFPA Compliance Report - Restaurant Chain B',
                    type: 'compliance',
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    priority: 'medium'
                },
                {
                    id: 3,
                    title: 'Equipment Maintenance Check',
                    type: 'maintenance',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    priority: 'low'
                }
            ];

            reminders.forEach(reminder => {
                const reminderEl = this.createReminderElement(reminder);
                remindersList.appendChild(reminderEl);
            });
        },

        createReminderElement(reminder) {
            const el = document.createElement('div');
            el.className = `reminder-item priority-${reminder.priority}`;
            el.setAttribute('data-id', reminder.id);
            
            el.innerHTML = `
                <div class="reminder-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>
                <div class="reminder-content">
                    <h4>${reminder.title}</h4>
                    <p class="reminder-date">Due: ${reminder.dueDate.toLocaleDateString()}</p>
                </div>
                <div class="reminder-actions">
                    <button class="btn btn-sm btn-primary btn-complete" title="Mark Complete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline btn-snooze" title="Snooze">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </button>
                </div>
            `;
            
            return el;
        },

        initAddReminder() {
            const addBtn = document.getElementById('add-reminder-btn');
            const modal = document.getElementById('add-reminder-modal');
            
            if (addBtn && modal) {
                addBtn.addEventListener('click', () => {
                    modal.classList.add('show');
                });

                // Close modal
                modal.querySelector('.modal-close')?.addEventListener('click', () => {
                    modal.classList.remove('show');
                });

                // Form submission
                const form = modal.querySelector('form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.addReminder(form);
                        modal.classList.remove('show');
                        form.reset();
                    });
                }
            }
        },

        addReminder(form) {
            const title = form.querySelector('#reminder-title').value;
            const date = form.querySelector('#reminder-date').value;
            const priority = form.querySelector('#reminder-priority').value;
            
            const reminder = {
                id: Date.now(),
                title,
                type: 'general',
                dueDate: new Date(date),
                priority
            };
            
            const remindersList = document.getElementById('reminders-list');
            const reminderEl = this.createReminderElement(reminder);
            remindersList.prepend(reminderEl);
        },

        initReminderActions() {
            document.addEventListener('click', (e) => {
                // Complete reminder
                if (e.target.closest('.btn-complete')) {
                    const item = e.target.closest('.reminder-item');
                    item.classList.add('completed');
                    setTimeout(() => item.remove(), 500);
                }
                
                // Snooze reminder
                if (e.target.closest('.btn-snooze')) {
                    const item = e.target.closest('.reminder-item');
                    const dueDateEl = item.querySelector('.reminder-date');
                    const currentDate = new Date(dueDateEl.textContent.replace('Due: ', ''));
                    const newDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
                    dueDateEl.textContent = `Due: ${newDate.toLocaleDateString()}`;
                    item.classList.add('snoozed');
                    setTimeout(() => item.classList.remove('snoozed'), 3000);
                }
            });
        },

        /**
         * Service Reports Management
         */
        initServiceReports() {
            this.initReportFilters();
            this.initReportActions();
        },

        initReportFilters() {
            const filterForm = document.getElementById('report-filters');
            if (!filterForm) return;

            filterForm.querySelectorAll('select, input').forEach(input => {
                input.addEventListener('change', () => {
                    this.filterReports();
                });
            });
        },

        filterReports() {
            const status = document.getElementById('filter-status')?.value;
            const dateRange = document.getElementById('filter-date')?.value;
            const client = document.getElementById('filter-client')?.value;
            
            document.querySelectorAll('.report-item').forEach(item => {
                let show = true;
                
                if (status && status !== 'all') {
                    show = show && item.getAttribute('data-status') === status;
                }
                
                if (client && client !== 'all') {
                    show = show && item.getAttribute('data-client') === client;
                }
                
                item.style.display = show ? '' : 'none';
            });
        },

        initReportActions() {
            // View report
            document.querySelectorAll('.btn-view-report').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const reportId = btn.closest('.report-item')?.getAttribute('data-id');
                    this.viewReport(reportId);
                });
            });

            // Download report
            document.querySelectorAll('.btn-download-report').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const reportId = btn.closest('.report-item')?.getAttribute('data-id');
                    this.downloadReport(reportId);
                });
            });
        },

        viewReport(reportId) {
            // Open report modal or navigate to report page
            console.log('Viewing report:', reportId);
            const modal = document.getElementById('report-view-modal');
            if (modal) {
                modal.classList.add('show');
            }
        },

        downloadReport(reportId) {
            // Generate and download PDF report
            console.log('Downloading report:', reportId);
            
            // Create a simple text file as demo
            const content = `Service Report #${reportId}\n\nDate: ${new Date().toLocaleDateString()}\n\nThis is a demo service report.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${reportId}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    /**
     * Export functionality
     */
    const ExportManager = {
        init() {
            this.initExportButtons();
        },

        initExportButtons() {
            document.querySelectorAll('[data-export]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const format = btn.getAttribute('data-export');
                    this.exportData(format);
                });
            });
        },

        exportData(format) {
            // Export dashboard data
            const data = {
                reports: [],
                compliance: [],
                reminders: []
            };
            
            // Collect data from tables
            document.querySelectorAll('.data-table tbody tr').forEach(row => {
                data.reports.push({
                    id: row.getAttribute('data-id'),
                    client: row.querySelector('[data-client]')?.textContent,
                    date: row.querySelector('[data-date]')?.textContent,
                    status: row.querySelector('.status-badge')?.textContent
                });
            });
            
            if (format === 'csv') {
                this.downloadCSV(data);
            } else if (format === 'json') {
                this.downloadJSON(data);
            }
        },

        downloadCSV(data) {
            const headers = ['ID', 'Client', 'Date', 'Status'];
            const rows = data.reports.map(r => [r.id, r.client, r.date, r.status]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-export.csv';
            a.click();
            URL.revokeObjectURL(url);
        },

        downloadJSON(data) {
            const jsonContent = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-export.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Initialize dashboard when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        DashboardManager.init();
        ExportManager.init();
    });

    // Expose global functions
    window.Dashboard = {
        Manager: DashboardManager,
        Export: ExportManager
    };

})();
