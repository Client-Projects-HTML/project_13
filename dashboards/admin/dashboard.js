/**
 * Admin Dashboard - Dynamic Content Loader
 */

class DashboardManager {
    constructor() {
        this.contentArea = document.getElementById('dashboard-content');
        this.sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
        this.currentSection = ''; // Initialize as empty so first load triggers

        // Modal Elements
        this.modal = document.getElementById('dashboard-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.modalActionBtn = document.getElementById('modal-action-btn');
        this.modalCloseBtn = document.getElementById('modal-close-btn');

        if (!this.contentArea) return;
        this.init();
    }

    init() {
        this.loadSection('overview');

        if (this.modal) {
            this.modal.querySelector('.modal-overlay').onclick = () => this.closeModal();
            if (this.modalCloseBtn) this.modalCloseBtn.onclick = () => this.closeModal();
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            const link = e.target.closest('a');
            const toggle = e.target.closest('.menu-toggle');
            const overlay = e.target.closest('#sidebar-overlay');
            const themeBtn = e.target.closest('#theme-toggle');
            const sidebarLink = e.target.closest('.sidebar-link[data-section]');
            const dateEl = e.target.closest('.calendar-date');

            // Handle Calendar Date Click
            if (dateEl) {
                const allDates = dateEl.parentElement.querySelectorAll('.calendar-date');
                allDates.forEach(d => d.classList.remove('selected'));
                dateEl.classList.add('selected');
                return;
            }

            if (sidebarLink) {
                e.preventDefault();
                const section = sidebarLink.getAttribute('data-section');
                this.loadSection(section);
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                sidebarLink.classList.add('active');
                this.closeMobileSidebar();
                return;
            }

            if (toggle || overlay) {
                return;
            }


            if (btn || (link && link.getAttribute('href') === '#')) {
                const target = btn || link;
                if (this.contentArea.contains(target) || (this.modal && this.modal.contains(target))) {
                    if (target.tagName === 'BUTTON' || target.getAttribute('href') === '#') e.preventDefault();
                    if (target.id === 'modal-action-btn') {
                        const selectedDate = this.modal.querySelector('.calendar-date.selected');

                        // Handle Register New Client
                        if (this.modalTitle.textContent.includes('Register New Client')) {
                            const name = document.getElementById('new-client-name').value;
                            const contact = document.getElementById('new-client-contact').value;
                            const plan = document.getElementById('new-client-plan').value;

                            if (!name || !contact) {
                                this.showNotification('Please fill in all fields', 'error');
                                return;
                            }

                            const newClient = {
                                id: Date.now(), // Simple ID generation
                                name: name,
                                contact: contact,
                                phone: '', // Placeholder
                                status: 'active',
                                plan: plan
                            };

                            this.clientsData.push(newClient);
                            localStorage.setItem('admin_clients', JSON.stringify(this.clientsData));
                            this.renderClientsTable();

                            this.showNotification('New client registered successfully.', 'success');
                            this.closeModal();
                            return;
                        }

                        // Handle Edit Client Save
                        if (this.modalTitle.textContent.includes('Edit Client') && this.editingClientId) {
                            const newName = document.getElementById('edit-name').value;
                            const newContact = document.getElementById('edit-contact').value;
                            const newStatus = document.getElementById('edit-status').value;
                            const newPlan = document.getElementById('edit-plan').value;

                            // Update Data Model
                            const clientIndex = this.clientsData.findIndex(c => c.id === this.editingClientId);
                            if (clientIndex !== -1) {
                                this.clientsData[clientIndex] = {
                                    ...this.clientsData[clientIndex],
                                    name: newName,
                                    contact: newContact,
                                    status: newStatus,
                                    plan: newPlan
                                };
                                localStorage.setItem('admin_clients', JSON.stringify(this.clientsData));
                                this.renderClientsTable();
                            }

                            this.showNotification('Client account updated.', 'success');
                            this.closeModal();
                            return;
                        }

                        if (this.modalTitle.textContent.includes('Confirm Deletion') && this.deletingClientId) {
                            this.clientsData = this.clientsData.filter(c => c.id !== this.deletingClientId);
                            localStorage.setItem('admin_clients', JSON.stringify(this.clientsData));
                            this.renderClientsTable();
                            this.showNotification('Client deleted successfully.', 'success');
                            this.closeModal();
                            return;
                        }

                        if (this.modalTitle.textContent.includes('Change Password')) {
                            this.showNotification('Password changed successfully.', 'success');
                            this.closeModal();
                            return;
                        }

                        if (this.modalTitle.textContent.includes('Wizard') && !selectedDate) {
                            this.showNotification('Please select a date first!', 'error');
                            return;
                        }
                        this.closeModal();
                        this.showNotification('Admin operation completed successfully.', 'success');
                        return;
                    }
                    this.handleAction(target.textContent.trim(), target);
                }
            }
        }, true);

        document.addEventListener('submit', (e) => {
            if (this.contentArea.contains(e.target)) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        }, true);
    }

