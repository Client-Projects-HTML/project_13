/**
 * Client Dashboard - Dynamic Content Loader
 * Handles sidebar navigation and dynamic content loading
 */

class DashboardManager {
    constructor() {
        this.contentArea = document.getElementById('dashboard-content');
        this.sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
        this.pageTitle = document.getElementById('page-title');
        this.pageSubtitle = document.getElementById('page-subtitle');
        this.currentSection = ''; // Initialize empty to ensure first load works

        // Modal Elements
        this.modal = document.getElementById('dashboard-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.modalActionBtn = document.getElementById('modal-action-btn');
        this.modalCloseBtn = document.getElementById('modal-close-btn');
        this.rescheduleTarget = null;

        // Data Management
        this.schedules = this.getInitialSchedules();

        if (!this.contentArea) {
            console.error('Dashboard content area not found!');
            return;
        }

        this.init();
    }

    init() {
        // Load initial section
        this.loadSection('overview');

        this.initThemeOverride();

        if (this.modal) {
            this.modal.querySelector('.modal-overlay').onclick = () => this.closeModal();
            if (this.modalCloseBtn) this.modalCloseBtn.onclick = () => this.closeModal();
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            const link = e.target.closest('a');
            const toggle = e.target.closest('.menu-toggle');
            const overlay = e.target.closest('#sidebar-overlay');
            // themeBtn removed to prevent conflict with main.js
            const sidebarLink = e.target.closest('.sidebar-link[data-section]');
            const dateEl = e.target.closest('.calendar-date');

            if (dateEl) {
                const allDates = dateEl.parentElement.querySelectorAll('.calendar-date');
                allDates.forEach(d => d.classList.remove('selected'));
                dateEl.classList.add('selected');

                // Update the preview card if it exists
                const previewBody = this.modal.querySelector('.selected-date-card .card-body');
                if (previewBody) {
                    previewBody.textContent = dateEl.textContent;
                    // Trigger animation
                    const card = this.modal.querySelector('.selected-date-card');
                    card.style.animation = 'none';
                    card.offsetHeight; // trigger reflow
                    card.style.animation = null;
                }
                return;
            }

            const timeSlotBtn = e.target.closest('.time-slot-btn');
            if (timeSlotBtn) {
                const allSlots = timeSlotBtn.parentElement.querySelectorAll('.time-slot-btn');
                allSlots.forEach(s => {
                    s.classList.remove('active-slot', 'border-primary', 'bg-primary/5');
                    s.classList.add('btn-outline');
                });
                timeSlotBtn.classList.add('active-slot', 'border-primary', 'bg-primary/5');
                timeSlotBtn.classList.remove('btn-outline');
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

            // Theme toggle logic removed to prevent conflict with main.js

            if (btn || (link && link.getAttribute('href') === '#')) {
                const target = btn || link;
                if (this.contentArea.contains(target) || (this.modal && this.modal.contains(target))) {
                    // Ignore submit buttons ONLY if they are inside a form (to allow form submission)
                    // Standalone buttons (like Change Password) default to type="submit" but should be handled here
                    if (target.type === 'submit' && target.closest('form')) return;

                    if (target.tagName === 'BUTTON' || target.getAttribute('href') === '#') e.preventDefault();

                    if (target.id === 'modal-action-btn') {
                        const isWizard = this.modalTitle.textContent.includes('Wizard');
                        const isReschedule = this.modalTitle.textContent.includes('Reschedule');
                        const isTimeSlot = this.modalTitle.textContent.includes('Time Slot');

                        if (isWizard || isReschedule) {
                            const selectedDateEl = this.modal.querySelector('.calendar-date.selected');
                            const serviceType = this.modal.querySelector('select')?.value || 'Service';
                            if (!selectedDateEl) {
                                this.showNotification('Please select a date first!', 'error');
                                return;
                            }
                            const day = selectedDateEl.textContent.trim();
                            if (isWizard) {
                                this.addScheduleItem(day, serviceType);
                                this.showNotification('Booking confirmed successfully!', 'success');
                            } else {
                                this.updateScheduleItem(this.rescheduleTarget, day, serviceType);
                                this.showNotification('Service rescheduled successfully!', 'success');
                            }
                        } else if (isTimeSlot) {
                            const activeSlot = this.modal.querySelector('.time-slot-btn.active-slot');
                            if (!activeSlot) {
                                this.showNotification('Please select a time slot!', 'error');
                                return;
                            }
                            const timeText = activeSlot.querySelector('.text-xs').textContent;
                            this.updateScheduleTime(this.rescheduleTarget, timeText);
                            this.showNotification('Time slot updated!', 'success');
                        } else if (this.modalTitle.textContent.includes('Confirm Appointment')) {
                            this.confirmSchedule(this.rescheduleTarget);
                            this.showNotification('Appointment officially confirmed!', 'success');
                        }
                        this.saveSchedules();
                        this.closeModal();
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
        // Allow reloading 'overview' if content is empty (initial load fix)
        if (this.currentSection === sectionName && this.contentArea.innerHTML.trim() !== '') return;

        try {
            this.contentArea.style.opacity = '0';
            this.contentArea.style.transition = 'opacity 0.2s ease'; // Ensure smooth transition

            // Small delay for transition effect
            await this.sleep(150);

            let content = '';
            const template = document.getElementById(`template-${sectionName}`);

            if (template) {
                content = template.innerHTML;
            } else {
                try {
                    const response = await fetch(`sections/${sectionName}.html`);
                    if (!response.ok) throw new Error(`Section ${sectionName} not found`);
                    content = await response.text();
                } catch (fetchError) {
                    console.warn(`Template for ${sectionName} not found, using fallback.`);
                    content = `<div class="card p-12 text-center">
                        <div class="text-red-500 mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                        <h3 class="text-xl font-bold mb-2">Content Unavailable</h3>
                        <p class="text-secondary">Unable to load the ${sectionName} section at this time.</p>
                    </div>`;
                }
            }

            this.contentArea.innerHTML = content;
            this.updatePageHeader(sectionName);

            // Initialize specific section logic
            if (sectionName === 'scheduling') this.renderSchedules();
            if (sectionName === 'settings') this.loadSettings();
            if (sectionName === 'overview') this.initOverview();

            // Force reflow and show
            this.contentArea.offsetHeight;
            this.contentArea.style.opacity = '1';
            this.currentSection = sectionName;

        } catch (error) {
            console.error('Dashboard Load Error:', error);
            this.contentArea.innerHTML = `<div class="card p-12 text-center"><h3>Error</h3><p>${error.message}</p></div>`;
            this.contentArea.style.opacity = '1';
        }
    }

    updatePageHeader(sectionName) {
        const headers = {
            overview: { title: 'Dashboard Overview', subtitle: 'Welcome back! Here\'s your cleaning schedule status.' },
            scheduling: { title: 'Cleaning Schedule', subtitle: 'View and manage your upcoming cleaning appointments.' },
            reports: { title: 'Service Reports', subtitle: 'Access your service history and compliance documentation.' },
            settings: { title: 'Account Settings', subtitle: 'Manage your profile and notification preferences.' }
        };
        const h = headers[sectionName] || headers.overview;
        if (this.pageTitle) this.pageTitle.textContent = h.title;
        if (this.pageSubtitle) this.pageSubtitle.textContent = h.subtitle;
    }

    handleAction(actionText, target) {
        target.style.transition = 'transform 0.1s ease';
        target.style.transform = 'scale(0.95)';
        setTimeout(() => target.style.transform = '', 100);
        const lowerText = actionText.toLowerCase();
        const action = target.getAttribute('data-action') || '';

        // Specific handler for "Next Service" hero button
        if (target.getAttribute('data-action') === 'view-next-service' || (lowerText.includes('view details') && !target.closest('.schedule-item'))) {
            this.openModal('Service Details', `
                <div class="space-y-4">
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 class="font-bold mb-2 text-primary">Kitchen Exhaust Hood Cleaning</h4>
                        <p class="text-sm">Main Kitchen - Full Service (Hoods, Ducts, and Fan)</p>
                        <div class="mt-3 space-y-1 text-sm text-secondary">
                            <p class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Dec 15, 2024</p>
                            <p class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 10:00 AM - 02:00 PM</p>
                            <p class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Tech: John Smith</p>
                        </div>
                    </div>
                </div>
            `, 'Close');
            return;
        }

        // Quick Actions Handlers
        if (target.getAttribute('data-action') === 'request-tech') {
            this.openModal('Emergency Support', `
                <div class="text-center py-4">
                    <div class="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="text-red-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <h4 class="font-bold text-lg mb-2">Emergency Service Request</h4>
                    <p class="text-secondary text-sm mb-4">Our on-call technician will be notified immediately.</p>
                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-left mb-4">
                        <label class="text-xs font-bold uppercase text-secondary mb-1 block">Describe Issue</label>
                        <textarea class="form-control text-sm" rows="3" placeholder="E.g., Fan making loud noise, grease leaking..."></textarea>
                    </div>
                    <button class="btn btn-primary w-full justify-center emergency-request-btn">Request Now</button>
                </div>
            `, 'Close');
            return;
        }

        if (target.getAttribute('data-action') === 'call-hotline') {
            this.openModal('Compliance Hotline', `
                <div class="text-center py-6">
                    <div class="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="text-blue-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <h3 class="font-bold text-2xl mb-2">1-800-555-0123</h3>
                    <p class="text-secondary text-sm mb-6">Available Mon-Fri, 9AM - 6PM EST</p>
                    <a href="tel:18005550123" class="btn btn-primary w-full justify-center">Dial Number</a>
                </div>
            `, 'Close');
            return;
        }

        if (lowerText.includes('sync with calendar')) {
            const ics = this.buildCalendarIcs();
            this.downloadFile('kitchen-exhaust-schedule.ics', ics, 'text/calendar');
            this.showNotification('Calendar file downloaded', 'success');
            return;
        }

        if (lowerText.includes('view details')) {
            const id = target.closest('.schedule-item')?.getAttribute('data-id');
            const s = this.schedules.find(x => x.id == id) || { title: 'Cleaning', subtitle: 'Details unavailable' };
            this.openModal('Service Details', `
                <div class="space-y-4">
                    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 class="font-bold mb-2">${s.title}</h4>
                        <p class="text-sm">${s.subtitle}</p>
                        <p class="text-sm">Date: ${s.month} ${s.day}</p>
                        <p class="text-sm">Time: ${s.time}</p>
                        ${s.tech ? `<p class="text-sm">Technician: ${s.tech}</p>` : ''}
                    </div>
                </div>
            `, 'Close');
            return;
        }

        if (lowerText.includes('schedule new service') || lowerText.includes('reschedule')) {
            const isReschedule = lowerText.includes('reschedule');
            this.rescheduleTarget = isReschedule ? target.closest('.schedule-item') : null;

            const today = new Date();
            this.currentCalendarDate = new Date();

            this.openModal(isReschedule ? 'Reschedule Service' : 'Booking Wizard', `
                <div class="space-y-6">
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

                    <div class="calendar-grid-container">
                        <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-secondary uppercase mb-2">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div id="calendar-grid" class="calendar-grid grid grid-cols-7 gap-1 text-center">
                            <!-- Dynamic -->
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Service Type</label>
                        <select class="form-control">
                            <option>Exhaust Hood Cleaning (NFPA 96)</option>
                            <option>Ductwork Degreasing</option>
                            <option>Filter Replacement Service</option>
                            <option>Fan & Motor Maintenance</option>
                            <option>Fire Suppression Cleaning</option>
                            <option>Compliance Audit & Inspection</option>
                        </select>
                    </div>
                </div>
            `, isReschedule ? 'Update Schedule' : 'Confirm Booking');

            setTimeout(() => this.initCalendarLogic(), 0);
            return;
        }

        if (lowerText.includes('confirm now')) {
            this.rescheduleTarget = target.closest('.schedule-item');
            this.openModal('Confirm Appointment', `
                <div class="text-center py-6">
                    <div class="bg-success-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="text-success" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h4 class="font-bold text-lg mb-2">Ready to confirm?</h4>
                    <p class="text-secondary text-sm">Scheduled for <b>pending date</b>. Would you like to confirm this slot?</p>
                </div>
            `, 'Confirm Appointment');
            return;
        }

        if (lowerText.includes('change time')) {
            this.rescheduleTarget = target.closest('.schedule-item');
            this.openModal('Select Time Slot', `
                <div class="grid grid-cols-2 gap-3">
                    <button class="btn btn-outline p-4 time-slot-btn"><div class="font-bold">Morning</div><div class="text-xs text-secondary">8:00 AM - 12:00 PM</div></button>
                    <button class="btn btn-outline p-4 time-slot-btn active-slot"><div class="font-bold">Afternoon</div><div class="text-xs text-secondary">1:00 PM - 5:00 PM</div></button>
                    <button class="btn btn-outline p-4 time-slot-btn"><div class="font-bold">Overnight</div><div class="text-xs text-secondary">10:00 PM - 2:00 AM</div></button>
                </div>
            `, 'Save Time Slot');
            return;
        }

        if (lowerText.includes('apply filters')) {
            this.showNotification('Filters applied', 'success');
            this.closeModal();
            return;
        }

        if (action === 'filter-reports' || lowerText === 'filter' || (lowerText.includes('filter') && lowerText.includes('report'))) {
            this.openModal('Filter Reports', `
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">Date Range</label>
                        <select class="form-control">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>Last Year</option>
                            <option>Custom Range</option>
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
                            <option>Compliance Audit & Inspection</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-control">
                            <option>All Statuses</option>
                            <option>Completed</option>
                            <option>Pending</option>
                            <option>Compliance Issues</option>
                        </select>
                    </div>
                    <button class="btn btn-primary w-full justify-center">Apply Filters</button>
                </div>
            `, 'Apply Filters');
            return;
        }

        if (lowerText.includes('export pdf')) {
            const btn = target;
            const originalText = btn.textContent;
            btn.textContent = 'Generating...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                this.showNotification('PDF Report generated and downloaded!', 'success');
            }, 1500);
            return;
        }


        if (lowerText.includes('view report')) {
            this.showNotification('Opening detailed report...', 'success');
            // In a real app, this would redirect to a report detail page or open a PDF viewer
            setTimeout(() => {
                this.openModal('Service Report Details', `
                    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        <div class="flex justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span class="font-bold">Report ID: #RPT-2024-001</span>
                            <span class="badge badge-success">Verified</span>
                        </div>
                        <p class="mb-2"><b>Service:</b> Hood Cleaning</p>
                        <p class="mb-2"><b>Date:</b> Dec 1, 2024</p>
                        <p class="mb-2"><b>Technician:</b> Mike R.</p>
                        <p class="mb-4"><b>Summary:</b> Complete cleaning of kitchen exhaust system. All areas accessible. Photos logged.</p>
                        <button class="btn btn-primary btn-sm w-full">Download Full PDF</button>
                    </div>
                `, 'Close');
            }, 500);
            return;
        }

        if (lowerText.includes('download full pdf')) {
            const btn = target;
            const originalText = btn.textContent;
            btn.textContent = 'Downloading...';
            btn.disabled = true;

            // Generate dummy content
            const reportContent = `SERVICE REPORT #RPT-2024-001
------------------------------------------------
Date: Dec 1, 2024
Service: Kitchen Exhaust Hood Cleaning
Technician: Mike R.
Status: Verified

SUMMARY
------------------------------------------------
Complete cleaning of kitchen exhaust system performed.
- Hood canopy degreased and polished.
- Filters removed and replaced with clean exchange units.
- Fan unit inspected: Belt tension verified, motor amps normal.
- Ductwork access panels opened and ducts scraped to bare metal.

COMPLIANCE
------------------------------------------------
System is currently compliant with NFPA 96 Standard.
Next service due: March 1, 2025.

Technician Signature: [ Mike Reynolds ]
Date: 12/01/2024`;

            setTimeout(() => {
                // Create download link
                const blob = new Blob([reportContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'Service_Report_RPT-2024-001.txt';
                document.body.appendChild(a);
                a.click();

                // Cleanup
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                btn.textContent = originalText;
                btn.disabled = false;
                this.showNotification('Report file downloaded!', 'success');
            }, 1000);
            return;
        }

        if (lowerText === 'download') {
            const btn = target;
            const originalText = btn.textContent;
            btn.textContent = 'Saving...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                this.showNotification('Certificate downloaded successfully!', 'success');
            }, 1200);
            return;
        }

        if (lowerText.includes('generate annual report')) {
            const btn = target;
            const originalText = btn.textContent;
            btn.textContent = 'Generating...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                this.showNotification('Annual Report 2024 generated and sent to email!', 'success');
            }, 2000);
            return;
        }

        if (lowerText.includes('change password')) {
            this.openModal('Change Password', `
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">Current Password</label>
                        <input type="password" class="form-control" placeholder="Enter current password">
                    </div>
                    <div class="form-group">
                        <label class="form-label">New Password</label>
                        <input type="password" class="form-control" placeholder="Enter new password">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm New Password</label>
                        <input type="password" class="form-control" placeholder="Confirm new password">
                    </div>
                </div>
            `, 'Update Password');
            return;
        }

        if (lowerText.includes('enable two-factor auth')) {
            this.openModal('Two-Factor Authentication', `
                <div class="text-center space-y-4">
                    <p class="text-sm text-secondary">Scan this QR code with your authenticator app</p>
                    <div class="qr-code-box p-4 inline-block border rounded-lg">
                        <svg class="qr-code" viewBox="0 0 100 100" width="150" height="150">
                            <path d="M0 0h100v100H0z" fill="none"/>
                            <path d="M10 10h30v30H10zM60 10h30v30H60zM10 60h30v30H10z" fill="#000"/>
                            <path d="M50 10h10v10H50zM10 50h10v10H10zM70 50h10v10H70zM50 70h10v10H50zM80 80h10v10H80z" fill="#000"/>
                            <path d="M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20z" fill="#fff"/>
                        </svg>
                    </div>
                    <div class="form-group text-left">
                        <label class="form-label">Enter Verification Code</label>
                        <input type="text" class="form-control text-center tracking-widest font-mono text-lg" placeholder="123 456">
                    </div>
                </div>
            `, 'Verify & Enable');
            return;
        }

        if (lowerText.includes('delete account')) {
            this.openModal('Delete Account', `
                <div class="text-center py-4">
                    <div class="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="text-red-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                    </div>
                    <h4 class="font-bold text-lg mb-2 text-red-600 dark:text-red-400">Danger Zone</h4>
                    <p class="text-secondary text-sm mb-4">Are you sure you want to delete your account? This action cannot be undone and you will lose all data.</p>
                    <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs text-left">
                        Please type <strong>DELETE</strong> to confirm:
                        <input type="text" class="form-control mt-2" placeholder="DELETE">
                    </div>
                </div>
            `, 'Delete Permanently');

            // Add specific danger style to the action button
            setTimeout(() => {
                if (this.modalActionBtn) {
                    this.modalActionBtn.classList.remove('btn-primary');
                    this.modalActionBtn.classList.add('btn-danger');
                }
            }, 0);
            return;
        }

        let ts = null;
        if (lowerText.includes('preferences') || lowerText.includes('settings')) ts = 'settings';
        else if (lowerText.includes('report')) ts = 'reports';

        if (ts && ts !== this.currentSection) {
            this.loadSection(ts);
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.getAttribute('data-section') === ts));
            this.showNotification(`Opening ${ts}...`, 'success');
            return;
        }

        // Fallback for any other unhandled buttons
        this.showNotification(`Action: ${actionText}`, 'info');
    }