    async loadSection(sectionName) {
        if (this.currentSection === sectionName && this.contentArea.innerHTML.trim() !== '') return;
        try {
            this.contentArea.style.opacity = '0';
            await this.sleep(150);
            let content = '';
            const template = document.getElementById(`template-${sectionName}`);
            if (template) content = template.innerHTML;
            else {
                const response = await fetch(`sections/${sectionName}.html`);
                if (!response.ok) throw new Error(`Section ${sectionName} not found`);
                content = await response.text();
            }
            this.contentArea.innerHTML = content;
            this.updatePageHeader(sectionName);
            this.contentArea.offsetHeight;
            this.contentArea.style.opacity = '1';
            this.currentSection = sectionName;
            if (sectionName === 'overview') this.initOverview();
            if (sectionName === 'clients') this.initClients();
        } catch (error) {
            console.error(error);
            this.contentArea.innerHTML = `<div class="card p-12 text-center"><h3>Admin Error</h3><p>${error.message}</p></div>`;
            this.contentArea.style.opacity = '1';
        }
    }

    initClients() {
        const defaultClients = [
            { id: 1, name: 'The Golden Spoon', contact: 'John Doe', phone: '(555) 123-4567', status: 'active', plan: 'premium' }
        ];
        this.clientsData = JSON.parse(localStorage.getItem('admin_clients')) || defaultClients;
        this.renderClientsTable();
    }