    initThemeOverride() {
        let themeBtn = document.getElementById('theme-toggle');
        if (!themeBtn) return;

        // Replace node to remove any previously bound listeners.
        const clone = themeBtn.cloneNode(true);
        themeBtn.parentNode.replaceChild(clone, themeBtn);
        themeBtn = clone;

        const STORAGE_KEY = 'theme-preference';
        const getSystemPref = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(STORAGE_KEY, theme);
            const sunIcon = themeBtn.querySelector('.sun-icon');
            const moonIcon = themeBtn.querySelector('.moon-icon');
            if (theme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            } else {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            }
        };

        const saved = localStorage.getItem(STORAGE_KEY);
        applyTheme(saved || (getSystemPref() ? 'dark' : 'light'));

        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    buildCalendarIcs() {
        const now = new Date();
        const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const events = this.schedules.map(s => {
            const date = new Date();
            const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(s.month);
            if (monthIndex >= 0) date.setMonth(monthIndex);
            date.setDate(s.day);
            const start = new Date(date);
            start.setHours(9, 0, 0, 0);
            const end = new Date(date);
            end.setHours(12, 0, 0, 0);
            const dtStart = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const dtEnd = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            return [
                'BEGIN:VEVENT',
                `UID:${s.id}@kitchenexhaust`,
                `DTSTAMP:${dtstamp}`,
                `DTSTART:${dtStart}`,
                `DTEND:${dtEnd}`,
                `SUMMARY:${s.title}`,
                `DESCRIPTION:${s.subtitle} | ${s.time}${s.tech ? ' | Tech: ' + s.tech : ''}`,
                'END:VEVENT'
            ].join('\r\n');
        }).join('\r\n');

        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Kitchen Exhaust//Client Dashboard//EN',
            events,
            'END:VCALENDAR'
        ].join('\r\n');
    }

    downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    openModal(t, b, a = 'Confirm') {
        if (!this.modal) return;
        this.modalTitle.textContent = t;
        this.modalBody.innerHTML = b;
        this.modalActionBtn.textContent = a;
        if (t === 'Emergency Support' || t === 'Compliance Hotline') {
            this.modal.classList.add('modal-no-footer');
        } else {
            this.modal.classList.remove('modal-no-footer');
        }
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
        if (btn) { btn.disabled = true; btn.innerHTML = 'Saving...'; }

        // Collect form data
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.parentElement.parentElement.querySelector('.font-bold')?.textContent || input.id] = input.checked;
            } else {
                const label = input.closest('.form-group')?.querySelector('label')?.textContent || input.name || 'field';
                formData[label] = input.value;
            }
        });

        // Save to LocalStorage
        localStorage.setItem('user-settings', JSON.stringify(formData));

        setTimeout(() => {
            this.showNotification('Changes saved!', 'success');
            if (btn) { btn.disabled = false; btn.innerHTML = 'Update Profile'; }
        }, 1000);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('user-settings');
        if (!savedSettings) return;

        try {
            const settings = JSON.parse(savedSettings);
            const form = this.contentArea.querySelector('form');
            if (!form) return;

            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    const key = input.parentElement.parentElement.querySelector('.font-bold')?.textContent || input.id;
                    if (settings[key] !== undefined) input.checked = settings[key];
                } else {
                    const label = input.closest('.form-group')?.querySelector('label')?.textContent || input.name || 'field';
                    if (settings[label] !== undefined) input.value = settings[label];
                }
            });
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    addScheduleItem(day, type) {
        const ns = {
            id: Date.now(), day: day, month: 'JAN', title: type,
            subtitle: 'Automated Schedule Entry - Compliance Service',
            time: '09:00 AM - 12:00 PM', tech: 'To Be Assigned',
            status: 'Newly Booked', badgeClass: 'badge-primary', isNew: true
        };
        this.schedules.unshift(ns);
        if (this.currentSection === 'scheduling') this.renderSchedules();
        else this.loadSection('scheduling');
    }

    updateScheduleItem(target, day, type) {
        if (!target) return;
        const id = target.getAttribute('data-id');
        const s = this.schedules.find(x => x.id == id);
        if (s) { s.day = day; s.title = type; if (this.currentSection === 'scheduling') this.renderSchedules(); }
    }

    updateScheduleTime(target, time) {
        if (!target) return;
        const id = target.getAttribute('data-id');
        const s = this.schedules.find(x => x.id == id);
        if (s) { s.time = time; if (this.currentSection === 'scheduling') this.renderSchedules(); }
    }

    confirmSchedule(target) {
        if (!target) return;
        const id = target.getAttribute('data-id');
        const s = this.schedules.find(x => x.id == id);
        if (s) {
            s.status = 'Confirmed';
            s.badgeClass = 'badge-primary';
            if (this.currentSection === 'scheduling') this.renderSchedules();
        }
    }

    renderSchedules() {
        const list = document.querySelector('.schedule-list');
        if (!list) return;
        list.innerHTML = this.schedules.map(s => `
            <div class="schedule-item p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${s.isNew ? 'animate-pulse' : ''}" data-id="${s.id}" style="${s.isNew ? 'background-color: rgba(16, 185, 129, 0.05)' : ''}">
                <div class="schedule-date">
                    <div class="schedule-day">${s.day}</div>
                    <div class="schedule-month">${s.month}</div>
                </div>
                <div class="schedule-details flex-1 ml-6">
                    <h3 class="font-bold flex items-center gap-2">${s.title} <span class="badge ${s.badgeClass} text-[10px]">${s.status}</span></h3>
                    <p class="text-secondary text-sm">${s.subtitle}</p>
                    <div class="schedule-meta flex items-center gap-4 mt-2">
                        <div class="meta-item flex items-center gap-1 text-xs text-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${s.time}</div>
                        ${s.tech ? `<div class="meta-item flex items-center gap-1 text-xs text-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Tech: ${s.tech}</div>` : ''}
                    </div>
                </div>
                <div class="schedule-actions">
                    ${s.status === 'Pending Confirmation' ? '<button class="btn btn-primary btn-sm">Confirm Now</button>' : '<button class="btn btn-outline btn-sm">View Details</button>'}
                    <button class="btn btn-outline btn-sm">Reschedule</button>
                    ${s.status === 'Pending Confirmation' || s.status === 'Newly Booked' ? '<button class="btn btn-outline btn-sm">Change Time</button>' : ''}
                </div>
            </div>
        `).join('');
        this.schedules.forEach(s => delete s.isNew);
        setTimeout(() => { document.querySelectorAll('.schedule-item').forEach(el => { el.classList.remove('animate-pulse'); el.style.backgroundColor = ''; }); }, 3000);
    }

    getInitialSchedules() {
        const saved = localStorage.getItem('dashboard-schedules');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, day: 15, month: 'DEC', title: 'Kitchen Exhaust Hood Cleaning', subtitle: 'Main Kitchen - Full Service', time: '10:00 AM - 02:00 PM', tech: 'John Smith', status: 'Confirmed', badgeClass: 'badge-primary' },
            { id: 2, day: 22, month: 'DEC', title: 'Ductwork Inspection', subtitle: 'Quarterly Compliance Check', time: '02:00 PM - 04:00 PM', tech: 'Not Assigned', status: 'Pending Confirmation', badgeClass: 'badge-warning' }
        ];
    }

    saveSchedules() { localStorage.setItem('dashboard-schedules', JSON.stringify(this.schedules)); }

    showNotification(m, t = 'success') {
        document.querySelectorAll('.dashboard-notification').forEach(n => n.remove());
        const n = document.createElement('div');
        n.className = 'dashboard-notification';
        Object.assign(n.style, { position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 1.5rem', borderRadius: '12px', backgroundColor: t === 'success' ? '#10B981' : '#EF4444', color: 'white', zIndex: '9999', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s', transform: 'translateY(20px)', opacity: '0' });
        n.innerHTML = `<span>${t === 'success' ? '✓' : '⚠'}</span> <b>${m}</b>`;
        document.body.appendChild(n);
        requestAnimationFrame(() => { n.style.transform = 'translateY(0)'; n.style.opacity = '1'; });
        setTimeout(() => { n.style.transform = 'translateY(20px)'; n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
    }

    closeMobileSidebar() {
        const s = document.getElementById('sidebar');
        const o = document.getElementById('sidebar-overlay');
        if (s) s.classList.remove('active');
        if (o) o.classList.remove('active');
        document.body.style.overflow = '';
    }

    initOverview() { document.querySelectorAll('.stat-value[data-stat]').forEach(el => { const t = parseInt(el.getAttribute('data-stat')); if (!isNaN(t)) this.animateValue(el, 0, t, 1000); }); }

    animateValue(o, s, e, d) { let st = null; const step = (ts) => { if (!st) st = ts; const p = Math.min((ts - st) / d, 1); o.innerHTML = Math.floor(p * (e - s) + s); if (p < 1) window.requestAnimationFrame(step); }; window.requestAnimationFrame(step); }

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

            // Add empty slots
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

        // Listeners
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

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => new DashboardManager());
else new DashboardManager();