    renderClientsTable() {
        const tbody = this.contentArea.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = this.clientsData.map(client => `
            <tr data-id="${client.id}">
                <td><div class="font-bold">${client.name}</div></td>
                <td>${client.contact}</td>
                <td><span class="badge ${this.getStatusBadgeClass(client.status)}">${this.capitalize(client.status)}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm action-btn">Edit</button>
                    <button class="btn btn-sm btn-danger action-btn ml-1" style="color: #EF4444; border: 1px solid #EF4444; background: transparent;">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    getStatusBadgeClass(status) {
        if (status === 'active') return 'badge-success';
        if (status === 'pending') return 'badge-warning';
        return 'badge-danger';
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    updatePageHeader(sectionName) {
        // Headers removed per user request
    }

    handleAction(actionText, target) {
        target.style.transition = 'transform 0.1s ease';
        target.style.transform = 'scale(0.95)';
        setTimeout(() => target.style.transform = '', 100);

        const lowerText = actionText.toLowerCase();
        const action = target.getAttribute('data-action') || '';

        if (lowerText.includes('add new client')) {
            this.openModal('Register New Client', `
                <div class="space-y-4">
                    <div class="form-group"><label class="form-label">Company Name</label><input id="new-client-name" class="form-control" placeholder="ABC Restaurant Group"></div>
                    <div class="form-group"><label class="form-label">Primary Contact</label><input id="new-client-contact" class="form-control" placeholder="Full Name"></div>
                    <div class="form-group"><label class="form-label">Service Level</label>
                        <select id="new-client-plan" class="form-control">
                            <option value="premium">Monthly Compliance</option>
                            <option value="standard">Quarterly Inspection</option>
                            <option value="basic">On-Demand Only</option>
                        </select>
                    </div>
                </div>
            `, 'Register Account');
            return;
        }

        if (lowerText.includes('edit')) {
            this.editingRow = target.closest('tr');
            const clientId = parseInt(this.editingRow.getAttribute('data-id'));
            const client = this.clientsData.find(c => c.id === clientId) || { name: 'Unknown', contact: '', phone: '', status: 'active', plan: 'basic' };
            this.editingClientId = clientId;

            this.openModal('Edit Client Account', `
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label text-sm">Restaurant Name</label>
                        <input type="text" id="edit-name" class="form-control" value="${client.name}">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label text-sm">Contact Person</label>
                            <input type="text" id="edit-contact" class="form-control" value="${client.contact}">
                        </div>
                        <div class="form-group">
                            <label class="form-label text-sm">Contact Phone</label>
                            <input type="text" class="form-control" value="${client.phone || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label text-sm">Service Plan</label>
                        <select class="form-control" id="edit-plan">
                            <option value="premium" ${client.plan === 'premium' ? 'selected' : ''}>Premium (Monthly)</option>
                            <option value="standard" ${client.plan === 'standard' ? 'selected' : ''}>Standard (Quarterly)</option>
                            <option value="basic" ${client.plan === 'basic' ? 'selected' : ''}>Basic (On-Demand)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label text-sm">Account Status</label>
                        <select id="edit-status" class="form-control">
                            <option value="active" ${client.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="suspended" ${client.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            <option value="pending" ${client.status === 'pending' ? 'selected' : ''}>Pending</option>
                        </select>
                    </div>
                </div>
            `, 'Save Changes');
            return;
        }

        if (lowerText.includes('delete')) {
            const row = target.closest('tr');
            this.deletingClientId = parseInt(row.getAttribute('data-id'));
            const clientName = row.cells[0].textContent.trim();
            this.openModal('Confirm Deletion', `
                <div class="text-center py-4">
                    <p class="mb-2">Are you sure you want to delete the account for:</p>
                    <p class="font-bold text-lg">${clientName}</p>
                    <p class="text-sm text-secondary mt-2">This action cannot be undone.</p>
                </div>
            `, 'Delete Client');
            return;
        }

        if (lowerText.includes('view report') || lowerText.includes('view details')) {
            this.openModal('Service Details', `
                <div class="space-y-4">
                    <h4 class="font-bold">Service Report #SR-2024-001</h4>
                    <p class="text-sm text-secondary">Completed on Dec 01, 2024</p>
                    <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex justify-between mb-2"><span>Status:</span> <span class="badge badge-success">Completed</span></div>
                        <div class="flex justify-between"><span>Technician:</span> <span>Mike Johnson</span></div>
                    </div>
                    <p class="text-xs text-secondary mt-2">All systems operating within NFPA 96 standards.</p>
                </div>
            `, 'Download PDF');
            return;
        }

        if (lowerText.includes('view all')) {
            this.loadSection('reports');
            this.updatePageHeader('reports');
            // Update sidebar active state
            document.querySelectorAll('.sidebar-link').forEach(l => {
                l.classList.toggle('active', l.getAttribute('data-section') === 'reports');
            });
            return;
        }

        if (action === 'filter-reports' || lowerText === 'filter' || (lowerText.includes('filter') && lowerText.includes('report'))) {
            this.openModal('Filter Reports', `
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">Date Range</label>
                        <select class="form-control">
                            <option>Last 7 Days</option>
                            <option selected>Last 30 Days</option>
                            <option>Last 90 Days</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Service Type</label>
                        <select class="form-control">
                            <option>All Services</option>
                            <option>Exhaust Hood Cleaning (NFPA 96)</option>
                            <option>Ductwork Degreasing</option>
                            <option>Filter Replacement Service</option>
                            <option>Fan & Motor Maintenance</option>
                            <option>Fire Suppression Cleaning</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-control">
                            <option>All Statuses</option>
                            <option>Completed</option>
                            <option>Pending</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>
            `, 'Apply Filters');
            return;
        }

        if (lowerText.includes('schedule')) {
            const today = new Date();
            this.currentCalendarDate = new Date(); // Track current view

            this.openModal('Technician Dispatch Wizard', `
                <div class="space-y-3">
                    <p class="text-xs text-secondary">Select a date for service.</p>
                    
                    <!-- Calendar Controls -->
                    <div class="flex justify-between items-center mb-2">
                        <button id="cal-prev" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">&lt;</button>
                        <div class="flex gap-1">
                            <select id="cal-month" class="text-xs border-0 bg-transparent font-bold cursor-pointer focus:ring-0">
                                ${Array.from({ length: 12 }, (_, i) => `<option value="${i}" ${i === today.getMonth() ? 'selected' : ''}>${new Date(0, i).toLocaleString('default', { month: 'short' })}</option>`).join('')}
                            </select>
                            <select id="cal-year" class="text-xs border-0 bg-transparent font-bold cursor-pointer focus:ring-0">
                                ${Array.from({ length: 5 }, (_, i) => `<option value="${today.getFullYear() + i}">${today.getFullYear() + i}</option>`).join('')}
                            </select>
                        </div>
                        <button id="cal-next" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">&gt;</button>
                    </div>

                    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-secondary uppercase mb-1">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    
                    <div id="calendar-grid" class="grid grid-cols-7 gap-1 text-center mb-2">
                        <!-- Dynamic Content -->
                    </div>

                    <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div class="form-group mb-2">
                            <label class="form-label text-xs mb-1">Service Type</label>
                            <select class="form-control text-xs py-1.5">
                                <option>Exhaust Hood Cleaning (NFPA 96)</option>
                                <option>Ductwork Degreasing</option>
                                <option>Filter Replacement Service</option>
                                <option>Fan & Motor Maintenance</option>
                                <option>Fire Suppression Cleaning</option>
                                <option>Compliance Audit & Inspection</option>
                            </select>
                        </div>
                        <label class="form-label text-xs mb-1">Available Technician</label>
                        <div class="grid grid-cols-1 gap-2">
                            <button class="btn btn-outline text-left py-1.5 px-3 text-xs flex justify-between items-center group hover:border-primary">
                                <span class="font-bold">John Smith</span>
                                <span class="badge badge-success text-[10px] py-0">Available</span>
                            </button>
                            <button class="btn btn-outline text-left py-1.5 px-3 text-xs border-primary bg-primary/5 flex justify-between items-center">
                                <span class="font-bold">Mike Johnson</span>
                                <span class="text-[10px] text-primary">Closest (2mi)</span>
                            </button>
                        </div>
                    </div>
                </div>
            `, 'Assign Technician');

            // Initialize Calendar Logic
            setTimeout(() => this.initCalendarLogic(), 0);
            return;
        }

        if (lowerText.includes('change password')) {
            this.openModal('Change Password', `
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label text-sm">Current Password</label>
                        <input type="password" class="form-control" placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label class="form-label text-sm">New Password</label>
                        <input type="password" class="form-control" placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label class="form-label text-sm">Confirm New Password</label>
                        <input type="password" class="form-control" placeholder="••••••••">
                    </div>
                </div>
            `, 'Update Password');
            return;
        }

        if (lowerText.includes('apply filter')) {
            this.showNotification('Filters applied', 'success');
            this.closeModal();
            return;
        }

        // Navigation
        let targetSection = null;
        if (lowerText.includes('client')) targetSection = 'clients';
        else if (lowerText.includes('report') || lowerText.includes('pdf')) targetSection = 'reports';
        else if (lowerText.includes('schedule')) targetSection = 'scheduling';

        if (targetSection && targetSection !== this.currentSection) {
            this.loadSection(targetSection);
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.getAttribute('data-section') === targetSection));
            this.showNotification(`Loading ${targetSection}...`, 'success');
            return;
        }

        this.showNotification(`Admin Action: ${actionText}`, 'success');
    }

    openModal(title, body, actionText = 'Process') {
        if (!this.modal) return;
        this.modalTitle.textContent = title;
        this.modalBody.innerHTML = body;
        this.modalActionBtn.textContent = actionText;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    handleFormSubmit(form) {
        const btn = form.querySelector('[type="submit"]') || form.querySelector('.btn');
        if (btn) btn.innerHTML = 'Updating...';
        setTimeout(() => {
            this.showNotification('System updated.', 'success');
            if (btn) btn.innerHTML = 'Update Profile';
        }, 1000);
    }

    showNotification(message, type = 'success') {
        document.querySelectorAll('.dashboard-notification').forEach(n => n.remove());
        const n = document.createElement('div');
        n.className = 'dashboard-notification';
        Object.assign(n.style, {
            position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 1.5rem', borderRadius: '12px',
            backgroundColor: type === 'success' ? '#10B981' : '#EF4444', color: 'white', zIndex: '9999',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px',
            transition: 'all 0.3s', transform: 'translateY(20px)', opacity: '0'
        });
        n.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span> <b>${message}</b>`;
        document.body.appendChild(n);
        requestAnimationFrame(() => { n.style.transform = 'translateY(0)'; n.style.opacity = '1'; });
        setTimeout(() => { n.style.transform = 'translateY(20px)'; n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
    }

    closeMobileSidebar() {
        document.getElementById('sidebar')?.classList.remove('active');
        document.getElementById('sidebar-overlay')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    initOverview() {
        document.querySelectorAll('.stat-value[data-stat]').forEach(el => {
            const t = parseInt(el.getAttribute('data-stat'));
            if (!isNaN(t)) this.animateValue(el, 0, t, 1000);
        });
    }

    animateValue(obj, start, end, duration) {
        let st = null;
        const step = (ts) => {
            if (!st) st = ts;
            const p = Math.min((ts - st) / duration, 1);
            obj.innerHTML = Math.floor(p * (end - start) + start);
            if (p < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    initCalendarLogic() {
        const grid = document.getElementById('calendar-grid');
        const monthSelect = document.getElementById('cal-month');
        const yearSelect = document.getElementById('cal-year');
        const prevBtn = document.getElementById('cal-prev');
        const nextBtn = document.getElementById('cal-next');

        if (!grid || !monthSelect || !yearSelect) return;

        const render = () => {
            const date = this.currentCalendarDate;
            const year = date.getFullYear();
            const month = date.getMonth();

            // Sync selects
            monthSelect.value = month;
            yearSelect.value = year;

            // Date Calcs
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();

            let html = '';

            // Add empty slots for days before start of month
            for (let i = 0; i < firstDay; i++) {
                html += `<div></div>`;
            }

            // Fill days
            for (let i = 1; i <= daysInMonth; i++) {
                const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = i === (this.selectedDay || -1) && month === (this.selectedMonth || -1) && year === (this.selectedYear || -1);

                let classes = 'calendar-date text-xs p-1 hover:bg-primary/10 rounded cursor-pointer';
                if (isToday) classes += ' font-bold text-primary border border-primary';
                if (isSelected) classes += ' selected bg-primary text-white';

                html += `<div class="${classes}" data-day="${i}">${i}</div>`;
            }
            grid.innerHTML = html;
        };

        // Listeners - Use arrow functions to preserve 'this' context if needed (though not needed for 'render')
        prevBtn.onclick = () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
            render();
        };
        nextBtn.onclick = () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            render();
        };
        monthSelect.onchange = (e) => {
            this.currentCalendarDate.setMonth(parseInt(e.target.value));
            render();
        };
        yearSelect.onchange = (e) => {
            this.currentCalendarDate.setFullYear(parseInt(e.target.value));
            render();
        };

        // Initial Render
        render();

        // Delegate clicks
        grid.onclick = (e) => {
            const target = e.target.closest('.calendar-date');
            if (target) {
                grid.querySelectorAll('.calendar-date').forEach(d => d.classList.remove('selected', 'bg-primary', 'text-white'));
                target.classList.add('selected', 'bg-primary', 'text-white');
                this.selectedDay = parseInt(target.getAttribute('data-day'));
                this.selectedMonth = this.currentCalendarDate.getMonth();
                this.selectedYear = this.currentCalendarDate.getFullYear();
            }
        };
    }
}

new DashboardManager();
